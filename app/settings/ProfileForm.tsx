'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createSupabaseBrowser } from '@/lib/supabase-browser';

const SG = { fontFamily: 'var(--font-space-grotesk), sans-serif' };

type Status = 'idle' | 'saving' | 'saved' | 'error';

export default function ProfileForm({
  initialName,
  email,
}: {
  initialName: string;
  email: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const dirty = name.trim() !== initialName.trim();

  async function handleSave() {
    if (!dirty) return;
    setStatus('saving');
    setError(null);
    const supabase = createSupabaseBrowser();
    const { error: updateError } = await supabase.auth.updateUser({
      data: { full_name: name.trim() },
    });
    if (updateError) {
      setStatus('error');
      setError(updateError.message);
      return;
    }
    setStatus('saved');
    router.refresh();
    setTimeout(() => setStatus('idle'), 1800);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name" className="text-zinc-300" style={SG}>
            Display name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="h-10 bg-white/[0.03] border-white/10 text-white placeholder:text-zinc-600"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="text-zinc-300" style={SG}>
            Email
          </Label>
          <Input
            id="email"
            type="email"
            defaultValue={email}
            disabled
            className="h-10 bg-white/[0.03] border-white/10 text-white placeholder:text-zinc-600"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!dirty || status === 'saving'}
          className="text-[12.5px]"
          style={SG}
        >
          {status === 'saving' ? (
            <>
              <Loader2 className="size-3.5 mr-1.5 animate-spin" />
              Saving…
            </>
          ) : status === 'saved' ? (
            <>
              <Check className="size-3.5 mr-1.5" />
              Saved
            </>
          ) : (
            'Save changes'
          )}
        </Button>
        {error && (
          <span className="text-[12px] text-rose-400" style={SG}>
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
