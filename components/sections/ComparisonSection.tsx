import { X, Check } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n';

const ROWS_HU = [
  { aspect: 'Utazás a szervizbe', traditional: 'Szükséges (30-60 perc)', mobile: 'Nem szükséges – mi jövünk!' },
  { aspect: 'Várakozás', traditional: 'Akár 1-3 óra', mobile: '0 perc – Ön közben dolgozhat' },
  { aspect: 'Elérhetőség', traditional: 'Hétköznap 8-17', mobile: '0-24, az év 365 napján' },
  { aspect: 'Defekt az úton', traditional: 'Autómentő szükséges (drága)', mobile: 'Helyszínen javítjuk – olcsóbb!' },
  { aspect: 'Hétvégi/ünnepi szolgáltatás', traditional: 'Általában nem', mobile: 'Igen, pótdíj nélkül!' },
  { aspect: 'Kiérkezési idő', traditional: 'Nem releváns', mobile: 'Átlag 45 perc' },
  { aspect: 'Gumiabroncs szállítás', traditional: 'Önnek kell vinnie', mobile: 'Mi szállítjuk és felszereljük' },
];

const ROWS_EN = [
  { aspect: 'Trip to the garage', traditional: 'Required (30-60 min)', mobile: 'Not needed – we come to you!' },
  { aspect: 'Waiting time', traditional: 'Up to 1-3 hours', mobile: '0 min – keep working' },
  { aspect: 'Availability', traditional: 'Weekdays 8am-5pm', mobile: '24/7, 365 days a year' },
  { aspect: 'Flat tire on the road', traditional: 'Towing needed (expensive)', mobile: 'Fixed on-site – cheaper!' },
  { aspect: 'Weekend / holiday service', traditional: 'Usually not available', mobile: 'Yes, no surcharge!' },
  { aspect: 'Arrival time', traditional: 'N/A', mobile: 'Avg. 45 minutes' },
  { aspect: 'Tire transport', traditional: 'You must bring them', mobile: 'We bring and fit them' },
];

const ROWS_DE = [
  { aspect: 'Fahrt zur Werkstatt', traditional: 'Erforderlich (30-60 Min.)', mobile: 'Nicht nötig – wir kommen!' },
  { aspect: 'Wartezeit', traditional: 'Bis zu 1-3 Stunden', mobile: '0 Min. – weiter arbeiten' },
  { aspect: 'Erreichbarkeit', traditional: 'Mo-Fr 8-17 Uhr', mobile: '24/7, 365 Tage' },
  { aspect: 'Reifenpanne unterwegs', traditional: 'Abschleppdienst nötig', mobile: 'Vor Ort repariert!' },
  { aspect: 'Wochenend-/Feiertagsdienst', traditional: 'Meist nicht verfügbar', mobile: 'Ja, kein Aufpreis!' },
  { aspect: 'Ankunftszeit', traditional: 'N/A', mobile: 'Ø 45 Minuten' },
  { aspect: 'Reifentransport', traditional: 'Selbst mitbringen', mobile: 'Wir bringen & montieren' },
];

interface Props {
  dict?: Dictionary;
}

export default function ComparisonSection({ dict }: Props) {
  const lang = dict?.lang ?? 'hu';
  const rows = lang === 'en' ? ROWS_EN : lang === 'de' ? ROWS_DE : ROWS_HU;
  const d = dict?.comparison;

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-red-600 font-semibold text-sm uppercase tracking-wider">{d?.label ?? 'Miért mi?'}</span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-2 mb-4">{d?.title ?? 'Mobil gumiszerviz vs. hagyományos szerviz'}</h2>
          <p className="text-slate-500">{d?.subtitle ?? 'Nézze meg, miért éri meg a helyszíni gumiszerelés'}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-3 bg-slate-900 text-white text-sm font-bold">
            <div className="px-6 py-4 text-slate-400">{d?.col_aspect ?? 'Szempont'}</div>
            <div className="px-6 py-4 text-center border-l border-slate-700">{d?.col_traditional ?? 'Hagyományos Szerviz'}</div>
            <div className="px-6 py-4 text-center border-l border-red-600 bg-red-600">{d?.col_mobile ?? 'Toldi Mobil Gumi'}</div>
          </div>
          {rows.map((row, i) => (
            <div key={row.aspect} className={`grid grid-cols-3 text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
              <div className="px-6 py-4 font-medium text-slate-700">{row.aspect}</div>
              <div className="px-6 py-4 text-center border-l border-slate-100 text-slate-500">
                <div className="flex items-center justify-center gap-1.5">
                  <X className="w-3.5 h-3.5 text-red-400 shrink-0" />{row.traditional}
                </div>
              </div>
              <div className="px-6 py-4 text-center border-l border-red-100 bg-red-50/50 text-red-700 font-medium">
                <div className="flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />{row.mobile}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
