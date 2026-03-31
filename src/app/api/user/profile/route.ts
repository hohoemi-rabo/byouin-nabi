import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';

export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: 'プロフィールの取得に失敗しました' }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}

export async function PUT(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  const body = await request.json();
  const { display_name, age_group, area, has_car, mobility_aid, font_size } = body;

  if (!display_name || !age_group || !area) {
    return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 });
  }

  const profileData = {
    id: user.id,
    display_name,
    age_group,
    area,
    has_car: has_car || false,
    mobility_aid: mobility_aid || 'none',
    font_size: font_size || 'medium',
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(profileData, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Profile upsert error:', error);
    return NextResponse.json({ error: 'プロフィールの保存に失敗しました' }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}
