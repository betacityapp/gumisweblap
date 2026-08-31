'use client';

import { Smartphone, Download, Star } from 'lucide-react';

export default function AppRecommendation({ lang = 'hu' }: { lang?: string }) {
  const texts: Record<string, { title: string; desc: string; button: string; badge: string; platform: string }> = {
    hu: { title: 'Töltse le a Toldi Mobile alkalmazást!', desc: 'Foglaljon időpontot egyetlen kattintással, kövesse a szerelés állapotát valós időben, és kapjon értesítéseket a szezonális gumicseréről.', button: 'Letöltés Google Play-ről', badge: 'Csak Androidon', platform: 'Android' },
    en: { title: 'Download the Toldi Mobile app!', desc: 'Book an appointment with one click, track your service in real-time, and get notified about seasonal tire changes.', button: 'Get it on Google Play', badge: 'Android only', platform: 'Android' },
    de: { title: 'Laden Sie die Toldi Mobile App herunter!', desc: 'Buchen Sie einen Termin mit einem Klick, verfolgen Sie den Service in Echtzeit und erhalten Sie Benachrichtigungen.', button: 'Bei Google Play herunterladen', badge: 'Nur Android', platform: 'Android' },
  };

  const t = texts[lang] ?? texts.hu;

  return (
    <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 md:p-8 text-white">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
          <Smartphone className="w-8 h-8" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-medium mb-2">
            <Star className="w-3 h-3 fill-white" /> {t.badge}
          </div>
          <h3 className="text-xl md:text-2xl font-black mb-2">{t.title}</h3>
          <p className="text-white/90 text-sm md:text-base max-w-2xl">{t.desc}</p>
        </div>
        <a href="https://play.google.com/store/apps/details?id=com.toldi.mobile" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 bg-white text-red-600 hover:bg-red-50 px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-colors shrink-0">
          <Download className="w-4 h-4" /> {t.button}
        </a>
      </div>
    </div>
  );
}
