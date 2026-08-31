'use client';

import { useEffect, useState } from 'react';
import { GripVertical, Plus, Trash2, ChevronUp, ChevronDown, Copy, Type, Image as ImageIcon, Video, Quote, MapPin, Award, AlertTriangle, CheckCircle, Star, Link2 } from 'lucide-react';
import type { PageBlock } from '@/lib/types';

export const BLOCK_TYPES = [
  { type: 'text', label: 'Szöveg', icon: Type, color: 'blue' },
  { type: 'image', label: 'Kép', icon: ImageIcon, color: 'green' },
  { type: 'gallery', label: 'Képgaléria', icon: ImageIcon, color: 'teal' },
  { type: 'video', label: 'Videó', icon: Video, color: 'red' },
  { type: 'quote', label: 'Idézet', icon: Quote, color: 'purple' },
  { type: 'cta', label: 'CTA gomb', icon: Link2, color: 'amber' },
  { type: 'partner', label: 'Partner ajánlás', icon: Award, color: 'indigo' },
  { type: 'alert', label: 'Figyelmeztetés', icon: AlertTriangle, color: 'orange' },
  { type: 'success', label: 'Sikeres üzenet', icon: CheckCircle, color: 'green' },
  { type: 'stats', label: 'Statisztika', icon: Star, color: 'blue' },
  { type: 'map', label: 'Térkép', icon: MapPin, color: 'red' },
  { type: 'html', label: 'Egyedi HTML', icon: Type, color: 'slate' },
];

interface BlockEditorProps {
  blocks: PageBlock[];
  onChange: (blocks: PageBlock[]) => void;
}

export default function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [showAdd, setShowAdd] = useState(false);

  const addBlock = (type: string) => {
    const newBlock: PageBlock = {
      id: `new-${Date.now()}`,
      parent_type: 'page',
      parent_id: '',
      block_type: type,
      block_data: getDefaultBlockData(type),
      sort_order: blocks.length,
      is_active: true,
      created_at: '',
    };
    onChange([...blocks, newBlock]);
    setShowAdd(false);
  };

  const updateBlock = (idx: number, data: Record<string, unknown>) => {
    const updated = blocks.map((b, i) => i === idx ? { ...b, block_data: { ...b.block_data, ...data } } : b);
    onChange(updated);
  };

  const removeBlock = (idx: number) => {
    onChange(blocks.filter((_, i) => i !== idx));
  };

  const moveBlock = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= blocks.length) return;
    const updated = [...blocks];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    updated.forEach((b, i) => b.sort_order = i);
    onChange(updated);
  };

  const duplicateBlock = (idx: number) => {
    const dup = { ...blocks[idx], id: `new-${Date.now()}`, block_data: { ...blocks[idx].block_data } };
    const updated = [...blocks];
    updated.splice(idx + 1, 0, dup);
    updated.forEach((b, i) => b.sort_order = i);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-900 text-sm">Tartalmi blokkok</h3>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
          <Plus className="w-3.5 h-3.5" /> Blokk hozzáadása
        </button>
      </div>

      {showAdd && (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mb-4 bg-slate-50 rounded-xl p-4">
          {BLOCK_TYPES.map(bt => {
            const Icon = bt.icon;
            return (
              <button key={bt.type} onClick={() => addBlock(bt.type)}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-slate-200 hover:border-red-300 hover:bg-white transition-all text-xs font-medium text-slate-600">
                <Icon className="w-5 h-5" /> {bt.label}
              </button>
            );
          })}
        </div>
      )}

      {blocks.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-6">Nincs blokk. Adjon hozzá egyet a fenti gombbal.</p>
      )}

      {blocks.map((block, idx) => {
        const bt = BLOCK_TYPES.find(b => b.type === block.block_type);
        const Icon = bt?.icon ?? Type;
        return (
          <div key={block.id} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-700">{bt?.label ?? block.block_type}</span>
                <span className="text-xs text-slate-400">#{idx + 1}</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => moveBlock(idx, -1)} disabled={idx === 0} className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
                <button onClick={() => moveBlock(idx, 1)} disabled={idx === blocks.length - 1} className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
                <button onClick={() => duplicateBlock(idx)} className="p-1 text-slate-400 hover:text-slate-600"><Copy className="w-3.5 h-3.5" /></button>
                <button onClick={() => removeBlock(idx)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <BlockFields block={block} onUpdate={(data) => updateBlock(idx, data)} />
          </div>
        );
      })}
    </div>
  );
}

function getDefaultBlockData(type: string): Record<string, unknown> {
  switch (type) {
    case 'text': return { content: '', align: 'left' };
    case 'image': return { url: '', alt: '', caption: '', width: 'full' };
    case 'gallery': return { images: [], columns: 3 };
    case 'video': return { url: '', title: '' };
    case 'quote': return { text: '', author: '' };
    case 'cta': return { text: '', link: '', style: 'red' };
    case 'partner': return { name: '', logo: '', link: '', description: '' };
    case 'alert': return { text: '' };
    case 'success': return { text: '' };
    case 'stats': return { items: [{ value: '', label: '' }] };
    case 'map': return { address: '', zoom: '13' };
    case 'html': return { code: '' };
    default: return {};
  }
}

