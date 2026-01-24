// Discover Page - Swipe through simulated users with Tinder-like animations
import { useState, useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';
import type { User } from '../lib/types';
import { X, Heart, Sparkles, PartyPopper, RefreshCw, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'motion/react';

export function Discover() {
    const { currentUser, getCandidates, recordSwipe, matchProbability, stats } = useSimulation();
    const [candidates, setCandidates] = useState<User[]>([]);
    const [matchPopup, setMatchPopup] = useState<User | null>(null);

    // Maintain a small buffer of cards to render (Current + Next)
    // We reverse the array for display so the 0-index is on top
    const [displayIndex, setDisplayIndex] = useState(0);

    useEffect(() => {
        loadCandidates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);

    const loadCandidates = () => {
        const newCandidates = getCandidates(currentUser.id);
        setCandidates(newCandidates);
        setDisplayIndex(0);
    };

    const handleSwipe = async (action: 'like' | 'pass') => {
        if (displayIndex >= candidates.length) return;

        const target = candidates[displayIndex];
        recordSwipe(target.id, action);

        if (action === 'like' && Math.random() < matchProbability) {
            setMatchPopup(target);
        }

        setDisplayIndex(prev => prev + 1);
    };

    const activeCandidate = candidates[displayIndex];
    const nextCandidate = candidates[displayIndex + 1];

    if (!activeCandidate) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-zinc-950/50 backdrop-blur-sm border border-white/10 max-w-md mx-auto aspect-[3/4.5]">
                <div className="bg-zinc-900 p-6 mb-6 border border-white/10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <Sparkles className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-black mb-2 text-white uppercase tracking-tighter">Queue Empty</h2>
                <p className="text-zinc-500 mb-8 max-w-xs mx-auto font-mono text-xs">
                    // USER_POOL_EXHAUSTED<br />
                    // GENERATE_MORE_AGENTS
                </p>
                <button
                    onClick={loadCandidates}
                    className="group relative px-8 py-3 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 transition-colors"
                >
                    <span className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" /> Refresh Feed
                    </span>
                </button>
            </div>
        );
    }

    return (
        <div className="relative h-full w-full flex flex-col items-center justify-center">
            {/* Simulation Info Badge */}
            <div className="absolute top-0 right-0 p-4 z-10">
                <div className="bg-black/50 backdrop-blur border border-white/10 px-3 py-1 text-[10px] font-mono text-zinc-400 uppercase">
                    Swipes: {stats.totalSwipes}
                </div>
            </div>

            {/* Card Area */}
            <div className="relative w-full max-w-md aspect-[3/4.5] bg-zinc-900/20 border border-white/5">
                {/* Background Card (Next Profile) */}
                {nextCandidate && (
                    <div className="absolute inset-0 z-0 transform scale-[0.98] translate-y-2 opacity-50 pointer-events-none grayscale">
                        <ProfileCard user={nextCandidate} />
                    </div>
                )}

                {/* Active Draggable Card */}
                <div className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing shadow-2xl">
                    <DraggableCard
                        key={activeCandidate.id}
                        user={activeCandidate}
                        onSwipe={handleSwipe}
                    />
                </div>
            </div>

            {/* Controls (Desktop Visual Aid) */}
            <div className="absolute bottom-8 flex gap-4 z-0 opacity-50 pointer-events-none">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-zinc-500">
                    <ArrowLeft className="w-3 h-3" /> Drag Left to Pass
                </div>
                <div className="w-px h-3 bg-white/10" />
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-zinc-500">
                    Drag Right to Like <ArrowRight className="w-3 h-3" />
                </div>
            </div>

            {/* Match Popup */}
            {matchPopup && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-6 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="text-center w-full max-w-md border border-white/20 bg-zinc-950 p-8 shadow-2xl relative">
                        {/* Decorative corners */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white" />
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white" />
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white" />

                        <div className="flex justify-center mb-6">
                            <PartyPopper className="w-16 h-16 text-white" />
                        </div>

                        <h2 className="text-5xl font-black mb-2 text-white italic tracking-tighter uppercase p-2 border-y-2 border-white inline-block">
                            MATCHED
                        </h2>

                        <p className="text-zinc-400 mb-8 mt-4 font-mono text-sm">
                            CONNECTION_ESTABLISHED::<span className="text-white font-bold">{matchPopup.name}</span>
                        </p>

                        <div className="flex items-center justify-center gap-8 mb-8">
                            <img src={currentUser.avatar || ''} className="w-20 h-20 bg-zinc-800 border-2 border-white object-cover grayscale opacity-80" />
                            <div className="w-8 h-px bg-white/50" />
                            <img src={matchPopup.avatar || ''} className="w-20 h-20 bg-zinc-800 border-2 border-white object-cover" />
                        </div>

                        <button
                            onClick={() => setMatchPopup(null)}
                            className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                        >
                            Continue Browsing
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Draggable Logic
function DraggableCard({ user, onSwipe }: { user: User; onSwipe: (action: 'like' | 'pass') => void }) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-5, 5]); // reduced rotation for stiffer feel
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 0.5, 1, 0.5, 0]);

    // Status Labels
    const likeOpacity = useTransform(x, [20, 100], [0, 1]);
    const passOpacity = useTransform(x, [-20, -100], [0, 1]);

    const controls = useAnimation();

    const handleDragEnd = async (_: unknown, info: PanInfo) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;

        if (offset > 100 || velocity > 500) {
            await controls.start({ x: 500, opacity: 0, transition: { duration: 0.2 } });
            onSwipe('like');
        } else if (offset < -100 || velocity < -500) {
            await controls.start({ x: -500, opacity: 0, transition: { duration: 0.2 } });
            onSwipe('pass');
        } else {
            controls.start({ x: 0, rotate: 0, transition: { type: 'spring', stiffness: 500, damping: 50 } });
        }
    };

    return (
        <motion.div
            style={{ x, rotate, opacity }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            animate={controls}
            className="w-full h-full relative"
        >
            {/* LIKE OVERLAY */}
            <motion.div style={{ opacity: likeOpacity }} className="absolute top-6 left-6 z-30 border-4 border-white bg-black/50 px-4 py-2 transform -rotate-6">
                <span className="text-4xl font-black text-white uppercase tracking-widest">LIKE</span>
            </motion.div>

            {/* PASS OVERLAY */}
            <motion.div style={{ opacity: passOpacity }} className="absolute top-6 right-6 z-30 border-4 border-zinc-500 bg-black/50 px-4 py-2 transform rotate-6">
                <span className="text-4xl font-black text-zinc-500 uppercase tracking-widest">PASS</span>
            </motion.div>

            <ProfileCard user={user} />
        </motion.div>
    );
}

