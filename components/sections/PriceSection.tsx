import { Check } from 'lucide-react';
import type { PriceItem } from '@/lib/types';
import type { Dictionary } from '@/lib/i18n';
import PriceCalculator from '@/components/PriceCalculator';

interface Props {
  prices: PriceItem[];
  dict?: Dictionary;
  calcConfig?: {
    discountEnabled: boolean;
    discountThreshold: number;
    discountPercent: number;
  };
}

function formatPrice(item: PriceItem): string {
  const n = item.price_from?.toLocaleString('hu-HU') ?? '';
  return `${n} ${item.unit}`;
}

export default function PriceSection({ prices, dict, calcConfig }: Props) {
  const d = dict?.prices;
  const grouped = prices.reduce<Record<string, PriceItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <section className="py-20 bg-slate-50" id="arlista">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-14">
          <span className="text-red-600 font-semibold text-sm uppercase tracking-wider">{d?.label ?? 'Árlista'}</span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-2 mb-4">{d?.title ?? 'Transzparens árazás'}</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">{d?.subtitle ?? 'Rejtett költségek nélkül. Az árak nettó árak és tartalmazzák a kiszállást Budapesten belül.'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {Object.keys(grouped).map((cat) => (
            <div key={cat} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="bg-red-600 px-6 py-4">
                <h3 className="text-white font-bold text-lg">{cat}</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {grouped[cat].map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 shrink-0" />
                      <span className="text-slate-700 text-sm">{item.label}</span>
                      {item.note && <span className="text-slate-400 text-xs">{item.note}</span>}
                    </div>
                    <span className="font-bold text-slate-900 text-sm whitespace-nowrap ml-4">{formatPrice(item)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-5 text-center mb-8">
          <p className="text-amber-800 text-sm font-medium">{d?.note ?? 'Az árak nettó árak, az ÁFÁ-t nem tartalmazzák. Minimális szerelési díj: 20.000 Ft. 1 kerék esetén is!'}</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <PriceCalculator prices={prices} config={calcConfig} />
        </div>
      </div>
    </section>
  );
}
