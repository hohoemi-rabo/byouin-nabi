import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { parseCommaSeparatedList } from '@/lib/queryUtils';
import type { Hospital } from '@/types/hospital';

/**
 * GET /api/search?categories=内科,外科&cities=飯田市&keyword=病院
 * 複数条件で病院を検索
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categories = parseCommaSeparatedList(searchParams.get('categories'));
    const cities = parseCommaSeparatedList(searchParams.get('cities'));
    const keyword = searchParams.get('keyword');

    // ベースクエリ
    let query = supabase
      .from('hospitals')
      .select(`
        *,
        schedules:hospital_schedules(*)
      `)
      .order('name');

    // 診療科でフィルタリング
    if (categories.length > 0) {
      query = query.overlaps('category', categories);
    }

    // 市町村でフィルタリング
    if (cities.length > 0) {
      query = query.in('city', cities);
    }

    // キーワードでフィルタリング（病院名）
    if (keyword && keyword.trim()) {
      query = query.ilike('name', `%${keyword.trim()}%`);
    }

    const { data: hospitals, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    return NextResponse.json({
      hospitals: hospitals as Hospital[],
      count: hospitals?.length || 0
    });
  } catch (error) {
    console.error('Hospital search error:', error);
    return NextResponse.json(
      { error: '病院の検索に失敗しました' },
      { status: 500 }
    );
  }
}
