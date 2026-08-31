# Alternatív importálási módszerek a Supabase adatbázisba

Ha a webes importáló felület nem működik (pl. túl nagy fájl, szerver korlátok), az alábbi módszerekkel is feltöltheti a JSONL fájlt a Supabase adatbázisba.

---

## 1. Módszer: Supabase SQL Editor (Közvetlen SQL)

Ez a leggyorsabb módszer, ha a JSONL fájl már eleve SQL INSERT utasításokká alakítható.

### Lépések:

1. Nyissa meg a [Supabase Dashboard](https://supabase.com/dashboard)-t
2. Válassza ki a megfelelő projektet (URL-ben `uiqnvuutlbnkexzokkcx`)
3. Bal oldali menü: **SQL Editor**
4. Illessze be az SQL utasításokat
5. Kattintson a **Run** gombra

### Példa SQL:

```sql
-- Márkák feltöltése
INSERT INTO cars_makes (name, slug, sort_order) VALUES
  ('Volkswagen', 'volkswagen', 0),
  ('BMW', 'bmw', 1),
  ('Audi', 'audi', 2)
ON CONFLICT (slug) DO NOTHING;

-- Modellek feltöltése (a make_id-t le kell kérdezni előbb)
INSERT INTO cars_models (make_id, name, slug, sort_order)
SELECT m.id, 'Golf', 'golf', 0 FROM cars_makes m WHERE m.slug = 'volkswagen'
ON CONFLICT (make_id, slug) DO NOTHING;
```

---

## 2. Módszer: Supabase Dashboard Upload (CSV import)

A Supabase Dashboard lehetővé teszi CSV fájlok közvetlen feltöltését.

### Lépések:

1. Alakítsa át a JSONL fájlt CSV formátumra (pl. [json-csv.com](https://www.json-csv.com/) segítségével, vagy Python scripttel)
2. Nyissa meg a Supabase Dashboard-ot
3. Bal oldali menü: **Table Editor**
4. Válassza ki a céltáblát (pl. `cars_makes`)
5. Kattintson az **Import** gombra (felhő ikon a tábla felett)
6. Válassza ki a CSV fájlt
7. Ellenőrizze az oszlopok megfelelőségét
8. Kattintson az **Import** gombra

### Fontos: A táblákat sorrendben kell feltölteni:

1. `cars_makes` — márka nevek
2. `cars_models` — modellek (make_id hivatkozással)
3. `cars_generations` — generációk (model_id hivatkozással)
4. `cars_variants` — variánsok (generation_id hivatkozással)
5. `tire_specs` — gumiméretek (variant_id hivatkozással)
6. `ac_specs` — klíma adatok (variant_id hivatkozással)

---

## 3. Módszer: Python script (Ajánlott nagy fájlokhoz)

Ez a módszer a legmegbízhatóbb 50.000+ soros fájloknál. A Python script közvetlenül a Supabase REST API-n keresztül tölti fel az adatokat, kötegekben, megszakítás nélkül.

### Telepítés:

```bash
pip install supabase
```

### Script (`import_to_supabase.py`):

```python
import json
import time
from supabase import create_client

# Supabase beállítások (a .env fájlból)
SUPABASE_URL = "https://uiqnvuutlbnkexzokkcx.supabase.co"
SUPABASE_KEY = "A_SAVICE_ROLE_KEY"  # Service Role Key a .env fájlból

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def slugify(text):
    import re
    text = text.lower()
    replacements = {'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ö': 'o', 'ő': 'o', 'ú': 'u', 'ü': 'u', 'ű': 'u'}
    for k, v in replacements.items():
        text = text.replace(k, v)
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def import_jsonl(filepath, batch_size=200):
    with open(filepath, 'r', encoding='utf-8') as f:
        rows = [json.loads(line) for line in f if line.strip()]

    print(f"Összes sor: {len(rows)}")

    make_cache = {}
    model_cache = {}
    gen_cache = {}
    variant_cache = {}

    for i in range(0, len(rows), batch_size):
        batch = rows[i:i + batch_size]
        print(f"Köteg {i // batch_size + 1}/{(len(rows) + batch_size - 1) // batch_size}...")

        tire_specs = []
        ac_specs = []

        for row in batch:
            make = row.get('make')
            if not make:
                continue

            # Márka
            if make not in make_cache:
                slug = slugify(make)
                result = supabase.table('cars_makes').select('id').eq('slug', slug).execute()
                if result.data:
                    make_cache[make] = result.data[0]['id']
                else:
                    result = supabase.table('cars_makes').insert({
                        'name': make, 'slug': slug, 'sort_order': len(make_cache)
                    }).execute()
                    make_cache[make] = result.data[0]['id']

            make_id = make_cache[make]

            # Modell
            model = row.get('model')
            if not model:
                continue
            model_key = f"{make_id}:{model}"
            if model_key not in model_cache:
                slug = slugify(model)
                result = supabase.table('cars_models').select('id').eq('make_id', make_id).eq('slug', slug).execute()
                if result.data:
                    model_cache[model_key] = result.data[0]['id']
                else:
                    result = supabase.table('cars_models').insert({
                        'make_id': make_id, 'name': model, 'slug': slug, 'sort_order': len(model_cache)
                    }).execute()
                    model_cache[model_key] = result.data[0]['id']

            model_id = model_cache[model_key]

            # Generáció
            generation = row.get('generation')
            if not generation:
                continue
            gen_key = f"{model_id}:{generation}"
            if gen_key not in gen_cache:
                code = row.get('generation_code') or slugify(generation)
                result = supabase.table('cars_generations').select('id').eq('model_id', model_id).eq('code', code).execute()
                if result.data:
                    gen_cache[gen_key] = result.data[0]['id']
                else:
                    result = supabase.table('cars_generations').insert({
                        'model_id': model_id, 'code': code, 'name': generation,
                        'years_start': row.get('years_start'), 'years_end': row.get('years_end'),
                        'sort_order': len(gen_cache)
                    }).execute()
                    gen_cache[gen_key] = result.data[0]['id']

            gen_id = gen_cache[gen_key]

            # Variáns
            variant = row.get('variant')
            if not variant:
                continue
            var_key = f"{gen_id}:{variant}:{row.get('engine_code', '')}"
            if var_key not in variant_cache:
                result = supabase.table('cars_variants').select('id').eq('generation_id', gen_id).eq('name', variant).execute()
                if result.data:
                    variant_cache[var_key] = result.data[0]['id']
                else:
                    result = supabase.table('cars_variants').insert({
                        'generation_id': gen_id, 'name': variant,
                        'engine_code': row.get('engine_code'),
                        'fuel_type': row.get('fuel_type'),
                        'power_hp': row.get('power_hp'),
                        'sort_order': len(variant_cache)
                    }).execute()
                    variant_cache[var_key] = result.data[0]['id']

            variant_id = variant_cache[var_key]

            # Gumiméretek
            if row.get('tire_width') and row.get('tire_aspect_ratio') and row.get('tire_rim_diameter'):
                tire_specs.append({
                    'variant_id': variant_id,
                    'position': row.get('tire_position', 'universal'),
                    'width': row['tire_width'],
                    'aspect_ratio': row['tire_aspect_ratio'],
                    'rim_diameter': row['tire_rim_diameter'],
                    'load_index': row.get('tire_load_index'),
                    'speed_index': row.get('tire_speed_index'),
                    'tire_type': row.get('tire_type', 'standard'),
                    'sort_order': len(tire_specs),
                })

            # Klíma adatok
            if row.get('ac_refrigerant_type'):
                existing = supabase.table('ac_specs').select('id').eq('variant_id', variant_id).execute()
                if not existing.data:
                    ac_specs.append({
                        'variant_id': variant_id,
                        'refrigerant_type': row['ac_refrigerant_type'],
                        'refrigerant_amount_g': row.get('ac_refrigerant_amount_g'),
                        'oil_type': row.get('ac_oil_type'),
                        'oil_amount_ml': row.get('ac_oil_amount_ml'),
                        'needs_manual_check': row.get('ac_needs_manual_check', False),
                        'notes': row.get('ac_notes'),
                    })

        # Kötegelt feltöltés
        if tire_specs:
            supabase.table('tire_specs').insert(tire_specs).execute()
        if ac_specs:
            supabase.table('ac_specs').insert(ac_specs).execute()

        print(f"  → {len(tire_specs)} gumi, {len(ac_specs)} klíma adat feltöltve")
        time.sleep(0.5)  # Rate limit elkerülése

    print("Importálás befejeződött!")

# Futtatás
import_to_supabase('tesss.jsonl', batch_size=200)
```

### Futtatás:

```bash
python import_to_supabase.py
```

---

## 4. Módszer: Supabase CLI (psql közvetlen kapcsolat)

Ha a Supabase CLI telepítve van, közvetlenül a PostgreSQL adatbázishoz csatlakozhat és SQL utasításokat futtathat.

### Telepítés:

```bash
npm install -g supabase
```

### Csatlakozás:

```bash
supabase db push --db-url "postgresql://postgres:[JELSZÓ]@db.uiqnvuutlbnkexzokkcx.supabase.co:5432/postgres"
```

### Vagy közvetlenül psql-lel:

```bash
psql "postgresql://postgres:[JELSZÓ]@db.uiqnvuutlbnkexzokkcx.supabase.co:5432/postgres" -f import.sql
```

---

## 5. Módszer: Node.js script

Ha Python helyett Node.js-t preferál:

```javascript
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://uiqnvuutlbnkexzokkcx.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function importData(filepath) {
  const lines = fs.readFileSync(filepath, 'utf-8').split('\n').filter(l => l.trim());
  const rows = lines.map(l => JSON.parse(l));
  console.log(`Összes sor: ${rows.length}`);

  const batchSize = 200;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    console.log(`Köteg ${Math.floor(i / batchSize) + 1}...`);

    // ... ugyanaz a logika mint a Python scriptben

    await new Promise(r => setTimeout(r, 500)); // Rate limit
  }
}

importData('tesss.jsonl');
```

---

## Összehasonlítás

| Módszer | Sebesség | Nehézség | Megbízhatóság |
|---------|----------|----------|---------------|
| Webes importáló | Lassú (korlátok) | Könnyű | Közepes |
| SQL Editor | Gyors | Közepes | Magas |
| CSV Upload | Közepes | Könnyű | Magas |
| Python script | Gyors | Közepes | Magas |
| psql | Leggyorsabb | Nehéz | Magas |
| Node.js script | Gyors | Közepes | Magas |

**Ajánlás:** 58.000 sornál a **Python script** (3. módszer) a legmegbízhatóbb, mert közvetlenül a Supabase API-val kommunikál, kötegekben dolgozik, és nincs szerver oldali korlát.
