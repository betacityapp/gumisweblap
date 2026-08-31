import { renderServicePage } from '@/components/ServicePageTemplate';
import type { ServicePageConfig } from '@/components/ServicePageTemplate';

export const metadata = {
  title: 'Autómentés Budapest és Pest megye – Partner: Bakos Autómentés | Toldi Mobil Gumi',
  description: 'Autómentés Budapesten és Pest megyében megbízható partnerünkön, a Bakos Autómentésen keresztül. Darus autómentő, tréleres szállítás 0-24 órában.',
};

const config: ServicePageConfig = {
  slug: 'automentes',
  title: 'Autómentés',
  metaTitle: 'Autómentés Budapest és Pest megye – Bakos Autómentés partner',
  metaDescription: 'Autómentés Budapesten és Pest megyében megbízható partnerünkön, a Bakos Autómentésen keresztül. Darus autómentő, tréleres szállítás 0-24 órában.',
  heroTitle: 'Autómentés',
  heroSubtitle: 'Lerobbant az autója? Autómentéshez megbízható partnerünket, a Bakos Autómentést ajánljuk. 0-24 óra, non-stop, Budapest és Pest megye teljes területén.',
  heroIcon: 'Autómentés',
  intro: 'A Toldi Mobil Gumi és Klíma elsősorban mobil gumiszervizként működik, de sok esetben a defekt vagy a gumiabroncs probléma autómentést is igényel. Ilyen esetekben megbízható partnerünket, a Bakos Autómentést ajánljuk. A Bakos Autómentés 0-24 órában, non-stop elérhető Budapesten és Pest megye teljes területén – legtöbb helyszínre 30 percen belül kiérkeznek. Személyautó mentés, furgon és kisteherautó szállítás, darus autómentő, bikázás, autópálya mentés – minden szolgáltatás egy helyen.',
  benefits: [
    { icon: '🚛', title: 'Tréleres autómentés', desc: 'Modern trélerrel és mentőautóval érkeznek, biztonságos szállítás a kívánt szervizbe vagy címre.' },
    { icon: '🏗️', title: 'Darus autómentő', desc: 'Árokba borult vagy nehezen hozzáférhető járművek biztonságos kiemelése daruval és csörlővel.' },
    { icon: '🔋', title: 'Bikázás', desc: 'Lemerült akkumulátor esetén azonnali segítség professzionális bikázó eszközökkel.' },
    { icon: '🛣️', title: 'Autópálya mentés', desc: 'Non-stop kiszállás az M0, M5, M6, M7 és további autópályák teljes hosszán.' },
    { icon: '⏱️', title: '30 perc kiérkezés', desc: 'Legtöbb helyszínre 30 percen belül kiérkeznek Pest megye területén.' },
    { icon: '✅', title: 'Megbízható partner', desc: 'A Bakos Autómentés több éves tapasztalattal és professzionális felszereléssel dolgozik.' },
  ],
  process: [
    { step: '1', title: 'Hívjon minket vagy a partnert', desc: 'Ha autómentésre van szüksége, hívjon minket és mi kapcsoljuk a Bakos Autómentést, vagy keresheti őket közvetlenül.' },
    { step: '2', title: 'Helyszín megadása', desc: 'Adja meg a pontos helyszínt és a jármű típusát. Azonnal indulnak.' },
    { step: '3', title: 'Autómentés', desc: 'A megfelelő felszereléssel (tréler, daru, csörlő) elvégzik a mentést.' },
    { step: '4', title: 'Szállítás', desc: 'A járművet a megadott szervizbe vagy címre szállítják.' },
  ],
  faqItems: [
    { q: 'Mennyibe kerül az autómentés?', a: 'Az autómentés ára a helyszíntől és a jármű típusától függ. Pontos árajánlatért keresse a Bakos Autómentést közvetlenül a weboldalukon: https://bakosautomentes.hu/' },
    { q: 'Mennyi idő alatt érnek ki?', a: 'Budapesten és Pest megye legtöbb pontján 30 percen belül kiérkeznek.' },
    { q: 'Darus autómentő is van?', a: 'Igen, a Bakos Autómentés darus autómentővel is rendelkezik árokba borult vagy nehezen hozzáférhető járművek kiemeléséhez.' },
    { q: 'Autópályán is kijönnek?', a: 'Igen, non-stop kiszállás az M0, M5, M6, M7 és további autópályák teljes hosszán.' },
  ],
  showTowing: true,
  showPrices: false,
  showFaq: true,
};

export default async function AutomentesPage({ params }: { params: { lang: string } }) {
  return renderServicePage(config, params);
}
