import Link from 'next/link';
import { Phone, Clock, MapPin, ChevronRight } from 'lucide-react';
import type { SiteSettings } from '@/lib/types';
import type { Dictionary } from '@/lib/i18n';

interface HeroSectionProps {
  settings: SiteSettings;
  dict?: Dictionary;
  title?: string;
  subtitle?: string;
  image?: string;
  city?: string;
  lang?: string;
}

export default function HeroSection({ settings, dict, title, subtitle, image, city, lang = 'hu' }: HeroSectionProps) {
  const heroTitle = title || settings.hero_title;
  const heroSubtitle = subtitle || settings.hero_subtitle;
  const heroImage = image || settings.hero_image;

  const d = dict?.hero;
  const badge = d?.badge ?? '0-24 óra – Nonstop elérhető';
  const cityBadge = d?.city_badge ?? 'és környéke';
  const ctaCall = d?.cta_call ?? 'Hívjon most';
  const ctaPrices = d?.cta_prices ?? 'Árlista megtekintése';
  const statTime = d?.stat_time ?? '45 perc';
  const statTimeSub = d?.stat_time_sub ?? 'átlag kiérkezés';
  const statExp = d?.stat_exp ?? '10+ év';
  const statExpSub = d?.stat_exp_sub ?? 'tapasztalat';
  const statCount = d?.stat_count ?? '10 000+';
  const statCountSub = d?.stat_count_sub ?? 'elvégzett munka';
  const badges = [
    d?.badge_weekend ?? 'Pótdíj nélkül hétvégén',
    d?.badge_highway ?? 'Autópályán is vállalunk',
    d?.badge_digital ?? 'Digitális centrírozás',
    d?.badge_card ?? 'Bankkártya elfogadva',
  ];

  return (
    <section className="relative min-h-[85vh] flex items-center bg-slate-900 overflow-hidden">
      {heroImage && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25"
          style={{ backgroundImage: `url(${heroImage}?auto=compress&cs=tinysrgb&w=1600)` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-slate-900/40" />

      <div className="relative max-w-7xl mx-auto px-4 py-24 pt-36">
        <div className="max-w-3xl">
          {city ? (
            <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/30 rounded-full px-4 py-1.5 mb-6">
              <MapPin className="w-3.5 h-3.5 text-red-400" />
              <span className="text-red-300 text-sm font-medium">{city} {cityBadge}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/30 rounded-full px-4 py-1.5 mb-6">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-red-300 text-sm font-medium">{badge}</span>
            </div>
          )}

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 text-balance">
            {heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-10 max-w-2xl">
            {heroSubtitle}
          </p>

          <div className="flex flex-wrap gap-6 mb-10">
            {[
              { label: statTime, sub: statTimeSub },
              { label: statExp, sub: statExpSub },
              { label: statCount, sub: statCountSub },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <div className="text-white font-bold text-lg leading-none">{stat.label}</div>
                  <div className="text-slate-400 text-xs">{stat.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={`tel:${settings.phone.replace(/\s/g, '')}`}
              className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:shadow-2xl hover:shadow-red-900/50 active:scale-95"
            >
              <Phone className="w-5 h-5" />
              {settings.phone}
            </a>
            <Link
              href={`/${lang}/arlista`}
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all"
            >
              {ctaPrices}
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/80">
        <div className="max-w-7xl mx-auto px-4 pb-8">
          <div className="flex flex-wrap gap-3">
            {badges.map((b) => (
              <span key={b} className="bg-white/10 backdrop-blur-sm border border-white/10 text-white text-xs px-3 py-1.5 rounded-full">
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
