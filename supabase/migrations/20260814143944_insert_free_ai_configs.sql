/*
# Insert free built-in AI provider configs

## Overview
Inserts a free AI provider configuration into the ai_configs table so that AI features
(blog generation, page generation, page editing, AI assistant) work out-of-the-box
without the user needing to manually configure an API key.

## Provider inserted:
1. Pollinations.ai — completely free, no API key required, OpenAI-compatible endpoint

## Notes
1. The Pollinations.ai config is marked as is_default=true and is_active=true.
2. This config can be edited/deleted from the admin AI settings page at any time.
3. The code in lib/ai.ts also has hardcoded fallback configs that work even if this
   database entry is deleted — but having it in the database means the admin
   can see and manage it.
4. Uses a fixed UUID so re-running won't create duplicates.
*/

INSERT INTO ai_configs (id, name, provider, api_key, model, base_url, is_default, is_active, created_at, updated_at)
VALUES (
  'a1000000-0000-4000-8000-000000000001',
  'Pollinations.ai (ingyenes)',
  'pollinations',
  '',
  'openai',
  NULL,
  true,
  true,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  provider = EXCLUDED.provider,
  model = EXCLUDED.model,
  is_active = true,
  updated_at = now();
