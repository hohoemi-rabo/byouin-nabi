import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });

  // Cookieから認証トークンを削除
  response.cookies.delete('admin-auth');

  return response;
}
