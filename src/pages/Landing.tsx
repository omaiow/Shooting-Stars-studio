import { motion } from 'motion/react';
import { ArrowRight, Star, Sparkles } from 'lucide-react';

interface LandingProps {
    onEnter: () => void;
}

export function Landing({ onEnter }: LandingProps) {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center p-8 overflow-hidden">
            {/* Background elements are handled by the StarBackground component in App.tsx 
                but we can add some specific overlays here if needed */}

            <div className="relative z-10 max-w-5xl w-full">
                {/* Hero Section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-24">

                    {/* Left: Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex-1 text-center md:text-left"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-xs text-zinc-300 mb-6"
                        >
                            <Sparkles className="w-3 h-3 text-white" />
                            <span>Simulation V1.0 Active</span>
                        </motion.div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-6 leading-[0.9]">
                            SHOOTING <br />
                            <span className="text-zinc-500">STARS</span>
                        </h1>

                        <p className="text-lg md:text-xl text-zinc-400 max-w-md mx-auto md:mx-0 leading-relaxed font-light mb-10">
                            The future of skill exchange. Modeled, simulated, and ready for deployment. Experience the algorithm.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                            <motion.button
                                onClick={onEnter}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group relative px-8 py-4 bg-white text-black font-bold text-lg tracking-wide rounded-full overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-2 group-hover:gap-4 transition-all">
                                    ENTER SIMULATION <ArrowRight className="w-5 h-5" />
                                </span>
                                <div className="absolute inset-0 bg-zinc-200 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 border border-zinc-700 text-zinc-500 font-medium rounded-full cursor-not-allowed hover:border-zinc-600 hover:text-zinc-400 transition-colors"
                            >
                                REGISTER (SOON)
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Right: Visual Abstract */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotation: -10 }}
                        animate={{ opacity: 1, scale: 1, rotation: 0 }}
                        transition={{ delay: 0.4, duration: 1, type: "spring" }}
                        className="flex-1 relative hidden md:block"
                    >
                        {/* Card Stack Visual */}
                        <div className="relative w-80 h-[500px] mx-auto">
                            <div className="absolute inset-0 bg-white/5 rounded-[40px] rotate-6 blur-xl" />

                            <div className="absolute top-0 left-0 w-full h-full bg-zinc-900 border border-zinc-800 rounded-[40px] p-6 shadow-2xl transform rotate-3 z-10">
                                <div className="w-full h-1/2 bg-zinc-800 rounded-3xl mb-4 opacity-50 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-800 to-transparent opacity-50" />
                                </div>
                                <div className="w-2/3 h-4 bg-zinc-800 rounded-full mb-2 opacity-50" />
                                <div className="w-1/2 h-4 bg-zinc-800 rounded-full mb-6 opacity-30" />
                                <div className="flex gap-2">
                                    <div className="w-full h-10 bg-zinc-800/50 rounded-full" />
                                    <div className="w-full h-10 bg-zinc-800/50 rounded-full" />
                                </div>
                            </div>

                            <motion.div
                                animate={{ y: [0, -20, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-4 left-4 w-full h-full bg-black border border-white/10 rounded-[40px] p-6 shadow-2xl z-20 backdrop-blur-xl"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <Star className="w-8 h-8 text-white fill-white" />
                                    <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                    </div>
                                </div>
                                <div className="space-y-4 mt-auto h-full flex flex-col justify-end pb-8">
                                    <h3 className="text-4xl font-bold text-white leading-none">
                                        SKILL <br /> SWAP
                                    </h3>
                                    <p className="text-zinc-500 text-sm font-mono">
                                        MATCHING_ALGORITHM::INIT() <br />
                                        POPULATION: GENERATING...
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>

                {/* Footer Stats similar to milez.jp style tickers */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-6 left-0 right-0 flex justify-between px-8 text-[10px] sm:text-xs font-mono text-zinc-600 uppercase tracking-widest pointer-events-none"
                >
                    <div>© 2024 SHOOTING STARS</div>
                    <div className="hidden sm:block">SYSTEM STATUS: OPTIMAL</div>
                    <div>SIMULATION POC</div>
                </motion.div>
            </div>
        </div>
    );
}
