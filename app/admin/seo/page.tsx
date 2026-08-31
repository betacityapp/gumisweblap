'use client';

import { useEffect, useState } from 'react';
import { MapPin, Cpu, Plus, Wand2, Save, Eye, Loader2, Check, Snowflake, Link2 } from 'lucide-react';
import Link from 'next/link';

const ADMIN_KEY = 'toldi-admin-2024';

const HUNGARIAN_CITIES = [
  'Budaörs', 'Érd', 'Törökbálint', 'Biatorbágy', 'Telki', 'Páty',
  'Halásztelek', 'Szigetszentmiklós', 'Dunaharaszti', 'Gyál', 'Vecsés',
  'Üllő', 'Monor', 'Dunakeszi', 'Göd', 'Fót', 'Csömör',
  'Pécel', 'Gödöllő', 'Isaszeg', 'Kerepes', 'Vác', 'Szentendre',
  'Solymár', 'Pilisvörösvár', 'Zsámbék', 'Budakeszi',
];

type GenerateType = 'city_page' | 'blog_post' | 'page_content';

export default function AdminSeoPage() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [generateType, setGenerateType] = useState<GenerateType>('city_page');
  const [configUsed, setConfigUsed] = useState('');

  const [cityName, setCityName] = useState('');
  const [cityLayout, setCityLayout] = useState('default');
  const [cityEmail, setCityEmail] = useState('');
  const [cityAvailability, setCityAvailability] = useState('');
  const [cityArrivalTime, setCityArrivalTime] = useState('');
  const [cityMinPrice, setCityMinPrice] = useState('');
  const [cityKmPrice, setCityKmPrice] = useState('');
  const [cityCustomPrices, setCityCustomPrices] = useState('');
  const [cityDistricts, setCityDistricts] = useState('');
  const [cityNearby, setCityNearby] = useState('');
  const [cityMainRoads, setCityMainRoads] = useState('');
  const [cityMotorways, setCityMotorways] = useState('');
  const [cityIndustrial, setCityIndustrial] = useState('');
  const [cityLocalPlaces, setCityLocalPlaces] = useState('');
  const [cityServiceArea, setCityServiceArea] = useState('');
  const [showAdvancedCity, setShowAdvancedCity] = useState(false);
  const [blogTopic, setBlogTopic] = useState('');
  const [blogTitle, setBlogTitle] = useState('');
  const [blogSlug, setBlogSlug] = useState('');
  const [blogCity, setBlogCity] = useState('');
  const [blogImages, setBlogImages] = useState('');
  const [pageTitle, setPageTitle] = useState('');
  const [pageType, setPageType] = useState('service');
  const [partnerName, setPartnerName] = useState('');
  const [partnerPhone, setPartnerPhone] = useState('');
  const [partnerUrl, setPartnerUrl] = useState('');
  const [partnerDesc, setPartnerDesc] = useState('');
  const [internalLinks, setInternalLinks] = useState('');
  const [cityImages, setCityImages] = useState('');

  const [saving, setSaving] = useState(false);
  const [savedSlug, setSavedSlug] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/cars?q=ai-configs').then(r => r.json()).then(d => {
      if (Array.isArray(d) && d.length > 0) {
        setConfigs(d);
        const def = d.find((c: any) => c.is_default) ?? d[0];
        if (def) setSelectedConfigId(def.id);
      }
    }).catch(() => {});
    fetch('/api/cars?q=pages-list').then(r => r.json()).then(d => {
      if (Array.isArray(d)) setPages(d);
    }).catch(() => {});
  }, []);

  const handleGenerate = async () => {
    setError('');
    setGenerating(true);
    setGeneratedContent('');
    setConfigUsed('');

    try {
      const res = await fetch('/api/ai/seo-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY },
        body: JSON.stringify({
          type: generateType,
          cityName,
          cityLayout,
          blogTopic,
          blogTitle,
          pageTitle,
          pageType,
          config_id: selectedConfigId,
          email: cityEmail || undefined,
          businessAvailability: cityAvailability || undefined,
          averageArrivalTime: cityArrivalTime || undefined,
          minimumPrice: cityMinPrice || undefined,
          kmPrice: cityKmPrice || undefined,
          customPrices: cityCustomPrices || undefined,
          districts: cityDistricts || undefined,
          nearbyCities: cityNearby || undefined,
          mainRoads: cityMainRoads || undefined,
          motorways: cityMotorways || undefined,
          industrialAreas: cityIndustrial || undefined,
          localPlaces: cityLocalPlaces || undefined,
          serviceArea: cityServiceArea || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Hiba');
      setGeneratedContent(data.content);
      setConfigUsed(data.configUsed || '');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'AI generálási hiba.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveCityPage = async () => {
    if (!generatedContent || !cityName) return;
    setSaving(true);

    const slug = `mobil-gumiszerviz-${cityName.toLowerCase()
      .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ö/g, 'o').replace(/ő/g, 'o').replace(/ú/g, 'u').replace(/ü/g, 'u').replace(/ű/g, 'u')
      .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;

    try {
      const res = await fetch('/api/ai/seo-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY },
        body: JSON.stringify({ type: 'save_page', slug, cityName, content: generatedContent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Hiba a mentés során');
      setSavedSlug(slug);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Hiba a mentés során');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBlogPost = async () => {
    if (!generatedContent || !blogTitle || !blogSlug) return;
    setSaving(true);

    try {
      const res = await fetch('/api/ai/seo-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY },
        body: JSON.stringify({ type: 'save_blog', slug: blogSlug, title: blogTitle, topic: blogTopic, content: generatedContent, cityName: blogCity || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Hiba a mentés során');
      setSavedSlug(`blog/${blogSlug}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Hiba a mentés során');
    } finally {
      setSaving(false);
    }
  };

  const cityPages = pages.filter((p: any) => p.is_city_page);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">SEO & Városok</h1>
        <p className="text-slate-500 mt-1">AI-alapú oldal és tartalom generálás SEO optimalizálással</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generator form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Type selector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-4">Generálás típusa</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: 'city_page', label: 'Városspecifikus oldal', icon: MapPin, desc: 'SEO oldal egy adott városra' },
                { value: 'blog_post', label: 'Blog bejegyzés', icon: Cpu, desc: 'AI-generált blog cikk' },
                { value: 'page_content', label: 'Oldal tartalom', icon: Wand2, desc: 'Klímatöltés, gumicsere, stb.' },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => setGenerateType(t.value as GenerateType)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    generateType === t.value ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <t.icon className={`w-5 h-5 mb-2 ${generateType === t.value ? 'text-red-600' : 'text-slate-400'}`} />
                  <div className={`font-semibold text-sm ${generateType === t.value ? 'text-red-700' : 'text-slate-700'}`}>{t.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* AI Config */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-4">AI konfiguráció</h2>
            <select
              value={selectedConfigId}
              onChange={(e) => setSelectedConfigId(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
            >
              <option value="">Automatikus (ingyenes fallback)</option>
              {configs.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name} ({c.provider} – {c.model})</option>
              ))}
            </select>
            {configs.length === 0 && (
              <p className="text-xs text-slate-400 mt-2">
                Nincs saját AI konfiguráció megadva. Az automatikus ingyenes szolgáltató lesz használva. Saját API kulcs hozzáadásához látogasson el az <Link href="/admin/ai" className="font-semibold underline">AI Konfig</Link> oldalra.
              </p>
            )}
          </div>

          {/* Form fields */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-4">
              {generateType === 'city_page' ? 'Város adatok' : generateType === 'blog_post' ? 'Blog bejegyzés adatok' : 'Oldal adatok'}
            </h2>

            {generateType === 'city_page' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Város neve *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={cityName}
                      onChange={(e) => setCityName(e.target.value)}
                      className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
                      placeholder="pl. Budaörs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Elrendezés / Layout variáns</label>
                  <select
                    value={cityLayout}
                    onChange={(e) => setCityLayout(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
                  >
                    <option value="default">Alap (általános)</option>
                    <option value="city-focus">Városfókuszos</option>
                    <option value="service-focus">Szolgáltatásfókuszos</option>
                    <option value="comparison-focus">Összehasonlítás-fókuszos</option>
                    <option value="minimal">Minimál (szöveges)</option>
                  </select>
                </div>

                {/* City-specific pricing */}
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-sm font-semibold text-slate-700 mb-3">Város-specifikus árazás (opcionális)</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Minimum szolgáltatási díj</label>
                      <input type="text" value={cityMinPrice} onChange={e => setCityMinPrice(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
                        placeholder="pl. 20.000 Ft + ÁFA" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Kilométerdíj</label>
                      <input type="text" value={cityKmPrice} onChange={e => setCityKmPrice(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
                        placeholder="pl. 0-20 km ingyenes, utána 150 Ft/km" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Egyedi árak (szabad szöveg)</label>
                    <textarea value={cityCustomPrices} onChange={e => setCityCustomPrices(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" rows={3}
                      placeholder="pl. Gumicsere: 5.000 Ft/adat, Klímatöltés: 8.000 Ft-tól, Defektjavítás: 6.000 Ft" />
                  </div>
                </div>

                {/* Advanced city data toggle */}
                <div className="border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedCity(!showAdvancedCity)}
                    className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    {showAdvancedCity ? '−' : '+'} Helyi adatok, képek, partner (opcionális)
                  </button>
                  {showAdvancedCity && (
                    <div className="mt-4 space-y-4">
                      {/* Images */}
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Képek (soronként egy URL)</label>
                        <textarea value={cityImages} onChange={e => setCityImages(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" rows={3}
                          placeholder="https://images.pexels.com/...&#10;https://images.pexels.com/..." />
                        <p className="text-xs text-slate-400 mt-1">A képek bekerülnek az AI által generált tartalomba</p>
                      </div>

                      {/* Partner data */}
                      <div className="border-t border-slate-100 pt-4">
                        <p className="text-sm font-semibold text-slate-700 mb-3">Vontató partner adatai (opcionális)</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Partner neve</label>
                            <input type="text" value={partnerName} onChange={e => setPartnerName(e.target.value)}
                              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
                              placeholder="pl. Budaörs Vontatás Kft." />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Partner telefonszáma</label>
                            <input type="text" value={partnerPhone} onChange={e => setPartnerPhone(e.target.value)}
                              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
                              placeholder="+36 30 123 4567" />
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Partner weboldala</label>
                            <input type="text" value={partnerUrl} onChange={e => setPartnerUrl(e.target.value)}
                              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
                              placeholder="https://partner-weboldal.hu" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Partner leírása</label>
                            <input type="text" value={partnerDesc} onChange={e => setPartnerDesc(e.target.value)}
                              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
                              placeholder="pl. Gyors vontatás Budaörs és környékén" />
                          </div>
                        </div>
                      </div>

                      {/* Internal links */}
                      <div className="border-t border-slate-100 pt-4">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Belső linkek (soronként: URL|szöveg)</label>
                        <textarea value={internalLinks} onChange={e => setInternalLinks(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" rows={3}
                          placeholder="/hu/szezonalis-gumicsere|Szezonális gumicsere&#10;/hu/defektjavitas|Defektjavítás" />
                        <p className="text-xs text-slate-400 mt-1">Ezeket a linkeket az AI beépíti a tartalomba</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                          <input type="text" value={cityEmail} onChange={e => setCityEmail(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
                            placeholder="info@toldigumi.hu" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">Elérhetőség</label>
                          <input type="text" value={cityAvailability} onChange={e => setCityAvailability(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
                            placeholder="0-24 óra, minden nap" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Átlagos kiérkezési idő</label>
                        <input type="text" value={cityArrivalTime} onChange={e => setCityArrivalTime(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
                          placeholder="pl. 30-45 perc" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Városrészek</label>
                        <textarea value={cityDistricts} onChange={e => setCityDistricts(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" rows={2}
                          placeholder="pl. Kertváros, Ófalu, Ipari zóna" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Közeli települések</label>
                        <input type="text" value={cityNearby} onChange={e => setCityNearby(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
                          placeholder="pl. Budaörs, Törökbálint, Biatorbágy" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Főbb utak</label>
                        <input type="text" value={cityMainRoads} onChange={e => setCityMainRoads(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
                          placeholder="pl. M1, M7, 1-es főút" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Autópályák / lehajtók</label>
                        <input type="text" value={cityMotorways} onChange={e => setCityMotorways(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
                          placeholder="pl. M0 csomópont, M1-es" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Ipari területek</label>
                        <input type="text" value={cityIndustrial} onChange={e => setCityIndustrial(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
                          placeholder="pl. Ipari park, Logisztikai központ" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Jellemző helyszínek</label>
                        <input type="text" value={cityLocalPlaces} onChange={e => setCityLocalPlaces(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
                          placeholder="pl. ABC parkoló, benzinkút, bevásárlóközpont" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Szolgáltatási terület</label>
                        <textarea value={cityServiceArea} onChange={e => setCityServiceArea(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" rows={2}
                          placeholder="pl. Whole city + 20km radius" />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Gyors kiválasztás:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {HUNGARIAN_CITIES.map((city) => {
                      const exists = pages.some((p) => p.city === city);
                      return (
                        <button
                          key={city}
                          onClick={() => !exists && setCityName(city)}
                          disabled={exists}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                            exists ? 'bg-green-50 text-green-600 border-green-200 cursor-default' :
                            cityName === city ? 'bg-red-600 text-white border-red-600' :
                            'bg-slate-50 text-slate-600 border-slate-200 hover:border-red-300 hover:text-red-600 cursor-pointer'
                          }`}
                        >
                          {exists && <Check className="w-3 h-3 inline mr-1" />}
                          {city}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {generateType === 'blog_post' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Blog cím *</label>
                  <input
                    type="text"
                    value={blogTitle}
                    onChange={(e) => {
                      setBlogTitle(e.target.value);
                      setBlogSlug(e.target.value.toLowerCase()
                        .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ö/g, 'o').replace(/ő/g, 'o').replace(/ú/g, 'u').replace(/ü/g, 'u').replace(/ű/g, 'u')
                        .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                    }}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
                    placeholder="pl. Mikor kell nyári gumira váltani?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">URL slug</label>
                  <input
                    type="text"
                    value={blogSlug}
                    onChange={(e) => setBlogSlug(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-red-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Téma / prompt *</label>
                  <textarea
                    value={blogTopic}
                    onChange={(e) => setBlogTopic(e.target.value)}
                    rows={3}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400 resize-none"
                    placeholder="pl. Milyen jelei vannak annak, hogy gumit kell cserélni? Mikor érdemes az abroncsot lecserélni?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Város (opcionális – a blog ehhez a városhoz kötődik)</label>
                  <input
                    type="text"
                    value={blogCity}
                    onChange={(e) => setBlogCity(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
                    placeholder="pl. Budaörs"
                  />
                  <p className="text-xs text-slate-400 mt-1">Ha megadod, a blog megjelenik a városoldalon is</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Képek (soronként egy URL, opcionális)</label>
                  <textarea
                    value={blogImages}
                    onChange={(e) => setBlogImages(e.target.value)}
                    rows={2}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400 resize-none"
                    placeholder="https://images.pexels.com/..."
                  />
                </div>
              </div>
            )}

            {generateType === 'page_content' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Oldal cím *</label>
                  <input
                    type="text"
                    value={pageTitle}
                    onChange={(e) => setPageTitle(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
                    placeholder="pl. Szezonális Gumicsere"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Oldal típusa</label>
                  <select
                    value={pageType}
                    onChange={(e) => setPageType(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
                  >
                    <option value="service">Szolgáltatás oldal</option>
                    <option value="about">Bemutatkozó oldal</option>
                    <option value="contact">Kapcsolat oldal</option>
                    <option value="faq">GYIK oldal</option>
                  </select>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="mt-5 w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              {generating ? 'Generálás folyamatban...' : 'Tartalom generálása AI-val'}
            </button>
          </div>

          {configUsed && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
              Használt AI: <strong>{configUsed}</strong>
            </div>
          )}

          {/* Generated content */}
          {generatedContent && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-900">Generált tartalom</h2>
                <button
                  onClick={() => setGeneratedContent('')}
                  className="text-slate-400 hover:text-slate-600 text-sm"
                >
                  Törlés
                </button>
              </div>
              <textarea
                value={generatedContent}
                onChange={(e) => setGeneratedContent(e.target.value)}
                rows={14}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-red-400 resize-y mb-4"
              />

              {savedSlug ? (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-medium text-sm">Sikeresen mentve!</span>
                  <a href={`/${savedSlug}`} target="_blank" className="ml-auto flex items-center gap-1 text-green-700 text-sm font-semibold underline">
                    <Eye className="w-4 h-4" />
                    Megtekintés
                  </a>
                </div>
              ) : (
                <button
                  onClick={generateType === 'city_page' ? handleSaveCityPage : handleSaveBlogPost}
                  disabled={saving}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-semibold text-sm"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Mentés...' : generateType === 'city_page' ? `Mentés városoldalként (/${cityName.toLowerCase()})` : 'Mentés blog bejegyzésként'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Existing city pages sidebar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-red-600" />
            <h2 className="font-bold text-slate-900 text-sm">Meglévő városoldalak</h2>
            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full ml-auto">{cityPages.length}</span>
          </div>
          {cityPages.length === 0 ? (
            <p className="text-slate-400 text-sm">Még nincsenek városoldalak.</p>
          ) : (
            <div className="space-y-1">
              {cityPages.map((p) => (
                <div key={p.id} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50">
                  <div className={`w-2 h-2 rounded-full ${p.is_published ? 'bg-green-500' : 'bg-slate-300'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{p.city}</div>
                    <div className="text-xs text-slate-400 truncate">/{p.slug}</div>
                  </div>
                  <Link href={`/admin/pages/${p.id}`} className="text-slate-400 hover:text-blue-600 p-1 shrink-0">
                    <Plus className="w-3.5 h-3.5 rotate-45" />
                  </Link>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 leading-relaxed">
              A városoldalak automatikusan megjelennek a <strong>sitemap.xml</strong>-ben és keresőoptimalizálva vannak a helyi SEO-ra.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
