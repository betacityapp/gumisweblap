'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Gauge, Info, Phone, ArrowRight, AlertTriangle, CheckCircle2, Loader2, ExternalLink } from 'lucide-react';
import CarSelector from '@/components/cars/CarSelector';
import type { Dictionary } from '@/lib/i18n';
import type { TireSpec, TireShopConfig } from '@/lib/types';

interface Props {
  dict: Dictionary;
  phone: string;
  lang?: string;
}

const POSITION_LABELS: Record<string, string> = {
  front: 'Első tengely',
  rear: 'Hátsó tengely',
  universal: 'Első + Hátsó',
};

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  standard: { label: 'Alap', color: 'bg-slate-100 text-slate-700' },
  reinforced: { label: 'Erősített (XL/RF)', color: 'bg-blue-100 text-blue-700' },
  run_flat: { label: 'Defektűrő (RunFlat)', color: 'bg-purple-100 text-purple-700' },
};

function formatSize(s: TireSpec) {
  return s.raw_size || `${s.width}/${s.aspect_ratio} R${s.rim_diameter}`;
}

function buildShopUrl(template: string, s: TireSpec): string {
  return template
    .replace(/\{width\}/g, String(s.width))
    .replace(/\{aspect_ratio\}/g, String(s.aspect_ratio))
    .replace(/\{rim\}/g, String(s.rim_diameter));
}

function getTireBadges(s: TireSpec): { label: string; color: string }[] {
  const badges: { label: string; color: string }[] = [];
  if (s.is_xl) badges.push({ label: 'XL', color: 'bg-blue-100 text-blue-700' });
  if (s.is_c) badges.push({ label: 'C', color: 'bg-amber-100 text-amber-700' });
  if (s.is_run_flat || s.tire_type === 'run_flat') badges.push({ label: 'RunFlat', color: 'bg-purple-100 text-purple-700' });
  if (s.tire_type === 'reinforced' && !s.is_xl) badges.push({ label: 'Erősített', color: 'bg-blue-100 text-blue-700' });
  return badges;
}

