// Landing Page
import { Star, Target, Sparkles, MessageCircle, ArrowUpRight } from 'lucide-react';

interface LandingProps {
    onEnter: () => void;
}

export function Landing({ onEnter }: LandingProps) {

    return (
        <div className="min-h-screen relative overflow-hidden bg-black text-white selection:bg-white selection:text-black">
            {/* Navigation */}
            <nav className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-zinc-900">
                <div className="flex items-center gap-2">
                    <Star className="w-6 h-6 text-white fill-white" />
                    <span className="text-xl font-bold tracking-tight">Shooting Stars</span>
                </div>
                <button onClick={onEnter} className="btn btn-secondary text-sm">
                    Sign In
                </button>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex flex-col items-center justify-center px-8 pt-32 pb-32 text-center max-w-7xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 mb-8">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                    <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Skill Exchange Platform</span>
                </div>

                <h1 className="text-5xl md:text-8xl font-bold mb-8 leading-tight tracking-tight max-w-4xl">
                    Don't Wish From a Star.
                    <br />
                    <span className="text-zinc-500">Build With One.</span>
                </h1>

                <p className="text-xl text-zinc-400 max-w-2xl mb-12 font-light leading-relaxed">
                    Trade skills with others. Offer what you're good at,
                    get help with what you need. No money, just talent.
                </p>

                <button onClick={onEnter} className="group btn btn-primary text-lg px-8 py-4 bg-white text-black hover:bg-zinc-200 border-white flex items-center gap-2 rounded-full">
                    Meet a Star <ArrowUpRight className="w-5 h-5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Feature Cards */}
                <div className="grid md:grid-cols-3 gap-8 mt-32 w-full px-4">
                    <div className="p-8 rounded-2xl border border-zinc-900 bg-zinc-950 hover:border-zinc-800 transition-colors text-left group">
                        <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-colors">
                            <Target className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-white">List Your Skills</h3>
                        <p className="text-zinc-500 leading-relaxed">
                            Show what you can offer and what services you need. Create your professional profile.
                        </p>
                    </div>
                    <div className="p-8 rounded-2xl border border-zinc-900 bg-zinc-950 hover:border-zinc-800 transition-colors text-left group">
                        <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-colors">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-white">Find Your Match</h3>
                        <p className="text-zinc-500 leading-relaxed">
                            Smart matching to find the perfect skill trade partners based on your needs.
                        </p>
                    </div>
                    <div className="p-8 rounded-2xl border border-zinc-900 bg-zinc-950 hover:border-zinc-800 transition-colors text-left group">
                        <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-colors">
                            <MessageCircle className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-white">Make the Trade</h3>
                        <p className="text-zinc-500 leading-relaxed">
                            Connect instantly and exchange services. You help them, they help you.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
