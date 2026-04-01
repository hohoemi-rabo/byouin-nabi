import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { log_type, search_data, area } = await request.json();

    if (!log_type || !search_data) {
      return NextResponse.json({ error: 'log_type と search_data は必須です' }, { status: 400 });
    }

    await supabase.from('search_logs').insert({
      log_type,
      search_data,
      area: area || null,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'ログの記録に失敗しました' }, { status: 500 });
  }
}
