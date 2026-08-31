'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Eye, EyeOff, MapPin, FileCode } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { deletePage } from '@/lib/db';
import type { Page } from '@/lib/types';

// Built-in pages that exist as file-system routes, not in the database.
// These appear in the admin list but can't be deleted (they're code-based).
const BUILT_IN_PAGES = [
  { slug: 'szezonalis-gumicsere', title: 'Szezonális Gumicsere', lang: 'hu', editable: true },
  { slug: 'defektjavitas', title: 'Defektjavítás', lang: 'hu', editable: true },
  { slug: 'autoklima-toltes', title: 'Autóklíma Töltés', lang: 'hu', editable: true },
  { slug: 'centirozas', title: 'Centrírozás', lang: 'hu', editable: true },
  { slug: 'automentes', title: 'Autómentés', lang: 'hu', editable: true },
  { slug: 'flottakezeles', title: 'Flottakezelés', lang: 'hu', editable: true },
  { slug: 'gumi-auto-kereses', title: 'Gumi & Autó Kereső', lang: 'hu', editable: false },
  { slug: 'gumiabroncs-jeloles', title: 'Gumiabroncs Jelölés', lang: 'hu', editable: false },
  { slug: 'gumimeret-valto', title: 'Gumiméret Váltó', lang: 'hu', editable: false },
  { slug: 'gumimeretek', title: 'Gumiméretek', lang: 'hu', editable: false },
  { slug: 'klima-adatbazis', title: 'Klíma Adatbázis', lang: 'hu', editable: false },
];

export default function AdminPagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('id, slug, lang, title, city, is_city_page, is_published, sort_order')
        .order('sort_order');
      if (error) throw error;
      setPages((data as Page[]) ?? []);
    } catch (err: any) {
      setError(err.message || 'Hiba az oldalak betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Biztosan törli a(z) "${title}" oldalt?`)) return;
    await deletePage(id);
    await load();
  };

  // Find DB pages that overlap with built-in pages (by slug)
  const dbSlugs = new Set(pages.map((p) => p.slug));
  const builtInOnly = BUILT_IN_PAGES.filter((b) => !dbSlugs.has(b.slug));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Oldalak</h1>
          <p className="text-slate-500 mt-1">CMS oldalak és beépített oldalak kezelése</p>
        </div>
        <Link href="/admin/pages/new" className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors">
          <Plus className="w-4 h-4" />
          Új oldal
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">{error}</div>
      )}

      {/* Built-in pages section */}
      {!loading && builtInOnly.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <FileCode className="w-4 h-4" />
            Beépített oldalak
          </h2>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Oldal</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Slug</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Típus</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Állapot</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {builtInOnly.map((page) => (
                  <tr key={page.slug} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 text-sm flex items-center gap-2">
                        <FileCode className="w-3.5 h-3.5 text-slate-400" />
                        {page.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">/{page.slug}</code>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-purple-50 text-purple-700">
                        Beépített
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-50 text-green-700">
                        Aktív
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <a
                          href={`/${page.lang}/${page.slug}`}
                          target="_blank"
                          className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
                          title="Megtekintés"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        {page.editable ? (
                          <Link
                            href={`/admin/pages/built-in/${page.slug}`}
                            className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50"
                            title="Szerkesztés"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                        ) : (
                          <span className="text-xs text-slate-300 px-2" title="Ez az oldal kódból van generálva, nem szerkeszthető">
                            fix
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CMS pages section */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-3">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">CMS oldalak (adatbázis)</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-400">Betöltés...</div>
        ) : pages.length === 0 ? (
          <div className="p-8 text-center text-slate-400">Nincsenek CMS oldalak</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Oldal</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Slug</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Típus</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Állapot</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 text-sm">{page.title}</div>
                    {page.city && (
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {page.city}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">/{page.slug}</code>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${page.is_city_page ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                      {page.is_city_page ? 'Város oldal' : 'CMS oldal'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${page.is_published ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                      {page.is_published ? 'Aktív' : 'Piszkozat'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <a href={`/${page.lang || 'hu'}/${page.slug}`} target="_blank" className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100" title="Megtekintés">
                        {page.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </a>
                      <Link href={`/admin/pages/${page.id}`} className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50" title="Szerkesztés">
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(page.id, page.title)} className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50" title="Törlés">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
