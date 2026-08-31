import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Tag, ArrowLeft, User } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ContactSection from '@/components/sections/ContactSection';
import AppRecommendation from '@/components/AppRecommendation';
import BlockRenderer from '@/components/BlockRenderer';
import StructuredData from '@/components/seo/StructuredData';
import { getDictionary } from '@/lib/i18n';
import { getSettings, getNavigation, getBlogPostBySlug, getPublishedBlogPosts, getPageBlocks } from '@/lib/db';

interface Props {
  params: { lang: string; slug: string };
}

export async function generateStaticParams() {
  const posts = await getPublishedBlogPosts();
  const langs = ['hu', 'en', 'de'];
  const params: { lang: string; slug: string }[] = [];
  for (const lang of langs) {
    for (const p of posts) {
      params.push({ lang, slug: p.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug, params.lang) ?? await getBlogPostBySlug(params.slug);
  if (!post) return {};
  const settings = await getSettings();
  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt || settings.site_description,
    openGraph: {
      type: 'article',
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || '',
      images: post.featured_image
        ? [{ url: post.featured_image }]
        : [`/api/og?lang=${params.lang}&title=${encodeURIComponent(post.title)}`],
      publishedTime: post.published_at,
      authors: [post.author],
    },
    alternates: {
      canonical: `https://toldimobilgumi.hu/${params.lang}/blog/${params.slug}`,
      languages: { hu: `/hu/blog/${params.slug}`, en: `/en/blog/${params.slug}`, de: `/de/blog/${params.slug}` },
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

export default async function BlogPostLangPage({ params }: Props) {
  const dict = getDictionary(params.lang);
  const [post, settings, navigation] = await Promise.all([
    getBlogPostBySlug(params.slug, params.lang).then((p) => p ?? getBlogPostBySlug(params.slug)),
    getSettings(),
    getNavigation(),
  ]);

  if (!post) notFound();

  const blogBlocks = await getPageBlocks('blog', post.id);

  const breadcrumbs = [
    { name: dict.nav.home, url: `/${params.lang}` },
    { name: dict.nav.blog, url: `/${params.lang}/blog` },
    { name: post.title, url: `/${params.lang}/blog/${post.slug}` },
  ];

  return (
    <>
      <StructuredData type="Article" post={post} />
      <StructuredData type="BreadcrumbList" breadcrumbs={breadcrumbs} />
      <Header settings={settings} navigation={navigation} lang={params.lang} dict={dict} />
      <main>
        <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 pt-32 pb-12 relative overflow-hidden">
          {/* Decorative gradient orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-red-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
          <div className="max-w-4xl mx-auto px-4 relative">
            <Link href={`/${params.lang}/blog`} className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {dict.blog.back}
            </Link>
            {post.tags.length > 0 && (
              <div className="flex gap-1.5 mb-4 flex-wrap">
                {post.tags.map((tag) => (
                  <span key={tag} className="bg-red-600/20 text-red-300 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    <Tag className="w-3 h-3" />{tag}
                  </span>
                ))}
              </div>
            )}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-6">{post.title}</h1>
            <div className="flex items-center gap-4 text-slate-400 text-sm">
              <div className="flex items-center gap-1.5"><User className="w-4 h-4" />{post.author}</div>
              <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{formatDate(post.published_at, params.lang)}</div>
            </div>
          </div>
        </section>

        {post.featured_image && (
          <div className="bg-slate-800">
            <div className="max-w-4xl mx-auto">
              <img src={`${post.featured_image}?auto=compress&cs=tinysrgb&w=1200`} alt={post.title} className="w-full aspect-video object-cover" />
            </div>
          </div>
        )}

        <section className="py-12 md:py-16 bg-gradient-to-b from-white via-white to-slate-50">
          <div className="max-w-3xl mx-auto px-4">
            <div className="prose-content" dangerouslySetInnerHTML={{ __html: post.content_html }} />
          </div>
        </section>

        {blogBlocks.map((block) => (
          <BlockRenderer key={block.id} block={block} />
        ))}

        <div className="mt-8 mb-8">
          <AppRecommendation lang={params.lang} />
        </div>

        <ContactSection settings={settings} lang={params.lang} dict={dict} />
      </main>
      <Footer settings={settings} navigation={navigation} lang={params.lang} dict={dict} />
    </>
  );
}
