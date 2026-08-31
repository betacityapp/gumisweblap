'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Navigation,
  Settings,
  Cpu,
  MapPin,
  LogOut,
  Wrench,
  ChevronRight,
  Car,
  Mail,
  Star,
  HelpCircle,
  Tag,
  Upload,
  Snowflake,
  ShoppingCart,
  Wand2,
  Brain,
  Bell,
  Layout,
  Award,
  Gift,
  Megaphone,
  Smartphone,
  TrendingUp,
  Gauge,
  Image,
} from 'lucide-react';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/pages', label: 'Oldalak', icon: FileText },
  { href: '/admin/blog', label: 'Blog', icon: BookOpen },
  { href: '/admin/navigation', label: 'Navigáció', icon: Navigation },
  { href: '/admin/seo', label: 'SEO & Városok', icon: MapPin },
  { href: '/admin/seo-dashboard', label: 'SEO Dashboard', icon: TrendingUp },
  { href: '/admin/app-page', label: 'Toldi Mobile App', icon: Smartphone },
  { href: '/admin/cars', label: 'Autó adatbázis', icon: Car },
  { href: '/admin/import', label: 'Import (JSONL)', icon: Upload },
  { href: '/admin/ac-pricing', label: 'Klíma árazás', icon: Snowflake },
  { href: '/admin/tire-shop', label: 'Webshop linkek', icon: ShoppingCart },
  { href: '/admin/contact', label: 'Üzenetek', icon: Mail },
  { href: '/admin/testimonials', label: 'Értékelések', icon: Star },
  { href: '/admin/faq', label: 'GYIK', icon: HelpCircle },
  { href: '/admin/prices', label: 'Árlista', icon: Tag },
  { href: '/admin/services', label: 'Szolgáltatások', icon: Wrench },
  { href: '/admin/homepage', label: 'Főoldal', icon: Layout },
  { href: '/admin/popups', label: 'Felugró ablakok', icon: Bell },
  { href: '/admin/banners', label: 'Szalag / Közlemény', icon: Megaphone },
  { href: '/admin/partners', label: 'Partnerek', icon: Award },
  { href: '/admin/lotteries', label: 'Sorsolások', icon: Gift },
  { href: '/admin/ai', label: 'AI Konfig', icon: Cpu },
  { href: '/admin/ai-generate', label: 'AI Generátor', icon: Wand2 },
  { href: '/admin/ai-assistant', label: 'AI Asszisztens', icon: Brain },
  { href: '/admin/settings', label: 'Beállítások', icon: Settings },
];

interface AdminSidebarProps {
  onLogout: () => void;
}

export default function AdminSidebar({ onLogout }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside className="w-64 bg-slate-900 min-h-screen flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm">Toldi Admin</div>
            <div className="text-slate-400 text-xs">CMS vezérlőpult</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive(href, exact)
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
            {isActive(href, exact) && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white text-sm transition-colors mb-1"
        >
          <FileText className="w-4 h-4" />
          Weboldal megtekintése
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-red-400 text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Kijelentkezés
        </button>
      </div>
    </aside>
  );
}
