'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Route error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1220] text-slate-100 p-8">
      <div className="max-w-md text-center">
        <div className="text-sm font-mono text-indigo-400 mb-3">Something went wrong</div>
        <h1 className="text-2xl font-semibold mb-3">We hit a snag loading that.</h1>
        <p className="text-sm text-slate-400 mb-6">
          The issue has been logged. You can try again, or head back to the dashboard.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 rounded-md bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium transition"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-md border border-slate-700 hover:border-slate-500 text-slate-200 text-sm font-medium transition"
          >
            Dashboard
          </Link>
        </div>
        {error.digest && (
          <div className="mt-6 text-[11px] font-mono text-slate-600">ref: {error.digest}</div>
        )}
      </div>
    </div>
  );
}
