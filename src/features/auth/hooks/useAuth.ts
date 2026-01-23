import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase } from '../../../shared/services/api/client';
import { authService } from '../services/authService';
import type { SignUpData, SignInData, AuthSession } from '../types';
import type { User } from '../../../shared/types/database';

interface AuthContextValue {
    user: User | null;
    session: AuthSession | null;
    loading: boolean;
    signUp: (data: SignUpData) => Promise<void>;
    signIn: (credentials: SignInData) => Promise<void>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Load initial session and profile
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const session = await authService.getSession();
                setSession(session);

                if (session) {
                    const userProfile = await authService.getCurrentUserProfile();
                    setUser(userProfile);
                }
            } catch (error) {
                console.error('Failed to initialize auth:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session);

                if (session) {
                    try {
                        const userProfile = await authService.getCurrentUserProfile();
                        setUser(userProfile);
                    } catch (error) {
                        console.error('Failed to fetch profile on auth change:', error);
                        setUser(null);
                    }
                } else {
                    setUser(null);
                }

                setLoading(false);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signUp = useCallback(async (data: SignUpData) => {
        const user = await authService.signUp(data);
        setUser(user);
    }, []);

    const signIn = useCallback(async (credentials: SignInData) => {
        const user = await authService.signIn(credentials);
        setUser(user);
    }, []);

    const signOut = useCallback(async () => {
        await authService.signOut();
        setUser(null);
        setSession(null);
    }, []);

    const refreshProfile = useCallback(async () => {
        if (session) {
            const userProfile = await authService.getCurrentUserProfile();
            setUser(userProfile);
        }
    }, [session]);


}
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
