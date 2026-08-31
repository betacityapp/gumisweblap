'use client';

import { useState } from 'react';
import type { Page, PageCustomPrice, PriceItem } from '@/lib/types';
import { Plus, Trash2 } from 'lucide-react';

const ALL_SECTIONS = [
  { id: 'hero', label: 'Hero banner' },
  { id: 'comparison', label: 'Összehasonlítás táblázat' },
  { id: 'services', label: 'Szolgáltatások rács' },
  { id: 'prices', label: 'Árlista' },
  { id: 'how_it_works', label: 'Hogyan működik (4 lépés)' },
  { id: 'coverage', label: 'Lefedettség térkép' },
  { id: 'testimonials', label: 'Vélemények' },
  { id: 'faq', label: 'Gyakori kérdések' },
  { id: 'blog_preview', label: 'Blog előnézet' },
  { id: 'contact', label: 'Kapcsolat' },
  { id: 'benefits', label: 'Előnyök / USP lista' },
  { id: 'stats', label: 'Számok / statisztikák' },
  { id: 'gallery', label: 'Képgaléria' },
  { id: 'cta_banner', label: 'CTA sáv (kiemelés)' },
];

const LAYOUT_VARIANTS = [
  { value: 'default', label: 'Alap (általános)' },
  { value: 'city-focus', label: 'Városfókuszos' },
  { value: 'service-focus', label: 'Szolgáltatásfókuszos' },
  { value: 'comparison-focus', label: 'Összehasonlítás-fókuszos' },
  { value: 'minimal', label: 'Minimál (szöveges)' },
];

interface PageEditorProps {
  page: Partial<Page>;
  onChange: (page: Partial<Page>) => void;
  customPrices?: PageCustomPrice[];
  onCustomPricesChange?: (prices: PageCustomPrice[]) => void;
}

