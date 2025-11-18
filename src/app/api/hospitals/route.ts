import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { Hospital } from '@/types/hospital';

/**
 * GET /api/hospitals
 * 全病院を取得
 */
export async function GET() {
  try {
    const { data: hospitals, error } = await supabase
      .from('hospitals')
      .select('*')
      .order('name');

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    return NextResponse.json({ hospitals: hospitals as Hospital[] });
  } catch (error) {
    console.error('Hospital fetch error:', error);
    return NextResponse.json(
      { error: '病院データの取得に失敗しました' },
      { status: 500 }
    );
  }
}
