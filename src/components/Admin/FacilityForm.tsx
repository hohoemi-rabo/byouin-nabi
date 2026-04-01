'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Facility } from '@/types/facility';
import Button from '@/components/Common/Button';

interface FacilityFormProps {
  facility?: Facility;
  action: (formData: FormData) => Promise<void>;
  mode: 'create' | 'edit';
}

const CATEGORY_OPTIONS = [
  { value: 'shopping', label: '🛒 買い物' },
  { value: 'government', label: '🏛️ 役所・公共施設' },
  { value: 'banking', label: '🏧 銀行・郵便局' },
  { value: 'welfare', label: '🏥 医療・福祉' },
  { value: 'leisure', label: '🎭 趣味・交流' },
];

export default function FacilityForm({ facility, action, mode }: FacilityFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const latRef = useRef<HTMLInputElement>(null);
  const lngRef = useRef<HTMLInputElement>(null);

  const handleGeocode = async () => {
    const addressInput = document.getElementById('address') as HTMLInputElement;
    const address = addressInput?.value;
    if (!address) { setError('住所を入力してから座標取得を行ってください'); return; }
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
      try { await action(formData); } catch (err) {
        setError(err instanceof Error ? err.message : '保存に失敗しました');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      {error && (
        <div className="bg-error/10 border-2 border-error rounded-lg p-3">
          <p className="text-error font-bold text-sm">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">施設名 <span className="text-error">*</span></label>
        <input type="text" id="name" name="name" defaultValue={facility?.name} required
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none" />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-1">カテゴリ <span className="text-error">*</span></label>
        <select id="category" name="category" defaultValue={facility?.category || 'shopping'}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none">
          {CATEGORY_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium mb-1">住所 <span className="text-error">*</span></label>
        <input type="text" id="address" name="address" defaultValue={facility?.address} required
          placeholder="例: 長野県飯田市○○町1-2-3"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none" />
      </div>

      <div>
        <label htmlFor="city" className="block text-sm font-medium mb-1">市町村 <span className="text-error">*</span></label>
        <input type="text" id="city" name="city" defaultValue={facility?.city} required placeholder="例: 飯田市"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none" />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-1">電話番号</label>
        <input type="tel" id="phone" name="phone" defaultValue={facility?.phone || ''}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="latitude" className="block text-sm font-medium mb-1">緯度</label>
          <input ref={latRef} type="number" step="any" id="latitude" name="latitude"
            defaultValue={facility?.latitude ?? ''} placeholder="例: 35.5148"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        </div>
        <div>
          <label htmlFor="longitude" className="block text-sm font-medium mb-1">経度</label>
          <input ref={lngRef} type="number" step="any" id="longitude" name="longitude"
            defaultValue={facility?.longitude ?? ''} placeholder="例: 136.9566"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        </div>
      </div>
      <div className="-mt-2">
        <button type="button" onClick={handleGeocode} disabled={geocoding}
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded border border-gray-300 transition-colors disabled:opacity-50">
          {geocoding ? '取得中...' : '📍 住所から座標を取得'}
        </button>
      </div>

      <div>
        <label htmlFor="website_url" className="block text-sm font-medium mb-1">WebサイトURL</label>
        <input type="url" id="website_url" name="website_url" defaultValue={facility?.website_url || ''}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none" />
      </div>

      <div>
        <label htmlFor="opening_hours" className="block text-sm font-medium mb-1">営業時間</label>
        <textarea id="opening_hours" name="opening_hours" defaultValue={facility?.opening_hours || ''} rows={2}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none" />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium mb-1">備考</label>
        <textarea id="notes" name="notes" defaultValue={facility?.notes || ''} rows={2}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none" />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" disabled={isPending} className="text-sm">
          {isPending ? '保存中...' : mode === 'create' ? '登録' : '更新'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push('/admin/facilities')} disabled={isPending} className="text-sm">
          キャンセル
        </Button>
      </div>
    </form>
  );
}
