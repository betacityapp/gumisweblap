import { renderServicePage } from '@/components/ServicePageTemplate';
import type { ServicePageConfig } from '@/components/ServicePageTemplate';

export const metadata = {
  title: 'Autóklíma töltés és diagnosztika Budapest | Toldi Mobil Gumi',
  description: 'Professzionális autóklíma töltés, diagnosztika és javítás Budapesten. R134a rendszerek töltése, hibafelmérés modern gépekkel. 0-24 óra.',
};

const config: ServicePageConfig = {
  slug: 'autoklima-toltes',
  title: 'Autóklíma Töltés',
  metaTitle: 'Autóklíma töltés és diagnosztika Budapest',
  metaDescription: 'Professzionális autóklíma töltés, diagnosztika és javítás Budapesten. R134a rendszerek töltése, hibafelmérés modern gépekkel. 0-24 óra.',
  heroTitle: 'Autóklíma Töltés és Diagnosztika',
  heroSubtitle: 'Professzionális autóklíma töltés és diagnosztika modern gépekkel. R134a rendszerek töltése, ellenőrzése és hibafelmérése – a helyszínen.',
  heroIcon: 'Klíma',
  intro: 'A megfelelően működő autóklíma nem csak a nyári kényelmet biztosítja, hanem a biztonságos közlekedést is. A Toldi Mobil Gumi és Klíma teljes körű autóklíma szolgáltatást nyújt: töltés, diagnosztika, hibafelmérés és javítás. Modern klímagépeinkkel R134a rendszerek töltését és ellenőrzését végezzük, akár a helyszínen is. Csapatunk több ezer sikeres klímatöltést végzett, és minden típusú járműhöz érti a klímarendszer sajátosságait.',
  benefits: [
    { icon: '❄️', title: 'R134a töltés', desc: 'Modern klímagépekkel végezzük az R134a hűtőközeg töltését, pontos mennyiség mérésével.' },
    { icon: '🔍', title: 'Diagnosztika', desc: 'Teljes körű hibafelmérés: nyomásmérés, szivárgásvizsgálat, kompresszor ellenőrzés.' },
    { icon: '🔧', title: 'Javítás is', desc: 'Nem csak töltünk – a klímarendszer hibáit is megtaláljuk és javítjuk.' },
    { icon: '🚗', title: 'Mobil szolgáltatás', desc: 'A helyszínen is elvégezzük a klímatöltést és diagnosztikát.' },
    { icon: '⏱️', title: 'Gyors kivitelezés', desc: 'Egy átlagos klímatöltés 30-45 perc alatt kész.' },
    { icon: '✅', title: 'Garancia', desc: 'Munkánkra garanciát vállalunk.' },
  ],
  process: [
    { step: '1', title: 'Időpont egyeztetés', desc: 'Hívjon minket és egyeztessünk időpontot a klímatöltésre.' },
    { step: '2', title: 'Diagnosztika', desc: 'Ellenőrizzük a klímarendszer állapotát, nyomást, szivárgást.' },
    { step: '3', title: 'Töltés', desc: 'Modern géppel elvégezzük a hűtőközeg pontos töltését.' },
    { step: '4', title: 'Tesztelés', desc: 'Ellenőrizzük a klíma működését, hűtési teljesítményét.' },
  ],
  faqItems: [
    { q: 'Milyen gyakran kell klímát tölteni?', a: 'Általában 2-3 évente ajánlott a klímatöltés, de ha a hűtés teljesítménye csökken, előbb is szükség lehet rá. Évente javasolt a klíma ellenőrzése.' },
    { q: 'Mennyi ideig tart a klímatöltés?', a: 'Egy átlagos klímatöltés diagnosztikával együtt 30-45 percet vesz igénybe.' },
    { q: 'Milyen hűtőközeget használnak?', a: 'R134a hűtőközeget használunk, amely a legtöbb modern járműben megtalálható. R1234yf rendszerek esetén egyeztetés szükséges.' },
    { q: 'A helyszínen is elvégzik?', a: 'Igen, mobil szolgáltatás keretében a helyszínen is elvégezzük a klímatöltést és diagnosztikát.' },
  ],
  showPrices: false,
  showFaq: true,
};

export default async function AutoklimaToltesPage({ params }: { params: { lang: string } }) {
  return renderServicePage(config, params);
}
