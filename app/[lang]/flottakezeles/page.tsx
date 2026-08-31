import { renderServicePage } from '@/components/ServicePageTemplate';
import type { ServicePageConfig } from '@/components/ServicePageTemplate';

export const metadata = {
  title: 'Flottakezelés és céges gumiszerviz Budapest | Toldi Mobil Gumi',
  description: 'Állandó és flottás partnereink kedvezményes árakon vehetik igénybe mobil gumiszerviz szolgáltatásainkat. Rugalmas fizetés cégeknek, számlázás, flottakezelés.',
};

const config: ServicePageConfig = {
  slug: 'flottakezeles',
  title: 'Flottakezelés',
  metaTitle: 'Flottakezelés és céges gumiszerviz Budapest',
  metaDescription: 'Állandó és flottás partnereink kedvezményes árakon vehetik igénybe mobil gumiszerviz szolgáltatásainkat. Rugalmas fizetés cégeknek, számlázás, flottakezelés.',
  heroTitle: 'Flottakezelés Cégeknek',
  heroSubtitle: 'Állandó és flottás partnereink kedvezményes árakon, rugalmas fizetési lehetőségekkel vehetik igénybe mobil gumiszerviz szolgáltatásainkat.',
  heroIcon: 'Cégeknek',
  intro: 'Ha céges flottát kezel – legyen az 5 vagy 50 autó – a Toldi Mobil Gumi és Klíma különleges feltételeket kínál. Flottás partnereink kedvezményes árakon, havi számlázással, rugalmas időpont-egyeztetéssel és dedikált kapcsolattartóval vehetik igénybe szolgáltatásainkat. Nem kell minden autót külön szervizbe vinni – mi kimegyünk a cég telephelyére, és egy helyben elvégezzük az összes autó gumicserejét, centrírozását, klímatöltését. Ez időt és pénzt takarít meg, és minimalizálja a flotta üzemképtelenségét.',
  benefits: [
    { icon: '🏢', title: 'Telephelyre kiszállás', desc: 'Kimegyünk a cég telephelyére és egy helyben elvégezzük az összes autó szolgáltatását.' },
    { icon: '💰', title: 'Kedvezményes árak', desc: 'Flottás partnereink kedvezményes árakon vehetik igénybe a szolgáltatásokat.' },
    { icon: '📄', title: 'Havi számlázás', desc: 'Rugalmas fizetési feltételek, havi összesített számlázás cégeknek.' },
    { icon: '📅', title: 'Rugalmas időpontok', desc: 'A cég ütemtervéhez igazodunk – hétvégén vagy munkaidőn kívül is.' },
    { icon: '👤', title: 'Dedikált kapcsolattartó', desc: 'Flottás partnereinknek dedikált kapcsolattartót biztosítunk.' },
    { icon: '🔧', title: 'Teljes körű szolgáltatás', desc: 'Gumicsere, centrírozás, klímatöltés, defektjavítás – minden egy helyen.' },
  ],
  process: [
    { step: '1', title: 'Ajánlatkérés', desc: 'Vegye fel velünk a kapcsolatot és adjanak meg a flotta adatait (autók száma, típusok, szolgáltatások).' },
    { step: '2', title: 'Szerződés', desc: 'Egyeztetett feltételek mellett szerződést kötünk, kedvezményes árazással.' },
    { step: '3', title: 'Telephelyre érkezés', desc: 'A megbeszélt időpontban kimegyünk a cég telephelyére a mobil szerelőkocsival.' },
    { step: '4', title: 'Havi számlázás', desc: 'A havi elvégzett munkákról összesített számlát állítunk ki.' },
  ],
  faqItems: [
    { q: 'Milyen kedvezményt kapnak a flottás partnerek?', a: 'A kedvezmény mértéke a flotta méretétől és a szolgáltatások volumenétől függ. Egyedi ajánlatot készítünk minden cég számára. Vegye fel velünk a kapcsolatot!' },
    { q: 'Hány autótól érdemes flottás szerződést kötni?', a: 'Általában 3-5 autótól már érdemes flottás szerződést kötni, de minden esetben egyedileg értékeljük.' },
    { q: 'Havi számlázás lehetséges?', a: 'Igen, flottás partnereinknek havi összesített számlázást biztosítunk, ami egyszerűsíti a cég adminisztrációját.' },
    { q: 'Milyen szolgáltatásokat vállalnak flottás keretben?', a: 'Gumicsere, centrírozás, klímatöltés, defektjavítás – minden, amit egyéni ügyfeleknek is, de kedvezményesebb áron.' },
  ],
  showPrices: true,
  showFaq: true,
};

export default async function FlottakezelesPage({ params }: { params: { lang: string } }) {
  return renderServicePage(config, params);
}
