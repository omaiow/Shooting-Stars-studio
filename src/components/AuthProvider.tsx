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
  signIn: (email: string) => Promise<void>;
  signUp: (data: any) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  loginAsDemo: () => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
  loginAsDemo: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
          fetchProfile();
      } else {
          setLoading(false);
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setIsDemo(false); // Reset demo if real login happens
        fetchProfile();
      } else {
        if (!isDemo) {
            setProfile(null);
        }
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [isDemo]);

  const fetchProfile = async () => {
    if (isDemo) return;
    try {
      const data = await api.getProfile();
      if (data) setProfile(data as UserProfile);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string) => {
     // Handled by supabase client directly in components usually
  };

  const signUp = async (data: any) => {
     const { profile } = await api.signUp(data);
     setProfile(profile as UserProfile);
  };

  const signOut = async () => {
    if (isDemo) {
        setIsDemo(false);
        setSession(null);
        setProfile(null);
        toast.info("Exited Demo Mode");
    } else {
        await supabase.auth.signOut();
        toast.success("Logged out");
    }
  };

  const loginAsDemo = () => {
      setLoading(true);
      setTimeout(() => {
          setIsDemo(true);
          // @ts-ignore - Mocking session for demo
          setSession({ access_token: "mock_token", user: { id: "demo-user" } });
          setProfile(CURRENT_USER as unknown as UserProfile);
          setLoading(false);
          toast.success("Welcome, Alex Explorer! (Demo Mode)");
      }, 600);
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
        refreshProfile: fetchProfile,
        loginAsDemo
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
