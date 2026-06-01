'use client';

import { useEffect, useRef, useState } from 'react';

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
    label: 'Voice Mock Interview',
    headline: 'Talk through it like the real thing.',
    body: 'AI interviewer with a live transcript and an honest debrief at the end.',
    video: '/videos/usage-voice.mp4',
    poster: '/videos/usage-voice.webp',
    ready: true,
  },
  {
    n: '02',
    label: 'Pattern Library',
    headline: 'See the shape, then the problem.',
    body: 'Every problem mapped to its pattern. Recognize once, solve everywhere.',
    video: '/videos/usage-pattern.mp4',
    poster: '/videos/usage-pattern.webp',
    ready: true,
  },
  {
    n: '03',
    label: 'Spaced Repetition',
    headline: "Don't lose what you learned.",
    body: 'Solved problems become flashcards. Review them right before they slip.',
    video: '/videos/usage-srs.mp4',
    poster: '/videos/usage-srs.webp',
    ready: true,
  },
  {
    n: '04',
    label: 'AI Socratic Tutor',
    headline: 'Hints that guide, not solve.',
    body: 'Vague nudge first, then the technique, then concrete code only if you really need it.',
    video: '/videos/usage-tutor.mp4',
    poster: '/videos/usage-tutor.webp',
    ready: true,
  },
];

const AUTO_ADVANCE_MS = 7000;

export default function UsageShowcase() {
  return (
    <div id="curriculum" style={{ scrollMarginTop: '80px' }}>
      <div
        aria-hidden
        className="h-16"
        style={{ background: 'linear-gradient(to bottom, var(--ll-bg), #eef4ff)' }}
      />
      <section className="relative overflow-hidden px-6 sm:px-10 py-20 md:py-28" style={{ background: '#eef4ff' }}>
        <video
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover pointer-events-none motion-reduce:hidden"
          style={{ transform: 'scale(1.16)' }}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src="/videos/hero-background.mp4" type="video/mp4" />
        </video>

        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(238,244,255,0.78) 0%, rgba(238,244,255,0.50) 42%, rgba(238,244,255,0.84) 100%), radial-gradient(ellipse 62% 48% at 50% 30%, rgba(59,130,246,0.18), transparent 72%), radial-gradient(ellipse 44% 38% at 80% 24%, rgba(56,189,248,0.14), transparent 70%)',
          }}
        />

        <div className="relative max-w-6xl mx-auto">
          {/* Mobile: vertical stack */}
          <div className="md:hidden flex flex-col gap-14">
            {SCENES.map((scene) => (
              <SceneStack key={scene.n} scene={scene} />
            ))}
          </div>

          {/* Desktop: tabbed showcase */}
          <div className="hidden md:block">
            <TabbedShowcase />
          </div>
        </div>
      </section>

      <div
        aria-hidden
        className="h-16"
        style={{ background: 'linear-gradient(to top, var(--ll-bg), #eef4ff)' }}
      />
    </div>
  );
}

function TabbedShowcase() {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (paused || !inView) return;
    const tick = 50;
    const id = window.setInterval(() => {
      setProgress((p) => {
        const next = p + (tick / AUTO_ADVANCE_MS) * 100;
        if (next >= 100) {
          setActive((a) => (a + 1) % SCENES.length);
          return 0;
        }
        return next;
      });
    }, tick);
    return () => window.clearInterval(id);
  }, [paused, inView]);

  const select = (i: number) => {
    setActive(i);
    setProgress(0);
  };

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-[1fr_1.5fr] gap-14 items-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex flex-col">
        {SCENES.map((scene, i) => (
          <TabRow
            key={scene.n}
            scene={scene}
            active={i === active}
            progress={i === active ? progress : 0}
            onClick={() => select(i)}
          />
        ))}
      </div>
      <CrossfadeMedia activeIndex={active} />
    </div>
  );
}

function TabRow({
  scene,
  active,
  progress,
  onClick,
}: {
  scene: Scene;
  active: boolean;
  progress: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative text-left py-5 pl-6 group"
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-[2px]"
        style={{ background: 'var(--ll-border)' }}
      />
      {active && (
        <div
          className="absolute left-0 top-0 w-[2px]"
          style={{
            height: `${progress}%`,
            background: 'var(--ll-accent)',
            transition: 'height 50ms linear',
          }}
        />
      )}

      <div className="flex items-baseline gap-3 mb-1.5">
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
        className="font-bold tracking-tight text-xl"
        style={{
          color: active ? 'var(--ll-ink)' : 'var(--ll-ink-muted)',
          fontFamily:
            'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
          transition: 'color 300ms',
        }}
      >
        {scene.headline}
      </h3>
      <div
        className="overflow-hidden"
        style={{
          maxHeight: active ? '120px' : '0px',
          opacity: active ? 1 : 0,
          transition: active
            ? 'max-height 500ms ease, opacity 500ms ease 100ms'
            : 'max-height 300ms ease, opacity 200ms ease',
        }}
      >
        <p
          className="text-[14px] leading-relaxed pt-2 max-w-md"
          style={{ color: 'var(--ll-ink-muted)' }}
        >
          {scene.body}
        </p>
      </div>
    </button>
  );
}

function CrossfadeMedia({ activeIndex }: { activeIndex: number }) {
  return (
    <div className={MEDIA_FRAME} style={MEDIA_FRAME_STYLE}>
      {SCENES.map((scene, i) => (
        <VideoLayer
          key={scene.n}
          scene={scene}
          active={i === activeIndex}
        />
      ))}
    </div>
  );
}

function VideoLayer({ scene, active }: { scene: Scene; active: boolean }) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (active) {
      el.currentTime = 0;
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [active]);

  return (
    <video
      ref={ref}
      src={scene.video}
      poster={scene.poster}
      muted
      loop
      playsInline
      preload="metadata"
      className="absolute inset-0 w-full h-full object-cover"
      style={{
        opacity: active ? 1 : 0,
        transition: 'opacity 600ms ease',
      }}
    />
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

function SceneCaption({ scene }: { scene: Scene }) {
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
        className="font-bold tracking-tight text-2xl"
        style={{
          color: 'var(--ll-ink)',
          fontFamily:
            'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
        }}
      >
        {scene.headline}
      </h3>
      <p
        className="text-[14px] leading-relaxed"
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
