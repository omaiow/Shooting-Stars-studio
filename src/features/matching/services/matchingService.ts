import { supabase } from '../../../shared/services/api/client';
import { handleError } from '../../../shared/services/api/errors';
import type { User, Match, SwipeAction } from '../../../shared/types/database';

/**
 * Matching and swipe service
 */
export const matchingService = {
    /**
     * Get candidate profiles for swiping
     */
    getCandidates: async (userId: string, limit: number = 20): Promise<User[]> => {
        try {
            // Get users the current user has already swiped on
            const { data: swipedUsers, error: swipedError } = await supabase
                .from('swipes')
                .select('target_user_id')
                .eq('user_id', userId);

            if (swipedError) throw handleError(swipedError);

            const swipedIds = (swipedUsers || []).map(s => s.target_user_id);

            // Get profiles excluding current user and already swiped users
            let query = supabase
                .from('profiles')
                .select('*')
                .neq('id', userId)
                .limit(limit);

            if (swipedIds.length > 0) {
                query = query.not('id', 'in', `(${swipedIds.join(',')})`);
            }

            const { data: profiles, error: profilesError } = await query;

            if (profilesError) throw handleError(profilesError);

            // Fetch skills for each profile
            const usersWithSkills = await Promise.all(
                (profiles || []).map(async (profile) => {
                    const { data: skills } = await supabase
                        .from('skills')
                        .select('*')
                        .eq('user_id', profile.id);

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
                })
            );

            return usersWithSkills;
        } catch (error) {
            throw handleError(error);
        }
    },

    /**
     * Record a swipe action (like or pass)
     */
    swipe: async (
        userId: string,
        targetUserId: string,
        action: 'like' | 'pass'
    ): Promise<{ matched: boolean; matchId?: string }> => {
        try {
            // Record the swipe
            const { error: swipeError } = await supabase
                .from('swipes')
                .insert({
                    user_id: userId,
                    target_user_id: targetUserId,
                    action,
                });

            if (swipeError) throw handleError(swipeError);

            // If it's a like, check for mutual like (match)
            if (action === 'like') {
                const { data: mutualLike, error: mutualError } = await supabase
                    .from('swipes')
                    .select('*')
                    .eq('user_id', targetUserId)
                    .eq('target_user_id', userId)
                    .eq('action', 'like')
                    .single();

                if (mutualError && mutualError.code !== 'PGRST116') {
                    throw handleError(mutualError);
                }

                // If mutual like exists, create a match
                if (mutualLike) {
                    const { data: match, error: matchError } = await supabase
                        .from('matches')
                        .insert({
                            user1_id: userId,
                            user2_id: targetUserId,
                            status: 'accepted',
                        })
                        .select()
                        .single();

                    if (matchError) throw handleError(matchError);

                    return { matched: true, matchId: match.id };
                }
            }

            return { matched: false };
        } catch (error) {
            throw handleError(error);
        }
    },

    /**
     * Get all matches for a user
     */
    getMatches: async (userId: string): Promise<Match[]> => {
        try {
            const { data: matches, error } = await supabase
                .from('matches')
                .select('*')
                .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
                .eq('status', 'accepted')
                .order('created_at', { ascending: false });

            if (error) throw handleError(error);

            // Fetch profile details for each match
            const matchesWithProfiles = await Promise.all(
                (matches || []).map(async (match) => {
                    const otherUserId = match.user1_id === userId ? match.user2_id : match.user1_id;

                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', otherUserId)
                        .single();

                    const { data: skills } = await supabase
                        .from('skills')
                        .select('*')
                        .eq('user_id', otherUserId);

                    const offering = (skills || [])
                        .filter(s => s.is_offering)
                        .map(s => ({ id: s.id!, name: s.name }));

                    const seeking = (skills || [])
                        .filter(s => !s.is_offering)
                        .map(s => ({ id: s.id!, name: s.name }));

                    const otherUser = profile ? { ...profile, offering, seeking } : undefined;

                    return {
                        ...match,
                        user1: match.user1_id === userId ? undefined : otherUser,
                        user2: match.user2_id === userId ? undefined : otherUser,
                    };
                })
            );

            return matchesWithProfiles;
        } catch (error) {
            throw handleError(error);
        }
    },
};
