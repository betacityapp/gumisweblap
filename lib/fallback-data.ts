import type {
  SiteSettings,
  NavigationItem,
  Page,
  BlogPost,
  Testimonial,
  FaqItem,
  PriceItem,
  Service,
} from './types';

export const FALLBACK_SETTINGS: SiteSettings = {
  site_name: 'Toldi Mobil Gumi és Klíma',
  site_description:
    'Professzionális mobil gumiszerviz és autóklíma töltés Budapesten és Pest megyében. 0-24 órában, az év 365 napján.',
  phone: '+36 30 582 0870',
  phone_2: '+36 30 411 1173',
  email: 'info@toldimobilgumi.hu',
  address: 'Budapest és Pest megye',
  working_hours: '0-24, az év minden napján',
  footer_copyright: '© 2025 ToldiTyre kft',
  google_analytics: '',
  hero_title: 'Mobil Gumiszerviz Budapesten és Pest Megyében',
  hero_subtitle:
    'Szezonális gumicsere, defektjavítás, klímatöltés – oda megyünk, ahol Ön van! 0-24 órában, az év 365 napján.',
  hero_image: 'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg',
  admin_password: 'toldi@admin',
};

export const FALLBACK_NAVIGATION: NavigationItem[] = [
  { id: '1', label: 'Főoldal', url: '/', parent_id: null, sort_order: 1, is_active: true, target: '_self', created_at: '', children: [] },
  {
    id: '2', label: 'Szolgáltatások', url: '#', parent_id: null, sort_order: 2, is_active: true, target: '_self', created_at: '',
    children: [
      { id: '7', label: 'Gumicsere', url: '/gumicsere', parent_id: '2', sort_order: 1, is_active: true, target: '_self', created_at: '' },
      { id: '8', label: 'Defektjavítás', url: '/defektjavitas', parent_id: '2', sort_order: 2, is_active: true, target: '_self', created_at: '' },
      { id: '9', label: 'Klímatöltés', url: '/klimatoltes', parent_id: '2', sort_order: 3, is_active: true, target: '_self', created_at: '' },
      { id: '10', label: 'Centrírozás', url: '/centrozas', parent_id: '2', sort_order: 4, is_active: true, target: '_self', created_at: '' },
      { id: '11', label: 'Autómentés', url: '/automentes', parent_id: '2', sort_order: 5, is_active: true, target: '_self', created_at: '' },
      { id: '12', label: 'Flottakezelés', url: '/flottakezeles', parent_id: '2', sort_order: 6, is_active: true, target: '_self', created_at: '' },
    ],
  },
  { id: '3', label: 'Árlista', url: '/arlista', parent_id: null, sort_order: 3, is_active: true, target: '_self', created_at: '', children: [] },
  { id: '4', label: 'Blog', url: '/blog', parent_id: null, sort_order: 4, is_active: true, target: '_self', created_at: '', children: [] },
  { id: '5', label: 'Rólunk', url: '/rolunk', parent_id: null, sort_order: 5, is_active: true, target: '_self', created_at: '', children: [] },
  { id: '6', label: 'Kapcsolat', url: '/kapcsolat', parent_id: null, sort_order: 6, is_active: true, target: '_self', created_at: '', children: [] },
  {
    id: '13', label: 'Hasznos infók', url: '#', parent_id: null, sort_order: 7, is_active: true, target: '_self', created_at: '',
    children: [
      { id: '14', label: 'Gumiméret kereső', url: '/gumimeretek', parent_id: '13', sort_order: 1, is_active: true, target: '_self', created_at: '' },
      { id: '15', label: 'Klíma adatbázis', url: '/klima-adatbazis', parent_id: '13', sort_order: 2, is_active: true, target: '_self', created_at: '' },
      { id: '16', label: 'Gumi-autó kereső', url: '/gumi-auto-kereses', parent_id: '13', sort_order: 3, is_active: true, target: '_self', created_at: '' },
      { id: '17', label: 'Gumiméret váltó', url: '/gumimeret-valto', parent_id: '13', sort_order: 4, is_active: true, target: '_self', created_at: '' },
    ],
  },
];

