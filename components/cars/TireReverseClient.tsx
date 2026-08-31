'use client';

import { useState, useRef } from 'react';
import { Search, Car, AlertTriangle, Loader2, Info, ArrowRight } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n';
import Link from 'next/link';

interface Props {
  dict: Dictionary;
  lang: string;
}

interface ReverseResult {
  position: string;
  tire_type: string;
  is_xl?: boolean;
  is_c?: boolean;
  is_run_flat?: boolean;
  raw_size?: string;
  motor_source?: string;
  variant: {
    name: string;
    generation: {
      name: string;
      code: string;
      years_start: number | null;
      years_end: number | null;
      model: {
        name: string;
        make: { name: string };
      };
    };
  };
}

interface GroupedCar {
  make: string;
  model: string;
  generation: string;
  code: string;
  years_start: number | null;
  years_end: number | null;
  variants: { name: string; position: string; tire_type: string; is_xl?: boolean; is_c?: boolean; is_run_flat?: boolean; motor_source?: string }[];
}

const POSITION_ICON: Record<string, string> = { front: 'E', rear: 'H', universal: 'E+H' };
const TYPE_COLOR: Record<string, string> = {
  standard: 'bg-slate-100 text-slate-600',
  reinforced: 'bg-blue-100 text-blue-700',
  run_flat: 'bg-purple-100 text-purple-700',
};
const TYPE_LABEL: Record<string, string> = {
  standard: 'Standard',
  reinforced: 'XL/RF',
  run_flat: 'RunFlat',
};

function groupResults(data: ReverseResult[]): GroupedCar[] {
  const map = new Map<string, GroupedCar>();
  for (const r of data) {
    const g = r.variant?.generation;
    if (!g) continue;
    const key = `${g.model?.make?.name}|${g.model?.name}|${g.name}`;
    if (!map.has(key)) {
      map.set(key, {
        make: g.model?.make?.name ?? '',
        model: g.model?.name ?? '',
        generation: g.name ?? '',
        code: g.code ?? '',
        years_start: g.years_start,
        years_end: g.years_end,
        variants: [],
      });
    }
    const entry = map.get(key)!;
    if (!entry.variants.some(v => v.name === r.variant?.name && v.position === r.position && v.tire_type === r.tire_type)) {
      entry.variants.push({
        name: r.variant?.name ?? '',
        position: r.position,
        tire_type: r.tire_type,
        is_xl: r.is_xl,
        is_c: r.is_c,
        is_run_flat: r.is_run_flat,
        motor_source: r.motor_source,
      });
    }
  }
  return Array.from(map.values());
}

export default function TireReverseClient({ dict, lang }: Props) {
  const t = dict.tools;
  const [input, setInput] = useState('');
  const [results, setResults] = useState<GroupedCar[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchedSize, setSearchedSize] = useState('');

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const val = input.trim();
    if (!val) return;
    setError('');
    setLoading(true);
    setResults(null);
    const res = await fetch(`/api/cars?q=reverse&size=${encodeURIComponent(val)}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? 'Hiba');
      setLoading(false);
      return;
    }
    setSearchedSize(val);
    setResults(groupResults(Array.isArray(data) ? data : []));
    setLoading(false);
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <Search className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">{t.tire_reverse_title}</h2>
            <p className="text-sm text-slate-500">{t.tire_reverse_subtitle}</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={t.search_placeholder}
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-lg font-semibold tracking-wide focus:border-orange-400 focus:outline-none transition-colors bg-slate-50 focus:bg-white"
            />
            <p className="absolute -bottom-5 left-1 text-xs text-slate-400">{t.search_hint}</p>
          </div>
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold transition-colors">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {t.search_button}
          </button>
        </form>

        {error && <p className="mt-8 text-red-600 text-sm font-medium">{error}</p>}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 bg-white rounded-2xl border border-slate-100">
          <Loader2 className="w-7 h-7 animate-spin text-orange-500 mr-3" />
          <span className="text-slate-500">{t.loading}</span>
        </div>
      )}

      {!loading && results !== null && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <p className="text-slate-600 font-medium">
              <span className="text-orange-600 font-bold">{searchedSize}</span> – {results.length} {t.compatible_count}
            </p>
          </div>

          {results.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl p-10 text-center">
              <Car className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">{t.no_results}</p>
              <p className="text-sm text-slate-400 mt-1">Próbáljon más méretet, pl. 205/55 R16</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {results.map((car, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-bold">{car.make} {car.model}</p>
                        <p className="text-slate-300 text-sm">{car.generation}</p>
                      </div>
                      {car.code && (
                        <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-lg">{car.code}</span>
                      )}
                    </div>
                    {(car.years_start || car.years_end) && (
                      <p className="text-slate-400 text-xs mt-1">{car.years_start ?? ''}–{car.years_end ?? 'napjaink'}</p>
                    )}
                  </div>
                  <div className="px-5 py-4 space-y-2">
                    {car.variants.map((v, vi) => (
                      <div key={vi} className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">{v.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 font-medium">{POSITION_ICON[v.position] ?? v.position}</span>
                          {v.is_xl && <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">XL</span>}
                          {v.is_c && <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">C</span>}
                          {(v.is_run_flat || v.tire_type === 'run_flat') && <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">RunFlat</span>}
                          {v.tire_type === 'reinforced' && !v.is_xl && <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">Erősített</span>}
                          {v.tire_type === 'standard' && !v.is_xl && !v.is_c && !v.is_run_flat && <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLOR[v.tire_type] ?? TYPE_COLOR.standard}`}>{TYPE_LABEL[v.tire_type] ?? v.tire_type}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cross-links */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
        <p className="text-sm font-semibold text-slate-600 mb-3">{t.also_check}</p>
        <div className="flex flex-wrap gap-3">
          <Link href={`/${lang}/gumimeretek`}
            className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-red-600 bg-white border border-slate-200 hover:border-red-300 px-4 py-2 rounded-xl transition-all">
            <ArrowRight className="w-3.5 h-3.5" /> {t.link_tire_finder}
          </Link>
          <Link href={`/${lang}/gumimeret-valto`}
            className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-emerald-600 bg-white border border-slate-200 hover:border-emerald-300 px-4 py-2 rounded-xl transition-all">
            <ArrowRight className="w-3.5 h-3.5" /> {t.link_tire_converter ?? 'Gumiméret váltó'}
          </Link>
          <Link href={`/${lang}/klima-adatbazis`}
            className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-cyan-600 bg-white border border-slate-200 hover:border-cyan-300 px-4 py-2 rounded-xl transition-all">
            <ArrowRight className="w-3.5 h-3.5" /> {t.link_ac_db}
          </Link>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            <strong>Fontos:</strong> Az adatbázis gyári (OEM) méreteket tartalmaz. Tuning vagy egyéni felni esetén más méretek is alkalmazhatók. Mindig ellenőrizze a gumiabroncs kompatibilitását a konkrét felni méretével és az engedélyezett terheléssel!
          </p>
        </div>
      </div>
    </div>
  );
}
