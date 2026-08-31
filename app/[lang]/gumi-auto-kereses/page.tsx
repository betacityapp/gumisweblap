import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import TireReverseClient from '@/components/cars/TireReverseClient';
import { getDictionary } from '@/lib/i18n';
import { getSettings, getNavigation } from '@/lib/db';
import Link from 'next/link';
import { ArrowRight, Gauge, Wind, ArrowLeftRight } from 'lucide-react';

interface Props { params: { lang: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dict = getDictionary(params.lang);
  const t = dict.tools;
  return {
    title: t.tire_reverse_title,
    description: t.tire_reverse_subtitle,
    alternates: {
      canonical: `/${params.lang}/gumi-auto-kereses`,
      languages: { hu: '/hu/gumi-auto-kereses', en: '/en/gumi-auto-kereses', de: '/de/gumi-auto-kereses' },
    },
  };
}

export default async function TireReversePage({ params }: Props) {
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
        <div className="bg-gradient-to-br from-slate-900 via-orange-950 to-slate-900 text-white">
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <span className="inline-block bg-orange-600/30 border border-orange-500/40 text-orange-300 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
              {t.tire_reverse_badge}
            </span>
            <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">{t.tire_reverse_title}</h1>
            <p className="text-slate-300 text-lg max-w-xl mx-auto">{t.tire_reverse_subtitle}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
          <TireReverseClient dict={dict} lang={params.lang} />

          {/* SEO content */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Hogyan használja a gumi–autó keresőt?</h2>
            <div className="prose prose-sm text-slate-600 max-w-none">
              <p>Írja be a gumiabroncs méretét a szabványos formátumban: <strong>szélesség/profil R felniátmérő</strong>, például <code>205/55 R16</code> vagy <code>225/45R17</code>. A szóközök és a kis/nagybetűk nem számítanak.</p>
              <p>Az eredmények megmutatják az összes olyan autómodellt és változatot, amelyeknek ez az OEM (gyári) gumimérete. Az axel (E = első, H = hátsó, E+H = mindkettő) megmutatja, melyik tengelyre vonatkozik az adat.</p>
              <p><strong>Gyakorlati felhasználás</strong>: Ha pl. nyeresége van egy adott méretű gumikészletből, ezzel az eszközzel gyorsan megtalálhatja, milyen autókhoz illik. Fordítva is hasznos: ha nem tudja az autó pontos típusát, de megvan a gumiméret, megtalálhatja a lehetséges egyezéseket.</p>
            </div>

            <div className="mt-6 grid sm:grid-cols-3 gap-3">
              <Link href={`/${params.lang}/gumimeretek`}
                className="flex items-center gap-3 p-4 rounded-xl border border-red-100 hover:border-red-300 bg-red-50 hover:bg-red-100 transition-all group">
                <Gauge className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800 text-sm group-hover:text-red-700">{t.link_tire_finder}</p>
                  <p className="text-xs text-slate-500">Autótól gumiméretig</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 ml-auto group-hover:text-red-600 transition-colors" />
              </Link>
              <Link href={`/${params.lang}/klima-adatbazis`}
                className="flex items-center gap-3 p-4 rounded-xl border border-cyan-100 hover:border-cyan-300 bg-cyan-50 hover:bg-cyan-100 transition-all group">
                <Wind className="w-5 h-5 text-cyan-600 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800 text-sm group-hover:text-cyan-700">{t.link_ac_db}</p>
                  <p className="text-xs text-slate-500">Klímagáz típus és mennyiség</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 ml-auto group-hover:text-cyan-600 transition-colors" />
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
