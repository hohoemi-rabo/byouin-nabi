'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase-admin';

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
  redirect('/admin/hospitals');
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
  redirect('/admin/hospitals');
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
