import { Star, Quote } from 'lucide-react';
import type { Testimonial } from '@/lib/types';
import type { Dictionary } from '@/lib/i18n';

interface Props {
  testimonials: Testimonial[];
  dict?: Dictionary;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
      ))}
    </div>
  );
}

export default function TestimonialsSection({ testimonials, dict }: Props) {
  const d = dict?.testimonials;
  return (
    <section className="py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-14">
          <span className="text-red-400 font-semibold text-sm uppercase tracking-wider">{d?.label ?? 'Vélemények'}</span>
          <h2 className="text-3xl md:text-4xl font-black text-white mt-2 mb-4">{d?.title ?? 'Mit mondanak ügyfeleink?'}</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">{d?.subtitle ?? 'Több mint 10.000 elvégzett munka és elégedett ügyfél – olvassa el tapasztalataikat!'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-slate-800 rounded-2xl p-7 border border-slate-700 hover:border-red-900 transition-colors">
              <Quote className="w-8 h-8 text-red-600/40 mb-4" />
              <p className="text-slate-300 text-sm leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white text-sm">{t.name}</div>
                  {t.date && <div className="text-slate-500 text-xs mt-0.5">{t.date}</div>}
                </div>
                <Stars rating={t.rating} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <div className="text-left">
              <div className="text-white font-bold text-sm">{d?.google_rating ?? '5.0 / 5.0 Google értékelés'}</div>
              <div className="text-slate-400 text-xs">{d?.google_count ?? '200+ vélemény alapján'}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
