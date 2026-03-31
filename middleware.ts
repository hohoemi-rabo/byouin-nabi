import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Supabase公式パターン: supabaseResponse を再代入する形式
  // https://supabase.com/docs/guides/getting-started/ai-prompts/nextjs-supabase-auth
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // セッションリフレッシュ（この呼び出しを省略するとユーザーが突然ログアウトされる）
  await supabase.auth.getUser();

  // 管理画面の Cookie 認証（Phase 1 — 既存ロジック維持）
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      return supabaseResponse;
    }
    const adminAuth = request.cookies.get('admin-auth');
    if (!adminAuth || adminAuth.value !== 'true') {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 重要: supabaseResponse をそのまま返す（cookieの同期のため）
  return supabaseResponse;
}

export const config = {
  matcher: [
    // Supabase auth + admin + user pages
    '/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