export default function TireFinderClient({ dict, phone, lang = 'hu' }: Props) {
  const t = dict.tools;
  const [specs, setSpecs] = useState<TireSpec[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [carLabel, setCarLabel] = useState('');
  const [shopConfigs, setShopConfigs] = useState<TireShopConfig[]>([]);

  useEffect(() => {
    fetch('/api/cars?q=tire-shop-configs').then(r => r.json()).then(d => setShopConfigs(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  async function handleVariant(id: string, variantName: string, genName: string, makeName: string, modelName: string) {
    setCarLabel(`${makeName} ${modelName} ${genName} – ${variantName}`);
    setLoading(true);
    const res = await fetch(`/api/cars?q=tire-specs&variant_id=${id}`);
    const data = await res.json();
    setSpecs(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  const posGroups: Record<string, TireSpec[]> = {};
  for (const s of specs ?? []) {
    if (!posGroups[s.position]) posGroups[s.position] = [];
    posGroups[s.position].push(s);
  }

  const hasShopLinks = shopConfigs.length > 0;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <Gauge className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">{t.tire_finder_title}</h2>
            <p className="text-sm text-slate-500">{t.tire_finder_subtitle}</p>
          </div>
        </div>
        <CarSelector dict={dict} onVariantSelected={handleVariant} onReset={() => { setSpecs(null); setCarLabel(''); }} />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 bg-white rounded-2xl border border-slate-100">
          <Loader2 className="w-7 h-7 animate-spin text-red-500 mr-3" />
          <span className="text-slate-500">{t.loading}</span>
        </div>
      )}

      {!loading && specs !== null && specs.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
          <p className="font-semibold text-amber-800">{t.no_data}</p>
          <p className="text-sm text-amber-600 mt-1">Vegye fel velünk a kapcsolatot a pontos méretekért!</p>
          <a href={`tel:${phone.replace(/\s/g,'')}`}
            className="mt-4 inline-flex items-center gap-2 bg-amber-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-amber-600 transition-colors">
            <Phone className="w-4 h-4" /> {phone}
          </a>
        </div>
      )}

      {!loading && specs && specs.length > 0 && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="font-medium text-slate-700">{carLabel}</span>
            <span>– {t.oem_spec}</span>
          </div>

          {['front', 'rear', 'universal'].filter(p => posGroups[p]?.length).map(pos => (
            <div key={pos} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-6 py-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">
                  {pos === 'front' ? t.front_tire : pos === 'rear' ? t.rear_tire : t.universal_tire}
                </h3>
              </div>
              <div className="divide-y divide-slate-50">
                {posGroups[pos].map((s) => {
                  const tl = TYPE_LABELS[s.tire_type] ?? TYPE_LABELS.standard;
                  const shopLinks = hasShopLinks ? shopConfigs.map(c => ({ label: c.button_label, url: buildShopUrl(c.url_template, s), newTab: c.open_in_new_tab })) : [];
                  return (
                    <div key={s.id} className="px-6 py-4 flex items-center justify-between gap-4">
                      <div>
                        {hasShopLinks ? (
                          <div className="flex flex-wrap items-center gap-2">
                            {shopLinks.map((link, i) => (
                              <a key={i} href={link.url} target={link.newTab ? '_blank' : '_self'} rel={link.newTab ? 'noopener noreferrer' : undefined}
                                className="text-2xl font-bold text-slate-800 tracking-tight hover:text-red-600 transition-colors group inline-flex items-center gap-1">
                                {formatSize(s)}
                                <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-red-500 transition-colors" />
                              </a>
                            ))}
                          </div>
                        ) : (
                          <p className="text-2xl font-bold text-slate-800 tracking-tight">{formatSize(s)}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {getTireBadges(s).map((b, bi) => (
                            <span key={bi} className={`text-xs font-semibold px-2 py-0.5 rounded-full ${b.color}`}>{b.label}</span>
                          ))}
                          {s.motor_source && s.motor_source !== 'Minden kivitel' && (
                            <span className="text-xs text-slate-400">{s.motor_source}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tl.color}`}>{tl.label}</span>
                        {hasShopLinks && (
                          <div className="flex gap-1.5">
                            {shopLinks.map((link, i) => (
                              <a key={i} href={link.url} target={link.newTab ? '_blank' : '_self'} rel={link.newTab ? 'noopener noreferrer' : undefined}
                                className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors">
                                <ExternalLink className="w-3 h-3" /> {link.label}
                              </a>
                            ))}
                          </div>
                        )}
                        {!hasShopLinks && (
                          <a href={`tel:${phone.replace(/\s/g,'')}`}
                            className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors">
                            <Phone className="w-3.5 h-3.5" />
                            {t.call_for_fitting}
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-white">
              <p className="font-bold text-lg">Megvan a méret? Szerelje fel velünk!</p>
              <p className="text-red-100 text-sm">Mobil gumiszerviz – átlagosan 45 perc alatt ott vagyunk</p>
            </div>
            <a href={`tel:${phone.replace(/\s/g,'')}`}
              className="shrink-0 flex items-center gap-2 bg-white text-red-600 px-6 py-3 rounded-xl font-bold hover:bg-red-50 transition-colors shadow-lg">
              <Phone className="w-4 h-4" /> {phone}
            </a>
          </div>
        </div>
      )}

      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
        <p className="text-sm font-semibold text-slate-600 mb-3">{t.also_check}</p>
        <div className="flex flex-wrap gap-3">
          <Link href={`/${lang}/klima-adatbazis`}
            className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-cyan-600 bg-white border border-slate-200 hover:border-cyan-300 px-4 py-2 rounded-xl transition-all">
            <Info className="w-3.5 h-3.5" /> {t.link_ac_db}
          </Link>
          <Link href={`/${lang}/gumi-auto-kereses`}
            className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-orange-600 bg-white border border-slate-200 hover:border-orange-300 px-4 py-2 rounded-xl transition-all">
            <Info className="w-3.5 h-3.5" /> {t.link_tire_reverse}
          </Link>
          <Link href={`/${lang}/gumimeret-valto`}
            className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-emerald-600 bg-white border border-slate-200 hover:border-emerald-300 px-4 py-2 rounded-xl transition-all">
            <Info className="w-3.5 h-3.5" /> {t.link_tire_converter ?? 'Gumiméret váltó'}
          </Link>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 space-y-1">
            <p className="font-semibold">Mire figyeljünk a gumiméret kiválasztásakor?</p>
            <p>A gyári méret az optimális – de megengedett tűréshatárok között változtatható. Erősített (XL/RF) gumikat csak arra tervezett felnikre szabad felszerelni. Defektűrő (RunFlat) gumikhoz speciális felni szükséges. Kétségei esetén kérdezze szerelőinket!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
