import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { CURRENT_USER } from "../lib/mockData";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { User as UserProfile } from "../lib/data";

interface AuthContextType {
  session: Session | null;
  user: SupabaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: any) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signIn: async () => { },
  signUp: async () => { },
  signOut: async () => { },
  refreshProfile: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadProfileWithRetry();
      } else {
        setLoading(false);
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        await loadProfileWithRetry();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Retry logic for profile loading with exponential backoff
  const loadProfileWithRetry = async (maxRetries = 3) => {
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const data = await api.getProfile();

        if (data) {
          setProfile(data as UserProfile);
          setLoading(false);
          return;
        }

        // Profile doesn't exist - try to create it
        console.warn("Profile not found, attempting to create...");
        await ensureProfile();

        // Try fetching again after creation
        const retryData = await api.getProfile();
        if (retryData) {
          setProfile(retryData as UserProfile);
          setLoading(false);
          return;
        }

        throw new Error("Profile could not be created");
      } catch (error: any) {
        attempt++;
        console.error(`Profile fetch attempt ${attempt} failed:`, error);

        if (attempt >= maxRetries) {
          console.error("Failed to load profile after retries:", error);
          toast.error("Failed to load profile. Please try refreshing the page.");
          setLoading(false);
          return;
        }

        // Exponential backoff: 500ms, 1000ms, 2000ms
        await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempt - 1)));
      }
    }
  };

  // Ensure profile exists, create if missing
  const ensureProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Create a basic profile from auth metadata
      const { error } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email || "",
          name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
          role: user.user_metadata?.role || "Student",
          school: user.user_metadata?.school || "Unknown",
          bio: `Hi, I'm ${user.user_metadata?.name || "here"}!`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
        });

      if (error && !error.message.includes("duplicate")) {
        throw error;
      }
    } catch (error) {
      console.error("Error creating profile:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Profile will be loaded by onAuthStateChange
      toast.success("Welcome back!");
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (data: any) => {
    setLoading(true);
    try {
      // Call API signup which handles both auth and profile creation
      const { profile: newProfile } = await api.signUp(data);

      // Wait a bit for Supabase to propagate the session
      await new Promise(resolve => setTimeout(resolve, 500));

      // Set profile immediately
      setProfile(newProfile as UserProfile);

      toast.success("Account created successfully!");
    } catch (error: any) {
      setLoading(false);
      throw error;
    } finally {
      // Auth state change will handle final loading state
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    toast.success("Logged out");
  };

  const refreshProfile = async () => {
    await loadProfileWithRetry();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user || null,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
