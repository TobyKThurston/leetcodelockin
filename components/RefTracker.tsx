'use client';

import { useEffect } from 'react';

const COOKIE_NAME = 'll_ref';
const MAX_AGE_DAYS = 90;

export default function RefTracker() {
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (!ref) return;

    const safe = ref.slice(0, 32).replace(/[^a-zA-Z0-9_-]/g, '');
    if (!safe) return;

    document.cookie = `${COOKIE_NAME}=${safe}; path=/; max-age=${MAX_AGE_DAYS * 24 * 60 * 60}; SameSite=Lax`;
  }, []);

  return null;
}
