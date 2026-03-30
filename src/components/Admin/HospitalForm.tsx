'use client';

import { useRef, useState, useTransition } from 'react';
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
  const [geocoding, setGeocoding] = useState(false);
  const latRef = useRef<HTMLInputElement>(null);
  const lngRef = useRef<HTMLInputElement>(null);

  const handleGeocode = async () => {
    const addressInput = document.getElementById('address') as HTMLInputElement;
    const address = addressInput?.value;
    if (!address) {
      setError('住所を入力してから座標取得を行ってください');
      return;
    }
    setGeocoding(true);
    setError(null);
    try {
      const res = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (latRef.current) latRef.current.value = String(data.latitude);
      if (lngRef.current) lngRef.current.value = String(data.longitude);
    } catch (err) {
      setError(err instanceof Error ? err.message : '座標の取得に失敗しました');
    } finally {
      setGeocoding(false);
    }
  };

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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="latitude" className="block text-sm font-medium mb-1">
            緯度
          </label>
          <input
            ref={latRef}
            type="number"
            step="any"
            id="latitude"
            name="latitude"
            defaultValue={hospital?.latitude ?? ''}
            placeholder="例: 35.5148"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="longitude" className="block text-sm font-medium mb-1">
            経度
          </label>
          <input
            ref={lngRef}
            type="number"
            step="any"
            id="longitude"
            name="longitude"
            defaultValue={hospital?.longitude ?? ''}
            placeholder="例: 136.9566"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
      </div>
      <div className="-mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={handleGeocode}
          disabled={geocoding}
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded border border-gray-300 transition-colors disabled:opacity-50"
        >
          {geocoding ? '取得中...' : '📍 住所から座標を取得'}
        </button>
        <p className="text-xs text-gray-600">
          または Google Maps で検索して手動入力
        </p>
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
