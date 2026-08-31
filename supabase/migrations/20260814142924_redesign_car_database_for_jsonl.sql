/*
# Redesign car database for JSONL import format

## Overview
The original car database had 6 tables (cars_makes, cars_models, cars_generations, cars_variants, tire_specs, ac_specs)
with English column names and a normalized structure. The new JSONL data file has 79 Hungarian-named columns
per row, with tire sizes embedded as a nested JSON array. This migration:

1. Adds all missing columns to cars_variants (the main table that now holds all vehicle data)
2. Adds new columns to cars_generations for production date text
3. Adds new columns to tire_specs for XL, C-rating, run-flat, axle, motor source
4. Adds new columns to ac_specs for min/max amounts, oil service, source model, verification status, original refrigerant, notes
5. Adds unique constraints to prevent duplicates on re-import (upsert support)
6. Adds indexes for faster searching

## Changes by table:

### cars_makes
- No changes (already has name, slug, sort_order)

### cars_models
- No changes (already has make_id, name, slug, sort_order)

### cars_generations
- Add: production_start_text (text) — e.g. "1992 év" or "2023. február"
- Add: production_end_text (text) — e.g. "1998 év" or "2024. november"
- Add: production_start_month (int) — month number 1-12
- Add: production_end_month (int) — month number 1-12
- Add unique constraint on (model_id, code) to support upsert

### cars_variants — now stores ALL vehicle technical data (79 columns from JSONL)
New columns for vehicle specifications:
- kivitel (text) — variant name e.g. "3.0 V6 (184 Hp)"
- hajtaslanc (text) — powertrain type e.g. "Belső égésű motor"
- karosszeria (text) — body type e.g. "Szedán"
- uzemanyag (text) — fuel type e.g. "Benzin"
- meghajtas (text) — drive type e.g. "Elsőkerék-hajtás"
- akku_technologia (text) — battery technology (EV only)
- akku_helye (text) — battery location (EV only)
- kormanymu (text) — steering gear type
- szervokormany (text) — power steering type
- elso_futomu (text) — front suspension
- hatso_futomu (text) — rear suspension
- elso_fek (text) — front brake type
- hatso_fek (text) — rear brake type
- sebessegvalto (text) — gearbox type
- hajtasrendszer_leiras (text) — drivetrain description
- ulesek_szama (int) — number of seats
- ajtok_szama (int) — number of doors
- felnimeret (text) — rim sizes e.g. "17; 18"
- sulyerohoz_arany (text) — power-to-weight ratio
- hosszusag_mm (int) — length
- szelesseg_mm (int) — width
- magassag_mm (int) — height
- tengelytav_mm (int) — wheelbase
- elso_nyomtav_mm (int) — front track
- hatso_nyomtav_mm (int) — rear track
- elso_tullogas_mm (int) — front overhang
- hatso_tullogas_mm (int) — rear overhang
- hasmagassag_mm (int) — ground clearance
- sajattomeg_kg (int) — curb weight
- megengedett_ossztomeg_kg (int) — gross vehicle weight
- hasznos_teher_kg (int) — payload
- csomagter_min_l (int) — min trunk capacity
- csomagter_max_l (int) — max trunk capacity
- vegsebesseg_kmh (int) — top speed
- gyorsulas_0_100_s (numeric) — 0-100 acceleration
- nyomatek_nm (int) — torque
- teljesitmeny_hp (int) — power in HP
- akku_kapacitas_kwh (numeric) — battery capacity (EV)
- fogyasztas_varosi_l100km (numeric) — city consumption
- fogyasztas_orszaguti_l100km (numeric) — highway consumption
- fogyasztas_vegyes_l100km (numeric) — combined consumption
- energiafogyasztas_wltp_kwh100km (numeric) — EV energy consumption
- elektromos_hatotav_wltp_km (int) — EV range WLTP
- elektromos_hatotav_nedc_km (int) — EV range NEDC
- hengerek_szama (int) — cylinder count
- szelepek_per_henger (int) — valves per cylinder
- loketterfogat_cm3 (numeric) — engine displacement
- furat_mm (numeric) — bore
- loket_mm (numeric) — stroke
- surites_arany (numeric) — compression ratio
- motor_szivas (text) — engine aspiration
- befecskendezes (text) — injection type
- karosanyag_norma (text) — emissions standard
- motorolaj_mennyiseg_l (numeric) — oil capacity
- vontathato_fekes_kg (int) — braked towing capacity
- vontathato_fek_nelkul_kg (int) — unbraked towing capacity
- fajlagos_teljesitmeny_hp_l (numeric) — specific power
- gumi_forras_generacio (text) — tire source generation reference
- Add unique constraint on (generation_id, name) for upsert

### tire_specs — enhanced for JSONL tire data
- Add: is_xl (boolean) — XL (extra load) flag
- Add: is_c (boolean) — C (commercial) flag
- Add: is_run_flat (boolean) — run-flat tire flag
- Add: motor_source (text) — which engine variant this tire fits e.g. "Minden kivitel"
- Add: raw_size (text) — original tire size string e.g. "235/60 R18"
- Add unique constraint on (variant_id, raw_size, motor_source) for upsert/dedup

### ac_specs — enhanced for JSONL AC data
- Add: refrigerant_amount_min_g (int) — minimum refrigerant amount
- Add: refrigerant_amount_max_g (int) — maximum refrigerant amount
- Add: oil_service (text) — oil service info e.g. "PAO 68"
- Add: source_model (text) — source model reference
- Add: verification_status (text) — one of: 'ok', 'nincs-adat', 'gyanus-2014-2016', 'auto-javitva'
- Add: original_refrigerant (text) — original refrigerant if changed
- Add: ac_notes (text) — additional AC notes
- Add unique constraint on (variant_id) for upsert (one AC spec per variant)

## Security
- All tables already have RLS enabled with anon policies
- No security changes needed

## Notes
1. The unique constraints enable ON CONFLICT upserts — re-importing the same JSONL
   will update existing rows instead of creating duplicates.
2. The tire_specs.raw_size column stores the original format string (e.g. "235/60 R18")
   which is used for deduplication and display.
3. The ac_specs unique on variant_id means one AC spec per variant — re-import updates it.
4. All new columns are nullable to handle the many null values in the JSONL data.
*/

