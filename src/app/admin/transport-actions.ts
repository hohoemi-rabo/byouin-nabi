'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { parse } from 'papaparse';
import type { ServiceType, BookingMethod } from '@/types/transport';

async function verifyAdminAuth() {
  const cookieStore = await cookies();
  const adminAuth = cookieStore.get('admin-auth');
  if (!adminAuth || adminAuth.value !== 'true') {
    throw new Error('管理者権限が必要です');
  }
}

const VALID_SERVICE_TYPES: ServiceType[] = ['route_bus', 'demand', 'taxi', 'welfare_taxi', 'shuttle'];
const VALID_BOOKING_METHODS: BookingMethod[] = ['phone', 'web', 'app', 'none'];

export async function createTransportService(formData: FormData) {
  await verifyAdminAuth();

  const areaString = formData.get('service_area') as string;
  const areas = areaString.split(',').map(a => a.trim()).filter(a => a.length > 0);
  const serviceType = formData.get('service_type') as string;
  const bookingMethod = formData.get('booking_method') as string;
  const deadlineStr = formData.get('booking_deadline_hours') as string;

  const data = {
    name: formData.get('name') as string,
    operator: formData.get('operator') as string,
    service_type: serviceType,
    service_area: areas,
    phone: formData.get('phone') as string || null,
    website_url: formData.get('website_url') as string || null,
    booking_url: formData.get('booking_url') as string || null,
    booking_method: bookingMethod || null,
    advance_booking_required: formData.get('advance_booking_required') === 'on',
    booking_deadline_hours: deadlineStr ? parseInt(deadlineStr) : null,
    eligibility: formData.get('eligibility') as string || null,
    fare_info: formData.get('fare_info') as string || null,
    wheelchair_accessible: formData.get('wheelchair_accessible') === 'on',
    notes: formData.get('notes') as string || null,
  };

  if (!data.name || !data.operator) {
    throw new Error('サービス名と事業者名は必須です');
  }
  if (!VALID_SERVICE_TYPES.includes(serviceType as ServiceType)) {
    throw new Error('無効なサービス種別です');
  }
  if (areas.length === 0) {
    throw new Error('対応エリアを1つ以上入力してください');
  }

  const { error } = await supabaseAdmin.from('transport_services').insert(data);
  if (error) {
    console.error('Create transport error:', error);
    throw new Error('交通サービスの登録に失敗しました: ' + error.message);
  }

  revalidatePath('/admin/transport');
  redirect('/admin/transport?success=created');
}

export async function updateTransportService(serviceId: string, formData: FormData) {
  await verifyAdminAuth();

  const areaString = formData.get('service_area') as string;
  const areas = areaString.split(',').map(a => a.trim()).filter(a => a.length > 0);
  const serviceType = formData.get('service_type') as string;
  const bookingMethod = formData.get('booking_method') as string;
  const deadlineStr = formData.get('booking_deadline_hours') as string;

  const data = {
    name: formData.get('name') as string,
    operator: formData.get('operator') as string,
    service_type: serviceType,
    service_area: areas,
    phone: formData.get('phone') as string || null,
    website_url: formData.get('website_url') as string || null,
    booking_url: formData.get('booking_url') as string || null,
    booking_method: bookingMethod || null,
    advance_booking_required: formData.get('advance_booking_required') === 'on',
    booking_deadline_hours: deadlineStr ? parseInt(deadlineStr) : null,
    eligibility: formData.get('eligibility') as string || null,
    fare_info: formData.get('fare_info') as string || null,
    wheelchair_accessible: formData.get('wheelchair_accessible') === 'on',
    notes: formData.get('notes') as string || null,
    updated_at: new Date().toISOString(),
  };

  if (!data.name || !data.operator) {
    throw new Error('サービス名と事業者名は必須です');
  }
  if (!VALID_SERVICE_TYPES.includes(serviceType as ServiceType)) {
    throw new Error('無効なサービス種別です');
  }
  if (areas.length === 0) {
    throw new Error('対応エリアを1つ以上入力してください');
  }

  const { error } = await supabaseAdmin.from('transport_services').update(data).eq('id', serviceId);
  if (error) {
    console.error('Update transport error:', error);
    throw new Error('交通サービスの更新に失敗しました: ' + error.message);
  }

  revalidatePath('/admin/transport');
  redirect('/admin/transport?success=updated');
}

