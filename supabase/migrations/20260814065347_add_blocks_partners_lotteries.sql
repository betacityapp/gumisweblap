/*
# Content Blocks + Partners + Lotteries + Settings

1. New Tables
- `page_blocks` – Szerkeszthető blokkok oldalakhoz és blogokhoz
  - id, parent_type ('page'|'blog'), parent_id, block_type, block_data (jsonb), sort_order, is_active, created_at
- `partners` – Partnerek adatai
  - id, name, logo_url, link_url, description, is_active, sort_order, created_at
- `lotteries` – Lottók / sorsolások
  - id, title, description_html, prize, image_url, start_date, end_date, is_active, winner_name, created_at
- `lottery_entries` – Lottó jelentkezők
  - id, lottery_id, name, email, phone, created_at

2. Modified Tables
- `pages` – add partner_id, partner_badge_text columns
- `blog_posts` – add partner_id, partner_badge_text columns

3. Settings additions
- custom_cursor_enabled, animations_enabled, og_default_image, lottery_enabled

4. Security
- RLS on all new tables
- anon: SELECT on page_blocks, partners, lotteries; INSERT on lottery_entries
- authenticated: full CRUD
*/

-- ─── page_blocks ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS page_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_type TEXT NOT NULL DEFAULT 'page',
  parent_id UUID NOT NULL,
  block_type TEXT NOT NULL DEFAULT 'text',
  block_data JSONB DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE page_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_page_blocks" ON page_blocks;
CREATE POLICY "anon_select_page_blocks" ON page_blocks FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_page_blocks" ON page_blocks;
CREATE POLICY "auth_insert_page_blocks" ON page_blocks FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_page_blocks" ON page_blocks;
CREATE POLICY "auth_update_page_blocks" ON page_blocks FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_page_blocks" ON page_blocks;
CREATE POLICY "auth_delete_page_blocks" ON page_blocks FOR DELETE
  TO authenticated USING (true);

-- ─── partners ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  link_url TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_partners" ON partners;
CREATE POLICY "anon_select_partners" ON partners FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_partners" ON partners;
CREATE POLICY "auth_insert_partners" ON partners FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_partners" ON partners;
CREATE POLICY "auth_update_partners" ON partners FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_partners" ON partners;
CREATE POLICY "auth_delete_partners" ON partners FOR DELETE
  TO authenticated USING (true);

-- ─── lotteries ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lotteries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description_html TEXT,
  prize TEXT,
  image_url TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  winner_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE lotteries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_lotteries" ON lotteries;
CREATE POLICY "anon_select_lotteries" ON lotteries FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_lotteries" ON lotteries;
CREATE POLICY "auth_insert_lotteries" ON lotteries FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_lotteries" ON lotteries;
CREATE POLICY "auth_update_lotteries" ON lotteries FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_lotteries" ON lotteries;
CREATE POLICY "auth_delete_lotteries" ON lotteries FOR DELETE
  TO authenticated USING (true);

-- ─── lottery_entries ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lottery_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lottery_id UUID NOT NULL REFERENCES lotteries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE lottery_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_lottery_entries" ON lottery_entries;
CREATE POLICY "anon_select_lottery_entries" ON lottery_entries FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_lottery_entries" ON lottery_entries;
CREATE POLICY "anon_insert_lottery_entries" ON lottery_entries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_lottery_entries" ON lottery_entries;
CREATE POLICY "auth_update_lottery_entries" ON lottery_entries FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_lottery_entries" ON lottery_entries;
CREATE POLICY "auth_delete_lottery_entries" ON lottery_entries FOR DELETE
  TO authenticated USING (true);

-- ─── Add partner columns to pages and blog_posts ─────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pages' AND column_name = 'partner_id') THEN
    ALTER TABLE pages ADD COLUMN partner_id UUID;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pages' AND column_name = 'partner_badge_text') THEN
    ALTER TABLE pages ADD COLUMN partner_badge_text TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name = 'partner_id') THEN
    ALTER TABLE blog_posts ADD COLUMN partner_id UUID;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name = 'partner_badge_text') THEN
    ALTER TABLE blog_posts ADD COLUMN partner_badge_text TEXT;
  END IF;
END $$;

-- ─── Settings ─────────────────────────────────────────────────────────────────
INSERT INTO settings (key, value) VALUES
  ('custom_cursor_enabled', 'false'),
  ('animations_enabled', 'true'),
  ('og_default_image', ''),
  ('lottery_enabled', 'false'),
  ('towing_partner_name', 'Bakos Autómentés'),
  ('towing_partner_url', 'https://bakosautomentes.hu/'),
  ('towing_partner_logo', 'https://bakosautomentes.hu/wp-content/uploads/2024/01/logo.png')
ON CONFLICT (key) DO NOTHING;
