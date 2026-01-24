// Core Types for Shooting Stars

export interface Skill {
    id: string;
    name: string;
}

export interface User {
    id: string;
    email?: string; // Optional for simulation
    name: string;
    role?: string;
    school?: string;
    bio?: string;
    avatar?: string;
    offering: Skill[];
    seeking: Skill[];
    created_at?: string;
}

export interface Match {
    id: string;
    user1_id: string;
    user2_id: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    other_user?: User;
}

export interface Message {
    id: string;
    match_id: string;
    sender_id: string;
    content: string;
    created_at: string;
}

export interface SwipeAction {
    user_id: string;
    target_user_id: string;
    action: 'like' | 'pass';
}
