import { createServiceMetadata, renderServicePage } from '@/components/ServicePageTemplate';
import type { ServicePageConfig } from '@/components/ServicePageTemplate';

export const metadata = {
  title: 'Defektjavítás helyszínen – SOS gumiszerviz Budapest | Toldi Mobil Gumi',
  description: 'Váratlan defekt? Helyszíni defektjavítás Budapesten és Pest megyében, autópályán is! SOS segítség 0-24 órában, villámgyors kiszállás.',
};

const config: ServicePageConfig = {
  slug: 'defektjavitas',
  title: 'Defektjavítás',
  metaTitle: 'Defektjavítás helyszínen – SOS gumiszerviz Budapest',
  metaDescription: 'Váratlan defekt? Helyszíni defektjavítás Budapesten és Pest megyében, autópályán is! SOS segítség 0-24 órában, villámgyors kiszállás.',
  heroTitle: 'Defektjavítás Helyszínen',
  heroSubtitle: 'Váratlan defekt az úton? Villámgyorsan a helyszínre érkezünk és elvégezzük a javítást – az autópályán is! SOS segítség éjjel-nappal.',
  heroIcon: 'SOS',
  intro: 'A defekt az egyik leggyakoribb közlekedési probléma, ami mindig a legalkalmatlanabb pillanatban érkezik. A Toldi Mobil Gumi és Klíma SOS defektjavító szolgáltatása 0-24 órában, 365 naposan áll rendelkezésére. Nem kell várnia a vontatóra vagy a szervizre – mobil szerelőkocsink a helyszínre érkezik, és a defektjavítást az út szélén elvégezzük. Legyen szó személyautóról, kisteherautóról vagy autópályán történt defektről, csapatunk felkészült minden helyzetre.',
  benefits: [
    { icon: '🚨', title: 'SOS azonnali kiszállás', desc: 'Defekt esetén egyetlen telefonhívásra indulunk – legtöbb helyszínre 30 percen belül kiérkezünk.' },
    { icon: '🛣️', title: 'Autópályán is', desc: 'Vállaljuk defektjavítást az M0, M5, M6, M7 és minden autópályán, non-stop.' },
    { icon: '🔧', title: 'Szakmai javítás', desc: 'Peremtömítéssel, defektűrővel, vagy ha kell, gumiabroncs cserével – minden a helyszínen.' },
    { icon: '⏱️', title: '0-24, 365 nap', desc: 'Éjjel-nappal, hétvégén és ünnepnapokon is elérhetőek vagyunk.' },
    { icon: '💰', title: 'Transzparens árak', desc: 'Előre látható árazás, rejtett költségek nélkül. A kiszállás Budapesten belül ingyenes.' },
    { icon: '✅', title: '10+ év tapasztalat', desc: 'Több ezer sikeres defektjavítás, minden típusú gumiabronccsal.' },
  ],
  process: [
    { step: '1', title: 'SOS hívás', desc: 'Hívjon minket és adja meg a pontos helyszínt. Azonnal indulunk.' },
    { step: '2', title: 'Helyszíni felmérés', desc: 'Megérkezünk és felmérjük a defekt súlyosságát. Tájékoztatjuk a javítás módjáról és költségéről.' },
    { step: '3', title: 'Defektjavítás', desc: 'Elvégezzük a javítást – peremtömítéssel, defektűrővel vagy gumiabroncs cserével.' },
    { step: '4', title: 'Tesztelés és fizetés', desc: 'Ellenőrizzük a guminyomást, a javítás minőségét, majd készpénzzel vagy bankkártyával fizethet.' },
  ],
  faqItems: [
    { q: 'Mennyibe kerül a defektjavítás?', a: 'A defektjavítás ára a jármű típusától és a helyszíntől függ. Személyautó esetén Budapesten belül 25.000 Ft-tól indul. Autópályán pótdíjat számolunk fel.' },
    { q: 'Minden defekt javítható?', a: 'A legtöbb defekt javítható, de ha a gumiabroncs szerkezete sérült (pl. oldalfal szakadás), akkor cserére van szükség. A helyszínen tájékoztatjuk a lehetőségekről.' },
    { q: 'Autópályán is kijönnek?', a: 'Igen, az összes magyar autópályán vállalunk defektjavítást. Non-stop elérhetőek vagyunk, éjjel-nappal.' },
    { q: 'Mennyi idő alatt érnek ki?', a: 'Budapesten belül átlagosan 30 percen belül kiérkezünk. Pest megye távolabbi pontjain 45-60 perc.' },
  ],
  showPrices: true,
  showFaq: true,
};

export default async function DefektjavitasPage({ params }: { params: { lang: string } }) {
  return renderServicePage(config, params);
}
