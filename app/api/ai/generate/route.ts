import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateWithFallback, getFreeFallbackConfigs, extractJsonFromText } from '@/lib/ai';

function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

const ADMIN_KEY = process.env.ADMIN_SESSION_KEY || 'toldi-admin-2024';

interface BulkRequest {
  type: 'blog' | 'page';
  topic: string;
  city?: string;
  phone?: string;
  email?: string;
  prices?: string;
  config_id?: string;
  count?: number;
}

export async function POST(req: NextRequest) {
  try {
    const adminKey = req.headers.get('x-admin-key');
    if (adminKey !== ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: BulkRequest = await req.json();
    if (!body.topic?.trim()) {
      return NextResponse.json({ error: 'Téma kötelező' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Gather all active AI configs
    let configQuery = admin.from('ai_configs').select('*').eq('is_active', true);
    if (body.config_id) {
      configQuery = configQuery.eq('id', body.config_id);
    }
    const { data: dbConfigs } = await configQuery;
    const configs = [...(dbConfigs ?? []), ...getFreeFallbackConfigs()];

    const phone = body.phone || '+36 30 582 0870';
    const email = body.email || 'info@toldigumi.hu';
    const prices = body.prices || '';
    const city = body.city || '';

    if (body.type === 'blog') {
      const systemPrompt = `Te egy tapasztalt autóipari SEO blogger vagy. Feladatod: a kapott témából készíts teljes, SEO-optimalizált blog bejegyzést JSON formátumban.
Vállalkozás: Toldi Mobil Gumi és Klíma (mobil gumiszerviz, Budapest és Pest megye)
Telefon: ${phone}
Email: ${email}
${prices ? 'Árak: ' + prices : ''}

Fontos AI-optimalizálási szabályok:
- A tartalom legyen tényalapú, pontos és hasznos az olvasó számára
- Használj strukturált HTML tageket (h2, h3, p, ul, li, strong, em, blockquote)
- Minden szakasz legyen logikusan tagolva, könnyen áttekinthető
- Tartalmazzon GYIK részt a végén kérdés-felelet formátumban
- A telefonszám (${phone}) és email (${email}) szerepeljen CTA-ban
- A tartalom legyen minimum 1500 szó, de inkább részletes mint felszínes
- Használj természetes nyelvezetet, kerüld a keyword stuffing-ot
- Tartalmazzon konkrét tippeket és tanácsokat a látogatóknak

KRITIKUS SZABÁLYOK:
1. A válasz CSAK egy JSON objektum legyen, semmi más szöveg előtte vagy utána
2. Ne használj markdown kódblokkokat
3. A content_html mezőben lévő HTML attribútumokban ne használj idézőjeleket, vagy escape-eld őket
4. A JSON érvényes kell legyen

Visszaadandó JSON (csak ezt, semmi más):
{
  "title": "SEO-optimalizált cikk cím (50-60 karakter)",
  "excerpt": "Rövid, figyelemfelkeltő összefoglaló 120-160 karakter",
  "content_html": "Teljes blog tartalom HTML formátumban, minimum 1500 szó, GYAKORI KÉRDÉSEK résszel",
  "meta_title": "Meta cím (50-60 karakter, kulcsszóval)",
  "meta_description": "Meta leírás (140-160 karakter)",
  "tags": ["tag1","tag2","tag3","tag4","tag5"],
  "slug": "url-barat-cim-kezeltek"
}`;

      const userPrompt = `Készíts SEO-optimalizált blog bejegyzést az alábbi témából:
Téma: "${body.topic}"
${city ? `Város: ${city}` : ''}

Fontos:
- A cím legyen figyelemfelkeltő és tartalmazza a kulcsszavakat
- A tartalom minimum 1500 szó, strukturált szakaszokkal
- Természetes SEO, nem keyword stuffing
- Tartalmazza a telefonszámot (${phone}) CTA-ban
- Tartalmazza az email címet (${email}) a kapcsolat résznél
${prices ? `- Tartalmazza az árakat where relevant` : ''}
- Valós, emberközeli hangvétel`;

      const { result: raw, configUsed: config } = await generateWithFallback({ configs, systemPrompt, userPrompt, maxTokens: 8000 });
      const result = extractJsonFromText(raw);

      const { error: insertError } = await admin.from('blog_posts').insert({
        title: result.title,
        slug: result.slug || body.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        excerpt: result.excerpt,
        content_html: result.content_html,
        meta_title: result.meta_title,
        meta_description: result.meta_description,
        tags: result.tags || [],
        lang: 'hu',
        author: 'Toldi Mobil Gumi',
        is_published: true,
        published_at: new Date().toISOString(),
      });

      if (insertError) {
        return NextResponse.json({ error: `Blog mentése sikertelen: ${insertError.message}` }, { status: 500 });
      }

      await admin.from('ai_generation_log').insert({
        config_id: config.id !== 'fallback-pollinations' ? config.id : null,
        config_name: config.name,
        type: 'blog',
        topic: body.topic,
        status: 'success',
      });

      return NextResponse.json({ success: true, type: 'blog', result });
    } else {
      const systemPrompt = `Te egy tapasztalt weboldal tartalomkészítő vagy. Feladatod: a kapott témából készíts teljes, SEO-optimalizált aloldal tartalmat JSON formátumban.
Vállalkozás: Toldi Mobil Gumi és Klíma (mobil gumiszerviz, Budapest és Pest megye)
Telefon: ${phone}
Email: ${email}
${prices ? `Árak: ${prices}` : ''}

Fontos AI-optimalizálási szabályok:
- A tartalom legyen tényalapú, pontos és hasznos
- Használj strukturált HTML tageket (h1, h2, h3, p, ul, li, strong, em, blockquote)
- Tartalmazzon GYIK részt a végén
- A telefonszám (${phone}) és email (${email}) szerepeljen
- Minimum 1000 szó, de inkább részletes
- Természetes nyelvezet, konkrét tippek

KRITIKUS SZABÁLYOK:
1. A válasz CSAK egy JSON objektum legyen, semmi más szöveg előtte vagy utána
2. Ne használj markdown kódblokkokat
3. A content_html mezőben lévő HTML attribútumokban ne használj idézőjeleket, vagy escape-eld őket
4. A JSON érvényes kell legyen

Visszaadandó JSON (csak ezt, semmi más):
{
  "title": "Oldal címe (50-60 karakter)",
  "slug": "url-barat-slug",
  "meta_title": "Meta cím (50-60 karakter)",
  "meta_description": "Meta leírás (140-160 karakter)",
  "content_html": "Teljes oldal tartalom HTML formátumban, GYIK résszel",
  "is_published": true
}`;

      const userPrompt = `Készíts SEO-optimalizált aloldalt az alábbi témából:
Téma: "${body.topic}"
${city ? `Város: ${city}` : ''}

Fontos:
- A cím legyen figyelemfelkeltő és tartalmazza a kulcsszavakat
- A tartalom minimum 1000 szó, strukturált szakaszokkal
- Természetes SEO, nem keyword stuffing
- Tartalmazza a telefonszámot (${phone}) CTA-ban
- Tartalmazza az email címet (${email})
${prices ? `- Tartalmazza az árakat ahol releváns` : ''}
- Professzionális, de barátságos hangvétel`;

      const { result: raw, configUsed: config } = await generateWithFallback({ configs, systemPrompt, userPrompt, maxTokens: 8000 });
      const result = extractJsonFromText(raw);

      const { error: insertError } = await admin.from('pages').insert({
        title: result.title,
        slug: result.slug || body.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        meta_title: result.meta_title,
        meta_description: result.meta_description,
        content_html: result.content_html,
        is_published: result.is_published ?? true,
      });

      if (insertError) {
        return NextResponse.json({ error: `Oldal mentése sikertelen: ${insertError.message}` }, { status: 500 });
      }

      await admin.from('ai_generation_log').insert({
        config_id: config.id !== 'fallback-pollinations' ? config.id : null,
        config_name: config.name,
        type: 'page',
        topic: body.topic,
        status: 'success',
      });

      return NextResponse.json({ success: true, type: 'page', result });
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Ismeretlen hiba';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
