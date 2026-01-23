// Matches Page - List of matches with chat
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { User, Match, Message } from '../lib/types';
import { Send, Sparkles } from 'lucide-react';

export function Matches() {
    const { user: currentUser } = useAuth();
    const [matches, setMatches] = useState<(Match & { other_user: User })[]>([]);
    const [selectedMatch, setSelectedMatch] = useState<(Match & { other_user: User }) | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (currentUser) {
            loadMatches();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);

    useEffect(() => {
        if (selectedMatch) {
            loadMessages(selectedMatch.id);
        }
    }, [selectedMatch]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadMatches = async () => {
        if (!currentUser) return;

        try {
            setLoading(true);

            const { data: matchData } = await supabase
                .from('matches')
                .select('*')
                .or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`)
                .eq('status', 'accepted')
                .order('created_at', { ascending: false });

            // Get profiles for each match
            const matchesWithUsers = await Promise.all(
                (matchData || []).map(async (match) => {
                    const otherUserId = match.user1_id === currentUser.id ? match.user2_id : match.user1_id;

                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', otherUserId)
                        .single();

                    const { data: skills } = await supabase
                        .from('skills')
                        .select('*')
                        .eq('user_id', otherUserId);

                    const other_user: User = {
                        ...profile,
                        offering: (skills || []).filter(s => s.is_offering).map(s => ({ id: s.id, name: s.name })),
                        seeking: (skills || []).filter(s => !s.is_offering).map(s => ({ id: s.id, name: s.name })),
                    };

                    return { ...match, other_user };
                })
            );

            setMatches(matchesWithUsers);

            if (matchesWithUsers.length > 0 && !selectedMatch) {
                setSelectedMatch(matchesWithUsers[0]);
            }
        } catch (error) {
            console.error('Error loading matches:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (matchId: string) => {
        try {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .eq('match_id', matchId)
                .order('created_at', { ascending: true });

            setMessages(data || []);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const sendMessage = async () => {
        if (!currentUser || !selectedMatch || !newMessage.trim()) return;

        try {
            const { data, error } = await supabase
                .from('messages')
                .insert({
                    match_id: selectedMatch.id,
                    sender_id: currentUser.id,
                    content: newMessage.trim(),
                })
                .select()
                .single();

            if (error) throw error;

            setMessages(prev => [...prev, data]);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="spinner border-zinc-500 border-t-white" />
            </div>
        );
    }

    if (matches.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Sparkles className="w-12 h-12 mb-4 text-zinc-600" />
                <h2 className="text-2xl font-bold mb-2 text-white">No Matches Yet</h2>
                <p className="text-zinc-500">Keep swiping to find your trade partners!</p>
            </div>
        );
    }

    return (
        <div className="flex h-full bg-black text-white">
            {/* Match List */}
            <div className="w-80 border-r border-zinc-800 overflow-y-auto">
                <div className="p-4 border-b border-zinc-800">
                    <h2 className="font-bold text-lg">Matches</h2>
                </div>

                {matches.map(match => (
                    <button
                        key={match.id}
                        onClick={() => setSelectedMatch(match)}
                        className={`w-full flex items-center gap-3 p-4 hover:bg-zinc-900 transition-colors ${selectedMatch?.id === match.id ? 'bg-zinc-900 border-r-2 border-white' : ''
                            }`}
                    >
                        <img
                            src={match.other_user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${match.other_user.id}`}
                            alt={match.other_user.name}
                            className="w-10 h-10 rounded-full bg-zinc-800 object-cover"
                        />
                        <div className="text-left overflow-hidden">
                            <p className="font-medium truncate text-white">{match.other_user.name}</p>
                            <p className="text-sm text-zinc-500 truncate">
                                {match.other_user.role || 'Skill Swapper'}
                            </p>
                        </div>
                    </button>
                ))}
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-zinc-950/50">
                {selectedMatch ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-zinc-800 flex items-center gap-3 bg-black">
                            <img
                                src={selectedMatch.other_user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedMatch.other_user.id}`}
                                alt={selectedMatch.other_user.name}
                                className="w-10 h-10 rounded-full bg-zinc-800 object-cover"
                            />
                            <div>
                                <p className="font-bold text-white">{selectedMatch.other_user.name}</p>
                                <p className="text-sm text-zinc-500">
                                    {selectedMatch.other_user.offering.length > 0 &&
                                        `Offers: ${selectedMatch.other_user.offering.map(s => s.name).join(', ')}`
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 && (
                                <div className="text-center text-zinc-600 py-8">
                                    <p>No messages yet. Say hello!</p>
                                </div>
                            )}

                            {messages.map(msg => {
                                const isMe = msg.sender_id === currentUser?.id;
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${isMe
                                                ? 'bg-white text-black rounded-br-none font-medium'
                                                : 'bg-zinc-800 text-zinc-200 rounded-bl-none'
                                                }`}
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="p-4 border-t border-zinc-800 bg-black">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="input bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-white rounded-full px-4"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim()}
                                    className="btn btn-primary bg-white text-black hover:bg-zinc-200 rounded-full w-10 h-10 p-0 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-4 h-4 ml-0.5" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-zinc-600">
                        <div className="text-center">
                            <Sparkles className="w-12 h-12 mb-4 text-zinc-800 mx-auto" />
                            <p>Select a match to start chatting</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
