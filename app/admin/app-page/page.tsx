'use client';

import { useEffect, useState } from 'react';
import { Save, CheckCircle, Smartphone } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const ADMIN_KEY = 'toldi-admin-2024';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface AppPageData {
  title: string;
  subtitle: string;
  description: string;
  features: string;
  play_store_url: string;
  app_icon_url: string;
  screenshot_urls: string;
  is_published: boolean;
}

export default function AdminAppPage() {
  const [data, setData] = useState<AppPageData>({
    title: 'Toldi Mobile',
    subtitle: 'Mobil Gumiszerviz App',
    description: '',
    features: '',
    play_store_url: '',
    app_icon_url: '',
    screenshot_urls: '',
    is_published: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const admin = adminClient();
        const { data: row } = await admin
          .from('site_settings')
          .select('key, value')
          .in('key', ['app_page_title', 'app_page_subtitle', 'app_page_description', 'app_page_features', 'app_page_play_url', 'app_page_icon', 'app_page_screenshots', 'app_page_published']);
        const map: Record<string, string> = {};
        (row || []).forEach((r: any) => { map[r.key] = r.value; });
        setData({
          title: map.app_page_title || 'Toldi Mobile',
          subtitle: map.app_page_subtitle || 'Mobil Gumiszerviz App',
          description: map.app_page_description || '',
          features: map.app_page_features || '',
          play_store_url: map.app_page_play_url || '',
          app_icon_url: map.app_page_icon || '',
          screenshot_urls: map.app_page_screenshots || '',
          is_published: map.app_page_published === 'true',
        });
      } catch {}
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const admin = adminClient();
    const entries = [
      { key: 'app_page_title', value: data.title },
      { key: 'app_page_subtitle', value: data.subtitle },
      { key: 'app_page_description', value: data.description },
      { key: 'app_page_features', value: data.features },
      { key: 'app_page_play_url', value: data.play_store_url },
      { key: 'app_page_icon', value: data.app_icon_url },
      { key: 'app_page_screenshots', value: data.screenshot_urls },
      { key: 'app_page_published', value: data.is_published ? 'true' : 'false' },
    ];
    for (const entry of entries) {
      const { data: existing } = await admin.from('site_settings').select('key').eq('key', entry.key).maybeSingle();
      if (existing) {
        await admin.from('site_settings').update({ value: entry.value }).eq('key', entry.key);
      } else {
        await admin.from('site_settings').insert({ key: entry.key, value: entry.value });
      }
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return <div className="text-slate-400">Betöltés...</div>;

  const screenshots = data.screenshot_urls.split('\n').filter(s => s.trim());

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Toldi Mobile App</h1>
          <p className="text-slate-500 mt-1">Android alkalmazás oldal szerkesztése</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-semibold text-sm"
        >
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'Mentés...' : saved ? 'Mentve!' : 'Mentés'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-bold text-slate-900 mb-2">Alapadatok</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">App neve</label>
            <input type="text" value={data.title} onChange={e => setData({...data, title: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" placeholder="Toldi Mobile" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Alcím</label>
            <input type="text" value={data.subtitle} onChange={e => setData({...data, subtitle: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" placeholder="Mobil Gumiszerviz App" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Google Play URL</label>
            <input type="url" value={data.play_store_url} onChange={e => setData({...data, play_store_url: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" placeholder="https://play.google.com/store/apps/details?id=..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">App ikon URL</label>
            <input type="url" value={data.app_icon_url} onChange={e => setData({...data, app_icon_url: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" placeholder="https://...icon.png" />
            {data.app_icon_url && <img src={data.app_icon_url} alt="App icon" className="mt-2 w-20 h-20 rounded-2xl border border-slate-100" />}
          </div>
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={data.is_published} onChange={e => setData({...data, is_published: e.target.checked})} className="w-5 h-5 rounded text-red-600" />
              <span className="text-sm font-medium text-slate-700">Oldal publikálva (látható a weboldalon)</span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-bold text-slate-900 mb-2">Tartalom</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Leírás (HTML engedélyezett)</label>
            <textarea value={data.description} onChange={e => setData({...data, description: e.target.value})} rows={6} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono resize-none" placeholder="<p>A Toldi Mobile alkalmazás...</p>" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Funkciók (soronként egy)</label>
            <textarea value={data.features} onChange={e => setData({...data, features: e.target.value})} rows={6} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm resize-none" placeholder="Gumicsere foglalás&#10;Klímatöltés időpont&#10;Árkalkulátor" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Képernyőképek (soronként egy URL)</label>
            <textarea value={data.screenshot_urls} onChange={e => setData({...data, screenshot_urls: e.target.value})} rows={4} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm resize-none" placeholder="https://...screenshot1.png&#10;https://...screenshot2.png" />
          </div>
        </div>
      </div>

      {/* Előnézet */}
      <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-900 mb-4">Előnézet</h2>
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              {data.app_icon_url ? (
                <img src={data.app_icon_url} alt="App icon" className="w-32 h-32 rounded-3xl shadow-lg" />
              ) : (
                <div className="w-32 h-32 bg-red-600 rounded-3xl flex items-center justify-center shadow-lg">
                  <Smartphone className="w-16 h-16 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-3xl font-black mb-1">{data.title}</h3>
              <p className="text-slate-400 mb-4">{data.subtitle}</p>
              {data.description && <div className="prose-content text-slate-300" dangerouslySetInnerHTML={{ __html: data.description }} />}
              {data.features && (
                <ul className="mt-4 space-y-2">
                  {data.features.split('\n').filter(f => f.trim()).map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-300">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      {f.trim()}
                    </li>
                  ))}
                </ul>
              )}
              {data.play_store_url && (
                <a href={data.play_store_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold text-sm mt-6 transition-colors">
                  <Smartphone className="w-4 h-4" />
                  Letöltés a Google Play-ből
                </a>
              )}
            </div>
          </div>
          {screenshots.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
              {screenshots.map((url, i) => (
                <img key={i} src={url.trim()} alt={`Screenshot ${i+1}`} className="rounded-xl shadow-lg w-full" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
