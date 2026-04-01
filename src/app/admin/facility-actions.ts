'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { parse } from 'papaparse';
import type { FacilityCategory } from '@/types/facility';

async function verifyAdminAuth() {
  const cookieStore = await cookies();
  const adminAuth = cookieStore.get('admin-auth');
  if (!adminAuth || adminAuth.value !== 'true') {
    throw new Error('管理者権限が必要です');
  }
}

const VALID_CATEGORIES: FacilityCategory[] = ['shopping', 'government', 'banking', 'welfare', 'leisure'];

export async function createFacility(formData: FormData) {
  await verifyAdminAuth();

  const category = formData.get('category') as string;
  const latStr = formData.get('latitude') as string;
  const lngStr = formData.get('longitude') as string;

  const data = {
    name: formData.get('name') as string,
    category,
    address: formData.get('address') as string,
    city: formData.get('city') as string,
    phone: formData.get('phone') as string || null,
    latitude: latStr ? parseFloat(latStr) : null,
    longitude: lngStr ? parseFloat(lngStr) : null,
    website_url: formData.get('website_url') as string || null,
    opening_hours: formData.get('opening_hours') as string || null,
    notes: formData.get('notes') as string || null,
  };

  if (!data.name || !data.address || !data.city) {
    throw new Error('施設名・住所・市町村は必須です');
  }
  if (!VALID_CATEGORIES.includes(category as FacilityCategory)) {
    throw new Error('無効なカテゴリです');
  }

  const { error } = await supabaseAdmin.from('facilities').insert(data);
  if (error) throw new Error('施設の登録に失敗しました: ' + error.message);

  revalidatePath('/admin/facilities');
  redirect('/admin/facilities?success=created');
}

export async function updateFacility(facilityId: string, formData: FormData) {
  await verifyAdminAuth();

  const category = formData.get('category') as string;
  const latStr = formData.get('latitude') as string;
  const lngStr = formData.get('longitude') as string;

  const data = {
    name: formData.get('name') as string,
    category,
    address: formData.get('address') as string,
    city: formData.get('city') as string,
    phone: formData.get('phone') as string || null,
    latitude: latStr ? parseFloat(latStr) : null,
    longitude: lngStr ? parseFloat(lngStr) : null,
    website_url: formData.get('website_url') as string || null,
    opening_hours: formData.get('opening_hours') as string || null,
    notes: formData.get('notes') as string || null,
    updated_at: new Date().toISOString(),
  };

  if (!data.name || !data.address || !data.city) {
    throw new Error('施設名・住所・市町村は必須です');
  }

  const { error } = await supabaseAdmin.from('facilities').update(data).eq('id', facilityId);
  if (error) throw new Error('施設の更新に失敗しました: ' + error.message);

  revalidatePath('/admin/facilities');
  redirect('/admin/facilities?success=updated');
}

export async function deleteFacility(facilityId: string) {
  await verifyAdminAuth();

  const { error } = await supabaseAdmin.from('facilities').delete().eq('id', facilityId);
  if (error) throw new Error('施設の削除に失敗しました: ' + error.message);

  revalidatePath('/admin/facilities');
  return { success: true };
}

interface ImportResult { success: number; errors: { row: number; message: string }[] }

export async function importFacilities(formData: FormData): Promise<ImportResult> {
  await verifyAdminAuth();

  const file = formData.get('file') as File;
  if (!file) throw new Error('ファイルが選択されていません');

  const text = await file.text();
  const { data: parsedData, errors: parseErrors } = parse(text, { header: true, skipEmptyLines: true });
  if (parseErrors.length > 0) throw new Error('CSVの解析に失敗しました: ' + parseErrors[0].message);

  const validData: Record<string, unknown>[] = [];
  const errors: { row: number; message: string }[] = [];

  (parsedData as Record<string, string>[]).forEach((row, index) => {
    const rowNum = index + 2;
    if (!row['施設名'] || !row['住所'] || !row['市町村']) {
      errors.push({ row: rowNum, message: '施設名・住所・市町村は必須です' });
      return;
    }
    const cat = row['カテゴリ'];
    if (!VALID_CATEGORIES.includes(cat as FacilityCategory)) {
      errors.push({ row: rowNum, message: `無効なカテゴリ: ${cat}` });
      return;
    }
    validData.push({
      name: row['施設名'],
      category: cat,
      address: row['住所'],
      city: row['市町村'],
      phone: row['電話番号'] || null,
      latitude: row['緯度'] ? parseFloat(row['緯度']) : null,
      longitude: row['経度'] ? parseFloat(row['経度']) : null,
      website_url: row['WebサイトURL'] || null,
      opening_hours: row['営業時間'] || null,
      notes: row['備考'] || null,
    });
  });

  if (validData.length > 0) {
    await supabaseAdmin.from('facilities').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const { error } = await supabaseAdmin.from('facilities').insert(validData);
    if (error) throw new Error('データの登録に失敗しました: ' + error.message);
  }

  revalidatePath('/admin/facilities');
  return { success: validData.length, errors };
}

export async function exportFacilitiesCSV(): Promise<string> {
  await verifyAdminAuth();

  const { data, error } = await supabaseAdmin.from('facilities').select('*').order('name');
  if (error) throw new Error('データの取得に失敗しました: ' + error.message);

  const header = '施設名,カテゴリ,住所,市町村,電話番号,緯度,経度,WebサイトURL,営業時間,備考';
  const rows = (data || []).map(f => [
    f.name, f.category, f.address, f.city, f.phone || '',
    f.latitude ?? '', f.longitude ?? '',
    f.website_url || '', f.opening_hours || '', f.notes || '',
  ].join(','));

  return '\uFEFF' + header + '\n' + rows.join('\n');
}
