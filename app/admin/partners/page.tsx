'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, X, Save, Award, Eye, EyeOff } from 'lucide-react';
import { getAllPartners, createPartner, updatePartner, deletePartner } from '@/lib/db';
import type { Partner } from '@/lib/types';

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Partner>>({ name: '', logo_url: '', link_url: '', description: '', is_active: true, sort_order: 0 });

  const load = async () => { setPartners(await getAllPartners()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name?.trim()) { alert('A név kötelező!'); return; }
    if (editingId) { await updatePartner(editingId, form); } else { await createPartner(form); }
    setShowForm(false); setEditingId(null); setForm({ name: '', logo_url: '', link_url: '', description: '', is_active: true, sort_order: 0 });
    await load();
  };

  const del = async (id: string, name: string) => { if (confirm(`Törli: "${name}"?`)) { await deletePartner(id); await load(); } };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2"><Award className="w-7 h-7 text-amber-500" /> Partnerek</h1>
          <p className="text-slate-500 mt-1">Partnercégek kezelése – megjelennek az oldalakon és blogokon</p>
        </div>
        <button onClick={() => { setEditingId(null); setForm({ name: '', logo_url: '', link_url: '', description: '', is_active: true, sort_order: 0 }); setShowForm(true); }}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm">
          <Plus className="w-4 h-4" /> Új partner
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">{editingId ? 'Szerkesztés' : 'Új partner'}</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-3">
            <input type="text" value={form.name ?? ''} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" placeholder="Partner neve *" />
            <input type="url" value={form.logo_url ?? ''} onChange={e => setForm({ ...form, logo_url: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" placeholder="Logo URL" />
            <input type="url" value={form.link_url ?? ''} onChange={e => setForm({ ...form, link_url: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" placeholder="Weboldal URL" />
            <textarea value={form.description ?? ''} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" placeholder="Rövid leírás" />
            <button onClick={save} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm"><Save className="w-4 h-4" /> Mentés</button>
          </div>
        </div>
      )}

      {loading ? <div className="text-slate-400">Betöltés...</div> : partners.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center"><p className="text-slate-400">Nincs partner. Adjon hozzá egyet!</p></div>
      ) : (
        <div className="space-y-3">
          {partners.map(p => (
            <div key={p.id} className={`bg-white rounded-2xl border p-5 ${p.is_active ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {p.logo_url && <img src={p.logo_url} alt={p.name} className="w-12 h-12 rounded-lg object-contain border border-slate-100" />}
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                    {p.link_url && <a href={p.link_url} target="_blank" rel="noopener noreferrer" className="text-xs text-red-600 hover:underline">{p.link_url}</a>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={async () => { await updatePartner(p.id, { is_active: !p.is_active }); await load(); }} className="p-2 rounded-lg text-slate-400 hover:text-green-500">{p.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</button>
                  <button onClick={() => { setEditingId(p.id); setForm({ ...p }); setShowForm(true); }} className="p-2 rounded-lg text-slate-400 hover:text-slate-600"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => del(p.id, p.name)} className="p-2 rounded-lg text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
