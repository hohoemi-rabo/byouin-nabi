# 009 - 病院CRUD機能

## 概要
病院データの登録・編集・削除機能を実装します。

## 目的
- 病院情報の手動登録・更新
- データの適切なバリデーション
- Server Actions を使用した実装

## タスク

### Server Actions 実装
- [ ] createHospital アクション
- [ ] updateHospital アクション
- [ ] deleteHospital アクション
- [ ] 認証チェックロジック

### 病院一覧ページ
- [ ] /admin/hospitals ページ
- [ ] 病院リストの表示（テーブル形式）
- [ ] 検索・フィルター機能
- [ ] 編集・削除ボタン
- [ ] 新規登録ボタン

### 病院登録フォーム
- [ ] /admin/hospitals/new ページ
- [ ] HospitalForm コンポーネント作成
- [ ] フォームバリデーション
- [ ] エラー表示

### 病院編集フォーム
- [ ] /admin/hospitals/[id]/edit ページ
- [ ] 既存データの取得・表示
- [ ] 更新処理

### 削除機能
- [ ] 削除確認ダイアログ
- [ ] 削除処理
- [ ] 成功・エラーメッセージ

## 実装例

```typescript
// src/app/admin/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/auth';

export async function createHospital(formData: FormData) {
  // 認証チェック
  const session = await verifyAdminSession();
  if (!session) {
    throw new Error('管理者権限が必要です');
  }

  const hospitalData = {
    name: formData.get('name') as string,
    category: (formData.get('category') as string).split(','),
    address: formData.get('address') as string,
    tel: formData.get('tel') as string,
    city: formData.get('city') as string,
    opening_hours: formData.get('opening_hours') as string,
    google_map_url: formData.get('google_map_url') as string,
    note: formData.get('note') as string,
  };

  // バリデーション
  if (!hospitalData.name || !hospitalData.address || !hospitalData.tel) {
    throw new Error('必須項目が入力されていません');
  }

  const { data, error } = await supabase
    .from('hospitals')
    .insert(hospitalData)
    .select()
    .single();

  if (error) {
    throw new Error('病院の登録に失敗しました');
  }

  revalidatePath('/admin/hospitals');
  return { success: true, data };
}

export async function updateHospital(hospitalId: string, formData: FormData) {
  const session = await verifyAdminSession();
  if (!session) {
    throw new Error('管理者権限が必要です');
  }

  const hospitalData = {
    name: formData.get('name') as string,
    category: (formData.get('category') as string).split(','),
    address: formData.get('address') as string,
    tel: formData.get('tel') as string,
    city: formData.get('city') as string,
    opening_hours: formData.get('opening_hours') as string,
    google_map_url: formData.get('google_map_url') as string,
    note: formData.get('note') as string,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('hospitals')
    .update(hospitalData)
    .eq('id', hospitalId);

  if (error) {
    throw new Error('病院の更新に失敗しました');
  }

  revalidatePath('/admin/hospitals');
  return { success: true };
}

export async function deleteHospital(hospitalId: string) {
  const session = await verifyAdminSession();
  if (!session) {
    throw new Error('管理者権限が必要です');
  }

  const { error } = await supabase
    .from('hospitals')
    .delete()
    .eq('id', hospitalId);

  if (error) {
    throw new Error('病院の削除に失敗しました');
  }

  revalidatePath('/admin/hospitals');
  return { success: true };
}
```

```typescript
// src/components/Admin/HospitalForm.tsx
'use client';

import { useState } from 'react';

interface HospitalFormProps {
  hospital?: Hospital;
  action: (formData: FormData) => Promise<any>;
  mode: 'create' | 'edit';
}

export default function HospitalForm({ hospital, action, mode }: HospitalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      await action(formData);
      alert('保存しました');
      window.location.href = '/admin/hospitals';
    } catch (error) {
      alert(error instanceof Error ? error.message : '保存に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div>
        <label className="block font-medium mb-2">病院名 *</label>
        <input
          type="text"
          name="name"
          defaultValue={hospital?.name}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-medium mb-2">診療科 * （カンマ区切り）</label>
        <input
          type="text"
          name="category"
          defaultValue={hospital?.category.join(',')}
          placeholder="内科,外科,小児科"
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-medium mb-2">住所 *</label>
        <input
          type="text"
          name="address"
          defaultValue={hospital?.address}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-medium mb-2">電話番号 *</label>
        <input
          type="tel"
          name="tel"
          defaultValue={hospital?.tel}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-medium mb-2">市町村 *</label>
        <input
          type="text"
          name="city"
          defaultValue={hospital?.city}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-medium mb-2">診療時間</label>
        <textarea
          name="opening_hours"
          defaultValue={hospital?.opening_hours}
          className="w-full border rounded px-3 py-2"
          rows={3}
        />
      </div>

      <div>
        <label className="block font-medium mb-2">Google Maps URL</label>
        <input
          type="url"
          name="google_map_url"
          defaultValue={hospital?.google_map_url}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-medium mb-2">備考</label>
        <textarea
          name="note"
          defaultValue={hospital?.note}
          className="w-full border rounded px-3 py-2"
          rows={3}
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark disabled:opacity-50"
        >
          {isSubmitting ? '保存中...' : mode === 'create' ? '登録' : '更新'}
        </button>
        <a
          href="/admin/hospitals"
          className="bg-gray-200 px-6 py-2 rounded hover:bg-gray-300"
        >
          キャンセル
        </a>
      </div>
    </form>
  );
}
```

## 受け入れ基準
- [ ] 新規病院の登録ができる
- [ ] 既存病院の編集ができる
- [ ] 病院の削除ができる
- [ ] バリデーションエラーが適切に表示される
- [ ] 成功・エラーメッセージが表示される
- [ ] 保存後にリストページにリダイレクトされる
- [ ] 未認証ユーザーはアクセスできない

## 依存関係
- 001-データベース設計・構築
- 008-管理画面構築

## 関連ファイル
- `/home/masayuki/NextJs/byouin-nabi/src/app/admin/actions.ts`
- `/home/masayuki/NextJs/byouin-nabi/src/app/admin/hospitals/page.tsx`
- `/home/masayuki/NextJs/byouin-nabi/src/app/admin/hospitals/new/page.tsx`
- `/home/masayuki/NextJs/byouin-nabi/src/app/admin/hospitals/[id]/edit/page.tsx`
- `/home/masayuki/NextJs/byouin-nabi/src/components/Admin/HospitalForm.tsx`

## 備考
- Server Actions を使用して実装（Next.js 15のベストプラクティス）
- フォームバリデーションはクライアント・サーバー両方で実施
- 削除は物理削除（論理削除は将来対応）
