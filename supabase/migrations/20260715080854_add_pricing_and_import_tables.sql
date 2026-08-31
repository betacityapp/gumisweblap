-- ════════════════════════════════════════════════════════════════════════════
-- AC Pricing Settings + Extra Services + Tire Shop Configs + Tire Size Database
-- ════════════════════════════════════════════════════════════════════════════

-- ─── AC Pricing Settings ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ac_pricing_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  refrigerant_r134a_price_per_gram NUMERIC NOT NULL DEFAULT 15,
  refrigerant_r1234yf_price_per_gram NUMERIC NOT NULL DEFAULT 80,
  labor_cost_car NUMERIC NOT NULL DEFAULT 8000,
  labor_cost_van NUMERIC NOT NULL DEFAULT 12000,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO ac_pricing_settings (id) VALUES ('default')
  ON CONFLICT (id) DO NOTHING;

ALTER TABLE ac_pricing_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_ac_pricing" ON ac_pricing_settings;
CREATE POLICY "anon_select_ac_pricing" ON ac_pricing_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_ac_pricing" ON ac_pricing_settings;
CREATE POLICY "auth_update_ac_pricing" ON ac_pricing_settings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ─── AC Extra Services ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ac_extra_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  applies_to TEXT NOT NULL DEFAULT 'both',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ac_extra_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_ac_extras" ON ac_extra_services;
CREATE POLICY "anon_select_ac_extras" ON ac_extra_services FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_ac_extras" ON ac_extra_services;
CREATE POLICY "auth_insert_ac_extras" ON ac_extra_services FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_ac_extras" ON ac_extra_services;
CREATE POLICY "auth_update_ac_extras" ON ac_extra_services FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_ac_extras" ON ac_extra_services;
CREATE POLICY "auth_delete_ac_extras" ON ac_extra_services FOR DELETE
  TO authenticated USING (true);

-- ─── Tire Shop Configs ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tire_shop_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url_template TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  open_in_new_tab BOOLEAN NOT NULL DEFAULT true,
  button_label TEXT NOT NULL DEFAULT 'Webshop',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tire_shop_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_tire_shop" ON tire_shop_configs;
CREATE POLICY "anon_select_tire_shop" ON tire_shop_configs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_tire_shop" ON tire_shop_configs;
CREATE POLICY "auth_insert_tire_shop" ON tire_shop_configs FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_tire_shop" ON tire_shop_configs;
CREATE POLICY "auth_update_tire_shop" ON tire_shop_configs FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_tire_shop" ON tire_shop_configs;
CREATE POLICY "auth_delete_tire_shop" ON tire_shop_configs FOR DELETE
  TO authenticated USING (true);

-- ─── Tire Size Database (real-world tire sizes) ──────────────────────────────
CREATE TABLE IF NOT EXISTS tire_size_database (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  width INTEGER NOT NULL,
  aspect_ratio INTEGER NOT NULL,
  rim_diameter INTEGER NOT NULL,
  is_common BOOLEAN NOT NULL DEFAULT false,
  category TEXT NOT NULL DEFAULT 'passenger',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (width, aspect_ratio, rim_diameter)
);

ALTER TABLE tire_size_database ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_tire_sizes_db" ON tire_size_database;
CREATE POLICY "anon_select_tire_sizes_db" ON tire_size_database FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_tire_sizes_db" ON tire_size_database;
CREATE POLICY "auth_insert_tire_sizes_db" ON tire_size_database FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_tire_sizes_db" ON tire_size_database;
CREATE POLICY "auth_delete_tire_sizes_db" ON tire_size_database FOR DELETE
  TO authenticated USING (true);

