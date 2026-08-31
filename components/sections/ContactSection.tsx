'use client';

import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import type { SiteSettings } from '@/lib/types';
import type { Dictionary } from '@/lib/i18n';

interface Props {
  settings: SiteSettings;
  dict?: Dictionary;
  lang?: string;
}

const WHY_US_HU = [
  ['Átlag 45 perc kiérkezési idő', 'Budapesten belül, autópályákon is'],
  ['0-24 óra, 365 nap', 'Hétvégén és ünnepnapokon is, pótdíj nélkül'],
  ['Professzionális felszerelés', 'Digitális centrírozó, hidraulikus emelő'],
  ['Transzparens árak', 'Rejtett díjak nélkül – az árlistánk nyilvános'],
  ['10+ év tapasztalat', 'Több mint 10.000 elvégzett munka'],
  ['Bankkártya elfogadva', 'Készpénz és bankkártya is elfogadott'],
];
const WHY_US_EN = [
  ['Avg. 45 min arrival', 'Within Budapest and on motorways'],
  ['24/7, 365 days', 'Weekends and holidays, no surcharge'],
  ['Professional equipment', 'Digital wheel balancer, hydraulic lift'],
  ['Transparent pricing', 'No hidden fees – prices published online'],
  ['10+ years experience', 'Over 10,000 completed jobs'],
  ['Card payments accepted', 'Cash and card both accepted'],
];
const WHY_US_DE = [
  ['Ø 45 Min. Ankunftszeit', 'Innerhalb Budapest, auch auf Autobahnen'],
  ['24/7, 365 Tage', 'Wochenenden & Feiertage, kein Aufpreis'],
  ['Professionelle Ausrüstung', 'Digitales Auswuchten, Hydraulikheber'],
  ['Transparente Preise', 'Keine versteckten Gebühren'],
  ['10+ Jahre Erfahrung', 'Über 10.000 erledigte Aufträge'],
  ['Kartenzahlung möglich', 'Bar und Karte akzeptiert'],
];

