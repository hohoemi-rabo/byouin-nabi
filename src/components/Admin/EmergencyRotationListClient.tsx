'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/Common/Button';
import ConfirmModal from '@/components/Common/ConfirmModal';
import Toast from '@/components/Common/Toast';
import {
  deleteEmergencyRotation,
  deleteRotationsByMonth,
} from '@/app/admin/actions';
import {
  type EmergencyRotation,
  type RotationType,
  ROTATION_TYPE_LABELS,
  ROTATION_TYPE_OPTIONS,
} from '@/types/emergency-rotation';

interface Props {
  rotations: EmergencyRotation[];
  availableMonths: string[];
  currentMonth: string;
}

type FilterValue = RotationType | 'all';

export default function EmergencyRotationListClient({
  rotations,
  availableMonths,
  currentMonth,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<FilterValue>('all');

  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<EmergencyRotation | null>(null);
  const [showMonthDeleteConfirm, setShowMonthDeleteConfirm] = useState(false);

  // success クエリパラメータからトースト表示
  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'created') {
      setToastMessage('救急ローテーションを登録しました');
      setShowToast(true);
      router.replace(`/admin/emergency-rotations?month=${currentMonth}`);
    } else if (success === 'updated') {
      setToastMessage('救急ローテーションを更新しました');
      setShowToast(true);
      router.replace(`/admin/emergency-rotations?month=${currentMonth}`);
    }
  }, [searchParams, router, currentMonth]);

  const filtered = useMemo(() => {
    if (filter === 'all') return rotations;
    return rotations.filter((r) => r.rotation_type === filter);
  }, [rotations, filter]);

  const handleMonthChange = (month: string) => {
    router.push(`/admin/emergency-rotations?month=${month}`);
  };

  const handleDelete = (rotation: EmergencyRotation) => {
    setDeleteTarget(rotation);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);

    startTransition(async () => {
      try {
        await deleteEmergencyRotation(target.id);
        setToastMessage('削除しました');
        setShowToast(true);
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : '削除に失敗しました');
      }
    });
  };

  const confirmMonthDelete = async () => {
    setShowMonthDeleteConfirm(false);

    startTransition(async () => {
      try {
        const result = await deleteRotationsByMonth(currentMonth);
        setToastMessage(`${currentMonth} のデータ ${result.deleted} 件を削除しました`);
        setShowToast(true);
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : '月次削除に失敗しました');
      }
    });
  };

  return (
    <>
      <Toast
        message={toastMessage}
        type="success"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="救急ローテーションの削除"
        message={
          deleteTarget
            ? `本当にこの当番情報を削除しますか？\n\n${deleteTarget.duty_date} / ${ROTATION_TYPE_LABELS[deleteTarget.rotation_type]} / ${deleteTarget.facility_name}\n\nこの操作は取り消せません。`
            : ''
        }
        confirmText="削除する"
        cancelText="キャンセル"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmModal
        isOpen={showMonthDeleteConfirm}
        title={`${currentMonth} の全データを削除`}
        message={`${currentMonth} に登録されている救急ローテーション ${rotations.length} 件をすべて削除します。\n\nこの操作は取り消せません。`}
        confirmText="月次削除を実行"
        cancelText="キャンセル"
        type="danger"
        onConfirm={confirmMonthDelete}
        onCancel={() => setShowMonthDeleteConfirm(false)}
      />

      {/* 月選択タブ */}
      {availableMonths.length > 0 && (
        <div className="bg-white rounded-lg shadow p-3 mb-4">
          <p className="text-xs text-gray-600 mb-2">対象月</p>
          <div className="flex flex-wrap gap-2">
            {availableMonths.map((month) => (
              <button
                key={month}
                onClick={() => handleMonthChange(month)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  month === currentMonth
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {month}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* フィルター + アクション */}
      <div className="bg-white rounded-lg shadow p-3 mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">種別:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterValue)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
          >
            <option value="all">全て</option>
            {ROTATION_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {rotations.length > 0 && (
          <Button
            variant="secondary"
            className="bg-error/10 text-error border-error text-xs"
            onClick={() => setShowMonthDeleteConfirm(true)}
            disabled={isPending}
          >
            🗑️ {currentMonth} を全削除
          </Button>
        )}
      </div>

      {/* テーブル */}
      {filtered.length === 0 ? (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-base text-gray-600">
            {rotations.length === 0
              ? `${currentMonth} のデータは登録されていません`
              : '条件に一致するデータがありません'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium text-gray-700">日付</th>
                <th className="px-3 py-2 font-medium text-gray-700">種別</th>
                <th className="px-3 py-2 font-medium text-gray-700">地区</th>
                <th className="px-3 py-2 font-medium text-gray-700">診療科</th>
                <th className="px-3 py-2 font-medium text-gray-700">施設名</th>
                <th className="px-3 py-2 font-medium text-gray-700">電話</th>
                <th className="px-3 py-2 font-medium text-gray-700">時間</th>
                <th className="px-3 py-2 font-medium text-gray-700">備考</th>
                <th className="px-3 py-2 font-medium text-gray-700 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">{r.duty_date}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                      {ROTATION_TYPE_LABELS[r.rotation_type]}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{r.area}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{r.department ?? '—'}</td>
                  <td className="px-3 py-2">
                    {r.facility_name}
                    {r.hospital_id && (
                      <span className="text-xs text-gray-400 ml-1" title="既存病院と紐付け済み">
                        🔗
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{r.phone}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {r.start_time.slice(0, 5)}–{r.end_time.slice(0, 5)}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-600 max-w-xs truncate">
                    {r.note ?? ''}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <div className="flex gap-1 justify-end">
                      <Link href={`/admin/emergency-rotations/${r.id}/edit`}>
                        <Button variant="secondary" className="text-xs px-2 py-1">
                          ✏️
                        </Button>
                      </Link>
                      <Button
                        variant="secondary"
                        onClick={() => handleDelete(r)}
                        disabled={isPending}
                        className="bg-error/10 text-error border-error text-xs px-2 py-1"
                      >
                        🗑️
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-3">
        合計 {filtered.length} 件（全 {rotations.length} 件中）
      </p>
    </>
  );
}
