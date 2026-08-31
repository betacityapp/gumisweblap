'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const LANGS = [
  { code: 'hu', label: 'Magyar', flag: 'HU' },
  { code: 'en', label: 'English', flag: 'EN' },
  { code: 'de', label: 'Deutsch', flag: 'DE' },
];

interface Props {
  currentLang: string;
}

export default function LanguageSwitcher({ currentLang }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function getNewPath(newLang: string): string {
    const segments = pathname.split('/');
    segments[1] = newLang;
    return segments.join('/') || `/${newLang}`;
  }

  const current = LANGS.find((l) => l.code === currentLang) ?? LANGS[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-red-600 hover:bg-red-50 transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span className="font-bold">{current.flag}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
          {LANGS.map((lang) => (
            <Link
              key={lang.code}
              href={getNewPath(lang.code)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                lang.code === currentLang
                  ? 'text-red-600 font-semibold bg-red-50'
                  : 'text-slate-700 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              <span className="font-bold text-xs w-6">{lang.flag}</span>
              {lang.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
