-- Fix stale/deprecated AI model names in ai_configs
-- Several providers have renamed or deprecated models. This updates
-- stored configs so they use current valid model names.

-- Gemini: 1.5 and 2.0 models are no longer available
UPDATE ai_configs SET model = 'gemini-2.5-flash', updated_at = now()
  WHERE provider = 'gemini' AND model IN ('gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-flash-1.5');

-- Cerebras: old format used dots (llama3.3-70b), new format uses hyphens (llama-3.3-70b)
UPDATE ai_configs SET model = 'llama-3.3-70b', updated_at = now()
  WHERE provider = 'cerebras' AND model IN ('llama3.3-70b', 'llama3.1-70b', 'llama3.1-8b');

-- Groq: deprecated models
UPDATE ai_configs SET model = 'llama-3.3-70b-versatile', updated_at = now()
  WHERE provider = 'groq' AND model IN ('mixtral-8x7b-32768', 'gemma2-9b-it');