function Toggle({ value, onToggle, label, color = 'green' }: { value: boolean; onToggle: () => void; label: string; color?: string }) {
  const colorClass = color === 'blue' ? 'bg-blue-500' : color === 'amber' ? 'bg-amber-500' : 'bg-green-500';
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-colors ${value ? colorClass : 'bg-slate-200'}`}
      >
        <div className={`absolute bg-white rounded-full top-0.5 shadow transition-all ${value ? 'left-5' : 'left-0.5'}`} style={{ width: '18px', height: '18px' }} />
      </div>
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </label>
  );
}

export default function PageEditor({ page, onChange, customPrices = [], onCustomPricesChange }: PageEditorProps) {
  const update = (key: keyof Page, value: unknown) => onChange({ ...page, [key]: value });

  const toggleSection = (sectionId: string) => {
    const current = Array.isArray(page.page_sections) ? page.page_sections : [];
    const updated = current.includes(sectionId)
      ? current.filter((s) => s !== sectionId)
      : [...current, sectionId];
    update('page_sections', updated);
  };

  const currentSections = Array.isArray(page.page_sections) ? page.page_sections : [];
  const [priceTab, setPriceTab] = useState<'global' | 'custom'>('global');

  function addCustomPrice() {
    if (!onCustomPricesChange) return;
    const newPrice: PageCustomPrice = {
      id: `new-${Date.now()}`,
      page_id: page.id || '',
      category: '',
      label: '',
      price_from: null,
      price_to: null,
      unit: 'Ft/kerék',
      note: null,
      sort_order: customPrices.length,
      is_active: true,
      created_at: '',
    };
    onCustomPricesChange([...customPrices, newPrice]);
  }

  function updateCustomPrice(idx: number, field: keyof PageCustomPrice, value: unknown) {
    if (!onCustomPricesChange) return;
    const updated = customPrices.map((p, i) => i === idx ? { ...p, [field]: value } : p);
    onCustomPricesChange(updated);
  }

  function removeCustomPrice(idx: number) {
    if (!onCustomPricesChange) return;
    onCustomPricesChange(customPrices.filter((_, i) => i !== idx));
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Basic info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-5">Alap adatok</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Oldal cím *</label>
                <input
                  type="text"
                  value={page.title || ''}
                  onChange={(e) => update('title', e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
                  placeholder="pl. Szezonális Gumicsere"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">URL slug *</label>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden focus-within:border-red-400">
                  <span className="px-3 py-2.5 bg-slate-50 text-slate-400 text-sm border-r border-slate-200">/</span>
                  <input
                    type="text"
                    value={page.slug || ''}
                    onChange={(e) => update('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
                    placeholder="gumicsere"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nyelv</label>
                <select
                  value={page.lang || 'hu'}
                  onChange={(e) => update('lang', e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
                >
                  <option value="hu">Magyar (HU)</option>
                  <option value="en">English (EN)</option>
                  <option value="de">Deutsch (DE)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Hero cím</label>
                <input
                  type="text"
                  value={page.hero_title || ''}
                  onChange={(e) => update('hero_title', e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
                  placeholder="Nagy betűkkel megjelenő cím"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Város (városoldalnál)</label>
                <input
                  type="text"
                  value={page.city || ''}
                  onChange={(e) => update('city', e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
                  placeholder="pl. Budaörs"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Hero alcím</label>
              <input
                type="text"
                value={page.hero_subtitle || ''}
                onChange={(e) => update('hero_subtitle', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
                placeholder="Rövid leíró szöveg a hero alatt"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Hero háttérkép URL</label>
              <input
                type="url"
                value={page.hero_image || ''}
                onChange={(e) => update('hero_image', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-2">Oldal tartalom (HTML)</h2>
          <p className="text-xs text-slate-400 mb-4">HTML formázott szöveg – h2, p, ul, li, strong tag-eket használhat.</p>
          <textarea
            value={page.content_html || ''}
            onChange={(e) => update('content_html', e.target.value)}
            rows={14}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-red-400 resize-y"
            placeholder="<h2>Cím</h2><p>Szöveg...</p>"
          />
        </div>

        {/* Per-page custom prices */}
        {onCustomPricesChange && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-slate-900">Árlista beállítás</h2>
                <p className="text-xs text-slate-400 mt-0.5">Globális vagy egyedi árak ezen az oldalon</p>
              </div>
              <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm">
                <button
                  type="button"
                  onClick={() => setPriceTab('global')}
                  className={`px-4 py-2 transition-colors ${priceTab === 'global' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >Globális</button>
                <button
                  type="button"
                  onClick={() => setPriceTab('custom')}
                  className={`px-4 py-2 transition-colors ${priceTab === 'custom' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Egyedi {customPrices.length > 0 && <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5">{customPrices.length}</span>}
                </button>
              </div>
            </div>

            {priceTab === 'global' && (
              <p className="text-sm text-slate-500 bg-slate-50 rounded-xl px-4 py-3">
                Ez az oldal a globális árlistát mutatja (Admin &gt; Árlista). Egyedi árakhoz válassza az "Egyedi" fület.
              </p>
            )}

            {priceTab === 'custom' && (
              <div className="space-y-3">
                {customPrices.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">Nincs egyedi ár. Adjon hozzá sorokat!</p>
                )}
                {customPrices.map((price, idx) => (
                  <div key={price.id} className="grid grid-cols-12 gap-2 items-start bg-slate-50 rounded-xl p-3">
                    <div className="col-span-3">
                      <label className="block text-xs text-slate-500 mb-1">Kategória</label>
                      <input
                        type="text"
                        value={price.category}
                        onChange={(e) => updateCustomPrice(idx, 'category', e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-red-400"
                        placeholder="Személyautó"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-slate-500 mb-1">Megnevezés</label>
                      <input
                        type="text"
                        value={price.label}
                        onChange={(e) => updateCustomPrice(idx, 'label', e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-red-400"
                        placeholder='15"-ig'
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-slate-500 mb-1">Ártól (Ft)</label>
                      <input
                        type="number"
                        value={price.price_from ?? ''}
                        onChange={(e) => updateCustomPrice(idx, 'price_from', e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-red-400"
                        placeholder="5500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-slate-500 mb-1">Egység</label>
                      <input
                        type="text"
                        value={price.unit}
                        onChange={(e) => updateCustomPrice(idx, 'unit', e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-red-400"
                        placeholder="Ft/kerék"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-slate-500 mb-1">Megjegyzés</label>
                      <input
                        type="text"
                        value={price.note || ''}
                        onChange={(e) => updateCustomPrice(idx, 'note', e.target.value || null)}
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-red-400"
                        placeholder="..."
                      />
                    </div>
                    <div className="col-span-1 flex items-end justify-center pb-1">
                      <button
                        type="button"
                        onClick={() => removeCustomPrice(idx)}
                        className="text-red-400 hover:text-red-600 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCustomPrice}
                  className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium mt-1"
                >
                  <Plus className="w-4 h-4" /> Sor hozzáadása
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Publish settings */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-5">Közzététel</h2>
          <div className="space-y-3">
            <Toggle value={!!page.is_published} onToggle={() => update('is_published', !page.is_published)} label={page.is_published ? 'Publikált (aktív)' : 'Piszkozat (rejtett)'} />
            <Toggle value={!!page.is_city_page} onToggle={() => update('is_city_page', !page.is_city_page)} label="Városspecifikus oldal" color="blue" />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Sorrend</label>
              <input
                type="number"
                value={page.sort_order || 0}
                onChange={(e) => update('sort_order', parseInt(e.target.value) || 0)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
              />
            </div>
          </div>
        </div>

        {/* Content toggles */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-4">Tartalom beállítások</h2>
          <div className="space-y-3">
            <Toggle
              value={!!page.show_reviews}
              onToggle={() => update('show_reviews', !page.show_reviews)}
              label="Google értékelések megjelenítése"
              color="amber"
            />
            <Toggle
              value={!!page.show_comments}
              onToggle={() => update('show_comments', !page.show_comments)}
              label="Kommentek megjelenítése"
              color="amber"
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Elrendezés / Layout</label>
              <select
                value={page.layout_variant || 'default'}
                onChange={(e) => update('layout_variant', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
              >
                {LAYOUT_VARIANTS.map((v) => (
                  <option key={v.value} value={v.value}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-5">SEO beállítások</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Meta cím</label>
              <input
                type="text"
                value={page.meta_title || ''}
                onChange={(e) => update('meta_title', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
                placeholder="SEO oldal cím (max 60 karakter)"
                maxLength={70}
              />
              <div className="text-xs text-slate-400 mt-1">{(page.meta_title || '').length}/60</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Meta leírás</label>
              <textarea
                value={page.meta_description || ''}
                onChange={(e) => update('meta_description', e.target.value)}
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400 resize-none"
                placeholder="SEO meta description (max 160 karakter)"
                maxLength={200}
              />
              <div className="text-xs text-slate-400 mt-1">{(page.meta_description || '').length}/160</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Meta kulcsszavak</label>
              <input
                type="text"
                value={page.meta_keywords || ''}
                onChange={(e) => update('meta_keywords', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
                placeholder="kulcsszó1, kulcsszó2, kulcsszó3"
              />
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-2">Megjelenő szekciók</h2>
          <p className="text-xs text-slate-400 mb-4">Válassza ki, melyik szekciók jelenjenek meg az oldalon</p>
          <div className="space-y-1">
            {ALL_SECTIONS.map((section) => {
              const active = currentSections.includes(section.id);
              return (
                <label key={section.id} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleSection(section.id)}
                    className="w-4 h-4 accent-red-600"
                  />
                  <span className="text-sm text-slate-700">{section.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
