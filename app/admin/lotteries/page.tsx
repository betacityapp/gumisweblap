'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, X, Save, Gift, Eye, EyeOff, Users } from 'lucide-react';
import { getAllLotteries, createLottery, updateLottery, deleteLottery, getLotteryEntries } from '@/lib/db';
import type { Lottery, LotteryEntry } from '@/lib/types';

export default function AdminLotteriesPage() {
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Lottery>>({ title: '', description_html: '', prize: '', image_url: '', is_active: true, start_date: null, end_date: null });
  const [entriesMap, setEntriesMap] = useState<Record<string, LotteryEntry[]>>({});

  const load = async () => {
    const data = await getAllLotteries();
    setLotteries(data);
    setLoading(false);
    const entries: Record<string, LotteryEntry[]> = {};
    for (const l of data) { entries[l.id] = await getLotteryEntries(l.id); }
    setEntriesMap(entries);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title?.trim()) { alert('A cím kötelező!'); return; }
    if (editingId) { await updateLottery(editingId, form); } else { await createLottery(form); }
    setShowForm(false); setEditingId(null); setForm({ title: '', description_html: '', prize: '', image_url: '', is_active: true, start_date: null, end_date: null });
    await load();
  };

  const del = async (id: string, title: string) => { if (confirm(`Törli: "${title}"?`)) { await deleteLottery(id); await load(); } };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2"><Gift className="w-7 h-7 text-purple-500" /> Lottók / Sorsolások</h1>
          <p className="text-slate-500 mt-1">Nyereményjátékok és sorsolások kezelése</p>
        </div>
        <button onClick={() => { setEditingId(null); setForm({ title: '', description_html: '', prize: '', image_url: '', is_active: true, start_date: null, end_date: null }); setShowForm(true); }}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm">
          <Plus className="w-4 h-4" /> Új sorsolás
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">{editingId ? 'Szerkesztés' : 'Új sorsolás'}</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-3">
            <input type="text" value={form.title ?? ''} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" placeholder="Sorsolás címe *" />
            <input type="text" value={form.prize ?? ''} onChange={e => setForm({ ...form, prize: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" placeholder="Nyeremény (pl. Ingyenes gumicsere)" />
            <input type="url" value={form.image_url ?? ''} onChange={e => setForm({ ...form, image_url: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" placeholder="Kép URL" />
            <textarea value={form.description_html ?? ''} onChange={e => setForm({ ...form, description_html: e.target.value })} rows={4} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono" placeholder="Leírás (HTML)" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Kezdés</label>
                <input type="datetime-local" value={form.start_date?.slice(0, 16) ?? ''} onChange={e => setForm({ ...form, start_date: e.target.value ? new Date(e.target.value).toISOString() : null })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Befejezés</label>
                <input type="datetime-local" value={form.end_date?.slice(0, 16) ?? ''} onChange={e => setForm({ ...form, end_date: e.target.value ? new Date(e.target.value).toISOString() : null })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
              </div>
            </div>
            <button onClick={save} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm"><Save className="w-4 h-4" /> Mentés</button>
          </div>
        </div>
      )}

      {loading ? <div className="text-slate-400">Betöltés...</div> : lotteries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center"><p className="text-slate-400">Nincs sorsolás. Hozzon létre egyet!</p></div>
      ) : (
        <div className="space-y-3">
          {lotteries.map(l => {
            const entries = entriesMap[l.id] ?? [];
            return (
              <div key={l.id} className={`bg-white rounded-2xl border p-5 ${l.is_active ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><Gift className="w-5 h-5 text-purple-600" /></div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{l.title}</div>
                      {l.prize && <div className="text-xs text-slate-400">Nyeremény: {l.prize}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg"><Users className="w-3 h-3" /> {entries.length}</span>
                    <button onClick={async () => { await updateLottery(l.id, { is_active: !l.is_active }); await load(); }} className="p-2 rounded-lg text-slate-400 hover:text-green-500">{l.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</button>
                    <button onClick={() => { setEditingId(l.id); setForm({ ...l }); setShowForm(true); }} className="p-2 rounded-lg text-slate-400 hover:text-slate-600"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => del(l.id, l.title)} className="p-2 rounded-lg text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                {entries.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="text-xs font-semibold text-slate-500 mb-2">Résztvevők ({entries.length}):</div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {entries.map(e => (
                        <div key={e.id} className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-1.5">
                          <span className="font-medium">{e.name}</span>
                          <span className="text-slate-400">{e.phone ?? e.email}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
