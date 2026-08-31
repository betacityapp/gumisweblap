'use client';

import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Search, Zap, RefreshCw, CheckCircle, AlertTriangle, ArrowUp, ArrowDown, Minus, Loader2 } from 'lucide-react';

interface SeoCheck {
  id: string;
  label: string;
  status: 'pass' | 'warn' | 'fail';
  detail: string;
}

interface KeywordRank {
  keyword: string;
  rank: number | null;
  checked: boolean;
}

interface Stats {
  pageCount: number;
  blogCount: number;
  cityCount: number;
}

export default function SeoDashboardPage() {
  const [checks, setChecks] = useState<SeoCheck[]>([]);
  const [keywords, setKeywords] = useState<KeywordRank[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [checking, setChecking] = useState(false);
  const [autoImproving, setAutoImproving] = useState(false);
  const [autoImproveResult, setAutoImproveResult] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({ pageCount: 0, blogCount: 0, cityCount: 0 });

  const runSeoAudit = useCallback(async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/seo-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'audit' }),
      });
      const data = await res.json();
      if (data.checks) setChecks(data.checks);
      if (data.stats) setStats(data.stats);
    } catch {}
    setChecking(false);
  }, []);

  useEffect(() => {
    runSeoAudit();
  }, [runSeoAudit]);

  const handleAddKeyword = () => {
    if (!keywordInput.trim()) return;
    setKeywords(prev => [...prev, { keyword: keywordInput.trim(), rank: null, checked: false }]);
    setKeywordInput('');
  };

  const checkKeyword = (kw: KeywordRank) => {
    setKeywords(prev => prev.map(k => k.keyword === kw.keyword ? { ...k, checked: true, rank: Math.floor(Math.random() * 50) + 1 } : k));
  };

  const checkAllKeywords = () => {
    keywords.forEach(kw => checkKeyword(kw));
  };

  const handleAutoImprove = async () => {
    setAutoImproving(true);
    setAutoImproveResult(null);
    try {
      const res = await fetch('/api/seo-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'auto_improve' }),
      });
      const data = await res.json();
      setAutoImproveResult(data.message || 'Javítás kész.');
    } catch {
      setAutoImproveResult('Hiba történt a javítás során.');
    }
    setAutoImproving(false);
    runSeoAudit();
  };

  const passCount = checks.filter(c => c.status === 'pass').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">SEO Dashboard</h1>
          <p className="text-slate-500 mt-1">Weboldal SEO állapotfelmérés és javítás</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={runSeoAudit}
            disabled={checking}
            className="flex items-center gap-2 border border-slate-200 hover:border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
          >
            {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Audit
          </button>
          <button
            onClick={handleAutoImprove}
            disabled={autoImproving}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-semibold text-sm"
          >
            {autoImproving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {autoImproving ? 'Javítás...' : 'Auto SEO javítás'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="text-3xl font-black text-slate-900">{stats.pageCount}</div>
          <div className="text-sm text-slate-500">Publikált oldalak</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="text-3xl font-black text-slate-900">{stats.blogCount}</div>
          <div className="text-sm text-slate-500">Blog bejegyzések</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="text-3xl font-black text-slate-900">{stats.cityCount}</div>
          <div className="text-sm text-slate-500">Város oldalak</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="text-3xl font-black text-green-600">{passCount}</div>
          <div className="text-sm text-slate-500">SEO ellenőrzés OK</div>
        </div>
      </div>

      {autoImproveResult && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-900 text-sm">Auto SEO javítás kesz</p>
            <p className="text-green-700 text-sm mt-1">{autoImproveResult}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-4">SEO Ellenőrzések</h2>
          <div className="space-y-3">
            {checks.map((check) => (
              <div key={check.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                {check.status === 'pass' && <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />}
                {check.status === 'warn' && <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />}
                {check.status === 'fail' && <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
                <div className="flex-1">
                  <div className="font-semibold text-slate-800 text-sm">{check.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{check.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-4">Kulcsszó Helyezés Ellenőrző</h2>
          <p className="text-xs text-slate-400 mb-4">Adj meg kulcsszavakat és ellenőrizd a Google helyezésedet. (Demo funkció — tényleges API integrációhoz SerpApi vagy hasonló szolgáltatás szükséges.)</p>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={keywordInput}
              onChange={e => setKeywordInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddKeyword()}
              className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
              placeholder="pl. mobil gumiszerviz budapest"
            />
            <button onClick={handleAddKeyword} className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold">
              Hozzáad
            </button>
          </div>
          {keywords.length > 0 && (
            <button onClick={checkAllKeywords} className="text-sm text-red-600 font-medium mb-3 flex items-center gap-1">
              <Search className="w-3.5 h-3.5" />
              Összes ellenőrzése
            </button>
          )}
          <div className="space-y-2">
            {keywords.map((kw, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-sm text-slate-700 font-medium truncate">{kw.keyword}</span>
                {kw.checked ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-sm font-bold ${kw.rank! <= 10 ? 'text-green-600' : kw.rank! <= 30 ? 'text-amber-500' : 'text-red-500'}`}>
                      #{kw.rank}
                    </span>
                    {kw.rank! <= 10 ? <ArrowUp className="w-3.5 h-3.5 text-green-600" /> : kw.rank! <= 30 ? <Minus className="w-3.5 h-3.5 text-amber-500" /> : <ArrowDown className="w-3.5 h-3.5 text-red-500" />}
                  </div>
                ) : (
                  <button onClick={() => checkKeyword(kw)} className="text-xs text-red-600 font-medium shrink-0">
                    Ellenőriz
                  </button>
                )}
              </div>
            ))}
          </div>
          {keywords.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-6">Meg nem adtal hozzá kulcsszót</p>
          )}
        </div>
      </div>

      <div className="mt-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-red-400" />
          SEO Tippek
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            'Generalj minél több város specifikus oldalt az SEO & Városok menüpontban',
            'Irj blog bejegyzéseket a leggyakoribb kérdésekről (gumicsere időpontja, defektjavítás, klímatöltés)',
            'Minden oldalnak legyen egyedi meta leírása (az Auto javítás gomb segít)',
            'Használj belső linkeket a blog bejegyzésekben a szolgáltatás oldalakra',
            'Töltsd fel a logót és favicon-t a Beállításokban a márkaépítéshez',
            'Adj meg partnerek adatait a város oldalakon a helyi SEO erősítéséhez',
            'Rendszeresen ellenőrizd a kulcsszó helyezéseket és javíts a tartalmon',
            'A Google Search Console-ban add meg a sitemap.xml-t',
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-slate-300 text-sm">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0 mt-1.5" />
              {tip}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
