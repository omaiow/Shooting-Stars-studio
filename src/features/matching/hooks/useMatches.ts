import { useAsync } from '../../../shared/hooks/useAsync';
import { matchingService } from '../services/matchingService';
import { useAuth } from '../../auth/hooks/useAuth';

/**
 * Hook for managing user's matches
 */
export function useMatches() {
    const { user } = useAuth();

    const loadMatches = async () => {
        if (!user) throw new Error('No authenticated user');
        return await matchingService.getMatches(user.id);
    };

    const { data: matches, loading, error, execute: refetchMatches } = useAsync(
        loadMatches,
        { immediate: false }
    );

    return {
        matches: matches || [],
        loading,
        error,
        refetchMatches,
    };
}
