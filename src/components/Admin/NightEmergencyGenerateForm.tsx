'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Common/Button';
import ConfirmModal from '@/components/Common/ConfirmModal';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { generateNightEmergencyRotations } from '@/app/admin/actions';

const DEFAULT_VALUES = {
  area: '飯田地区',
  facilityName: '飯田市休日夜間急患診療所',
  phone: '0265-23-3636',
  dayStart: '09:00',
  dayEnd: '12:30',
  nightStart: '19:00',
  nightEnd: '22:00',
  note: '受付 午後9時30分まで',
};

function nextMonth(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 2; // 翌月（0-indexed なので +2）
  const year = m > 12 ? y + 1 : y;
  const month = m > 12 ? 1 : m;
  return `${year}-${String(month).padStart(2, '0')}`;
}

export default function NightEmergencyGenerateForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ count: number } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const [sourceMonth, setSourceMonth] = useState(nextMonth());
  const [area, setArea] = useState(DEFAULT_VALUES.area);
  const [facilityName, setFacilityName] = useState(DEFAULT_VALUES.facilityName);
  const [phone, setPhone] = useState(DEFAULT_VALUES.phone);
  const [dayStart, setDayStart] = useState(DEFAULT_VALUES.dayStart);
  const [dayEnd, setDayEnd] = useState(DEFAULT_VALUES.dayEnd);
  const [nightStart, setNightStart] = useState(DEFAULT_VALUES.nightStart);
  const [nightEnd, setNightEnd] = useState(DEFAULT_VALUES.nightEnd);
  const [note, setNote] = useState(DEFAULT_VALUES.note);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setShowConfirm(true);
  };

  const confirmGenerate = () => {
    setShowConfirm(false);
    startTransition(async () => {
      try {
        const res = await generateNightEmergencyRotations(sourceMonth, {
          area,
          facilityName,
          phone,
          dayStart,
          dayEnd,
          nightStart,
          nightEnd,
          note: note || undefined,
        });
        setResult(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : '生成に失敗しました');
      }
    });
  };

  return (
    <>
      <ConfirmModal
        isOpen={showConfirm}
        title="夜間急患データの月次生成"
        message={`${sourceMonth} の夜間急患診療所データを生成します。\n\n既存の同月・夜間急患データは上書きされます。\n\n施設: ${facilityName}\n夜間: ${nightStart}〜${nightEnd}（毎日）\n昼間: ${dayStart}〜${dayEnd}（日曜・祝日のみ）\n\n実行しますか？`}
        confirmText="生成する"
        cancelText="キャンセル"
        type="warning"
        onConfirm={confirmGenerate}
        onCancel={() => setShowConfirm(false)}
      />

      {isPending && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <LoadingSpinner size="lg" className="mb-4" />
            <h2 className="text-xl font-bold mb-2">生成中...</h2>
            <p className="text-sm text-gray-600">日次レコードを作成しています</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        {error && (
          <div className="bg-error/10 border-2 border-error rounded-lg p-3">
            <p className="text-error font-bold text-sm">❌ {error}</p>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
            <p className="text-green-800 font-bold text-base">
              ✅ {result.count} 件のレコードを生成しました
            </p>
            <Button
              type="button"
              variant="primary"
              onClick={() => router.push(`/admin/emergency-rotations?month=${sourceMonth}`)}
              className="text-sm mt-3"
            >
              一覧で確認する
            </Button>
          </div>
        )}

        <div>
          <label htmlFor="source_month" className="block text-sm font-medium mb-1">
            対象月 <span className="text-error">*</span>
          </label>
          <input
            type="month"
            id="source_month"
            value={sourceMonth}
            onChange={(e) => setSourceMonth(e.target.value)}
            required
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        <fieldset className="border border-gray-200 rounded-lg p-4 space-y-4">
          <legend className="text-sm font-bold text-gray-700 px-2">施設情報</legend>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="area" className="block text-sm font-medium mb-1">
                地区 <span className="text-error">*</span>
              </label>
              <input
                type="text"
                id="area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1">
                電話番号 <span className="text-error">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="facility_name" className="block text-sm font-medium mb-1">
              施設名 <span className="text-error">*</span>
            </label>
            <input
              type="text"
              id="facility_name"
              value={facilityName}
              onChange={(e) => setFacilityName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="note" className="block text-sm font-medium mb-1">
              備考
            </label>
            <input
              type="text"
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </fieldset>

        <fieldset className="border border-gray-200 rounded-lg p-4 space-y-3">
          <legend className="text-sm font-bold text-gray-700 px-2">時間帯</legend>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="night_start" className="block text-sm font-medium mb-1">
                夜間開始（毎日）<span className="text-error">*</span>
              </label>
              <input
                type="time"
                id="night_start"
                value={nightStart}
                onChange={(e) => setNightStart(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="night_end" className="block text-sm font-medium mb-1">
                夜間終了 <span className="text-error">*</span>
              </label>
              <input
                type="time"
                id="night_end"
                value={nightEnd}
                onChange={(e) => setNightEnd(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="day_start" className="block text-sm font-medium mb-1">
                昼間開始（休日のみ）<span className="text-error">*</span>
              </label>
              <input
                type="time"
                id="day_start"
                value={dayStart}
                onChange={(e) => setDayStart(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="day_end" className="block text-sm font-medium mb-1">
                昼間終了 <span className="text-error">*</span>
              </label>
              <input
                type="time"
                id="day_end"
                value={dayEnd}
                onChange={(e) => setDayEnd(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <p className="text-xs text-gray-600">
            日曜および日本の祝日（振替休日含む）に昼間枠を生成します
          </p>
        </fieldset>

        <div className="bg-yellow-50 border border-yellow-300 rounded p-3 text-xs text-yellow-900">
          ⚠️ 同じ月の夜間急患データがある場合、上書きされます（他種別の当番医データには影響しません）
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" variant="primary" disabled={isPending} className="text-sm">
            {isPending ? '生成中...' : '生成実行'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/admin/emergency-rotations')}
            disabled={isPending}
            className="text-sm"
          >
            戻る
          </Button>
        </div>
      </form>
    </>
  );
}
