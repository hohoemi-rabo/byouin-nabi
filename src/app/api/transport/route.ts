import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const area = searchParams.get('area');
    const type = searchParams.get('type');

    let query = supabase
      .from('transport_services')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (area) {
      query = query.contains('service_area', [area]);
    }
    if (type) {
      query = query.eq('service_type', type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Transport fetch error:', error);
      return NextResponse.json({ error: 'データの取得に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ services: data || [] });
  } catch (error) {
    console.error('Transport API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
