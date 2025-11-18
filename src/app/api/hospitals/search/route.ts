import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { Hospital } from '@/types/hospital';

/**
 * GET /api/hospitals/search?categories=内科,整形外科
 * 診療科で病院を検索
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoriesParam = searchParams.get('categories');

    if (!categoriesParam) {
      return NextResponse.json(
        { error: '診療科を指定してください' },
        { status: 400 }
      );
    }

    // カンマ区切りの診療科を配列に変換
    const categories = categoriesParam.split(',').map(c => c.trim()).filter(Boolean);

    if (categories.length === 0) {
      return NextResponse.json(
        { error: '診療科を指定してください' },
        { status: 400 }
      );
    }

    // 診療科の配列と重複する病院を検索
    const { data: hospitals, error } = await supabase
      .from('hospitals')
      .select('*')
      .overlaps('category', categories)
      .order('name');

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    // 優先順位でソート：推奨診療科が最初に来るものを優先
    // 複数の推奨診療科に該当する病院を優先
    const sortedHospitals = (hospitals as Hospital[]).sort((a, b) => {
      const aMatchCount = a.category.filter(c => categories.includes(c)).length;
      const bMatchCount = b.category.filter(c => categories.includes(c)).length;

      // マッチ数が多い順にソート
      if (aMatchCount !== bMatchCount) {
        return bMatchCount - aMatchCount;
      }

      // 最初の推奨診療科を専門としている病院を優先
      const firstCategory = categories[0];
      const aHasFirst = a.category.includes(firstCategory);
      const bHasFirst = b.category.includes(firstCategory);

      if (aHasFirst && !bHasFirst) return -1;
      if (!aHasFirst && bHasFirst) return 1;

      return 0;
    });

    return NextResponse.json({ hospitals: sortedHospitals });
  } catch (error) {
    console.error('Hospital search error:', error);
    return NextResponse.json(
      { error: '病院の検索に失敗しました' },
      { status: 500 }
    );
  }
}
