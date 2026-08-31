import { getSettings, getNavigation } from '@/lib/db';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Smartphone, Download, Check } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getAppPageData() {
  const { createClient } = await import('@supabase/supabase-js');
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: rows } = await admin
    .from('site_settings')
    .select('key, value')
    .in('key', ['app_page_title', 'app_page_subtitle', 'app_page_description', 'app_page_features', 'app_page_play_url', 'app_page_icon', 'app_page_screenshots', 'app_page_published']);
  const map: Record<string, string> = {};
  (rows || []).forEach((r: any) => { map[r.key] = r.value; });
  return map;
}

export default async function AppPage({ params }: { params: { lang: string } }) {
  const [settings, navigation, appData] = await Promise.all([
    getSettings(),
    getNavigation(),
    getAppPageData(),
  ]);

  const isPublished = appData.app_page_published === 'true';
  if (!isPublished) {
    return (
      <>
        <Header settings={settings} navigation={navigation} lang={params.lang} />
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="text-slate-400">Ez az oldal jelenleg nem publikus.</p>
        </div>
        <Footer settings={settings} navigation={navigation} lang={params.lang} />
      </>
    );
  }

  const title = appData.app_page_title || 'Toldi Mobile';
  const subtitle = appData.app_page_subtitle || 'Mobil Gumiszerviz App';
  const description = appData.app_page_description || '';
  const features = (appData.app_page_features || '').split('\n').filter(f => f.trim());
  const playUrl = appData.app_page_play_url || '';
  const iconUrl = appData.app_page_icon || '';
  const screenshots = (appData.app_page_screenshots || '').split('\n').filter(s => s.trim());

  return (
    <>
      <Header settings={settings} navigation={navigation} lang={params.lang} />
      
      <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 pt-32 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-red-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        <div className="max-w-5xl mx-auto px-4 relative">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-shrink-0">
              {iconUrl ? (
                <img src={iconUrl} alt={title} className="w-40 h-40 rounded-3xl shadow-2xl" />
              ) : (
                <div className="w-40 h-40 bg-red-600 rounded-3xl flex items-center justify-center shadow-2xl">
                  <Smartphone className="w-20 h-20 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2">{title}</h1>
              <p className="text-xl text-slate-400 mb-6">{subtitle}</p>
              {playUrl && (
                <a href={playUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:shadow-lg hover:shadow-green-600/30 active:scale-95">
                  <Download className="w-5 h-5" />
                  Letöltés a Google Play-ből
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {description && (
        <section className="py-12 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <div className="prose-content" dangerouslySetInnerHTML={{ __html: description }} />
          </div>
        </section>
      )}

      {features.length > 0 && (
        <section className="py-12 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Funkciók</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3 bg-white rounded-xl border border-slate-100 p-4">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-red-600" />
                  </div>
                  <span className="text-slate-700 font-medium">{f.trim()}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {screenshots.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Képernyőképek</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {screenshots.map((url, i) => (
                <img key={i} src={url.trim()} alt={`Képernyőkép ${i+1}`} className="rounded-xl shadow-lg w-full" />
              ))}
            </div>
          </div>
        </section>
      )}

      {playUrl && (
        <section className="py-12 bg-gradient-to-r from-red-600 to-red-700">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Töltse le az alkalmazást most!</h2>
            <a href={playUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-red-600 hover:bg-red-50 px-8 py-4 rounded-xl font-bold text-lg transition-all active:scale-95">
              <Download className="w-5 h-5" />
              Google Play
            </a>
          </div>
        </section>
      )}

      <Footer settings={settings} navigation={navigation} lang={params.lang} />
    </>
  );
}
