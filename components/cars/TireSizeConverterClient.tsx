'use client';

import { useState, useMemo } from 'react';
import { ArrowLeftRight, AlertTriangle, CheckCircle2, Info, Gauge, Phone, RotateCcw, TrendingUp, Ruler } from 'lucide-react';
import Link from 'next/link';
import type { Dictionary } from '@/lib/i18n';

interface Props {
  dict: Dictionary;
  lang: string;
  phone: string;
}

interface TireSize {
  width: number;
  aspectRatio: number;
  rimDiameter: number;
}

interface ComparisonResult {
  original: TireSize;
  new: TireSize;
  originalDiameter: number;
  newDiameter: number;
  diameterDiff: number;
  diameterDiffPct: number;
  circumference: number;
  newCircumference: number;
  circumferenceDiff: number;
  sidewallHeight: number;
  newSidewallHeight: number;
  widthDiff: number;
  speedoDiff: number;
  clearanceDiff: number;
  status: 'ok' | 'warning' | 'danger';
  recommendations: TireSize[];
}

function parseTireSize(input: string): TireSize | null {
  const cleaned = input.trim().replace(/[Rr]/, ' ').replace(/\//g, ' ').replace(/\s+/g, ' ');
  const parts = cleaned.split(' ').filter(Boolean);
  if (parts.length < 3) return null;
  const width = parseInt(parts[0]);
  const aspectRatio = parseInt(parts[1]);
  const rimDiameter = parseInt(parts[2]);
  if (isNaN(width) || isNaN(aspectRatio) || isNaN(rimDiameter)) return null;
  if (width < 100 || width > 400) return null;
  if (aspectRatio < 20 || aspectRatio > 90) return null;
  if (rimDiameter < 10 || rimDiameter > 30) return null;
  return { width, aspectRatio, rimDiameter };
}

function formatSize(s: TireSize): string {
  return `${s.width}/${s.aspectRatio} R${s.rimDiameter}`;
}

function calcDiameter(s: TireSize): number {
  const sidewall = (s.width * s.aspectRatio) / 100;
  return s.rimDiameter * 25.4 + sidewall * 2;
}

function calcCircumference(s: TireSize): number {
  return Math.PI * calcDiameter(s);
}

function calcSidewall(s: TireSize): number {
  return (s.width * s.aspectRatio) / 100;
}

// Real-world tire sizes that actually exist
const REAL_TIRE_SIZES: TireSize[] = [
  // 13"
  { width: 145, aspectRatio: 70, rimDiameter: 13 }, { width: 155, aspectRatio: 70, rimDiameter: 13 }, { width: 165, aspectRatio: 70, rimDiameter: 13 }, { width: 175, aspectRatio: 70, rimDiameter: 13 }, { width: 185, aspectRatio: 70, rimDiameter: 13 },
  // 14"
  { width: 165, aspectRatio: 65, rimDiameter: 14 }, { width: 175, aspectRatio: 65, rimDiameter: 14 }, { width: 185, aspectRatio: 65, rimDiameter: 14 }, { width: 185, aspectRatio: 60, rimDiameter: 14 }, { width: 195, aspectRatio: 65, rimDiameter: 14 }, { width: 205, aspectRatio: 60, rimDiameter: 14 },
  // 15"
  { width: 185, aspectRatio: 55, rimDiameter: 15 }, { width: 185, aspectRatio: 60, rimDiameter: 15 }, { width: 195, aspectRatio: 50, rimDiameter: 15 }, { width: 195, aspectRatio: 55, rimDiameter: 15 }, { width: 195, aspectRatio: 60, rimDiameter: 15 }, { width: 195, aspectRatio: 65, rimDiameter: 15 }, { width: 205, aspectRatio: 50, rimDiameter: 15 }, { width: 205, aspectRatio: 55, rimDiameter: 15 }, { width: 205, aspectRatio: 60, rimDiameter: 15 }, { width: 205, aspectRatio: 65, rimDiameter: 15 }, { width: 215, aspectRatio: 60, rimDiameter: 15 }, { width: 225, aspectRatio: 45, rimDiameter: 15 }, { width: 225, aspectRatio: 50, rimDiameter: 15 },
  // 16"
  { width: 195, aspectRatio: 50, rimDiameter: 16 }, { width: 195, aspectRatio: 55, rimDiameter: 16 }, { width: 205, aspectRatio: 45, rimDiameter: 16 }, { width: 205, aspectRatio: 50, rimDiameter: 16 }, { width: 205, aspectRatio: 55, rimDiameter: 16 }, { width: 215, aspectRatio: 45, rimDiameter: 16 }, { width: 215, aspectRatio: 55, rimDiameter: 16 }, { width: 215, aspectRatio: 60, rimDiameter: 16 }, { width: 215, aspectRatio: 65, rimDiameter: 16 }, { width: 225, aspectRatio: 45, rimDiameter: 16 }, { width: 225, aspectRatio: 50, rimDiameter: 16 }, { width: 225, aspectRatio: 55, rimDiameter: 16 }, { width: 235, aspectRatio: 50, rimDiameter: 16 }, { width: 245, aspectRatio: 45, rimDiameter: 16 },
  // 17"
  { width: 205, aspectRatio: 40, rimDiameter: 17 }, { width: 205, aspectRatio: 45, rimDiameter: 17 }, { width: 205, aspectRatio: 50, rimDiameter: 17 }, { width: 215, aspectRatio: 40, rimDiameter: 17 }, { width: 215, aspectRatio: 45, rimDiameter: 17 }, { width: 215, aspectRatio: 50, rimDiameter: 17 }, { width: 215, aspectRatio: 55, rimDiameter: 17 }, { width: 225, aspectRatio: 35, rimDiameter: 17 }, { width: 225, aspectRatio: 40, rimDiameter: 17 }, { width: 225, aspectRatio: 45, rimDiameter: 17 }, { width: 225, aspectRatio: 50, rimDiameter: 17 }, { width: 225, aspectRatio: 55, rimDiameter: 17 }, { width: 235, aspectRatio: 40, rimDiameter: 17 }, { width: 235, aspectRatio: 45, rimDiameter: 17 }, { width: 235, aspectRatio: 50, rimDiameter: 17 }, { width: 245, aspectRatio: 40, rimDiameter: 17 }, { width: 245, aspectRatio: 45, rimDiameter: 17 }, { width: 255, aspectRatio: 40, rimDiameter: 17 },
  // 18"
  { width: 215, aspectRatio: 35, rimDiameter: 18 }, { width: 225, aspectRatio: 40, rimDiameter: 18 }, { width: 225, aspectRatio: 45, rimDiameter: 18 }, { width: 235, aspectRatio: 40, rimDiameter: 18 }, { width: 235, aspectRatio: 45, rimDiameter: 18 }, { width: 235, aspectRatio: 50, rimDiameter: 18 }, { width: 245, aspectRatio: 35, rimDiameter: 18 }, { width: 245, aspectRatio: 40, rimDiameter: 18 }, { width: 245, aspectRatio: 45, rimDiameter: 18 }, { width: 255, aspectRatio: 35, rimDiameter: 18 }, { width: 255, aspectRatio: 40, rimDiameter: 18 }, { width: 255, aspectRatio: 45, rimDiameter: 18 }, { width: 265, aspectRatio: 35, rimDiameter: 18 }, { width: 265, aspectRatio: 40, rimDiameter: 18 }, { width: 275, aspectRatio: 35, rimDiameter: 18 },
  // 19"
  { width: 225, aspectRatio: 35, rimDiameter: 19 }, { width: 225, aspectRatio: 40, rimDiameter: 19 }, { width: 235, aspectRatio: 35, rimDiameter: 19 }, { width: 235, aspectRatio: 40, rimDiameter: 19 }, { width: 245, aspectRatio: 35, rimDiameter: 19 }, { width: 245, aspectRatio: 40, rimDiameter: 19 }, { width: 255, aspectRatio: 35, rimDiameter: 19 }, { width: 255, aspectRatio: 40, rimDiameter: 19 }, { width: 265, aspectRatio: 30, rimDiameter: 19 }, { width: 265, aspectRatio: 35, rimDiameter: 19 }, { width: 275, aspectRatio: 30, rimDiameter: 19 }, { width: 275, aspectRatio: 35, rimDiameter: 19 },
  // 20"
  { width: 245, aspectRatio: 35, rimDiameter: 20 }, { width: 245, aspectRatio: 40, rimDiameter: 20 }, { width: 255, aspectRatio: 35, rimDiameter: 20 }, { width: 255, aspectRatio: 40, rimDiameter: 20 }, { width: 265, aspectRatio: 35, rimDiameter: 20 }, { width: 275, aspectRatio: 30, rimDiameter: 20 }, { width: 275, aspectRatio: 35, rimDiameter: 20 }, { width: 285, aspectRatio: 30, rimDiameter: 20 }, { width: 285, aspectRatio: 35, rimDiameter: 20 },
  // 21"
  { width: 255, aspectRatio: 35, rimDiameter: 21 }, { width: 265, aspectRatio: 35, rimDiameter: 21 }, { width: 275, aspectRatio: 30, rimDiameter: 21 }, { width: 285, aspectRatio: 30, rimDiameter: 21 }, { width: 285, aspectRatio: 35, rimDiameter: 21 },
  // 22"
  { width: 265, aspectRatio: 35, rimDiameter: 22 }, { width: 275, aspectRatio: 35, rimDiameter: 22 }, { width: 285, aspectRatio: 30, rimDiameter: 22 }, { width: 295, aspectRatio: 30, rimDiameter: 22 },
  // Van/SUV
  { width: 195, aspectRatio: 70, rimDiameter: 15 }, { width: 205, aspectRatio: 65, rimDiameter: 15 }, { width: 215, aspectRatio: 65, rimDiameter: 16 }, { width: 225, aspectRatio: 65, rimDiameter: 16 }, { width: 235, aspectRatio: 65, rimDiameter: 16 }, { width: 195, aspectRatio: 75, rimDiameter: 16 }, { width: 205, aspectRatio: 75, rimDiameter: 16 }, { width: 215, aspectRatio: 75, rimDiameter: 16 }, { width: 225, aspectRatio: 75, rimDiameter: 16 }, { width: 235, aspectRatio: 60, rimDiameter: 17 }, { width: 255, aspectRatio: 60, rimDiameter: 17 }, { width: 265, aspectRatio: 60, rimDiameter: 18 },
];

function generateRecommendations(original: TireSize): TireSize[] {
  const targetDiameter = calcDiameter(original);
  const recs: { size: TireSize; diff: number }[] = [];

  for (const candidate of REAL_TIRE_SIZES) {
    if (candidate.width === original.width && candidate.aspectRatio === original.aspectRatio && candidate.rimDiameter === original.rimDiameter) continue;
    const diameter = calcDiameter(candidate);
    const diffPct = Math.abs((diameter - targetDiameter) / targetDiameter) * 100;
    if (diffPct <= 3) {
      recs.push({ size: candidate, diff: diffPct });
    }
  }

  recs.sort((a, b) => a.diff - b.diff);
  return recs.slice(0, 8).map(r => r.size);
}

function compareTires(original: TireSize, newSize: TireSize): ComparisonResult {
  const originalDiameter = calcDiameter(original);
  const newDiameter = calcDiameter(newSize);
  const diameterDiff = newDiameter - originalDiameter;
  const diameterDiffPct = (diameterDiff / originalDiameter) * 100;
  const circumference = calcCircumference(original);
  const newCircumference = calcCircumference(newSize);
  const circumferenceDiff = newCircumference - circumference;
  const sidewallHeight = calcSidewall(original);
  const newSidewallHeight = calcSidewall(newSize);
  const widthDiff = newSize.width - original.width;
  const speedoDiff = -diameterDiffPct;
  const clearanceDiff = diameterDiff / 2;

  let status: 'ok' | 'warning' | 'danger' = 'ok';
  const absPct = Math.abs(diameterDiffPct);
  if (absPct <= 1) status = 'ok';
  else if (absPct <= 3) status = 'warning';
  else status = 'danger';

  return {
    original,
    new: newSize,
    originalDiameter,
    newDiameter,
    diameterDiff,
    diameterDiffPct,
    circumference,
    newCircumference,
    circumferenceDiff,
    sidewallHeight,
    newSidewallHeight,
    widthDiff,
    speedoDiff,
    clearanceDiff,
    status,
    recommendations: generateRecommendations(original),
  };
}

export default function TireSizeConverterClient({ dict, lang, phone }: Props) {
  const t = dict.tools;
  const [originalInput, setOriginalInput] = useState('');
  const [newInput, setNewInput] = useState('');
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState('');
  const [selectedRec, setSelectedRec] = useState<TireSize | null>(null);

  function handleCompare(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setResult(null);
    setSelectedRec(null);

    const orig = parseTireSize(originalInput);
    const newSize = parseTireSize(newInput);

    if (!orig) {
      setError(lang === 'hu' ? 'Hibás eredeti méret! Formátum: 205/55 R16' : lang === 'de' ? 'Ungültige Originalgröße! Format: 205/55 R16' : 'Invalid original size! Format: 205/55 R16');
      return;
    }
    if (!newSize) {
      setError(lang === 'hu' ? 'Hibás új méret! Formátum: 225/45 R17' : lang === 'de' ? 'Ungültige neue Größe! Format: 225/45 R17' : 'Invalid new size! Format: 225/45 R17');
      return;
    }

    setResult(compareTires(orig, newSize));
  }

  function handleReset() {
    setOriginalInput('');
    setNewInput('');
    setResult(null);
    setError('');
    setSelectedRec(null);
  }

  function useRecommendation(rec: TireSize) {
    setNewInput(formatSize(rec));
    const orig = parseTireSize(originalInput);
    if (orig) {
      setResult(compareTires(orig, rec));
      setSelectedRec(rec);
    }
  }

  const statusConfig = useMemo(() => {
    if (!result) return null;
    const cfg = {
      ok: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: CheckCircle2, label: lang === 'hu' ? 'Kompatibilis' : lang === 'de' ? 'Kompatibel' : 'Compatible' },
      warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: AlertTriangle, label: lang === 'hu' ? 'Elfogadható, de figyeljen' : lang === 'de' ? 'Akzeptabel, aber Vorsicht' : 'Acceptable, but use caution' },
      danger: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: AlertTriangle, label: lang === 'hu' ? 'Nem ajánlott!' : lang === 'de' ? 'Nicht empfohlen!' : 'Not recommended!' },
    };
    return cfg[result.status];
  }, [result, lang]);

  const hu = lang === 'hu';
  const de = lang === 'de';

  return (
    <div className="space-y-8">
      {/* Input card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <ArrowLeftRight className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">{t.tire_converter_title}</h2>
            <p className="text-sm text-slate-500">{t.tire_converter_subtitle}</p>
          </div>
        </div>

        <form onSubmit={handleCompare} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {hu ? 'Jelenlegi gumiméret *' : de ? 'Aktuelle Reifengröße *' : 'Current tire size *'}
              </label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={originalInput}
                  onChange={e => setOriginalInput(e.target.value)}
                  placeholder="205/55 R16"
                  className="w-full border-2 border-slate-200 rounded-xl pl-10 pr-4 py-3 text-lg font-semibold tracking-wide focus:border-emerald-400 focus:outline-none transition-colors bg-slate-50 focus:bg-white"
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-400">Formátumok: 205/55 R16, 205 55 16, 2055516</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {hu ? 'Új gumiméret *' : de ? 'Neue Reifengröße *' : 'New tire size *'}
              </label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={newInput}
                  onChange={e => setNewInput(e.target.value)}
                  placeholder="225/45 R17"
                  className="w-full border-2 border-slate-200 rounded-xl pl-10 pr-4 py-3 text-lg font-semibold tracking-wide focus:border-emerald-400 focus:outline-none transition-colors bg-slate-50 focus:bg-white"
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-400">Formátumok: 225/45 R17, 225 45 17, 2254517</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit"
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold transition-colors">
              <ArrowLeftRight className="w-4 h-4" />
              {hu ? 'Összehasonlítás' : de ? 'Vergleichen' : 'Compare'}
            </button>
            <button type="button" onClick={handleReset}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-700 px-4 py-3 rounded-xl font-medium transition-colors">
              <RotateCcw className="w-4 h-4" />
              {t.reset}
            </button>
          </div>
        </form>

        {error && <p className="mt-4 text-red-600 text-sm font-medium">{error}</p>}
      </div>

      {/* Results */}
      {result && statusConfig && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Status banner */}
          <div className={`rounded-2xl border-2 ${statusConfig.border} ${statusConfig.bg} p-6`}>
            <div className="flex items-center gap-3">
              <statusConfig.icon className={`w-7 h-7 ${statusConfig.text} shrink-0`} />
              <div>
                <p className={`font-bold text-lg ${statusConfig.text}`}>{statusConfig.label}</p>
                <p className="text-sm text-slate-600">
                  {formatSize(result.original)} → {formatSize(result.new)}
                  {' · '}
                  {hu
                    ? `Átmérő különbség: ${result.diameterDiff > 0 ? '+' : ''}${result.diameterDiff.toFixed(1)} mm (${result.diameterDiffPct > 0 ? '+' : ''}${result.diameterDiffPct.toFixed(2)}%)`
                    : de
                    ? `Durchmesser-Differenz: ${result.diameterDiff > 0 ? '+' : ''}${result.diameterDiff.toFixed(1)} mm (${result.diameterDiffPct > 0 ? '+' : ''}${result.diameterDiffPct.toFixed(2)}%)`
                    : `Diameter difference: ${result.diameterDiff > 0 ? '+' : ''}${result.diameterDiff.toFixed(1)} mm (${result.diameterDiffPct > 0 ? '+' : ''}${result.diameterDiffPct.toFixed(2)}%)`}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed comparison grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Diameter */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <Gauge className="w-4 h-4 text-slate-400" />
                <h3 className="font-semibold text-slate-700 text-sm">{hu ? 'Gumiátmérő' : de ? 'Reifendurchmesser' : 'Tire diameter'}</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{hu ? 'Eredeti' : de ? 'Original' : 'Original'}</span>
                  <span className="font-bold text-slate-800">{result.originalDiameter.toFixed(1)} mm</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{hu ? 'Új' : de ? 'Neu' : 'New'}</span>
                  <span className="font-bold text-slate-800">{result.newDiameter.toFixed(1)} mm</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
                  <span className="text-slate-500">{hu ? 'Különbség' : de ? 'Differenz' : 'Difference'}</span>
                  <span className={`font-bold ${result.diameterDiff > 0 ? 'text-amber-600' : result.diameterDiff < 0 ? 'text-blue-600' : 'text-green-600'}`}>
                    {result.diameterDiff > 0 ? '+' : ''}{result.diameterDiff.toFixed(1)} mm
                  </span>
                </div>
              </div>
            </div>

            {/* Speedometer */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-slate-400" />
                <h3 className="font-semibold text-slate-700 text-sm">{hu ? 'Sebességmérő eltérés' : de ? 'Tacho-Abweichung' : 'Speedometer deviation'}</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{hu ? 'Tényleges 50 km/h-nál' : de ? 'Bei tatsächlichen 50 km/h' : 'At actual 50 km/h'}</span>
                  <span className={`font-bold ${Math.abs(result.speedoDiff) > 2 ? 'text-red-600' : Math.abs(result.speedoDiff) > 1 ? 'text-amber-600' : 'text-green-600'}`}>
                    {(50 + 50 * result.speedoDiff / 100).toFixed(1)} km/h
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{hu ? 'Tényleges 90 km/h-nál' : de ? 'Bei tatsächlichen 90 km/h' : 'At actual 90 km/h'}</span>
                  <span className={`font-bold ${Math.abs(result.speedoDiff) > 2 ? 'text-red-600' : Math.abs(result.speedoDiff) > 1 ? 'text-amber-600' : 'text-green-600'}`}>
                    {(90 + 90 * result.speedoDiff / 100).toFixed(1)} km/h
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{hu ? 'Tényleges 130 km/h-nál' : de ? 'Bei tatsächlichen 130 km/h' : 'At actual 130 km/h'}</span>
                  <span className={`font-bold ${Math.abs(result.speedoDiff) > 2 ? 'text-red-600' : Math.abs(result.speedoDiff) > 1 ? 'text-amber-600' : 'text-green-600'}`}>
                    {(130 + 130 * result.speedoDiff / 100).toFixed(1)} km/h
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
                  <span className="text-slate-500">{hu ? 'Km-óra eltérés' : de ? 'Kilometerzähler-Abweichung' : 'Odometer deviation'}</span>
                  <span className={`font-bold ${result.speedoDiff > 0 ? 'text-red-600' : result.speedoDiff < 0 ? 'text-blue-600' : 'text-green-600'}`}>
                    {result.speedoDiff > 0 ? '+' : ''}{result.speedoDiff.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Width & Sidewall */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <Ruler className="w-4 h-4 text-slate-400" />
                <h3 className="font-semibold text-slate-700 text-sm">{hu ? 'Szélesség & Oldalfal' : de ? 'Breite & Seitenwand' : 'Width & Sidewall'}</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{hu ? 'Szélesség különbség' : de ? 'Breiten-Differenz' : 'Width difference'}</span>
                  <span className="font-bold text-slate-800">
                    {result.widthDiff > 0 ? '+' : ''}{result.widthDiff} mm
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{hu ? 'Oldalfal magasság (eredeti)' : de ? 'Seitenwandhöhe (Original)' : 'Sidewall height (original)'}</span>
                  <span className="font-bold text-slate-800">{result.sidewallHeight.toFixed(1)} mm</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{hu ? 'Oldalfal magasság (új)' : de ? 'Seitenwandhöhe (neu)' : 'Sidewall height (new)'}</span>
                  <span className="font-bold text-slate-800">{result.newSidewallHeight.toFixed(1)} mm</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
                  <span className="text-slate-500">{hu ? 'Kerékház clearance' : de ? 'Radhaus-Freiraum' : 'Wheel clearance'}</span>
                  <span className={`font-bold ${Math.abs(result.clearanceDiff) > 5 ? 'text-red-600' : result.clearanceDiff !== 0 ? 'text-amber-600' : 'text-green-600'}`}>
                    {result.clearanceDiff > 0 ? '+' : ''}{result.clearanceDiff.toFixed(1)} mm
                  </span>
                </div>
              </div>
            </div>

            {/* Circumference */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <RotateCcw className="w-4 h-4 text-slate-400" />
                <h3 className="font-semibold text-slate-700 text-sm">{hu ? 'Kerület' : de ? 'Umfang' : 'Circumference'}</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{hu ? 'Eredeti kerület' : de ? 'Originaler Umfang' : 'Original circumference'}</span>
                  <span className="font-bold text-slate-800">{result.circumference.toFixed(1)} mm</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{hu ? 'Új kerület' : de ? 'Neuer Umfang' : 'New circumference'}</span>
                  <span className="font-bold text-slate-800">{result.newCircumference.toFixed(1)} mm</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
                  <span className="text-slate-500">{hu ? 'Különbség' : de ? 'Differenz' : 'Difference'}</span>
                  <span className={`font-bold ${result.circumferenceDiff > 0 ? 'text-amber-600' : result.circumferenceDiff < 0 ? 'text-blue-600' : 'text-green-600'}`}>
                    {result.circumferenceDiff > 0 ? '+' : ''}{result.circumferenceDiff.toFixed(1)} mm
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{hu ? 'Fordulatonként' : de ? 'Pro Umdrehung' : 'Per revolution'}</span>
                  <span className="font-bold text-slate-800">
                    {result.circumferenceDiff > 0 ? '+' : ''}{(result.circumferenceDiff / 1000).toFixed(3)} m
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed explanation */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
            <h3 className="font-bold text-slate-800 text-lg mb-4">
              {hu ? 'Részletes értékelés' : de ? 'Detaillierte Bewertung' : 'Detailed Assessment'}
            </h3>
            <div className="space-y-3 text-sm text-slate-600">
              {result.status === 'ok' && (
                <>
                  <div className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <p>
                      {hu
                        ? `Az új méret (${formatSize(result.new)}) átmérője mindössze ${Math.abs(result.diameterDiffPct).toFixed(2)}%-kal tér el az eredetitől. Ez a ±1%-os tűréshatáron belül van, így biztonságosan használható.`
                        : de
                        ? `Der neue Reifen (${formatSize(result.new)}) weicht nur ${Math.abs(result.diameterDiffPct).toFixed(2)}% vom Original ab. Dies liegt innerhalb der ±1% Toleranz und ist sicher.`
                        : `The new size (${formatSize(result.new)}) deviates only ${Math.abs(result.diameterDiffPct).toFixed(2)}% from the original. This is within the ±1% tolerance and is safe.`}
                    </p>
                  </div>
                </>
              )}
              {result.status === 'warning' && (
                <>
                  <div className="flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p>
                      {hu
                        ? `Az új méret átmérője ${Math.abs(result.diameterDiffPct).toFixed(2)}%-kal tér el. Ez az 1-3%-os sávba esik, amely forgalomba helyezés előtt műszaki engedélyezés (abroncs-felni dokumentáció) szükséges.`
                        : de
                        ? `Der neue Reifen weicht ${Math.abs(result.diameterDiffPct).toFixed(2)}% ab. Dies liegt im 1-3% Bereich und erfordert eine technische Freigabe vor der Inbetriebnahme.`
                        : `The new size deviates ${Math.abs(result.diameterDiffPct).toFixed(2)}%. This falls in the 1-3% range and requires technical approval before use.`}
                    </p>
                  </div>
                </>
              )}
              {result.status === 'danger' && (
                <>
                  <div className="flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p>
                      {hu
                        ? `Az új méret átmérője ${Math.abs(result.diameterDiffPct).toFixed(2)}%-kal tér el az eredetitől! Ez meghaladja a 3%-os biztonsági határt. A felszerelés NEM ajánlott – biztonsági kockázatot jelent, és a forgalmi engedély is érvényét vesztheti!`
                        : de
                        ? `Der neue Reifen weicht ${Math.abs(result.diameterDiffPct).toFixed(2)}% ab! Dies überschreitet die 3% Sicherheitsgrenze. Die Montage wird NICHT empfohlen – Sicherheitsrisiko und möglicher Verlust der Betriebserlaubnis!`
                        : `The new size deviates ${Math.abs(result.diameterDiffPct).toFixed(2)}% from the original! This exceeds the 3% safety limit. Fitting is NOT recommended – safety risk and may void roadworthiness!`}
                    </p>
                  </div>
                </>
              )}

              {result.speedoDiff !== 0 && (
                <div className="flex gap-2">
                  <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <p>
                    {hu
                      ? `A sebességmérő ${result.speedoDiff > 0 ? 'lassabbnak' : 'gyorsabbnak'} mutatja az autót a valóságnál. 100 km/h-val való haladáskor a műszer ${Math.abs(100 * result.speedoDiff / 100).toFixed(1)} km/h ${result.speedoDiff > 0 ? 'kevesebbet' : 'többet'} mutat. A kilométer-számláló is ${result.speedoDiff > 0 ? 'kevesebbet' : 'többet'} számol.`
                      : de
                      ? `Der Tacho zeigt das Fahrzeug ${result.speedoDiff > 0 ? 'langsamer' : 'schneller'} als tatsächlich. Bei 100 km/h zeigt das Gerät ${Math.abs(100 * result.speedoDiff / 100).toFixed(1)} km/h ${result.speedoDiff > 0 ? 'weniger' : 'mehr'}.`
                      : `The speedometer shows ${result.speedoDiff > 0 ? 'slower' : 'faster'} than actual. At 100 km/h it displays ${Math.abs(100 * result.speedoDiff / 100).toFixed(1)} km/h ${result.speedoDiff > 0 ? 'less' : 'more'}.`}
                  </p>
                </div>
              )}

              {Math.abs(result.clearanceDiff) > 3 && (
                <div className="flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p>
                    {hu
                      ? `A gumiátmérő változása ${result.clearanceDiff > 0 ? 'növeli' : 'csökkenti'} a kerékházban lévő szabad teret ${Math.abs(result.clearanceDiff).toFixed(1)} mm-rel. ${result.clearanceDiff > 0 ? 'Döccentő vagy éles kanyar esetén a gumi súrolhatja a sárvédőt!' : 'Ez alacsonyabb hasmagasságot eredményez.'}`
                      : de
                      ? `Die Durchmesseränderung ${result.clearanceDiff > 0 ? 'erhöht' : 'verringert'} den Freiraum im Radhaus um ${Math.abs(result.clearanceDiff).toFixed(1)} mm.`
                      : `The diameter change ${result.clearanceDiff > 0 ? 'increases' : 'decreases'} wheel clearance by ${Math.abs(result.clearanceDiff).toFixed(1)} mm.`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          {result.recommendations.length > 0 && result.status !== 'ok' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-slate-800 text-lg">
                  {hu ? 'Ajánlott alternatív méretek' : de ? 'Empfohlene alternative Größen' : 'Recommended alternative sizes'}
                </h3>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                {hu
                  ? 'Ezek a méretek minimális eltérést mutatnak az eredeti átmérőhöz képest (±3% határon belül):'
                  : de
                  ? 'Diese Größen weichen minimal vom Originaldurchmesser ab (innerhalb ±3%):'
                  : 'These sizes have minimal deviation from the original diameter (within ±3%):'}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {result.recommendations.map((rec, i) => {
                  const recDiameter = calcDiameter(rec);
                  const diffPct = ((recDiameter - result.originalDiameter) / result.originalDiameter) * 100;
                  const isSelected = selectedRec && formatSize(selectedRec) === formatSize(rec);
                  return (
                    <button
                      key={i}
                      onClick={() => useRecommendation(rec)}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-emerald-400 bg-emerald-50'
                          : 'border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/50'
                      }`}
                    >
                      <p className="font-bold text-slate-800 text-base">{formatSize(rec)}</p>
                      <p className={`text-xs font-medium mt-1 ${
                        Math.abs(diffPct) <= 1 ? 'text-green-600' : 'text-amber-600'
                      }`}>
                        {diffPct > 0 ? '+' : ''}{diffPct.toFixed(2)}%
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{recDiameter.toFixed(0)} mm</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-white">
              <p className="font-bold text-lg">
                {hu ? 'Biztos a méretben? Szereljük fel Önnek!' : de ? 'Sicher mit der Größe? Wir montieren!' : 'Sure about the size? Let us fit it!'}
              </p>
              <p className="text-emerald-100 text-sm">
                {hu ? 'Mobil gumiszerviz – átlagosan 45 perc alatt ott vagyunk' : de ? 'Mobiler Reifenservice – durchschnittlich 45 Min.' : 'Mobile tire service – avg. 45 min arrival'}
              </p>
            </div>
            <a href={`tel:${phone.replace(/\s/g, '')}`}
              className="shrink-0 flex items-center gap-2 bg-white text-emerald-600 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-colors shadow-lg">
              <Phone className="w-4 h-4" /> {phone}
            </a>
          </div>
        </div>
      )}

      {/* Cross-links */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
        <p className="text-sm font-semibold text-slate-600 mb-3">{t.also_check}</p>
        <div className="flex flex-wrap gap-3">
          <Link href={`/${lang}/gumimeretek`}
            className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-red-600 bg-white border border-slate-200 hover:border-red-300 px-4 py-2 rounded-xl transition-all">
            <ArrowLeftRight className="w-3.5 h-3.5" /> {t.link_tire_finder}
          </Link>
          <Link href={`/${lang}/gumi-auto-kereses`}
            className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-orange-600 bg-white border border-slate-200 hover:border-orange-300 px-4 py-2 rounded-xl transition-all">
            <ArrowLeftRight className="w-3.5 h-3.5" /> {t.link_tire_reverse}
          </Link>
          <Link href={`/${lang}/klima-adatbazis`}
            className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-cyan-600 bg-white border border-slate-200 hover:border-cyan-300 px-4 py-2 rounded-xl transition-all">
            <ArrowLeftRight className="w-3.5 h-3.5" /> {t.link_ac_db}
          </Link>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 space-y-2">
            <p className="font-semibold">
              {hu ? 'Fontos tudnivalók a gumiméret váltásról' : de ? 'Wichtiges zum Reifengrößenwechsel' : 'Important notes on tire size changes'}
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>{hu ? 'A ±1%-os átmérőkülönbség biztonságosan használható (zöld zóna).' : de ? '±1% Durchmesserabweichung ist sicher (grüne Zone).' : '±1% diameter deviation is safe (green zone).'}</li>
              <li>{hu ? '1-3% közötti eltérés műszaki engedélyezést igényelhet (sárga zóna).' : de ? '1-3% Abweichung erfordert technische Freigabe (gelbe Zone).' : '1-3% deviation may require technical approval (yellow zone).'}</li>
              <li>{hu ? '3% feletti eltérés NEM ajánlott – biztonsági kockázat (piros zóna).' : de ? 'Über 3% wird NICHT empfohlen – Sicherheitsrisiko (rote Zone).' : 'Over 3% is NOT recommended – safety risk (red zone).'}</li>
              <li>{hu ? 'A nagyobb gumi csökkentheti a gyorsulást és növelheti a fogyasztást.' : de ? 'Größere Reifen können Beschleunigung verringern und Verbrauch erhöhen.' : 'Larger tires may reduce acceleration and increase consumption.'}</li>
              <li>{hu ? 'Mindig ellenőrizze a terhelési indexet és a sebességi indexet is!' : de ? 'Prüfen Sie immer auch Tragfähigkeits- und Geschwindigkeitsindex!' : 'Always check load index and speed rating too!'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