-- ─── cars_generations: add production date text columns ───
ALTER TABLE cars_generations
  ADD COLUMN IF NOT EXISTS production_start_text text,
  ADD COLUMN IF NOT EXISTS production_end_text text,
  ADD COLUMN IF NOT EXISTS production_start_month integer,
  ADD COLUMN IF NOT EXISTS production_end_month integer;

-- Unique constraint for upsert on generations
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cars_generations_model_id_code_key'
  ) THEN
    ALTER TABLE cars_generations ADD CONSTRAINT cars_generations_model_id_code_key UNIQUE (model_id, code);
  END IF;
END $$;

-- ─── cars_variants: add all vehicle specification columns ───
ALTER TABLE cars_variants
  ADD COLUMN IF NOT EXISTS kivitel text,
  ADD COLUMN IF NOT EXISTS hajtaslanc text,
  ADD COLUMN IF NOT EXISTS karosszeria text,
  ADD COLUMN IF NOT EXISTS uzemanyag text,
  ADD COLUMN IF NOT EXISTS meghajtas text,
  ADD COLUMN IF NOT EXISTS akku_technologia text,
  ADD COLUMN IF NOT EXISTS akku_helye text,
  ADD COLUMN IF NOT EXISTS kormanymu text,
  ADD COLUMN IF NOT EXISTS szervokormany text,
  ADD COLUMN IF NOT EXISTS elso_futomu text,
  ADD COLUMN IF NOT EXISTS hatso_futomu text,
  ADD COLUMN IF NOT EXISTS elso_fek text,
  ADD COLUMN IF NOT EXISTS hatso_fek text,
  ADD COLUMN IF NOT EXISTS sebessegvalto text,
  ADD COLUMN IF NOT EXISTS hajtasrendszer_leiras text,
  ADD COLUMN IF NOT EXISTS ulesek_szama integer,
  ADD COLUMN IF NOT EXISTS ajtok_szama integer,
  ADD COLUMN IF NOT EXISTS felnimeret text,
  ADD COLUMN IF NOT EXISTS sulyerohoz_arany text,
  ADD COLUMN IF NOT EXISTS hosszusag_mm integer,
  ADD COLUMN IF NOT EXISTS szelesseg_mm integer,
  ADD COLUMN IF NOT EXISTS magassag_mm integer,
  ADD COLUMN IF NOT EXISTS tengelytav_mm integer,
  ADD COLUMN IF NOT EXISTS elso_nyomtav_mm integer,
  ADD COLUMN IF NOT EXISTS hatso_nyomtav_mm integer,
  ADD COLUMN IF NOT EXISTS elso_tullogas_mm integer,
  ADD COLUMN IF NOT EXISTS hatso_tullogas_mm integer,
  ADD COLUMN IF NOT EXISTS hasmagassag_mm integer,
  ADD COLUMN IF NOT EXISTS sajattomeg_kg integer,
  ADD COLUMN IF NOT EXISTS megengedett_ossztomeg_kg integer,
  ADD COLUMN IF NOT EXISTS hasznos_teher_kg integer,
  ADD COLUMN IF NOT EXISTS csomagter_min_l integer,
  ADD COLUMN IF NOT EXISTS csomagter_max_l integer,
  ADD COLUMN IF NOT EXISTS vegsebesseg_kmh integer,
  ADD COLUMN IF NOT EXISTS gyorsulas_0_100_s numeric,
  ADD COLUMN IF NOT EXISTS nyomatek_nm integer,
  ADD COLUMN IF NOT EXISTS teljesitmeny_hp integer,
  ADD COLUMN IF NOT EXISTS akku_kapacitas_kwh numeric,
  ADD COLUMN IF NOT EXISTS fogyasztas_varosi_l100km numeric,
  ADD COLUMN IF NOT EXISTS fogyasztas_orszaguti_l100km numeric,
  ADD COLUMN IF NOT EXISTS fogyasztas_vegyes_l100km numeric,
  ADD COLUMN IF NOT EXISTS energiafogyasztas_wltp_kwh100km numeric,
  ADD COLUMN IF NOT EXISTS elektromos_hatotav_wltp_km integer,
  ADD COLUMN IF NOT EXISTS elektromos_hatotav_nedc_km integer,
  ADD COLUMN IF NOT EXISTS hengerek_szama integer,
  ADD COLUMN IF NOT EXISTS szelepek_per_henger integer,
  ADD COLUMN IF NOT EXISTS loketterfogat_cm3 numeric,
  ADD COLUMN IF NOT EXISTS furat_mm numeric,
  ADD COLUMN IF NOT EXISTS loket_mm numeric,
  ADD COLUMN IF NOT EXISTS surites_arany numeric,
  ADD COLUMN IF NOT EXISTS motor_szivas text,
  ADD COLUMN IF NOT EXISTS befecskendezes text,
  ADD COLUMN IF NOT EXISTS karosanyag_norma text,
  ADD COLUMN IF NOT EXISTS motorolaj_mennyiseg_l numeric,
  ADD COLUMN IF NOT EXISTS vontathato_fekes_kg integer,
  ADD COLUMN IF NOT EXISTS vontathato_fek_nelkul_kg integer,
  ADD COLUMN IF NOT EXISTS fajlagos_teljesitmeny_hp_l numeric,
  ADD COLUMN IF NOT EXISTS gumi_forras_generacio text;

