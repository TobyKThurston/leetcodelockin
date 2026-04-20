'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';
import { createSupabaseBrowser } from '@/lib/supabase-browser';

export default function PostHogUserIdentifier() {
  useEffect(() => {
    const supabase = createSupabaseBrowser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        posthog.identify(session.user.id, {
          email: session.user.email,
        });
      } else if (event === 'SIGNED_OUT') {
        posthog.reset();
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  return null;
}
