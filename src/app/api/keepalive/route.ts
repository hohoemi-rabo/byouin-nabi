import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// キャッシュさせず、毎回必ず実行する
export const dynamic = 'force-dynamic';

/**
 * GET /api/keepalive
 *
 * Supabase 無料プランのスリープ（7日無アクティビティで一時停止）を防ぐための
 * keepalive エンドポイント。Vercel Cron から 1 日 1 回呼び出される想定。
 *
 * 単に 200 を返すだけでは「DB の活動」にならないため、実際に Supabase へ
 * 軽量な件数取得クエリ（head:true / count:'exact'）を投げる。
 *
 * 認証: Vercel Cron が自動付与する `Authorization: Bearer ${CRON_SECRET}` を検証。
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  // CRON_SECRET 未設定時に "Bearer undefined" で通ってしまうのを防ぐ
  if (!process.env.CRON_SECRET) {
    console.error('[keepalive] CRON_SECRET is not set');
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  // 実際に DB へ軽量クエリを投げて「活動」を発生させる（行データは取得しない）
  const { count, error } = await supabase
    .from('hospitals')
    .select('*', { head: true, count: 'exact' });

  if (error) {
    console.error('[keepalive] Supabase query failed:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    count,
    timestamp: new Date().toISOString(),
  });
}
