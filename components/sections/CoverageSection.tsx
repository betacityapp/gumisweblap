import { MapPin } from 'lucide-react';
import Link from 'next/link';
import type { Dictionary } from '@/lib/i18n';

const BUDAPEST_DISTRICTS = [
  'I. kerület', 'II. kerület', 'III. kerület', 'IV. kerület', 'V. kerület',
  'VI. kerület', 'VII. kerület', 'VIII. kerület', 'IX. kerület', 'X. kerület',
  'XI. kerület', 'XII. kerület', 'XIII. kerület', 'XIV. kerület', 'XV. kerület',
  'XVI. kerület', 'XVII. kerület', 'XVIII. kerület', 'XIX. kerület', 'XX. kerület',
  'XXI. kerület', 'XXII. kerület', 'XXIII. kerület',
];

const PEST_CITIES = [
  { name: 'Budaörs', slug: 'mobil-gumiszerviz-budaors' },
  { name: 'Érd', slug: 'mobil-gumiszerviz-erd' },
  { name: 'Szigetszentmiklós', slug: 'mobil-gumiszerviz-szigetszentmiklos' },
  { name: 'Törökbálint', slug: null },
  { name: 'Halásztelek', slug: null },
  { name: 'Tárnok', slug: null },
  { name: 'Diósd', slug: null },
  { name: 'Biatorbágy', slug: null },
  { name: 'Vecsés', slug: null },
  { name: 'Gyál', slug: null },
  { name: 'Dunaharaszti', slug: null },
  { name: 'Dunakeszi', slug: null },
];

const HIGHWAYS = ['M0', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7'];

interface Props {
  dict?: Dictionary;
  lang?: string;
}

export default function CoverageSection({ dict, lang = 'hu' }: Props) {
  const d = dict?.coverage;
  const moreLabel = lang === 'de' ? '+ weitere Städte im Komitat Pest'
    : lang === 'en' ? '+ many more Pest County towns'
    : '+ számos további Pest megyei település';

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-14">
          <span className="text-red-600 font-semibold text-sm uppercase tracking-wider">{d?.label ?? 'Lefedettség'}</span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-2 mb-4">{d?.title ?? 'Hol érhetők el?'}</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">{d?.subtitle ?? 'Budapest összes kerületében, Pest megye számos településén és az autópályákon is vállalunk helyszíni gumiszerelést'}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Budapest */}
          <div className="bg-white rounded-2xl border border-slate-100 p-7">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-slate-900">{d?.bp_title ?? 'Budapest – Minden kerület'}</h3>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {BUDAPEST_DISTRICTS.map((district) => (
                <div key={district} className="bg-red-50 rounded-lg px-2 py-1.5 text-center">
                  <span className="text-red-700 text-xs font-medium">{district.replace(' kerület', '.')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pest county */}
          <div className="bg-white rounded-2xl border border-slate-100 p-7">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-slate-900">{d?.pest_title ?? 'Pest Megye Települései'}</h3>
            </div>
            <div className="space-y-1.5">
              {PEST_CITIES.map((city) =>
                city.slug ? (
                  <Link
                    key={city.name}
                    href={`/${lang}/${city.slug}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors group"
                  >
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    <span className="text-slate-700 text-sm group-hover:text-red-600 transition-colors">{city.name}</span>
                  </Link>
                ) : (
                  <div key={city.name} className="flex items-center gap-2 px-3 py-2">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                    <span className="text-slate-600 text-sm">{city.name}</span>
                  </div>
                )
              )}
              <p className="text-slate-400 text-xs pt-2 px-3">{moreLabel}</p>
            </div>
          </div>

          {/* Highways */}
          <div className="bg-white rounded-2xl border border-slate-100 p-7">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-slate-900">{d?.hw_title ?? 'Autópályák'}</h3>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-5">
              {HIGHWAYS.map((h) => (
                <div key={h} className="bg-amber-50 border border-amber-200 rounded-lg py-3 text-center">
                  <span className="text-amber-800 font-bold text-sm">{h}</span>
                </div>
              ))}
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-slate-600 text-sm leading-relaxed">{d?.hw_note ?? 'Autópályán és főutakon is vállalunk defektjavítást. +5.000 Ft autópálya pótdíj.'}</p>
            </div>
            <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-amber-800 text-sm font-medium">{d?.hw_km ?? 'Budapesten kívül: 380 Ft/km a Budapest határától számítva.'}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
