import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Supabase Auth トークンリフレッシュ（全マッチルートで実行）
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // トークンリフレッシュのために getUser() を呼ぶ
  await supabase.auth.getUser();

  // 管理画面の Cookie 認証（Phase 1 — 既存ロジック維持）
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      return response;
    }
    const adminAuth = request.cookies.get('admin-auth');
    if (!adminAuth || adminAuth.value !== 'true') {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/mypage/:path*',
    '/login',
    '/signup',
    '/auth/:path*',
    '/api/user/:path*',
  ],
};
