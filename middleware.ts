import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 管理画面へのアクセス
  if (pathname.startsWith('/admin')) {
    // ログインページは除外
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // 認証チェック
    const adminAuth = request.cookies.get('admin-auth');

    // 未認証の場合はログインページへリダイレクト
    if (!adminAuth || adminAuth.value !== 'true') {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
