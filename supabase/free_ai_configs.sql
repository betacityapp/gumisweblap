-- Ingyenes AI konfigurációk beszúrása az ai_configs táblába
-- Ez a fájl bármelyik Supabase projektben lefuttatható.
-- A Pollinations.ai ingyenes, API kulcs nélkül működik (anonim módon).
--
-- Használat:
-- 1. Nyissa meg a Supabase Dashboard-ot
-- 2. Menjen az SQL Editor menüpontba
-- 3. Másolja be ezt a teljes fájlt
-- 4. Kattintson a Run gombra
--
-- A konfiguráció az admin felületen (AI beállítások) szerkeszthető/törölhető.
-- További ingyenes szolgáltatók (Groq, Cerebras, Gemini) API kulccsal
-- a https://console.groq.com, https://cloud.cerebras.ai, https://aistudio.google.com
-- oldalakon regisztrálhatók.

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

-- Meglévő Gemini/Cerebras konfigurációk modellnevének javítása
-- (régi, már nem elérhető modellnevek cseréje az aktuálisakra)
UPDATE ai_configs SET model = 'gemini-2.5-flash', updated_at = now()
  WHERE provider = 'gemini' AND model IN ('gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-flash-1.5');
UPDATE ai_configs SET model = 'llama-3.3-70b', updated_at = now()
  WHERE provider = 'cerebras' AND model IN ('llama3.3-70b', 'llama3.1-70b', 'llama3.1-8b');
UPDATE ai_configs SET model = 'llama-3.3-70b-versatile', updated_at = now()
  WHERE provider = 'groq' AND model IN ('mixtral-8x7b-32768', 'gemma2-9b-it');

-- Ellenőrzés
SELECT id, name, provider, model, is_default, is_active FROM ai_configs;
