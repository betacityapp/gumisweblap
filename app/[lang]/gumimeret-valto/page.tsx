import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import TireSizeConverterClient from '@/components/cars/TireSizeConverterClient';
import { getDictionary } from '@/lib/i18n';
import { getSettings, getNavigation } from '@/lib/db';
import Link from 'next/link';
import { ArrowRight, Gauge, Database, Wind } from 'lucide-react';

interface Props { params: { lang: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dict = getDictionary(params.lang);
  const t = dict.tools;
  return {
    title: t.tire_converter_title,
    description: t.tire_converter_subtitle,
    alternates: {
      canonical: `/${params.lang}/gumimeret-valto`,
      languages: { hu: '/hu/gumimeret-valto', en: '/en/gumimeret-valto', de: '/de/gumimeret-valto' },
    },
  };
}

export default async function TireConverterPage({ params }: Props) {
  const [dict, settings, navigation] = await Promise.all([
    Promise.resolve(getDictionary(params.lang)),
    getSettings(),
    getNavigation(),
  ]);
  const t = dict.tools;

  return (
    <>
      <Header settings={settings} navigation={navigation} lang={params.lang} dict={dict} />
      <main className="min-h-screen bg-slate-50">
        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white">
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <span className="inline-block bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
              {t.tire_converter_badge}
            </span>
            <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">{t.tire_converter_title}</h1>
            <p className="text-slate-300 text-lg max-w-xl mx-auto">{t.tire_converter_subtitle}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
          <TireSizeConverterClient dict={dict} lang={params.lang} phone={settings.phone} />

          {/* SEO content */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              {params.lang === 'de' ? 'Reifengrößenwechsel – was Sie wissen müssen' : params.lang === 'en' ? 'Tire size change – what you need to know' : 'Gumiméret váltás – amit tudnia kell'}
            </h2>
            <div className="prose prose-sm text-slate-600 max-w-none">
              <p>
                {params.lang === 'de'
                  ? 'Beim Wechsel der Reifengröße ist es entscheidend, dass der neue Reifen einen ähnlichen Abrollumfang wie der Originalreifen hat. Eine zu große Abweichung führt zu falschen Tacho- und Kilometerzähleranzeigen, beeinträchtigt ABS/ESP-Systeme und kann die Betriebserlaubnis ungültig machen.'
                  : params.lang === 'en'
                  ? 'When changing tire sizes, it is critical that the new tire has a similar rolling circumference to the original. Too large a deviation causes incorrect speedometer and odometer readings, affects ABS/ESP systems, and may void roadworthiness certification.'
                  : 'A gumiméret váltásnál kulcsfontosságú, hogy az új gumi gördülési kerülete minél közelebb legyen az eredetihez. A túl nagy eltérés helytelen sebességmérő- és kilométer-számláló-értékeket okoz, befolyásolja az ABS/ESP rendszereket, és érvénytelenítheti a forgalmi engedélyt.'}
              </p>
              <p>
                {params.lang === 'de'
                  ? 'Die allgemeine Regel: Eine Abweichung von bis zu ±1% ist sicher. Zwischen 1% und 3% ist eine technische Freigabe (Reifen-Felgen-Dokumentation) erforderlich. Über 3% wird dringend von einer Montage abgeraten.'
                  : params.lang === 'en'
                  ? 'The general rule: up to ±1% deviation is safe. Between 1% and 3% requires technical approval (tire-rim documentation). Over 3% is strongly discouraged.'
                  : 'Az általános szabály: ±1%-ig terjedő eltérés biztonságos. 1-3% között műszaki engedélyezés (abroncs-felni dokumentáció) szükséges. 3% felett a felszerelés nem ajánlott.'}
              </p>
              <p>
                {params.lang === 'de'
                  ? 'Ein größerer Reifen erhöht den Durchmesser, wodurch der Tacho langsamer anzeigt und der Kilometerzähler weniger zählt. Ein kleinerer Reifen hat den umgekehrten Effekt. Berücksichtigen Sie auch die Breite: ein breiterer Reifen kann am Radhaus reiben.'
                  : params.lang === 'en'
                  ? 'A larger tire increases the diameter, causing the speedometer to read lower and the odometer to count less. A smaller tire has the opposite effect. Also consider width: a wider tire may rub against the wheel arch.'
                  : 'A nagyobb gumi növeli az átmérőt, így a sebességméró lassabbnak mutat és a kilométer-számláló kevesebbet számol. A kisebb gumi fordítva működik. A szélességet is figyelembe kell venni: a szélesebb gumi súrolhatja a kerékházat.'}
              </p>
            </div>

            <div className="mt-6 grid sm:grid-cols-3 gap-3">
              <Link href={`/${params.lang}/gumimeretek`}
                className="flex items-center gap-3 p-4 rounded-xl border border-red-100 hover:border-red-300 bg-red-50 hover:bg-red-100 transition-all group">
                <Gauge className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800 text-sm group-hover:text-red-700">{t.link_tire_finder}</p>
                  <p className="text-xs text-slate-500">{params.lang === 'de' ? 'Werksreifengröße' : 'OEM tire size'}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 ml-auto group-hover:text-red-600 transition-colors" />
              </Link>
              <Link href={`/${params.lang}/gumi-auto-kereses`}
                className="flex items-center gap-3 p-4 rounded-xl border border-orange-100 hover:border-orange-300 bg-orange-50 hover:bg-orange-100 transition-all group">
                <Database className="w-5 h-5 text-orange-600 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800 text-sm group-hover:text-orange-700">{t.link_tire_reverse}</p>
                  <p className="text-xs text-slate-500">{params.lang === 'de' ? 'Rückwärtssuche' : 'Reverse lookup'}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 ml-auto group-hover:text-orange-600 transition-colors" />
              </Link>
              <Link href={`/${params.lang}/klima-adatbazis`}
                className="flex items-center gap-3 p-4 rounded-xl border border-cyan-100 hover:border-cyan-300 bg-cyan-50 hover:bg-cyan-100 transition-all group">
                <Wind className="w-5 h-5 text-cyan-600 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800 text-sm group-hover:text-cyan-700">{t.link_ac_db}</p>
                  <p className="text-xs text-slate-500">{params.lang === 'de' ? 'Klimagas-Datenbank' : 'AC database'}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 ml-auto group-hover:text-cyan-600 transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer settings={settings} navigation={navigation} lang={params.lang} dict={dict} />
    </>
  );
}
