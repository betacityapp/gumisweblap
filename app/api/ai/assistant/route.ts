import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateWithFallback, getFreeFallbackConfigs, extractJsonFromText } from '@/lib/ai';

function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

const ADMIN_KEY = process.env.ADMIN_SESSION_KEY || 'toldi-admin-2024';

export async function GET(req: NextRequest) {
  try {
    const adminKey = req.headers.get('x-admin-key');
    if (adminKey !== ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createAdminClient();
    const searchParams = req.nextUrl.searchParams;
    const action = searchParams.get('action') || 'overview';

    if (action === 'overview') {
      const now = new Date();
      const dayAgo = new Date(now.getTime() - 86400000);
      const weekAgo = new Date(now.getTime() - 7 * 86400000);

      const [pages24, pagesWeek, topPaths, recentViews, blogCount, pageCount] = await Promise.all([
        admin.from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', dayAgo.toISOString()),
        admin.from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
        admin.from('page_views').select('path').gte('created_at', weekAgo.toISOString()),
        admin.from('page_views').select('*').order('created_at', { ascending: false }).limit(20),
        admin.from('blog_posts').select('id', { count: 'exact', head: true }),
        admin.from('pages').select('id', { count: 'exact', head: true }),
      ]);

      const pathCounts: Record<string, number> = {};
      for (const row of topPaths.data ?? []) {
        const p = (row as any).path;
        pathCounts[p] = (pathCounts[p] || 0) + 1;
      }
      const topPages = Object.entries(pathCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([path, count]) => ({ path, count }));

      return NextResponse.json({
        views24h: pages24.count ?? 0,
        views7d: pagesWeek.count ?? 0,
        topPages,
        recentViews: (recentViews.data as any[]) ?? [],
        blogCount: blogCount.count ?? 0,
        pageCount: pageCount.count ?? 0,
      });
    }

    if (action === 'recommendations') {
      const admin = createAdminClient();
      const weekAgo = new Date(Date.now() - 7 * 86400000);

      const [topPaths, allPaths, blogCount, pageCount, blogPosts] = await Promise.all([
        admin.from('page_views').select('path').gte('created_at', weekAgo.toISOString()),
        admin.from('page_views').select('path').gte('created_at', weekAgo.toISOString()),
        admin.from('blog_posts').select('id,title,slug,published_at', { count: 'exact', head: false }).limit(5),
        admin.from('pages').select('id,title,slug', { count: 'exact', head: false }).limit(5),
        admin.from('blog_posts').select('title,slug,published_at').order('published_at', { ascending: false }).limit(5),
      ]);

      const pathCounts: Record<string, number> = {};
      for (const row of topPaths.data ?? []) {
        const p = (row as any).path;
        pathCounts[p] = (pathCounts[p] || 0) + 1;
      }
      const topPages = Object.entries(pathCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([path, count]) => ({ path, count }));

      const { data: dbConfigs } = await admin.from('ai_configs').select('*').eq('is_active', true);
      const configs = [...(dbConfigs ?? []), ...getFreeFallbackConfigs()];

      const systemPrompt = `Te egy weboldal SEO és tartalom asszisztens vagy. A kapott adatok alapján adj konkrét, gyakorlati javaslatokat a weblap javítására.
Vállalkozás: Toldi Mobil Gumi és Klíma (mobil gumiszerviz, Budapest és Pest megye)

KRITIKUS SZABÁLYOK:
1. A válasz CSAK egy JSON objektum legyen, semmi más szöveg előtte vagy utána
2. Ne használj markdown kódblokkokat
3. A JSON érvényes kell legyen

Visszaadandó JSON:
{
  "recommendations": [
    {
      "priority": "high|medium|low",
      "category": "tartalom|seo|technikai|konverzió",
      "title": "Rövid javaslat cím",
      "description": "Részletes leírás, mit és miért érdemes csinálni",
      "action": "Konkrét lépés, mit kell tenni"
    }
  ],
  "content_ideas": [
    {
      "type": "blog|page",
      "title": "Cikk/oldal cím javaslat",
      "reason": "Miért érdemes ezt elkészíteni"
    }
  ]
}`;

      const userPrompt = `Weboldal statisztikák (utóbbi 7 nap):
Legnépszerűbb oldalak: ${JSON.stringify(topPages)}
Blog cikkek száma: ${blogCount.count}
Aloldalak száma: ${pageCount.count}
Legutóbbi blog cikkek: ${JSON.stringify(blogPosts.data)}

Kérlek elemezd és adj javaslatokat:
1. Milyen tartalmat érdemes készíteni a népszerű oldalak alapján?
2. Milyen SEO javításokat érdemes eszközölni?
3. Milyen technikai javítások kellenek?
4. Milyen konverzió növelő lépések javasoltak?`;

      const { result: raw, configUsed: config } = await generateWithFallback({ configs, systemPrompt, userPrompt, maxTokens: 4000 });
      const result = extractJsonFromText(raw);

      await admin.from('ai_generation_log').insert({
        config_id: config.id !== 'fallback-pollinations' ? config.id : null,
        config_name: config.name,
        type: 'recommendations',
        topic: 'site-analysis',
        status: 'success',
      });

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Ismeretlen hiba';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
