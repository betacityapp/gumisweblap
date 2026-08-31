# Toldi Mobil Gumi – Telepítési Útmutató (Vercel + Supabase)

Ez az útmutató lépésről lépésre bemutatja, hogyan indítsd el a weblapot Vercelen és hogyan állítsd be a Supabase adatbázist az összes táblával és RLS szabállyal.

---

## 1. Supabase adatbázis beállítása

### 1.1. Supabase projekt létrehozása

1. Menj a https://supabase.com oldalra és jelentkezz be
2. Kattints a **New Project** gombra
3. Adj nevet a projektnek (pl. `toldi-mobil-gumi`)
4. Válassz régiót (EU Central – Frankfurt ajánlott)
5. Generálj egy erős jelszót az adatbázishoz
6. Kattints a **Create new project** gombra
7. Várd meg amíg a projekt elindul (1-2 perc)

### 1.2. API kulcsok beszerzése

1. A Supabase dashboardon menj a **Settings > API** menübe
2. Másold ki a következő értékeket:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (hosszú string)
   - **service_role key**: `eyJhbGc...` (hosszú string – TITKOS!)

### 1.3. Adatbázis táblák létrehozása

A projektben már szerepelnek a migrációk a `supabase/migrations/` mappában. Ha új Supabase projektet hozol létre, ezeket manuálisan kell lefuttatni:

1. A Supabase dashboardon menj a **SQL Editor** menübe
2. Nyisd meg és másold be a következő fájlok tartalmát (egyenként, sorrendben):

   **Fontos: A fájlokat a `supabase/migrations/` mappában találod. Másold be a tartalmukat az SQL Editorba és futtasd le őket!**

   1. `20260714082611_create_cms_schema.sql` – CMS alap táblák (pages, blog_posts, services, testimonials, faq_items, price_items, navigation_items, settings, ai_configs, contact_submissions)
   2. `20260714093741_add_lang_and_content_tables.sql` – Nyelvi és tartalom táblák
   3. `20260714114037_add_page_flags_custom_prices_blog_story.sql` – Oldal flag-ek, egyedi árak, blog történet
   4. `20260714121016_create_automotive_database.sql` – Autó adatbázis (cars_makes, cars_models, cars_generations, cars_variants, tire_specs, ac_specs)
   5. `20260715080854_add_pricing_and_import_tables.sql` – Árazási és import táblák
   6. `20260813142717_add_page_views_and_ai_log.sql` – Látogató követés és AI log
   7. `20260813145130_tighten_database_security.sql` – Biztonsági szigorítások

   Minden fájl futtatása után ellenőrizd, hogy nem volt hiba.

### 1.4. RLS (Row Level Security) ellenőrzése

A migrációk automatikusan beállítják az RLS szabályokat. Ellenőrizheted:

1. Menj a **Authentication > Policies** menübe
2. Minden táblánál látnod kell a szabályokat:
   - **Nyilvános táblák** (pages, blog_posts, services, stb.): `anon` SELECT, `authenticated` CRUD
   - **Védett táblák** (ai_configs, contact_submissions, page_views): csak `authenticated` hozzáférés
   - **Írásvédett**: az `anon` role nem tud írni egyetlen táblába sem

---

## 2. Vercel telepítés

### 2.1. GitHub repository előkészítése

1. Töltsd fel a projekt kódját egy GitHub repository-ba
2. Győződj meg róla, hogy a `.env` fájl NINCS feltöltve (a `.gitignore` kizárja)

### 2.2. Vercel projekt létrehozása

1. Menj a https://vercel.com oldalra és jelentkezz be GitHub fiókkal
2. Kattints az **Add New Project** gombra
3. Importáld a GitHub repository-t
4. A Vercel automatikusan felismeri a Next.js projektet

### 2.3. Környezeti változók beállítása

A Vercel projekt beállításaiban (Settings > Environment Variables) add hozzá a következőket:

