import { useState, useCallback } from 'react';
import { useAsync } from '../../../shared/hooks/useAsync';
import { matchingService } from '../services/matchingService';
import { useAuth } from '../../auth/hooks/useAuth';
import type { User } from '../../../shared/types/database';

/**
 * Hook for managing candidate swiping
 */
export function useMatching() {
    const { user } = useAuth();
    const [candidates, setCandidates] = useState<User[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const loadCandidates = useCallback(async () => {
        if (!user) throw new Error('No authenticated user');
        const newCandidates = await matchingService.getCandidates(user.id);
        setCandidates(newCandidates);
        setCurrentIndex(0);
        return newCandidates;
    }, [user]);

    const { execute: fetchCandidates, loading, error } = useAsync(
        loadCandidates,
        { immediate: false }
    );

    const swipe = useCallback(
        async (targetUserId: string, action: 'like' | 'pass') => {
            if (!user) throw new Error('No authenticated user');

            const result = await matchingService.swipe(user.id, targetUserId, action);

            // Move to next candidate
            setCurrentIndex(prev => prev + 1);

            return result;
        },
        [user]
    );

    const currentCandidate = candidates[currentIndex] || null;
    const hasMore = currentIndex < candidates.length;

    return {
        candidates,
        currentCandidate,
        currentIndex,
        hasMore,
        loading,
        error,
        fetchCandidates,
        swipe,
    };
}
