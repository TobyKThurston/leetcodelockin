'use client';

import { useEffect, useRef, useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase-browser';

/**
 * Reads the current Supabase session on mount. Returns:
 *   - null while loading,
 *   - true if the visitor has no session (browsing as guest),
 *   - false if signed in.
 *
 * `ref` mirrors the latest value for use inside event handlers without
 * introducing render dependencies.
 */
export function useIsGuest(): { isGuest: boolean | null; ref: React.MutableRefObject<boolean | null> } {
  const [isGuest, setIsGuest] = useState<boolean | null>(null);
  const ref = useRef<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = createSupabaseBrowser();
    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      const guest = !data.user;
      ref.current = guest;
      setIsGuest(guest);
    });
    return () => { cancelled = true; };
  }, []);

  return { isGuest, ref };
}
