'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createSupabaseBrowser } from '@/lib/supabase-browser';

const SG = { fontFamily: 'var(--font-space-grotesk), sans-serif' };

export default function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    router.refresh();
    router.push('/');
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSignOut}
      disabled={loading}
      className="text-[12.5px]"
      style={SG}
    >
      <LogOut className="size-4 mr-1.5" />
      {loading ? 'Signing out…' : 'Sign out'}
    </Button>
  );
}
