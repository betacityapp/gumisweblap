import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import ServicesSection from '@/components/sections/ServicesSection';
import PriceSection from '@/components/sections/PriceSection';
import HowItWorksSection from '@/components/sections/HowItWorksSection';
import CoverageSection from '@/components/sections/CoverageSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import FaqSection from '@/components/sections/FaqSection';
import BlogPreviewSection from '@/components/sections/BlogPreviewSection';
import ContactSection from '@/components/sections/ContactSection';
import StructuredData from '@/components/seo/StructuredData';
import BlockRenderer from '@/components/BlockRenderer';
import { getDictionary } from '@/lib/i18n';
import {
  getSettings,
  getNavigation,
  getPageBySlug,
  getServices,
  getPriceItems,
  getTestimonials,
  getFaqItems,
  getPublishedBlogPosts,
  getPublishedPages,
  getPageCustomPrices,
  getPageBlocks,
} from '@/lib/db';
import type { PriceItem, BlogPost } from '@/lib/types';

interface Props {
  params: { lang: string; slug: string };
}

export async function generateStaticParams() {
  const allPages = await getPublishedPages();
  const params: { lang: string; slug: string }[] = [];
  const langs = ['hu', 'en', 'de'];
  for (const lang of langs) {
    for (const page of allPages) {
      params.push({ lang, slug: page.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPageBySlug(params.slug, params.lang) ?? await getPageBySlug(params.slug);
  if (!page) return {};
  const settings = await getSettings();
  return {
    title: page.meta_title || `${page.title} | ${settings.site_name}`,
    description: page.meta_description || settings.site_description,
    keywords: page.meta_keywords || undefined,
    alternates: {
      canonical: `https://toldimobilgumi.hu/${params.lang}/${params.slug}`,
      languages: {
        hu: `https://toldimobilgumi.hu/hu/${params.slug}`,
        en: `https://toldimobilgumi.hu/en/${params.slug}`,
        de: `https://toldimobilgumi.hu/de/${params.slug}`,
        'x-default': `https://toldimobilgumi.hu/hu/${params.slug}`,
      },
    },
    openGraph: {
      title: page.meta_title || page.title,
      description: page.meta_description || settings.site_description,
      images: [`/api/og?lang=${params.lang}&title=${encodeURIComponent(page.title)}`],
    },
  };
}

export default async function DynamicLangPage({ params }: Props) {
  const dict = getDictionary(params.lang);
  const [page, settings, navigation, services, globalPrices, testimonials, faqs, blogPosts] =
    await Promise.all([
      getPageBySlug(params.slug, params.lang).then((p) => p ?? getPageBySlug(params.slug)),
      getSettings(),
      getNavigation(),
      getServices(),
      getPriceItems(),
      getTestimonials(),
      getFaqItems(),
      getPublishedBlogPosts(params.lang),
    ]);

  if (!page || !page.is_published) notFound();

  // Use per-page custom prices if available, otherwise fall back to global
  const customPrices = page.id ? await getPageCustomPrices(page.id) : [];
  const pageBlocks = page.id ? await getPageBlocks('page', page.id) : [];
  const prices: PriceItem[] = customPrices.length > 0
    ? customPrices.map((cp) => ({
        id: cp.id,
        category: cp.category,
        label: cp.label,
        price_from: cp.price_from,
        price_to: cp.price_to,
        unit: cp.unit,
        note: cp.note,
        sort_order: cp.sort_order,
        is_active: cp.is_active,
        created_at: cp.created_at,
      }))
    : globalPrices;

  // Get blog posts related to this city
  const cityBlogPosts: BlogPost[] = page.city
    ? blogPosts.filter((p) => p.city === page.city)
    : [];

  const sections = Array.isArray(page.page_sections) ? page.page_sections : [];

  const breadcrumbs = [
    { name: dict.nav.home, url: `/${params.lang}` },
    { name: page.title, url: `/${params.lang}/${page.slug}` },
  ];

  return (
    <>
      <StructuredData type="BreadcrumbList" breadcrumbs={breadcrumbs} lang={params.lang} />
      <StructuredData type="WebPage" page={page} settings={settings} lang={params.lang} />
      {page.is_city_page && (
        <>
          <StructuredData type="LocalBusiness" settings={settings} page={page} lang={params.lang} />
          <StructuredData type="Service" page={page} settings={settings} lang={params.lang} />
        </>
      )}
      {sections.includes('faq') && <StructuredData type="FAQPage" faqs={faqs} lang={params.lang} />}
      <Header settings={settings} navigation={navigation} lang={params.lang} dict={dict} />
      <main>
        {sections.includes('hero') && (
          <HeroSection
            settings={settings}
            dict={dict}
            title={page.hero_title || undefined}
            subtitle={page.hero_subtitle || undefined}
            image={page.hero_image || undefined}
            city={page.city || undefined}
          />
        )}

        {page.content_html && (
          <section className="py-12 md:py-16 bg-gradient-to-b from-white via-white to-slate-50">
            <div className="max-w-4xl mx-auto px-4">
              <div className="prose-content" dangerouslySetInnerHTML={{ __html: page.content_html }} />
            </div>
          </section>
        )}

        {pageBlocks.map((block) => (
          <BlockRenderer key={block.id} block={block} />
        ))}

        {/* City-specific blog posts */}
        {page.is_city_page && cityBlogPosts.length > 0 && (
          <section className="py-16 bg-slate-50">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-slate-900 mb-2">{page.city} – Blog & Tippek</h2>
                <p className="text-slate-500">Hasznos tudnivalók és szakértői tippek {page.city} autósainak</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cityBlogPosts.slice(0, 6).map((post) => (
                  <a key={post.id} href={`/${params.lang}/blog/${post.slug}`}
                    className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    {post.featured_image && (
                      <div className="aspect-video overflow-hidden bg-slate-100">
                        <img src={post.featured_image} alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="p-5">
                      {post.tags.length > 0 && (
                        <div className="flex gap-1.5 mb-3 flex-wrap">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">{tag}</span>
                          ))}
                        </div>
                      )}
                      <h3 className="font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-2">{post.title}</h3>
                      {post.excerpt && <p className="text-sm text-slate-500 line-clamp-2">{post.excerpt}</p>}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {sections.includes('services') && <ServicesSection services={services} dict={dict} />}
        {sections.includes('prices') && <PriceSection prices={prices} dict={dict} />}
        {sections.includes('how_it_works') && <HowItWorksSection dict={dict} />}
        {sections.includes('coverage') && <CoverageSection dict={dict} />}
        {sections.includes('testimonials') && <TestimonialsSection testimonials={testimonials} dict={dict} />}

        {page.show_reviews && (
          <section className="py-12 bg-slate-50">
            <div className="max-w-5xl mx-auto px-4 text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Google értékelések</h2>
              <p className="text-slate-500 mb-6">Olvasson valódi ügyfélvéleményeket a Google-on</p>
              <a
                href="https://www.google.com/search?q=Toldi+Mobil+Gumi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-medium hover:shadow-md transition-shadow"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google értékelések megtekintése
              </a>
            </div>
          </section>
        )}

        {page.show_comments && (
          <section className="py-12 bg-white">
            <div className="max-w-3xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Hozzászólások</h2>
              <div className="bg-slate-50 rounded-2xl p-6 text-center text-slate-400">
                <p className="text-sm">Jelenleg nincsenek hozzászólások.</p>
              </div>
            </div>
          </section>
        )}

        {sections.includes('faq') && <FaqSection faqs={faqs} dict={dict} />}
        {sections.includes('blog_preview') && <BlogPreviewSection posts={blogPosts} lang={params.lang} dict={dict} />}
        {sections.includes('contact') && <ContactSection settings={settings} lang={params.lang} dict={dict} />}
      </main>
      <Footer settings={settings} navigation={navigation} lang={params.lang} dict={dict} />
    </>
  );
}
