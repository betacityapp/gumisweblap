'use client';

import { Truck, Phone, ExternalLink, Clock, MapPin } from 'lucide-react';

export default function TowingPartner({ lang = 'hu' }: { lang?: string }) {
  const texts: Record<string, { title: string; desc: string; services: string[]; button: string; phone: string; note: string }> = {
    hu: {
      title: 'Autómentés – Partnereink',
      desc: 'Lerobbant az autója? Autómentéshez megbízható partnerünket, a Bakos Autómentést ajánljuk. 0-24 órában, non-stop elérhető Budapesten és Pest megye teljes területén.',
      services: ['Személyautó mentés', 'Furgon és kisteherautó', 'Darus autómentő', 'Bikázás', 'Autópálya mentés', 'Szervizbe szállítás'],
      button: 'Bakos Autómentés weboldala',
      phone: '+36 30 123 4567',
      note: '30 percen belül kiérkezés Pest megye legtöbb pontjára',
    },
    en: {
      title: 'Towing Service – Our Partners',
      desc: 'Car broke down? For towing we recommend our trusted partner, Bakos Autómentés. Available 0-24 hours, non-stop in Budapest and Pest county.',
      services: ['Passenger car towing', 'Van and small truck', 'Crane towing', 'Jump start', 'Highway towing', 'Garage transport'],
      button: 'Bakos Autómentés website',
      phone: '+36 30 123 4567',
      note: 'Arrival within 30 minutes in most of Pest county',
    },
    de: {
      title: 'Abschleppdienst – Unsere Partner',
      desc: 'Auto liegengeblieben? Für Abschleppdienste empfehlen wir unseren vertrauenswürdigen Partner Bakos Autómentés. 0-24 Stunden verfügbar in Budapest und Pest.',
      services: ['PKW-Abschleppung', 'Transporter', 'Kran-Abschleppung', 'Starthilfe', 'Autobahn-Abschleppung', 'Werkstatttransport'],
      button: 'Bakos Autómentés Website',
      phone: '+36 30 123 4567',
      note: 'Ankunft innerhalb von 30 Minuten im Großteil Pest',
    },
  };

  const t = texts[lang] ?? texts.hu;

  return (
    <div className="bg-slate-900 py-16">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-red-600/20 text-red-400 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <Truck className="w-4 h-4" /> {t.title}
          </div>
          <p className="text-slate-400 max-w-2xl mx-auto">{t.desc}</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 rounded-2xl bg-white flex items-center justify-center shrink-0 overflow-hidden">
              <img src="https://bakosautomentes.hu/wp-content/uploads/2024/01/logo.png" alt="Bakos Autómentés" className="max-w-full max-h-full object-contain p-3" />
            </div>

            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-black text-white mb-2">Bakos Autómentés</h3>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-4">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-red-500" /> 0-24 óra</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-red-500" /> Budapest + Pest megye</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
                {t.services.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-slate-300">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" /> {s}
                  </div>
                ))}
              </div>

              <p className="text-amber-400 text-sm font-medium mb-4">{t.note}</p>

              <div className="flex flex-col sm:flex-row gap-3">
                <a href="https://bakosautomentes.hu/" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors">
                  <ExternalLink className="w-4 h-4" /> {t.button}
                </a>
                <a href="tel:+36301234567"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors">
                  <Phone className="w-4 h-4" /> {t.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
