-- Shooting Stars Database Schema
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/ddrasmwcwzurwsfglqpz/sql/new

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT,
  school TEXT,
  bio TEXT,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- SKILLS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_offering BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all skills"
  ON skills FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own skills"
  ON skills FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- SWIPES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  target_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('left', 'right')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_id)
);

ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own swipes"
  ON swipes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own swipes"
  ON swipes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- MATCHES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id < user2_id)
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own matches"
  ON matches FOR SELECT
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- ============================================================================
-- SEED DATA (Mock Users)
-- ============================================================================
INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-000000000001', 'sarah@example.com'),
  ('00000000-0000-0000-0000-000000000002', 'mike@example.com'),
  ('00000000-0000-0000-0000-000000000003', 'luna@example.com'),
  ('00000000-0000-0000-0000-000000000004', 'chris@example.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, email, name, role, school, bio, avatar) VALUES
  ('00000000-0000-0000-0000-000000000001', 'sarah@example.com', 'Sarah Stellar', 'Designer', 'Nebula Arts', 'Graphic designer wanting to learn to code.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60'),
  ('00000000-0000-0000-0000-000000000002', 'mike@example.com', 'Mike Meteor', 'Musician', 'Rock Star Academy', 'Guitarist looking for website help.', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=60'),
  ('00000000-0000-0000-0000-000000000003', 'luna@example.com', 'Luna Lander', 'Chef', 'Culinary Institute', 'Chef who wants to learn Spanish.', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=60'),
  ('00000000-0000-0000-0000-000000000004', 'chris@example.com', 'Comet Chris', 'Tutor', 'Quantum High', 'Math tutor looking for piano lessons.', 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60')
ON CONFLICT (id) DO NOTHING;

-- Note: Seed users won't be able to actually log in since they don't have passwords in auth.users
-- They exist only for discovery purposes