-- Seed common real-world tire sizes
INSERT INTO tire_size_database (width, aspect_ratio, rim_diameter, is_common, category) VALUES
-- 13"
(145, 70, 13, true, 'passenger'), (155, 70, 13, true, 'passenger'), (165, 70, 13, true, 'passenger'),
(175, 70, 13, true, 'passenger'), (185, 70, 13, true, 'passenger'),
-- 14"
(165, 65, 14, true, 'passenger'), (175, 65, 14, true, 'passenger'), (185, 65, 14, true, 'passenger'),
(185, 60, 14, true, 'passenger'), (195, 65, 14, true, 'passenger'), (205, 60, 14, true, 'passenger'),
-- 15"
(185, 55, 15, true, 'passenger'), (185, 60, 15, true, 'passenger'), (195, 50, 15, true, 'passenger'),
(195, 55, 15, true, 'passenger'), (195, 60, 15, true, 'passenger'), (195, 65, 15, true, 'passenger'),
(205, 50, 15, true, 'passenger'), (205, 55, 15, true, 'passenger'), (205, 60, 15, true, 'passenger'),
(205, 65, 15, true, 'passenger'), (215, 60, 15, true, 'passenger'), (225, 45, 15, true, 'passenger'),
(225, 50, 15, true, 'passenger'),
-- 16"
(195, 50, 16, true, 'passenger'), (195, 55, 16, true, 'passenger'), (205, 45, 16, true, 'passenger'),
(205, 50, 16, true, 'passenger'), (205, 55, 16, true, 'passenger'), (215, 45, 16, true, 'passenger'),
(215, 55, 16, true, 'passenger'), (215, 60, 16, true, 'passenger'), (215, 65, 16, true, 'passenger'),
(225, 45, 16, true, 'passenger'), (225, 50, 16, true, 'passenger'), (225, 55, 16, true, 'passenger'),
(235, 50, 16, true, 'passenger'), (245, 45, 16, true, 'passenger'),
-- 17"
(205, 40, 17, true, 'passenger'), (205, 45, 17, true, 'passenger'), (205, 50, 17, true, 'passenger'),
(215, 40, 17, true, 'passenger'), (215, 45, 17, true, 'passenger'), (215, 50, 17, true, 'passenger'),
(215, 55, 17, true, 'passenger'), (225, 35, 17, true, 'passenger'), (225, 40, 17, true, 'passenger'),
(225, 45, 17, true, 'passenger'), (225, 50, 17, true, 'passenger'), (225, 55, 17, true, 'passenger'),
(235, 40, 17, true, 'passenger'), (235, 45, 17, true, 'passenger'), (235, 50, 17, true, 'passenger'),
(245, 40, 17, true, 'passenger'), (245, 45, 17, true, 'passenger'), (255, 40, 17, true, 'passenger'),
-- 18"
(215, 35, 18, true, 'passenger'), (225, 40, 18, true, 'passenger'), (225, 45, 18, true, 'passenger'),
(235, 40, 18, true, 'passenger'), (235, 45, 18, true, 'passenger'), (235, 50, 18, true, 'passenger'),
(245, 35, 18, true, 'passenger'), (245, 40, 18, true, 'passenger'), (245, 45, 18, true, 'passenger'),
(255, 35, 18, true, 'passenger'), (255, 40, 18, true, 'passenger'), (255, 45, 18, true, 'passenger'),
(265, 35, 18, true, 'passenger'), (265, 40, 18, true, 'passenger'), (275, 35, 18, true, 'passenger'),
-- 19"
(225, 35, 19, true, 'passenger'), (225, 40, 19, true, 'passenger'), (235, 35, 19, true, 'passenger'),
(235, 40, 19, true, 'passenger'), (245, 35, 19, true, 'passenger'), (245, 40, 19, true, 'passenger'),
(255, 35, 19, true, 'passenger'), (255, 40, 19, true, 'passenger'), (265, 30, 19, true, 'passenger'),
(265, 35, 19, true, 'passenger'), (275, 30, 19, true, 'passenger'), (275, 35, 19, true, 'passenger'),
-- 20"
(245, 35, 20, true, 'passenger'), (245, 40, 20, true, 'passenger'), (255, 35, 20, true, 'passenger'),
(255, 40, 20, true, 'passenger'), (265, 35, 20, true, 'passenger'), (275, 30, 20, true, 'passenger'),
(275, 35, 20, true, 'passenger'), (285, 30, 20, true, 'passenger'), (285, 35, 20, true, 'passenger'),
-- 21"
(255, 35, 21, true, 'passenger'), (265, 35, 21, true, 'passenger'), (275, 30, 21, true, 'passenger'),
(285, 30, 21, true, 'passenger'), (285, 35, 21, true, 'passenger'),
-- 22"
(265, 35, 22, true, 'passenger'), (275, 35, 22, true, 'passenger'), (285, 30, 22, true, 'passenger'),
(295, 30, 22, true, 'passenger'),
-- Van/SUV sizes
(195, 70, 15, true, 'van'), (205, 65, 15, true, 'van'), (215, 65, 16, true, 'van'),
(225, 65, 16, true, 'van'), (235, 65, 16, true, 'van'), (195, 75, 16, true, 'van'),
(205, 75, 16, true, 'van'), (215, 75, 16, true, 'van'), (225, 75, 16, true, 'van'),
(235, 60, 17, true, 'van'), (255, 60, 17, true, 'van'), (265, 60, 18, true, 'van')
ON CONFLICT (width, aspect_ratio, rim_diameter) DO NOTHING;

