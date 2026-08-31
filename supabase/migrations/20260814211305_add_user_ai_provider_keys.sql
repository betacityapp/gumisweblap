-- Insert user-provided AI provider configs with correct, current model names.
-- Gemini 3.6 Flash is the primary (default) since it's verified working.
-- The fallback chain in lib/ai.ts will try each active config in order if the default fails.

-- Remove old default flag from Pollinations so Gemini becomes primary
UPDATE ai_configs SET is_default = false WHERE id = 'a1000000-0000-4000-8000-000000000001';

-- Gemini (primary, default) — verified working with gemini-3.6-flash
INSERT INTO ai_configs (id, name, provider, api_key, model, base_url, is_default, is_active, created_at, updated_at)
VALUES (
  'a2000000-0000-4000-8000-000000000001',
  'Gemini 3.6 Flash',
  'gemini',
  'AQ.Ab8RN6IEslEw3B3JbxHLNkWzQI_tcK9o3gXYbtkAM08zjejbyQ',
  'gemini-3.6-flash',
  NULL,
  true,
  true,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  api_key = EXCLUDED.api_key,
  model = EXCLUDED.model,
  is_default = true,
  is_active = true,
  updated_at = now();

-- OpenAI (secondary fallback) — gpt-4o-mini
INSERT INTO ai_configs (id, name, provider, api_key, model, base_url, is_default, is_active, created_at, updated_at)
VALUES (
  'a2000000-0000-4000-8000-000000000002',
  'OpenAI GPT-4o-mini',
  'openai',
  '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',
  'gpt-4o-mini',
  NULL,
  false,
  true,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  api_key = EXCLUDED.api_key,
  model = EXCLUDED.model,
  is_active = true,
  updated_at = now();

-- Cerebras (tertiary fallback) — gpt-oss-120b
INSERT INTO ai_configs (id, name, provider, api_key, model, base_url, is_default, is_active, created_at, updated_at)
VALUES (
  'a2000000-0000-4000-8000-000000000003',
  'Cerebras GPT-OSS 120B',
  'cerebras',
  'csk-dchcd66xnc6y3d46tw9pfpmpxne3en6w3j4xm2wymfrm2ydn',
  'gpt-oss-120b',
  NULL,
  false,
  true,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  api_key = EXCLUDED.api_key,
  model = EXCLUDED.model,
  is_active = true,
  updated_at = now();

-- Also fix any existing stale model names in the DB
UPDATE ai_configs SET model = 'gemini-3.6-flash', updated_at = now()
  WHERE provider = 'gemini' AND model NOT IN ('gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-3.1-pro-preview');
UPDATE ai_configs SET model = 'gpt-oss-120b', updated_at = now()
  WHERE provider = 'cerebras' AND model NOT IN ('gpt-oss-120b', 'zai-glm-4.7', 'gemma-4-31b');
