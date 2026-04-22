'use client';

import { useEffect, useRef, useState } from 'react';

/* Stacked sticky parallax. Each scene is `position: sticky; top: 0;
   h: 100vh` inside a tall outer section. As you scroll, each scene
   pins to the viewport for one viewport-height worth of scroll, then
   the next scene slides up from below and covers it.

   Mobile fallback: vertical stack with no pinning at <md.

   Scenes with `ready: true` render a real <video> gated by an
   IntersectionObserver (only the visible one decodes). Others
   fall back to a gradient placeholder. */

type Scene = {
  n: string;
  label: string;
  headline: string;
  body: string;
  video: string;
  poster: string;
  ready?: boolean;
};

const SCENES: Scene[] = [
  {
    n: '01',
    label: 'AI Socratic Tutor',
    headline: 'Hints that guide, not solve.',
    body: 'Vague nudge first, then the technique, then concrete code only if you really need it.',
    video: '/videos/usage-tutor.mp4',
    poster: '/videos/usage-tutor.webp',
    ready: true,
  },
  {
    n: '02',
    label: 'Voice Mock Interview',
    headline: 'Talk through it like the real thing.',
    body: 'AI interviewer with a live transcript and an honest debrief at the end.',
    video: '/videos/usage-voice.mp4',
    poster: '/videos/usage-voice.webp',
    ready: true,
  },
  {
    n: '03',
    label: 'Pattern Library',
    headline: 'See the shape, then the problem.',
    body: 'Every problem mapped to its pattern. Recognize once, solve everywhere.',
    video: '/videos/usage-pattern.mp4',
    poster: '/videos/usage-pattern.webp',
    ready: true,
  },
  {
    n: '04',
    label: 'Spaced Repetition',
    headline: "Don't lose what you learned.",
    body: 'Solved problems become flashcards. Review them right before they slip.',
    video: '/videos/usage-srs.mp4',
    poster: '/videos/usage-srs.webp',
    ready: true,
  },
];

export default function UsageShowcase() {
  return (
    <div id="curriculum" style={{ scrollMarginTop: '80px' }}>

      {/* Mobile: vertical stack */}
      <section className="md:hidden px-6 sm:px-10 py-20" style={{ background: '#eef4ff' }}>
        <div className="flex flex-col gap-14">
          {SCENES.map((scene) => (
            <SceneStack key={scene.n} scene={scene} />
          ))}
        </div>
      </section>

      {/* Desktop: stacked sticky scenes — each covers the previous */}
      <section className="hidden md:block relative">
        {SCENES.map((scene, i) => (
          <SceneSticky key={scene.n} scene={scene} index={i} />
        ))}
      </section>

      {/* Bottom fade — bridges blue tint back into page bg */}
      <div
        aria-hidden
        className="h-16"
        style={{
          background: 'linear-gradient(to top, var(--ll-bg), #eef4ff)',
        }}
      />
    </div>
  );
}

function SceneSticky({ scene, index }: { scene: Scene; index: number }) {
  const z = 10 + index;
  const bg = index === 0 ? '#eef4ff' : 'var(--ll-bg)';
  return (
    <div
      className="sticky top-0 h-screen flex items-center"
      style={{ zIndex: z, background: bg }}
    >
      <div className="grid grid-cols-[1.4fr_1fr] gap-16 max-w-6xl w-full mx-auto px-10 items-center">
        <SceneMedia scene={scene} />
        <SceneCaption scene={scene} large />
      </div>
    </div>
  );
}

function SceneStack({ scene }: { scene: Scene }) {
  return (
    <div className="space-y-5">
      <SceneMedia scene={scene} />
      <SceneCaption scene={scene} />
    </div>
  );
}

function SceneCaption({ scene, large = false }: { scene: Scene; large?: boolean }) {
  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-3">
        <span
          className="font-mono text-[11px] tabular-nums font-semibold"
          style={{ color: 'var(--ll-accent)' }}
        >
          {scene.n}
        </span>
        <span
          className="text-[10px] font-mono font-semibold tracking-[0.22em] uppercase"
          style={{ color: 'var(--ll-ink-subtle)' }}
        >
          {scene.label}
        </span>
      </div>
      <h3
        className={`font-bold tracking-tight ${large ? 'text-3xl sm:text-4xl' : 'text-2xl'}`}
        style={{ color: 'var(--ll-ink)', fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif' }}
      >
        {scene.headline}
      </h3>
      <p
        className={`leading-relaxed ${large ? 'text-[15px] max-w-md' : 'text-[14px]'}`}
        style={{ color: 'var(--ll-ink-muted)' }}
      >
        {scene.body}
      </p>
    </div>
  );
}

const MEDIA_FRAME =
  'aspect-video rounded-lg overflow-hidden border relative';

const MEDIA_FRAME_STYLE = {
  borderColor: 'var(--ll-border)',
  background:
    'linear-gradient(135deg, rgba(59,130,246,0.10) 0%, rgba(56,189,248,0.06) 50%, rgba(59,130,246,0.08) 100%)',
  boxShadow:
    '0 1px 2px rgba(15,23,42,0.04), 0 24px 60px -28px rgba(59,130,246,0.30)',
};

function SceneMedia({ scene }: { scene: Scene }) {
  if (scene.ready) return <VideoMedia scene={scene} />;
  return <PlaceholderMedia scene={scene} />;
}

function VideoMedia({ scene }: { scene: Scene }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (visible) el.play().catch(() => {});
    else el.pause();
  }, [visible]);

  return (
    <div className={MEDIA_FRAME} style={MEDIA_FRAME_STYLE}>
      <video
        ref={videoRef}
        src={scene.video}
        poster={scene.poster}
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
}

function PlaceholderMedia({ scene }: { scene: Scene }) {
  return (
    <div className={MEDIA_FRAME} style={MEDIA_FRAME_STYLE}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <span
          className="text-[10px] font-mono tracking-[0.22em] uppercase"
          style={{ color: 'var(--ll-ink-subtle)' }}
        >
          Video placeholder
        </span>
        <span
          className="text-[12px] font-mono"
          style={{ color: 'var(--ll-ink-muted)' }}
        >
          {scene.video}
        </span>
      </div>
    </div>
  );
}
