'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, X, Save, Eye, EyeOff, Image as ImageIcon, Link2, BarChart3, MessageSquare, Bell } from 'lucide-react';
import { getAllPopups, createPopup, updatePopup, deletePopup } from '@/lib/db';
import type { Popup } from '@/lib/types';

const POPUP_TYPES = [
  { value: 'banner', label: 'Reklám / Banner', icon: ImageIcon },
  { value: 'welcome', label: 'Üdvözlő ablak', icon: MessageSquare },
  { value: 'poll', label: 'Szavazás', icon: BarChart3 },
  { value: 'announcement', label: 'Közlemény', icon: Bell },
];

const emptyForm: Partial<Popup> = {
  type: 'banner',
  title: '',
  content_html: '',
  image_url: '',
  link_url: '',
  button_text: '',
  poll_question: '',
  poll_options: [],
  poll_votes: {},
  is_active: true,
  start_date: null,
  end_date: null,
  display_frequency: 'session',
  sort_order: 0,
};

export default function AdminPopupsPage() {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Popup>>(emptyForm);
  const [pollOptionInput, setPollOptionInput] = useState('');

  const load = async () => {
    const data = await getAllPopups();
    setPopups(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditingId(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (p: Popup) => {
    setEditingId(p.id);
    setForm({ ...p, poll_options: p.poll_options ?? [], poll_votes: p.poll_votes ?? {} });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title?.trim()) { alert('A cím kötelező!'); return; }
    if (editingId) { await updatePopup(editingId, form); }
    else { await createPopup(form); }
    setShowForm(false); setEditingId(null); setForm(emptyForm);
    await load();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Biztosan törli: "${title}"?`)) return;
    await deletePopup(id);
    await load();
  };

  const toggleActive = async (p: Popup) => {
    await updatePopup(p.id, { is_active: !p.is_active });
    await load();
  };

  const addPollOption = () => {
    if (!pollOptionInput.trim()) return;
    const opts = [...(form.poll_options ?? []), pollOptionInput.trim()];
    setForm({ ...form, poll_options: opts });
    setPollOptionInput('');
  };

  const removePollOption = (idx: number) => {
    const opts = (form.poll_options ?? []).filter((_, i) => i !== idx);
    setForm({ ...form, poll_options: opts });
  };

  const typeLabels: Record<string, string> = { banner: 'Reklám', welcome: 'Üdvözlés', poll: 'Szavazás', announcement: 'Közlemény' };
  const freqLabels: Record<string, string> = { always: 'Mindig', once: 'Egyszer', session: 'Munkamenetenként' };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Felugró ablakok</h1>
          <p className="text-slate-500 mt-1">Reklámok, üdvözlő ablakok, szavazások és közlemények kezelése</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm">
          <Plus className="w-4 h-4" /> Új felugró ablak
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-900">{editingId ? 'Szerkesztés' : 'Új felugró ablak'}</h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {POPUP_TYPES.map(t => {
                const Icon = t.icon;
                return (
                  <button key={t.value} onClick={() => setForm({ ...form, type: t.value as Popup['type'] })}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-medium transition-all ${form.type === t.value ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                    <Icon className="w-5 h-5" /> {t.label}
                  </button>
                );
              })}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Cím *</label>
              <input type="text" value={form.title ?? ''} onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" placeholder="pl. Téli akció!" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tartalom (HTML)</label>
              <textarea value={form.content_html ?? ''} onChange={e => setForm({ ...form, content_html: e.target.value })}
                rows={4} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono" placeholder="<p>Szöveg...</p>" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Kép URL</label>
                <input type="url" value={form.image_url ?? ''} onChange={e => setForm({ ...form, image_url: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Link URL</label>
                <input type="url" value={form.link_url ?? ''} onChange={e => setForm({ ...form, link_url: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" placeholder="https://..." />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Gomb szövege</label>
              <input type="text" value={form.button_text ?? ''} onChange={e => setForm({ ...form, button_text: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" placeholder="pl. Részletek" />
            </div>

            {form.type === 'poll' && (
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Szavazás kérdése</label>
                <input type="text" value={form.poll_question ?? ''} onChange={e => setForm({ ...form, poll_question: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm mb-3" placeholder="pl. Milyen gumit preferál?" />
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Válaszlehetőségek</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={pollOptionInput} onChange={e => setPollOptionInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addPollOption(); } }}
                    className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-sm" placeholder="Új válasz..." />
                  <button onClick={addPollOption} className="bg-slate-800 text-white px-4 rounded-xl text-sm"><Plus className="w-4 h-4" /></button>
                </div>
                <div className="space-y-1">
                  {(form.poll_options ?? []).map((opt, i) => (
                    <div key={i} className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-1.5">
                      <span className="text-sm text-slate-700">{opt}</span>
                      <button onClick={() => removePollOption(i)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Megjelenítés gyakorisága</label>
                <select value={form.display_frequency ?? 'session'} onChange={e => setForm({ ...form, display_frequency: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm">
                  <option value="always">Mindig</option>
                  <option value="once">Egyszer (soha többszé)</option>
                  <option value="session">Munkamenetenként</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Kezdés (opcionális)</label>
                <input type="datetime-local" value={form.start_date?.slice(0, 16) ?? ''} onChange={e => setForm({ ...form, start_date: e.target.value ? new Date(e.target.value).toISOString() : null })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Befejezés (opcionális)</label>
                <input type="datetime-local" value={form.end_date?.slice(0, 16) ?? ''} onChange={e => setForm({ ...form, end_date: e.target.value ? new Date(e.target.value).toISOString() : null })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button onClick={handleSave} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm">
                <Save className="w-4 h-4" /> Mentés
              </button>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-slate-500 hover:text-slate-700 text-sm">Mégse</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-slate-400">Betöltés...</div>
      ) : popups.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="text-slate-400 mb-2">Nincs felugró ablak</div>
          <p className="text-slate-400 text-sm">Hozzon létre egy reklámot, üdvözlő ablakot vagy szavazást.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {popups.map(p => (
            <div key={p.id} className={`bg-white rounded-2xl border p-5 ${p.is_active ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.type === 'banner' ? 'bg-blue-100 text-blue-700' : p.type === 'poll' ? 'bg-purple-100 text-purple-700' : p.type === 'welcome' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {typeLabels[p.type]}
                  </span>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{p.title}</div>
                    <div className="text-xs text-slate-400">Gyakoriság: {freqLabels[p.display_frequency]} · Sorrend: {p.sort_order}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleActive(p)} className={`p-2 rounded-lg ${p.is_active ? 'text-green-500 hover:bg-green-50' : 'text-slate-300 hover:bg-slate-50'}`} title={p.is_active ? 'Aktiv' : 'Inaktív'}>
                    {p.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => openEdit(p)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(p.id, p.title)} className="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
