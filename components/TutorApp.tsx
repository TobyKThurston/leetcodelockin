'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import type { SolveResponse } from '@/lib/types';
import UpgradePrompt from '@/components/UpgradePrompt';

const PATTERN_COLORS: Record<string, string> = {
  'sliding window': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'two pointers': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'hash map': 'bg-green-500/20 text-green-300 border-green-500/30',
  'hashmap': 'bg-green-500/20 text-green-300 border-green-500/30',
  'binary search': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  'bfs': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'dfs': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'dynamic programming': 'bg-red-500/20 text-red-300 border-red-500/30',
  'dp': 'bg-red-500/20 text-red-300 border-red-500/30',
  'stack': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'queue': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'greedy': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
};

function patternColor(pattern: string) {
  const key = pattern.toLowerCase();
  for (const [k, v] of Object.entries(PATTERN_COLORS)) {
    if (key.includes(k)) return v;
  }
  return 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30';
}

function PatternStats({ patterns }: { patterns: Record<string, number> }) {
  const entries = Object.entries(patterns);
  if (entries.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-xs text-muted-foreground">Patterns seen:</span>
      {entries.map(([p, count]) => (
        <Badge key={p} variant="outline" className={`text-xs ${patternColor(p)}`}>
          {p} ×{count}
        </Badge>
      ))}
    </div>
  );
}

function HintCard({ index, hint }: { index: number; hint: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <p className="text-xs font-semibold text-muted-foreground mb-1">
        Hint {index + 1} {index === 0 ? '— Think broadly' : index === 1 ? '— More specific' : '— Key insight'}
      </p>
      <p className="text-sm text-foreground leading-relaxed">{hint}</p>
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="relative rounded-lg border border-border bg-zinc-950 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <span className="text-xs text-muted-foreground font-mono">python</span>
        <button
          onClick={copy}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 text-sm text-zinc-100 font-mono overflow-x-auto leading-relaxed whitespace-pre">
        {code}
      </pre>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-16 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-16 w-full" />
      </div>
      <Skeleton className="h-4 w-32" />
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-4 w-full" style={{ width: `${85 + i * 2}%` }} />
        ))}
      </div>
    </div>
  );
}

export default function TutorApp() {
  const [problem, setProblem] = useState('');
  const [attempt, setAttempt] = useState('');
  const [response, setResponse] = useState<SolveResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState<{ used: number; limit: number } | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [showSteps, setShowSteps] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [patterns, setPatterns] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem('lc-patterns');
      if (stored) setPatterns(JSON.parse(stored));
    } catch {}
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!problem.trim()) return;

    setLoading(true);
    setError(null);
    setRateLimited(null);
    setResponse(null);
    setHintsShown(1);
    setShowSteps(false);
    setShowCode(false);

    try {
      const res = await fetch('/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem, attempt }),
      });
      const data = await res.json();
      if (res.status === 429) {
        setRateLimited({ used: data.used ?? 3, limit: data.limit ?? 3 });
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Request failed');

      setResponse(data);

      // Track patterns in localStorage
      const normalized = data.pattern?.trim();
      if (normalized) {
        setPatterns((prev) => {
          const next = { ...prev, [normalized]: (prev[normalized] ?? 0) + 1 };
          localStorage.setItem('lc-patterns', JSON.stringify(next));
          return next;
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setProblem('');
    setAttempt('');
    setResponse(null);
    setError(null);
    setHintsShown(0);
    setShowSteps(false);
    setShowCode(false);
  }

  const canShowMoreHints = response && hintsShown < response.hints.length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">LeetCode Tutor</h1>
          <p className="text-sm text-muted-foreground">
            Learn patterns, not just answers. Paste a problem and get guided step by step.
          </p>
          <PatternStats patterns={patterns} />
        </div>

        <Separator />

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="problem">Problem Description</Label>
            <Textarea
              id="problem"
              placeholder="Paste the problem here — e.g. 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target...'"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              className="min-h-[120px] font-mono text-sm resize-y"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attempt">
              Your Attempt{' '}
              <span className="text-muted-foreground font-normal">(optional — paste your code or describe your thinking)</span>
            </Label>
            <Textarea
              id="attempt"
              placeholder="def two_sum(nums, target):&#10;    # not sure where to start..."
              value={attempt}
              onChange={(e) => setAttempt(e.target.value)}
              className="min-h-[90px] font-mono text-sm resize-y"
              disabled={loading}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading || !problem.trim()} className="flex-1 sm:flex-none">
              {loading ? 'Thinking...' : 'Analyze Problem'}
            </Button>
            {response && (
              <Button type="button" variant="outline" onClick={reset}>
                New Problem
              </Button>
            )}
          </div>
        </form>

        {/* Rate limit */}
        {rateLimited && (
          <UpgradePrompt used={rateLimited.used} limit={rateLimited.limit} />
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <Card>
            <CardContent className="pt-6">
              <LoadingSkeleton />
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {response && !loading && (
          <div className="space-y-5">

            {/* Pattern */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Pattern identified:</span>
              <Badge className={`text-sm px-3 py-1 ${patternColor(response.pattern)}`}>
                {response.pattern}
              </Badge>
            </div>

            <Separator />

            {/* Hints */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-foreground">Hints</h2>
              {response.hints.slice(0, hintsShown).map((hint, i) => (
                <HintCard key={i} index={i} hint={hint} />
              ))}
              {canShowMoreHints && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setHintsShown((n) => n + 1)}
                >
                  Show next hint ({hintsShown}/{response.hints.length})
                </Button>
              )}
              {!canShowMoreHints && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSteps(true)}
                  className={showSteps ? 'hidden' : ''}
                >
                  Show step-by-step approach
                </Button>
              )}
            </div>

            {/* Steps */}
            {showSteps && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h2 className="text-sm font-semibold text-foreground">Step-by-Step Approach</h2>
                  <ol className="space-y-2">
                    {response.steps.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-mono font-medium mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-foreground leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>

                  {!showCode && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCode(true)}
                      className="mt-2"
                    >
                      Show solution code
                    </Button>
                  )}
                </div>
              </>
            )}

            {/* Code */}
            {showCode && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h2 className="text-sm font-semibold text-foreground">Solution</h2>
                  <CodeBlock code={response.code} />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
