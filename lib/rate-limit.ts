// In-memory sliding-window rate limiter.
//
// State lives in a Map per serverless instance. On Vercel that means a motivated
// attacker can dodge limits by hitting multiple regions. This is intentionally a
// speed bump, not a distributed SLA — the durable caps are:
//   - Supabase RLS (who can read what)
//   - lib/subscription.ts daily/lifetime AI quotas (how much each user can spend)
//
// What this layer DOES catch: runaway client loops, single-region scraping,
// accidental self-DoS from a broken useEffect.

export interface Bucket {
  windowMs: number;
  max: number;
}

export const BUCKETS = {
  AI_BURST:    { windowMs: 60_000, max: 20 },
  WRITE_BURST: { windowMs: 60_000, max: 30 },
  READ_BURST:  { windowMs: 60_000, max: 60 },
  IP_GLOBAL:   { windowMs: 60_000, max: 120 },
} as const satisfies Record<string, Bucket>;

export type BucketName = keyof typeof BUCKETS;

export interface RateLimitResult {
  ok: boolean;
  retryAfterSec: number;
}

const stores: Record<BucketName, Map<string, number[]>> = {
  AI_BURST: new Map(),
  WRITE_BURST: new Map(),
  READ_BURST: new Map(),
  IP_GLOBAL: new Map(),
};

const MAX_KEYS_BEFORE_GC = 1000;

export function checkRateLimit(bucket: BucketName, key: string): RateLimitResult {
  const cfg = BUCKETS[bucket];
  const store = stores[bucket];
  const now = Date.now();
  const cutoff = now - cfg.windowMs;

  const recent = (store.get(key) ?? []).filter((t) => t > cutoff);

  if (recent.length >= cfg.max) {
    store.set(key, recent);
    const oldest = recent[0];
    const retryAfterSec = Math.max(1, Math.ceil((oldest + cfg.windowMs - now) / 1000));
    return { ok: false, retryAfterSec };
  }

  recent.push(now);
  store.set(key, recent);

  if (store.size > MAX_KEYS_BEFORE_GC) {
    for (const [k, v] of store) {
      const kept = v.filter((t) => t > cutoff);
      if (kept.length === 0) store.delete(k);
      else store.set(k, kept);
    }
  }

  return { ok: true, retryAfterSec: 0 };
}

// Route → bucket classification. Prefix-matched in order; first hit wins.
// Returning null means "do not throttle this route" (webhook, auth callback).
const ROUTE_BUCKETS: Array<[string, BucketName | null]> = [
  ['/api/stripe/webhook', null],
  ['/api/auth/', null],

  ['/api/solve', 'AI_BURST'],
  ['/api/tutor-chat', 'AI_BURST'],
  ['/api/interview-feedback', 'AI_BURST'],
  ['/api/review/generate', 'AI_BURST'],

  ['/api/submit', 'WRITE_BURST'],
  ['/api/review/record', 'WRITE_BURST'],
  ['/api/review/dismiss', 'WRITE_BURST'],
  ['/api/stripe/checkout', 'WRITE_BURST'],
  ['/api/stripe/portal', 'WRITE_BURST'],

  ['/api/problem/', 'READ_BURST'],
  ['/api/solved-slugs', 'READ_BURST'],
  ['/api/review/due', 'READ_BURST'],
  ['/api/ai-usage', 'READ_BURST'],
];

export function bucketForPath(pathname: string): BucketName | null {
  for (const [prefix, bucket] of ROUTE_BUCKETS) {
    if (pathname === prefix || pathname.startsWith(prefix)) return bucket;
  }
  return 'READ_BURST';
}

export function isRateLimitExempt(pathname: string): boolean {
  for (const [prefix, bucket] of ROUTE_BUCKETS) {
    if ((pathname === prefix || pathname.startsWith(prefix)) && bucket === null) return true;
  }
  return false;
}
