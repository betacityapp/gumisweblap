import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AcFinderClient from '@/components/cars/AcFinderClient';
import { getDictionary } from '@/lib/i18n';
import { getSettings, getNavigation } from '@/lib/db';
import Link from 'next/link';
import { ArrowRight, Gauge, Database, ArrowLeftRight } from 'lucide-react';

interface Props { params: { lang: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dict = getDictionary(params.lang);
  const t = dict.tools;
  return {
    title: t.ac_db_title,
    description: t.ac_db_subtitle,
    alternates: {
      canonical: `/${params.lang}/klima-adatbazis`,
      languages: { hu: '/hu/klima-adatbazis', en: '/en/klima-adatbazis', de: '/de/klima-adatbazis' },
    },
  };
}

export default async function AcDbPage({ params }: Props) {
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
        <div className="bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 text-white">
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <span className="inline-block bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
              {t.ac_db_badge}
            </span>
            <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">{t.ac_db_title}</h1>
            <p className="text-slate-300 text-lg max-w-xl mx-auto">{t.ac_db_subtitle}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
          <AcFinderClient dict={dict} phone={settings.phone} lang={params.lang} />

          {/* SEO content */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Autóklíma töltés – fontos tudnivalók</h2>
            <div className="prose prose-sm text-slate-600 max-w-none">
              <p>Az autóklíma hűtőközeget (freonát) természetes úton is veszít – évente átlagosan 10–15%-ot. Amennyiben a légkondicionálóval pár fokkal hűvösebbet szeretne, érdemes 2–3 évente tölteni a rendszert.</p>
              <p><strong>R134a (HFC-134a)</strong>: Régebbi típusú hűtőközeg, amely 2017 előtt gyártott járművekben használatos. Globális melegedési potenciálja (GWP) 1430.</p>
              <p><strong>R1234yf (HFO-1234yf)</strong>: Az EU 2017-es előírásainak megfelelő, új generációs hűtőközeg. GWP értéke mindössze 4 – sokkal környezetbarátabb. Kizárólag R1234yf-kompatibilis berendezéssel tölthető.</p>
              <p><strong>Manuális ellenőrzés</strong>: Egyes modelleknél az átállási időszakban (2013–2017) a gyártási évtől függ, melyik típust alkalmazza a gyár. Mindig ellenőrizze a motorháztető belső oldalán lévő matricán!</p>
            </div>

            <div className="mt-6 grid sm:grid-cols-3 gap-3">
              <Link href={`/${params.lang}/gumimeretek`}
                className="flex items-center gap-3 p-4 rounded-xl border border-red-100 hover:border-red-300 bg-red-50 hover:bg-red-100 transition-all group">
                <Gauge className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800 text-sm group-hover:text-red-700">{t.link_tire_finder}</p>
                  <p className="text-xs text-slate-500">Gyári gumiméret adatbázis</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 ml-auto group-hover:text-red-600 transition-colors" />
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
