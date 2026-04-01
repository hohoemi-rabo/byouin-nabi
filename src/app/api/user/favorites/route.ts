import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';

const MAX_FAVORITES = 5;

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  // 単一病院のチェック（FavoriteButton用）
  const checkId = request.nextUrl.searchParams.get('check');
  if (checkId) {
    const { data } = await supabase
      .from('favorite_facilities')
      .select('id')
      .eq('user_id', user.id)
      .eq('hospital_id', checkId)
      .maybeSingle();
    return NextResponse.json({ isFavorite: !!data });
  }

  // 全件取得（マイページ用）
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

  // RPC関数でバッチ更新（N+1解消）
  const { error } = await supabase
    .rpc('update_favorite_order', {
      p_user_id: user.id,
      p_ordered_ids: ordered_ids,
    });

  if (error) {
    return NextResponse.json({ error: '並び順の更新に失敗しました' }, { status: 500 });
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
