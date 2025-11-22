'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getHospitalSchedules, updateHospitalSchedules, type ScheduleFormData } from '@/app/admin/actions';
import Button from '@/components/Common/Button';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import Toast from '@/components/Common/Toast';

const DAYS = ['日', '月', '火', '水', '木', '金', '土'];

interface Props {
  params: Promise<{ id: string }>;
}

export default function HospitalSchedulesPage({ params }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [hospitalId, setHospitalId] = useState<string>('');
  const [hospitalName, setHospitalName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [schedules, setSchedules] = useState<ScheduleFormData[]>([]);

  // 初期データ（7曜日分）
  const initializeSchedules = (): ScheduleFormData[] => {
    return Array.from({ length: 7 }, (_, i) => ({
      day_of_week: i,
      morning_start: '00:00',
      morning_end: '00:00',
      afternoon_start: '00:00',
      afternoon_end: '00:00',
      is_closed: false,
      note: '',
    }));
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const resolvedParams = await params;
        setHospitalId(resolvedParams.id);

        // 病院情報取得
        const { data: hospital, error: hospitalError } = await supabase
          .from('hospitals')
          .select('name')
          .eq('id', resolvedParams.id)
          .single();

        if (hospitalError) throw hospitalError;
        setHospitalName(hospital.name);

        // 診療時間取得
        const existingSchedules = await getHospitalSchedules(resolvedParams.id);

        if (existingSchedules.length > 0) {
          // 既存データを変換
          const formattedSchedules = existingSchedules.map(s => ({
            day_of_week: s.day_of_week,
            morning_start: s.morning_start || '00:00',
            morning_end: s.morning_end || '00:00',
            afternoon_start: s.afternoon_start || '00:00',
            afternoon_end: s.afternoon_end || '00:00',
            is_closed: s.is_closed,
            note: s.note || '',
          }));
          setSchedules(formattedSchedules);
        } else {
          // 初期データ
          setSchedules(initializeSchedules());
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    startTransition(async () => {
      try {
        await updateHospitalSchedules(hospitalId, schedules);
        setToastMessage('診療時間を更新しました');
        setShowToast(true);

        // 3秒後に病院一覧に戻る
        setTimeout(() => {
          router.push('/admin/hospitals');
        }, 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : '更新に失敗しました');
      }
    });
  };

  const updateSchedule = (dayIndex: number, field: keyof ScheduleFormData, value: string | boolean) => {
    setSchedules(prev =>
      prev.map((schedule, i) =>
        i === dayIndex ? { ...schedule, [field]: value } : schedule
      )
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <Toast
        message={toastMessage}
        type="success"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      <div className="mb-6">
        <Link
          href="/admin/hospitals"
          className="text-primary hover:underline"
        >
          ← 病院一覧に戻る
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-2">診療時間編集</h1>
      <p className="text-lg text-gray-600 mb-6">{hospitalName}</p>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {schedules.map((schedule, dayIndex) => (
          <div key={dayIndex} className="border rounded-lg p-4 bg-white">
            <div className="flex items-center mb-4">
              <h3 className="text-lg font-bold mr-4">{DAYS[dayIndex]}曜日</h3>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={schedule.is_closed}
                  onChange={(e) => updateSchedule(dayIndex, 'is_closed', e.target.checked)}
                  className="mr-2 w-5 h-5"
                />
                <span className="text-base">休診</span>
              </label>
            </div>

            {!schedule.is_closed && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-2">午前</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={schedule.morning_start}
                      onChange={(e) => updateSchedule(dayIndex, 'morning_start', e.target.value)}
                      className="border rounded px-3 py-2 flex-1"
                    />
                    <span>〜</span>
                    <input
                      type="time"
                      value={schedule.morning_end}
                      onChange={(e) => updateSchedule(dayIndex, 'morning_end', e.target.value)}
                      className="border rounded px-3 py-2 flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium mb-2">午後</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={schedule.afternoon_start}
                      onChange={(e) => updateSchedule(dayIndex, 'afternoon_start', e.target.value)}
                      className="border rounded px-3 py-2 flex-1"
                    />
                    <span>〜</span>
                    <input
                      type="time"
                      value={schedule.afternoon_end}
                      onChange={(e) => updateSchedule(dayIndex, 'afternoon_end', e.target.value)}
                      className="border rounded px-3 py-2 flex-1"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4">
              <label className="block font-medium mb-2">備考</label>
              <input
                type="text"
                value={schedule.note}
                onChange={(e) => updateSchedule(dayIndex, 'note', e.target.value)}
                placeholder="第3土曜休診など"
                className="border rounded px-3 py-2 w-full"
              />
            </div>
          </div>
        ))}

        <div className="flex gap-4">
          <Button
            type="submit"
            variant="primary"
            disabled={isPending}
          >
            {isPending ? '保存中...' : '保存する'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/admin/hospitals')}
          >
            キャンセル
          </Button>
        </div>
      </form>
    </div>
  );
}
