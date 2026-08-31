import type { AiConfig } from './types';

export interface AiGenerateOptions {
  config: AiConfig;
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
}

/**
 * Aggressively fixes common AI JSON errors that prevent JSON.parse from succeeding:
 * - Unescaped double quotes inside string values (common with HTML attributes)
 * - Unescaped newlines inside string values
 * - Trailing commas
 * Strategy: walk through the JSON character by character, tracking string boundaries,
 * and escape any unescaped double quotes or newlines found inside string values.
 */
function aggressiveFix(jsonStr: string): string {
  let result = '';
  let inString = false;
  let i = 0;

  while (i < jsonStr.length) {
    const ch = jsonStr[i];

    if (!inString) {
      // Remove trailing commas before } or ]
      if (ch === ',' && i + 1 < jsonStr.length) {
        let j = i + 1;
        while (j < jsonStr.length && /\s/.test(jsonStr[j])) j++;
        if (j < jsonStr.length && (jsonStr[j] === '}' || jsonStr[j] === ']')) {
          i++;
          continue;
        }
      }
      if (ch === '"') {
        inString = true;
        result += ch;
        i++;
        continue;
      }
      result += ch;
      i++;
    } else {
      // Inside a string
      if (ch === '\\' && i + 1 < jsonStr.length) {
        // Keep escape sequences as-is
        result += ch + jsonStr[i + 1];
        i += 2;
        continue;
      }
      if (ch === '"') {
        // Check if this is the end of the string or an unescaped quote inside
        // Look ahead: if next non-whitespace char is : , } ] or end, it's the closing quote
        let j = i + 1;
        while (j < jsonStr.length && /\s/.test(jsonStr[j])) j++;
        if (j >= jsonStr.length || jsonStr[j] === ':' || jsonStr[j] === ',' || jsonStr[j] === '}' || jsonStr[j] === ']') {
          inString = false;
          result += ch;
          i++;
          continue;
        }
        // Unescaped quote inside string — escape it
        result += '\\"';
        i++;
        continue;
      }
      if (ch === '\n') {
        result += '\\n';
        i++;
        continue;
      }
      if (ch === '\r') {
        result += '\\r';
        i++;
        continue;
      }
      if (ch === '\t') {
        result += '\\t';
        i++;
        continue;
      }
      result += ch;
      i++;
    }
  }

  return result;
}

/**
 * Robustly extracts and parses a JSON object from an AI model's raw text output.
 * Handles common issues:
 * - JSON wrapped in ```json ... ``` code blocks
 * - Leading/trailing prose around the JSON
 * - Gemini "thinking" model output before the actual JSON
 * - Trailing commas (common AI mistake)
 * - Single quotes instead of double quotes
 * - Truncated JSON (attempts to close braces)
 */
export function extractJsonFromText<T = Record<string, unknown>>(raw: string): T {
  if (!raw || typeof raw !== 'string') {
    throw new Error('Üres AI válasz');
  }

  let text = raw.trim();

  // Strip markdown code fences: ```json ... ``` or ``` ... ```
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  // Find the first { and try to parse from there
  const firstBrace = text.indexOf('{');
  if (firstBrace === -1) {
    throw new Error('Nem található JSON objektum a válaszban');
  }

  // Try parsing progressively — find the matching closing brace
  // by tracking nesting depth, handling strings and escapes
  const tryParseFrom = (start: number): T | null => {
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = start; i < text.length; i++) {
      const ch = text[i];
      if (escape) { escape = false; continue; }
      if (ch === '\\' && inString) { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) {
          const candidate = text.slice(start, i + 1);
          // Try direct parse
          try { return JSON.parse(candidate); } catch { /* continue */ }
          // Fix trailing commas + single quotes
          const fixed1 = candidate
            .replace(/,(\s*[}\]])/g, '$1')
            .replace(/'/g, '"');
          try { return JSON.parse(fixed1); } catch { /* continue */ }
          // Aggressive fix: extract string values and escape unescaped quotes/newlines
          const fixed2 = aggressiveFix(candidate);
          try { return JSON.parse(fixed2); } catch { /* continue */ }
          return null;
        }
      }
    }
    // JSON might be truncated — try closing it
    const candidate = text.slice(start);
    const fixed = candidate
      .replace(/,(\s*[}\]])/g, '$1')
      .replace(/'/g, '"');
    let unclosed = 0;
    let inStr = false;
    let esc = false;
    for (const ch of fixed) {
      if (esc) { esc = false; continue; }
      if (ch === '\\' && inStr) { esc = true; continue; }
      if (ch === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (ch === '{') unclosed++;
      else if (ch === '}') unclosed--;
    }
    if (unclosed > 0) {
      const closed = fixed + '}'.repeat(unclosed);
      try { return JSON.parse(closed); } catch { /* continue */ }
      const fixed2 = aggressiveFix(closed);
      try { return JSON.parse(fixed2); } catch { return null; }
    }
    return null;
  };

  // Try from the first brace
  const result = tryParseFrom(firstBrace);
  if (result) return result;

  // Try from each subsequent brace (in case first was inside prose)
  let searchFrom = firstBrace + 1;
  while (searchFrom < text.length) {
    const nextBrace = text.indexOf('{', searchFrom);
    if (nextBrace === -1) break;
    const r = tryParseFrom(nextBrace);
    if (r) return r;
    searchFrom = nextBrace + 1;
  }

  throw new Error('AI válasz nem értelmezhető JSON-ként');
}

