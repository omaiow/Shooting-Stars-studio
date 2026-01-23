// Database types matching Supabase schema
export interface Skill {
    id: string;
    name: string;
    icon?: any;
    category?: "Tech" | "Creative" | "Academic" | "Lifestyle";
}

export interface UserSkill {
    id?: string;
    user_id: string;
    name: string;
    is_offering: boolean;
    created_at?: string;
}

export interface Profile {
    id: string;
    email: string;
    name: string;
    avatar: string;
    role: string;
    school: string;
    bio: string;
    created_at?: string;
    updated_at?: string;
}

export interface User extends Profile {
    offering?: Skill[];
    seeking?: Skill[];
}

export interface Match {
    id: string;
    user1_id: string;
    user2_id: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    user1?: User;
    user2?: User;
}

export interface Message {
    id: string;
    match_id: string;
    sender_id: string;
    content: string;
    created_at: string;
    read: boolean;
}

export interface SwipeAction {
    id?: string;
    user_id: string;
    target_user_id: string;
    action: 'like' | 'pass';
    created_at?: string;
}
