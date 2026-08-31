import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/sonner';
import { getSettings } from '@/lib/db';
import { getDictionary } from '@/lib/i18n';
import { SUPPORTED_LANGS } from '@/middleware';
import type { Lang } from '@/middleware';
import VisitorTracker from '@/components/VisitorTracker';
import PopupDisplay from '@/components/PopupDisplay';
import CustomCursor from '@/components/CustomCursor';
import AnnouncementBannerDisplay from '@/components/AnnouncementBanner';

interface Props {
  children: React.ReactNode;
  params: { lang: string };
}

export async function generateStaticParams() {
  return SUPPORTED_LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const settings = await getSettings();
  const dict = getDictionary(params.lang);
  const localeMap: Record<string, string> = { hu: 'hu_HU', en: 'en_US', de: 'de_DE' };

  return {
    title: {
      default: settings.site_name,
      template: `%s | ${settings.site_name}`,
    },
    description: settings.site_description,
    keywords: dict.lang === 'hu'
      ? 'mobil gumiszerviz budapest, gumicsere budapest, defektjavítás, autóklíma töltés, mobil gumi'
      : dict.lang === 'de'
      ? 'mobiler reifenservice budapest, reifenwechsel budapest, reifenpanne, klimaanlage'
      : 'mobile tire service budapest, tire change budapest, flat repair, car ac recharge',
    metadataBase: new URL('https://toldimobilgumi.hu'),
    alternates: {
      canonical: `/${params.lang}`,
      languages: {
        'hu': '/hu',
        'en': '/en',
        'de': '/de',
      },
    },
    icons: settings.favicon_url ? { icon: settings.favicon_url, shortcut: settings.favicon_url } : undefined,
    openGraph: {
      type: 'website',
      locale: localeMap[params.lang] ?? 'hu_HU',
      siteName: settings.site_name,
      title: settings.site_name,
      description: settings.site_description,
    },
    twitter: {
      card: 'summary_large_image',
      title: settings.site_name,
      description: settings.site_description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    verification: {
      google: settings.google_analytics || undefined,
    },
  };
}

export default async function LangLayout({ children, params }: Props) {
  const lang = (SUPPORTED_LANGS as readonly string[]).includes(params.lang) ? params.lang as Lang : 'hu' as Lang;
  const settings = await getSettings();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            url: 'https://toldimobilgumi.hu',
            name: settings.site_name,
            description: settings.site_description,
            inLanguage: lang,
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://toldimobilgumi.hu/{lang}/blog?q={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
      {children}
      <VisitorTracker />
      <PopupDisplay />
      <CustomCursor />
      <AnnouncementBannerDisplay />
      <Toaster richColors position="top-right" />
    </>
  );
}
