-- Add lang column to pages (default 'hu', backward compatible)
ALTER TABLE pages ADD COLUMN IF NOT EXISTS lang text NOT NULL DEFAULT 'hu';

-- Add lang column to blog_posts
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS lang text NOT NULL DEFAULT 'hu';

-- Contact form submissions (for the new contact form feature)
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  message text NOT NULL,
  service text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_insert_contact" ON contact_submissions;
CREATE POLICY "anon_insert_contact" ON contact_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_select_contact" ON contact_submissions;
CREATE POLICY "anon_select_contact" ON contact_submissions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_update_contact" ON contact_submissions;
CREATE POLICY "anon_update_contact" ON contact_submissions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_contact" ON contact_submissions;
CREATE POLICY "anon_delete_contact" ON contact_submissions FOR DELETE TO anon, authenticated USING (true);

-- Create indexes for lang column queries
CREATE INDEX IF NOT EXISTS idx_pages_lang ON pages(lang);
CREATE INDEX IF NOT EXISTS idx_pages_slug_lang ON pages(slug, lang);
CREATE INDEX IF NOT EXISTS idx_blog_posts_lang ON blog_posts(lang);

-- Update the unique constraint on pages to be per (slug, lang)
-- First drop the existing unique constraint on slug
ALTER TABLE pages DROP CONSTRAINT IF EXISTS pages_slug_key;
-- Add new composite unique constraint
ALTER TABLE pages ADD CONSTRAINT pages_slug_lang_unique UNIQUE (slug, lang);

-- Update blog_posts uniqueness
ALTER TABLE blog_posts DROP CONSTRAINT IF EXISTS blog_posts_slug_key;
ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_slug_lang_unique UNIQUE (slug, lang);
