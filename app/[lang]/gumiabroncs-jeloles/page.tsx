import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ContactSection from '@/components/sections/ContactSection';
import StructuredData from '@/components/seo/StructuredData';
import { getDictionary } from '@/lib/i18n';
import { getSettings, getNavigation } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Gumiabroncs jelölések – Részletes útmutató | Toldi Mobil Gumi',
  description: 'Tudj meg mindent a gumiabroncs oldalfalán lévő jelölésekről: méret, terhelési index, sebességi index, gyártási dátum, M+S, 3PMSF és egyebek.',
  alternates: {
    canonical: 'https://toldimobilgumi.hu/gumiabroncs-jeloles',
  },
};

const sections = [
  {
    title: 'Méretjelölés (pl. 205/55 R16 91V)',
    icon: '📏',
    items: [
      { label: '205', desc: 'A gumiabroncs szélessége milliméterben. Ez a gumi futófelületének szélessége.' },
      { label: '55', desc: 'Fenntartási arány (profil). A gumiabroncs magasságának és szélességének hányadosa százalékban. 55 = a magasság a szélesség 55%-a.' },
      { label: 'R', desc: 'Radiális szerkezet. A leggyakoribb gumiabroncs-szerkezet. A belső kordák merőlegesen futnak a futófelület irányára.' },
      { label: '16', desc: 'Felni átmérője hüvelykben (inch). 16" = 40,64 cm.' },
      { label: '91', desc: 'Terhelési index (Load Index). 91 = 615 kg maximális terhelés gumiabroncsonként.' },
      { label: 'V', desc: 'Sebességi index. V = maximum 240 km/h sebesség. Ez a gumiabroncs maximális biztonságos sebessége.' },
    ],
  },
  {
    title: 'Terhelési index (Load Index – LI)',
    icon: '⚖️',
    items: [
      { label: '75', desc: '387 kg / gumiabroncs' },
      { label: '80', desc: '450 kg / gumiabroncs' },
      { label: '84', desc: '500 kg / gumiabroncs' },
      { label: '88', desc: '560 kg / gumiabroncs' },
      { label: '91', desc: '615 kg / gumiabroncs' },
      { label: '94', desc: '670 kg / gumiabroncs' },
      { label: '98', desc: '750 kg / gumiabroncs' },
      { label: '102', desc: '850 kg / gumiabroncs' },
    ],
  },
  {
    title: 'Sebességi index (Speed Index – SI)',
    icon: '🚗',
    items: [
      { label: 'Q', desc: '160 km/h' },
      { label: 'R', desc: '170 km/h' },
      { label: 'S', desc: '180 km/h' },
      { label: 'T', desc: '190 km/h' },
      { label: 'H', desc: '210 km/h' },
      { label: 'V', desc: '240 km/h' },
      { label: 'W', desc: '270 km/h' },
      { label: 'Y', desc: '300 km/h' },
    ],
  },
  {
    title: 'Téli és négyévszakos jelölések',
    icon: '❄️',
    items: [
      { label: 'M+S', desc: 'Mud + Snow (Sár + Hó). A gumiabroncs sárban és hóban jobb tapadást biztosít. Önmagában NEM jelenti, hogy téli gumi!' },
      { label: '3PMSF', desc: 'Three-Peak Mountain Snow Flake (Háromcsúcsú Hegy Hópehely). Hivatalos téli gumi minősítés. Ez a valódi téli gumiabroncs jelölés.' },
      { label: 'XL / RF', desc: 'Extra Load / Reinforced. Erősített gumiabroncs, magasabb terhelési indexszel. Nagyobb és nehezebb járművekhez.' },
      { label: 'RunFlat', desc: 'Defekt esetén is gurulható gumiabroncs. 80 km/h sebességgel akár 80 km távolságig.' },
    ],
  },
  {
    title: 'Gyártási dátum (DOT kód)',
    icon: '📅',
    items: [
      { label: 'DOT', desc: 'Department of Transportation. Az USA közlekedési hatóságának megfelelőségi jelölése.' },
      { label: '2417', desc: 'Gyártási dátum: 24. hét, 2017. Az első két szám a hét, az utolsó két szám az év.' },
      { label: '3224', desc: 'Gyártási dátum: 32. hét, 2024. Friss gumiabroncs – 2024-ben gyártott.' },
      { label: 'Figyelem!', desc: '6 évnél régebbi gumiabroncsoknál a gumi keménysége és tapadása jelentősen romlik. Cseré javasolt.' },
    ],
  },
  {
    title: 'Egyéb fontos jelölések',
    icon: '🏷️',
    items: [
      { label: 'E1', desc: 'E-jelölés: Európai gazdasági megfelelőség. A szám az országkódot jelöli (1 = Németország).' },
      { label: 'Tubeless', desc: 'Belső nélküli gumiabroncs. A leggyakoribb típus.' },
      { label: 'Tube Type', desc: 'Belső szükséges hozzá.' },
      { label: 'Rotation', desc: 'A gumiabroncs forgásirányát jelöli. Fontos a helyes felszerelésnél.' },
      { label: 'Outside / Inside', desc: 'Aszimmetrikus gumiabroncs külső és belső oldalának jelölése.' },
      { label: 'Treadwear 280', desc: 'Kopásállóság. Minél magasabb a szám, annál lassabban kopik a gumi.' },
      { label: 'Traction A', desc: 'Tapadás száraz úton. AA (legjobb), A, B, C (legrosszabb).' },
      { label: 'Temperature A', desc: 'Hőállóság. A (legjobb), B, C.' },
    ],
  },
];

