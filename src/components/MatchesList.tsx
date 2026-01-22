import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Phone, Video, MoreVertical, Loader2, Send } from "lucide-react";
import { api } from "../lib/api";
import { toast } from "sonner";
import { User } from "../lib/data";

interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: number;
}

export function MatchesList({ initialMatchId }: { initialMatchId?: string }) {
    const [matches, setMatches] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMatch, setSelectedMatch] = useState<User | null>(null);

    // Chat state
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadMatches();
    }, []);

    useEffect(() => {
        // Auto-scroll to bottom of chat
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, selectedMatch]);

    const loadMatches = async () => {
        try {
            const data = await api.getMatches();
            setMatches(data);

            if (initialMatchId) {
                const target = data.find(m => m.id === initialMatchId);
                if (target) {
                    setSelectedMatch(target);
                    return;
                }
            }

            if (data.length > 0 && !selectedMatch) {
                setSelectedMatch(data[0]);
            }
        } catch (e) {
            toast.error("Failed to load matches");
        } finally {
            setLoading(false);
        }
    };

    // When selected match changes, load their "mock" messages
    useEffect(() => {
        if (selectedMatch) {
            // Generate some fake history if empty
            // In a real app, we would fetch messages here
            const initialMsgs: Message[] = [
                {
                    id: "1",
                    senderId: selectedMatch.id,
                    text: `Hey! I noticed you're interested in ${selectedMatch.offering?.[0]?.name || 'trading skills'}.`,
                    timestamp: Date.now() - 100000
                }
            ];
            setMessages(initialMsgs);
        }
    }, [selectedMatch?.id]);

    const handleSendMessage = async () => {
        if (!inputText.trim() || !selectedMatch) return;

        const newMsg: Message = {
            id: Date.now().toString(),
            senderId: "me",
            text: inputText.trim(),
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, newMsg]);
        setInputText("");

        // Mock Reply
        setTimeout(() => {
            const reply: Message = {
                id: (Date.now() + 1).toString(),
                senderId: selectedMatch.id,
                text: "That sounds great! When are you free to meet?",
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, reply]);
        }, 2000);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };


    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
        );
    }

    if (matches.length === 0) {
        return (
            <div className="flex h-full items-center justify-center text-slate-500">
                No matches yet. Keep swiping!
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col md:flex-row gap-6 p-4">
            {/* List */}
            <div className="w-full md:w-80 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 overflow-hidden flex flex-col h-[calc(100vh-140px)]">
                <div className="p-4 border-b border-slate-800">
                    <h2 className="font-bold text-lg text-white">Matches</h2>
                </div>
                <ScrollArea className="flex-1">
                    <div className="divide-y divide-slate-800">
                        {matches.map((match, i) => (
                            <button
                                key={match.id}
                                onClick={() => setSelectedMatch(match)}
                                className={`w-full flex items-center gap-4 p-4 hover:bg-slate-800/50 transition-colors text-left ${selectedMatch?.id === match.id ? "bg-slate-800/80" : ""}`}
                            >
                                <Avatar className="h-12 w-12 border border-slate-700 shadow-sm">
                                    <AvatarImage src={match.avatar} />
                                    <AvatarFallback className="bg-slate-700 text-white">{match.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <span className="font-semibold text-sm truncate text-slate-200">{match.name}</span>
                                        <span className="text-[10px] text-slate-500 whitespace-nowrap">Just now</span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate">
                                        Matched! Say hello.
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="hidden md:flex flex-1 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 flex-col h-[calc(100vh-140px)]">
                {selectedMatch ? (
                    <>
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="border border-slate-700">
                                    <AvatarImage src={selectedMatch.avatar} />
                                    <AvatarFallback className="bg-slate-700 text-white">{selectedMatch.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-bold text-sm text-white">{selectedMatch.name}</h3>
                                    <p className="text-xs text-slate-400">Active now</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800"><Phone className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800"><Video className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800"><MoreVertical className="w-4 h-4" /></Button>
                            </div>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto" ref={scrollRef}>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col items-center justify-center py-6 text-slate-500 text-xs">
                                    <span className="bg-slate-800/50 px-3 py-1 rounded-full">
                                        You matched with {selectedMatch.name}
                                    </span>
                                </div>

                                {messages.map((msg) => {
                                    const isMe = msg.senderId === "me";
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
                                        >
                                            <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${isMe
                                                    ? "bg-blue-600 text-white rounded-tr-none"
                                                    : "bg-slate-800 text-slate-200 rounded-tl-none"
                                                }`}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-800">
                            <div className="flex gap-2 relative">
                                <input
                                    className="flex-1 bg-slate-950/50 border border-slate-800 rounded-full px-4 text-sm text-white placeholder:text-slate-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none h-10 transition-all"
                                    placeholder="Type a message..."
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                />
                                <Button
                                    size="icon"
                                    className="rounded-full bg-blue-600 hover:bg-blue-700 text-white h-10 w-10 shrink-0 transition-all active:scale-95"
                                    onClick={handleSendMessage}
                                    disabled={!inputText.trim()}
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-500">
                        Select a match to start chatting
                    </div>
                )}
            </div>
        </div>
    );
}
