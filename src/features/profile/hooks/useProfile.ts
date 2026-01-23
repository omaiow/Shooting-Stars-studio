import { useAsync } from '../../../shared/hooks/useAsync';
import { profileService } from '../services/profileService';
import { useAuth } from '../../auth/hooks/useAuth';
import type { Profile } from '../../../shared/types/database';

/**
 * Hook for managing current user's profile
 */
export function useProfile() {
    const { user, refreshProfile: refreshAuth } = useAuth();

    const updateProfile = async (updates: Partial<Profile>) => {
        if (!user) throw new Error('No authenticated user');
        await profileService.updateProfile(user.id, updates);
        await refreshAuth(); // Refresh auth context with updated profile
    };

    const updateSkills = async (
        offering: { id?: string; name: string }[],
        seeking: { id?: string; name: string }[]
    ) => {
        if (!user) throw new Error('No authenticated user');
        await profileService.updateSkills(user.id, offering, seeking);
        await refreshAuth(); // Refresh auth context with updated skills
    };

    return {
        profile: user,
        updateProfile,
        updateSkills,
    };
}
