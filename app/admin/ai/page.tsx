'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Star, Save, X, Edit2 } from 'lucide-react';
import {
  getAiConfigs,
  createAiConfig,
  updateAiConfig,
  deleteAiConfig,
  setDefaultAiConfig,
} from '@/lib/db';
import type { AiConfig } from '@/lib/types';

const PROVIDERS = [
  { value: 'pollinations', label: 'Pollinations.ai (ingyenes, API kulcs nélkül)', free: true, noKey: true },
  { value: 'openai', label: 'OpenAI (ChatGPT)', free: false },
  { value: 'anthropic', label: 'Anthropic (Claude)', free: false },
  { value: 'gemini', label: 'Google Gemini', free: true },
  { value: 'groq', label: 'Groq (ingyenes tier)', free: true },
  { value: 'openrouter', label: 'OpenRouter (ingyenes modellek is)', free: true },
  { value: 'huggingface', label: 'Hugging Face Inference', free: true },
  { value: 'cerebras', label: 'Cerebras (ingyenes tier)', free: true },
  { value: 'mistral', label: 'Mistral AI (ingyenes tier)', free: true },
  { value: 'deepseek', label: 'DeepSeek (ingyenes tier)', free: true },
  { value: 'together', label: 'Together AI (ingyenes kredit)', free: true },
  { value: 'custom', label: 'Egyedi (OpenAI-kompatibilis)', free: false },
];

