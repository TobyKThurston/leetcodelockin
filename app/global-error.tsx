'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ background: '#fafbfc', color: '#0f172a', margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <div style={{ maxWidth: 420, textAlign: 'center' }}>
            <div style={{ color: '#2563eb', fontSize: 13, fontFamily: 'ui-monospace, monospace', marginBottom: 12 }}>
              Fatal error
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12, letterSpacing: '-0.02em' }}>The app failed to load.</h1>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
              Please refresh the page. If the problem persists, try clearing site data.
            </p>
            <button
              onClick={reset}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                background: '#2563eb',
                color: 'white',
                border: 'none',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
            {error.digest && (
              <div style={{ marginTop: 24, fontSize: 11, fontFamily: 'ui-monospace, monospace', color: '#94a3b8' }}>
                ref: {error.digest}
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
