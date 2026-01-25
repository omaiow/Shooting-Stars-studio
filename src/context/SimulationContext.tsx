// Simulation Context - Manages simulated users, matches, and statistics
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MOCK_USERS, CURRENT_USER } from '../lib/mockData';
import { generatePopulation } from '../lib/simulation';
import type { User, Match, Skill } from '../lib/types';

export type ScenarioType = 'baseline' | 'scarcity' | 'custom';

interface SimulationStats {
    totalUsers: number;
    totalMatches: number;
    totalSwipes: number;
    rightSwipes: number;
    matchRate: number; // percentage
    userUtilization: number; // percentage of users with at least one match
}

interface SimulationContextType {
    // Current user simulation
    currentUser: User;
    setCurrentUser: (user: User) => void;
    switchUser: (userId: string) => void;

    // Population management
    users: User[];
    addUser: (user: User) => void;
    removeUser: (userId: string) => void;
    updateUser: (userId: string, updates: Partial<User>) => void;
    generateUsers: (count: number, scenario: ScenarioType) => void;
    resetPopulation: () => void;

    // Match management
    matches: Match[];
    addMatch: (userId1: string, userId2: string) => void;
    getMatchesForUser: (userId: string) => Match[];

    // Swipe tracking
    recordSwipe: (targetUserId: string, action: 'like' | 'pass') => void;
    simulateSwipe: (actorId: string, targetId: string, action: 'like' | 'pass') => void;

    // Simulation controls
    scenario: ScenarioType;
    setScenario: (scenario: ScenarioType) => void;
    matchProbability: number;
    setMatchProbability: (probability: number) => void;
    resetSimulation: () => void;

    // Statistics
    stats: SimulationStats;

    // Candidates for swiping
    getCandidates: (userId: string) => User[];
}

const SimulationContext = createContext<SimulationContextType | null>(null);

export function SimulationProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [matches, setMatches] = useState<Match[]>([]);
    const [swipeHistory, setSwipeHistory] = useState<{ userId: string; targetId: string; action: 'like' | 'pass' }[]>([]);
    const [scenario, setScenario] = useState<ScenarioType>('baseline');
    const [matchProbability, setMatchProbability] = useState(0.5); // 50% by default

    const switchUser = (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            setCurrentUser(user);
        }
    };

    const addUser = (user: User) => {
        setUsers(prev => [...prev, user]);
    };

    const removeUser = (userId: string) => {
        setUsers(prev => prev.filter(u => u.id !== userId));
        setMatches(prev => prev.filter(m => m.user1_id !== userId && m.user2_id !== userId));
    };

    const updateUser = (userId: string, updates: Partial<User>) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
        if (currentUser.id === userId) {
            setCurrentUser(prev => ({ ...prev, ...updates }));
        }
    };

    const generateUsers = (count: number, scenarioType: ScenarioType) => {
        // Use the simulation library to generate realistic users
        const newUsers = generatePopulation(count, scenarioType);
        setUsers(prev => [...prev, ...newUsers]);
    };

    const resetPopulation = () => {
        setUsers(MOCK_USERS);
        setCurrentUser(CURRENT_USER);
    };

    const addMatch = (userId1: string, userId2: string) => {
        const match: Match = {
            id: `match-${Date.now()}`,
            user1_id: userId1,
            user2_id: userId2,
            status: 'accepted',
            created_at: new Date().toISOString(),
        };
        setMatches(prev => [...prev, match]);
    };

    const getMatchesForUser = (userId: string): Match[] => {
        return matches
            .filter(m => m.user1_id === userId || m.user2_id === userId)
            .map(m => {
                const otherUserId = m.user1_id === userId ? m.user2_id : m.user1_id;
                const otherUser = users.find(u => u.id === otherUserId);
                return {
                    ...m,
                    other_user: otherUser,
                };
            });
    };

    const recordSwipe = (targetUserId: string, action: 'like' | 'pass') => {
        setSwipeHistory(prev => [...prev, {
            userId: currentUser.id,
            targetId: targetUserId,
            action,
        }]);

        // If it's a like, potentially create a match based on probability
        if (action === 'like' && Math.random() < matchProbability) {
            addMatch(currentUser.id, targetUserId);
        }
    };

    const getCandidates = (userId: string): User[] => {
        // Get users that haven't been swiped on yet by this user
        const swipedIds = swipeHistory
            .filter(s => s.userId === userId)
            .map(s => s.targetId);

        const matchedIds = matches
            .filter(m => m.user1_id === userId || m.user2_id === userId)
            .map(m => m.user1_id === userId ? m.user2_id : m.user1_id);

        return users.filter(u =>
            u.id !== userId &&
            !swipedIds.includes(u.id) &&
            !matchedIds.includes(u.id)
        );
    };

    const resetSimulation = () => {
        setMatches([]);
        setSwipeHistory([]);
        resetPopulation();
        setMatchProbability(0.5);
    };

    const simulateSwipe = (actorId: string, targetId: string, action: 'like' | 'pass') => {
        setSwipeHistory(prev => [...prev, {
            userId: actorId,
            targetId: targetId,
            action,
        }]);

        // If it's a like, potentially create a match based on probability
        if (action === 'like' && Math.random() < matchProbability) {
            addMatch(actorId, targetId);
        }
    };

    // Calculate statistics
    const stats: SimulationStats = {
        totalUsers: users.length,
        totalMatches: matches.length,
        totalSwipes: swipeHistory.length,
        rightSwipes: swipeHistory.filter(s => s.action === 'like').length,
        matchRate: swipeHistory.filter(s => s.action === 'like').length > 0
            ? (matches.length / swipeHistory.filter(s => s.action === 'like').length) * 100
            : 0,
        userUtilization: users.length > 0
            ? (new Set([...matches.map(m => m.user1_id), ...matches.map(m => m.user2_id)]).size / users.length) * 100
            : 0,
    };

    return (
        <SimulationContext.Provider value={{
            currentUser,
            setCurrentUser,
            switchUser,
            users,
            addUser,
            removeUser,
            updateUser,
            generateUsers,
            resetPopulation,
            matches,
            addMatch,
            getMatchesForUser,
            recordSwipe,
            simulateSwipe,
            scenario,
            setScenario,
            matchProbability,
            setMatchProbability,
            resetSimulation,
            stats,
            getCandidates,
        }}>
            {children}
        </SimulationContext.Provider>
    );
}

export function useSimulation() {
    const context = useContext(SimulationContext);
    if (!context) {
        throw new Error('useSimulation must be used within SimulationProvider');
    }
    return context;
}
