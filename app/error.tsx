'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import posthog from 'posthog-js';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Route error:', error);
    posthog.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--ll-bg)] text-slate-900 p-8">
      <div className="max-w-md text-center">
        <div className="text-sm font-mono text-blue-600 mb-3">Something went wrong</div>
        <h1 className="text-2xl font-semibold mb-3 tracking-tight">We hit a snag loading that.</h1>
        <p className="text-sm text-slate-600 mb-6">
          The issue has been logged. You can try again, or head back to the dashboard.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-md border border-slate-300 hover:border-slate-400 bg-white text-slate-900 text-sm font-medium transition"
          >
            Dashboard
          </Link>
        </div>
        {error.digest && (
          <div className="mt-6 text-[11px] font-mono text-slate-400">ref: {error.digest}</div>
        )}
      </div>
    </div>
  );
}
