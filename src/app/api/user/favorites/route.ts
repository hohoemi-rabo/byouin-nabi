import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';

const MAX_FAVORITES = 5;

export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('favorite_facilities')
    .select('*, hospital:hospitals(*)')
    .eq('user_id', user.id)
    .order('sort_order');

  if (error) {
    return NextResponse.json({ error: 'かかりつけ医の取得に失敗しました' }, { status: 500 });
  }

  return NextResponse.json({ favorites: data || [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  const { hospital_id } = await request.json();
  if (!hospital_id) {
    return NextResponse.json({ error: '病院IDが必要です' }, { status: 400 });
  }

  // 上限チェック
  const { count } = await supabase
    .from('favorite_facilities')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (count !== null && count >= MAX_FAVORITES) {
    return NextResponse.json({ error: `かかりつけ医は最大${MAX_FAVORITES}件までです` }, { status: 400 });
  }

  const { error } = await supabase
    .from('favorite_facilities')
    .insert({ user_id: user.id, hospital_id, sort_order: (count || 0) });

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: '既に登録されています' }, { status: 409 });
    }
    return NextResponse.json({ error: '登録に失敗しました' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function PUT(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  const { ordered_ids } = await request.json();
  if (!Array.isArray(ordered_ids)) {
    return NextResponse.json({ error: '並び順が不正です' }, { status: 400 });
  }

  // 各IDにsort_orderを更新
  for (let i = 0; i < ordered_ids.length; i++) {
    await supabase
      .from('favorite_facilities')
      .update({ sort_order: i })
      .eq('user_id', user.id)
      .eq('hospital_id', ordered_ids[i]);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  const { hospital_id } = await request.json();
  if (!hospital_id) {
    return NextResponse.json({ error: '病院IDが必要です' }, { status: 400 });
  }

  const { error } = await supabase
    .from('favorite_facilities')
    .delete()
    .eq('user_id', user.id)
    .eq('hospital_id', hospital_id);

  if (error) {
    return NextResponse.json({ error: '解除に失敗しました' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
