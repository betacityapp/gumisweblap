import { Phone, MessageSquare, Truck, CheckCircle } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n';

const ICONS = [Phone, MessageSquare, Truck, CheckCircle];

interface Props {
  dict?: Dictionary;
}

export default function HowItWorksSection({ dict }: Props) {
  const d = dict?.how_it_works;

  const steps = [
    { icon: Phone, title: d?.step1_title ?? 'Hívjon minket', desc: d?.step1_desc ?? 'Tárcsázza a +36 30 582 0870 számot, vagy töltse le a Toldi Mobile alkalmazást.', num: '01' },
    { icon: MessageSquare, title: d?.step2_title ?? 'Árajánlat és egyeztetés', desc: d?.step2_desc ?? 'Megbeszéljük a helyszínt, időpontot és szolgáltatást. Nincsenek meglepetések.', num: '02' },
    { icon: Truck, title: d?.step3_title ?? '45 percen belül ott vagyunk', desc: d?.step3_desc ?? 'Felszerelt szervizautónkkal átlag 45 perc alatt megérkezünk. Defekt esetén az autópályára is!', num: '03' },
    { icon: CheckCircle, title: d?.step4_title ?? 'Profi munka, biztonságos továbbhaladás', desc: d?.step4_desc ?? 'Elvégezzük a munkát, ellenőrizzük a nyomást, meghúzzuk a kerekeket – Ön biztonságban gurulhat tovább!', num: '04' },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-14">
          <span className="text-red-600 font-semibold text-sm uppercase tracking-wider">{d?.label ?? 'Hogyan működik?'}</span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-2 mb-4">{d?.title ?? '4 egyszerű lépés'}</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">{d?.subtitle ?? 'Defektet kapott vagy szezonális gumicserét szeretne? Így működik a mobil gumiszerviz:'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={step.num} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[calc(50%+3rem)] w-[calc(100%-3rem)] h-px bg-gradient-to-r from-red-200 to-transparent z-0" />
              )}
              <div className="relative bg-slate-50 rounded-2xl p-7 text-center hover:shadow-lg transition-shadow">
                <div className="absolute -top-3 left-6 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-full">{step.num}</div>
                <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4 mt-2">
                  <step.icon className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
