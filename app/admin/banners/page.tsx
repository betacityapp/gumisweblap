'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, X, Save, Megaphone, Eye, EyeOff } from 'lucide-react';
import { getAllBanners, createBanner, updateBanner, deleteBanner } from '@/lib/db';
import type { AnnouncementBanner } from '@/lib/types';

const ANIMATIONS = [
  { value: 'none', label: 'Nincs' },
  { value: 'scroll', label: 'Futó (scroll)' },
  { value: 'bounce', label: 'Ugráló (bounce)' },
  { value: 'pulse', label: 'Pulzáló (pulse)' },
];

const emptyForm: Partial<AnnouncementBanner> = {
  text: '', link_url: '', bg_color: '#dc2626', text_color: '#ffffff',
  animation: 'none', is_active: true, start_date: null, end_date: null, sort_order: 0,
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<AnnouncementBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<AnnouncementBanner>>(emptyForm);

  const load = async () => { setBanners(await getAllBanners()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.text?.trim()) { alert('A szöveg kötelező!'); return; }
    if (editingId) { await updateBanner(editingId, form); } else { await createBanner(form); }
    setShowForm(false); setEditingId(null); setForm(emptyForm);
    await load();
  };

  const del = async (id: string) => { if (confirm('Biztosan törli?')) { await deleteBanner(id); await load(); } };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2"><Megaphone className="w-7 h-7 text-red-600" /> Szalag / Közlemény</h1>
          <p className="text-slate-500 mt-1">Felső szalag üzenetek – dátumhoz kötött, animált, linkelhető</p>
        </div>
        <button onClick={() => { setEditingId(null); setForm(emptyForm); setShowForm(true); }}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm">
          <Plus className="w-4 h-4" /> Új szalag
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">{editingId ? 'Szerkesztés' : 'Új szalag'}</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Szöveg *</label>
              <input type="text" value={form.text ?? ''} onChange={e => setForm({ ...form, text: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" placeholder="pl. 2026.06.06-tól nem dolgozunk" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Link URL (opcionális)</label>
                <input type="url" value={form.link_url ?? ''} onChange={e => setForm({ ...form, link_url: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Animáció</label>
                <select value={form.animation ?? 'none'} onChange={e => setForm({ ...form, animation: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm">
                  {ANIMATIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Háttérszín</label>
                <input type="color" value={form.bg_color ?? '#dc2626'} onChange={e => setForm({ ...form, bg_color: e.target.value })}
                  className="w-full h-10 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Szövegszín</label>
                <input type="color" value={form.text_color ?? '#ffffff'} onChange={e => setForm({ ...form, text_color: e.target.value })}
                  className="w-full h-10 border border-slate-200 rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Kezdés (opcionális)</label>
                <input type="datetime-local" value={form.start_date?.slice(0, 16) ?? ''} onChange={e => setForm({ ...form, start_date: e.target.value ? new Date(e.target.value).toISOString() : null })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Befejezés (opcionális – utána eltűnik)</label>
                <input type="datetime-local" value={form.end_date?.slice(0, 16) ?? ''} onChange={e => setForm({ ...form, end_date: e.target.value ? new Date(e.target.value).toISOString() : null })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
              </div>
            </div>
            <button onClick={save} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm"><Save className="w-4 h-4" /> Mentés</button>
          </div>
        </div>
      )}

      {loading ? <div className="text-slate-400">Betöltés...</div> : banners.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center"><p className="text-slate-400">Nincs szalag. Hozzon létre egyet!</p></div>
      ) : (
        <div className="space-y-3">
          {banners.map(b => (
            <div key={b.id} className={`bg-white rounded-2xl border p-5 ${b.is_active ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: b.bg_color }}>
                    <Megaphone className="w-5 h-5" style={{ color: b.text_color }} />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-900 text-sm">{b.text}</div>
                    <div className="text-xs text-slate-400">
                      Animáció: {ANIMATIONS.find(a => a.value === b.animation)?.label ?? b.animation}
                      {b.start_date && ` · Kezdés: ${new Date(b.start_date).toLocaleDateString('hu-HU')}`}
                      {b.end_date && ` · Vége: ${new Date(b.end_date).toLocaleDateString('hu-HU')}`}
                      {b.link_url && ` · Link: ${b.link_url}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={async () => { await updateBanner(b.id, { is_active: !b.is_active }); await load(); }} className="p-2 rounded-lg text-slate-400 hover:text-green-500">{b.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</button>
                  <button onClick={() => { setEditingId(b.id); setForm({ ...b }); setShowForm(true); }} className="p-2 rounded-lg text-slate-400 hover:text-slate-600"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => del(b.id)} className="p-2 rounded-lg text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
