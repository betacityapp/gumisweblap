import Link from 'next/link';
import {
  RotateCw, AlertTriangle, Thermometer, Circle, Truck, Briefcase, Wrench, ArrowRight,
} from 'lucide-react';
import type { Service } from '@/lib/types';
import type { Dictionary } from '@/lib/i18n';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'rotate-cw': RotateCw,
  'alert-triangle': AlertTriangle,
  thermometer: Thermometer,
  circle: Circle,
  truck: Truck,
  briefcase: Briefcase,
  wrench: Wrench,
};

const SERVICE_SLUGS: Record<string, string> = {
  'Szezonális Gumicsere': 'szezonalis-gumicsere',
  'Defektjavítás': 'defektjavitas',
  'Autóklíma Töltés': 'autoklima-toltes',
  'Centrírozás': 'centirozas',
  'Autómentés': 'automentes',
  'Flottakezelés': 'flottakezeles',
};

interface Props {
  services: Service[];
  dict?: Dictionary;
  lang?: string;
}

export default function ServicesSection({ services, dict, lang = 'hu' }: Props) {
  const d = dict?.services;
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-14">
          <span className="text-red-600 font-semibold text-sm uppercase tracking-wider">{d?.label ?? 'Szolgáltatásaink'}</span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-2 mb-4">{d?.title ?? 'Teljes körű mobil gumiszerviz'}</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">{d?.subtitle ?? 'Egyetlen telefonhívásra kimegyünk Önhöz – nincs várakozás, nincs szervizbe utazás.'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = ICON_MAP[service.icon] ?? Wrench;
            const slug = SERVICE_SLUGS[service.title];
            return (
              <Link
                key={service.id}
                href={slug ? `/${lang}/${slug}` : '#'}
                className="group bg-slate-50 hover:bg-white border border-slate-100 hover:border-red-100 hover:shadow-xl hover:shadow-red-50 rounded-2xl p-7 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-red-600 group-hover:bg-red-700 rounded-xl flex items-center justify-center transition-colors">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {service.badge && (
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">{service.badge}</span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-red-600 transition-colors">{service.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{service.description}</p>
                <span className="flex items-center gap-1 text-red-600 text-sm font-semibold group-hover:gap-2 transition-all">
                  {d?.details ?? 'Részletek'} <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
