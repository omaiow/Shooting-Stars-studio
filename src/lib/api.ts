import { supabase } from "./supabase";
import { User } from "./data";
import { MOCK_USERS } from "./mockData";

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  role: string;
  school: string;
}

export const api = {
  // ============================================================================
  // AUTH & USER
  // ============================================================================
  signUp: async (data: SignUpData): Promise<{ profile: User }> => {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Failed to create user");

    // 2. Create profile
    const profile = {
      id: authData.user.id,
      email: data.email,
      name: data.name,
      role: data.role,
      school: data.school,
      bio: `Hi, I'm ${data.name}!`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${authData.user.id}`,
    };

    const { error: profileError } = await supabase
      .from("profiles")
      .insert(profile);

    if (profileError) throw profileError;

    return { profile: profile as User };
  },

  getProfile: async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) throw error;

    // Load skills
    const { data: skills } = await supabase
      .from("skills")
      .select("*")
      .eq("user_id", user.id);

    const offering = skills?.filter(s => s.is_offering).map(s => ({ id: s.id, name: s.name })) || [];
    const seeking = skills?.filter(s => !s.is_offering).map(s => ({ id: s.id, name: s.name })) || [];

    return {
      ...data,
      offering,
      seeking,
    } as User;
  },

  updateProfile: async (updates: Partial<User>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Separate skills from profile updates
    const { offering, seeking, ...profileUpdates } = updates;

    // Update profile fields (name, bio, etc.)
    if (Object.keys(profileUpdates).length > 0) {
      const { data, error } = await supabase
        .from("profiles")
        .update(profileUpdates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;
    }

    // Handle skills updates if provided
    if (offering !== undefined || seeking !== undefined) {
      // Delete existing skills
      await supabase.from("skills").delete().eq("user_id", user.id);

      // Insert new skills
      const skillsToInsert = [
        ...(offering || []).map(skill => ({
          user_id: user.id,
          name: skill.name,
          is_offering: true,
        })),
        ...(seeking || []).map(skill => ({
          user_id: user.id,
          name: skill.name,
          is_offering: false,
        })),
      ];

      if (skillsToInsert.length > 0) {
        const { error } = await supabase.from("skills").insert(skillsToInsert);
        if (error) throw error;
      }
    }

    // Return updated profile with skills
    return api.getProfile();
  },

  // ============================================================================
  // MATCHING
  // ============================================================================
  getCandidates: async (): Promise<User[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Get all profiles
    const { data: allProfiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", user.id); // Exclude self

    if (profilesError) throw profilesError;

    // Get user's swipes
    const { data: swipes, error: swipesError } = await supabase
      .from("swipes")
      .select("target_id")
      .eq("user_id", user.id);

    if (swipesError) throw swipesError;

    // Filter out swiped profiles
    const swipedIds = new Set(swipes?.map(s => s.target_id) || []);
    const candidates = allProfiles?.filter(p => !swipedIds.has(p.id)) || [];

    // Load skills for each candidate
    const candidatesWithSkills = await Promise.all(
      candidates.map(async (profile) => {
        const { data: skills } = await supabase
          .from("skills")
          .select("*")
          .eq("user_id", profile.id);

        const offering = skills?.filter(s => s.is_offering).map(s => ({ id: s.id, name: s.name })) || [];
        const seeking = skills?.filter(s => !s.is_offering).map(s => ({ id: s.id, name: s.name })) || [];

        return {
          ...profile,
          offering,
          seeking,
        };
      })
    );

    return candidatesWithSkills as User[];
  },

  swipe: async (targetId: string, direction: 'left' | 'right'): Promise<{ isMatch: boolean }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Record swipe
    const { error: swipeError } = await supabase
      .from("swipes")
      .insert({
        user_id: user.id,
        target_id: targetId,
        direction,
      });

    if (swipeError) throw swipeError;

    let isMatch = false;

    // Check for match if right swipe
    if (direction === 'right') {
      const { data: reciprocalSwipe } = await supabase
        .from("swipes")
        .select("*")
        .eq("user_id", targetId)
        .eq("target_id", user.id)
        .eq("direction", "right")
        .single();

      if (reciprocalSwipe) {
        isMatch = true;

        // Create match (ensure user1_id < user2_id for uniqueness)
        const [user1, user2] = [user.id, targetId].sort();

        const { error: matchError } = await supabase
          .from("matches")
          .insert({
            user1_id: user1,
            user2_id: user2,
          });

        // Ignore duplicate match errors
        if (matchError && !matchError.message.includes("unique")) {
          throw matchError;
        }
      }
    }

    return { isMatch };
  },

  getMatches: async (): Promise<User[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Get matches where user is either user1 or user2
    const { data: matches, error } = await supabase
      .from("matches")
      .select(`
        user1_id,
        user2_id,
        user1:profiles!matches_user1_id_fkey(*),
        user2:profiles!matches_user2_id_fkey(*)
      `)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

    if (error) throw error;

    // Extract the other user's profile
    const profiles = matches?.map((m: any) => {
      return m.user1_id === user.id ? m.user2 : m.user1;
    }) || [];

    // Load skills for each matched profile
    const profilesWithSkills = await Promise.all(
      profiles.map(async (profile: any) => {
        const { data: skills } = await supabase
          .from("skills")
          .select("*")
          .eq("user_id", profile.id);

        const offering = skills?.filter(s => s.is_offering).map(s => ({ id: s.id, name: s.name })) || [];
        const seeking = skills?.filter(s => !s.is_offering).map(s => ({ id: s.id, name: s.name })) || [];

        return {
          ...profile,
          offering,
          seeking,
        };
      })
    );

    return profilesWithSkills as User[];
  },

  // Seed function for testing (creates mock swipes/matches)
  seed: async () => {
    // This is just a stub - in the new system, seed data is in SQL
    return { success: true };
  },
};
