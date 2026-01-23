// Dashboard - Main app shell with tabs
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Discover } from './Discover';
import { Matches } from './Matches';
import { Profile } from './Profile';
import { Search, MessageSquare, User, LogOut, Star } from 'lucide-react';

type Tab = 'discover' | 'matches' | 'profile';

export function Dashboard() {
    const { user, signOut } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('discover');

    const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
        { id: 'discover', label: 'Discover', icon: Search },
        { id: 'matches', label: 'Matches', icon: MessageSquare },
        { id: 'profile', label: 'Profile', icon: User },
    ];

    const handleLogout = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-black text-white">
            {/* Top Navigation */}
            <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-white fill-white" />
                    <span className="font-bold text-lg tracking-tight">Shooting Stars</span>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-zinc-400 text-sm hidden md:block">
                        {user?.name || 'User'}
                    </span>
                    <button onClick={handleLogout} className="p-2 hover:bg-zinc-900 rounded-full transition-colors text-zinc-400 hover:text-white" title="Sign Out">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden relative">
                {activeTab === 'discover' && <Discover />}
                {activeTab === 'matches' && <Matches />}
                {activeTab === 'profile' && <Profile />}
            </main>

            {/* Bottom Tab Bar */}
            <nav className="flex justify-around border-t border-zinc-800 py-3 bg-black">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-all ${activeTab === tab.id
                                ? 'text-white'
                                : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="text-[10px] font-medium uppercase tracking-wider">{tab.label}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
