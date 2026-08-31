import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import TireFinderClient from '@/components/cars/TireFinderClient';
import { getDictionary } from '@/lib/i18n';
import { getSettings, getNavigation } from '@/lib/db';
import Link from 'next/link';
import { ArrowRight, Database, Wind, ArrowLeftRight } from 'lucide-react';

interface Props { params: { lang: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dict = getDictionary(params.lang);
  const t = dict.tools;
  return {
    title: t.tire_finder_title,
    description: t.tire_finder_subtitle,
    alternates: {
      canonical: `/${params.lang}/gumimeretek`,
      languages: { hu: '/hu/gumimeretek', en: '/en/gumimeretek', de: '/de/gumimeretek' },
    },
  };
}

export default async function TireFinderPage({ params }: Props) {
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
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-red-900 text-white">
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <span className="inline-block bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
              {t.tire_finder_badge}
            </span>
            <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">{t.tire_finder_title}</h1>
            <p className="text-slate-300 text-lg max-w-xl mx-auto">{t.tire_finder_subtitle}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
          <TireFinderClient dict={dict} phone={settings.phone} lang={params.lang} />

          {/* SEO cross-link section */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Gyári gumiabroncs méret – miért fontos?</h2>
            <div className="prose prose-sm text-slate-600 max-w-none">
              <p>A gyári (OEM) gumiabroncs méret az a méret, amelyet a jármű gyártója a tervezési és biztonsági előírásoknak megfelelően meghatározott. Ez az érték a jármű forgalmi engedélyébe és a gyártói tájékoztatóba is be van jegyezve.</p>
              <p>Az OEM gumiméret figyelembe veszi az autó felfüggesztési geometriáját, a sebességmérő kalibrációját, a teherbírási követelményeket és az ABS/ESP rendszer érzékelőinek beállítását. A helyes gumiméret biztosítja a pontos sebességmérést, az optimális tapadást és a kötelező biztonsági előírásoknak való megfelelést.</p>
              <p>Adatbázisunkban több mint 20 gyártó leggyakoribb modelljeihez tartalmaz adatokat, folyamatosan bővítve. Az adatok tájékoztató jellegűek – felszerelés előtt minden esetben ellenőrizze a gyártói kézikönyvet.</p>
            </div>

            <div className="mt-6 grid sm:grid-cols-3 gap-3">
              <Link href={`/${params.lang}/klima-adatbazis`}
                className="flex items-center gap-3 p-4 rounded-xl border border-cyan-100 hover:border-cyan-300 bg-cyan-50 hover:bg-cyan-100 transition-all group">
                <Wind className="w-5 h-5 text-cyan-600 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800 text-sm group-hover:text-cyan-700">{t.link_ac_db}</p>
                  <p className="text-xs text-slate-500">R134a & R1234yf adatbázis</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 ml-auto group-hover:text-cyan-600 transition-colors" />
              </Link>
              <Link href={`/${params.lang}/gumi-auto-kereses`}
                className="flex items-center gap-3 p-4 rounded-xl border border-orange-100 hover:border-orange-300 bg-orange-50 hover:bg-orange-100 transition-all group">
                <Database className="w-5 h-5 text-orange-600 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800 text-sm group-hover:text-orange-700">{t.link_tire_reverse}</p>
                  <p className="text-xs text-slate-500">Mérethől visszafelé keresés</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 ml-auto group-hover:text-orange-600 transition-colors" />
              </Link>
              <Link href={`/${params.lang}/gumimeret-valto`}
                className="flex items-center gap-3 p-4 rounded-xl border border-emerald-100 hover:border-emerald-300 bg-emerald-50 hover:bg-emerald-100 transition-all group">
                <ArrowLeftRight className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800 text-sm group-hover:text-emerald-700">{t.link_tire_converter}</p>
                  <p className="text-xs text-slate-500">Méret összehasonlító</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 ml-auto group-hover:text-emerald-600 transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer settings={settings} navigation={navigation} lang={params.lang} dict={dict} />
    </>
  );
}
