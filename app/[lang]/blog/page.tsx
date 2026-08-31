import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Tag, ArrowRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ContactSection from '@/components/sections/ContactSection';
import AppRecommendation from '@/components/AppRecommendation';
import StructuredData from '@/components/seo/StructuredData';
import { getDictionary } from '@/lib/i18n';
import { getSettings, getNavigation, getPublishedBlogPosts } from '@/lib/db';

interface Props {
  params: { lang: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dict = getDictionary(params.lang);
  const settings = await getSettings();
  return {
    title: `${dict.blog.title} | ${settings.site_name}`,
    description: dict.blog.subtitle,
    alternates: {
      canonical: `https://toldimobilgumi.hu/${params.lang}/blog`,
      languages: { hu: '/hu/blog', en: '/en/blog', de: '/de/blog' },
    },
  };
}

function formatDate(dateStr: string, lang: string): string {
  try {
    const locales: Record<string, string> = { hu: 'hu-HU', en: 'en-US', de: 'de-DE' };
    return new Date(dateStr).toLocaleDateString(locales[lang] ?? 'hu-HU', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default async function BlogLangPage({ params }: Props) {
  const dict = getDictionary(params.lang);
  const [settings, navigation, posts] = await Promise.all([
    getSettings(),
    getNavigation(),
    getPublishedBlogPosts(params.lang),
  ]);

  const breadcrumbs = [
    { name: dict.nav.home, url: `/${params.lang}` },
    { name: dict.nav.blog, url: `/${params.lang}/blog` },
  ];

  return (
    <>
      <StructuredData type="BreadcrumbList" breadcrumbs={breadcrumbs} />
      <Header settings={settings} navigation={navigation} lang={params.lang} dict={dict} />
      <main>
        <section className="bg-slate-900 pt-32 pb-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <span className="text-red-400 font-semibold text-sm uppercase tracking-wider">{dict.blog.label}</span>
            <h1 className="text-4xl md:text-5xl font-black text-white mt-2 mb-4">{dict.blog.title}</h1>
            <p className="text-slate-400 max-w-2xl mx-auto">{dict.blog.subtitle}</p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            {posts.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <p>{dict.blog.no_posts}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/${params.lang}/blog/${post.slug}`}
                    className="group bg-slate-50 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-red-100"
                  >
                    {post.featured_image && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={`${post.featured_image}?auto=compress&cs=tinysrgb&w=640`}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      {post.tags.length > 0 && (
                        <div className="flex gap-1.5 mb-3 flex-wrap">
                          {post.tags.map((tag) => (
                            <span key={tag} className="bg-red-50 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <h2 className="font-bold text-slate-900 mb-3 group-hover:text-red-600 transition-colors leading-snug text-lg">{post.title}</h2>
                      {post.excerpt && (
                        <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(post.published_at, params.lang)}
                        </div>
                        <span className="flex items-center gap-1 text-red-600 text-xs font-semibold group-hover:gap-2 transition-all">
                          {dict.blog.read_more} <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="mt-8 mb-8">
          <AppRecommendation lang={params.lang} />
        </div>
        <ContactSection settings={settings} lang={params.lang} dict={dict} />
      </main>
      <Footer settings={settings} navigation={navigation} lang={params.lang} dict={dict} />
    </>
  );
}
