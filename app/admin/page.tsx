'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, BookOpen, MapPin, TrendingUp, Plus, ArrowRight, Globe } from 'lucide-react';
import { getAllPages, getAllBlogPosts } from '@/lib/db';
import type { Page, BlogPost } from '@/lib/types';

export default function AdminDashboard() {
  const [pages, setPages] = useState<Page[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllPages(), getAllBlogPosts()]).then(([p, b]) => {
      setPages(p);
      setPosts(b);
      setLoading(false);
    });
  }, []);

  const cityPages = pages.filter((p) => p.is_city_page);
  const publishedPages = pages.filter((p) => p.is_published);
  const publishedPosts = posts.filter((p) => p.is_published);

  const stats = [
    { label: 'Oldalak', value: pages.length, published: publishedPages.length, icon: FileText, href: '/admin/pages', color: 'blue' },
    { label: 'Blog bejegyzések', value: posts.length, published: publishedPosts.length, icon: BookOpen, href: '/admin/blog', color: 'green' },
    { label: 'Város oldalak', value: cityPages.length, published: cityPages.filter((p) => p.is_published).length, icon: MapPin, href: '/admin/seo', color: 'red' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Üdvözli a Toldi Admin vezérlőpultja</p>
        </div>
        <a href="/" target="_blank" className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm border border-slate-200 px-4 py-2 rounded-lg">
          <Globe className="w-4 h-4" />
          Weboldal
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                <s.icon className="w-5 h-5 text-slate-600" />
              </div>
              <span className="text-xs text-slate-400">{s.published} publikált</span>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">{loading ? '–' : s.value}</div>
            <div className="text-slate-500 text-sm">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-4">Gyors műveletek</h2>
          <div className="space-y-2">
            {[
              { href: '/admin/pages/new', label: 'Új oldal létrehozása', icon: Plus },
              { href: '/admin/blog/new', label: 'Új blog bejegyzés', icon: Plus },
              { href: '/admin/seo', label: 'Város oldal generálása AI-val', icon: MapPin },
              { href: '/admin/ai', label: 'AI konfiguráció beállítása', icon: TrendingUp },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-slate-700 text-sm font-medium group-hover:text-red-600 transition-colors">{label}</span>
                <ArrowRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-red-400 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent pages */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">Legutóbbi oldalak</h2>
            <Link href="/admin/pages" className="text-red-600 text-xs font-semibold">Összes</Link>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-1">
              {pages.slice(0, 5).map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/pages/${p.id}`}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <div className="text-sm font-medium text-slate-800">{p.title}</div>
                    <div className="text-xs text-slate-400">/{p.slug}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.is_published ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {p.is_published ? 'Aktív' : 'Piszkozat'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h3 className="font-bold text-blue-900 mb-2">Tipp: AI oldal generálás</h3>
        <p className="text-blue-700 text-sm">
          Az <strong>SEO & Városok</strong> menüpontban automatikusan generálhat SEO-optimalizált oldalakat különböző városokra az AI segítségével. Ehhez először adjon meg egy AI konfigurációt az <strong>AI Konfig</strong> menüpontban.
        </p>
      </div>
    </div>
  );
}
