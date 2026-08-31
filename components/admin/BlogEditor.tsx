'use client';

import { useState } from 'react';
import type { BlogPost } from '@/lib/types';
import { Loader2, Sparkles, Image as ImageIcon, MapPin, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface BlogEditorProps {
  post: Partial<BlogPost>;
  onChange: (post: Partial<BlogPost>) => void;
}

function Toggle({ value, onToggle, label }: { value: boolean; onToggle: () => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-green-500' : 'bg-slate-200'}`}
      >
        <div className={`absolute bg-white rounded-full top-0.5 shadow transition-all ${value ? 'left-5' : 'left-0.5'}`} style={{ width: '18px', height: '18px' }} />
      </div>
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </label>
  );
}

export default function BlogEditor({ post, onChange }: BlogEditorProps) {
  const update = (key: keyof BlogPost, value: unknown) => onChange({ ...post, [key]: value });

  const tagsString = Array.isArray(post.tags) ? post.tags.join(', ') : '';
  const setTags = (val: string) => update('tags', val.split(',').map((t) => t.trim()).filter(Boolean));

  const [storyMode, setStoryMode] = useState(false);
  const [storyText, setStoryText] = useState(post.story_prompt || '');
  const [storyCity, setStoryCity] = useState(post.city || '');
  const [storyImageUrl, setStoryImageUrl] = useState(post.story_image_url || '');
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  const [copied, setCopied] = useState(false);

  const shareUrl = post.slug ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${post.lang || 'hu'}/blog/${post.slug}` : '';

  async function generateFromStory() {
    if (!storyText.trim()) { setGenError('Írd le, mi történt!'); return; }
    setGenerating(true);
    setGenError('');
    try {
      const res = await fetch('/api/ai/blog-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': 'toldi-admin-2024' },
        body: JSON.stringify({ story: storyText, city: storyCity, imageUrl: storyImageUrl }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Ismeretlen hiba' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const newSlug = (data.title || 'blog-post')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 60);
      onChange({
        ...post,
        title: data.title || post.title,
        excerpt: data.excerpt || post.excerpt,
        content_html: data.content_html,
        meta_title: data.meta_title || post.meta_title,
        meta_description: data.meta_description || post.meta_description,
        tags: data.tags || post.tags,
        city: storyCity || post.city,
        story_prompt: storyText,
        story_image_url: storyImageUrl || post.story_image_url,
        featured_image: storyImageUrl || post.featured_image,
        slug: post.slug || newSlug,
      });
    } catch (e: unknown) {
      setGenError(e instanceof Error ? e.message : 'Hiba történt');
    } finally {
      setGenerating(false);
    }
  }

  function copyShareLink() {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main content */}
      <div className="lg:col-span-2 space-y-6">

        {/* AI Story mode toggle */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-5">
          <button
            type="button"
            onClick={() => setStoryMode(!storyMode)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="font-semibold text-amber-900">AI: Élményből blog bejegyzés</span>
              <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">Új!</span>
            </div>
            {storyMode ? <ChevronUp className="w-4 h-4 text-amber-500" /> : <ChevronDown className="w-4 h-4 text-amber-500" />}
          </button>

          {storyMode && (
            <div className="mt-5 space-y-4">
              <p className="text-sm text-amber-700">Töltsd fel a képet és írd le mi történt – az AI automatikusan elkészíti az SEO-optimalizált blog bejegyzést!</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-1.5 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4" /> Kép URL (opcionális)
                  </label>
                  <input
                    type="url"
                    value={storyImageUrl}
                    onChange={(e) => setStoryImageUrl(e.target.value)}
                    className="w-full border border-amber-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-white"
                    placeholder="https://... (pexels, imgbb, stb.)"
                  />
                  {storyImageUrl && (
                    <img src={`${storyImageUrl}?auto=compress&cs=tinysrgb&w=300`} alt="" className="mt-2 rounded-lg h-24 w-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> Város (SEO kulcsszó)
                  </label>
                  <input
                    type="text"
                    value={storyCity}
                    onChange={(e) => setStoryCity(e.target.value)}
                    className="w-full border border-amber-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-white"
                    placeholder="Budapest, Budaörs, Érd..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-1.5">Mi történt? *</label>
                <textarea
                  value={storyText}
                  onChange={(e) => setStoryText(e.target.value)}
                  rows={4}
                  className="w-full border border-amber-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-white resize-none"
                  placeholder="Pl: Ügyfél az M0-son kapott defektet hajnali 3-kor. Kiértünk 35 perc alatt, megcsináltuk a hátsó kereket. Nagyon hálás volt..."
                />
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-amber-600">{storyText.length} karakter</span>
                </div>
              </div>

              {genError && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{genError}</p>
              )}

              <button
                type="button"
                onClick={generateFromStory}
                disabled={generating || !storyText.trim()}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {generating ? 'Generálás...' : 'Blog generálása AI-val'}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-5">Bejegyzés adatai</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Cím *</label>
                <input
                  type="text"
                  value={post.title || ''}
                  onChange={(e) => update('title', e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
                  placeholder="Blog bejegyzés cím"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nyelv</label>
                <select
                  value={post.lang || 'hu'}
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
                <label className="block text-sm font-medium text-slate-700 mb-1.5">URL slug *</label>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden focus-within:border-red-400">
                  <span className="px-3 py-2.5 bg-slate-50 text-slate-400 text-xs border-r border-slate-200">/blog/</span>
                  <input
                    type="text"
                    value={post.slug || ''}
                    onChange={(e) => update('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
                    placeholder="cikk-cime"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Város (SEO)
                </label>
                <input
                  type="text"
                  value={post.city || ''}
                  onChange={(e) => update('city', e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
                  placeholder="Budapest, Budaörs..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Kivonat (excerpt)</label>
              <textarea
                value={post.excerpt || ''}
                onChange={(e) => update('excerpt', e.target.value)}
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400 resize-none"
                placeholder="Rövid összefoglaló a bejegyzésről..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Kiemelt kép URL</label>
              <input
                type="url"
                value={post.featured_image || ''}
                onChange={(e) => update('featured_image', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
                placeholder="https://images.pexels.com/..."
              />
              {post.featured_image && (
                <img src={`${post.featured_image}?auto=compress&cs=tinysrgb&w=400`} alt="" className="mt-2 rounded-lg h-32 object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
              )}
            </div>

            {/* Share link */}
            {post.slug && post.is_published && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Megosztható link</label>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                  <span className="flex-1 px-3 py-2.5 text-xs text-slate-500 bg-slate-50 truncate">{shareUrl}</span>
                  <button
                    type="button"
                    onClick={copyShareLink}
                    className="px-3 py-2.5 border-l border-slate-200 hover:bg-slate-100 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-2">Tartalom (HTML)</h2>
          <p className="text-xs text-slate-400 mb-4">HTML formázott szöveg – h2, h3, p, ul, li, strong tag-eket használhat.</p>
          <textarea
            value={post.content_html || ''}
            onChange={(e) => update('content_html', e.target.value)}
            rows={18}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-red-400 resize-y"
            placeholder="<h2>Cím</h2><p>Tartalom...</p>"
          />
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-5">Közzététel</h2>
          <div className="space-y-4">
            <Toggle value={!!post.is_published} onToggle={() => update('is_published', !post.is_published)} label={post.is_published ? 'Publikált' : 'Piszkozat'} />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Megjelenés dátuma</label>
              <input
                type="date"
                value={post.published_at ? post.published_at.split('T')[0] : ''}
                onChange={(e) => update('published_at', e.target.value + 'T00:00:00Z')}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Szerző</label>
              <input
                type="text"
                value={post.author || 'Toldi Mobil Gumi'}
                onChange={(e) => update('author', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Cimkék (vesszővel elválasztva)</label>
              <input
                type="text"
                value={tagsString}
                onChange={(e) => setTags(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
                placeholder="gumicsere, tippek, tél"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-5">SEO beállítások</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Meta cím</label>
              <input
                type="text"
                value={post.meta_title || ''}
                onChange={(e) => update('meta_title', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
                maxLength={70}
              />
              <div className="text-xs text-slate-400 text-right mt-1">{(post.meta_title || '').length}/70</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Meta leírás</label>
              <textarea
                value={post.meta_description || ''}
                onChange={(e) => update('meta_description', e.target.value)}
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400 resize-none"
                maxLength={200}
              />
              <div className="text-xs text-slate-400 text-right mt-1">{(post.meta_description || '').length}/200</div>
            </div>
          </div>
        </div>

        {post.story_prompt && (
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
            <h3 className="font-semibold text-amber-900 mb-2 text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Eredeti élmény
            </h3>
            <p className="text-xs text-amber-700 line-clamp-4">{post.story_prompt}</p>
          </div>
        )}
      </div>
    </div>
  );
}
