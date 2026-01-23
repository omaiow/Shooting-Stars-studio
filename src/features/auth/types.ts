// Authentication types
export interface SignUpData {
    email: string;
    password: string;
    name: string;
    role: string;
    school: string;
    avatar?: string;
    offering?: { id: string; name: string }[];
    seeking?: { id: string; name: string }[];
}

export interface SignInData {
    email: string;
    password: string;
}

export interface AuthUser {
    id: string;
    email: string;
}

export interface AuthSession {
    access_token: string;
    refresh_token: string;
    user: AuthUser;
}