export default function ContactSection({ settings, dict, lang = 'hu' }: Props) {
  const d = dict?.contact;
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '', service: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const whyUs = lang === 'en' ? WHY_US_EN : lang === 'de' ? WHY_US_DE : WHY_US_HU;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, lang }),
      });
      if (res.ok) {
        setStatus('success');
        setForm({ name: '', phone: '', email: '', message: '', service: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <section className="py-20 bg-slate-50" id="kapcsolat">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-14">
          <span className="text-red-600 font-semibold text-sm uppercase tracking-wider">{d?.label ?? 'Kapcsolat'}</span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-2 mb-4">{d?.title ?? 'Vegye fel velünk a kapcsolatot'}</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">{d?.subtitle ?? '0-24 órában, az év 365 napján elérhetők vagyunk – hívjon bizalommal!'}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Contact cards */}
          <div className="space-y-4">
            <a href={`tel:${settings.phone.replace(/\s/g, '')}`}
              className="flex items-center gap-5 bg-white rounded-2xl border border-slate-100 p-6 hover:border-red-200 hover:shadow-md transition-all group">
              <div className="w-14 h-14 bg-red-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-red-700 transition-colors">
                <Phone className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-slate-500 text-sm mb-1">{d?.phone_label ?? 'Telefon (0-24)'}</div>
                <div className="text-2xl font-black text-slate-900">{settings.phone}</div>
                {settings.phone_2 && <div className="text-slate-500 text-sm mt-0.5">{settings.phone_2}</div>}
                <div className="text-xs text-green-600 font-medium mt-1">{d?.phone_sub ?? 'Nonstop elérhető – hétvégén és ünnepnapokon is'}</div>
              </div>
            </a>

            <a href={`mailto:${settings.email}`}
              className="flex items-center gap-5 bg-white rounded-2xl border border-slate-100 p-6 hover:border-red-200 hover:shadow-md transition-all group">
              <div className="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-slate-500 text-sm mb-1">{d?.email_label ?? 'Email'}</div>
                <div className="text-lg font-bold text-slate-900">{settings.email}</div>
                <div className="text-xs text-slate-400 mt-1">{d?.email_sub ?? 'Flottás ajánlathoz is írjon!'}</div>
              </div>
            </a>

            <div className="flex items-center gap-5 bg-white rounded-2xl border border-slate-100 p-6">
              <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="w-7 h-7 text-slate-600" />
              </div>
              <div>
                <div className="text-slate-500 text-sm mb-1">{d?.area_label ?? 'Területünk'}</div>
                <div className="font-bold text-slate-900">{settings.address}</div>
                <div className="text-xs text-slate-400 mt-1">{d?.area_sub ?? 'Autópályákon is vállalunk kiszállást'}</div>
              </div>
            </div>

            <div className="flex items-center gap-5 bg-white rounded-2xl border border-slate-100 p-6">
              <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                <Clock className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <div className="text-slate-500 text-sm mb-1">{d?.hours_label ?? 'Elérhetőség'}</div>
                <div className="font-bold text-slate-900">{settings.working_hours}</div>
                <div className="text-xs text-green-600 font-medium mt-1">{d?.hours_sub ?? 'Hétvégén és ünnepnapokon is – pótdíj nélkül!'}</div>
              </div>
            </div>
          </div>

          {/* Right side: contact form + why us */}
          <div className="space-y-6">
            {/* Contact form */}
            <div className="bg-white rounded-2xl border border-slate-100 p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6">{d?.form_name ? (lang === 'hu' ? 'Küldjön üzenetet' : lang === 'de' ? 'Nachricht senden' : 'Send a message') : 'Küldjön üzenetet'}</h3>
              {status === 'success' ? (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-slate-700 font-semibold">{d?.form_success ?? 'Üzenetét megkaptuk! Hamarosan visszahívjuk.'}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">{d?.form_name ?? 'Név'}</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">{d?.form_phone ?? 'Telefonszám'}</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{d?.form_email ?? 'Email cím'}</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{d?.form_service ?? 'Érdeklő szolgáltatás'}</label>
                    <select
                      value={form.service}
                      onChange={(e) => setForm({ ...form, service: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white"
                    >
                      <option value="">–</option>
                      {lang === 'hu' && <>
                        <option>Szezonális gumicsere</option>
                        <option>Defektjavítás</option>
                        <option>Autóklíma töltés</option>
                        <option>Centrírozás</option>
                        <option>Autómentés</option>
                        <option>Flottakezelés</option>
                      </>}
                      {lang === 'en' && <>
                        <option>Seasonal tire change</option>
                        <option>Flat tire repair</option>
                        <option>AC recharge</option>
                        <option>Wheel balancing</option>
                        <option>Car recovery</option>
                        <option>Fleet service</option>
                      </>}
                      {lang === 'de' && <>
                        <option>Saisonaler Reifenwechsel</option>
                        <option>Reifenpannenservice</option>
                        <option>Klimaanlage füllen</option>
                        <option>Auswuchten</option>
                        <option>Pannenhilfe</option>
                        <option>Flottenservice</option>
                      </>}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{d?.form_message ?? 'Üzenet'}</label>
                    <textarea
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition resize-none"
                    />
                  </div>
                  {status === 'error' && (
                    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-xl p-3">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {d?.form_error ?? 'Hiba küldés közben. Kérjük, hívjon minket!'}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95"
                  >
                    {status === 'submitting' ? (d?.form_submitting ?? 'Küldés...') : (d?.form_submit ?? 'Üzenet küldése')}
                  </button>
                </form>
              )}
            </div>

            {/* Why us */}
            <div className="bg-slate-900 rounded-2xl p-8 text-white">
              <h3 className="text-xl font-bold mb-5">{d?.why_us ?? 'Miért válasszon minket?'}</h3>
              <ul className="space-y-3">
                {whyUs.map(([title, sub]) => (
                  <li key={title} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{title}</div>
                      <div className="text-slate-400 text-xs mt-0.5">{sub}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