export const FALLBACK_SERVICES: Service[] = [
  { id: '1', title: 'Szezonális Gumicsere', description: 'Nyári és téli gumiabroncsok professzionális cseréje az Ön által megjelölt helyszínen. Precíz nyomatékkulccsal, digitális centrírozással.', icon: 'rotate-cw', badge: '0-24', sort_order: 1, is_active: true, created_at: '' },
  { id: '2', title: 'Defektjavítás', description: 'Váratlan defekt az úton? Villámgyorsan a helyszínre érkezünk és elvégezzük a javítást – az autópályán is! SOS segítség éjjel-nappal.', icon: 'alert-triangle', badge: 'SOS', sort_order: 2, is_active: true, created_at: '' },
  { id: '3', title: 'Autóklíma Töltés', description: 'Professzionális autóklíma töltés és diagnosztika. R134a rendszerek töltése, ellenőrzése és hibafelmérése modern gépekkel.', icon: 'thermometer', badge: null, sort_order: 3, is_active: true, created_at: '' },
  { id: '4', title: 'Centrírozás', description: 'Pontos kerékkiegyensúlyozás modern digitális centrírozóval. Minden gumicserénél ajánlott a centrírozás elvégzése.', icon: 'circle', badge: null, sort_order: 4, is_active: true, created_at: '' },
  { id: '5', title: 'Autómentés', description: 'Partnerünkkel trélerrel és mentőautóval érkezünk. Sok esetben a mobil gumiszerviz kiválthatja a drága autómentőt!', icon: 'truck', badge: null, sort_order: 5, is_active: true, created_at: '' },
  { id: '6', title: 'Flottakezelés', description: 'Állandó és flottás partnereink kedvezményes árakon vehetik igénybe szolgáltatásainkat. Rugalmas fizetési lehetőségek cégeknek.', icon: 'briefcase', badge: 'Cégeknek', sort_order: 6, is_active: true, created_at: '' },
];

export const FALLBACK_PRICES: PriceItem[] = [
  { id: '1', category: 'Személyautó szezonális gumicsere', label: '15" -ig', price_from: 5500, price_to: null, unit: 'Ft/kerék', note: null, sort_order: 1, is_active: true, created_at: '' },
  { id: '2', category: 'Személyautó szezonális gumicsere', label: '17" -ig', price_from: 6000, price_to: null, unit: 'Ft/kerék', note: null, sort_order: 2, is_active: true, created_at: '' },
  { id: '3', category: 'Személyautó szezonális gumicsere', label: '19" -ig', price_from: 7000, price_to: null, unit: 'Ft/kerék', note: null, sort_order: 3, is_active: true, created_at: '' },
  { id: '4', category: 'Személyautó szezonális gumicsere', label: '20"', price_from: 8000, price_to: null, unit: 'Ft/kerék', note: null, sort_order: 4, is_active: true, created_at: '' },
  { id: '5', category: 'Személyautó szezonális gumicsere', label: '21"', price_from: 10000, price_to: null, unit: 'Ft/kerék', note: null, sort_order: 5, is_active: true, created_at: '' },
  { id: '6', category: 'Személyautó szezonális gumicsere', label: '22"', price_from: 11000, price_to: null, unit: 'Ft/kerék', note: null, sort_order: 6, is_active: true, created_at: '' },
  { id: '7', category: 'Személyautó szezonális gumicsere', label: '23"', price_from: 12000, price_to: null, unit: 'Ft/kerék', note: null, sort_order: 7, is_active: true, created_at: '' },
  { id: '8', category: 'SOS átszerelés 24 órán belül', label: '19"-ig', price_from: 45000, price_to: null, unit: 'Ft/autó', note: null, sort_order: 8, is_active: true, created_at: '' },
  { id: '9', category: 'SOS átszerelés 24 órán belül', label: '21"-ig', price_from: 55000, price_to: null, unit: 'Ft/autó', note: null, sort_order: 9, is_active: true, created_at: '' },
  { id: '10', category: 'SOS átszerelés 24 órán belül', label: '23"-ig', price_from: 65000, price_to: null, unit: 'Ft/autó', note: null, sort_order: 10, is_active: true, created_at: '' },
  { id: '11', category: 'Egyéb', label: 'Szelep', price_from: 700, price_to: null, unit: 'Ft/db', note: null, sort_order: 11, is_active: true, created_at: '' },
  { id: '12', category: 'Egyéb', label: 'Defektűrő', price_from: 1000, price_to: null, unit: 'Ft/db', note: null, sort_order: 12, is_active: true, created_at: '' },
  { id: '13', category: 'Egyéb', label: 'Peremtömítés / javítás', price_from: 1000, price_to: null, unit: 'Ft/kerék', note: null, sort_order: 13, is_active: true, created_at: '' },
  { id: '14', category: 'Helyszíni defektjavítás', label: 'Személyautó', price_from: 25000, price_to: null, unit: 'Ft-tól', note: null, sort_order: 14, is_active: true, created_at: '' },
  { id: '15', category: 'Helyszíni defektjavítás', label: 'Kisteherautó 3.5T-ig', price_from: 30000, price_to: null, unit: 'Ft-tól', note: null, sort_order: 15, is_active: true, created_at: '' },
  { id: '16', category: 'Helyszíni defektjavítás', label: 'Budapesten kívül', price_from: 380, price_to: null, unit: 'Ft/km', note: null, sort_order: 16, is_active: true, created_at: '' },
  { id: '17', category: '19:00 után', label: 'Személyautó', price_from: 30000, price_to: null, unit: 'Ft-tól', note: null, sort_order: 17, is_active: true, created_at: '' },
  { id: '18', category: '19:00 után', label: 'Kisteherautó 3.5T-ig', price_from: 35000, price_to: null, unit: 'Ft-tól', note: null, sort_order: 18, is_active: true, created_at: '' },
  { id: '19', category: '19:00 után', label: 'Autópályán', price_from: 5000, price_to: null, unit: 'Ft pótdíj', note: null, sort_order: 19, is_active: true, created_at: '' },
];