const OPENAI_MODELS = ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'gpt-4.1-mini', 'o3-mini'];
const ANTHROPIC_MODELS = ['claude-sonnet-4-5', 'claude-opus-4-5', 'claude-3-5-haiku-20241022'];
const GEMINI_MODELS = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-3.1-pro-preview'];
const GROQ_MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'llama-3.2-3b-preview', 'llama-3.2-1b-preview'];
const OPENROUTER_MODELS = ['openai/gpt-4o-mini', 'google/gemini-2.5-flash', 'meta-llama/llama-3.3-70b-instruct', 'mistralai/mistral-7b-instruct:free', 'microsoft/phi-3-mini-128k-instruct:free'];
const HUGGINGFACE_MODELS = ['mistralai/Mistral-7B-Instruct-v0.3', 'meta-llama/Meta-Llama-3-8B-Instruct', 'HuggingFaceH4/zephyr-7b-beta'];
const CEREBRAS_MODELS = ['gpt-oss-120b', 'zai-glm-4.7', 'gemma-4-31b'];
const MISTRAL_MODELS = ['mistral-large-latest', 'mistral-small-latest', 'open-mistral-7b', 'open-mixtral-8x7b'];
const DEEPSEEK_MODELS = ['deepseek-chat', 'deepseek-reasoner'];
const TOGETHER_MODELS = ['meta-llama/Llama-3.3-70B-Instruct-Turbo', 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo', 'mistralai/Mixtral-8x7B-Instruct-v0.1', 'Qwen/Qwen2.5-7B-Instruct-Turbo'];

const emptyForm = { name: '', provider: 'pollinations', api_key: '', model: 'openai', base_url: '', is_default: false, is_active: true };

const POLLINATIONS_MODELS = ['openai', 'mistral', 'llama'];

function getModels(provider: string): string[] {
  switch (provider) {
    case 'pollinations': return POLLINATIONS_MODELS;
    case 'openai': return OPENAI_MODELS;
    case 'anthropic': return ANTHROPIC_MODELS;
    case 'gemini': return GEMINI_MODELS;
    case 'groq': return GROQ_MODELS;
    case 'openrouter': return OPENROUTER_MODELS;
    case 'huggingface': return HUGGINGFACE_MODELS;
    case 'cerebras': return CEREBRAS_MODELS;
    case 'mistral': return MISTRAL_MODELS;
    case 'deepseek': return DEEPSEEK_MODELS;
    case 'together': return TOGETHER_MODELS;
    default: return [];
  }
}

export default function AdminAiPage() {
  const [configs, setConfigs] = useState<AiConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    const data = await getAiConfigs();
    setConfigs(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (config: AiConfig) => {
    setEditingId(config.id);
    setForm({
      name: config.name,
      provider: config.provider,
      api_key: config.api_key,
      model: config.model,
      base_url: config.base_url ?? '',
      is_default: config.is_default,
      is_active: config.is_active,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    const providerInfo = PROVIDERS.find((p) => p.value === form.provider);
    const needsKey = !providerInfo?.noKey;
    if (!form.name || (needsKey && !form.api_key)) {
      alert(needsKey ? 'A név és az API kulcs megadása kötelező!' : 'A név megadása kötelező!');
      return;
    }
    if (editingId) {
      await updateAiConfig(editingId, form);
    } else {
      await createAiConfig(form);
    }
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    await load();
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultAiConfig(id);
    await load();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Biztosan törli a(z) "${name}" konfigurációt?`)) return;
    await deleteAiConfig(id);
    await load();
  };

  const showBaseUrl = form.provider === 'custom' || form.provider === 'cerebras' || form.provider === 'mistral' || form.provider === 'deepseek' || form.provider === 'together';

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">AI Konfiguráció</h1>
          <p className="text-slate-500 mt-1">Tárolja és kezelje az AI API kulcsait</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm"
        >
          <Plus className="w-4 h-4" />
          Új konfiguráció
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-900">{editingId ? 'Konfiguráció szerkesztése' : 'Új AI konfiguráció'}</h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Konfiguráció neve *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
                placeholder="pl. OpenAI GPT-4o"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Szolgáltató</label>
              <select
                value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value, model: getModels(e.target.value)[0] || '' })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
              >
                {PROVIDERS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                API kulcs{PROVIDERS.find((p) => p.value === form.provider)?.noKey ? ' (nem kötelező)' : ' *'}
              </label>
              <input
                type="password"
                value={form.api_key}
                onChange={(e) => setForm({ ...form, api_key: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400 font-mono"
                placeholder={PROVIDERS.find((p) => p.value === form.provider)?.noKey ? '(üresen hagyható)' : 'sk-...'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Modell</label>
              {getModels(form.provider).length > 0 ? (
                <select
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
                >
                  {getModels(form.provider).map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              ) : (
                <input
                  type="text"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
                  placeholder="modell neve"
                />
              )}
            </div>
            {showBaseUrl && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">API alap URL</label>
                <input
                  type="url"
                  value={form.base_url}
                  onChange={(e) => setForm({ ...form, base_url: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
                  placeholder="https://api.example.com/v1"
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm"
            >
              <Save className="w-4 h-4" />
              Mentés
            </button>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-slate-500 hover:text-slate-700 text-sm">
              Mégse
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-slate-400">Betöltés...</div>
      ) : configs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="text-slate-400 mb-2">Nincs mentett AI konfiguráció</div>
          <p className="text-slate-400 text-sm">Adjon hozzá egy AI API konfigurációt az oldal és blog tartalmak generálásához.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {configs.map((config) => (
            <div key={config.id} className={`bg-white rounded-2xl border p-6 ${config.is_default ? 'border-red-300 bg-red-50/30' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {config.is_default && (
                    <div className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white" />
                      Alapértelmezett
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-slate-900">{config.name}</div>
                    <div className="text-slate-500 text-sm flex items-center gap-1.5">
                      {PROVIDERS.find((p) => p.value === config.provider)?.label} – {config.model}
                      {PROVIDERS.find((p) => p.value === config.provider)?.free && (
                        <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full font-medium">ingyenes</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!config.is_default && (
                    <button
                      onClick={() => handleSetDefault(config.id)}
                      className="text-xs text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Beállítás alapértelmezettnek
                    </button>
                  )}
                  <button onClick={() => openEdit(config)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Szerkesztés">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(config.id, config.name)} className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
