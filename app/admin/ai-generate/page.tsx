'use client';

import { useState, useEffect } from 'react';
import { Sparkles, FileText, BookOpen, Loader2, CheckCircle2, AlertTriangle, Settings, Wand2 } from 'lucide-react';

const ADMIN_KEY = 'toldi-admin-2024';

export default function AdminAiGeneratePage() {
  const [type, setType] = useState<'blog' | 'page'>('blog');
  const [topic, setTopic] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('+36 30 582 0870');
  const [email, setEmail] = useState('info@toldigumi.hu');
  const [prices, setPrices] = useState('');
  const [configId, setConfigId] = useState('');
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/cars?q=ai-configs').then(r => r.json()).then(d => {
      if (Array.isArray(d)) setConfigs(d);
    }).catch(() => {});
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY },
        body: JSON.stringify({ type, topic, city, phone, email, prices, config_id: configId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Hiba');
      setResult(data.result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Wand2 className="w-7 h-7 text-purple-600" /> AI tartalom generátor
        </h1>
        <p className="text-slate-500 mt-1">Blog cikkek és aloldalak automatikus létrehozása AI segítségével</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="flex gap-2 mb-6">
          <button onClick={() => setType('blog')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${type === 'blog' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            <BookOpen className="w-4 h-4" /> Blog cikk
          </button>
          <button onClick={() => setType('page')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${type === 'page' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            <FileText className="w-4 h-4" /> Aloldal
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Téma / Cím *</label>
            <input type="text" value={topic} onChange={e => setTopic(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
              placeholder={type === 'blog' ? 'pl. Téli gumik felszerelése – mikor érdemes?' : 'pl. Mobil gumiszerviz Dunakeszi'} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Város (opcionális)</label>
              <input type="text" value={city} onChange={e => setCity(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
                placeholder="pl. Vác" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">AI konfiguráció</label>
              <select value={configId} onChange={e => setConfigId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm">
                <option value="">Automatikus (első aktív)</option>
                {configs.map(c => <option key={c.id} value={c.id}>{c.name} ({c.provider})</option>)}
              </select>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-400" /> Vállalkozás adatok (a tartalomba kerül)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Telefonszám</label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input type="text" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Árak (opcionális – a tartalomba kerül)</label>
              <textarea value={prices} onChange={e => setPrices(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" rows={3}
                placeholder="pl. Klímatöltés: 8.000 Ft-tól, Gumi csere: 5.000 Ft/adat" />
            </div>
          </div>

          <button onClick={handleGenerate} disabled={loading || !topic.trim()}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generálás folyamatban...</> : <><Sparkles className="w-4 h-4" /> {type === 'blog' ? 'Blog cikk generálása' : 'Aloldal generálása'}</>}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-7 h-7 text-green-500" />
            <div>
              <p className="font-bold text-lg text-green-800">Sikeres generálás!</p>
              <p className="text-sm text-green-600">{type === 'blog' ? 'Blog cikk' : 'Aloldal'} létrehozva és mentve.</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-green-100">
            <p className="font-bold text-slate-800">{result.title}</p>
            {result.excerpt && <p className="text-sm text-slate-500 mt-1">{result.excerpt}</p>}
            {result.slug && <p className="text-xs text-slate-400 mt-2">Slug: {result.slug}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