-- ─── Insert RLS policies for automotive tables (for admin import) ────────────
DROP POLICY IF EXISTS "auth_insert_makes" ON cars_makes;
CREATE POLICY "auth_insert_makes" ON cars_makes FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_makes" ON cars_makes;
CREATE POLICY "auth_update_makes" ON cars_makes FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_makes" ON cars_makes;
CREATE POLICY "auth_delete_makes" ON cars_makes FOR DELETE
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_models" ON cars_models;
CREATE POLICY "auth_insert_models" ON cars_models FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_models" ON cars_models;
CREATE POLICY "auth_update_models" ON cars_models FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_models" ON cars_models;
CREATE POLICY "auth_delete_models" ON cars_models FOR DELETE
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_generations" ON cars_generations;
CREATE POLICY "auth_insert_generations" ON cars_generations FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_generations" ON cars_generations;
CREATE POLICY "auth_update_generations" ON cars_generations FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_generations" ON cars_generations;
CREATE POLICY "auth_delete_generations" ON cars_generations FOR DELETE
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_variants" ON cars_variants;
CREATE POLICY "auth_insert_variants" ON cars_variants FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_variants" ON cars_variants;
CREATE POLICY "auth_update_variants" ON cars_variants FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_variants" ON cars_variants;
CREATE POLICY "auth_delete_variants" ON cars_variants FOR DELETE
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_tire_specs" ON tire_specs;
CREATE POLICY "auth_insert_tire_specs" ON tire_specs FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_tire_specs" ON tire_specs;
CREATE POLICY "auth_update_tire_specs" ON tire_specs FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_tire_specs" ON tire_specs;
CREATE POLICY "auth_delete_tire_specs" ON tire_specs FOR DELETE
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_ac_specs" ON ac_specs;
CREATE POLICY "auth_insert_ac_specs" ON ac_specs FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_ac_specs" ON ac_specs;
CREATE POLICY "auth_update_ac_specs" ON ac_specs FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_ac_specs" ON ac_specs;
CREATE POLICY "auth_delete_ac_specs" ON ac_specs FOR DELETE
  TO authenticated USING (true);

-- ─── Index for tire size lookups ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tire_size_db_lookup ON tire_size_database (width, aspect_ratio, rim_diameter);
CREATE INDEX IF NOT EXISTS idx_ac_extras_active ON ac_extra_services (is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_tire_shop_active ON tire_shop_configs (is_enabled, sort_order);
