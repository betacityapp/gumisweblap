'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { FaqItem } from '@/lib/types';
import type { Dictionary } from '@/lib/i18n';

interface Props {
  faqs: FaqItem[];
  dict?: Dictionary;
}

export default function FaqSection({ faqs, dict }: Props) {
  const [open, setOpen] = useState<string | null>(null);
  const d = dict?.faq;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-14">
          <span className="text-red-600 font-semibold text-sm uppercase tracking-wider">{d?.label ?? 'Kérdések'}</span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-2 mb-4">{d?.title ?? 'Gyakran ismételt kérdések'}</h2>
          <p className="text-slate-500">{d?.subtitle ?? 'A leggyakrabban feltett kérdések a helyszíni gumiszerelésről'}</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq.id} className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
              <button
                onClick={() => setOpen(open === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between px-6 py-5 text-left group"
              >
                <span className="font-semibold text-slate-900 group-hover:text-red-600 transition-colors pr-4 text-sm md:text-base">
                  {faq.question}
                </span>
                <ChevronDown className={`w-5 h-5 text-red-600 shrink-0 transition-transform duration-200 ${open === faq.id ? 'rotate-180' : ''}`} />
              </button>
              {open === faq.id && (
                <div className="px-6 pb-5">
                  <p className="text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