| Név | Érték |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | A Supabase Project URL-ed (pl. `https://xxxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | A Supabase anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | A Supabase service_role key (TITKOS!) |
| `SUPABASE_DB_URL` | A Supabase adatbázis URL (Settings > Database > Connection string) |
| `ADMIN_SESSION_KEY` | Egy tetszőleges titkos jelszó az admin menühöz (pl. `toldi-admin-2024`) |

**Fontos:** A `NEXT_PUBLIC_` prefixű változók a kliens oldalon is láthatóak. A `SUPABASE_SERVICE_ROLE_KEY` és `ADMIN_SESSION_KEY` csak szerver oldalon elérhetőek.

### 2.4. Build beállítások

A Vercel automatikusan felismeri a Next.js beállításokat. Ellenőrizd:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (automatikus)
- **Install Command**: `npm install`

### 2.5. Deploy

1. Kattints a **Deploy** gombra
2. Várd meg amíg a build lefut (2-3 perc)
3. Ha minden rendben, a weblap elérhető lesz a `https://projekt-neve.vercel.app` címen

### 2.6. Egyedi domain beállítása

1. A Vercel projektben menj a **Settings > Domains** menübe
2. Add hozzá a saját domainedet (pl. `toldimobilgumi.hu`)
3. Állítsd be a DNS bejegyzéseket a domain szolgáltatódnál:
   - **A record**: `76.76.21.21` (Vercel IP)
   - **CNAME**: `cname.vercel-dns.com` (www aldomain)
4. Várd meg a DNS propagálódást (akár 24 óra)

---

## 3. Admin menü beállítása

### 3.1. Belépés

1. Menj a `https://te-domain.hu/admin/login` címre
2. Add meg az `ADMIN_SESSION_KEY` értékét
3. Bejelentkezés után eléréted az admin vezérlőpultot

### 3.2. AI konfiguráció beállítása

1. Menj az **AI Konfig** menüpontba
2. Kattints az **Új konfiguráció** gombra
3. Válassz egy szolgáltatót (ingyenes: Groq, Gemini, Cerebras, Mistral, DeepSeek, Together)
4. Add meg az API kulcsot (ingyenes regisztráció után szerezhető be)
5. Állítsd be alapértelmezettnek

**Ingyenes API kulcsok beszerzése:**
- **Groq**: https://console.groq.com (ingyenes tier)
- **Google Gemini**: https://aistudio.google.com (ingyenes)
- **Cerebras**: https://cloud.cerebras.ai (ingyenes tier)
- **Mistral**: https://console.mistral.ai (ingyenes tier)
- **DeepSeek**: https://platform.deepseek.com (ingyenes kredit)
- **Together**: https://api.together.xyz (ingyenes kredit)

### 3.3. Tartalom létrehozása

- **AI Generátor** (`/admin/ai-generate`): Blog cikkek és aloldalak automatikus generálása
- **AI Asszisztens** (`/admin/ai-assistant`): Weblap analitika és javaslatok
- **Oldalak** (`/admin/pages`): Manuális oldalszerkesztés kész blokkokkal
- **Blog** (`/admin/blog`): Blog bejegyzések kezelése
- **Főoldal** (`/admin/homepage`): Szakaszok be/kikapcsolása, sorrend, egyedi tartalom
- **Felugró ablakok** (`/admin/popups`): Reklámok, üdvözlő ablakok, szavazások

### 3.4. Autó adatbázis feltöltése

1. Menj az **Import** menüpontba (`/admin/import`)
2. Töltsd fel a JSONL fájlt (formátum: márka, modell, generáció, változat, gumi és klíma adatok)
3. A rendszer batch-ekben dolgozza fel, figyelemmel kísérheted a progresszt

---

## 4. Biztonsági ellenőrzőlista

- [ ] RLS engedélyezve minden táblán
- [ ] `anon` role csak SELECT-et tud a nyilvános táblákon
- [ ] `anon` role NEM tud írni egyetlen táblába sem
- [ ] `ai_configs.api_key` oszlop védve van
- [ ] `ADMIN_SESSION_KEY` erős jelszó
- [ ] `SUPABASE_SERVICE_ROLE_KEY` nem kerül a kliens kódba
- [ ] Rate limiting aktív a middleware-ben
- [ ] Biztonsági fejlécek beállítva (X-Content-Type-Options, X-Frame-Options, HSTS, stb.)
- [ ] Gyanús útvonalak blokkolása (.env, .git, wp-admin, stb.)

---

## 5. SEO ellenőrzőlista

- [ ] `sitemap.xml` elérhető és tartalmazza az összes oldalt
- [ ] `robots.txt` engedélyezi az AI botokat (GPTBot, ClaudeBot, PerplexityBot)
- [ ] `llms.txt` és `ai.txt` fájlok elérhetőek
- [ ] JSON-LD strukturált adatok minden oldalon
- [ ] Hreflang alternates beállítva a nyelvek között
- [ ] Meta címek és leírások minden oldalon
- [ ] Open Graph és Twitter Card képek beállítva

---

## 6. Hibaelhárítás

### A weblap üres / nem tölt be
- Ellenőrizd a `NEXT_PUBLIC_SUPABASE_URL` és `NEXT_PUBLIC_SUPABASE_ANON_KEY` értékeket a Vercelen
- Ellenőrizd, hogy az RLS szabályok megengedik az `anon` SELECT-et a `pages`, `blog_posts`, `settings` táblákon

### Az admin menü nem elérhető
- Ellenőrizd az `ADMIN_SESSION_KEY` értéket a Vercelen
- Próbálj meg újra bejelentkezni az `/admin/login` címen

### Az AI generálás nem működik
- Ellenőrizd, hogy van aktív AI konfiguráció az `/admin/ai` oldalon
- Ellenőrizd, hogy az API kulcs érvényes
- Próbálj meg egy ingyenes szolgáltatót (Groq, Gemini)

### A gumiméret kereső nem talál adatot
- Ellenőrizd, hogy az autó adatbázis fel van töltve (Import menü)
- Ellenőrizd, hogy a `cars_makes`, `cars_models`, `cars_generations`, `cars_variants` táblákban van adat

---

## 7. Karbantartás

- **Biztonsági mentés**: A Supabase automatikusan készít napi biztonsági mentéseket
- **Frissítések**: rendszeresen futtasd az `npm update` parancsot
- **Adatbázis tisztítás**: a `page_views` és `ai_generation_log` táblák idővel megnőnek – havonta törölheted a régi adatokat
- **SSL tanúsítvány**: a Vercel automatikusan megújítja