// Free fallback providers that work without user configuration.
// These are tried in order when user-configured providers fail.
const FREE_FALLBACK_CONFIGS: AiConfig[] = [
  {
    id: 'fallback-pollinations-anon',
    name: 'Pollinations.ai (ingyenes, anonim)',
    provider: 'pollinations',
    api_key: '',
    model: 'openai',
    base_url: null,
    is_default: true,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
];

export function getFreeFallbackConfigs(): AiConfig[] {
  return FREE_FALLBACK_CONFIGS;
}

// Maps stale/deprecated model names to their current valid equivalents.
// This fixes configs stored in the production database with outdated names
// without requiring a manual DB migration.
const MODEL_REPLACEMENTS: Record<string, string> = {
  // Cerebras: old llama models no longer exist; current free-tier models are gpt-oss-120b, zai-glm-4.7, gemma-4-31b
  'llama3.3-70b': 'gpt-oss-120b',
  'llama-3.3-70b': 'gpt-oss-120b',
  'llama3.1-8b': 'gpt-oss-120b',
  'llama-3.1-8b': 'gpt-oss-120b',
  'llama3.1-70b': 'gpt-oss-120b',
  // Gemini: 1.5, 2.0, and 2.5 models are deprecated/shut down for new users; use 3.6-flash
  'gemini-1.5-pro': 'gemini-3.6-flash',
  'gemini-1.5-flash': 'gemini-3.6-flash',
  'gemini-2.0-flash': 'gemini-3.6-flash',
  'gemini-2.0-flash-lite': 'gemini-3.6-flash',
  'gemini-2.5-flash': 'gemini-3.6-flash',
  'gemini-2.5-flash-lite': 'gemini-3.6-flash',
  'gemini-2.5-pro': 'gemini-3.6-flash',
  'gemini-flash-1.5': 'gemini-3.6-flash',
  'gemini-flash-latest': 'gemini-3.6-flash',
  'gemini-pro-latest': 'gemini-3.6-flash',
  // Groq: deprecated models
  'mixtral-8x7b-32768': 'llama-3.3-70b-versatile',
  'gemma2-9b-it': 'llama-3.1-8b-instant',
};

function normalizeModel(provider: string, model: string): string {
  if (!model) return model;
  // Try exact match first
  if (MODEL_REPLACEMENTS[model]) return MODEL_REPLACEMENTS[model];
  // Try case-insensitive match
  const lower = model.toLowerCase();
  for (const [old, replacement] of Object.entries(MODEL_REPLACEMENTS)) {
    if (old.toLowerCase() === lower) return replacement;
  }
  return model;
}

async function generatePollinations(config: AiConfig, systemPrompt: string, userPrompt: string): Promise<string> {
  const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;
  const pollModel = config.model || 'openai';
  const encoded = encodeURIComponent(combinedPrompt);
  const url = `https://text.pollinations.ai/${encoded}?model=${pollModel}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'text/plain, application/json' },
  });

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`Pollinations API hiba (${res.status}): ${err.slice(0, 300)}`);
  }

  const text = await res.text();
  if (!text || text.trim().length < 2) {
    throw new Error('Pollinations: üres válasz');
  }
  return text;
}

async function generateOpenAICompatible(
  config: AiConfig,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
): Promise<string> {
  const { provider, api_key, model, base_url } = config;

  const defaultUrls: Record<string, string> = {
    openai: 'https://api.openai.com/v1/chat/completions',
    groq: 'https://api.groq.com/openai/v1/chat/completions',
    openrouter: 'https://openrouter.ai/api/v1/chat/completions',
    cerebras: 'https://api.cerebras.ai/v1/chat/completions',
    mistral: 'https://api.mistral.ai/v1/chat/completions',
    deepseek: 'https://api.deepseek.com/v1/chat/completions',
    together: 'https://api.together.xyz/v1/chat/completions',
  };

  const url = base_url
    ? `${base_url.replace(/\/$/, '')}/chat/completions`
    : (defaultUrls[provider] ?? 'https://api.openai.com/v1/chat/completions');

  const defaultModels: Record<string, string> = {
    openai: 'gpt-4o-mini',
    groq: 'llama-3.3-70b-versatile',
    openrouter: 'openai/gpt-4o-mini',
    cerebras: 'gpt-oss-120b',
    mistral: 'mistral-small-latest',
    deepseek: 'deepseek-chat',
    together: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
  };

  const resolvedModel = normalizeModel(provider, model || defaultModels[provider] || 'gpt-4o-mini');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${api_key}`,
  };
  if (provider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://toldimobilgumi.hu';
    headers['X-Title'] = 'Toldi Mobil Gumi';
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: resolvedModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`${provider} API error (${res.status}): ${err.slice(0, 300)}`);
  }

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content ?? '';
  if (!content) throw new Error(`${provider}: üres válasz a modelltől`);
  return content;
}

