'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { parse } from 'papaparse';
import * as XLSX from 'xlsx';
import { isHolidayOrSunday } from '@/lib/holidays';
import type {
  RotationType,
  EmergencyRotation,
  NightFacilityInfo,
  ImportRotationResult,
} from '@/types/emergency-rotation';

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

  const latStr = formData.get('latitude') as string;
  const lngStr = formData.get('longitude') as string;

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
    latitude: latStr ? parseFloat(latStr) : null,
    longitude: lngStr ? parseFloat(lngStr) : null,
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

  const latStr2 = formData.get('latitude') as string;
  const lngStr2 = formData.get('longitude') as string;

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
    latitude: latStr2 ? parseFloat(latStr2) : null,
    longitude: lngStr2 ? parseFloat(lngStr2) : null,
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

  // バリデーションフェーズ: 全行を検証し、有効データとエラーを分離
  const validData: Array<{
    name: string;
    category: string[];
    address: string;
    tel: string;
    city: string;
    opening_hours: string | null;
    google_map_url: string | null;
    website: string | null;
    note: string | null;
  }> = [];

  for (let i = 0; i < parsedData.length; i++) {
    const row = parsedData[i];
    const rowNumber = i + 2; // ヘッダー行を考慮

    try {
      if (!row['病院名'] || !row['住所'] || !row['電話番号'] || !row['市町村']) {
        throw new Error('必須項目（病院名、住所、電話番号、市町村）が不足しています');
      }

      const categories = row['診療科']
        ? String(row['診療科']).split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
        : [];

      if (categories.length === 0) {
        throw new Error('診療科を1つ以上入力してください');
      }

      validData.push({
        name: String(row['病院名']).trim(),
        category: categories,
        address: String(row['住所']).trim(),
        tel: String(row['電話番号']).trim(),
        city: String(row['市町村']).trim(),
        opening_hours: row['診療時間'] ? String(row['診療時間']).trim() : null,
        google_map_url: row['Google Maps URL'] ? String(row['Google Maps URL']).trim() : null,
        website: row['Webサイト'] ? String(row['Webサイト']).trim() : null,
        note: row['備考'] ? String(row['備考']).trim() : null,
      });
    } catch (error) {
      result.errors.push({
        row: rowNumber,
        message: error instanceof Error ? error.message : '不明なエラー',
      });
    }
  }

  // インサートフェーズ: 有効データを一括挿入
  if (validData.length > 0) {
    const { error: insertError } = await supabaseAdmin
      .from('hospitals')
      .insert(validData);

    if (insertError) {
      console.error('Batch insert error:', insertError);
      throw new Error('病院データの一括登録に失敗しました: ' + insertError.message);
    }

    result.success = validData.length;
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

// ========================================
// 診療時間管理
// ========================================

export interface ScheduleFormData {
  day_of_week: number;
  morning_start: string;
  morning_end: string;
  afternoon_start: string;
  afternoon_end: string;
  is_closed: boolean;
  note: string;
}

/**
 * 病院の診療時間を取得
 */
export async function getHospitalSchedules(hospitalId: string) {
  await verifyAdminAuth();

  const { data: schedules, error } = await supabaseAdmin
    .from('hospital_schedules')
    .select('*')
    .eq('hospital_id', hospitalId)
    .order('day_of_week');

  if (error) {
    throw new Error('診療時間の取得に失敗しました: ' + error.message);
  }

  return schedules || [];
}

/**
 * 病院の診療時間を一括更新（既存を削除して新規作成）
 */
export async function updateHospitalSchedules(
  hospitalId: string,
  schedulesData: ScheduleFormData[]
) {
  await verifyAdminAuth();

  // 既存の診療時間を全削除
  const { error: deleteError } = await supabaseAdmin
    .from('hospital_schedules')
    .delete()
    .eq('hospital_id', hospitalId);

  if (deleteError) {
    throw new Error('既存診療時間の削除に失敗しました: ' + deleteError.message);
  }

  // 新しい診療時間を挿入
  const newSchedules = schedulesData.map(schedule => ({
    hospital_id: hospitalId,
    day_of_week: schedule.day_of_week,
    morning_start: schedule.morning_start || null,
    morning_end: schedule.morning_end || null,
    afternoon_start: schedule.afternoon_start || null,
    afternoon_end: schedule.afternoon_end || null,
    is_closed: schedule.is_closed,
    note: schedule.note || null,
  }));

  const { error: insertError } = await supabaseAdmin
    .from('hospital_schedules')
    .insert(newSchedules);

  if (insertError) {
    throw new Error('診療時間の登録に失敗しました: ' + insertError.message);
  }

  // キャッシュ再検証
  revalidatePath('/admin/hospitals');
  revalidatePath('/results');

  return { success: true };
}

// 既存病院データの一括座標変換
export async function geocodeAllHospitals(): Promise<{ updated: number; failed: number; errors: string[] }> {
  await verifyAdminAuth();

  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('Google Maps API キーが設定されていません');
  }

  const { data: hospitals, error } = await supabaseAdmin
    .from('hospitals')
    .select('id, name, address')
    .is('latitude', null);

  if (error) throw new Error('病院データの取得に失敗しました: ' + error.message);
  if (!hospitals || hospitals.length === 0) return { updated: 0, failed: 0, errors: [] };

  let updated = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const h of hospitals) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(h.address)}&key=${apiKey}&language=ja`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.status === 'OK' && data.results?.length) {
        const { lat, lng } = data.results[0].geometry.location;
        await supabaseAdmin
          .from('hospitals')
          .update({ latitude: lat, longitude: lng })
          .eq('id', h.id);
        updated++;
      } else {
        failed++;
        errors.push(`${h.name}: 座標が見つかりません`);
      }

      // レート制限対策: 50ms待機
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (err) {
      failed++;
      errors.push(`${h.name}: ${err instanceof Error ? err.message : '不明なエラー'}`);
    }
  }

  revalidatePath('/admin/hospitals');
  return { updated, failed, errors };
}

// ========================================
// 救急ローテーション管理
// ========================================

const ROTATION_TYPES: RotationType[] = [
  'night_emergency',
  'duty_doctor',
  'duty_dentist',
  'duty_pharmacy',
];

function parseRotationFormData(formData: FormData) {
  const rotationType = formData.get('rotation_type') as RotationType;
  const dutyDate = formData.get('duty_date') as string;
  const area = formData.get('area') as string;
  const department = formData.get('department') as string;
  const hospitalId = formData.get('hospital_id') as string;
  const facilityName = formData.get('facility_name') as string;
  const phone = formData.get('phone') as string;
  const startTime = formData.get('start_time') as string;
  const endTime = formData.get('end_time') as string;
  const note = formData.get('note') as string;

  // バリデーション
  if (!dutyDate || !rotationType || !area || !facilityName || !phone || !startTime || !endTime) {
    throw new Error('必須項目が入力されていません');
  }
  if (!ROTATION_TYPES.includes(rotationType)) {
    throw new Error('種別が不正です');
  }
  if (startTime >= endTime) {
    throw new Error('開始時刻は終了時刻より前にしてください');
  }

  // source_month は duty_date から自動算出（YYYY-MM）
  const sourceMonth = dutyDate.slice(0, 7);

  // 薬局・夜間急患は department を強制的に NULL
  const finalDepartment =
    rotationType === 'duty_pharmacy' || rotationType === 'night_emergency'
      ? null
      : department || null;

  return {
    duty_date: dutyDate,
    rotation_type: rotationType,
    area: area.trim(),
    department: finalDepartment,
    hospital_id: hospitalId || null,
    facility_name: facilityName.trim(),
    phone: phone.trim(),
    start_time: startTime,
    end_time: endTime,
    note: note?.trim() || null,
    source_month: sourceMonth,
  };
}

export async function createEmergencyRotation(formData: FormData) {
  await verifyAdminAuth();

  const data = parseRotationFormData(formData);

  const { error } = await supabaseAdmin
    .from('emergency_rotations')
    .insert(data);

  if (error) {
    console.error('Create emergency rotation error:', error);
    throw new Error('救急ローテーションの登録に失敗しました: ' + error.message);
  }

  revalidatePath('/admin/emergency-rotations');
  redirect(`/admin/emergency-rotations?success=created&month=${data.source_month}`);
}

export async function updateEmergencyRotation(rotationId: string, formData: FormData) {
  await verifyAdminAuth();

  const data = parseRotationFormData(formData);

  const { error } = await supabaseAdmin
    .from('emergency_rotations')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', rotationId);

  if (error) {
    console.error('Update emergency rotation error:', error);
    throw new Error('救急ローテーションの更新に失敗しました: ' + error.message);
  }

  revalidatePath('/admin/emergency-rotations');
  redirect(`/admin/emergency-rotations?success=updated&month=${data.source_month}`);
}

export async function deleteEmergencyRotation(rotationId: string) {
  await verifyAdminAuth();

  const { error } = await supabaseAdmin
    .from('emergency_rotations')
    .delete()
    .eq('id', rotationId);

  if (error) {
    console.error('Delete emergency rotation error:', error);
    throw new Error('救急ローテーションの削除に失敗しました: ' + error.message);
  }

  revalidatePath('/admin/emergency-rotations');
  return { success: true };
}

export async function deleteRotationsByMonth(sourceMonth: string) {
  await verifyAdminAuth();

  if (!/^\d{4}-\d{2}$/.test(sourceMonth)) {
    throw new Error('対象月の形式が不正です（YYYY-MM）');
  }

  const { error, count } = await supabaseAdmin
    .from('emergency_rotations')
    .delete({ count: 'exact' })
    .eq('source_month', sourceMonth);

  if (error) {
    throw new Error('月次データの削除に失敗しました: ' + error.message);
  }

  revalidatePath('/admin/emergency-rotations');
  return { success: true, deleted: count ?? 0 };
}

export async function getEmergencyRotationsByMonth(sourceMonth: string) {
  await verifyAdminAuth();

  const { data, error } = await supabaseAdmin
    .from('emergency_rotations')
    .select('*')
    .eq('source_month', sourceMonth)
    .order('duty_date', { ascending: true })
    .order('rotation_type', { ascending: true })
    .order('department', { ascending: true, nullsFirst: false });

  if (error) {
    throw new Error('救急ローテーションの取得に失敗しました: ' + error.message);
  }

  return (data || []) as EmergencyRotation[];
}

export async function getAvailableSourceMonths(): Promise<string[]> {
  await verifyAdminAuth();

  const { data, error } = await supabaseAdmin
    .from('emergency_rotations')
    .select('source_month')
    .order('source_month', { ascending: false });

  if (error) {
    throw new Error('対象月一覧の取得に失敗しました: ' + error.message);
  }

  const unique = Array.from(new Set((data || []).map((r) => r.source_month as string)));
  return unique;
}

/**
 * CSV/Excel 一括インポート
 * - 同じ source_month の既存データを全削除してからバッチ INSERT
 */
export async function importEmergencyRotations(
  formData: FormData,
  sourceMonth: string
): Promise<ImportRotationResult> {
  await verifyAdminAuth();

  if (!/^\d{4}-\d{2}$/.test(sourceMonth)) {
    throw new Error('対象月の形式が不正です（YYYY-MM）');
  }

  const file = formData.get('file') as File;
  if (!file) {
    throw new Error('ファイルが選択されていません');
  }

  const fileName = file.name.toLowerCase();
  let parsedData: Record<string, unknown>[] = [];

  try {
    if (fileName.endsWith('.csv')) {
      const text = await file.text();
      const result = parse(text, { header: true, skipEmptyLines: true });
      parsedData = result.data as Record<string, unknown>[];
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      parsedData = XLSX.utils.sheet_to_json(worksheet);
    } else {
      throw new Error('対応していないファイル形式です（CSV, XLSXのみ）');
    }
  } catch (err) {
    throw new Error(
      'ファイルの解析に失敗しました: ' + (err instanceof Error ? err.message : '不明なエラー')
    );
  }

  const result: ImportRotationResult = { success: 0, errors: [] };

  // 病院マスタを取得（完全一致マッチング用）
  const { data: hospitals } = await supabaseAdmin
    .from('hospitals')
    .select('id, name');
  const hospitalMap = new Map<string, string>(
    (hospitals || []).map((h) => [h.name as string, h.id as string])
  );

  const validData: Array<{
    duty_date: string;
    rotation_type: RotationType;
    area: string;
    department: string | null;
    hospital_id: string | null;
    facility_name: string;
    phone: string;
    start_time: string;
    end_time: string;
    note: string | null;
    source_month: string;
  }> = [];

  for (let i = 0; i < parsedData.length; i++) {
    const row = parsedData[i];
    const rowNumber = i + 2; // ヘッダー行を考慮

    try {
      const dutyDate = String(row['duty_date'] ?? '').trim();
      const rotationType = String(row['rotation_type'] ?? '').trim() as RotationType;
      const area = String(row['area'] ?? '').trim();
      const department = row['department'] ? String(row['department']).trim() : '';
      const facilityName = String(row['facility_name'] ?? '').trim();
      const phone = String(row['phone'] ?? '').trim();
      const startTime = normalizeTime(String(row['start_time'] ?? '').trim());
      const endTime = normalizeTime(String(row['end_time'] ?? '').trim());
      const note = row['note'] ? String(row['note']).trim() : '';

      if (!dutyDate || !rotationType || !area || !facilityName || !phone || !startTime || !endTime) {
        throw new Error('必須項目（duty_date, rotation_type, area, facility_name, phone, start_time, end_time）が不足しています');
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dutyDate)) {
        throw new Error('duty_date の形式が不正です（YYYY-MM-DD）');
      }
      if (dutyDate.slice(0, 7) !== sourceMonth) {
        throw new Error(`duty_date が対象月（${sourceMonth}）と一致しません`);
      }
      if (!ROTATION_TYPES.includes(rotationType)) {
        throw new Error(`rotation_type が不正です: ${rotationType}`);
      }
      if (startTime >= endTime) {
        throw new Error('start_time は end_time より前にしてください');
      }

      // 薬局・夜間急患は department を NULL に強制
      const finalDepartment =
        rotationType === 'duty_pharmacy' || rotationType === 'night_emergency'
          ? null
          : department || null;

      validData.push({
        duty_date: dutyDate,
        rotation_type: rotationType,
        area,
        department: finalDepartment,
        hospital_id: hospitalMap.get(facilityName) ?? null,
        facility_name: facilityName,
        phone,
        start_time: startTime,
        end_time: endTime,
        note: note || null,
        source_month: sourceMonth,
      });
    } catch (err) {
      result.errors.push({
        row: rowNumber,
        message: err instanceof Error ? err.message : '不明なエラー',
      });
    }
  }

  // エラーがあっても有効データはインポートする方針（既存 importHospitals と同じ）
  if (validData.length > 0) {
    // 同じ月の既存データを全削除
    const { error: deleteError } = await supabaseAdmin
      .from('emergency_rotations')
      .delete()
      .eq('source_month', sourceMonth);

    if (deleteError) {
      throw new Error('既存データの削除に失敗しました: ' + deleteError.message);
    }

    // バッチ INSERT
    const { error: insertError } = await supabaseAdmin
      .from('emergency_rotations')
      .insert(validData);

    if (insertError) {
      throw new Error('救急ローテーションの一括登録に失敗しました: ' + insertError.message);
    }

    result.success = validData.length;
  }

  revalidatePath('/admin/emergency-rotations');
  return result;
}

/**
 * 夜間急患診療所の月次データを自動生成
 * - 夜間枠（19:00-22:00 等）: 全日（365日）
 * - 昼間枠（09:00-12:30 等）: 日曜 + 祝日のみ
 */
export async function generateNightEmergencyRotations(
  sourceMonth: string,
  info: NightFacilityInfo
): Promise<{ count: number }> {
  await verifyAdminAuth();

  if (!/^\d{4}-\d{2}$/.test(sourceMonth)) {
    throw new Error('対象月の形式が不正です（YYYY-MM）');
  }
  if (!info.area || !info.facilityName || !info.phone) {
    throw new Error('施設情報が不足しています');
  }
  if (info.nightStart >= info.nightEnd) {
    throw new Error('夜間の開始時刻は終了時刻より前にしてください');
  }
  if (info.dayStart >= info.dayEnd) {
    throw new Error('昼間の開始時刻は終了時刻より前にしてください');
  }

  // 1. 既存削除（夜間急患のみ、他種別は保持）
  const { error: deleteError } = await supabaseAdmin
    .from('emergency_rotations')
    .delete()
    .eq('source_month', sourceMonth)
    .eq('rotation_type', 'night_emergency');

  if (deleteError) {
    throw new Error('既存夜間急患データの削除に失敗しました: ' + deleteError.message);
  }

  // 2. 月初〜月末の日付を生成
  const [year, month] = sourceMonth.split('-').map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  const records: Array<{
    duty_date: string;
    rotation_type: RotationType;
    area: string;
    department: null;
    hospital_id: null;
    facility_name: string;
    phone: string;
    start_time: string;
    end_time: string;
    note: string | null;
    source_month: string;
  }> = [];

  for (let day = 1; day <= lastDay; day++) {
    const date = new Date(year, month - 1, day);
    const dateStr = `${sourceMonth}-${String(day).padStart(2, '0')}`;

    // 夜間枠（365日）
    records.push({
      duty_date: dateStr,
      rotation_type: 'night_emergency',
      area: info.area,
      department: null,
      hospital_id: null,
      facility_name: info.facilityName,
      phone: info.phone,
      start_time: info.nightStart,
      end_time: info.nightEnd,
      note: info.note ?? null,
      source_month: sourceMonth,
    });

    // 昼間枠（日曜 + 祝日のみ）
    if (isHolidayOrSunday(date)) {
      records.push({
        duty_date: dateStr,
        rotation_type: 'night_emergency',
        area: info.area,
        department: null,
        hospital_id: null,
        facility_name: info.facilityName,
        phone: info.phone,
        start_time: info.dayStart,
        end_time: info.dayEnd,
        note: info.note ?? null,
        source_month: sourceMonth,
      });
    }
  }

  // 3. バッチ INSERT
  const { error: insertError } = await supabaseAdmin
    .from('emergency_rotations')
    .insert(records);

  if (insertError) {
    throw new Error('夜間急患データの生成に失敗しました: ' + insertError.message);
  }

  revalidatePath('/admin/emergency-rotations');
  return { count: records.length };
}

/**
 * 'HH:MM' または 'HH:MM:SS' を 'HH:MM:SS' に正規化
 * Excel の time セルが Date オブジェクトで来ることもあるので考慮
 */
function normalizeTime(value: string): string {
  if (!value) return '';
  // 既に HH:MM:SS
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value;
  // HH:MM
  if (/^\d{2}:\d{2}$/.test(value)) return `${value}:00`;
  // H:MM や H:M も許容
  const match = value.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/);
  if (match) {
    const h = match[1].padStart(2, '0');
    const m = match[2].padStart(2, '0');
    const s = (match[3] ?? '00').padStart(2, '0');
    return `${h}:${m}:${s}`;
  }
  return value; // バリデーション側でエラーになる
}

