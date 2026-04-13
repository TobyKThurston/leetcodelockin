import { ImageResponse } from 'next/og';

export const alt = 'LeetLockin — Learn patterns, not just answers';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#0b1220',
          backgroundImage:
            'radial-gradient(ellipse 70% 55% at 30% 10%, rgba(59,130,246,0.22) 0%, transparent 70%)',
          fontFamily: 'sans-serif',
          padding: '80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            width: '100%',
          }}
        >
          <div
            style={{
              fontSize: 28,
              color: '#60a5fa',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: 32,
            }}
          >
            LeetLockin
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: 140,
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 0.95,
              textTransform: 'uppercase',
            }}
          >
            <span style={{ color: '#e5e7eb' }}>Leetcode</span>
            <span
              style={{
                background: 'linear-gradient(180deg, #93c5fd 0%, #60a5fa 40%, #3b82f6 100%)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Lock In
            </span>
          </div>
          <div
            style={{
              marginTop: 40,
              fontSize: 34,
              color: '#94a3b8',
              maxWidth: 900,
              lineHeight: 1.3,
            }}
          >
            Stop memorizing solutions. Learn the patterns behind every problem.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