async function generateAnthropic(config: AiConfig, systemPrompt: string, userPrompt: string, maxTokens: number): Promise<string> {
  const { api_key, model } = config;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': api_key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: model || 'claude-sonnet-4-5',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`Anthropic API error (${res.status}): ${err.slice(0, 300)}`);
  }
  const json = await res.json();
  const content = json.content?.[0]?.text ?? '';
  if (!content) throw new Error('Anthropic: üres válasz');
  return content;
}

async function generateGemini(config: AiConfig, systemPrompt: string, userPrompt: string, maxTokens: number): Promise<string> {
  const { api_key, model } = config;
  const geminiModel = normalizeModel('gemini', model || 'gemini-3.6-flash');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${api_key}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.7,
      },
    }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`Gemini API error (${res.status}): ${err.slice(0, 300)}`);
  }
  const json = await res.json();
  // Gemini may return multiple parts — concatenate text parts
  const parts = json.candidates?.[0]?.content?.parts ?? [];
  const content = parts.map((p: { text?: string }) => p.text ?? '').join('');
  if (!content) throw new Error('Gemini: üres válasz');
  return content;
}

async function generateHuggingFace(config: AiConfig, systemPrompt: string, userPrompt: string, maxTokens: number): Promise<string> {
  const { api_key, model, base_url } = config;
  const hfModel = model || 'mistralai/Mistral-7B-Instruct-v0.3';
  const url = base_url || `https://api-inference.huggingface.co/models/${hfModel}/v1/chat/completions`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${api_key}`,
    },
    body: JSON.stringify({
      model: hfModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`HuggingFace API error (${res.status}): ${err.slice(0, 300)}`);
  }
  const json = await res.json();
  const content = json.choices?.[0]?.message?.content ?? '';
  if (!content) throw new Error('HuggingFace: üres válasz');
  return content;
}

export async function generateWithAi({ config, systemPrompt, userPrompt, maxTokens = 4000 }: AiGenerateOptions): Promise<string> {
  const { provider } = config;

  if (provider === 'pollinations') {
    return generatePollinations(config, systemPrompt, userPrompt);
  }

  if (
    provider === 'openai' ||
    provider === 'custom' ||
    provider === 'groq' ||
    provider === 'openrouter' ||
    provider === 'cerebras' ||
    provider === 'mistral' ||
    provider === 'deepseek' ||
    provider === 'together'
  ) {
    return generateOpenAICompatible(config, systemPrompt, userPrompt, maxTokens);
  }

  if (provider === 'anthropic') {
    return generateAnthropic(config, systemPrompt, userPrompt, maxTokens);
  }

  if (provider === 'gemini') {
    return generateGemini(config, systemPrompt, userPrompt, maxTokens);
  }

  if (provider === 'huggingface') {
    return generateHuggingFace(config, systemPrompt, userPrompt, maxTokens);
  }

  throw new Error(`Ismeretlen AI szolgáltató: ${provider}`);
}

// Try user configs first, then fall back to free providers
export async function generateWithFallback(opts: {
  configs: AiConfig[];
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
}): Promise<{ result: string; configUsed: AiConfig }> {
  const { configs, systemPrompt, userPrompt, maxTokens } = opts;
  const errors: string[] = [];

  // De-duplicate configs by id, keep order (user configs first)
  const seen = new Set<string>();
  const allConfigs = [...configs, ...FREE_FALLBACK_CONFIGS].filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });

  for (const config of allConfigs) {
    if (!config.is_active) continue;
    try {
      const result = await generateWithAi({ config, systemPrompt, userPrompt, maxTokens });
      return { result, configUsed: config };
    } catch (e) {
      errors.push(`${config.name}: ${e instanceof Error ? e.message : 'ismeretlen hiba'}`);
    }
  }

  throw new Error(`Egyetlen AI szolgáltató sem érhető el. Hibák:\n${errors.join('\n')}`);
}

export interface CityPageOptions {
  city: string;
  siteName: string;
  phone: string;
  layoutVariant?: string;
  email?: string;
  businessAvailability?: string;
  averageArrivalTime?: string;
  minimumPrice?: string;
  kmPrice?: string;
  districts?: string;
  nearbyCities?: string;
  mainRoads?: string;
  motorways?: string;
  industrialAreas?: string;
  localPlaces?: string;
  serviceArea?: string;
  customPrices?: string;
}

export function buildCityPagePrompt(opts: CityPageOptions): string {
  const {
    city, siteName, phone, layoutVariant = 'default',
    email = '', businessAvailability = '0-24 óra, az év 365 napján (hétvégén, ünnepnapokon is, pótdíj nélkül)',
    averageArrivalTime = '', minimumPrice = '', kmPrice = '',
    districts = '', nearbyCities = '', mainRoads = '', motorways = '',
    industrialAreas = '', localPlaces = '', serviceArea = '',
    customPrices = '',
  } = opts;

  const LAYOUT_INSTRUCTIONS: Record<string, string> = {
    'default': `ÁLTALÁNOS ELRENDEZÉS: Bevezeto -> Mikor kell -> Szolgáltatások (részletes) -> Miért mi -> Lefedettség -> Árak -> Defekt esetén mit tegyünk -> CTA`,
    'city-focus': `VÁROSFÓKUSZOS ELRENDEZÉS: Kezdd ${city} várossal és negyedeivel, helyi utakkal -> Konkrét esetek ${city}ban -> Városi lefedettség, parkolók, ipari zónák -> Kiérkezési idő ${city}ba -> Szolgáltatások -> Árak -> CTA. Az első 3 szakasz mind ${city}ről szóljon.`,
    'service-focus': `SZOLGÁLTATÁSFÓKUSZOS ELRENDEZÉS: Minden egyes szolgáltatás kapjon saját nagy szakaszt (h2): Defektjavítás, Gumicsere, Klímatöltés, Centrírozás, Autómentés, Flottakezelés – mindegyiknél ${city} vonatkozás, árak, mikor kell. Rövid város-bevezeto, majd a szolgáltatások az igazi tartalom.`,
    'comparison-focus': `ÖSSZEHASONLÍTÁS-FÓKUSZOS ELRENDEZÉS: Kezdd összehasonlítással (mobil szerviz vs autómento vs hagyományos szerviz ${city}ban), táblázattal, számokkal. Majd érv-listák, MIKOR MELYIKET használd, árösszehasonlítás. Így épül: Összehasonlítás -> Eloenyök -> Konkrét esetek ${city}ban -> Szolgáltatások -> CTA.`,
    'minimal': `MINIMÁL ELRENDEZÉS: Kevesebb szakasz, több szöveg soronként. Fo szakaszok: Bevezeto (részletes, 400+ szó) -> Miért mi ${city}ban (részletes, 400+ szó) -> Hogyan működik (step-by-step) -> Árak -> CTA. Kevesebb h2, több folyó szöveg.`,
  };

  const layoutInstruction = LAYOUT_INSTRUCTIONS[layoutVariant] || LAYOUT_INSTRUCTIONS['default'];

  return `TE EGY TAPASZTALT SEO SZAKÉRTŐ, HELYI SEO SPECIALISTA, AUTÓIPARI COPYWRITER ÉS TARTALOMSTRATÉGA VAGY.

Feladatod egy magas minőségű, egyedi, helyileg releváns és SEO-optimalizált weboldaltartalom elkészítése.

A cél nem a hosszú szöveg önmagában, hanem az, hogy a létrehozott oldal valódi segítséget adjon a látogatónak, egyértelműen kapcsolódjon a célvároshoz, és ne legyen sablonos vagy más városi oldalak szövegének átírt változata.

==================================================
1. ALAPELV – MINŐSÉG A SZÓSZÁM HELYETT
==================================================

Ne törekedj mesterségesen 2500+ szóra.

Elsődleges cél:
- hasznos
- természetes
- informatív
- helyileg releváns
- egyedi
- könnyen olvasható
- keresőoptimalizált tartalom

Ajánlott terjedelem: 1200–1800 szó.

Csak akkor írj hosszabb tartalmat, ha az adott témához valóban szükséges és minden további rész új, értékes információt ad.

SOHA ne töltsd fel a szöveget ismétlésekkel csak azért, hogy elérd a kívánt szószámot.

==================================================
2. TÉNYEK – TILOS INFORMÁCIÓT KITALÁLNI
==================================================

A megadott céges és szolgáltatási adatokat tekintsd hivatalos, ellenőrzött információnak.

TILOS:
- árakat kitalálni
- kilométerdíjat kitalálni
- kiérkezési időt kitalálni
- nyitvatartást kitalálni
- szolgáltatást kitalálni
- garanciát kitalálni
- ügyfélszámot kitalálni
- értékelést kitalálni
- Google értékelést kitalálni
- „több ezer ügyfél" jellegű állítást kitalálni
- helyi vállalkozásokat vagy partnereket kitalálni
- nem ellenőrzött városi adatokat tényként kezelni

Ha egy információ nincs megadva vagy nem ellenőrizhető, NE TALÁLD KI.

Inkább:
- hagyd ki,
- fogalmazz általánosan,
- vagy használj olyan megfogalmazást, amely nem állít konkrét, nem igazolt tényt.

Különösen fontos az árak és a szolgáltatási feltételek kezelése.

==================================================
3. CÉGES ADATOK
==================================================

Cég:
${siteName}

Telefonszám:
${phone}
${email ? `\nEmail:\n${email}\n` : ''}
Célváros:
${city}

Szolgáltatások:
- szezonális gumicsere
- defektjavítás
- autóklíma töltés
- centrírozás / kerékkiegyensúlyozás
- autómentés
- flottakezelés

Elérhetőség:
${businessAvailability}
${averageArrivalTime ? `\nÁtlagos kiérkezési idő:\n${averageArrivalTime}\n` : ''}
${minimumPrice ? `\nMinimum szolgáltatási díj:\n${minimumPrice}\n` : ''}
${kmPrice ? `\nKilométerdíj:\n${kmPrice}\n` : ''}
${customPrices ? `\nEgyedi árak:\n${customPrices}\n` : ''}
CSAK a ténylegesen megadott adatokat használhatod.

==================================================
4. HELYI SEO – A VÁROS LEGYEN A TARTALOM VALÓDI RÉSZE
==================================================

A célváros nem egyszerűen egy kulcsszó, amelyet néhányszor be kell helyettesíteni.

A tartalom legyen valóban a célvárosra szabva.

Használd a rendelkezésre álló ellenőrzött helyi adatokat:
${districts ? `\nVárosrészek:\n${districts}\n` : ''}
${nearbyCities ? `\nKözeli települések:\n${nearbyCities}\n` : ''}
${mainRoads ? `\nFőbb utak:\n${mainRoads}\n` : ''}
${motorways ? `\nAutópályák / lehajtók:\n${motorways}\n` : ''}
${industrialAreas ? `\nIpari területek:\n${industrialAreas}\n` : ''}
${localPlaces ? `\nJellemző helyszínek:\n${localPlaces}\n` : ''}
${serviceArea ? `\nSzolgáltatási terület:\n${serviceArea}\n` : ''}
Ha valamelyik adat nincs megadva, ne találj ki helyette konkrét információt.

==================================================
5. NE LEGYENEK SABLONOS VÁROSI OLDALAK
==================================================

A különböző városok oldalai NEM lehetnek ugyanannak a szövegnek a városnévvel lecserélt változatai.

Minden oldal:
- más megközelítést használjon
- más példákat használjon
- más sorrendben mutassa be a témákat
- más helyi problémákra fókuszáljon
- más bevezetést kapjon
- más CTA-megfogalmazást használjon

ELRENDEZÉS TÍPUS: ${layoutVariant.toUpperCase()}
${layoutInstruction}

==================================================
6. SEO STRUKTÚRA
==================================================

Készíts:
- 1 db H1 címet
- logikusan felépített H2 szakaszokat
- szükség esetén H3 alcímeket
- természetes kulcsszóhasználatot
- természetes CTA-t
- FAQ részt, ha a téma indokolja

TILOS a keyword stuffing.

==================================================
7. ÁRAK ÉS SZOLGÁLTATÁSI FELTÉTELEK
==================================================

Az árakkal kapcsolatban kizárólag a megadott hivatalos adatokat használd.

Ha nincs konkrét ár megadva, NE írj konkrét összeget.

Ne találj ki:
- km-díjat
- éjszakai felárat
- hétvégi felárat
- ünnepnapi felárat
- munkadíjat
- kiszállási díjat

Ha van hivatalos minimumdíj, azt pontosan add vissza.

==================================================
8. HTML ÉS VIZUÁLIS DIZÁJN – FONTOS
==================================================

A fő tartalmat HTML formátumban add vissza.

A weboldal stílusrendszere rendelkezésre áll — HASZNÁLD AZ ALÁBBI CSS OSZTÁLYOKAT a tartalom vizuális felépítéséhez:

DIVEK ÉS KONTÉNEREK (használj div-eket ezekkel az osztályokkal):

<div class="callout"> — Kék információs doboz. Használd fontos információk kiemelésére (pl. kiérkezési idő, elérhetőség).
  Példa: <div class="callout"><p><strong>0-24 órában</strong> elérhető mobil szerviz...</p></div>

<div class="warning-box"> — Sárga figyelmeztető doboz. Használd óvintézkedéseknél (pl. mikor NE próbálkozz otthon).
  Példa: <div class="warning-box"><p><strong>Figyelem:</strong> Ne szereld fel a defektes kereket otthon...</p></div>

<div class="success-box"> — Zöld siker/pozitív doboz. Használd előnyöknél, garantált eredményeknél.
  Példa: <div class="success-box"><p><strong>Megtakarítás:</strong> Időt és pénzt spórolsz...</p></div>

<div class="danger-box"> — Piros figyelmeztető doboz. Kritikus eseteknél (pl. defekt veszélyei).

<div class="feature-grid"> — 2 oszlopos kártya rendszer. Használd szolgáltatások, előnyök felsorolásánál.
  <div class="feature-grid">
    <div class="feature-card"><h3>Szolgáltatás neve</h3><p>Leírás...</p></div>
    <div class="feature-card"><h3>Szolgáltatás neve</h3><p>Leírás...</p></div>
  </div>

<div class="feature-grid three-col"> — 3 oszlopos kártya rendszer.

<div class="cta-box"> — Piros CTA (call-to-action) doboz. Használd a telefonszám kiemelésére.
  <div class="cta-box"><h2>Hívjon most!</h2><p>Telefon: ${phone}</p><a href="tel:${phone.replace(/\s/g, '')}">Azonnal hívom</a></div>

<div class="faq-section"> — FAQ (gyakori kérdések) szekció.
  <div class="faq-section">
    <div class="faq-item"><h3>Kérdés?</h3><p>Válasz...</p></div>
    <div class="faq-item"><h3>Kérdés?</h3><p>Válasz...</p></div>
  </div>

<div class="steps"> — Lépésről lépésre folyamat.
  <div class="steps">
    <div class="step"><div class="step-number">1</div><div class="step-content"><h3>Lépés</h3><p>Leírás...</p></div></div>
  </div>

<div class="stats-row"> — Statisztika sor.
  <div class="stats-row">
    <div class="stat-item"><div class="stat-value">45</div><div class="stat-label">perc kiérkezés</div></div>
  </div>

<div class="highlight-banner"> — Sötét kiemelt banner.
  <div class="highlight-banner"><h2>Cím</h2><p>Szöveg...</p></div>

<div class="two-col"> — Két oszlopos elrendezés.

<div class="price-card"> — Ár kártya (sötét háttér).
  <div class="price-card"><div class="price">20.000 Ft <span>+ ÁFA</span></div><p>Minimum szolgáltatási díj</p></div>

TÁBLÁZATOK: Használj <table> elemet — a stílus automatikusan alkalmazkodik (sötét fejléc, váltakozó sorok, hover effekt).

KULCSSZAVAK: Használj <strong> taget a fontos kifejezések kiemelésére.

LINKELÉS: Belső linkeket használj <a href="/hu/mobil-gumiszerviz-VELEM"> formátumban, ha releváns.

SZABÁLYOK:
- Engedélyezett tagek: h1, h2, h3, h4, p, ul, ol, li, strong, em, table, tr, td, th, thead, tbody, a, div, span, blockquote, hr, img
- NE használj: html, head, body, script, style wrapper tageket
- A HTML attribútumokban ne használj idézőjeleket, vagy aposztrófot használj
- KÉPEK: Ha képet szeretnél, használj <img> taget src attribútummal
- LEGYÉL KREATÍV: Használd a fenti CSS osztályokat bőségesen — ez teszi az oldalt vizuálisan vonzóvá
- Minden szekció kapjon valamilyen vizuális elemet (callout, feature-grid, steps, stb.)
- Az oldal NE legyen csak egymás után következő <p> és <h2> elemek — használj változatos elrendezést

==================================================
9. MINŐSÉGELLENŐRZÉS A GENERÁLÁS ELŐTT
==================================================

Mielőtt elkészíted a végleges szöveget, ellenőrizd:
- Nincs kitalált céges adat
- Nincs kitalált ár
- Nincs kitalált km-díj
- Nincs kitalált kiérkezési idő
- Nincs kitalált ügyfélszám
- Nincs kitalált értékelés
- Nem ismétli önmagát a szöveg
- Nem keyword stuffing
- A város valóban szerepet kap a tartalomban
- A tartalom hasznos egy valódi autós számára

==================================================
10. VÉGSŐ CÉL
==================================================

Olyan weboldalt készíts, amelyet egy valódi helyi autószerviz szakértője is vállalna.

A szöveg legyen: TERMÉSZETES, HELYI, HASZNOS, EGYEDI, SZAKMAI, TÉNYSZERŰ, SEO-BARÁT, KONVERZIÓRA OPTIMALIZÁLT.`;
}

export function buildBlogPostPrompt(topic: string, siteName: string, phone: string): string {
  return `Te egy tapasztalt autóipari blogger és SEO szakértő vagy. Írj egy MINIMUM 1500 szavas, SEO-optimalizált blogbejegyzést.

Cég: ${siteName}, telefon: ${phone}
Téma: "${topic}"

STRUKTÚRA:
1. Figyelemfelkeltő H1 cím (tartalmazza a fő kulcsszót)
2. Bevezető (150-200 szó) – miért fontos ez a téma
3. Legalább 5-6 részletes szakasz H2/H3 tagekkel (minden szakasz 200-300 szó)
4. Gyakorlati tippek, táblázatok, listák ahol releváns
5. Szakértői tanácsok (mit tegyünk, mit kerüljünk)
6. FAQ (gyakori kérdések) szekció
7. Összefoglalás (100-150 szó)
8. CTA a telefonszámmal

VIZUÁLIS DIZÁJN — HASZNÁLD EZEKET A CSS OSZTÁLYOKAT:
- <div class="callout"> — Kék információs doboz fontos információkhoz
- <div class="warning-box"> — Sárga figyelmeztető doboz óvintézkedésekhez
- <div class="success-box"> — Zöld pozitív doboz előnyökhöz
- <div class="feature-grid"> — 2 oszlopos kártya rendszer (tartalmazza: <div class="feature-card"><h3>Cím</h3><p>Leírás</p></div>)
- <div class="feature-grid three-col"> — 3 oszlopos kártya rendszer
- <div class="cta-box"> — Piros CTA doboz: <div class="cta-box"><h2>Hívjon most!</h2><p>Telefon: ${phone}</p><a href="tel:${phone.replace(/\\s/g, '')}">Hívom</a></div>
- <div class="faq-section"> — FAQ szekció: <div class="faq-section"><div class="faq-item"><h3>Kérdés</h3><p>Válasz</p></div></div>
- <div class="steps"> — Lépésről lépésre: <div class="step"><div class="step-number">1</div><div class="step-content"><h3>Lépés</h3><p>Leírás</p></div></div>
- <div class="stats-row"> — Statisztika: <div class="stat-item"><div class="stat-value">45</div><div class="stat-label">perc</div></div>
- <div class="highlight-banner"> — Sötét kiemelt banner
- <div class="two-col"> — Két oszlopos elrendezés
- <table> — Táblázat (sötét fejléc, váltakozó sorok automatikusan)

KÖVETELMÉNYEK:
- Minimum 1500 szó
- Természetes, informatív, hasznos stílus
- SEO kulcsszavak természetes beágyazása
- Használj változatos vizuális elemeket (callout, feature-grid, steps, stb.)
- Ne csak egymás után következő <p> és <h2> elemek — legyen változatos elrendezés
- Egyedi, nem generikus tartalom
- Minden szakasz más megközelítésből tárgyalja a témát
- HTML attribútumokban ne használj idézőjeleket (használj aposztrófot)`;
}

export function buildPageContentPrompt(pageTitle: string, pageType: string, siteName: string, phone: string, city?: string): string {
  const cityContext = city ? ` A célváros: ${city}.` : '';
  return `Te egy SEO-szakértő copywriter vagy. Írj MINIMUM 1500 szavas oldaltartalmat (HTML) egy "${pageTitle}" nevű weboldalhoz.${cityContext}

Cég: ${siteName}, telefon: ${phone}
Oldaltípus: ${pageType}
Szolgáltatások: mobil gumiszerviz, gumicsere, defektjavítás, klímatöltés, centrírozás

VIZUÁLIS DIZÁJN — HASZNÁLD EZEKET A CSS OSZTÁLYOKAT:
- <div class="callout"> — Kék információs doboz
- <div class="warning-box"> — Sárga figyelmeztető doboz
- <div class="success-box"> — Zöld pozitív doboz
- <div class="feature-grid"> — 2 oszlopos kártya rendszer: <div class="feature-card"><h3>Cím</h3><p>Leírás</p></div>
- <div class="feature-grid three-col"> — 3 oszlopos kártya rendszer
- <div class="cta-box"> — Piros CTA: <div class="cta-box"><h2>Hívjon!</h2><p>${phone}</p><a href="tel:${phone.replace(/\\s/g, '')}">Hívom</a></div>
- <div class="faq-section"> — FAQ: <div class="faq-item"><h3>Kérdés</h3><p>Válasz</p></div>
- <div class="steps"> — Lépésről lépésre: <div class="step"><div class="step-number">1</div><div class="step-content"><h3>Lépés</h3><p>Leírás</p></div></div>
- <div class="stats-row"> — Statisztika
- <div class="highlight-banner"> — Sötét kiemelt banner
- <table> — Táblázat (automatikus stílus)

KÖVETELMÉNYEK:
- Minimum 1500 szó
- Strukturált HTML (h1, h2, h3, h4, p, ul, ol, li, strong, em, table, div, a, blockquote)
- Legalább 5-6 tartalmi szakasz
- SEO-optimalizált kulcsszavak természetes használata
- Informatív, hasznos tartalom
- Változatos vizuális elemek (callout, feature-grid, steps, stb.)
- CTA a telefonszámmal a végén
- Csak body tartalom (ne html/body wrapper)
- HTML attribútumokban ne használj idézőjeleket`;
}

export function buildDallEPrompt(title: string): string {
  return `Professional automotive photography for a tire service article titled "${title}". Show a modern mobile tire service van parked next to a car on a Budapest street, technician in red uniform working on a tire. Clean, bright, commercial photography style. No text overlays.`;
}
