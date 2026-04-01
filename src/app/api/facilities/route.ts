import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get('category');
    const city = searchParams.get('city');

    let query = supabase
      .from('facilities')
      .select('id, name, category, address, city, phone, latitude, longitude, website_url, opening_hours, notes')
      .eq('is_active', true)
      .order('name');

    if (category) query = query.eq('category', category);
    if (city) query = query.eq('city', city);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'データの取得に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ facilities: data || [] });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
