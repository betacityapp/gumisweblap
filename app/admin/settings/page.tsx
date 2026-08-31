'use client';

import { useEffect, useState } from 'react';
import { Save, CheckCircle } from 'lucide-react';
import { getSettings, upsertSettings } from '@/lib/db';
import type { SiteSettings } from '@/lib/types';
import { FALLBACK_SETTINGS } from '@/lib/fallback-data';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(FALLBACK_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then((s) => { setSettings(s); setLoading(false); });
  }, []);

  const update = (key: keyof SiteSettings, value: string) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    await upsertSettings(settings as unknown as Record<string, string>);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return <div className="text-slate-400">Betöltés...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Beállítások</h1>
          <p className="text-slate-500 mt-1">Weboldal általános beállításai</p>
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
        {/* Site info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-5">Weboldal adatok</h2>
          <div className="space-y-4">
            {([
              ['site_name', 'Weboldal neve', 'text', 'Toldi Mobil Gumi és Klíma'],
              ['site_description', 'Weboldal leírás (meta)', 'textarea', ''],
              ['hero_title', 'Főoldal hero cím', 'text', ''],
              ['hero_subtitle', 'Főoldal hero alcím', 'text', ''],
              ['hero_image', 'Hero háttérkép URL', 'url', ''],
              ['footer_copyright', 'Footer copyright szöveg', 'text', ''],
              ['google_analytics', 'Google Analytics ID (G-XXXXXXXX)', 'text', ''],
            ] as [keyof SiteSettings, string, string, string][]).map(([key, label, type, ph]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
                {type === 'textarea' ? (
                  <textarea
                    value={settings[key] || ''}
                    onChange={(e) => update(key, e.target.value)}
                    rows={3}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400 resize-none"
                    placeholder={ph}
                  />
                ) : (
                  <input
                    type={type}
                    value={settings[key] || ''}
                    onChange={(e) => update(key, e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
                    placeholder={ph}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Logo & Favicon */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-5">Logo és Favicon</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Logo URL (weboldal fejléc)</label>
              <input type="url" value={settings.logo_url || ''} onChange={e => update('logo_url', e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400" placeholder="https://...logo.png" />
              {settings.logo_url && <img src={settings.logo_url} alt="Logo előnézet" className="mt-2 h-16 rounded-lg border border-slate-100 p-1" />}
              <p className="text-xs text-slate-400 mt-1">Töltsd fel a logót egy képmegosztó szolgáltatásba (pl. imgur), majd másd be az URL-t. Ajánlott: 200x60px, átlátszó háttér.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Favicon URL</label>
              <input type="url" value={settings.favicon_url || ''} onChange={e => update('favicon_url', e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400" placeholder="https://...favicon.ico" />
              {settings.favicon_url && <img src={settings.favicon_url} alt="Favicon előnézet" className="mt-2 w-8 h-8 rounded border border-slate-100" />}
              <p className="text-xs text-slate-400 mt-1">A böngésző fülén megjelenő kis ikon. Ajánlott: 32x32px ICO vagy PNG.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Android alkalmazás URL</label>
              <input type="url" value={settings.android_app_url || ''} onChange={e => update('android_app_url', e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400" placeholder="https://play.google.com/store/apps/details?id=..." />
              <p className="text-xs text-slate-400 mt-1">A Toldi Mobile Android alkalmazás Google Play linkje.</p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-5">Elérhetőségi adatok</h2>
            <div className="space-y-4">
              {([
                ['phone', 'Telefon (fő)', 'tel', '+36 30 582 0870'],
                ['phone_2', 'Telefon 2 (opcionális)', 'tel', ''],
                ['email', 'Email cím', 'email', ''],
                ['address', 'Cím / terület', 'text', ''],
                ['working_hours', 'Nyitvatartás', 'text', '0-24, az év minden napján'],
              ] as [keyof SiteSettings, string, string, string][]).map(([key, label, type, ph]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={settings[key] || ''}
                    onChange={(e) => update(key, e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
                    placeholder={ph}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Admin password */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-2">Admin jelszó</h2>
            <p className="text-xs text-slate-400 mb-4">A jelszó az admin belépéshez szükséges. Változtatás után az új jelszóval kell bejelentkezni.</p>
            <input
              type="text"
              value={settings.admin_password || ''}
              onChange={(e) => update('admin_password', e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
              placeholder="Admin jelszó"
            />
            <p className="text-xs text-amber-600 mt-2">Figyelem: a jelszó adatbázisban tárolódik – ne használjon érzékeny jelszót!</p>
          </div>

          {/* Visual & interactive settings */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-5">Vizuális és interaktív beállítások</h2>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={settings.custom_cursor_enabled === 'true'} onChange={e => update('custom_cursor_enabled', e.target.checked ? 'true' : 'false')} className="w-5 h-5 rounded text-red-600" />
                  <span className="text-sm font-medium text-slate-700">Egyedi kurzor (kerék / autó forma)</span>
                </label>
              </div>
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={settings.animations_enabled !== 'false'} onChange={e => update('animations_enabled', e.target.checked ? 'true' : 'false')} className="w-5 h-5 rounded text-red-600" />
                  <span className="text-sm font-medium text-slate-700">Animációk engedélyezése</span>
                </label>
              </div>
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={settings.lottery_enabled === 'true'} onChange={e => update('lottery_enabled', e.target.checked ? 'true' : 'false')} className="w-5 h-5 rounded text-red-600" />
                  <span className="text-sm font-medium text-slate-700">Sorsolások engedélyezése a weblapon</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Alapértelmezett OG kép URL</label>
                <input type="url" value={settings.og_default_image || ''} onChange={e => update('og_default_image', e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400" placeholder="https://..." />
              </div>
            </div>
          </div>

          {/* Towing partner */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-5">Autómentés partner</h2>
            <div className="space-y-4">
              {([
                ['towing_partner_name', 'Partner neve', 'text', 'Bakos Autómentés'],
                ['towing_partner_url', 'Partner weboldala', 'url', 'https://bakosautomentes.hu/'],
                ['towing_partner_logo', 'Partner logo URL', 'url', ''],
              ] as [keyof SiteSettings, string, string, string][]).map(([key, label, type, ph]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
                  <input type={type} value={settings[key] || ''} onChange={e => update(key, e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400" placeholder={ph} />
                </div>
              ))}
            </div>
          </div>

          {/* Price calculator settings */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-5">Árkalkulátor beállítások</h2>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={settings.calc_discount_enabled === 'true'} onChange={e => update('calc_discount_enabled', e.target.checked ? 'true' : 'false')} className="w-5 h-5 rounded text-red-600" />
                  <span className="text-sm font-medium text-slate-700">Kedvezmény engedélyezése (X autó után)</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Kedvezmény küszöb (autó száma)</label>
                  <input type="number" value={settings.calc_discount_threshold || '3'} onChange={e => update('calc_discount_threshold', e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Kedvezmény mértéke (%)</label>
                  <input type="number" value={settings.calc_discount_percent || '10'} onChange={e => update('calc_discount_percent', e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(['13','14','15','16','17','18','19','20_plus'] as const).map(s => {
                  const key = `calc_base_price_${s}` as keyof SiteSettings;
                  return (
                    <div key={s}>
                      <label className="block text-xs font-medium text-slate-600 mb-1">{s === '20_plus' ? '20"+' : s+'"'} felni (Ft/kerék)</label>
                      <input type="number" value={settings[key] || ''} onChange={e => update(key, e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="pl. 9000" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
