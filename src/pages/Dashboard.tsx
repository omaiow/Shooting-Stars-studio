// Dashboard - Rigid, Grid-based Layout
import { useState, useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { CURRENT_USER } from '../lib/mockData';
import { Discover } from './Discover';
import { Matches } from './Matches';
import { Profile } from './Profile';
import { Search, MessageSquare, User, RefreshCw, Star, Settings, ArrowUpRight, Activity } from 'lucide-react';

type Tab = 'discover' | 'matches' | 'profile';

export function Dashboard() {
    const { currentUser, users, switchUser, stats, resetSimulation } = useSimulation();
    const [activeTab, setActiveTab] = useState<Tab>('discover');
    const [showUserSwitcher, setShowUserSwitcher] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleReset = () => {
        if (confirm('Reset all simulation data? This will clear all matches and swipes.')) {
            resetSimulation();
        }
    };

    return (
        <div className="h-screen flex flex-col bg-zinc-950 text-white font-sans selection:bg-white/90 selection:text-black overflow-hidden relative">

            {/* BACKGROUND GRID */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20"
                style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>

            {/* TOP BAR - FIXED */}
            <header className="h-16 border-b border-white/20 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-between px-6 shrink-0 relative">
                <div className="flex items-center gap-12">
                    <button
                        onClick={() => window.location.hash = ''}
                        className="group flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                        <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-black">
                            <Star className="w-4 h-4 fill-black" />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="font-bold text-lg leading-none tracking-tighter">SHOOTING STARS</span>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest group-hover:text-zinc-300">Simulation_OS</span>
                        </div>
                    </button>

                    {/* Navigation Tabs - Text based */}
                    <nav className="hidden md:flex items-center gap-8">
                        {[
                            { id: 'discover', label: 'DISCOVER' },
                            { id: 'matches', label: 'MATCHES' },
                            { id: 'profile', label: 'PROFILE' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as Tab)}
                                className={`text-sm font-bold tracking-widest relative group py-5 ${activeTab === tab.id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-white" />
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Right Side Controls */}
                <div className="flex items-center gap-6">
                    <div className="hidden lg:flex flex-col items-end">
                        <span className="text-xs font-mono text-zinc-500">LOCAL_TIME</span>
                        <span className="text-sm font-mono font-bold">
                            {currentTime.toLocaleTimeString([], { hour12: false })}
                        </span>
                    </div>

                    <div className="w-px h-8 bg-white/20" />

                    <div className="relative">
                        <button
                            onClick={() => setShowUserSwitcher(!showUserSwitcher)}
                            className="flex items-center gap-3 hover:bg-white/5 py-2 px-3 rounded-sm transition-colors border border-transparent hover:border-zinc-800"
                        >
                            <img
                                src={currentUser?.avatar || ''}
                                className="w-6 h-6 bg-zinc-800 border border-white/20 grayscale"
                            />
                            <span className="text-xs font-bold uppercase hidden sm:block">{currentUser?.name}</span>
                        </button>

                        {showUserSwitcher && (
                            <div className="absolute right-0 top-full mt-2 w-64 border border-white/20 bg-zinc-950 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-100">
                                <div className="p-2 border-b border-white/10 bg-zinc-900/50">
                                    <p className="text-[10px] font-mono text-zinc-500 uppercase">Select Agent</p>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto">
                                    {[CURRENT_USER, ...users].map(user => (
                                        <button
                                            key={user.id}
                                            onClick={() => { switchUser(user.id); setShowUserSwitcher(false); }}
                                            className={`w-full px-4 py-3 text-left hover:bg-white text-zinc-400 hover:text-black transition-colors flex items-center justify-between group border-b border-white/5 last:border-0 ${user.id === currentUser.id ? 'bg-white/10 text-white' : ''}`}
                                        >
                                            <span className="font-mono text-xs font-bold uppercase truncate max-w-[150px]">{user.name}</span>
                                            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <a
                        href="#sim"
                        className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors"
                        title="Simulation Control"
                    >
                        <Settings className="w-4 h-4" />
                    </a>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 overflow-hidden relative z-10 p-0 md:p-6 lg:p-12 flex items-center justify-center">
                <div className="w-full h-full max-w-7xl mx-auto relative">
                    {activeTab === 'discover' && <Discover />}
                    {activeTab === 'matches' && <Matches />}
                    {activeTab === 'profile' && <Profile />}
                </div>
            </main>

            {/* NAVIGATION FOOTER (Mobile) */}
            <div className="md:hidden border-t border-white/20 bg-zinc-950 p-4 grid grid-cols-3 gap-2">
                {[
                    { id: 'discover', icon: Search },
                    { id: 'matches', icon: MessageSquare },
                    { id: 'profile', icon: User }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as Tab)}
                        className={`flex flex-col items-center justify-center p-2 rounded-sm ${activeTab === tab.id ? 'bg-white text-black' : 'text-zinc-500'}`}
                    >
                        <tab.icon className="w-5 h-5 mb-1" />
                    </button>
                ))}
            </div>

            {/* MARQUEE FOOTER STATS - Persistent */}
            <div className="h-10 border-t border-white/20 bg-black flex items-center overflow-hidden shrink-0 z-50">
                <div className="flex items-center gap-2 px-4 border-r border-white/20 h-full bg-zinc-900 text-green-400 shrink-0">
                    <Activity className="w-4 h-4" />
                    <span className="text-xs font-mono font-bold">ONLINE</span>
                </div>

                <div className="flex-1 overflow-hidden relative flex items-center">
                    <div className="animate-marquee whitespace-nowrap flex items-center gap-12 text-xs font-mono text-zinc-400">
                        <span>// SYSTEM_STATUS: <span className="text-white">OPTIMAL</span></span>
                        <span>// TOTAL_AGENTS: <span className="text-white">{stats.totalUsers}</span></span>
                        <span>// ACTIVE_MATCHES: <span className="text-white">{stats.totalMatches}</span></span>
                        <span>// MATCH_RATE: <span className="text-white">{stats.matchRate.toFixed(2)}%</span></span>
                        <span>// TOTAL_SWIPES: <span className="text-white">{stats.totalSwipes}</span></span>
                        <span>// SCENARIO: <span className="text-white uppercase">BASELINE</span></span>
                        {/* Duplicate for seamless loop */}
                        <span className="text-zinc-700">|</span>
                        <span>// SYSTEM_STATUS: <span className="text-white">OPTIMAL</span></span>
                        <span>// TOTAL_AGENTS: <span className="text-white">{stats.totalUsers}</span></span>
                        <span>// ACTIVE_MATCHES: <span className="text-white">{stats.totalMatches}</span></span>
                        <span>// MATCH_RATE: <span className="text-white">{stats.matchRate.toFixed(2)}%</span></span>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
            `}</style>
        </div>
    );
}
