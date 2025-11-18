import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    // 環境変数から管理者パスワードを取得
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        { error: '管理者パスワードが設定されていません' },
        { status: 500 }
      );
    }

    // パスワード検証
    if (password === adminPassword) {
      const response = NextResponse.json({ success: true });

      // Cookieに認証トークンを設定
      response.cookies.set('admin-auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24時間
      });

      return response;
    }

    return NextResponse.json(
      { error: 'パスワードが正しくありません' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'ログインに失敗しました' },
      { status: 500 }
    );
  }
}