function BlockFields({ block, onUpdate }: { block: PageBlock; onUpdate: (data: Record<string, unknown>) => void }) {
  const d = block.block_data;
  const input = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400";

  switch (block.block_type) {
    case 'text':
      return (
        <div className="space-y-2">
          <textarea value={(d.content as string) ?? ''} onChange={e => onUpdate({ content: e.target.value })} rows={4} className={input} placeholder="Szöveg tartalom (HTML engedélyezett)..." />
          <select value={(d.align as string) ?? 'left'} onChange={e => onUpdate({ align: e.target.value })} className={input}>
            <option value="left">Balra zárt</option>
            <option value="center">Középre</option>
            <option value="right">Jobbra zárt</option>
          </select>
        </div>
      );
    case 'image':
      return (
        <div className="space-y-2">
          <input type="url" value={(d.url as string) ?? ''} onChange={e => onUpdate({ url: e.target.value })} className={input} placeholder="Kép URL" />
          <input type="text" value={(d.alt as string) ?? ''} onChange={e => onUpdate({ alt: e.target.value })} className={input} placeholder="Alt szöveg (SEO)" />
          <input type="text" value={(d.caption as string) ?? ''} onChange={e => onUpdate({ caption: e.target.value })} className={input} placeholder="Képaláírás (opcionális)" />
          <select value={(d.width as string) ?? 'full'} onChange={e => onUpdate({ width: e.target.value })} className={input}>
            <option value="full">Teljes szélesség</option>
            <option value="half">Fél szélesség</option>
            <option value="third">Harmad szélesség</option>
          </select>
        </div>
      );
    case 'gallery':
      return (
        <div className="space-y-2">
          <textarea value={Array.isArray(d.images) ? (d.images as string[]).join('\n') : ''} onChange={e => onUpdate({ images: e.target.value.split('\n').filter(Boolean) })} rows={4} className={input} placeholder="Kép URL-ek (soronként egy)" />
          <select value={(d.columns as number) ?? 3} onChange={e => onUpdate({ columns: parseInt(e.target.value) })} className={input}>
            <option value={2}>2 oszlop</option>
            <option value={3}>3 oszlop</option>
            <option value={4}>4 oszlop</option>
          </select>
        </div>
      );
    case 'video':
      return (
        <div className="space-y-2">
          <input type="url" value={(d.url as string) ?? ''} onChange={e => onUpdate({ url: e.target.value })} className={input} placeholder="YouTube vagy Vimeo URL" />
          <input type="text" value={(d.title as string) ?? ''} onChange={e => onUpdate({ title: e.target.value })} className={input} placeholder="Videó címe" />
        </div>
      );
    case 'quote':
      return (
        <div className="space-y-2">
          <textarea value={(d.text as string) ?? ''} onChange={e => onUpdate({ text: e.target.value })} rows={3} className={input} placeholder="Idézet szövege..." />
          <input type="text" value={(d.author as string) ?? ''} onChange={e => onUpdate({ author: e.target.value })} className={input} placeholder="Szerző" />
        </div>
      );
    case 'cta':
      return (
        <div className="space-y-2">
          <input type="text" value={(d.text as string) ?? ''} onChange={e => onUpdate({ text: e.target.value })} className={input} placeholder="Gomb szövege" />
          <input type="url" value={(d.link as string) ?? ''} onChange={e => onUpdate({ link: e.target.value })} className={input} placeholder="Link URL" />
          <select value={(d.style as string) ?? 'red'} onChange={e => onUpdate({ style: e.target.value })} className={input}>
            <option value="red">Piros</option>
            <option value="dark">Sötét</option>
            <option value="light">Világos</option>
          </select>
        </div>
      );
    case 'partner':
      return (
        <div className="space-y-2">
          <input type="text" value={(d.name as string) ?? ''} onChange={e => onUpdate({ name: e.target.value })} className={input} placeholder="Partner neve" />
          <input type="url" value={(d.logo as string) ?? ''} onChange={e => onUpdate({ logo: e.target.value })} className={input} placeholder="Logo URL" />
          <input type="url" value={(d.link as string) ?? ''} onChange={e => onUpdate({ link: e.target.value })} className={input} placeholder="Partner weboldala" />
          <textarea value={(d.description as string) ?? ''} onChange={e => onUpdate({ description: e.target.value })} rows={2} className={input} placeholder="Rövid leírás" />
        </div>
      );
    case 'alert':
    case 'success':
      return (
        <textarea value={(d.text as string) ?? ''} onChange={e => onUpdate({ text: e.target.value })} rows={2} className={input} placeholder="Üzenet szövege..." />
      );
    case 'stats':
      const items = Array.isArray(d.items) ? d.items as { value: string; label: string }[] : [];
      return (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input type="text" value={item.value} onChange={e => { const n = [...items]; n[i] = { ...n[i], value: e.target.value }; onUpdate({ items: n }); }} className={input} placeholder="pl. 10 000+" />
              <input type="text" value={item.label} onChange={e => { const n = [...items]; n[i] = { ...n[i], label: e.target.value }; onUpdate({ items: n }); }} className={input} placeholder="pl. elvégzett munka" />
              <button onClick={() => onUpdate({ items: items.filter((_, idx) => idx !== i) })} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          <button onClick={() => onUpdate({ items: [...items, { value: '', label: '' }] })} className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700"><Plus className="w-3 h-3" /> Statisztika hozzáadása</button>
        </div>
      );
    case 'map':
      return (
        <div className="space-y-2">
          <input type="text" value={(d.address as string) ?? ''} onChange={e => onUpdate({ address: e.target.value })} className={input} placeholder="Cím" />
          <select value={(d.zoom as string) ?? '13'} onChange={e => onUpdate({ zoom: e.target.value })} className={input}>
            <option value="11">Távoli</option>
            <option value="13">Közepes</option>
            <option value="15">Közeli</option>
            <option value="17">Nagyon közeli</option>
          </select>
        </div>
      );
    case 'html':
      return <textarea value={(d.code as string) ?? ''} onChange={e => onUpdate({ code: e.target.value })} rows={6} className={`${input} font-mono`} placeholder="<div>Egyedi HTML...</div>" />;
    default:
      return null;
  }
}
