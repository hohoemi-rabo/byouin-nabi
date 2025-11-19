'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { parse } from 'papaparse';
import * as XLSX from 'xlsx';

// 認証チェック関数
async function verifyAdminAuth() {
  const cookieStore = await cookies();
  const adminAuth = cookieStore.get('admin-auth');

  if (!adminAuth || adminAuth.value !== 'true') {
    throw new Error('管理者権限が必要です');
  }
}

// 病院登録
export async function createHospital(formData: FormData) {
  await verifyAdminAuth();

  const categoryString = formData.get('category') as string;
  const categories = categoryString
    .split(',')
    .map(cat => cat.trim())
    .filter(cat => cat.length > 0);

  const hospitalData = {
    name: formData.get('name') as string,
    category: categories,
    address: formData.get('address') as string,
    tel: formData.get('tel') as string,
    city: formData.get('city') as string,
    opening_hours: formData.get('opening_hours') as string || null,
    google_map_url: formData.get('google_map_url') as string || null,
    website: formData.get('website') as string || null,
    note: formData.get('note') as string || null,
  };

  // バリデーション
  if (!hospitalData.name || !hospitalData.address || !hospitalData.tel || !hospitalData.city) {
    throw new Error('必須項目が入力されていません');
  }

  if (categories.length === 0) {
    throw new Error('診療科を1つ以上入力してください');
  }

  const { error } = await supabaseAdmin
    .from('hospitals')
    .insert(hospitalData)
    .select()
    .single();

  if (error) {
    console.error('Create hospital error:', error);
    throw new Error('病院の登録に失敗しました: ' + error.message);
  }

  revalidatePath('/admin/hospitals');
  redirect('/admin/hospitals?success=created');
}

// 病院更新
export async function updateHospital(hospitalId: string, formData: FormData) {
  await verifyAdminAuth();

  const categoryString = formData.get('category') as string;
  const categories = categoryString
    .split(',')
    .map(cat => cat.trim())
    .filter(cat => cat.length > 0);

  const hospitalData = {
    name: formData.get('name') as string,
    category: categories,
    address: formData.get('address') as string,
    tel: formData.get('tel') as string,
    city: formData.get('city') as string,
    opening_hours: formData.get('opening_hours') as string || null,
    google_map_url: formData.get('google_map_url') as string || null,
    website: formData.get('website') as string || null,
    note: formData.get('note') as string || null,
    updated_at: new Date().toISOString(),
  };

  // バリデーション
  if (!hospitalData.name || !hospitalData.address || !hospitalData.tel || !hospitalData.city) {
    throw new Error('必須項目が入力されていません');
  }

  if (categories.length === 0) {
    throw new Error('診療科を1つ以上入力してください');
  }

  const { error } = await supabaseAdmin
    .from('hospitals')
    .update(hospitalData)
    .eq('id', hospitalId);

  if (error) {
    console.error('Update hospital error:', error);
    throw new Error('病院の更新に失敗しました: ' + error.message);
  }

  revalidatePath('/admin/hospitals');
  redirect('/admin/hospitals?success=updated');
}

// 病院削除
export async function deleteHospital(hospitalId: string) {
  await verifyAdminAuth();

  const { error } = await supabaseAdmin
    .from('hospitals')
    .delete()
    .eq('id', hospitalId);

  if (error) {
    console.error('Delete hospital error:', error);
    throw new Error('病院の削除に失敗しました: ' + error.message);
  }

  revalidatePath('/admin/hospitals');
  return { success: true };
}

// インポート結果の型定義
export interface ImportResult {
  success: number;
  errors: Array<{ row: number; message: string }>;
}

// 病院データ一括インポート
export async function importHospitals(formData: FormData): Promise<ImportResult> {
  await verifyAdminAuth();

  const file = formData.get('file') as File;
  if (!file) {
    throw new Error('ファイルが選択されていません');
  }

  const fileName = file.name.toLowerCase();
  let parsedData: Record<string, unknown>[] = [];

  try {
    // ファイル形式による解析
    if (fileName.endsWith('.csv')) {
      const text = await file.text();
      const result = parse(text, {
        header: true,
        skipEmptyLines: true,
      });
      parsedData = result.data as Record<string, unknown>[];
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      parsedData = XLSX.utils.sheet_to_json(worksheet);
    } else {
      throw new Error('対応していないファイル形式です（CSV, XLSXのみ）');
    }
  } catch (error) {
    console.error('File parsing error:', error);
    throw new Error('ファイルの解析に失敗しました: ' + (error instanceof Error ? error.message : '不明なエラー'));
  }

  const result: ImportResult = {
    success: 0,
    errors: [],
  };

  // 既存データを全削除
  const { error: deleteError } = await supabaseAdmin
    .from('hospitals')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // 全件削除のトリック

  if (deleteError) {
    console.error('Delete all hospitals error:', deleteError);
    throw new Error('既存データの削除に失敗しました: ' + deleteError.message);
  }

  // データのバリデーションと挿入
  for (let i = 0; i < parsedData.length; i++) {
    const row = parsedData[i];
    const rowNumber = i + 2; // ヘッダー行を考慮

    try {
      // バリデーション
      if (!row['病院名'] || !row['住所'] || !row['電話番号'] || !row['市町村']) {
        throw new Error('必須項目（病院名、住所、電話番号、市町村）が不足しています');
      }

      // 診療科のパース
      const categories = row['診療科']
        ? String(row['診療科']).split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
        : [];

      if (categories.length === 0) {
        throw new Error('診療科を1つ以上入力してください');
      }

      const hospitalData = {
        name: String(row['病院名']).trim(),
        category: categories,
        address: String(row['住所']).trim(),
        tel: String(row['電話番号']).trim(),
        city: String(row['市町村']).trim(),
        opening_hours: row['診療時間'] ? String(row['診療時間']).trim() : null,
        google_map_url: row['Google Maps URL'] ? String(row['Google Maps URL']).trim() : null,
        website: row['Webサイト'] ? String(row['Webサイト']).trim() : null,
        note: row['備考'] ? String(row['備考']).trim() : null,
      };

      // データ挿入
      const { error } = await supabaseAdmin
        .from('hospitals')
        .insert(hospitalData);

      if (error) {
        throw error;
      }

      result.success++;
    } catch (error) {
      result.errors.push({
        row: rowNumber,
        message: error instanceof Error ? error.message : '不明なエラー',
      });
    }
  }

  // キャッシュの再検証
  revalidatePath('/admin/hospitals');

  return result;
}

// 登録データをCSV形式でエクスポート
export async function exportHospitalsCSV(): Promise<string> {
  await verifyAdminAuth();

  // 全病院データを取得
  const { data: hospitals, error } = await supabaseAdmin
    .from('hospitals')
    .select('*')
    .order('name');

  if (error) {
    console.error('Export hospitals error:', error);
    throw new Error('病院データの取得に失敗しました');
  }

  // CSVヘッダー
  const header = '病院名,診療科,住所,電話番号,市町村,診療時間,Google Maps URL,Webサイト,備考';

  // CSVデータ行
  const rows = hospitals.map(hospital => {
    const categories = hospital.category.join(',');
    const fields = [
      hospital.name,
      `"${categories}"`, // カンマ区切りなのでダブルクォートで囲む
      hospital.address,
      hospital.tel,
      hospital.city,
      hospital.opening_hours || '',
      hospital.google_map_url || '',
      hospital.website || '',
      hospital.note || '',
    ];
    return fields.join(',');
  });

  // UTF-8 BOM + ヘッダー + データ行
  const csvContent = '\uFEFF' + [header, ...rows].join('\n');

  return csvContent;
}
