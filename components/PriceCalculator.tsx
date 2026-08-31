'use client';

import { useState, useMemo } from 'react';
import { Calculator, Car, Plus, Trash2, Users, Percent, Split } from 'lucide-react';
import type { PriceItem } from '@/lib/types';

interface CarEntry {
  id: string;
  rimSize: string;
  label: string;
}

interface CalcConfig {
  discountEnabled: boolean;
  discountThreshold: number;
  discountPercent: number;
}

function extractRimPrices(prices: PriceItem[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const p of prices) {
    if (p.category.includes('szezonális') && p.category.includes('gumicsere') && p.unit.includes('kerék')) {
      const label = p.label.replace(/\s/g, '');
      const m = label.match(/(\d+)[""]/);
      if (m) {
        const size = m[1];
        map[size] = p.price_from ?? 0;
      }
    }
  }
  return map;
}

function getRimOptions(prices: PriceItem[]): { value: string; label: string; pricePerWheel: number }[] {
  const priceMap = extractRimPrices(prices);
  const sorted = Object.keys(priceMap).map(Number).sort((a, b) => a - b);
  const options: { value: string; label: string; pricePerWheel: number }[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const size = sorted[i];
    const nextSize = sorted[i + 1];
    const label = nextSize ? `${size}" - ${nextSize - 1}"` : `${size}"+`;
    options.push({ value: String(size), label, pricePerWheel: priceMap[String(size)] });
  }
  return options;
}

export default function PriceCalculator({
  prices,
  config,
}: {
  prices: PriceItem[];
  config?: Partial<CalcConfig>;
}) {
  const cfg: CalcConfig = {
    discountEnabled: false,
    discountThreshold: 3,
    discountPercent: 10,
    ...config,
  };

  const rimOptions = useMemo(() => getRimOptions(prices), [prices]);
  const priceMap = useMemo(() => extractRimPrices(prices), [prices]);

  const defaultSize = rimOptions.length > 0 ? rimOptions[0].value : '15';
  const [cars, setCars] = useState<CarEntry[]>([{ id: '1', rimSize: defaultSize, label: '1. autó' }]);
  const [splitMode, setSplitMode] = useState(false);

  const addCar = () => {
    const n = cars.length + 1;
    setCars([...cars, { id: Date.now().toString(), rimSize: defaultSize, label: `${n}. autó` }]);
  };

  const removeCar = (id: string) => {
    if (cars.length <= 1) return;
    setCars(cars.filter(c => c.id !== id));
  };

  const updateCar = (id: string, field: 'rimSize' | 'label', value: string) => {
    setCars(cars.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const { perCar, subtotal, discount, total, perPerson } = useMemo(() => {
    const perCar = cars.map(c => (priceMap[c.rimSize] ?? 0) * 4);
    const subtotal = perCar.reduce((a, b) => a + b, 0);
    let discount = 0;
    if (cfg.discountEnabled && cars.length >= cfg.discountThreshold) {
      discount = Math.round(subtotal * (cfg.discountPercent / 100));
    }
    const total = subtotal - discount;
    const perPerson = splitMode && cars.length > 1 ? Math.round(total / cars.length) : 0;
    return { perCar, subtotal, discount, total, perPerson };
  }, [cars, priceMap, cfg, splitMode]);

  const fmt = (n: number) => n.toLocaleString('hu-HU') + ' Ft';

  if (rimOptions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-400 text-sm">
        Árkalkulátor nem elérhető – hiányoznak az áradatok.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
        <h3 className="text-xl font-black flex items-center gap-2"><Calculator className="w-5 h-5" /> Árkalkulátor</h3>
        <p className="text-white/80 text-sm mt-1">Számolja ki mennyibe kerül a gumicsere – 4 kerék / autó</p>
      </div>

      <div className="p-6 space-y-4">
        {cfg.discountEnabled && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
            <Percent className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800">
              {cfg.discountThreshold} autó után <strong>{cfg.discountPercent}% kedvezmény</strong> jár!
            </p>
          </div>
        )}

        {cars.map((car, i) => (
          <div key={car.id} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
              <Car className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1 grid grid-cols-2 gap-2">
              <input
                type="text"
                value={car.label}
                onChange={e => updateCar(car.id, 'label', e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                placeholder="Autó neve"
              />
              <select
                value={car.rimSize}
                onChange={e => updateCar(car.id, 'rimSize', e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
              >
                {rimOptions.map(o => <option key={o.value} value={o.value}>{o.label} ({o.pricePerWheel.toLocaleString('hu-HU')} Ft/kerék)</option>)}
              </select>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs text-slate-400">4 kerék</div>
              <div className="font-bold text-slate-900 text-sm">{fmt(perCar[i])}</div>
            </div>
            {cars.length > 1 && (
              <button onClick={() => removeCar(car.id)} className="text-red-400 hover:text-red-600 p-1 shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}

        <button onClick={addCar} className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium">
          <Plus className="w-4 h-4" /> Autó hozzáadása
        </button>

        {cars.length > 1 && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={splitMode} onChange={e => setSplitMode(e.target.checked)} className="w-4 h-4 rounded text-red-600" />
            <span className="text-sm text-slate-600 flex items-center gap-1"><Split className="w-3.5 h-3.5" /> Igazságos elosztás (fejenként egyenlő)</span>
          </label>
        )}

        <div className="border-t border-slate-200 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Részösszeg ({cars.length} autó)</span>
            <span className="font-medium text-slate-700">{fmt(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Kedvezmény ({cfg.discountPercent}%)</span>
              <span className="font-medium text-green-600">-{fmt(discount)}</span>
            </div>
          )}
          <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
            <span className="font-bold text-slate-900">Fizetendő összesen</span>
            <span className="text-2xl font-black text-red-600">{fmt(total)}</span>
          </div>
          {splitMode && cars.length > 1 && (
            <div className="flex justify-between items-center bg-blue-50 rounded-xl p-3">
              <span className="text-sm text-blue-700 flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Fejenként ({cars.length} fő)</span>
              <span className="font-bold text-blue-700">{fmt(perPerson)}</span>
            </div>
          )}
        </div>

        <div className="text-xs text-slate-400 leading-relaxed">
          A kalkulátor tájékoztató jellegű. A végleges árat a gumiabroncs típusa, a jármű és a helyszín befolyásolja.
          Az árak 1 kerékre vonatkoznak, a kalkulátor 4 kerékkel (1 autó) számol.
        </div>
      </div>
    </div>
  );
}
