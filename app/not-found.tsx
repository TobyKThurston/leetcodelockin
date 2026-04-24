import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--ll-bg)] text-slate-900 p-8">
      <div className="max-w-md text-center">
        <div className="text-sm font-mono text-blue-600 mb-3">404</div>
        <h1 className="text-2xl font-semibold mb-3 tracking-tight">Page not found</h1>
        <p className="text-sm text-slate-600 mb-6">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition"
          >
            Dashboard
          </Link>
          <Link
            href="/"
            className="px-4 py-2 rounded-md border border-slate-300 hover:border-slate-400 bg-white text-slate-900 text-sm font-medium transition"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