export async function deleteTransportService(serviceId: string) {
  await verifyAdminAuth();

  const { error } = await supabaseAdmin.from('transport_services').delete().eq('id', serviceId);
  if (error) {
    console.error('Delete transport error:', error);
    throw new Error('交通サービスの削除に失敗しました: ' + error.message);
  }

  revalidatePath('/admin/transport');
  return { success: true };
}

interface ImportResult {
  success: number;
  errors: { row: number; message: string }[];
}

export async function importTransportServices(formData: FormData): Promise<ImportResult> {
  await verifyAdminAuth();

  const file = formData.get('file') as File;
  if (!file) throw new Error('ファイルが選択されていません');

  const text = await file.text();
  const { data: parsedData, errors: parseErrors } = parse(text, { header: true, skipEmptyLines: true });

  if (parseErrors.length > 0) {
    throw new Error('CSVの解析に失敗しました: ' + parseErrors[0].message);
  }

  const validData: Record<string, unknown>[] = [];
  const errors: { row: number; message: string }[] = [];

  (parsedData as Record<string, string>[]).forEach((row, index) => {
    const rowNum = index + 2;
    if (!row['サービス名'] || !row['事業者'] || !row['種別']) {
      errors.push({ row: rowNum, message: 'サービス名・事業者・種別は必須です' });
      return;
    }
    const serviceType = row['種別'];
    if (!VALID_SERVICE_TYPES.includes(serviceType as ServiceType)) {
      errors.push({ row: rowNum, message: `無効な種別: ${serviceType}` });
      return;
    }
    const areas = (row['対応エリア'] || '').split(',').map(a => a.trim()).filter(a => a.length > 0);
    if (areas.length === 0) {
      errors.push({ row: rowNum, message: '対応エリアが未入力です' });
      return;
    }
    const bookingMethod = row['予約方法'] || null;
    if (bookingMethod && !VALID_BOOKING_METHODS.includes(bookingMethod as BookingMethod)) {
      errors.push({ row: rowNum, message: `無効な予約方法: ${bookingMethod}` });
      return;
    }

    validData.push({
      name: row['サービス名'],
      operator: row['事業者'],
      service_type: serviceType,
      service_area: areas,
      phone: row['電話番号'] || null,
      website_url: row['WebサイトURL'] || null,
      booking_url: row['予約URL'] || null,
      booking_method: bookingMethod,
      advance_booking_required: row['事前予約'] === 'はい',
      booking_deadline_hours: row['予約締切時間'] ? parseInt(row['予約締切時間']) : null,
      eligibility: row['利用条件'] || null,
      fare_info: row['料金情報'] || null,
      wheelchair_accessible: row['車椅子対応'] === 'はい',
      notes: row['備考'] || null,
    });
  });

  if (validData.length > 0) {
    await supabaseAdmin.from('transport_services').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const { error } = await supabaseAdmin.from('transport_services').insert(validData);
    if (error) throw new Error('データの登録に失敗しました: ' + error.message);
  }

  revalidatePath('/admin/transport');
  return { success: validData.length, errors };
}

export async function exportTransportServicesCSV(): Promise<string> {
  await verifyAdminAuth();

  const { data, error } = await supabaseAdmin
    .from('transport_services')
    .select('*')
    .order('name');

  if (error) throw new Error('データの取得に失敗しました: ' + error.message);

  const header = 'サービス名,事業者,種別,対応エリア,電話番号,WebサイトURL,予約URL,予約方法,事前予約,予約締切時間,利用条件,料金情報,車椅子対応,備考';
  const rows = (data || []).map(s => [
    s.name,
    s.operator,
    s.service_type,
    `"${(s.service_area || []).join(',')}"`,
    s.phone || '',
    s.website_url || '',
    s.booking_url || '',
    s.booking_method || '',
    s.advance_booking_required ? 'はい' : 'いいえ',
    s.booking_deadline_hours ?? '',
    s.eligibility || '',
    s.fare_info || '',
    s.wheelchair_accessible ? 'はい' : 'いいえ',
    s.notes || '',
  ].join(','));

  return '\uFEFF' + header + '\n' + rows.join('\n');
}