export const FALLBACK_TESTIMONIALS: Testimonial[] = [
  { id: '1', name: 'Kovács Péter', text: 'Defektet kaptam az M7-esen hajnali 2-kor. 40 percen belül ott voltak, profi munkát végeztek. Hihetetlen gyorsaság és kedvesség!', rating: 5, date: '2024 december', is_active: true, sort_order: 1, created_at: '' },
  { id: '2', name: 'Horváth Mária', text: 'Szezonális gumicserét csináltattam náluk a garázsomban. Nem kellett sehova mennem, nem kellett sorba állni. Tökéletes megoldás!', rating: 5, date: '2024 november', is_active: true, sort_order: 2, created_at: '' },
  { id: '3', name: 'Szabó András', text: 'Már harmadik éve cseréltetem náluk a gumikat. Mindig pontos, gyors és korrekt áron. A flottás kedvezmény is fantasztikus.', rating: 5, date: '2024 október', is_active: true, sort_order: 3, created_at: '' },
  { id: '4', name: 'Nagy Eszter', text: 'A klímatöltés is hibátlan volt. Odajöttek a munkahelyemre, 20 perc alatt megcsinálták. Nem kellett egy napot elvesztenem szervizben.', rating: 5, date: '2024 szeptember', is_active: true, sort_order: 4, created_at: '' },
  { id: '5', name: 'Tóth Gábor', text: 'Vasárnap délelőtt kaptam defektet. Azt hittem, ott van a hétvégém. Egy óra sem telt el, és már gurulhattam tovább. Szuperek!', rating: 5, date: '2024 augusztus', is_active: true, sort_order: 5, created_at: '' },
  { id: '6', name: 'Kiss Zsuzsanna', text: 'Meglepett, hogy ilyen gyorsan ki tudtak jönni és ennyire szakszerűen végezték a munkát. Az ár is teljesen fair volt.', rating: 5, date: '2024 július', is_active: true, sort_order: 6, created_at: '' },
];

export const FALLBACK_FAQ: FaqItem[] = [
  { id: '1', question: 'Mennyibe kerül a mobil gumiszerviz?', answer: 'A személyautó szezonális gumicsere 15"-ig 5.500 Ft/kerék, 17"-ig 6.000 Ft/kerék. Minimális szerelési díjunk 20.000 Ft. Hívjon: +36 30 582 0870.', sort_order: 1, is_active: true, created_at: '' },
  { id: '2', question: 'Mennyi idő alatt érnek ki?', answer: 'Átlag 45 perc Budapesten belül. Pest megyében 30-60 perc, az autópálya közelségétől függően.', sort_order: 2, is_active: true, created_at: '' },
  { id: '3', question: 'Hétvégén és éjjel is elérhetők?', answer: 'Igen! 0-24 órában, az év 365 napján elérhető vagyunk – hétvégén és ünnepnapokon is, pótdíj nélkül.', sort_order: 3, is_active: true, created_at: '' },
  { id: '4', question: 'Milyen autókhoz vállalnak munkát?', answer: 'Személyautókhoz, SUV-okhoz, terepjárókhoz, kisteherautókhoz és furgonokhoz – 21 colos felniméretig. Autópályán is vállalunk defektjavítást.', sort_order: 4, is_active: true, created_at: '' },
  { id: '5', question: 'Miért jobb a mobil gumiszerviz az autómentőnél?', answer: 'Az autómentő alapdíja többtízezer forint, amihez még a szervizben végzett javítás díja is hozzáadódik. A mobil gumiszerviz defektjavítási díja ennél jelentősen alacsonyabb, és magában foglalja a kiszállást és a javítást.', sort_order: 5, is_active: true, created_at: '' },
  { id: '6', question: 'Van-e lehetőség előre időpontot foglalni?', answer: 'Igen! Telefonon (+36 30 582 0870) időpontot foglalhat szezonális gumicserére. Sürgős defektjavítás esetén azonnal küldjük a szerelőt.', sort_order: 6, is_active: true, created_at: '' },
];

