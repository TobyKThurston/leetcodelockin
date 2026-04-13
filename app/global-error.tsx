'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body style={{ background: '#0b1220', color: '#e2e8f0', margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <div style={{ maxWidth: 420, textAlign: 'center' }}>
            <div style={{ color: '#818cf8', fontSize: 13, fontFamily: 'ui-monospace, monospace', marginBottom: 12 }}>
              Fatal error
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12 }}>The app failed to load.</h1>
            <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24 }}>
              Please refresh the page. If the problem persists, try clearing site data.
            </p>
            <button
              onClick={reset}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                background: '#6366f1',
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
              <div style={{ marginTop: 24, fontSize: 11, fontFamily: 'ui-monospace, monospace', color: '#475569' }}>
                ref: {error.digest}
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
