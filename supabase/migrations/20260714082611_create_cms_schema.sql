/*
# Toldi Mobil Gumi CMS – Schema

1. New Tables
  - `settings` – key/value site configuration (admin password, phone, email, etc.)
  - `navigation_items` – hierarchical nav menu items with parent/child support
  - `pages` – CMS pages with hero, HTML content, configurable sections, SEO fields
  - `blog_posts` – blog articles with HTML content, tags, SEO fields
  - `testimonials` – customer reviews
  - `faq_items` – FAQ accordion items
  - `price_items` – categorised pricing table rows
  - `services` – service cards shown in services section
  - `ai_configs` – stored AI API configurations (provider, key, model)

2. Security
  - RLS enabled on all tables
  - All policies use TO anon, authenticated (no sign-in required – single-tenant CMS)
  - Full CRUD granted via anon key so the public Next.js frontend can read/write

3. Notes
  - All CREATE TABLE statements are idempotent (IF NOT EXISTS)
  - Policies are dropped before recreating to stay idempotent
*/

-- ─── settings ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_settings" ON settings;
CREATE POLICY "anon_select_settings" ON settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_settings" ON settings;
CREATE POLICY "anon_insert_settings" ON settings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_settings" ON settings;
CREATE POLICY "anon_update_settings" ON settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_settings" ON settings;
CREATE POLICY "anon_delete_settings" ON settings FOR DELETE TO anon, authenticated USING (true);

-- ─── navigation_items ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS navigation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  url text NOT NULL,
  parent_id uuid REFERENCES navigation_items(id) ON DELETE CASCADE,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  target text DEFAULT '_self',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE navigation_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_navigation_items" ON navigation_items;
CREATE POLICY "anon_select_navigation_items" ON navigation_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_navigation_items" ON navigation_items;
CREATE POLICY "anon_insert_navigation_items" ON navigation_items FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_navigation_items" ON navigation_items;
CREATE POLICY "anon_update_navigation_items" ON navigation_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_navigation_items" ON navigation_items;
CREATE POLICY "anon_delete_navigation_items" ON navigation_items FOR DELETE TO anon, authenticated USING (true);

-- ─── pages ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  meta_title text,
  meta_description text,
  meta_keywords text,
  hero_title text,
  hero_subtitle text,
  hero_image text,
  content_html text DEFAULT '',
  page_sections jsonb DEFAULT '["hero","services","prices","how_it_works","testimonials","faq","contact"]'::jsonb,
  city text,
  is_city_page boolean DEFAULT false,
  is_published boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_pages" ON pages;
CREATE POLICY "anon_select_pages" ON pages FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_pages" ON pages;
CREATE POLICY "anon_insert_pages" ON pages FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_pages" ON pages;
CREATE POLICY "anon_update_pages" ON pages FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_pages" ON pages;
CREATE POLICY "anon_delete_pages" ON pages FOR DELETE TO anon, authenticated USING (true);

-- ─── blog_posts ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  content_html text DEFAULT '',
  featured_image text,
  tags text[] DEFAULT '{}',
  meta_title text,
  meta_description text,
  author text DEFAULT 'Toldi Mobil Gumi',
  is_published boolean DEFAULT true,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_blog_posts" ON blog_posts;
CREATE POLICY "anon_select_blog_posts" ON blog_posts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_blog_posts" ON blog_posts;
CREATE POLICY "anon_insert_blog_posts" ON blog_posts FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_blog_posts" ON blog_posts;
CREATE POLICY "anon_update_blog_posts" ON blog_posts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_blog_posts" ON blog_posts;
CREATE POLICY "anon_delete_blog_posts" ON blog_posts FOR DELETE TO anon, authenticated USING (true);

-- ─── testimonials ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  text text NOT NULL,
  rating integer DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  date text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_testimonials" ON testimonials;
CREATE POLICY "anon_select_testimonials" ON testimonials FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_testimonials" ON testimonials;
CREATE POLICY "anon_insert_testimonials" ON testimonials FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_testimonials" ON testimonials;
CREATE POLICY "anon_update_testimonials" ON testimonials FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_testimonials" ON testimonials;
CREATE POLICY "anon_delete_testimonials" ON testimonials FOR DELETE TO anon, authenticated USING (true);

-- ─── faq_items ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_faq_items" ON faq_items;
CREATE POLICY "anon_select_faq_items" ON faq_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_faq_items" ON faq_items;
CREATE POLICY "anon_insert_faq_items" ON faq_items FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_faq_items" ON faq_items;
CREATE POLICY "anon_update_faq_items" ON faq_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_faq_items" ON faq_items;
CREATE POLICY "anon_delete_faq_items" ON faq_items FOR DELETE TO anon, authenticated USING (true);

-- ─── price_items ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS price_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  label text NOT NULL,
  price_from integer,
  price_to integer,
  unit text DEFAULT 'Ft/kerék',
  note text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE price_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_price_items" ON price_items;
CREATE POLICY "anon_select_price_items" ON price_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_price_items" ON price_items;
CREATE POLICY "anon_insert_price_items" ON price_items FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_price_items" ON price_items;
CREATE POLICY "anon_update_price_items" ON price_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_price_items" ON price_items;
CREATE POLICY "anon_delete_price_items" ON price_items FOR DELETE TO anon, authenticated USING (true);

-- ─── services ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  icon text DEFAULT 'wrench',
  badge text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_services" ON services;
CREATE POLICY "anon_select_services" ON services FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_services" ON services;
CREATE POLICY "anon_insert_services" ON services FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_services" ON services;
CREATE POLICY "anon_update_services" ON services FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_services" ON services;
CREATE POLICY "anon_delete_services" ON services FOR DELETE TO anon, authenticated USING (true);

-- ─── ai_configs ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  provider text NOT NULL DEFAULT 'openai',
  api_key text NOT NULL,
  model text DEFAULT 'gpt-4o',
  base_url text,
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE ai_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_ai_configs" ON ai_configs;
CREATE POLICY "anon_select_ai_configs" ON ai_configs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_ai_configs" ON ai_configs;
CREATE POLICY "anon_insert_ai_configs" ON ai_configs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_ai_configs" ON ai_configs;
CREATE POLICY "anon_update_ai_configs" ON ai_configs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_ai_configs" ON ai_configs;
CREATE POLICY "anon_delete_ai_configs" ON ai_configs FOR DELETE TO anon, authenticated USING (true);
