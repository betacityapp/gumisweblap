import Link from 'next/link';
import { getDictionary } from '@/lib/i18n';

interface Props {
  params: { lang: string };
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl font-black text-red-600 mb-4">404</div>
        <h1 className="text-3xl font-bold text-white mb-4">Page Not Found</h1>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          The requested page does not exist. It may be available in another language.
        </p>
        <Link href="/hu" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
