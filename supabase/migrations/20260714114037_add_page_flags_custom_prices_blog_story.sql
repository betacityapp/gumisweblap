/*
# Add Page Flags, Custom Prices Table, and Blog Story Fields

## Summary
This migration extends the CMS with per-page review/comment toggles, layout variants,
per-page custom pricing support, and blog story-to-post AI fields.

## Changes

### 1. Modified Tables

**pages** — new columns:
- `show_reviews` (boolean, default false) — toggle to show Google reviews block on this page
- `show_comments` (boolean, default false) — toggle to show user comments block on this page
- `layout_variant` (text, default 'default') — controls AI-generated unique layout style
  Allowed values: 'default', 'city-focus', 'service-focus', 'comparison-focus', 'minimal'

**blog_posts** — new columns:
- `city` (text, nullable) — city tag for AI-generated story posts
- `story_prompt` (text, nullable) — original story/description used to generate this post
- `story_image_url` (text, nullable) — uploaded photo URL that inspired the story post

### 2. New Tables

**page_custom_prices** — per-page custom pricing rows
- `id` (uuid, PK)
- `page_id` (uuid, FK → pages.id ON DELETE CASCADE)
- `category` (text, not null) — price category label (e.g. "Személyautó szezonális gumicsere")
- `label` (text, not null) — row label (e.g. "15\"-ig")
- `price_from` (integer, nullable) — starting price in HUF
- `price_to` (integer, nullable) — ending price range in HUF
- `unit` (text, not null, default 'Ft/kerék') — price unit label
- `note` (text, nullable) — optional note
- `sort_order` (integer, default 0)
- `is_active` (boolean, default true)
- `created_at` (timestamptz, default now())

### 3. Security
- RLS enabled on `page_custom_prices`
- anon + authenticated CRUD policies (single-tenant app, no auth wall)

### 4. Indexes
- Index on `page_custom_prices(page_id)` for fast lookup by page
*/

-- Add new columns to pages table
ALTER TABLE pages
  ADD COLUMN IF NOT EXISTS show_reviews boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_comments boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS layout_variant text NOT NULL DEFAULT 'default';

-- Add new columns to blog_posts table
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS story_prompt text,
  ADD COLUMN IF NOT EXISTS story_image_url text;

-- Create page_custom_prices table
CREATE TABLE IF NOT EXISTS page_custom_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  category text NOT NULL,
  label text NOT NULL,
  price_from integer,
  price_to integer,
  unit text NOT NULL DEFAULT 'Ft/kerék',
  note text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_custom_prices_page_id ON page_custom_prices(page_id);

ALTER TABLE page_custom_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_page_custom_prices" ON page_custom_prices;
CREATE POLICY "anon_select_page_custom_prices" ON page_custom_prices FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_page_custom_prices" ON page_custom_prices;
CREATE POLICY "anon_insert_page_custom_prices" ON page_custom_prices FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_page_custom_prices" ON page_custom_prices;
CREATE POLICY "anon_update_page_custom_prices" ON page_custom_prices FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_page_custom_prices" ON page_custom_prices;
CREATE POLICY "anon_delete_page_custom_prices" ON page_custom_prices FOR DELETE
  TO anon, authenticated USING (true);
