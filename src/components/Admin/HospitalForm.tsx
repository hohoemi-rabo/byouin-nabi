'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Hospital } from '@/types/hospital';
import Button from '@/components/Common/Button';

interface HospitalFormProps {
  hospital?: Hospital;
  action: (formData: FormData) => Promise<void>;
  mode: 'create' | 'edit';
}

export default function HospitalForm({ hospital, action, mode }: HospitalFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await action(formData);
        // Server Actionがredirectを使用するため、ここには到達しない
      } catch (err) {
        console.error('Form submit error:', err);
        setError(err instanceof Error ? err.message : '保存に失敗しました');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      {error && (
        <div className="bg-error/10 border-2 border-error rounded-lg p-3">
          <p className="text-error font-bold text-sm">❌ {error}</p>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          病院名 <span className="text-error">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={hospital?.name}
          required
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-1">
          診療科 <span className="text-error">*</span>
        </label>
        <input
          type="text"
          id="category"
          name="category"
          defaultValue={hospital?.category.join(', ')}
          placeholder="例: 内科, 外科, 小児科"
          required
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        <p className="text-xs text-gray-600 mt-1">
          複数の診療科をカンマ（,）で区切って入力してください
        </p>
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium mb-1">
          住所 <span className="text-error">*</span>
        </label>
        <input
          type="text"
          id="address"
          name="address"
          defaultValue={hospital?.address}
          placeholder="例: 長野県飯田市○○町1-2-3"
          required
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="city" className="block text-sm font-medium mb-1">
          市町村 <span className="text-error">*</span>
        </label>
        <input
          type="text"
          id="city"
          name="city"
          defaultValue={hospital?.city}
          placeholder="例: 飯田市"
          required
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="tel" className="block text-sm font-medium mb-1">
          電話番号 <span className="text-error">*</span>
        </label>
        <input
          type="tel"
          id="tel"
          name="tel"
          defaultValue={hospital?.tel}
          placeholder="例: 0265-12-3456"
          required
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="opening_hours" className="block text-sm font-medium mb-1">
          診療時間
        </label>
        <textarea
          id="opening_hours"
          name="opening_hours"
          defaultValue={hospital?.opening_hours || ''}
          placeholder="例: 平日 9:00-12:00, 14:00-18:00&#10;土曜 9:00-12:00&#10;休診日: 日曜・祝日"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none"
          rows={3}
        />
      </div>

      <div>
        <label htmlFor="google_map_url" className="block text-sm font-medium mb-1">
          Google Maps URL
        </label>
        <input
          type="url"
          id="google_map_url"
          name="google_map_url"
          defaultValue={hospital?.google_map_url || ''}
          placeholder="https://maps.app.goo.gl/..."
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="website" className="block text-sm font-medium mb-1">
          Webサイト
        </label>
        <input
          type="url"
          id="website"
          name="website"
          defaultValue={hospital?.website || ''}
          placeholder="https://example.com"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="note" className="block text-sm font-medium mb-1">
          備考
        </label>
        <textarea
          id="note"
          name="note"
          defaultValue={hospital?.note || ''}
          placeholder="特記事項があれば入力してください"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none"
          rows={2}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          disabled={isPending}
          className="text-sm"
        >
          {isPending ? '保存中...' : mode === 'create' ? '登録' : '更新'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/admin/hospitals')}
          disabled={isPending}
          className="text-sm"
        >
          キャンセル
        </Button>
      </div>
    </form>
  );
}