// Card Presentation
function ProfileCard({ user }: { user: User }) {
    return (
        <div className="w-full h-full bg-zinc-900 border border-white/20 overflow-hidden relative select-none flex flex-col group">
            {/* Image Area */}
            <div className="relative flex-1 bg-zinc-800 overflow-hidden">
                <div className="absolute inset-0 bg-zinc-900/20 z-10 group-hover:bg-transparent transition-colors duration-500" />
                <img
                    src={user.avatar || ''}
                    alt={user.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    draggable={false}
                />
            </div>

            {/* Data Footer */}
            <div className="bg-black border-t border-white/20 p-6 relative">
                {/* Decorative Corner */}
                <div className="absolute top-0 right-0 w-4 h-4 border-b border-l border-white/20" />

                <div className="mb-4">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-1">
                        {user.name}
                    </h2>
                    <div className="flex items-center gap-2 text-zinc-500 font-mono text-xs uppercase">
                        <span className="text-white font-bold">{user.role}</span>
                        <span>//</span>
                        <span>{user.school || 'INDEPENDENT'}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Looking For */}
                    {user.seeking?.length > 0 && (
                        <div>
                            <p className="text-[10px] font-mono text-zinc-600 uppercase mb-1">Targeting_Skills:</p>
                            <div className="flex flex-wrap gap-1">
                                {user.seeking.slice(0, 3).map(skill => (
                                    <span key={skill.id} className="px-2 py-0.5 border border-white/20 text-white text-[10px] font-mono uppercase bg-white/5">
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
