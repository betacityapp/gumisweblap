'use client';

import { useEffect, useState } from 'react';
import { Save, Eye, EyeOff, GripVertical, Layout, Video, Image as ImageIcon, Type } from 'lucide-react';
import { getHomepageSections, updateHomepageSection } from '@/lib/db';
import type { HomepageSection } from '@/lib/types';

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero banner (főcím)',
  comparison: 'Összehasonlítás táblázat',
  services: 'Szolgáltatások rács',
  prices: 'Árlista',
  how_it_works: 'Hogyan működik (4 lépés)',
  coverage: 'Lefedettség térkép',
  testimonials: 'Vélemények',
  faq: 'Gyakori kérdések',
  blog_preview: 'Blog előnézet',
  contact: 'Kapcsolat',
};

export default function AdminHomepagePage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const load = async () => {
    const data = await getHomepageSections();
    setSections(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleVisible = async (s: HomepageSection) => {
    await updateHomepageSection(s.id, { is_visible: !s.is_visible });
    await load();
  };

  const updateSort = async (id: string, newOrder: number) => {
    await updateHomepageSection(id, { sort_order: newOrder });
    await load();
  };

  const saveCustom = async (s: HomepageSection, data: Partial<HomepageSection>) => {
    await updateHomepageSection(s.id, data);
    await load();
    setEditingKey(null);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Layout className="w-7 h-7 text-red-600" /> Főoldal kezelése
        </h1>
        <p className="text-slate-500 mt-1">Szakaszok be- és kikapcsolása, sorrend módosítása, egyedi tartalom hozzáadása</p>
      </div>

      {loading ? (
        <div className="text-slate-400">Betöltés...</div>
      ) : (
        <div className="space-y-3">
          {sections.sort((a, b) => a.sort_order - b.sort_order).map(s => (
            <div key={s.id} className={`bg-white rounded-2xl border p-5 ${s.is_visible ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-slate-300" />
                  <span className="text-xs font-bold text-slate-400 w-6">{s.sort_order}</span>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{SECTION_LABELS[s.section_key] ?? s.section_key}</div>
                    {s.custom_title && <div className="text-xs text-slate-400">Egyedi cím: {s.custom_title}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditingKey(editingKey === s.section_key ? null : s.section_key)}
                    className="text-xs text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors">
                    <Type className="w-3.5 h-3.5 inline mr-1" /> Szerkesztés
                  </button>
                  <button onClick={() => toggleVisible(s)} className={`p-2 rounded-lg ${s.is_visible ? 'text-green-500 hover:bg-green-50' : 'text-slate-300 hover:bg-slate-50'}`}>
                    {s.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {editingKey === s.section_key && (
                <SectionEditor key={s.id} section={s} onSave={(data) => saveCustom(s, data)} onCancel={() => setEditingKey(null)} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SectionEditor({ section, onSave, onCancel }: { section: HomepageSection; onSave: (data: Partial<HomepageSection>) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(section.custom_title ?? '');
  const [subtitle, setSubtitle] = useState(section.custom_subtitle ?? '');
  const [image, setImage] = useState(section.custom_image ?? '');
  const [video, setVideo] = useState(section.custom_video ?? '');
  const [html, setHtml] = useState(section.custom_html ?? '');

  return (
    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Egyedi cím (felülírja az alapértelmezettet)</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Üres = alapértelmezett" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Egyedi alcím</label>
          <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Üres = alapértelmezett" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Egyedi kép URL</label>
          <input type="url" value={image} onChange={e => setImage(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="https://..." />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1"><Video className="w-3 h-3" /> Videó URL (YouTube/Vimeo)</label>
          <input type="url" value={video} onChange={e => setVideo(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="https://youtube.com/..." />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Egyedi HTML tartalom (a szakasz alá kerül)</label>
        <textarea value={html} onChange={e => setHtml(e.target.value)} rows={4}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono" placeholder="<div>...</div>" />
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => onSave({ custom_title: title || null, custom_subtitle: subtitle || null, custom_image: image || null, custom_video: video || null, custom_html: html || null })}
          className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
          <Save className="w-3.5 h-3.5" /> Mentés
        </button>
        <button onClick={onCancel} className="text-slate-500 hover:text-slate-700 text-sm">Mégse</button>
      </div>
    </div>
  );
}
