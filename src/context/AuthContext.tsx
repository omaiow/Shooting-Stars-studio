// Auth Context - Global authentication state
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../lib/types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signUp: (email: string, password: string, profile: Partial<User>) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    await fetchUserProfile(session.user.id);
                }
            } catch (error) {
                console.error('Auth init error:', error);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    await fetchUserProfile(session.user.id);
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const fetchUserProfile = async (userId: string) => {
        try {
            // Get profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (profileError) throw profileError;

            // Get skills
            const { data: skills } = await supabase
                .from('skills')
                .select('*')
                .eq('user_id', userId);

            const offering = (skills || [])
                .filter(s => s.is_offering)
                .map(s => ({ id: s.id, name: s.name }));

            const seeking = (skills || [])
                .filter(s => !s.is_offering)
                .map(s => ({ id: s.id, name: s.name }));

            setUser({
                ...profile,
                offering,
                seeking,
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            setUser(null);
        }
    };

    const signUp = async (email: string, password: string, profile: Partial<User>) => {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: window.location.origin,
            }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('Failed to create user');

        // Check if email confirmation is required
        if (authData.session === null) {
            // Email confirmation is required - don't create profile yet
            throw new Error('Please check your email to confirm your account before signing in.');
        }

        const userId = authData.user.id;

        // Create profile only if we have an active session (email confirmed or confirmation disabled)
        const { error: profileError } = await supabase.from('profiles').insert({
            id: userId,
            email,
            name: profile.name || 'New User',
            role: profile.role || '',
            school: profile.school || '',
            bio: profile.bio || '',
            avatar: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
        });

        if (profileError) throw profileError;

        // Fetch the created profile
        await fetchUserProfile(userId);
    };

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
