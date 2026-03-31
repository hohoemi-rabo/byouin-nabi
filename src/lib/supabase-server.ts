import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * サーバー用 Supabase クライアント（Server Components / API Routes 用）
 * リクエストごとに cookie からセッションを復元する
 */
export async function createSupabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component から呼ばれた場合は書き込み不可（正常動作）
          }
        },
      },
    }
  );
}
