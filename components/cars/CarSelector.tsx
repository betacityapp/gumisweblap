'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Car, Loader2, CheckCircle2 } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n';

interface Item { id: string; name: string; [key: string]: any }

interface Props {
  dict: Dictionary;
  onVariantSelected: (variantId: string, variantName: string, generationName: string, makeName: string, modelName: string) => void;
  onReset?: () => void;
}

type Step = 'make' | 'model' | 'generation' | 'variant';

const STEPS: Step[] = ['make', 'model', 'generation', 'variant'];

async function fetchItems(q: string, params: Record<string, string> = {}): Promise<Item[]> {
  const sp = new URLSearchParams({ q, ...params });
  const res = await fetch(`/api/cars?${sp}`);
  if (!res.ok) return [];
  return res.json();
}

export default function CarSelector({ dict, onVariantSelected, onReset }: Props) {
  const t = dict.tools;

  const [step, setStep] = useState<Step>('make');
  const [makes, setMakes] = useState<Item[]>([]);
  const [models, setModels] = useState<Item[]>([]);
  const [generations, setGenerations] = useState<Item[]>([]);
  const [variants, setVariants] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedMake, setSelectedMake] = useState<Item | null>(null);
  const [selectedModel, setSelectedModel] = useState<Item | null>(null);
  const [selectedGeneration, setSelectedGeneration] = useState<Item | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Item | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchItems('makes').then(d => { setMakes(d); setLoading(false); });
  }, []);

  async function selectMake(make: Item) {
    setSelectedMake(make);
    setSelectedModel(null);
    setSelectedGeneration(null);
    setSelectedVariant(null);
    setStep('model');
    setLoading(true);
    const data = await fetchItems('models', { make_id: make.id });
    setModels(data);
    setLoading(false);
  }

  async function selectModel(model: Item) {
    setSelectedModel(model);
    setSelectedGeneration(null);
    setSelectedVariant(null);
    setStep('generation');
    setLoading(true);
    const data = await fetchItems('generations', { model_id: model.id });
    setGenerations(data);
    setLoading(false);
  }

  async function selectGeneration(gen: Item) {
    setSelectedGeneration(gen);
    setSelectedVariant(null);
    setStep('variant');
    setLoading(true);
    const data = await fetchItems('variants', { generation_id: gen.id });
    setVariants(data);
    setLoading(false);
  }

  function selectVariant(variant: Item) {
    setSelectedVariant(variant);
    onVariantSelected(
      variant.id,
      variant.name,
      selectedGeneration?.name ?? '',
      selectedMake?.name ?? '',
      selectedModel?.name ?? ''
    );
  }

  function goBack() {
    const idx = STEPS.indexOf(step);
    if (idx === 0) return;
    const prev = STEPS[idx - 1];
    setStep(prev);
    if (prev === 'make') { setSelectedMake(null); setSelectedModel(null); setSelectedGeneration(null); setSelectedVariant(null); }
    if (prev === 'model') { setSelectedModel(null); setSelectedGeneration(null); setSelectedVariant(null); }
    if (prev === 'generation') { setSelectedGeneration(null); setSelectedVariant(null); }
  }

  function reset() {
    setStep('make');
    setSelectedMake(null); setSelectedModel(null); setSelectedGeneration(null); setSelectedVariant(null);
    onReset?.();
  }

  const stepIdx = STEPS.indexOf(step);
  const stepLabels: string[] = [t.step_make, t.step_model, t.step_generation, t.step_variant];
  const selectLabels: string[] = [t.select_make, t.select_model, t.select_generation, t.select_variant];

  const currentItems = step === 'make' ? makes : step === 'model' ? models : step === 'generation' ? generations : variants;

  return (
    <div className="w-full">
      {/* Progress breadcrumb */}
      <div className="flex items-center gap-1 mb-6 flex-wrap">
        {STEPS.map((s, i) => {
          const isDone = i < stepIdx;
          const isActive = i === stepIdx;
          const sel = i === 0 ? selectedMake : i === 1 ? selectedModel : i === 2 ? selectedGeneration : selectedVariant;
          return (
            <div key={s} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />}
              <button
                onClick={() => { if (isDone) { setStep(s); } }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-200'
                    : isDone
                    ? 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer'
                    : 'bg-slate-100 text-slate-400 cursor-default'
                }`}
                disabled={!isDone && !isActive}
              >
                {isDone && <CheckCircle2 className="w-3 h-3" />}
                {isDone ? (sel?.name ?? stepLabels[i]) : stepLabels[i]}
              </button>
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-800">{selectLabels[stepIdx]}</h3>
          {stepIdx > 0 && (
            <button onClick={goBack} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors">
              <ChevronLeft className="w-4 h-4" />
              {t.back}
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-red-500" />
            <span className="ml-2 text-slate-500 text-sm">{t.loading}</span>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Car className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t.no_data}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {currentItems.map((item) => {
              const isSel = [selectedMake, selectedModel, selectedGeneration, selectedVariant].some(s => s?.id === item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (step === 'make') selectMake(item);
                    else if (step === 'model') selectModel(item);
                    else if (step === 'generation') selectGeneration(item);
                    else selectVariant(item);
                  }}
                  className={`group relative text-left px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${
                    isSel
                      ? 'border-red-500 bg-red-50 text-red-700 shadow-sm shadow-red-100'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-red-300 hover:bg-red-50/50 hover:text-red-600'
                  }`}
                >
                  <span className="block truncate">{item.name}</span>
                  {item.years_start && (
                    <span className="block text-xs text-slate-400 mt-0.5">
                      {item.years_start}–{item.years_end ?? ''}
                    </span>
                  )}
                  {item.fuel_type && (
                    <span className={`block text-xs mt-0.5 ${
                      ['dízel', 'diesel', 'Diesel'].includes(item.fuel_type) ? 'text-blue-500' :
                      ['hibrid', 'hybrid'].some(t => item.fuel_type?.toLowerCase().includes(t)) ? 'text-green-500' :
                      ['elektromos', 'electric', 'ev'].some(t => item.fuel_type?.toLowerCase().includes(t)) ? 'text-cyan-500' :
                      'text-orange-500'
                    }`}>
                      {item.fuel_type}{item.power_hp ? ` · ${item.power_hp} LE` : ''}
                    </span>
                  )}
                  {item.code && !item.fuel_type && (
                    <span className="block text-xs text-slate-400 mt-0.5">{item.code}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedVariant && (
        <div className="mt-6 flex justify-end">
          <button onClick={reset} className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 transition-colors">
            {t.reset}
          </button>
        </div>
      )}
    </div>
  );
}
