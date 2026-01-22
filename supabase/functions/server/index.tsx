import { Hono } from "npm:hono@^4.0.0";
import { cors } from "npm:hono@^4.0.0/cors";
import { logger } from "npm:hono@^4.0.0/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

// KV Store Implementation (inlined from kv_store.tsx)
const kvClient = () => createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const kv = {
    set: async (key: string, value: any): Promise<void> => {
        const supabase = kvClient();
        const { error } = await supabase.from("kv_store_b0184cae").upsert({
            key,
            value
        });
        if (error) {
            throw new Error(error.message);
        }
    },

    get: async (key: string): Promise<any> => {
        const supabase = kvClient();
        const { data, error } = await supabase.from("kv_store_b0184cae").select("value").eq("key", key).maybeSingle();
        if (error) {
            throw new Error(error.message);
        }
        return data?.value;
    },

    del: async (key: string): Promise<void> => {
        const supabase = kvClient();
        const { error } = await supabase.from("kv_store_b0184cae").delete().eq("key", key);
        if (error) {
            throw new Error(error.message);
        }
    },

    getByPrefix: async (prefix: string): Promise<any[]> => {
        const supabase = kvClient();
        const { data, error } = await supabase.from("kv_store_b0184cae").select("key, value").like("key", prefix + "%");
        if (error) {
            throw new Error(error.message);
        }
        return data?.map((d) => d.value) ?? [];
    }
};


const app = new Hono();

app.use('*', logger());
app.use('*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'apikey'],
}));

// Helper to get authenticated user
async function getUser(c: any) {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) return null;

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user;
}

const SEED_USERS = [
    {
        id: "seed-1",
        name: "Sarah Stellar",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60",
        bio: "Graphic designer wanting to learn to code.",
        school: "Nebula Arts",
        role: "Designer",
        offering: [{ id: "1", name: "Graphic Design" }, { id: "2", name: "Photoshop" }],
        seeking: [{ id: "3", name: "React" }, { id: "4", name: "Web Dev" }]
    },
    {
        id: "seed-2",
        name: "Mike Meteor",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=60",
        bio: "Guitarist looking for website help.",
        school: "Rock Star Academy",
        role: "Musician",
        offering: [{ id: "5", name: "Guitar" }, { id: "6", name: "Music Theory" }],
        seeking: [{ id: "7", name: "HTML/CSS" }, { id: "8", name: "JavaScript" }]
    },
    {
        id: "seed-3",
        name: "Luna Lander",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=60",
        bio: "Chef who wants to learn Spanish.",
        school: "Culinary Institute",
        role: "Chef",
        offering: [{ id: "9", name: "Cooking" }, { id: "10", name: "Italian Cuisine" }],
        seeking: [{ id: "11", name: "Spanish" }, { id: "12", name: "Language" }]
    },
    {
        id: "seed-4",
        name: "Comet Chris",
        avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60",
        bio: "Math tutor looking for piano lessons.",
        school: "Quantum High",
        role: "Tutor",
        offering: [{ id: "13", name: "Calculus" }, { id: "14", name: "Algebra" }],
        seeking: [{ id: "15", name: "Piano" }, { id: "16", name: "Music" }]
    }
];

// ------------------------------------------------------------------
// ROUTES
// ------------------------------------------------------------------

