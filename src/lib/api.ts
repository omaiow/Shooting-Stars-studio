import { supabase } from "./supabase";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { User } from "./data";
import { MOCK_USERS } from "./mockData";

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/server`;

const getHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token || publicAnonKey}`
  };
};

export const api = {
  // Auth & User
  signUp: async (data: any): Promise<{ profile: User }> => {
    // 1. Create User on Server (Auto-confirm)
    const response = await fetch(`${BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}` // Use anon key for public route
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(err.error || "Signup failed");
    }

    // 2. Sign In to get Session
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    });

    if (authError) throw authError;

    return await response.json();
  },

  getProfile: async (): Promise<User | null> => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/profile`, { headers });
    if (response.status === 401) return null;
    if (!response.ok) throw new Error("Failed to fetch profile");
    return response.json();
  },

  updateProfile: async (data: Partial<User>) => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/profile`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error("Failed to update profile");
    return response.json();
  },

  // Matching
  getCandidates: async (): Promise<User[]> => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/candidates?t=${Date.now()}`, { headers });
    if (!response.ok) throw new Error("Failed to fetch candidates");
    return response.json();
  },

  swipe: async (targetId: string, direction: 'left' | 'right'): Promise<{ isMatch: boolean }> => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/swipe`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ targetId, direction })
    });
    if (!response.ok) throw new Error("Swipe failed");
    return response.json();
  },

  getMatches: async (): Promise<User[]> => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/matches`, { headers });
    if (!response.ok) return [];
    return response.json();
  },

  seed: async () => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/seed`, { method: 'POST', headers });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Seed failed");
    }
    return response.json();
  },
};

