-- Fix: Allow profile insertion during signup
-- The issue: During signup, the auth user is created but the session might not be fully 
-- established for the client, causing RLS to reject the profile insert.
-- Solution: Allow both authenticated AND anon role to insert their own profile.

-- Drop the old policy
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create a new policy that allows both authenticated and anon users to insert their own profile
-- This is safe because we still check that auth.uid() = id, so users can only create their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated, anon
  WITH CHECK (auth.uid() = id);
