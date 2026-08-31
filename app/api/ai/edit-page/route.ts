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

    const body = await req.json();
    const { action, pageId, blogId, instruction } = body;

    const admin = createAdminClient();
    const { data: dbConfigs } = await admin.from('ai_configs').select('*').eq('is_active', true);
    const configs = [...(dbConfigs ?? []), ...getFreeFallbackConfigs()];

    if (action === 'edit_page' && pageId) {
      const { data: page } = await admin.from('pages').select('*').eq('id', pageId).maybeSingle();
      if (!page) return NextResponse.json({ error: 'Oldal nem található' }, { status: 404 });

      const systemPrompt = `Te egy weboldal szerkesztő asszisztens vagy. A felhasználó utasítása alapján módosítsd az oldal tartalmát.
A jelenlegi oldal adatai:
- Cím: ${page.title}
- Hero cím: ${page.hero_title || ''}
- Hero alcím: ${page.hero_subtitle || ''}
- Tartalom (HTML): ${page.content_html || ''}
- Meta cím: ${page.meta_title || ''}
- Meta leírás: ${page.meta_description || ''}

Visszaadandó JSON:
{
  "title": "új cím (ha változik)",
  "hero_title": "új hero cím (ha változik)",
  "hero_subtitle": "új hero alcím (ha változik)",
  "content_html": "új teljes HTML tartalom",
  "meta_title": "új meta cím (ha változik)",
  "meta_description": "új meta leírás (ha változik)"
}

FONTOS: Csak a kért módosításokat végezd el, a többi tartalmat hagyd változatlanul. A HTML tartalmat teljes egészében add vissza.`;

      const { result: raw, configUsed: config } = await generateWithFallback({ configs, systemPrompt, userPrompt: `Utasítás: ${instruction}`, maxTokens: 8000 });
      const result = extractJsonFromText<Record<string, any>>(raw);

      const updateData: Record<string, string> = {};
      if (result.title) updateData.title = result.title;
      if (result.hero_title !== undefined) updateData.hero_title = result.hero_title;
      if (result.hero_subtitle !== undefined) updateData.hero_subtitle = result.hero_subtitle;
      if (result.content_html) updateData.content_html = result.content_html;
      if (result.meta_title !== undefined) updateData.meta_title = result.meta_title;
      if (result.meta_description !== undefined) updateData.meta_description = result.meta_description;
      updateData.updated_at = new Date().toISOString();

      await admin.from('pages').update(updateData).eq('id', pageId);

      await admin.from('ai_generation_log').insert({
        config_id: config.id !== 'fallback-pollinations' ? config.id : null,
        config_name: config.name,
        type: 'page_edit',
        topic: instruction,
        status: 'success',
      });

      return NextResponse.json({ success: true, updated: updateData });
    }

    if (action === 'edit_blog' && blogId) {
      const { data: post } = await admin.from('blog_posts').select('*').eq('id', blogId).maybeSingle();
      if (!post) return NextResponse.json({ error: 'Blog bejegyzés nem található' }, { status: 404 });

      const systemPrompt = `Te egy blog szerkesztő asszisztens vagy. A felhasználó utasítása alapján módosítsd a blog bejegyzés tartalmát.
A jelenlegi blog bejegyzés adatai:
- Cím: ${post.title}
- Kivonat: ${post.excerpt || ''}
- Tartalom (HTML): ${post.content_html || ''}
- Meta cím: ${post.meta_title || ''}
- Meta leírás: ${post.meta_description || ''}
- Címkék: ${JSON.stringify(post.tags)}

Visszaadandó JSON:
{
  "title": "új cím (ha változik)",
  "excerpt": "új kivonat (ha változik)",
  "content_html": "új teljes HTML tartalom",
  "meta_title": "új meta cím (ha változik)",
  "meta_description": "új meta leírás (ha változik)",
  "tags": ["címke1", "címke2"]
}

FONTOS: Csak a kért módosításokat végezd el, a többi tartalmat hagyd változatlanul.`;

      const { result: raw, configUsed: config } = await generateWithFallback({ configs, systemPrompt, userPrompt: `Utasítás: ${instruction}`, maxTokens: 8000 });
      const result = extractJsonFromText<Record<string, any>>(raw);

      const updateData: Record<string, unknown> = {};
      if (result.title) updateData.title = result.title;
      if (result.excerpt !== undefined) updateData.excerpt = result.excerpt;
      if (result.content_html) updateData.content_html = result.content_html;
      if (result.meta_title !== undefined) updateData.meta_title = result.meta_title;
      if (result.meta_description !== undefined) updateData.meta_description = result.meta_description;
      if (result.tags) updateData.tags = result.tags;
      updateData.updated_at = new Date().toISOString();

      await admin.from('blog_posts').update(updateData).eq('id', blogId);

      await admin.from('ai_generation_log').insert({
        config_id: config.id !== 'fallback-pollinations' ? config.id : null,
        config_name: config.name,
        type: 'blog_edit',
        topic: instruction,
        status: 'success',
      });

      return NextResponse.json({ success: true, updated: updateData });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Ismeretlen hiba';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
