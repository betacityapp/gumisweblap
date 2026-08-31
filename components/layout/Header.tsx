'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, Menu, X, ChevronDown } from 'lucide-react';
import type { NavigationItem, SiteSettings } from '@/lib/types';
import type { Dictionary } from '@/lib/i18n';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
  settings: SiteSettings;
  navigation: NavigationItem[];
  lang?: string;
  dict?: Dictionary;
}

export default function Header({ settings, navigation, lang = 'hu', dict }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  const callLabel = dict?.hero.cta_call ?? 'Hívjon most';
  const homeLabel = dict?.nav.home ?? 'Főoldal';

  function prefixHref(url: string): string {
    if (url.startsWith('http') || url.startsWith('#')) return url;
    if (url === '/') return `/${lang}`;
    if (url.startsWith(`/${lang}/`) || url === `/${lang}`) return url;
    return `/${lang}${url}`;
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      {/* Top bar */}
      <div className="bg-red-600 text-white text-sm py-1.5 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Phone className="w-3 h-3" />
            {lang === 'hu' ? 'Nonstop segítség:' : lang === 'de' ? 'Nonstop Hilfe:' : 'Nonstop help:'}
            <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="font-semibold hover:text-red-100 ml-1">{settings.phone}</a>
            {settings.phone_2 && (
              <>
                <span className="mx-1 opacity-60">|</span>
                <a href={`tel:${settings.phone_2.replace(/\s/g, '')}`} className="font-semibold hover:text-red-100">{settings.phone_2}</a>
              </>
            )}
          </span>
          <span>{settings.working_hours}</span>
        </div>
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${lang}`} className="flex items-center gap-2 group">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt={settings.site_name} className="h-10 max-w-[180px] object-contain" />
            ) : (
              <>
                <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center text-white font-black text-lg group-hover:bg-red-700 transition-colors">T</div>
                <div className="leading-tight">
                  <div className="font-bold text-slate-900 text-sm">Toldi Mobil</div>
                  <div className="text-red-600 font-semibold text-xs">Gumi &amp; Klíma</div>
                </div>
              </>
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigation.map((item) =>
              item.children && item.children.length > 0 ? (
                <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(item.id)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors text-slate-700 hover:text-red-600 hover:bg-red-50">
                    {item.label}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === item.id ? 'rotate-180' : ''}`} />
                  </button>
                  {openDropdown === item.id && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
                      {item.children.map((child) => (
                        <Link
                          key={child.id}
                          href={prefixHref(child.url)}
                          target={child.target}
                          className={`block px-4 py-2.5 text-sm transition-colors ${
                            pathname === prefixHref(child.url)
                              ? 'text-red-600 bg-red-50 font-medium'
                              : 'text-slate-700 hover:text-red-600 hover:bg-red-50'
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.id}
                  href={prefixHref(item.url)}
                  target={item.target}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === prefixHref(item.url)
                      ? 'text-red-600 bg-red-50 font-semibold'
                      : 'text-slate-700 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* CTA + Language */}
          <div className="hidden lg:flex items-center gap-2">
            <LanguageSwitcher currentLang={lang} />
            <a
              href={`tel:${settings.phone.replace(/\s/g, '')}`}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-all hover:shadow-md hover:shadow-red-200 active:scale-95"
            >
              <Phone className="w-4 h-4" />
              {settings.phone}
            </a>
          </div>

          {/* Mobile */}
          <div className="lg:hidden flex items-center gap-2">
            <LanguageSwitcher currentLang={lang} />
            <a
              href={`tel:${settings.phone.replace(/\s/g, '')}`}
              className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-semibold"
            >
              <Phone className="w-3.5 h-3.5" />
              {callLabel}
            </a>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-md text-slate-700 hover:bg-slate-100"
              aria-label="Menü"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {navigation.map((item) => (
              <div key={item.id}>
                {item.children && item.children.length > 0 ? (
                  <>
                    <button
                      onClick={() => setOpenDropdown(openDropdown === item.id ? null : item.id)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-700 font-medium text-sm hover:bg-slate-50"
                    >
                      {item.label}
                      <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === item.id ? 'rotate-180' : ''}`} />
                    </button>
                    {openDropdown === item.id && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.id}
                            href={prefixHref(child.url)}
                            className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:text-red-600 hover:bg-red-50"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={prefixHref(item.url)}
                    className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                      pathname === prefixHref(item.url) ? 'text-red-600 bg-red-50' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
            <div className="pt-3 border-t border-slate-100">
              <a
                href={`tel:${settings.phone.replace(/\s/g, '')}`}
                className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-xl font-semibold text-sm w-full"
              >
                <Phone className="w-4 h-4" />
                {settings.phone}
                {lang === 'hu' ? ' – 0-24 óra' : lang === 'de' ? ' – 24/7' : ' – 24/7'}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
