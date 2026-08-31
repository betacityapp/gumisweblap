import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ContactSection from '@/components/sections/ContactSection';
import StructuredData from '@/components/seo/StructuredData';
import TowingPartner from '@/components/TowingPartner';
import BlockRenderer from '@/components/BlockRenderer';
import { getDictionary } from '@/lib/i18n';
import { getSettings, getNavigation, getPriceItems, getFaqItems, getPageBlocks } from '@/lib/db';
import PriceSection from '@/components/sections/PriceSection';
import FaqSection from '@/components/sections/FaqSection';
import { Check, ArrowRight, Phone } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n';

interface ServicePageConfig {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  heroIcon: string;
  intro: string;
  benefits: { icon: string; title: string; desc: string }[];
  process: { step: string; title: string; desc: string }[];
  faqItems: { q: string; a: string }[];
  showTowing?: boolean;
  showPrices?: boolean;
  showFaq?: boolean;
}

export function createServiceMetadata(config: ServicePageConfig): (params: { lang: string }) => Promise<Metadata> {
  return async ({ lang }) => {
    const settings = await getSettings();
    return {
      title: `${config.metaTitle} | ${settings.site_name}`,
      description: config.metaDescription,
      alternates: {
        canonical: `https://toldimobilgumi.hu/${lang}/${config.slug}`,
        languages: {
          hu: `https://toldimobilgumi.hu/hu/${config.slug}`,
          en: `https://toldimobilgumi.hu/en/${config.slug}`,
          de: `https://toldimobilgumi.hu/de/${config.slug}`,
        },
      },
      openGraph: {
        title: config.metaTitle,
        description: config.metaDescription,
        images: [`/api/og?lang=${lang}&title=${encodeURIComponent(config.heroTitle)}`],
      },
    };
  };
}

export async function renderServicePage(config: ServicePageConfig, params: { lang: string }) {
  const dict = getDictionary(params.lang);
  const [settings, navigation, prices, faqs] = await Promise.all([
    getSettings(),
    getNavigation(),
    getPriceItems(),
    getFaqItems(),
  ]);

  const pageBlocks = await getPageBlocks('page', config.slug).catch(() => []);

  const breadcrumbs = [
    { name: dict.nav.home, url: `/${params.lang}` },
    { name: config.title, url: `/${params.lang}/${config.slug}` },
  ];

  return (
    <>
      <StructuredData type="BreadcrumbList" breadcrumbs={breadcrumbs} lang={params.lang} />
      <StructuredData type="WebPage" />
      {config.showFaq && (
        <StructuredData type="FAQPage" faqs={config.faqItems.map((f, i) => ({ id: String(i), question: f.q, answer: f.a, is_active: true, sort_order: i, category: config.title, created_at: '' }))} lang={params.lang} />
      )}
      <Header settings={settings} navigation={navigation} lang={params.lang} dict={dict} />
      <main>
        {/* Hero */}
        <section className="relative bg-slate-900 pt-32 pb-16 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-72 h-72 bg-red-600 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-red-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <span className="inline-block bg-red-600/20 text-red-400 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">{config.heroIcon}</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">{config.heroTitle}</h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">{config.heroSubtitle}</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg">
                <Phone className="w-5 h-5" /> {settings.phone}
              </a>
              <a href="#kapcsolat" className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all border border-white/20">
                Ajánlatkérés <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </section>

        {/* Intro */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <p className="text-lg text-slate-700 leading-relaxed">{config.intro}</p>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-black text-slate-900 text-center mb-12">Miért válassza a Toldi Mobil Gumit?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {config.benefits.map((b, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="text-3xl mb-3">{b.icon}</div>
                  <h3 className="font-bold text-slate-900 mb-2">{b.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-black text-slate-900 text-center mb-12">Hogyan működik?</h2>
            <div className="space-y-4">
              {config.process.map((p, i) => (
                <div key={i} className="flex items-start gap-4 bg-slate-50 rounded-2xl p-6 hover:bg-slate-100 transition-colors">
                  <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center shrink-0 text-white font-black text-lg">
                    {p.step}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">{p.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Custom blocks from DB */}
        {pageBlocks.map((block) => (
          <BlockRenderer key={block.id} block={block} />
        ))}

        {/* Towing partner */}
        {config.showTowing && <TowingPartner lang={params.lang} />}

        {/* Prices */}
        {config.showPrices && (
          <PriceSection prices={prices} dict={dict} calcConfig={{
            discountEnabled: settings.calc_discount_enabled === 'true',
            discountThreshold: parseInt(settings.calc_discount_threshold ?? '3'),
            discountPercent: parseInt(settings.calc_discount_percent ?? '10'),
          }} />
        )}

        {/* FAQ */}
        {config.showFaq && (
          <FaqSection faqs={config.faqItems.map((f, i) => ({ id: String(i), question: f.q, answer: f.a, is_active: true, sort_order: i, category: config.title, created_at: '' }))} dict={dict} />
        )}

        {/* Contact */}
        <ContactSection settings={settings} lang={params.lang} dict={dict} />
      </main>
      <Footer settings={settings} navigation={navigation} lang={params.lang} dict={dict} />
    </>
  );
}

export type { ServicePageConfig };
