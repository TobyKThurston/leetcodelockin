import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1220] text-slate-100 p-8">
      <div className="max-w-md text-center">
        <div className="text-sm font-mono text-indigo-400 mb-3">404</div>
        <h1 className="text-2xl font-semibold mb-3">Page not found</h1>
        <p className="text-sm text-slate-400 mb-6">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-md bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium transition"
          >
            Dashboard
          </Link>
          <Link
            href="/"
            className="px-4 py-2 rounded-md border border-slate-700 hover:border-slate-500 text-slate-200 text-sm font-medium transition"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
