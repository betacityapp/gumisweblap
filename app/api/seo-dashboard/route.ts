import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_KEY = process.env.ADMIN_SESSION_KEY || 'toldi-admin-2024';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const { action } = await req.json();
  const admin = adminClient();

  if (action === 'audit') {
    const checks: any[] = [];
    const stats: any = {};

    const [{ count: pubPages }, { count: pubBlogs }, { count: cityPages }] = await Promise.all([
      admin.from('pages').select('*', { count: 'exact', head: true }).eq('is_published', true),
      admin.from('blog_posts').select('*', { count: 'exact', head: true }).eq('is_published', true),
      admin.from('pages').select('*', { count: 'exact', head: true }).eq('is_city_page', true).eq('is_published', true),
    ]);

    stats.pageCount = pubPages || 0;
    stats.blogCount = pubBlogs || 0;
    stats.cityCount = cityPages || 0;

    checks.push({ id: 'pages', label: 'Publikált oldalak', status: (pubPages || 0) > 5 ? 'pass' : 'warn', detail: `${pubPages || 0} publikált oldal` });
    checks.push({ id: 'blogs', label: 'Blog bejegyzések', status: (pubBlogs || 0) > 3 ? 'pass' : (pubBlogs || 0) > 0 ? 'warn' : 'fail', detail: `${pubBlogs || 0} publikált blog bejegyzés` });
    checks.push({ id: 'cities', label: 'Város oldalak', status: (cityPages || 0) > 10 ? 'pass' : (cityPages || 0) > 0 ? 'warn' : 'fail', detail: `${cityPages || 0} város oldal` });

    const { data: pagesWithoutMeta } = await admin.from('pages').select('id, title, meta_description').eq('is_published', true).or('meta_description.is.null,meta_description.eq.');
    const withoutMeta = (pagesWithoutMeta || []).length;
    checks.push({ id: 'meta', label: 'Meta leírások', status: withoutMeta === 0 ? 'pass' : withoutMeta < 3 ? 'warn' : 'fail', detail: withoutMeta === 0 ? 'Minden oldalnak van meta leírása' : `${withoutMeta} oldalnak hiányzik a meta leírása` });

    const { data: emptyPages } = await admin.from('pages').select('id, title, content_html').eq('is_published', true).or('content_html.is.null,content_html.eq.');
    const empty = (emptyPages || []).length;
    checks.push({ id: 'content', label: 'Tartalom', status: empty === 0 ? 'pass' : empty < 3 ? 'warn' : 'fail', detail: empty === 0 ? 'Minden oldalnak van tartalma' : `${empty} oldalnak hiányzik a tartalma` });

    const { count: faqCount } = await admin.from('faq_items').select('*', { count: 'exact', head: true }).eq('is_active', true);
    checks.push({ id: 'faq', label: 'GYIK kérdések', status: (faqCount || 0) > 5 ? 'pass' : (faqCount || 0) > 0 ? 'warn' : 'fail', detail: `${faqCount || 0} GYIK kérdés` });

    const { count: serviceCount } = await admin.from('services').select('*', { count: 'exact', head: true }).eq('is_active', true);
    checks.push({ id: 'services', label: 'Szolgáltatások', status: (serviceCount || 0) > 3 ? 'pass' : (serviceCount || 0) > 0 ? 'warn' : 'fail', detail: `${serviceCount || 0} szolgáltatás` });

    const { count: priceCount } = await admin.from('price_items').select('*', { count: 'exact', head: true }).eq('is_active', true);
    checks.push({ id: 'prices', label: 'Árlista', status: (priceCount || 0) > 5 ? 'pass' : (priceCount || 0) > 0 ? 'warn' : 'fail', detail: `${priceCount || 0} árlista tétel` });

    checks.push({ id: 'sitemap', label: 'Sitemap.xml', status: 'pass', detail: 'Automatikusan generálva' });
    checks.push({ id: 'robots', label: 'Robots.txt', status: 'pass', detail: 'Automatikusan generálva' });

    return NextResponse.json({ checks, stats });
  }

  if (action === 'auto_improve') {
    const actions: string[] = [];

    // 1. Fix missing meta descriptions on pages
    const { data: pagesWithoutMeta } = await admin.from('pages').select('id, title, city, is_city_page').eq('is_published', true).or('meta_description.is.null,meta_description.eq.');
    if (pagesWithoutMeta && pagesWithoutMeta.length > 0) {
      for (const page of pagesWithoutMeta) {
        const metaDesc = page.is_city_page
          ? `Mobil gumiszerviz ${page.city} területén. Gumicsere, defektjavítás, klímatöltés helyszínen – 0-24 órában. Telefon: +36 30 582 0870`
          : `Professzionális ${page.title} szolgáltatás. Helyszíni gumiszerelés, defektjavítás – 0-24 órában.`;
        await admin.from('pages').update({ meta_description: metaDesc }).eq('id', page.id);
      }
      actions.push(`${pagesWithoutMeta.length} oldal meta leírása javítva`);
    }

    // 2. Fix missing meta titles on pages
    const { data: pagesWithoutMetaTitle } = await admin.from('pages').select('id, title, city, is_city_page').eq('is_published', true).or('meta_title.is.null,meta_title.eq.');
    if (pagesWithoutMetaTitle && pagesWithoutMetaTitle.length > 0) {
      for (const page of pagesWithoutMetaTitle) {
        const metaTitle = page.is_city_page
          ? `Mobil Gumiszerviz ${page.city} – Helyszíni Gumiszerelés | Toldi`
          : `${page.title} | Toldi Mobil Gumi`;
        await admin.from('pages').update({ meta_title: metaTitle }).eq('id', page.id);
      }
      actions.push(`${pagesWithoutMetaTitle.length} oldal meta címe javítva`);
    }

    // 3. Fix blog posts without meta descriptions
    const { data: blogsWithoutMeta } = await admin.from('blog_posts').select('id, title, excerpt').eq('is_published', true).or('meta_description.is.null,meta_description.eq.');
    if (blogsWithoutMeta && blogsWithoutMeta.length > 0) {
      for (const blog of blogsWithoutMeta) {
        const metaDesc = (blog.excerpt || blog.title).substring(0, 155);
        await admin.from('blog_posts').update({ meta_description: metaDesc }).eq('id', blog.id);
      }
      actions.push(`${blogsWithoutMeta.length} blog meta leírása javítva`);
    }

    // 4. Fix city page slugs
    const { data: cityPagesData } = await admin.from('pages').select('id, slug, city').eq('is_city_page', true).eq('is_published', true);
    if (cityPagesData && cityPagesData.length > 0) {
      let fixed = 0;
      for (const page of cityPagesData) {
        const expectedSlug = `mobil-gumiszerviz-${(page.city || '').toLowerCase().replace(/[áéíóöőúüű]/g, (c: string) => ({ 'á':'a','é':'e','í':'i','ó':'o','ö':'o','ő':'o','ú':'u','ü':'u','ű':'u' }[c] || c)).replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
        if (page.slug !== expectedSlug && expectedSlug.length > 15) {
          await admin.from('pages').update({ slug: expectedSlug }).eq('id', page.id);
          fixed++;
        }
      }
      if (fixed > 0) actions.push(`${fixed} város oldal URL javítva`);
    }

    const message = actions.length === 0 ? 'Minden rendben! Nem találtam javítandó SEO problémát.' : `Javítva: ${actions.join(', ')}`;
    return NextResponse.json({ message });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
