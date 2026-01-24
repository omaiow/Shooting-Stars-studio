// Matches Page - View simulation matches
import { useSimulation } from '../context/SimulationContext';
import { Sparkles } from 'lucide-react';

export function Matches() {
    const { currentUser, getMatchesForUser } = useSimulation();
    const matches = getMatchesForUser(currentUser.id);

    if (matches.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Sparkles className="w-12 h-12 mb-4 text-zinc-600" />
                <h2 className="text-2xl font-bold mb-2 text-white">No Matches Yet</h2>
                <p className="text-zinc-500">Keep swiping to find your skill swap partners!</p>
                <p className="text-xs text-zinc-600 mt-4">(Simulation Mode - Messaging disabled)</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-6 overflow-y-auto h-full">
            <h1 className="text-2xl font-bold mb-6">Your Matches</h1>

            <div className="space-y-4">
                {matches.map(match => {
                    const otherUser = match.other_user;
                    if (!otherUser) return null;

                    return (
                        <div key={match.id} className="card bg-zinc-900/50 border-zinc-800">
                            <div className="flex items-start gap-4">
                                <img
                                    src={otherUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.id}`}
                                    alt={otherUser.name}
                                    className="w-16 h-16 rounded-full bg-zinc-800 object-cover"
                                />
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-white">{otherUser.name}</h3>
                                    <p className="text-sm text-zinc-400 mb-2">
                                        {otherUser.role}{otherUser.school ? ` at ${otherUser.school}` : ''}
                                    </p>

                                    {otherUser.offering && otherUser.offering.length > 0 && (
                                        <div className="mb-2">
                                            <p className="text-xs text-zinc-500 mb-1">Can offer:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {otherUser.offering.map(skill => (
                                                    <span key={skill.id} className="badge badge-offering border-zinc-700 bg-zinc-800/50 text-zinc-300 text-xs">
                                                        {skill.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {otherUser.seeking && otherUser.seeking.length > 0 && (
                                        <div>
                                            <p className="text-xs text-zinc-500 mb-1">Looking for:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {otherUser.seeking.map(skill => (
                                                    <span key={skill.id} className="badge badge-seeking border-zinc-700 bg-zinc-800/50 text-zinc-400 text-xs">
                                                        {skill.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="text-right">
                                    <p className="text-xs text-zinc-600">Matched</p>
                                    <p className="text-xs text-zinc-500">{new Date(match.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 p-4 bg-blue-600/10 border border-blue-600/30 rounded-lg">
                <p className="text-sm text-blue-200 text-center">
                    📊 Simulation Mode: {matches.length} total match{matches.length !== 1 ? 'es' : ''}
                </p>
            </div>
        </div>
    );
}
