import Link from 'next/link';
import { Gauge, Wind, Search, ArrowRight, ArrowLeftRight } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n';

interface Props {
  lang: string;
  dict: Dictionary;
}

export default function ToolsSection({ lang, dict }: Props) {
  const t = dict.tools;

  const tools = [
    {
      href: `/${lang}/gumimeretek`,
      icon: Gauge,
      color: 'red',
      badge: t.tire_finder_badge,
      title: t.tire_finder_title,
      subtitle: t.tire_finder_subtitle,
      cta: t.link_tire_finder,
      bg: 'from-red-50 to-rose-50',
      border: 'border-red-100 hover:border-red-300',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      badgeColor: 'bg-red-100 text-red-700',
      ctaColor: 'text-red-600 hover:text-red-700',
      arrowColor: 'group-hover:text-red-600',
    },
    {
      href: `/${lang}/klima-adatbazis`,
      icon: Wind,
      color: 'cyan',
      badge: t.ac_db_badge,
      title: t.ac_db_title,
      subtitle: t.ac_db_subtitle,
      cta: t.link_ac_db,
      bg: 'from-cyan-50 to-sky-50',
      border: 'border-cyan-100 hover:border-cyan-300',
      iconBg: 'bg-cyan-100',
      iconColor: 'text-cyan-600',
      badgeColor: 'bg-cyan-100 text-cyan-700',
      ctaColor: 'text-cyan-600 hover:text-cyan-700',
      arrowColor: 'group-hover:text-cyan-600',
    },
    {
      href: `/${lang}/gumi-auto-kereses`,
      icon: Search,
      color: 'orange',
      badge: t.tire_reverse_badge,
      title: t.tire_reverse_title,
      subtitle: t.tire_reverse_subtitle,
      cta: t.link_tire_reverse,
      bg: 'from-orange-50 to-amber-50',
      border: 'border-orange-100 hover:border-orange-300',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      badgeColor: 'bg-orange-100 text-orange-700',
      ctaColor: 'text-orange-600 hover:text-orange-700',
      arrowColor: 'group-hover:text-orange-600',
    },
    {
      href: `/${lang}/gumimeret-valto`,
      icon: ArrowLeftRight,
      color: 'emerald',
      badge: t.tire_converter_badge,
      title: t.tire_converter_title,
      subtitle: t.tire_converter_subtitle,
      cta: t.link_tire_converter,
      bg: 'from-emerald-50 to-teal-50',
      border: 'border-emerald-100 hover:border-emerald-300',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      badgeColor: 'bg-emerald-100 text-emerald-700',
      ctaColor: 'text-emerald-600 hover:text-emerald-700',
      arrowColor: 'group-hover:text-emerald-600',
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <span className="inline-block bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-widest">
            {dict.nav.info}
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">
            {lang === 'de' ? 'Nützliche Werkzeuge' : lang === 'en' ? 'Useful Tools' : 'Hasznos eszközök'}
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            {lang === 'de'
              ? 'Kostenlose Datenbanken für Reifengrößen, Klimagas und Fahrzeugsuche'
              : lang === 'en'
              ? 'Free databases for tire sizes, AC refrigerant and vehicle lookup'
              : 'Ingyenes adatbázisok gumimérethez, klímagázhoz és jármű-kereséshez'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className={`group relative flex flex-col bg-gradient-to-br ${tool.bg} rounded-2xl border-2 ${tool.border} p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${tool.iconBg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${tool.iconColor}`} />
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tool.badgeColor}`}>
                    {tool.badge}
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 text-base mb-1.5 leading-snug">{tool.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed flex-1">{tool.subtitle}</p>

                <div className={`flex items-center gap-1.5 mt-4 text-sm font-semibold ${tool.ctaColor} transition-colors`}>
                  {tool.cta}
                  <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${tool.arrowColor}`} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
