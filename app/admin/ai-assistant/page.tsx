'use client';

import { useState, useEffect } from 'react';
import { Brain, TrendingUp, Eye, Loader2, Sparkles, ArrowUp, AlertTriangle, Lightbulb, FileText, BarChart3, RefreshCw, Settings, BookOpen } from 'lucide-react';

const ADMIN_KEY = 'toldi-admin-2024';

export default function AdminAiAssistantPage() {
  const [overview, setOverview] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [error, setError] = useState('');

  const loadOverview = async () => {
    setLoadingOverview(true);
    try {
      const res = await fetch('/api/ai/assistant?action=overview', { headers: { 'x-admin-key': ADMIN_KEY } });
      const data = await res.json();
      if (res.ok) setOverview(data);
      else setError(data.error || 'Nem sikerült betölteni az adatokat.');
    } catch (err: any) {
      setError(err.message || 'Nem sikerült betölteni az adatokat.');
    }
    setLoadingOverview(false);
  };

  const loadRecommendations = async () => {
    setLoadingRecs(true);
    setError('');
    try {
      const res = await fetch('/api/ai/assistant?action=recommendations', { headers: { 'x-admin-key': ADMIN_KEY } });
      const data = await res.json();
      if (res.ok) setRecommendations(data);
      else setError(data.error || 'Hiba');
    } catch (err: any) {
      setError(err.message);
    }
    setLoadingRecs(false);
  };

  useEffect(() => { loadOverview(); }, []);

  const priorityColors: Record<string, string> = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    low: 'bg-blue-100 text-blue-700 border-blue-200',
  };
  const categoryIcons: Record<string, any> = {
    tartalom: FileText,
    seo: TrendingUp,
    technikai: Settings,
    konverzió: BarChart3,
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Brain className="w-7 h-7 text-purple-600" /> AI Asszisztens
          </h1>
          <p className="text-slate-500 mt-1">Weboldal analitika, javaslatok és tartalom ötletek AI segítségével</p>
        </div>
        <button onClick={loadOverview}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-xl transition-colors">
          <RefreshCw className="w-4 h-4" /> Frissítés
        </button>
      </div>

      {/* Error banner */}
      {error && !loadingRecs && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-2 mb-6">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700">{error}</p>
        </div>
      )}

      {/* Stats overview */}
      {loadingOverview ? (
        <div className="flex items-center justify-center py-16 bg-white rounded-2xl border border-slate-100">
          <Loader2 className="w-7 h-7 animate-spin text-purple-500 mr-3" />
          <span className="text-slate-500">Adatok betöltése...</span>
        </div>
      ) : overview ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-slate-500 font-medium">Látogatás 24ó</span>
              </div>
              <p className="text-2xl font-black text-slate-800">{overview.views24h ?? 0}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs text-slate-500 font-medium">Látogatás 7nap</span>
              </div>
              <p className="text-2xl font-black text-slate-800">{overview.views7d ?? 0}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-slate-500 font-medium">Blog cikkek</span>
              </div>
              <p className="text-2xl font-black text-slate-800">{overview.blogCount ?? 0}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-slate-500 font-medium">Aloldalak</span>
              </div>
              <p className="text-2xl font-black text-slate-800">{overview.pageCount ?? 0}</p>
            </div>
          </div>

          {/* Top pages */}
          {overview.topPages?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
              <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-slate-400" /> Legnépszerűbb oldalak (7 nap)
              </h2>
              <div className="space-y-2">
                {overview.topPages.map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 w-6">#{i + 1}</span>
                      <span className="text-sm font-medium text-slate-700 font-mono">{p.path}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">{p.count}</span>
                      <Eye className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}

      {/* AI recommendations */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" /> AI javaslatok
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">Az AI áttekinti a weblap statisztikákat és javaslatokat tesz</p>
          </div>
          {!recommendations && !loadingRecs && (
            <button onClick={loadRecommendations}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm">
              <Brain className="w-4 h-4" /> Javaslatok kérése
            </button>
          )}
        </div>

        {loadingRecs && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-7 h-7 animate-spin text-purple-500 mr-3" />
            <span className="text-slate-500">AI elemzés folyamatban...</span>
          </div>
        )}

        {error && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-sm text-amber-700">{error}</p>
          </div>
        )}

        {recommendations && (
          <>
            {recommendations.recommendations?.length > 0 && (
              <div className="space-y-3 mb-6">
                <h3 className="text-sm font-semibold text-slate-700">Javaslatok</h3>
                {recommendations.recommendations.map((r: any, i: number) => {
                  const Icon = categoryIcons[r.category] || Lightbulb;
                  return (
                    <div key={i} className="border border-slate-100 rounded-xl p-4 hover:bg-slate-50">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-800 text-sm">{r.title}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColors[r.priority] || priorityColors.low}`}>
                              {r.priority === 'high' ? 'Magas' : r.priority === 'medium' ? 'Közepes' : 'Alacsony'}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-1">{r.description}</p>
                          <p className="text-xs text-slate-400"><strong>Lépés:</strong> {r.action}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {recommendations.content_ideas?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Tartalom ötletek</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recommendations.content_ideas.map((idea: any, i: number) => (
                    <div key={i} className="border border-slate-100 rounded-xl p-4 bg-purple-50/30">
                      <div className="flex items-center gap-2 mb-1">
                        {idea.type === 'blog' ? <BookOpen className="w-4 h-4 text-purple-500" /> : <FileText className="w-4 h-4 text-orange-500" />}
                        <span className="font-semibold text-slate-800 text-sm">{idea.title}</span>
                      </div>
                      <p className="text-xs text-slate-500">{idea.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={loadRecommendations}
              className="mt-5 flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700">
              <RefreshCw className="w-4 h-4" /> Javaslatok újragenerálása
            </button>
          </>
        )}
      </div>
    </div>
  );
}
