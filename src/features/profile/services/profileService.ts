import { supabase } from '../../../shared/services/api/client';
import { handleError } from '../../../shared/services/api/errors';
import type { User, Profile, UserSkill } from '../../../shared/types/database';

/**
 * Profile management service
 */
export const profileService = {
    /**
     * Get user profile by ID
     */
    getProfile: async (userId: string): Promise<User> => {
        try {
            // Fetch profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (profileError) throw handleError(profileError);
            if (!profile) throw new Error('Profile not found');

            // Fetch skills
            const { data: skills, error: skillsError } = await supabase
                .from('skills')
                .select('*')
                .eq('user_id', userId);

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
     * Update user profile
     */
    updateProfile: async (
        userId: string,
        updates: Partial<Omit<Profile, 'id' | 'email' | 'created_at' | 'updated_at'>>
    ): Promise<Profile> => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId)
                .select()
                .single();

            if (error) throw handleError(error);
            return data;
        } catch (error) {
            throw handleError(error);
        }
    },

    /**
     * Update user skills
     */
    updateSkills: async (
        userId: string,
        offering: { id?: string; name: string }[],
        seeking: { id?: string; name: string }[]
    ): Promise<void> => {
        try {
            // Delete existing skills
            const { error: deleteError } = await supabase
                .from('skills')
                .delete()
                .eq('user_id', userId);

            if (deleteError) throw handleError(deleteError);

            // Insert new skills
            const skillsToInsert: Omit<UserSkill, 'id' | 'created_at'>[] = [
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
                const { error: insertError } = await supabase
                    .from('skills')
                    .insert(skillsToInsert);

                if (insertError) throw handleError(insertError);
            }
        } catch (error) {
            throw handleError(error);
        }
    },
};
