import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import ServicesSection from '@/components/sections/ServicesSection';
import ComparisonSection from '@/components/sections/ComparisonSection';
import PriceSection from '@/components/sections/PriceSection';
import HowItWorksSection from '@/components/sections/HowItWorksSection';
import CoverageSection from '@/components/sections/CoverageSection';
import FaqSection from '@/components/sections/FaqSection';
import BlogPreviewSection from '@/components/sections/BlogPreviewSection';
import ContactSection from '@/components/sections/ContactSection';
import StructuredData from '@/components/seo/StructuredData';
import ToolsSection from '@/components/sections/ToolsSection';
import TowingPartner from '@/components/TowingPartner';
import BlockRenderer from '@/components/BlockRenderer';
import { getDictionary } from '@/lib/i18n';
import {
  getSettings,
  getNavigation,
  getServices,
  getPriceItems,
  getFaqItems,
  getPublishedBlogPosts,
} from '@/lib/db';

interface Props {
  params: { lang: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const settings = await getSettings();
  const dict = getDictionary(params.lang);
  return {
    title: settings.site_name,
    description: settings.site_description,
    alternates: {
      canonical: `https://toldimobilgumi.hu/${params.lang}`,
      languages: { hu: '/hu', en: '/en', de: '/de' },
    },
    openGraph: {
      images: [`/api/og?lang=${params.lang}&title=${encodeURIComponent(settings.site_name)}`],
    },
  };
}

export default async function LangHomePage({ params }: Props) {
  const dict = getDictionary(params.lang);
  const [settings, navigation, services, prices, faqs, blogPosts] = await Promise.all([
    getSettings(),
    getNavigation(),
    getServices(),
    getPriceItems(),
    getFaqItems(),
    getPublishedBlogPosts(params.lang),
  ]);

  const calcConfig = {
    discountEnabled: settings.calc_discount_enabled === 'true',
    discountThreshold: parseInt(settings.calc_discount_threshold ?? '3'),
    discountPercent: parseInt(settings.calc_discount_percent ?? '10'),
  };

  return (
    <>
      <StructuredData type="LocalBusiness" settings={settings} />
      <StructuredData type="FAQPage" faqs={faqs} />
      <Header settings={settings} navigation={navigation} lang={params.lang} dict={dict} />
      <main>
        <HeroSection settings={settings} dict={dict} />
        <ComparisonSection dict={dict} />
        <ServicesSection services={services} dict={dict} />
        <ToolsSection lang={params.lang} dict={dict} />
        <PriceSection prices={prices} dict={dict} calcConfig={calcConfig} />
        <HowItWorksSection dict={dict} />
        <CoverageSection dict={dict} />
        <TowingPartner lang={params.lang} />
        <FaqSection faqs={faqs} dict={dict} />
        <BlogPreviewSection posts={blogPosts} lang={params.lang} dict={dict} />
        <ContactSection settings={settings} lang={params.lang} dict={dict} />
      </main>
      <Footer settings={settings} navigation={navigation} lang={params.lang} dict={dict} />
    </>
  );
}
