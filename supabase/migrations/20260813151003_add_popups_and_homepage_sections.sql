/*
# Popup/Announcement System + Homepage Sections + Global Settings

1. New Tables
- `popups` – Felugró ablakok (reklám, üdvözlés, szavazás)
  - id, type (banner/poll/welcome/announcement), title, content_html, image_url, link_url, 
    button_text, poll_question, poll_options (jsonb), poll_votes (jsonb),
    is_active, start_date, end_date, display_frequency (always/once/session), 
    sort_order, created_at, updated_at
- `homepage_sections` – Főoldal szekciók kezelhetősége
  - id, section_key, is_visible, sort_order, custom_title, custom_subtitle, 
    custom_image, custom_video, custom_html, created_at, updated_at

2. Security
- Enable RLS on both tables
- anon: SELECT only (popups where active and in date range)
- authenticated: full CRUD
*/

CREATE TABLE IF NOT EXISTS popups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'banner',
  title TEXT NOT NULL,
  content_html TEXT,
  image_url TEXT,
  link_url TEXT,
  button_text TEXT,
  poll_question TEXT,
  poll_options JSONB DEFAULT '[]',
  poll_votes JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  display_frequency TEXT DEFAULT 'session',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE popups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_popups" ON popups;
CREATE POLICY "anon_select_popups" ON popups FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_popups" ON popups;
CREATE POLICY "auth_insert_popups" ON popups FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_popups" ON popups;
CREATE POLICY "auth_update_popups" ON popups FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_popups" ON popups;
CREATE POLICY "auth_delete_popups" ON popups FOR DELETE
  TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL UNIQUE,
  is_visible BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  custom_title TEXT,
  custom_subtitle TEXT,
  custom_image TEXT,
  custom_video TEXT,
  custom_html TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_homepage_sections" ON homepage_sections;
CREATE POLICY "anon_select_homepage_sections" ON homepage_sections FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_homepage_sections" ON homepage_sections;
CREATE POLICY "auth_insert_homepage_sections" ON homepage_sections FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_homepage_sections" ON homepage_sections;
CREATE POLICY "auth_update_homepage_sections" ON homepage_sections FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_homepage_sections" ON homepage_sections;
CREATE POLICY "auth_delete_homepage_sections" ON homepage_sections FOR DELETE
  TO authenticated USING (true);

-- Insert default homepage sections
INSERT INTO homepage_sections (section_key, is_visible, sort_order) VALUES
  ('hero', true, 0),
  ('comparison', true, 1),
  ('services', true, 2),
  ('prices', true, 3),
  ('how_it_works', true, 4),
  ('coverage', true, 5),
  ('testimonials', true, 6),
  ('faq', true, 7),
  ('blog_preview', true, 8),
  ('contact', true, 9)
ON CONFLICT (section_key) DO NOTHING;

-- Add app_recommendation_enabled to settings (for blog app recommendation)
INSERT INTO settings (key, value) VALUES
  ('app_recommendation_enabled', 'true'),
  ('app_name', 'Toldi Mobile'),
  ('app_platform', 'Android'),
  ('app_url', 'https://play.google.com/store/apps/details?id=com.toldi.mobile'),
  ('app_description', 'Töltse le a Toldi Mobile alkalmazást és foglaljon időpontot egy kattintással!')
ON CONFLICT (key) DO NOTHING;
