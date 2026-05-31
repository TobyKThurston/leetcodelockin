import { createBrowserClient } from '@supabase/ssr';

type SupabaseBrowserClient = ReturnType<
  typeof createBrowserClient<any, 'public'>
>;

export function hasSupabaseBrowserEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function isLocalBrowserHost() {
  if (typeof window === 'undefined') return false;
  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '::1'
  );
}

function createLocalSupabaseStub(): SupabaseBrowserClient {
  const emptyResult = Promise.resolve({ data: null, error: null });
  const query = {
    select: () => query,
    insert: () => query,
    update: () => query,
    upsert: () => query,
    delete: () => query,
    eq: () => query,
    neq: () => query,
    in: () => query,
    order: () => query,
    limit: () => query,
    single: () => emptyResult,
    maybeSingle: () => emptyResult,
    then: emptyResult.then.bind(emptyResult),
    catch: emptyResult.catch.bind(emptyResult),
    finally: emptyResult.finally.bind(emptyResult),
  };

  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe() {} } },
      }),
      signOut: async () => ({ error: null }),
      updateUser: async () => ({ data: { user: null }, error: null }),
    },
    from: () => query,
    rpc: () => query,
  } as unknown as SupabaseBrowserClient;
}

export function createSupabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if ((!url || !key) && isLocalBrowserHost()) {
    return createLocalSupabaseStub();
  }
  if (!url || !key) {
    throw new Error(
      'Supabase env vars missing: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }
  return createBrowserClient(url, key);
}
