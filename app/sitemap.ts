import { MetadataRoute } from 'next';
import { getPublishedPages, getPublishedBlogPosts } from '@/lib/db';

const LANGS = ['hu', 'en', 'de'];
const BASE = 'https://toldimobilgumi.hu';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, posts] = await Promise.all([
    getPublishedPages(),
    getPublishedBlogPosts(),
  ]);

  const routes: MetadataRoute.Sitemap = [];

  // Homepage per language
  for (const lang of LANGS) {
    routes.push({
      url: `${BASE}/${lang}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: lang === 'hu' ? 1 : 0.8,
    });
  }

  // Blog index per language
  for (const lang of LANGS) {
    routes.push({
      url: `${BASE}/${lang}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  // Tool pages per language
  const toolPaths = ['/gumimeretek', '/gumi-auto-kereses', '/gumimeret-valto', '/klima-adatbázis', '/toldi-mobile'];
  for (const lang of LANGS) {
    for (const tp of toolPaths) {
      routes.push({
        url: `${BASE}/${lang}${tp}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  // CMS pages
  for (const p of pages) {
    const lang = p.lang || 'hu';
    routes.push({
      url: `${BASE}/${lang}/${p.slug}`,
      lastModified: new Date(p.updated_at || p.created_at || Date.now()),
      changeFrequency: p.is_city_page ? 'monthly' : 'weekly',
      priority: p.is_city_page ? 0.7 : 0.8,
    });
  }

  // Blog posts
  for (const p of posts) {
    const lang = p.lang || 'hu';
    routes.push({
      url: `${BASE}/${lang}/blog/${p.slug}`,
      lastModified: new Date(p.updated_at || p.published_at || Date.now()),
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  return routes;
}