export const FALLBACK_BLOG_POSTS: BlogPost[] = [
  {
    id: '1', slug: 'mikor-cserelj-teli-gumira', lang: 'hu', title: 'Mikor érdemes téli gumira váltani?',
    excerpt: 'Sokan csak az első hóeséskor gondolnak a téli gumi cseréjére, de ez már késő lehet. Mutatjuk, mikor kell valójában átváltani!',
    content_html: '<p>Az ökölszabály egyszerű: ha a napi átlaghőmérséklet tartósan 7°C alá csökken, itt az ideje a téli gumira váltásnak.</p>',
    featured_image: 'https://images.pexels.com/photos/1619585/pexels-photo-1619585.jpeg',
    tags: ['gumicsere', 'téli gumi', 'tippek'], meta_title: null, meta_description: null,
    author: 'Toldi Mobil Gumi', city: null, story_prompt: null, story_image_url: null, is_published: true, published_at: '2024-10-15T00:00:00Z', created_at: '', updated_at: '',
  },
  {
    id: '2', slug: 'defekt-az-uton-mit-tegyunk', lang: 'hu', title: 'Defektet kaptam az úton – mit tegyek?',
    excerpt: 'Defekt esetén sok autós pánikba esik. Megmutatjuk, hogyan kell biztonságosan eljárni, és miért a mobil gumiszerviz a legjobb megoldás.',
    content_html: '<p>Legyen szó városban vagy autópályán, a defekt mindig váratlanul ér. Fontos, hogy ne essen pánikba.</p>',
    featured_image: 'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg',
    tags: ['defekt', 'tanácsok', 'biztonság'], meta_title: null, meta_description: null,
    author: 'Toldi Mobil Gumi', city: null, story_prompt: null, story_image_url: null, is_published: true, published_at: '2024-11-01T00:00:00Z', created_at: '', updated_at: '',
  },
  {
    id: '3', slug: 'autoklimatolas-miert-fontos', lang: 'hu', title: 'Autóklíma töltés – miért ne halassza el?',
    excerpt: 'Az autóklíma rendszer évente 5-10% hűtőközeget veszít. Ha nem tölteti fel időben, nemcsak a kényelme, de az egészsége is veszélybe kerülhet.',
    content_html: '<p>Az autóklíma rendszerek nem légmentesen zárt rendszerek – évente természetes módon 5-10% hűtőközeget veszítenek.</p>',
    featured_image: 'https://images.pexels.com/photos/6870300/pexels-photo-6870300.jpeg',
    tags: ['klíma', 'autóklíma', 'karbantartás'], meta_title: null, meta_description: null,
    author: 'Toldi Mobil Gumi', city: null, story_prompt: null, story_image_url: null, is_published: true, published_at: '2024-11-20T00:00:00Z', created_at: '', updated_at: '',
  },
];

export const FALLBACK_PAGES: Page[] = [
  {
    id: 'rolunk', slug: 'rolunk', lang: 'hu', title: 'Rólunk',
    meta_title: 'Rólunk – Toldi Mobil Gumiszerviz', meta_description: 'Ismerje meg a Toldi Mobil Gumiszerviz csapatát. 2018 óta nyújtunk professzionális helyszíni gumiszerelés szolgáltatást.', meta_keywords: null,
    hero_title: 'Rólunk – Toldi Mobil Gumiszerviz', hero_subtitle: 'Több mint 10 éve nyújtunk professzionális helyszíni gumiszerelés szolgáltatást Budapesten és Pest megyében', hero_image: null,
    content_html: `<h2>Toldi Mobil Gumiszerviz – Mindig Úton, Önért!</h2>
<p>Üdvözöljük a Toldi Mobil Gumiszerviznél, ahol a szolgáltatás nem ismer határokat. 2018 óta az Ön megbízható társa vagyunk az úton, legyen szó gumicseréről vagy autójavításról. Büszkén jelenthetjük ki, hogy <strong>több mint 10.000 autót szereltünk át</strong>, és <strong>több ezret megjavítottunk</strong>, mindezt a legmagasabb színvonalon és precizitással.</p>
<p>Nonstop rendelkezésre állásunkkal biztosítjuk, hogy bármikor, bármilyen helyzetben számíthat ránk. A mobil gumiszerviz szolgáltatásaink gyorsak, hatékonyak és mindenekelőtt kényelmesek az Ön számára.</p>
<h2>Miért válasszon minket?</h2>
<ul>
<li>10+ év szakmai tapasztalat</li>
<li>0-24 óra elérhetőség, az év 365 napján</li>
<li>Átlag 45 perces kiérkezési idő Budapesten</li>
<li>Modern, profi felszerelés</li>
<li>Transzparens, rejtett díjak nélküli árazás</li>
</ul>`,
    page_sections: ['hero', 'contact'], city: null, is_city_page: false, is_published: true, sort_order: 2, show_reviews: false, show_comments: false, layout_variant: 'default', created_at: '', updated_at: '',
  },
];
