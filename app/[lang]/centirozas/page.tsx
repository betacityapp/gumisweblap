import { renderServicePage } from '@/components/ServicePageTemplate';
import type { ServicePageConfig } from '@/components/ServicePageTemplate';

export const metadata = {
  title: 'Kerékcentírozás – Digitális centrírozás Budapest | Toldi Mobil Gumi',
  description: 'Pontos kerékcentírozás és kiegyensúlyozás modern digitális centrírozóval Budapesten. Megszünteti a kormányrázkódást és egyenetlen gumi kopást.',
};

const config: ServicePageConfig = {
  slug: 'centirozas',
  title: 'Centrírozás',
  metaTitle: 'Kerékcentírozás – Digitális centrírozás Budapest',
  metaDescription: 'Pontos kerékcentírozás és kiegyensúlyozás modern digitális centrírozóval Budapesten. Megszünteti a kormányrázkódást és egyenetlen gumi kopást.',
  heroTitle: 'Kerékcentírozás',
  heroSubtitle: 'Pontos kerékkiegyensúlyozás modern digitális centrírozóval. Megszünteti a kormányrázkódást és az egyenetlen gumiabroncs kopást.',
  heroIcon: 'Centrírozás',
  intro: 'A kerékcentírozás (kiegyensúlyozás) elengedhetetlen a biztonságos és kényelmes közlekedéshez. Ha a kerék nincs kiegyensúlyozva, kormányrázkódás, egyenetlen gumiabroncs kopás és megnövekedett üzemanyag-fogyasztás léphet fel. A Toldi Mobil Gumi és Klíma modern digitális centrírozó géppel dolgozik, amely ezredmásodperc pontossággal méri a kerék egyensúlyát. Minden gumicsere során centrírozást ajánlunk, de külön szolgáltatásként is elvégezzük.',
  benefits: [
    { icon: '⚖️', title: 'Digitális pontosság', desc: 'Modern centrírozó géppel ezredmásodperc pontossággal mérjük és korrigáljuk a kerék egyensúlyát.' },
    { icon: '🚫', title: 'Megszünteti a rázkódást', desc: 'A centrírozás után megszűnik a kormányrázkódás és a kocsi rezgése.' },
    { icon: '🛞', title: 'Egyenletes kopás', desc: 'A kiegyensúlyozott kerék egyenletesen kopik, meghosszabbítva a gumiabroncs élettartamát.' },
    { icon: '⛽', title: 'Alacsonyabb fogyasztás', desc: 'A centrírozott kerék kevesebb üzemanyagot fogyaszt és kevesebb terhelést jelent a futóműnek.' },
    { icon: '⏱️', title: 'Gyors kivitelezés', desc: 'Egy kerék centrírozása 10-15 perc alatt kész.' },
    { icon: '✅', title: 'Minden felni méret', desc: '13"-tól 23"-ig minden felni méretet centrírozunk.' },
  ],
  process: [
    { step: '1', title: 'Kerék leszerelése', desc: 'Leszereljük a kereket a járműről.' },
    { step: '2', title: 'Centrírozó gép', desc: 'Felhelyezzük a keréket a digitális centrírozó gépre, amely méri az egyensúlyhiányt.' },
    { step: '3', title: 'Súlyok felhelyezése', desc: 'A mérés alapján pontos súlyokat helyezünk fel a felnin az egyensúly eléréséhez.' },
    { step: '4', title: 'Visszaszerelés', desc: 'Visszaszereljük a kereket, ellenőrizzük a nyomatékot.' },
  ],
  faqItems: [
    { q: 'Mikor kell centrírozni?', a: 'Minden gumicsere után javasolt a centrírozás. Emellett, ha kormányrázkódást, vagy egyenetlen gumi kopást tapasztal, szintén centrírozásra van szükség.' },
    { q: 'Mennyi ideig tart?', a: 'Egy kerék centrírozása 10-15 percet vesz igénybe. Négy kerék esetén 40-60 perc.' },
    { q: 'Minden gumicserénél elvégzik?', a: 'Igen, minden gumicsere során javasoljuk és elvégezzük a centrírozást, de külön szolgáltatásként is igénybe vehető.' },
    { q: 'Mennyibe kerül?', a: 'A centrírozás ára a felni mérettől függ. Részletes árlistánk az árlista szekcióban található.' },
  ],
  showPrices: true,
  showFaq: true,
};

export default async function CentirozasPage({ params }: { params: { lang: string } }) {
  return renderServicePage(config, params);
}
