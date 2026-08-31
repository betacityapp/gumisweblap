import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram } from 'lucide-react';
import type { SiteSettings, NavigationItem } from '@/lib/types';
import type { Dictionary } from '@/lib/i18n';

interface Props {
  settings: SiteSettings;
  navigation: NavigationItem[];
  lang?: string;
  dict?: Dictionary;
}

export default function Footer({ settings, navigation, lang = 'hu', dict }: Props) {
  const serviceLinks = navigation.find((n) =>
    ['Szolgáltatások', 'Services', 'Leistungen'].includes(n.label)
  )?.children ?? [];

  const d = dict?.footer;

  function prefixHref(url: string): string {
    if (url.startsWith('http') || url.startsWith('#')) return url;
    if (url === '/') return `/${lang}`;
    if (url.startsWith(`/${lang}/`) || url === `/${lang}`) return url;
    return `/${lang}${url}`;
  }

  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* CTA strip */}
      <div className="bg-red-600 py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{d?.cta_title ?? 'Hívjon most – Átlagosan 45 perc alatt ott vagyunk!'}</h2>
          <p className="text-red-100 mb-6">{d?.cta_sub ?? 'Mobil gumiszerviz Budapesten és Pest megyében – 0-24 órában, az év 365 napján'}</p>
          <a
            href={`tel:${settings.phone.replace(/\s/g, '')}`}
            className="inline-flex items-center gap-2 bg-white text-red-600 hover:bg-red-50 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:shadow-xl"
          >
            <Phone className="w-5 h-5" />
            {settings.phone}
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-black text-xl">T</div>
              <div>
                <div className="font-bold text-white text-base">Toldi Mobil</div>
                <div className="text-red-400 font-semibold text-sm">Gumi &amp; Klíma</div>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              {lang === 'de'
                ? 'Professioneller mobiler Reifenservice und Klimaanlage-Befüllung in Budapest und Pest – seit 2018.'
                : lang === 'en'
                ? 'Professional mobile tire service and AC recharge in Budapest and Pest County – since 2018.'
                : 'Professzionális mobil gumiszerviz és autóklíma töltés Budapesten és Pest megyében – 2018 óta.'}
            </p>
            <div className="flex gap-3">
              <a href="https://www.facebook.com/toldigumis" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-slate-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-slate-800 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{d?.services_title ?? 'Szolgáltatások'}</h3>
            <ul className="space-y-2.5">
              {serviceLinks.map((s) => (
                <li key={s.id}>
                  <Link href={prefixHref(s.url)} className="text-slate-400 hover:text-red-400 text-sm transition-colors">{s.label}</Link>
                </li>
              ))}
              <li>
                <Link href={`/${lang}/arlista`} className="text-slate-400 hover:text-red-400 text-sm transition-colors">
                  {dict?.nav.price_list ?? 'Árlista'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{d?.links_title ?? 'Gyors linkek'}</h3>
            <ul className="space-y-2.5">
              <li><Link href={`/${lang}/rolunk`} className="text-slate-400 hover:text-red-400 text-sm transition-colors">{dict?.nav.about ?? 'Rólunk'}</Link></li>
              <li><Link href={`/${lang}/blog`} className="text-slate-400 hover:text-red-400 text-sm transition-colors">{dict?.nav.blog ?? 'Blog'}</Link></li>
              <li><Link href={`/${lang}/kapcsolat`} className="text-slate-400 hover:text-red-400 text-sm transition-colors">{dict?.nav.contact ?? 'Kapcsolat'}</Link></li>
              <li><Link href={`/${lang}/gumimeretek`} className="text-slate-400 hover:text-red-400 text-sm transition-colors">{dict?.nav.tire_finder ?? 'Gumiméret kereső'}</Link></li>
              <li><Link href={`/${lang}/klima-adatbazis`} className="text-slate-400 hover:text-red-400 text-sm transition-colors">{dict?.nav.ac_db ?? 'Klíma adatbázis'}</Link></li>
              <li><Link href={`/${lang}/gumimeret-valto`} className="text-slate-400 hover:text-red-400 text-sm transition-colors">{dict?.nav.tire_converter ?? 'Gumiméret váltó'}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{d?.contact_title ?? 'Elérhetőség'}</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="text-white font-semibold hover:text-red-400 transition-colors text-sm">{settings.phone}</a>
                  {settings.phone_2 && (
                    <a href={`tel:${settings.phone_2.replace(/\s/g, '')}`} className="block text-slate-400 hover:text-red-400 text-sm transition-colors">{settings.phone_2}</a>
                  )}
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <a href={`mailto:${settings.email}`} className="text-slate-400 hover:text-red-400 text-sm transition-colors">{settings.email}</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <span className="text-slate-400 text-sm">{settings.address}</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <span className="text-slate-400 text-sm">{settings.working_hours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">{settings.footer_copyright}</p>
          <div className="flex gap-4 text-slate-500 text-sm">
            <Link href={`/${lang}/adatvedelem`} className="hover:text-slate-300 transition-colors">{d?.privacy ?? 'Adatvédelem'}</Link>
            <Link href={`/${lang}/aszf`} className="hover:text-slate-300 transition-colors">{d?.terms ?? 'ÁSZF'}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
