import { createBrowserClient } from '@supabase/ssr';

/**
 * ブラウザ用 Supabase クライアント（Client Components 用）
 * Auth セッションの cookie 管理を自動で行う
 */
export function createSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
