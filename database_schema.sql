  -- ============================================================================
  -- SHOOTING STARS - COMPLETE DATABASE MIGRATION
  -- ============================================================================
  -- WARNING: This will DROP and recreate all tables, deleting existing data!
  -- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ddrasmwcwzurwsfglqpz/sql/new

  -- Drop existing tables (clean slate)
  DROP TABLE IF EXISTS matches CASCADE;
  DROP TABLE IF EXISTS swipes CASCADE;
  DROP TABLE IF EXISTS skills CASCADE;
  DROP TABLE IF EXISTS profiles CASCADE;

  -- ============================================================================
  -- PROFILES TABLE
  -- ============================================================================
  CREATE TABLE profiles (
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

  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

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
    TO authenticated, anon
    WITH CHECK (auth.uid() = id);

  -- ============================================================================
  -- SKILLS TABLE
  -- ============================================================================
  CREATE TABLE skills (
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

  CREATE POLICY "Users can insert own skills"
    ON skills FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update own skills"
    ON skills FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can delete own skills"
    ON skills FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

  -- ============================================================================
  -- SWIPES TABLE
  -- ============================================================================
  CREATE TABLE swipes (
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
  CREATE TABLE matches (
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

  CREATE POLICY "System can create matches"
    ON matches FOR INSERT
    TO authenticated
    WITH CHECK (true);

  -- ============================================================================
  -- SEED DATA - Mock Profiles
  -- ============================================================================
  -- Note: These UUIDs must correspond to actual auth.users created via signup
  -- For now, we'll use placeholder UUIDs. Real users will create their own profiles.

  -- Uncomment and update these after creating test accounts manually:
  /*
  INSERT INTO profiles (id, email, name, role, school, bio, avatar) VALUES
    ('REPLACE-WITH-REAL-UUID-1', 'sarah@example.com', 'Sarah Stellar', 'Designer', 'Nebula Arts', 'Graphic designer wanting to learn to code.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60'),
    ('REPLACE-WITH-REAL-UUID-2', 'mike@example.com', 'Mike Meteor', 'Musician', 'Rock Star Academy', 'Guitarist looking for website help.', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=60');

  INSERT INTO skills (user_id, name, is_offering) VALUES
    ('REPLACE-WITH-REAL-UUID-1', 'Graphic Design', true),
    ('REPLACE-WITH-REAL-UUID-1', 'Photoshop', true),
    ('REPLACE-WITH-REAL-UUID-1', 'React', false),
    ('REPLACE-WITH-REAL-UUID-1', 'Web Development', false),
    ('REPLACE-WITH-REAL-UUID-2', 'Guitar', true),
    ('REPLACE-WITH-REAL-UUID-2', 'Music Theory', true),
    ('REPLACE-WITH-REAL-UUID-2', 'HTML/CSS', false),
    ('REPLACE-WITH-REAL-UUID-2', 'JavaScript', false);
  */

  -- ============================================================================
  -- DONE!
  -- ============================================================================
  -- Next steps:
  -- 1. Sign up with a new account
  -- 2. Add skills to your profile
  -- 3. Create more test accounts if you want mock users to swipe on