-- Unique constraint for upsert on variants
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cars_variants_generation_id_name_key'
  ) THEN
    ALTER TABLE cars_variants ADD CONSTRAINT cars_variants_generation_id_name_key UNIQUE (generation_id, name);
  END IF;
END $$;

-- ─── tire_specs: add enhanced columns ───
ALTER TABLE tire_specs
  ADD COLUMN IF NOT EXISTS is_xl boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_c boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_run_flat boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS motor_source text,
  ADD COLUMN IF NOT EXISTS raw_size text;

-- Unique constraint for upsert on tire specs
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tire_specs_variant_id_raw_size_motor_source_key'
  ) THEN
    ALTER TABLE tire_specs ADD CONSTRAINT tire_specs_variant_id_raw_size_motor_source_key UNIQUE (variant_id, raw_size, motor_source);
  END IF;
END $$;

-- ─── ac_specs: add enhanced columns ───
ALTER TABLE ac_specs
  ADD COLUMN IF NOT EXISTS refrigerant_amount_min_g integer,
  ADD COLUMN IF NOT EXISTS refrigerant_amount_max_g integer,
  ADD COLUMN IF NOT EXISTS oil_service text,
  ADD COLUMN IF NOT EXISTS source_model text,
  ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'nincs-adat',
  ADD COLUMN IF NOT EXISTS original_refrigerant text,
  ADD COLUMN IF NOT EXISTS ac_notes text;

-- Unique constraint for upsert on ac specs (one per variant)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ac_specs_variant_id_key'
  ) THEN
    ALTER TABLE ac_specs ADD CONSTRAINT ac_specs_variant_id_key UNIQUE (variant_id);
  END IF;
END $$;

-- ─── Indexes for faster searching ───
CREATE INDEX IF NOT EXISTS idx_cars_variants_generation_id ON cars_variants(generation_id);
CREATE INDEX IF NOT EXISTS idx_tire_specs_variant_id ON tire_specs(variant_id);
CREATE INDEX IF NOT EXISTS idx_tire_specs_width_aspect_rim ON tire_specs(width, aspect_ratio, rim_diameter);
CREATE INDEX IF NOT EXISTS idx_ac_specs_variant_id ON ac_specs(variant_id);
CREATE INDEX IF NOT EXISTS idx_cars_makes_slug ON cars_makes(slug);
CREATE INDEX IF NOT EXISTS idx_cars_models_make_id_slug ON cars_models(make_id, slug);
CREATE INDEX IF NOT EXISTS idx_cars_generations_model_id_code ON cars_generations(model_id, code);
