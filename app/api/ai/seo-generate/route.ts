import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateWithFallback, getFreeFallbackConfigs, buildCityPagePrompt, buildBlogPostPrompt, buildPageContentPrompt } from '@/lib/ai';

function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

const ADMIN_KEY = process.env.ADMIN_SESSION_KEY || 'toldi-admin-2024';

interface SeoGenerateRequest {
  type: 'city_page' | 'blog_post' | 'page_content' | 'save_page' | 'save_blog';
  cityName?: string;
  cityLayout?: string;
  blogTopic?: string;
  blogTitle?: string;
  pageTitle?: string;
  pageType?: string;
  config_id?: string;
  slug?: string;
  content?: string;
  title?: string;
  topic?: string;
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
  cityImages?: string;
  partnerName?: string;
  partnerPhone?: string;
  partnerUrl?: string;
  partnerDesc?: string;
  internalLinks?: string;
  blogCity?: string;
  blogImages?: string;
}

export async function POST(req: NextRequest) {
  try {
    const adminKey = req.headers.get('x-admin-key');
    if (adminKey !== ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: SeoGenerateRequest = await req.json();
    const admin = createAdminClient();

    let configQuery = admin.from('ai_configs').select('*').eq('is_active', true);
    if (body.config_id) {
      configQuery = configQuery.eq('id', body.config_id);
    }
    const { data: dbConfigs, error: configErr } = await configQuery;
    if (configErr) {
      return NextResponse.json({ error: `AI konfigurációk betöltése sikertelen: ${configErr.message}` }, { status: 500 });
    }
    const configs = [...(dbConfigs ?? []), ...getFreeFallbackConfigs()];

    const { data: settingsRow } = await admin.from('site_settings').select('*').limit(1).maybeSingle();
    const siteName = (settingsRow as any)?.site_name || 'Toldi Mobil Gumi és Klíma';
    const phone = (settingsRow as any)?.phone || '+36 30 582 0870';

    if (body.type === 'save_page' && body.slug && body.content) {
      const cityName = body.cityName || '';
      const { error: insertError } = await admin.from('pages').insert({
        slug: body.slug,
        lang: 'hu',
        title: `Mobil Gumiszerviz ${cityName}`,
        meta_title: `Mobil Gumiszerviz ${cityName} – Helyszíni Gumiszerelés | Toldi`,
        meta_description: `Professzionális mobil gumiszerviz ${cityName}on/en. Gumicsere, defektjavítás, klímatöltés helyszínen – 0-24 órában.`,
        hero_title: `Mobil Gumiszerviz ${cityName}on`,
        hero_subtitle: `Professzionális helyszíni gumiszerelés, defektjavítás és klímatöltés ${cityName} egész területén – 0-24 órában`,
        content_html: body.content,
        page_sections: ['hero', 'services', 'prices', 'faq', 'contact'],
        city: cityName,
        is_city_page: true,
        is_published: true,
        sort_order: 50,
        show_reviews: false,
        show_comments: false,
        layout_variant: body.cityLayout || 'default',
      });
      if (insertError) {
        return NextResponse.json({ error: `Oldal mentése sikertelen: ${insertError.message}` }, { status: 500 });
      }
      return NextResponse.json({ success: true, slug: body.slug });
    }

    if (body.type === 'save_blog' && body.slug && body.content && body.title) {
      const { error: insertError } = await admin.from('blog_posts').insert({
        slug: body.slug,
        lang: 'hu',
        title: body.title,
        excerpt: body.topic || '',
        content_html: body.content,
        tags: ['ai-generált'],
        meta_title: body.title,
        meta_description: body.topic || '',
        author: 'Toldi Mobil Gumi',
        city: body.cityName || null,
        is_published: false,
        published_at: new Date().toISOString(),
      });
      if (insertError) {
        return NextResponse.json({ error: `Blog mentése sikertelen: ${insertError.message}` }, { status: 500 });
      }
      return NextResponse.json({ success: true, slug: body.slug });
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (body.type === 'city_page' && body.cityName) {
      systemPrompt = 'Te egy tapasztalt SEO szakértő, helyi SEO specialista, autóipari copywriter és tartalomstratéga vagy.';
      const partnerInfo = body.partnerName ? `
VONTATÓ PARTNER ADATAI (a tartalomba kell beépíteni):
Név: ${body.partnerName}
Telefonszám: ${body.partnerPhone || ''}
Weboldal: ${body.partnerUrl || ''}
Leírás: ${body.partnerDesc || ''}
Ezeket az adatokat egy <div class="partner-card"> blokkban jelenítsd meg a tartalomban.` : '';
      const imageInfo = body.cityImages ? `
KÉPEK (építsd be ezeket a tartalomba <img> tagekkel):
${body.cityImages}` : '';
      const linkInfo = body.internalLinks ? `
BELSŐ LINKEK (építsd be a tartalomba <a> tagekkel):
${body.internalLinks.split('\n').map(l => { const [url, text] = l.split('|'); return `- <a href="${url?.trim() || ''}">${text?.trim() || ''}</a>`; }).join('\n')}` : '';
      userPrompt = buildCityPagePrompt({
        city: body.cityName,
        siteName,
        phone,
        layoutVariant: body.cityLayout || 'default',
        email: body.email,
        businessAvailability: body.businessAvailability,
        averageArrivalTime: body.averageArrivalTime,
        minimumPrice: body.minimumPrice,
        kmPrice: body.kmPrice,
        districts: body.districts,
        nearbyCities: body.nearbyCities,
        mainRoads: body.mainRoads,
        motorways: body.motorways,
        industrialAreas: body.industrialAreas,
        localPlaces: body.localPlaces,
        serviceArea: body.serviceArea,
        customPrices: body.customPrices,
      }) + partnerInfo + imageInfo + linkInfo;
    } else if (body.type === 'blog_post' && body.blogTopic) {
      systemPrompt = 'Te egy autóipari blog szerzője vagy.';
      userPrompt = buildBlogPostPrompt(body.blogTopic, siteName, phone);
    } else if (body.type === 'page_content' && body.pageTitle) {
      systemPrompt = 'Te egy SEO-szakértő copywriter vagy.';
      userPrompt = buildPageContentPrompt(body.pageTitle, body.pageType || 'service', siteName, phone);
    } else {
      return NextResponse.json({ error: 'Hiányzó mezők a generáláshoz' }, { status: 400 });
    }

    const { result: content, configUsed: config } = await generateWithFallback({
      configs,
      systemPrompt,
      userPrompt,
      maxTokens: 8000,
    });

    await admin.from('ai_generation_log').insert({
      config_id: config.id !== 'fallback-pollinations' ? config.id : null,
      config_name: config.name,
      type: body.type,
      topic: body.cityName || body.blogTopic || body.pageTitle || '',
      status: 'success',
    });

    return NextResponse.json({ content, configUsed: config.name });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Ismeretlen hiba';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
