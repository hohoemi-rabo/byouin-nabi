'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { TransportService } from '@/types/transport';
import Button from '@/components/Common/Button';

interface TransportFormProps {
  service?: TransportService;
  action: (formData: FormData) => Promise<void>;
  mode: 'create' | 'edit';
}

const SERVICE_TYPE_OPTIONS = [
  { value: 'route_bus', label: '路線バス' },
  { value: 'demand', label: 'デマンド交通' },
  { value: 'taxi', label: 'タクシー' },
  { value: 'welfare_taxi', label: '福祉タクシー' },
  { value: 'shuttle', label: '送迎バス' },
];

const BOOKING_METHOD_OPTIONS = [
  { value: '', label: '選択なし' },
  { value: 'phone', label: '電話' },
  { value: 'web', label: 'Web' },
  { value: 'app', label: 'アプリ' },
  { value: 'none', label: '予約不要' },
];

export default function TransportForm({ service, action, mode }: TransportFormProps) {
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
          <p className="text-error font-bold text-sm">&#10060; {error}</p>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          サービス名 <span className="text-error">*</span>
        </label>
        <input type="text" id="name" name="name" defaultValue={service?.name} required
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none" />
      </div>

      <div>
        <label htmlFor="operator" className="block text-sm font-medium mb-1">
          事業者名 <span className="text-error">*</span>
        </label>
        <input type="text" id="operator" name="operator" defaultValue={service?.operator} required
          placeholder="例: 信南交通" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none" />
      </div>

      <div>
        <label htmlFor="service_type" className="block text-sm font-medium mb-1">
          種別 <span className="text-error">*</span>
        </label>
        <select id="service_type" name="service_type" defaultValue={service?.service_type || 'route_bus'}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none">
          {SERVICE_TYPE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="service_area" className="block text-sm font-medium mb-1">
          対応エリア <span className="text-error">*</span>
        </label>
        <input type="text" id="service_area" name="service_area"
          defaultValue={service?.service_area?.join(', ')} required
          placeholder="例: 飯田市, 高森町, 松川町"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        <p className="text-xs text-gray-600 mt-1">カンマ区切りで複数入力</p>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-1">電話番号</label>
        <input type="tel" id="phone" name="phone" defaultValue={service?.phone || ''}
          placeholder="例: 0265-22-1234"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="website_url" className="block text-sm font-medium mb-1">WebサイトURL</label>
          <input type="url" id="website_url" name="website_url" defaultValue={service?.website_url || ''}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        </div>
        <div>
          <label htmlFor="booking_url" className="block text-sm font-medium mb-1">予約URL</label>
          <input type="url" id="booking_url" name="booking_url" defaultValue={service?.booking_url || ''}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="booking_method" className="block text-sm font-medium mb-1">予約方法</label>
          <select id="booking_method" name="booking_method" defaultValue={service?.booking_method || ''}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none">
            {BOOKING_METHOD_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="booking_deadline_hours" className="block text-sm font-medium mb-1">予約締切（時間前）</label>
          <input type="number" id="booking_deadline_hours" name="booking_deadline_hours"
            defaultValue={service?.booking_deadline_hours ?? ''}
            placeholder="例: 24"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="advance_booking_required"
            defaultChecked={service?.advance_booking_required} className="w-4 h-4" />
          事前予約が必要
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="wheelchair_accessible"
            defaultChecked={service?.wheelchair_accessible} className="w-4 h-4" />
          車椅子対応
        </label>
      </div>

      <div>
        <label htmlFor="eligibility" className="block text-sm font-medium mb-1">利用条件</label>
        <input type="text" id="eligibility" name="eligibility" defaultValue={service?.eligibility || ''}
          placeholder="例: 飯田市在住の方のみ"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none" />
      </div>

      <div>
        <label htmlFor="fare_info" className="block text-sm font-medium mb-1">料金情報</label>
        <textarea id="fare_info" name="fare_info" defaultValue={service?.fare_info || ''}
          placeholder="例: 片道300円〜" rows={2}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none" />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium mb-1">備考</label>
        <textarea id="notes" name="notes" defaultValue={service?.notes || ''}
          rows={2} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none" />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" disabled={isPending} className="text-sm">
          {isPending ? '保存中...' : mode === 'create' ? '登録' : '更新'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push('/admin/transport')}
          disabled={isPending} className="text-sm">
          キャンセル
        </Button>
      </div>
    </form>
  );
}
