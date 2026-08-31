'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, Loader2, X, Download, RefreshCw } from 'lucide-react';

const ADMIN_KEY = 'toldi-admin-2024';

interface ImportStats {
  makesUpserted: number;
  modelsUpserted: number;
  generationsUpserted: number;
  variantsInserted: number;
  variantsUpdated: number;
  tireInserted: number;
  tireUpdated: number;
  acInserted: number;
  acUpdated: number;
}

export default function AdminImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [processedRows, setProcessedRows] = useState(0);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [allStats, setAllStats] = useState<ImportStats | null>(null);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    setFile(f);
    setError('');
    setParsed([]);
    setAllStats(null);
    setProgress(0);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter((l) => l.trim());
        const rows = lines.map((line) => JSON.parse(line));
        setParsed(rows);
        setTotalRows(rows.length);
      } catch (err: any) {
        setError(`Hiba a fájl olvasásakor: ${err.message}`);
      }
    };
    reader.readAsText(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  function mergeStats(prev: ImportStats | null, curr: ImportStats): ImportStats {
    if (!prev) return curr;
    return {
      makesUpserted: prev.makesUpserted + curr.makesUpserted,
      modelsUpserted: prev.modelsUpserted + curr.modelsUpserted,
      generationsUpserted: prev.generationsUpserted + curr.generationsUpserted,
      variantsInserted: prev.variantsInserted + curr.variantsInserted,
      variantsUpdated: prev.variantsUpdated + curr.variantsUpdated,
      tireInserted: prev.tireInserted + curr.tireInserted,
      tireUpdated: prev.tireUpdated + curr.tireUpdated,
      acInserted: prev.acInserted + curr.acInserted,
      acUpdated: prev.acUpdated + curr.acUpdated,
    };
  }

  async function handleImport() {
    if (parsed.length === 0) return;
    setImporting(true);
    setError('');
    setProgress(0);
    setProcessedRows(0);
    setAllStats(null);

    const batchSize = 100;
    const batches = Math.ceil(parsed.length / batchSize);
    setTotalBatches(batches);
    let cumulativeStats: ImportStats | null = null;

    for (let i = 0; i < batches; i++) {
      setProgress(Math.round((i / batches) * 100));
      setCurrentBatch(i + 1);

      try {
        const batchRows = parsed.slice(i * batchSize, (i + 1) * batchSize);

        const res = await fetch('/api/import-cars', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY },
          body: JSON.stringify({
            rows: batchRows,
            batchIndex: 0,
            batchSize: batchRows.length,
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          let errMsg = text;
          try {
            const j = JSON.parse(text);
            errMsg = j.error || text;
          } catch {
            if (res.status === 404) errMsg = 'Az import végpont nem található (404). Lehet, hogy a weboldal még nem került újraépítésre.';
            else if (res.status === 429) errMsg = 'Túl sok kérés. Kérjük várjon egy percet és próbálja újra.';
            else errMsg = `Szerver hiba (${res.status})`;
          }
          throw new Error(errMsg);
        }

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        if (data.stats) {
          cumulativeStats = mergeStats(cumulativeStats, data.stats);
          setAllStats(cumulativeStats);
        }

        setProcessedRows((prev) => prev + (data.processed || batchRows.length));
      } catch (err: any) {
        setError(`Hiba a ${i + 1}. köteg importálásakor: ${err.message}`);
        setImporting(false);
        return;
      }
    }

    setProgress(100);
    setImporting(false);
  }

  function downloadTemplate() {
    const sample = [
      JSON.stringify({
        marka: 'Volkswagen', model: 'Golf', generacio: 'Golf VII', kivitel: '1.4 TSI (122 Hp)',
        gyartas_kezdete: '2012 év', gyartas_kezdete_ho: null, gyartas_kezdete_ev: 2012,
        gyartas_vege: '2020 év', gyartas_vege_ho: null, gyartas_vege_ev: 2020,
        hajtaslanc: 'Belső égésű motor', karosszeria: 'Kombi', uzemanyag: 'Benzin', meghajtas: 'Elsőkerék-hajtás',
        teljesitmeny_hp: 122, nyomatek_nm: 200, loketterfogat_cm3: 1395,
        felnimeret: '16; 17', ulesek_szama: 5, ajtok_szama: 5,
        hutokozeg_tipus: 'R1234yf', hutokozeg_mennyiseg_g: 450,
        hutokozeg_mennyiseg_min_g: 450, hutokozeg_mennyiseg_max_g: 450,
        ac_kompresszor_olaj_tipus: 'PAG 46', ac_kompresszor_olaj_mennyiseg_ml: 80,
        hutokozeg_ellenorizve: 'ok',
        gumi_meretek: [
          { meret: '205/55R16', tengely: null, xl: false, c: false, defekturo: false, motor_forras: 'Minden kivitel' }
        ],
        gumi_forras_generacio: 'Golf VII 2012-2020',
      }, null, 2),
    ].join('\n');

    const blob = new Blob([sample], { type: 'application/jsonl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'import-template.jsonl';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Adatbázis importálás</h1>
        <p className="text-slate-500 mt-1">JSONL fájl feltöltése – márka, modell, generáció, variáns, gumiméret és klíma adatok</p>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <RefreshCw className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Duplikáció-mentes importálás</p>
            <p className="text-xs text-blue-600 mt-1">
              Ha egy márka, modell, generáció vagy variáns már létezik, a rendszer frissíti az adatait ahelyett, hogy duplikálná.
              A statisztikában láthatja, hány új sor került létrehozásra és hány meglévő került frissítésre.
            </p>
          </div>
        </div>
      </div>

      {/* Template download */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-sm font-semibold text-slate-800">Minta fájl letöltése</p>
            <p className="text-xs text-slate-500">Ellenőrizze a formátumot a feltöltés előtt</p>
          </div>
        </div>
        <button onClick={downloadTemplate}
          className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-lg transition-colors">
          <Download className="w-4 h-4" /> Minta letöltése
        </button>
      </div>

      {/* File upload area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all mb-6 ${
          dragOver ? 'border-red-400 bg-red-50' : 'border-slate-300 hover:border-slate-400 bg-white'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jsonl,.json,.txt"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="w-8 h-8 text-green-500" />
            <div className="text-left">
              <p className="font-bold text-slate-800">{file.name}</p>
              <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB · {parsed.length} sor</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setFile(null); setParsed([]); setTotalRows(0); setAllStats(null); }}
              className="ml-4 text-slate-400 hover:text-red-500">
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-600">Húzza ide a JSONL fájlt vagy kattintson a tallózáshoz</p>
            <p className="text-sm text-slate-400 mt-1">.jsonl, .json, .txt formátum támogatott</p>
          </>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Import button */}
      {parsed.length > 0 && !importing && progress < 100 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-bold text-slate-800">{parsed.length} sor készen áll az importálásra</p>
              <p className="text-sm text-slate-500">Kötegméret: 100 sor / köteg · {Math.ceil(parsed.length / 100)} köteg</p>
            </div>
            <button onClick={handleImport}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold text-sm">
              <Upload className="w-4 h-4" /> Importálás indítása
            </button>
          </div>
        </div>
      )}

      {/* Progress */}
      {importing && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
            <p className="font-bold text-slate-800">Importálás folyamatban... {progress}%</p>
            <span className="text-sm text-slate-400">({currentBatch}/{totalBatches} köteg)</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden mb-2">
            <div className="bg-red-500 h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm text-slate-500">{processedRows} / {totalRows} sor feldolgozva</p>

          {/* Live stats during import */}
          {allStats && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
              <StatBox label="Új márkák" value={allStats.makesUpserted} color="blue" />
              <StatBox label="Új modellek" value={allStats.modelsUpserted} color="blue" />
              <StatBox label="Új generációk" value={allStats.generationsUpserted} color="blue" />
              <StatBox label="Új variánsok" value={allStats.variantsInserted} color="green" />
              <StatBox label="Frissített variánsok" value={allStats.variantsUpdated} color="amber" />
              <StatBox label="Új gumiméretek" value={allStats.tireInserted} color="green" />
              <StatBox label="Frissített gumiméretek" value={allStats.tireUpdated} color="amber" />
              <StatBox label="Új klíma adatok" value={allStats.acInserted} color="green" />
              <StatBox label="Frissített klíma adatok" value={allStats.acUpdated} color="amber" />
            </div>
          )}
        </div>
      )}

      {/* Final results */}
      {progress === 100 && !importing && allStats && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-7 h-7 text-green-500" />
            <div>
              <p className="font-bold text-lg text-green-800">Importálás sikeres!</p>
              <p className="text-sm text-green-600">{processedRows} sor feldolgozva, {totalBatches} köteg</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatBox label="Új márkák" value={allStats.makesUpserted} color="blue" />
            <StatBox label="Új modellek" value={allStats.modelsUpserted} color="blue" />
            <StatBox label="Új generációk" value={allStats.generationsUpserted} color="blue" />
            <StatBox label="Új variánsok" value={allStats.variantsInserted} color="green" />
            <StatBox label="Frissített variánsok" value={allStats.variantsUpdated} color="amber" />
            <StatBox label="Új gumiméretek" value={allStats.tireInserted} color="green" />
            <StatBox label="Frissített gumiméretek" value={allStats.tireUpdated} color="amber" />
            <StatBox label="Új klíma adatok" value={allStats.acInserted} color="green" />
            <StatBox label="Frissített klíma adatok" value={allStats.acUpdated} color="amber" />
          </div>
        </div>
      )}

      {/* Format help */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-bold text-slate-800 mb-3">JSONL formátum</h3>
        <p className="text-sm text-slate-600 mb-3">
          Minden sor egy JSON objektum. Kötelező mezők: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">marka</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">model</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">generacio</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">kivitel</code>. A többi mező opcionális. A <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">gumi_meretek</code> egy tömb, amelyben minden elem tartalmazza a méretet és extra jellemzőket.
        </p>
        <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
          <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">{`{
  "marka": "Volkswagen",
  "model": "Golf",
  "generacio": "Golf VII",
  "kivitel": "1.4 TSI (122 Hp)",
  "gyartas_kezdete_ev": 2012,
  "gyartas_vege_ev": 2020,
  "uzemanyag": "Benzin",
  "teljesitmeny_hp": 122,
  "hutokozeg_tipus": "R1234yf",
  "hutokozeg_mennyiseg_g": 450,
  "hutokozeg_ellenorizve": "ok",
  "gumi_meretek": [
    {"meret": "205/55R16", "xl": false, "c": false, "defekturo": false, "motor_forras": "Minden kivitel"}
  ],
  "gumi_forras_generacio": "Golf VII 2012-2020"
}`}</pre>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          <div><span className="font-semibold text-slate-700">marka</span> <span className="text-slate-400">márka neve</span></div>
          <div><span className="font-semibold text-slate-700">model</span> <span className="text-slate-400">modell neve</span></div>
          <div><span className="font-semibold text-slate-700">generacio</span> <span className="text-slate-400">generáció neve</span></div>
          <div><span className="font-semibold text-slate-700">kivitel</span> <span className="text-slate-400">variáns neve</span></div>
          <div><span className="font-semibold text-slate-700">gyartas_kezdete_ev</span> <span className="text-slate-400">kezdő év</span></div>
          <div><span className="font-semibold text-slate-700">gyartas_vege_ev</span> <span className="text-slate-400">végső év</span></div>
          <div><span className="font-semibold text-slate-700">uzemanyag</span> <span className="text-slate-400">üzemanyag típus</span></div>
          <div><span className="font-semibold text-slate-700">teljesitmeny_hp</span> <span className="text-slate-400">lóerő</span></div>
          <div><span className="font-semibold text-slate-700">hutokozeg_tipus</span> <span className="text-slate-400">R134a/R1234yf</span></div>
          <div><span className="font-semibold text-slate-700">hutokozeg_mennyiseg_g</span> <span className="text-slate-400">gramm</span></div>
          <div><span className="font-semibold text-slate-700">hutokozeg_ellenorizve</span> <span className="text-slate-400">ok/nincs-adat/gyanus</span></div>
          <div><span className="font-semibold text-slate-700">gumi_meretek</span> <span className="text-slate-400">gumiméretek tömbje</span></div>
          <div><span className="font-semibold text-slate-700">gumi_meretek[].meret</span> <span className="text-slate-400">pl. 205/55R16</span></div>
          <div><span className="font-semibold text-slate-700">gumi_meretek[].xl</span> <span className="text-slate-400">XL jelölés</span></div>
          <div><span className="font-semibold text-slate-700">gumi_meretek[].c</span> <span className="text-slate-400">C (kereskedelmi)</span></div>
          <div><span className="font-semibold text-slate-700">gumi_meretek[].defekturo</span> <span className="text-slate-400">run-flat</span></div>
          <div><span className="font-semibold text-slate-700">gumi_meretek[].motor_forras</span> <span className="text-slate-400">motor változat</span></div>
          <div><span className="font-semibold text-slate-700">gumi_forras_generacio</span> <span className="text-slate-400">forrás generáció</span></div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: 'green' | 'amber' | 'blue' }) {
  const colors = {
    green: 'bg-green-50 text-green-700 border-green-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
  };
  return (
    <div className={`rounded-xl p-3 border ${colors[color]}`}>
      <p className="text-xs opacity-80">{label}</p>
      <p className="text-xl font-black">{value}</p>
    </div>
  );
}
