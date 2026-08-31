import { createServiceMetadata, renderServicePage } from '@/components/ServicePageTemplate';
import type { ServicePageConfig } from '@/components/ServicePageTemplate';

export const metadata = {
  title: 'Szezonális gumicsere – Mobil gumiszerviz Budapest | Toldi Mobil Gumi',
  description: 'Professzionális szezonális gumicsere Budapesten és Pest megyében. Nyári és téli gumiabroncsok cseréje a helyszínen, digitális centrírozással. 0-24 órában elérhető!',
};

const config: ServicePageConfig = {
  slug: 'szezonalis-gumicsere',
  title: 'Szezonális Gumicsere',
  metaTitle: 'Szezonális gumicsere – Mobil gumiszerviz Budapest',
  metaDescription: 'Professzionális szezonális gumicsere Budapesten és Pest megyében. Nyári és téli gumiabroncsok cseréje a helyszínen, digitális centrírozással. 0-24 óra.',
  heroTitle: 'Szezonális Gumicsere',
  heroSubtitle: 'Téli és nyári gumiabroncsok cseréje a helyszínen – egyetlen telefonhívásra, professzionális felszereléssel, 0-24 órában.',
  heroIcon: 'Gumicsere',
  intro: 'A szezonális gumicsere az egyik legfontosabb karbantartási feladat, amely biztonságát és közlekedési kényelmét garantálja. A Toldi Mobil Gumi és Klíma teljes körű mobil gumiszervizként működik: nem kell szervizbe mennie, mert mi megyünk Önhöz. Legyen szó téli gumi felszerelésről októberben vagy nyári gumi cseréről tavasszal, csapatunk precíz nyomatékkulccsal, digitális centrírozóval és professzionális hidraulikus emelővel érkezik.',
  benefits: [
    { icon: '🚗', title: 'Mobil kiszállás', desc: 'Nem kell szervizbe mennie – mi jövünk Önhöz, akár otthonra, munkahelyre, vagy az út szélére.' },
    { icon: '🔧', title: 'Professzionális eszközök', desc: 'Digitális centrírozó, hidraulikus emelő, precíz nyomatékkulcs – minden a helyszínen.' },
    { icon: '⏱️', title: '0-24 óra, 365 nap', desc: 'Hétvégén és ünnepnapokon is elérhetőek vagyunk, pótdíj nélkül.' },
    { icon: '💰', title: 'Transzparens árak', desc: 'Rejtett költségek nélkül. Az árak nyilvánosak és előre láthatóak.' },
    { icon: '✅', title: '10+ év tapasztalat', desc: 'Több mint 10.000 elvégzett gumicsere, elégedett ügyfelek ezrei.' },
    { icon: '💳', title: 'Bankkártya elfogadva', desc: 'Készpénz és bankkártya is elfogadott a helyszínen.' },
  ],
  process: [
    { step: '1', title: 'Telefonon időpont egyeztetés', desc: 'Hívjon minket és egyeztessünk időpontot, ami Önnek megfeél. Akár azonnal is kiérkezünk.' },
    { step: '2', title: 'Helyszínre érkezés', desc: 'Mobil szerelőkocsi érkezik a megadott címre, minden szükséges eszközzel.' },
    { step: '3', title: 'Gumicsere elvégzése', desc: 'Lezereljük a régi gumikat, felszereljük az újokat, centrírozzuk a kerekeket.' },
    { step: '4', title: 'Ellenőrzés és fizetés', desc: 'Megellenőrizzük a nyomatékot, a guminyomást, majd készpénzzel vagy bankkártyával fizethet.' },
  ],
  faqItems: [
    { q: 'Mikor kell téli gumit felszerelni?', a: 'Magyarországon november 1-től március 15-ig kötelező a téli gumi használata, ha az út burkolata havas, jeges vagy fagyos. Javasoljuk, hogy október közepe után szereltesse fel a téli gumikat.' },
    { q: 'Mennyi idő alatt kész a gumicsere?', a: 'Egy autó gumicsere átlagosan 30-45 percet vesz igénybe, beleértve a centrírozást is. Több autó esetén arányosan több időre van szükség.' },
    { q: 'Szükséges centrírozás gumicsere után?', a: 'Igen, minden gumicsere után javasoljuk a centrírozást. Ez biztosítja, hogy a kerék egyenletesen forogjon, elkerülve a kormányrázkódást és az egyenetlen kopást.' },
    { q: 'Milyen felni méretekkel dolgoznak?', a: '13"-tól 23"-ig minden felni méretet vállalunk. Az árak a felni mérettől függően változnak.' },
  ],
  showPrices: true,
  showFaq: true,
};

export default async function SzezonalisGumicserePage({ params }: { params: { lang: string } }) {
  return renderServicePage(config, params);
}
