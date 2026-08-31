/*
# Create admins table for Supabase Auth-based admin access

## Purpose
Replaces the old single-password admin login with a proper Supabase Auth-based system.
Only users whose email is in the `admins` table can access the admin panel.
This means you create a user in Supabase Auth (email + password), then add their
auth.users id to the `admins` table to grant admin access.

## New Tables
- `admins`
  - `id` (uuid, primary key) — references `auth.users.id`
  - `email` (text, not null) — the admin's email address, for easy identification
  - `created_at` (timestamptz) — when the admin was added

## Security
- RLS enabled on `admins` table.
- Only authenticated users can read the admins table (needed to check if current user is admin).
- No inserts/updates/deletes via the anon key — admin management is done via SQL or Supabase dashboard.
*/

CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read the admins table (to check if they are an admin)
DROP POLICY IF EXISTS "authenticated_can_read_admins" ON admins;
CREATE POLICY "authenticated_can_read_admins"
ON admins FOR SELECT
TO authenticated USING (true);

-- No insert/update/delete policies — admin management is done via SQL or Supabase dashboard only
