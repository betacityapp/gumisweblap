'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Eye, Calendar, Tag } from 'lucide-react';
import { getAllBlogPosts, deleteBlogPost } from '@/lib/db';
import type { BlogPost } from '@/lib/types';

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('hu-HU', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return dateStr; }
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const data = await getAllBlogPosts();
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Biztosan törli a(z) "${title}" bejegyzést?`)) return;
    await deleteBlogPost(id);
    await load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Blog</h1>
          <p className="text-slate-500 mt-1">Blog bejegyzések kezelése</p>
        </div>
        <Link href="/admin/blog/new" className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors">
          <Plus className="w-4 h-4" />
          Új bejegyzés
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Betöltés...</div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-slate-400">Nincsenek bejegyzések</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Bejegyzés</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Dátum</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Cimkék</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Állapot</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 text-sm leading-snug">{post.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <code className="text-xs text-slate-400">/{post.lang || 'hu'}/blog/{post.slug}</code>
                      {post.city && <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">{post.city}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(post.published_at)}
                    </div>
                    <span className="text-xs text-slate-400 uppercase mt-0.5 block">{post.lang || 'hu'}</span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {post.tags.slice(0, 2).map((t) => (
                        <span key={t} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5" />
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${post.is_published ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                      {post.is_published ? 'Aktív' : 'Piszkozat'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <a href={`/${post.lang || 'hu'}/blog/${post.slug}`} target="_blank" className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100">
                        <Eye className="w-4 h-4" />
                      </a>
                      <Link href={`/admin/blog/${post.id}`} className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50">
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(post.id, post.title)} className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50">
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