export default async function TireMarkingsPage({ params }: { params: { lang: string } }) {
  const dict = getDictionary(params.lang);
  const [settings, navigation] = await Promise.all([getSettings(), getNavigation()]);

  return (
    <>
      <StructuredData type="WebPage" />
      <Header settings={settings} navigation={navigation} lang={params.lang} dict={dict} />
      <main>
        <section className="bg-slate-900 pt-32 pb-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <span className="text-red-400 font-semibold text-sm uppercase tracking-wider">Útmutató</span>
            <h1 className="text-4xl md:text-5xl font-black text-white mt-2 mb-4">Gumiabroncs jelölések</h1>
            <p className="text-slate-400 max-w-2xl mx-auto">Részletes útmutató a gumiabroncs oldalfalán lévő összes jelölésről és jelentésükről</p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-10">
              <p className="text-blue-800 text-sm leading-relaxed">
                A gumiabroncs oldalfalán található jelölések rengeteg információt hordoznak a gumi méretéről, teljesítményéről és gyártásáról.
                Ez az útmutató segít megérteni a legfontosabb jelöléseket, hogy a megfelelő gumit választhasd.
              </p>
            </div>

            {sections.map((section, idx) => (
              <div key={idx} className="mb-10">
                <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-3xl">{section.icon}</span>
                  {section.title}
                </h2>
                <div className="grid gap-3">
                  {section.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-4 bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-colors">
                      <div className="shrink-0 w-20 text-center">
                        <span className="inline-block bg-red-600 text-white font-bold text-sm px-3 py-1.5 rounded-lg">{item.label}</span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed pt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 text-white text-center mt-12">
              <h3 className="text-2xl font-black mb-3">Nem biztos a jelölésekben?</h3>
              <p className="mb-6">Hívjon minket és segítünk kiválasztani a megfelelő gumiabroncsot az autójához!</p>
              <a href={`tel:${settings.phone}`} className="inline-flex items-center gap-2 bg-white text-red-600 px-6 py-3 rounded-xl font-bold hover:bg-red-50 transition-colors">
                {settings.phone}
              </a>
            </div>
          </div>
        </section>

        <ContactSection settings={settings} lang={params.lang} dict={dict} />
      </main>
      <Footer settings={settings} navigation={navigation} lang={params.lang} dict={dict} />
    </>
  );
}