// 1. SIGN UP
app.post(`/signup`, async (c: any) => {
    try {
        const { email, password, name, role, school } = await c.req.json();

        // Create Supabase Auth User
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error("Missing Supabase Env Vars");
            return c.json({ error: "Server Configuration Error: Missing Env Vars" }, 500);
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        // Check if user exists first to give better error
        const listResult = await supabaseAdmin.auth.admin.listUsers();
        if (listResult.error) {
            console.error("List users error:", listResult.error);
            return c.json({ error: "Failed to check existing users" }, 500);
        }

        const existing = listResult.data.users.find((u: any) => u.email === email);
        if (existing) {
            return c.json({ error: "User already registered" }, 400);
        }

        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { name }
        });

        if (error) {
            console.error("Create user error:", error);
            return c.json({ error: error.message }, 400);
        }

        const user = data.user;
        if (!user) return c.json({ error: "Failed to create user" }, 500);

        // Initialize Profile in KV Store
        const profile = {
            id: user.id,
            email: user.email,
            name,
            role,
            school,
            bio: `Hi, I'm ${name}!`,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`, // Default avatar
            skills: [], // Initialize empty
        };

        await kv.set(`profile:${user.id}`, profile);

        return c.json({ user, profile });
    } catch (e: any) {
        console.error("Signup exception:", e);
        return c.json({ error: e.message }, 500);
    }
});

// 2. GET PROFILE
app.get(`/profile`, async (c: any) => {
    const user = await getUser(c);
    if (!user) return c.text("Unauthorized", 401);

    try {
        let profile = await kv.get(`profile:${user.id}`);
        if (!profile) {
            // Fallback if profile missing
            profile = {
                id: user.id,
                email: user.email,
                name: user.user_metadata?.name || "User",
            };
            await kv.set(`profile:${user.id}`, profile);
        }
        return c.json(profile);
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// 3. UPDATE PROFILE
app.post(`/profile`, async (c: any) => {
    const user = await getUser(c);
    if (!user) return c.text("Unauthorized", 401);

    try {
        const updates = await c.req.json();
        const current = await kv.get(`profile:${user.id}`) || {};
        const updated = { ...current, ...updates, id: user.id }; // Ensure ID doesn't change

        await kv.set(`profile:${user.id}`, updated);
        return c.json(updated);
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// 4. GET CANDIDATES (Discover)
app.get(`/candidates`, async (c: any) => {
    const user = await getUser(c);
    if (!user) return c.text("Unauthorized", 401);

    try {
        console.log(`[candidates] Fetching for user ${user.id}`);

        // Get all profiles
        let allProfiles = await kv.getByPrefix("profile:");
        console.log(`[candidates] Found ${allProfiles.length} total profiles`);

        // Seed if empty (less than 2 profiles, implying only me or none)
        if (allProfiles.length < 2) {
            console.log("Seeding database with mock users...");
            for (const seedUser of SEED_USERS) {
                await kv.set(`profile:${seedUser.id}`, seedUser);
            }
            allProfiles = await kv.getByPrefix("profile:");
        }

        // Get my swipes
        const mySwipes = await kv.getByPrefix(`swipe:${user.id}:`);
        console.log(`[candidates] User has swiped on ${mySwipes.length} profiles`);

        const swipedIds = new Set(mySwipes.map((s: any) => s.targetId));

        // Filter
        const candidates = allProfiles.filter((p: any) => {
            const isMe = p.id === user.id;
            const isSwiped = swipedIds.has(p.id);
            if (isMe) return false;
            if (isSwiped) {
                // console.log(`[candidates] Skipping swiped user ${p.id}`);
                return false;
            }
            return true;
        });

        console.log(`[candidates] Returning ${candidates.length} candidates`);
        return c.json(candidates);
    } catch (e: any) {
        console.error("[candidates] Error:", e);
        return c.json({ error: e.message }, 500);
    }
});

// 5. SWIPE
app.post(`/swipe`, async (c: any) => {
    const user = await getUser(c);
    if (!user) return c.text("Unauthorized", 401);

    try {
        const { targetId, direction } = await c.req.json();

        // Record Swipe
        const swipeData = {
            userId: user.id,
            targetId,
            direction,
            timestamp: new Date().toISOString()
        };
        await kv.set(`swipe:${user.id}:${targetId}`, swipeData);

        let isMatch = false;

        // Check for Match if Liked
        if (direction === 'right') {
            const otherSwipe = await kv.get(`swipe:${targetId}:${user.id}`);
            if (otherSwipe && otherSwipe.direction === 'right') {
                isMatch = true;
                // Create Match Records
                const matchData = {
                    users: [user.id, targetId],
                    timestamp: new Date().toISOString()
                };
                // Store match for both users
                await kv.set(`match:${user.id}:${targetId}`, matchData);
                await kv.set(`match:${targetId}:${user.id}`, matchData);
            }
        }

        return c.json({ success: true, isMatch });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// 6. GET MATCHES
app.get(`/matches`, async (c: any) => {
    const user = await getUser(c);
    if (!user) return c.text("Unauthorized", 401);

    try {
        const matches = await kv.getByPrefix(`match:${user.id}:`);
        // Matches values contain { users: [id1, id2], ... }
        // We need the profile of the OTHER user

        const friendIds = matches.map((m: any) => {
            return m.users.find((uid: string) => uid !== user.id);
        });

        const profiles = [];
        for (const fid of friendIds) {
            const p = await kv.get(`profile:${fid}`);
            if (p) profiles.push(p);
        }

        return c.json(profiles);
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// 7. SEED
app.post(`/seed`, async (c: any) => {
    const user = await getUser(c);
    // Allow seeding if authenticated
    if (!user) return c.text("Unauthorized", 401);

    try {
        console.log("Forcing seed and resetting interactions for user " + user.id);
        for (const seedUser of SEED_USERS) {
            // 1. Reset profile
            await kv.set(`profile:${seedUser.id}`, seedUser);

            // 2. Remove my swipe for this seed user so they appear again
            // Ensure the key format matches exactly what we create in /swipe
            const swipeKey = `swipe:${user.id}:${seedUser.id}`;
            console.log(`[seed] Deleting swipe key: ${swipeKey}`);
            await kv.del(swipeKey);

            // 3. Remove matches involving this seed user and me
            await kv.del(`match:${user.id}:${seedUser.id}`);
            await kv.del(`match:${seedUser.id}:${user.id}`);
        }
        return c.json({ success: true, count: SEED_USERS.length });
    } catch (e: any) {
        console.error("[seed] Error:", e);
        return c.json({ error: e.message }, 500);
    }
});

Deno.serve(app.fetch);
