'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Wind, AlertTriangle, CheckCircle2, Loader2, Phone, Info, Calculator, Plus, Euro } from 'lucide-react';
import CarSelector from '@/components/cars/CarSelector';
import type { Dictionary } from '@/lib/i18n';
import type { AcSpec, AcPricingSettings, AcExtraService } from '@/lib/types';

interface Props {
  dict: Dictionary;
  phone: string;
  lang?: string;
}

export default function AcFinderClient({ dict, phone, lang = 'hu' }: Props) {
  const t = dict.tools;
  const [spec, setSpec] = useState<AcSpec | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [carLabel, setCarLabel] = useState('');
  const [pricing, setPricing] = useState<AcPricingSettings | null>(null);
  const [extras, setExtras] = useState<AcExtraService[]>([]);
  const [vehicleType, setVehicleType] = useState<'car' | 'van'>('car');
  const [selectedExtras, setSelectedExtras] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/cars?q=ac-pricing').then(r => r.json()).then(d => setPricing(d)).catch(() => {});
    fetch('/api/cars?q=ac-extras').then(r => r.json()).then(d => setExtras(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  async function handleVariant(id: string, variantName: string, genName: string, makeName: string, modelName: string) {
    setCarLabel(`${makeName} ${modelName} ${genName} – ${variantName}`);
    setLoading(true);
    const res = await fetch(`/api/cars?q=ac-spec&variant_id=${id}`);
    const data = await res.json();
    setSpec(data ?? null);
    setLoading(false);
  }

  const refColor = spec?.refrigerant_type === 'R1234yf' ? 'text-green-700 bg-green-50 border-green-200' : 'text-blue-700 bg-blue-50 border-blue-200';

  const pricePerGram = spec && pricing
    ? (spec.refrigerant_type === 'R1234yf'
      ? pricing.refrigerant_r1234yf_price_per_gram
      : pricing.refrigerant_r134a_price_per_gram)
    : 0;
  const gasAmount = spec?.refrigerant_amount_g ?? 0;
  const gasCost = pricePerGram * gasAmount;
  const laborCost = vehicleType === 'van' ? (pricing?.labor_cost_van ?? 0) : (pricing?.labor_cost_car ?? 0);
  const extrasCost = extras
    .filter(e => selectedExtras.has(e.id) && (e.applies_to === 'both' || e.applies_to === vehicleType) && e.is_active)
    .reduce((sum, e) => sum + e.price, 0);
  const totalCost = gasCost + laborCost + extrasCost;

  const availableExtras = extras.filter(e => e.is_active && (e.applies_to === 'both' || e.applies_to === vehicleType));

  function toggleExtra(id: string) {
    setSelectedExtras(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
            <Wind className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">{t.ac_db_title}</h2>
            <p className="text-sm text-slate-500">{t.ac_db_subtitle}</p>
          </div>
        </div>
        <CarSelector dict={dict} onVariantSelected={handleVariant} onReset={() => { setSpec(undefined); setCarLabel(''); }} />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 bg-white rounded-2xl border border-slate-100">
          <Loader2 className="w-7 h-7 animate-spin text-cyan-500 mr-3" />
          <span className="text-slate-500">{t.loading}</span>
        </div>
      )}

      {!loading && spec === null && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
          <p className="font-semibold text-amber-800">{t.no_data}</p>
          <p className="text-sm text-amber-600 mt-2">Kérjük, hívja ügyfélszolgálatunkat a pontos adatokért!</p>
          <a href={`tel:${phone.replace(/\s/g,'')}`}
            className="mt-4 inline-flex items-center gap-2 bg-amber-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-amber-600 transition-colors">
            <Phone className="w-4 h-4" /> {phone}
          </a>
        </div>
      )}

      {!loading && spec && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="font-medium text-slate-700">{carLabel}</span>
          </div>

          {spec.needs_manual_check && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-800">{t.manual_check}</p>
                <p className="text-sm text-amber-700 mt-0.5">{spec.notes ?? t.manual_check_desc}</p>
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className={`rounded-2xl border-2 p-6 ${refColor}`}>
              <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-1">{t.refrigerant_type}</p>
              <p className="text-3xl font-black tracking-tight">{spec.refrigerant_type}</p>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-bold">{spec.refrigerant_amount_g ?? (spec.refrigerant_amount_min_g ?? '–')}</span>
                <span className="text-sm font-medium opacity-70">{t.grams}</span>
                {spec.refrigerant_amount_min_g !== null && spec.refrigerant_amount_max_g !== null && spec.refrigerant_amount_min_g !== spec.refrigerant_amount_max_g && (
                  <span className="text-sm opacity-60 ml-2">({spec.refrigerant_amount_min_g}–{spec.refrigerant_amount_max_g} g)</span>
                )}
              </div>
              {spec.verification_status && spec.verification_status !== 'ok' && (
                <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium opacity-80">
                  {spec.verification_status === 'nincs-adat' && '⚠ Nincs ellenőrzött adat'}
                  {spec.verification_status === 'gyanus-2014-2016' && '⚠ Gyanús (2014-2016)'}
                  {spec.verification_status === 'auto-javitva' && '✓ Automatikusan javítva'}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border-2 border-slate-200 p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">{t.oil_type}</p>
              <p className="text-2xl font-bold text-slate-800">{spec.oil_type ?? '–'}</p>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-700">{spec.oil_amount_ml ?? '–'}</span>
                <span className="text-sm font-medium text-slate-400">{t.ml}</span>
              </div>
              {spec.oil_service && (
                <p className="text-xs text-slate-400 mt-1">Szerviz: {spec.oil_service}</p>
              )}
            </div>
          </div>

          {spec.ac_notes && (
            <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600">{spec.ac_notes}</div>
          )}

          {/* Price calculator */}
          {pricing && pricing.is_active && (
            <div className="bg-white rounded-2xl border-2 border-cyan-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Klímatöltés árajánlat</h3>
                  <p className="text-xs text-slate-500">{carLabel}</p>
                </div>
              </div>

              {/* Vehicle type toggle */}
              <div className="flex gap-2 mb-5">
                <button onClick={() => setVehicleType('car')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${vehicleType === 'car' ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  Személyautó
                </button>
                <button onClick={() => setVehicleType('van')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${vehicleType === 'van' ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  Kisteher
                </button>
              </div>

              {/* Cost breakdown */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">{spec.refrigerant_type} gáz ({gasAmount} g × {pricePerGram} Ft/g)</span>
                  <span className="font-semibold text-slate-800">{gasCost.toLocaleString('hu-HU')} Ft</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Munkadíj ({vehicleType === 'van' ? 'kisteher' : 'személyautó'})</span>
                  <span className="font-semibold text-slate-800">{laborCost.toLocaleString('hu-HU')} Ft</span>
                </div>
                {extrasCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Extra szolgáltatások</span>
                    <span className="font-semibold text-slate-800">{extrasCost.toLocaleString('hu-HU')} Ft</span>
                  </div>
                )}
              </div>

              {/* Extras */}
              {availableExtras.length > 0 && (
                <div className="border-t border-slate-100 pt-4 mb-4">
                  <p className="text-sm font-semibold text-slate-700 mb-2">Extra szolgáltatások (választható)</p>
                  <div className="space-y-2">
                    {availableExtras.map(extra => (
                      <label key={extra.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
                        <input type="checkbox" checked={selectedExtras.has(extra.id)} onChange={() => toggleExtra(extra.id)}
                          className="w-4 h-4 rounded" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-slate-700">{extra.name}</span>
                          {extra.description && <p className="text-xs text-slate-400">{extra.description}</p>}
                        </div>
                        <span className="text-sm font-semibold text-cyan-700">+{extra.price.toLocaleString('hu-HU')} Ft</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="bg-cyan-50 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-cyan-600 font-medium">Becsült teljes ár</p>
                  <p className="text-2xl font-black text-cyan-700">{totalCost.toLocaleString('hu-HU')} Ft</p>
                </div>
                <a href={`tel:${phone.replace(/\s/g,'')}`}
                  className="flex items-center gap-2 bg-cyan-600 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-cyan-700 transition-colors">
                  <Phone className="w-4 h-4" /> Időpont
                </a>
              </div>
              <p className="text-xs text-slate-400 mt-2 text-center">* A végleges ár a helyszíni ellenőrzés után kerül meghatározásra</p>
            </div>
          )}

          <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-white">
              <p className="font-bold text-lg">{t.ac_call_cta}</p>
              <p className="text-cyan-100 text-sm">Professzionális klímatöltés R134a és R1234yf rendszerekhez</p>
            </div>
            <a href={`tel:${phone.replace(/\s/g,'')}`}
              className="shrink-0 flex items-center gap-2 bg-white text-cyan-700 px-6 py-3 rounded-xl font-bold hover:bg-cyan-50 transition-colors shadow-lg">
              <Phone className="w-4 h-4" /> {phone}
            </a>
          </div>
        </div>
      )}

      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
        <p className="text-sm font-semibold text-slate-600 mb-3">{t.also_check}</p>
        <div className="flex flex-wrap gap-3">
          <Link href={`/${lang}/gumimeretek`}
            className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-red-600 bg-white border border-slate-200 hover:border-red-300 px-4 py-2 rounded-xl transition-all">
            <Info className="w-3.5 h-3.5" /> {t.link_tire_finder}
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
            <p className="font-semibold">R134a vs. R1234yf – mi a különbség?</p>
            <p>Az R134a a régebbi, széles körben elterjedt hűtőközeg. Az R1234yf az újabb, környezetbarátabb típus, amely 2017-től kötelező az EU-ban gyártott új autókban. A két gáz <strong>nem keverhetők</strong>, a rendszer típusát a töltésnél mindig ellenőrizzük a gyártói matricáról.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
