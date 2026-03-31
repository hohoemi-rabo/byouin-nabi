import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';

export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  // 直近の履歴を取得し、同じ病院の重複を除去（最新のみ残す）
  const { data: rawData, error } = await supabase
    .from('search_history')
    .select('*, hospital:hospitals(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30);

  // 同じ病院の重複を除去して10件に絞る
  const seen = new Set<string>();
  const data = (rawData || []).filter(item => {
    const key = item.result_hospital_id || item.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 10);

  if (error) {
    return NextResponse.json({ error: '履歴の取得に失敗しました' }, { status: 500 });
  }

  return NextResponse.json({ history: data || [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  const { search_type, search_params, result_hospital_id } = await request.json();

  if (!search_type || !search_params) {
    return NextResponse.json({ error: '検索情報が必要です' }, { status: 400 });
  }

  const { error } = await supabase
    .from('search_history')
    .insert({
      user_id: user.id,
      search_type,
      search_params,
      result_hospital_id: result_hospital_id || null,
    });

  if (error) {
    console.error('History insert error:', error);
    return NextResponse.json({ error: '履歴の記録に失敗しました' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
