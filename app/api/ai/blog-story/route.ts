import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateWithFallback, getFreeFallbackConfigs, extractJsonFromText } from '@/lib/ai';

function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

const ADMIN_KEY = process.env.ADMIN_SESSION_KEY || 'toldi-admin-2024';

export async function POST(req: NextRequest) {
  try {
    const adminKey = req.headers.get('x-admin-key');
    if (adminKey !== ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { story, city, imageUrl } = await req.json();
    if (!story?.trim()) {
      return NextResponse.json({ error: 'A story mező kötelező' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: dbConfigs } = await admin.from('ai_configs').select('*').eq('is_active', true);
    const configs = [...(dbConfigs ?? []), ...getFreeFallbackConfigs()];

    const systemPrompt = `Te egy tapasztalt autóipari SEO blogger vagy. Feladatod: a kapott rövid leírásból (élményből) készíts teljes, SEO-optimalizált blog bejegyzést JSON formátumban.
Vállalkozás: Toldi Mobil Gumi és Klíma (mobil gumiszerviz, Budapest és Pest megye)
Telefon: +36 30 582 0870

KRITIKUS SZABÁLYOK:
1. A válasz CSAK egy JSON objektum legyen, semmi más szöveg előtte vagy utána
2. Ne használj markdown kódblokkokat
3. A content_html mezőben lévő HTML attribútumokban ne használj idézőjeleket, vagy escape-eld őket
4. A JSON érvényes kell legyen

Visszaadandó JSON (csak ezt, semmi más):
{
  "title": "SEO-optimalizált cikk cím (50-60 karakter)",
  "excerpt": "Rövid, figyelemfelkeltő összefoglaló 120-160 karakter",
  "content_html": "Teljes blog tartalom HTML formátumban (h2,h3,p,ul,li,strong,em), minimum 1500 szó",
  "meta_title": "Meta cím (50-60 karakter, kulcsszóval)",
  "meta_description": "Meta leírás (140-160 karakter)",
  "tags": ["tag1","tag2","tag3","tag4","tag5"]
}`;

    const cityContext = city ? ` A történet helyszíne: ${city}.` : '';
    const imageContext = imageUrl ? ` Van egy fotó a helyszínről.` : '';

    const userPrompt = `Készíts SEO-optimalizált blog bejegyzést az alábbi valós történetből:${cityContext}${imageContext}

Élmény leírása: "${story}"

Fontos:
- A cím legyen figyelemfelkeltő és tartalmazza a kulcsszavakat (mobil gumiszerviz${city ? `, ${city}` : ''})
- A tartalom minimum 1500 szó, strukturált szakaszokkal
- Természetes SEO, nem keyword stuffing
- Tartalmazza a telefonszámot (+36 30 582 0870) CTA-ban
- Valós, emberközeli hangvétel – az olvasók érezzék: ez megtörtént`;

    const { result: raw } = await generateWithFallback({ configs, systemPrompt, userPrompt, maxTokens: 8000 });

    const result = extractJsonFromText(raw);
    return NextResponse.json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Ismeretlen hiba';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
