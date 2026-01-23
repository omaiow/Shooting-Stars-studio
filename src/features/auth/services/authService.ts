import { supabase } from '../../../shared/services/api/client';
import { handleError } from '../../../shared/services/api/errors';
import type { SignUpData, SignInData, AuthUser, AuthSession } from '../types';
import type { User, Profile } from '../../../shared/types/database';

/**
 * Clean authentication service
 * All auth operations go through here
 */
export const authService = {
    /**
     * Sign up a new user with complete profile and skills
     */
    signUp: async (data: SignUpData): Promise<User> => {
        try {
            // 1. Create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
            });

            if (authError) throw handleError(authError);
            if (!authData.user) throw new Error('Failed to create user');

            const userId = authData.user.id;

            // 2. Create profile  
            const profile: Omit<Profile, 'created_at' | 'updated_at'> = {
                id: userId,
                email: data.email,
                name: data.name,
                role: data.role,
                school: data.school,
                bio: `Hi, I'm ${data.name}!`,
                avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
            };

            const { error: profileError } = await supabase
                .from('profiles')
                .insert(profile);

            if (profileError) throw handleError(profileError);

            // 3. Create skills if provided
            const offering = data.offering || [];
            const seeking = data.seeking || [];

            const skillsToInsert = [
                ...offering.map(skill => ({
                    user_id: userId,
                    name: skill.name,
                    is_offering: true,
                })),
                ...seeking.map(skill => ({
                    user_id: userId,
                    name: skill.name,
                    is_offering: false,
                })),
            ];

            if (skillsToInsert.length > 0) {
                const { error: skillsError } = await supabase
                    .from('skills')
                    .insert(skillsToInsert);

                if (skillsError) throw handleError(skillsError);
            }

            // 4. Return complete user
            return {
                ...profile,
                offering: offering,
                seeking: seeking,
            };
        } catch (error) {
            throw handleError(error);
        }
    },

    /**
     * Sign in existing user
     */
    signIn: async (credentials: SignInData): Promise<User> => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: credentials.email,
                password: credentials.password,
            });

            if (error) throw handleError(error);
            if (!data.user) throw new Error('No user returned from sign in');

            // Fetch complete profile
            const user = await authService.getCurrentUserProfile();
            return user;
        } catch (error) {
            throw handleError(error);
        }
    },

    /**
     * Sign out current user
     */
    signOut: async (): Promise<void> => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw handleError(error);
        } catch (error) {
            throw handleError(error);
        }
    },

    /**
     * Get current session
     */
    getSession: async (): Promise<AuthSession | null> => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw handleError(error);
            return session;
        } catch (error) {
            throw handleError(error);
        }
    },

    /**
     * Get current user's complete profile with skills
     */
    getCurrentUserProfile: async (): Promise<User> => {
        try {
            // Get current user ID
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw handleError(userError);
            if (!user) throw new Error('No authenticated user');

            // Fetch profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError) throw handleError(profileError);
            if (!profile) throw new Error('Profile not found');

            // Fetch skills
            const { data: skills, error: skillsError } = await supabase
                .from('skills')
                .select('*')
                .eq('user_id', user.id);

            if (skillsError) throw handleError(skillsError);

            const offering = (skills || [])
                .filter(s => s.is_offering)
                .map(s => ({ id: s.id!, name: s.name }));

            const seeking = (skills || [])
                .filter(s => !s.is_offering)
                .map(s => ({ id: s.id!, name: s.name }));

            return {
                ...profile,
                offering,
                seeking,
            };
        } catch (error) {
            throw handleError(error);
        }
    },

    /**
     * Reset password
     */
    resetPassword: async (email: string): Promise<void> => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin,
            });
            if (error) throw handleError(error);
        } catch (error) {
            throw handleError(error);
        }
    },
};
