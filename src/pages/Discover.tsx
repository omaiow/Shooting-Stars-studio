// Discover Page - Swipe through users
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { User } from '../lib/types';
import { X, Heart, Sparkles, PartyPopper } from 'lucide-react';

export function Discover() {
    const { user: currentUser } = useAuth();
    const [candidates, setCandidates] = useState<User[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [matchPopup, setMatchPopup] = useState<User | null>(null);

    useEffect(() => {
        loadCandidates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);

    const loadCandidates = async () => {
        if (!currentUser) return;

        try {
            setLoading(true);

            // Get users already swiped
            const { data: swipes } = await supabase
                .from('swipes')
                .select('target_user_id')
                .eq('user_id', currentUser.id);

            const swipedIds = (swipes || []).map(s => s.target_user_id);

            // Get profiles excluding current user and swiped users
            let query = supabase
                .from('profiles')
                .select('*')
                .neq('id', currentUser.id)
                .limit(20);

            if (swipedIds.length > 0) {
                query = query.not('id', 'in', `(${swipedIds.join(',')})`);
            }

            const { data: profiles } = await query;

            // Get skills for each profile
            const usersWithSkills = await Promise.all(
                (profiles || []).map(async (profile) => {
                    const { data: skills } = await supabase
                        .from('skills')
                        .select('*')
                        .eq('user_id', profile.id);

                    return {
                        ...profile,
                        offering: (skills || []).filter(s => s.is_offering).map(s => ({ id: s.id, name: s.name })),
                        seeking: (skills || []).filter(s => !s.is_offering).map(s => ({ id: s.id, name: s.name })),
                    };
                })
            );

            setCandidates(usersWithSkills);
        } catch (error) {
            console.error('Error loading candidates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSwipe = async (action: 'like' | 'pass') => {
        if (!currentUser || currentIndex >= candidates.length) return;

        const target = candidates[currentIndex];

        try {
            // Record swipe
            await supabase.from('swipes').insert({
                user_id: currentUser.id,
                target_user_id: target.id,
                action,
            });

            // Check for mutual like
            if (action === 'like') {
                const { data: mutualLike } = await supabase
                    .from('swipes')
                    .select('*')
                    .eq('user_id', target.id)
                    .eq('target_user_id', currentUser.id)
                    .eq('action', 'like')
                    .single();

                if (mutualLike) {
                    // Create match
                    await supabase.from('matches').insert({
                        user1_id: currentUser.id,
                        user2_id: target.id,
                        status: 'accepted',
                    });

                    setMatchPopup(target);
                }
            }

            setCurrentIndex(prev => prev + 1);
        } catch (error) {
            console.error('Swipe error:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="spinner border-zinc-800 border-t-white" />
            </div>
        );
    }

    const currentCandidate = candidates[currentIndex];

    if (!currentCandidate) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Sparkles className="w-16 h-16 mb-4 text-zinc-600" />
                <h2 className="text-2xl font-bold mb-2">No More Profiles</h2>
                <p className="text-zinc-500 mb-6">You've seen everyone! Check back later for new users.</p>
                <button onClick={loadCandidates} className="btn btn-primary bg-white text-black hover:bg-zinc-200 border-white">
                    Refresh
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-full p-4 relative">
            {/* Match Popup */}
            {matchPopup && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="card text-center max-w-sm w-full bg-zinc-950 border-zinc-800">
                        <div className="flex justify-center mb-4">
                            <PartyPopper className="w-16 h-16 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-white">It's a Match!</h2>
                        <p className="text-zinc-400 mb-6">
                            You and {matchPopup.name} liked each other!
                        </p>
                        <button
                            onClick={() => setMatchPopup(null)}
                            className="btn btn-primary w-full bg-white text-black hover:bg-zinc-200 border-white"
                        >
                            Keep Swiping
                        </button>
                    </div>
                </div>
            )}

            {/* Profile Card */}
            <div className="card w-full max-w-md bg-zinc-900/50 border-zinc-800">
                {/* Avatar */}
                <div className="flex justify-center mb-4">
                    <img
                        src={currentCandidate.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentCandidate.id}`}
                        alt={currentCandidate.name}
                        className="w-32 h-32 rounded-full object-cover border-4 border-zinc-800 bg-zinc-800"
                    />
                </div>

                {/* Info */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white">{currentCandidate.name}</h2>
                    <p className="text-zinc-400">
                        {currentCandidate.role}{currentCandidate.school ? ` at ${currentCandidate.school}` : ''}
                    </p>
                    {currentCandidate.bio && (
                        <p className="text-zinc-300 text-sm mt-3">{currentCandidate.bio}</p>
                    )}
                </div>

                {/* Skills */}
                <div className="space-y-4 mb-6">
                    {currentCandidate.offering.length > 0 && (
                        <div>
                            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Can Offer</p>
                            <div className="flex flex-wrap gap-2">
                                {currentCandidate.offering.map(skill => (
                                    <span key={skill.id} className="badge badge-offering border-zinc-700 bg-zinc-800/50 text-zinc-300">
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {currentCandidate.seeking.length > 0 && (
                        <div>
                            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Looking For</p>
                            <div className="flex flex-wrap gap-2">
                                {currentCandidate.seeking.map(skill => (
                                    <span key={skill.id} className="badge badge-seeking border-zinc-700 bg-zinc-800/50 text-zinc-400">
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={() => handleSwipe('pass')}
                        className="btn btn-danger flex-1 py-4 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white hover:border-zinc-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => handleSwipe('like')}
                        className="btn btn-success flex-1 py-4 border-white text-white hover:bg-white hover:text-black transition-colors"
                    >
                        <Heart className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Progress indicator */}
            <p className="text-zinc-600 text-sm mt-4">
                {currentIndex + 1} of {candidates.length}
            </p>
        </div>
    );
}
