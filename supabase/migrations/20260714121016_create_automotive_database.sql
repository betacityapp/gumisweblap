/*
# Create Automotive Reference Database

## Summary
Creates a comprehensive automotive reference database for tire sizes and AC refrigerant specs.
Used by three public tools: tire size finder, AC database, and reverse tire lookup.

## New Tables

### cars_makes
- `id` uuid PK
- `name` text (e.g. "BMW", "Volkswagen")
- `slug` text (e.g. "bmw", "volkswagen") — URL-safe identifier
- `logo_text` text (2-3 char abbreviation for display)
- `sort_order` integer
- `created_at`, `updated_at` timestamptz

### cars_models
- `id` uuid PK
- `make_id` uuid FK → cars_makes
- `name` text (e.g. "3 Series", "Golf")
- `slug` text
- `sort_order` integer
- `created_at` timestamptz

### cars_generations
- `id` uuid PK
- `model_id` uuid FK → cars_models
- `code` text NULLABLE — BMW chassis code e.g. "E30", "E36"; null for others
- `name` text — full display name e.g. "3-as sorozat E30 (1982–1991)"
- `years_start` integer
- `years_end` integer NULLABLE (null = current production)
- `sort_order` integer
- `created_at` timestamptz

### cars_variants
- `id` uuid PK
- `generation_id` uuid FK → cars_generations
- `name` text — engine/trim name e.g. "318i", "320d xDrive"
- `engine_code` text NULLABLE
- `fuel_type` text — 'benzin','diesel','elektromos','hibrid','lpg'
- `power_hp` integer NULLABLE
- `sort_order` integer
- `created_at` timestamptz

### tire_specs
- `id` uuid PK
- `variant_id` uuid FK → cars_variants
- `position` text — 'front','rear','universal'
- `width` integer — e.g. 205
- `aspect_ratio` integer — e.g. 55
- `rim_diameter` integer — e.g. 16
- `load_index` text NULLABLE — e.g. "91"
- `speed_index` text NULLABLE — e.g. "W"
- `tire_type` text — 'standard','reinforced','run_flat'
- `notes` text NULLABLE
- `sort_order` integer
- `created_at` timestamptz

### ac_specs
- `id` uuid PK
- `variant_id` uuid FK → cars_variants
- `refrigerant_type` text — 'R134a','R1234yf','R12'
- `refrigerant_amount_g` integer — grams
- `oil_type` text NULLABLE — e.g. "PAG 46","PAG 100","POE 46"
- `oil_amount_ml` integer NULLABLE
- `needs_manual_check` boolean DEFAULT false — true when year range spans both refrigerant types
- `notes` text NULLABLE
- `created_at` timestamptz

### api_rate_limits
- `id` uuid PK
- `ip_hash` text NOT NULL — SHA256 hash of client IP (GDPR compliant)
- `endpoint` text NOT NULL
- `request_count` integer DEFAULT 1
- `window_start` timestamptz DEFAULT now()
- `created_at` timestamptz DEFAULT now()

## Security
- Public tables (cars_*): anon + authenticated SELECT only (read-only public database)
- Writes only via service_role (admin/import scripts)
- api_rate_limits: anon INSERT + UPDATE (needed for rate tracking), no DELETE/SELECT for anon
- Indexes on all FK columns and rate_limit lookup columns

## Notes
- This is a read-only public database — anon users can SELECT but not modify
- Rate limit window is 1 hour (100 requests per IP per endpoint)
- Generation code column enables BMW E30/E36/E46 style display
*/

-- ─── Makes ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cars_makes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_text text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cars_makes_slug ON cars_makes(slug);
CREATE INDEX IF NOT EXISTS idx_cars_makes_sort ON cars_makes(sort_order);

ALTER TABLE cars_makes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_makes" ON cars_makes;
CREATE POLICY "public_select_makes" ON cars_makes FOR SELECT
  TO anon, authenticated USING (true);

-- ─── Models ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cars_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  make_id uuid NOT NULL REFERENCES cars_makes(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cars_models_make ON cars_models(make_id);
CREATE INDEX IF NOT EXISTS idx_cars_models_slug ON cars_models(make_id, slug);

ALTER TABLE cars_models ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_models" ON cars_models;
CREATE POLICY "public_select_models" ON cars_models FOR SELECT
  TO anon, authenticated USING (true);

-- ─── Generations ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cars_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid NOT NULL REFERENCES cars_models(id) ON DELETE CASCADE,
  code text,
  name text NOT NULL,
  years_start integer,
  years_end integer,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cars_gen_model ON cars_generations(model_id);

ALTER TABLE cars_generations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_generations" ON cars_generations;
CREATE POLICY "public_select_generations" ON cars_generations FOR SELECT
  TO anon, authenticated USING (true);

-- ─── Variants ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cars_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id uuid NOT NULL REFERENCES cars_generations(id) ON DELETE CASCADE,
  name text NOT NULL,
  engine_code text,
  fuel_type text NOT NULL DEFAULT 'benzin',
  power_hp integer,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cars_variants_gen ON cars_variants(generation_id);

ALTER TABLE cars_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_variants" ON cars_variants;
CREATE POLICY "public_select_variants" ON cars_variants FOR SELECT
  TO anon, authenticated USING (true);

-- ─── Tire Specs ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tire_specs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL REFERENCES cars_variants(id) ON DELETE CASCADE,
  position text NOT NULL DEFAULT 'universal',
  width integer NOT NULL,
  aspect_ratio integer NOT NULL,
  rim_diameter integer NOT NULL,
  load_index text,
  speed_index text,
  tire_type text NOT NULL DEFAULT 'standard',
  notes text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tire_specs_variant ON tire_specs(variant_id);
CREATE INDEX IF NOT EXISTS idx_tire_specs_size ON tire_specs(width, aspect_ratio, rim_diameter);

ALTER TABLE tire_specs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_tire_specs" ON tire_specs;
CREATE POLICY "public_select_tire_specs" ON tire_specs FOR SELECT
  TO anon, authenticated USING (true);

-- ─── AC Specs ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ac_specs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL REFERENCES cars_variants(id) ON DELETE CASCADE,
  refrigerant_type text NOT NULL DEFAULT 'R134a',
  refrigerant_amount_g integer,
  oil_type text,
  oil_amount_ml integer,
  needs_manual_check boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ac_specs_variant ON ac_specs(variant_id);

ALTER TABLE ac_specs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_ac_specs" ON ac_specs;
CREATE POLICY "public_select_ac_specs" ON ac_specs FOR SELECT
  TO anon, authenticated USING (true);

-- ─── Rate Limits ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text NOT NULL,
  endpoint text NOT NULL DEFAULT '/api/cars',
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limits_ip_endpoint ON api_rate_limits(ip_hash, endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON api_rate_limits(window_start);

ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_rate_limits" ON api_rate_limits;
CREATE POLICY "anon_insert_rate_limits" ON api_rate_limits FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_rate_limits" ON api_rate_limits;
CREATE POLICY "anon_update_rate_limits" ON api_rate_limits FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
