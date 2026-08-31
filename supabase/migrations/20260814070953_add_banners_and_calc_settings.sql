/*
# Announcement Banner System + Price Calculator Settings

1. New Tables
- `announcement_banners` – Futó/ugró szalag a weblap tetején
  - id, text, link_url, bg_color, text_color, animation (none/scroll/bounce/pulse), 
    start_date, end_date, is_active, sort_order, created_at

2. Settings additions (price calculator)
- calc_discount_enabled, calc_discount_threshold, calc_discount_percent,
  calc_base_price_13, calc_base_price_14, calc_base_price_15, calc_base_price_16,
  calc_base_price_17, calc_base_price_18, calc_base_price_19, calc_base_price_20_plus

3. Security
- RLS on announcement_banners
- anon: SELECT; authenticated: full CRUD
*/

CREATE TABLE IF NOT EXISTS announcement_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  link_url TEXT,
  bg_color TEXT DEFAULT '#dc2626',
  text_color TEXT DEFAULT '#ffffff',
  animation TEXT DEFAULT 'none',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE announcement_banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_banners" ON announcement_banners;
CREATE POLICY "anon_select_banners" ON announcement_banners FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_banners" ON announcement_banners;
CREATE POLICY "auth_insert_banners" ON announcement_banners FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_banners" ON announcement_banners;
CREATE POLICY "auth_update_banners" ON announcement_banners FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_banners" ON announcement_banners;
CREATE POLICY "auth_delete_banners" ON announcement_banners FOR DELETE
  TO authenticated USING (true);

INSERT INTO settings (key, value) VALUES
  ('calc_discount_enabled', 'false'),
  ('calc_discount_threshold', '3'),
  ('calc_discount_percent', '10'),
  ('calc_base_price_13', '8000'),
  ('calc_base_price_14', '8000'),
  ('calc_base_price_15', '9000'),
  ('calc_base_price_16', '9000'),
  ('calc_base_price_17', '10000'),
  ('calc_base_price_18', '11000'),
  ('calc_base_price_19', '12000'),
  ('calc_base_price_20_plus', '14000')
ON CONFLICT (key) DO NOTHING;
