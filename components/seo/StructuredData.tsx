import type { SiteSettings, Page, BlogPost, FaqItem } from '@/lib/types';

const BASE = 'https://toldimobilgumi.hu';

interface StructuredDataProps {
  type: 'LocalBusiness' | 'Article' | 'FAQPage' | 'BreadcrumbList' | 'WebPage' | 'Service';
  settings?: SiteSettings;
  page?: Page;
  post?: BlogPost;
  faqs?: FaqItem[];
  breadcrumbs?: Array<{ name: string; url: string }>;
  lang?: string;
}

export default function StructuredData({ type, settings, page, post, faqs, breadcrumbs, lang = 'hu' }: StructuredDataProps) {
  let schema: object | null = null;

  if (type === 'LocalBusiness' && settings) {
    schema = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': `${BASE}/#business`,
      name: settings.site_name,
      url: BASE,
      telephone: settings.phone,
      email: settings.email,
      description: settings.site_description,
      image: `${BASE}/logo.png`,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE}/logo.png`,
        width: 300,
        height: 100,
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Budapest',
        addressLocality: 'Budapest',
        addressRegion: 'Pest',
        addressCountry: 'HU',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 47.497913,
        longitude: 19.040236,
      },
      openingHours: 'Mo-Su 00:00-23:59',
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '00:00',
        closes: '23:59',
      },
      priceRange: '$$',
      currenciesAccepted: 'HUF',
      paymentAccepted: 'Cash, Credit Card',
      areaServed: [
        { '@type': 'City', name: 'Budapest' },
        { '@type': 'AdministrativeArea', name: 'Pest megye' },
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Mobil Gumiszerviz Szolgáltatások',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Szezonális gumicsere', description: 'Helyszíni szezonális gumicsere és centrírozás' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Defektjavítás', description: 'SOS helyszíni defektjavítás 0-24' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Autóklíma töltés', description: 'R134a autóklíma töltés és diagnosztika' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Centrírozás', description: 'Digitális kerékkiegyensúlyozás' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Autómentés', description: 'Partnerünkkel trélerrel és mentőautóval' } },
        ],
      },
      sameAs: ['https://www.facebook.com/toldigumis'],
    };
  }

  if (type === 'Article' && post) {
    const postLang = post.lang || lang;
    schema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.excerpt || post.meta_description,
      image: post.featured_image,
      author: {
        '@type': 'Organization',
        name: post.author,
        url: BASE,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Toldi Mobil Gumi',
        logo: { '@type': 'ImageObject', url: `${BASE}/logo.png` },
      },
      datePublished: post.published_at,
      dateModified: post.updated_at,
      inLanguage: postLang,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${BASE}/${postLang}/blog/${post.slug}`,
      },
      ...(post.city ? {
        contentLocation: { '@type': 'Place', name: post.city },
      } : {}),
    };
  }

  if (type === 'FAQPage' && faqs && faqs.length > 0) {
    schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    };
  }

  if (type === 'BreadcrumbList' && breadcrumbs) {
    schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: crumb.name,
        item: `${BASE}${crumb.url}`,
      })),
    };
  }

  if (type === 'WebPage' && page) {
    const pageLang = page.lang || lang;
    schema = {
      '@context': 'https://schema.org',
      '@type': page.is_city_page ? 'WebPage' : 'AboutPage',
      '@id': `${BASE}/${pageLang}/${page.slug}`,
      url: `${BASE}/${pageLang}/${page.slug}`,
      name: page.meta_title || page.title,
      description: page.meta_description,
      inLanguage: pageLang,
      isPartOf: { '@type': 'WebSite', url: BASE, name: 'Toldi Mobil Gumi' },
      ...(page.hero_image ? { primaryImageOfPage: { '@type': 'ImageObject', url: page.hero_image } } : {}),
      ...(page.city ? {
        areaServed: { '@type': 'City', name: page.city },
        about: {
          '@type': 'Service',
          name: `Mobil Gumiszerviz – ${page.city}`,
          areaServed: { '@type': 'City', name: page.city },
          provider: { '@type': 'LocalBusiness', '@id': `${BASE}/#business` },
        },
      } : {}),
    };
  }

  if (type === 'Service' && page && page.is_city_page && page.city) {
    schema = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `Mobil Gumiszerviz ${page.city}`,
      description: page.meta_description || page.hero_subtitle,
      provider: {
        '@type': 'LocalBusiness',
        '@id': `${BASE}/#business`,
        name: 'Toldi Mobil Gumi',
        telephone: settings?.phone,
      },
      areaServed: { '@type': 'City', name: page.city },
      availableChannel: {
        '@type': 'ServiceChannel',
        serviceUrl: `${BASE}/${page.lang || lang}/${page.slug}`,
        availableLanguage: { '@type': 'Language', name: 'Hungarian' },
      },
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '00:00',
        closes: '23:59',
      },
    };
  }

  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
