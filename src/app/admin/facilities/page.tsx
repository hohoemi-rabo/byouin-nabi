'use client';

import { useEffect, useState, useTransition, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Facility } from '@/types/facility';
import Button from '@/components/Common/Button';
import ConfirmModal from '@/components/Common/ConfirmModal';
import SuccessModal from '@/components/Common/SuccessModal';
import Toast from '@/components/Common/Toast';
import { deleteFacility } from '@/app/admin/facility-actions';

const CATEGORY_LABELS: Record<string, string> = {
  shopping: '🛒 買い物',
  government: '🏛️ 役所',
  banking: '🏧 銀行',
  welfare: '🏥 福祉',
  leisure: '🎭 趣味',
};

function AdminFacilitiesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [facilityToDelete, setFacilityToDelete] = useState<Facility | null>(null);
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = filterCategory ? `/api/facilities?category=${filterCategory}` : '/api/facilities';
        const res = await fetch(url);
        if (!res.ok) throw new Error('データの取得に失敗しました');
        const data = await res.json();
        setFacilities(data.facilities || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラー');
      } finally {
        setLoading(false);
      }
    };
    setLoading(true);
    fetchData();
  }, [filterCategory]);

  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'created') { setToastMessage('施設を登録しました'); setShowToast(true); router.replace('/admin/facilities'); }
    else if (success === 'updated') { setToastMessage('施設を更新しました'); setShowToast(true); router.replace('/admin/facilities'); }
  }, [searchParams, router]);

  const handleDelete = (facility: Facility) => { setFacilityToDelete(facility); setShowConfirmModal(true); };

  const handleConfirmDelete = async () => {
    if (!facilityToDelete) return;
    setShowConfirmModal(false);
    startTransition(async () => {
      try {
        await deleteFacility(facilityToDelete.id);
        setFacilities(facilities.filter(f => f.id !== facilityToDelete.id));
        setShowSuccessModal(true);
      } catch (err) { alert(err instanceof Error ? err.message : '削除に失敗しました'); }
    });
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><p className="text-base text-gray-600">読み込み中...</p></div>;
  if (error) return <div className="bg-error/10 border-2 border-error rounded-lg p-4"><p className="text-error font-bold text-sm">{error}</p></div>;

  return (
    <>
      <Toast message={toastMessage} type="success" isVisible={showToast} onClose={() => setShowToast(false)} />
      <ConfirmModal isOpen={showConfirmModal} title="施設の削除"
        message={facilityToDelete ? `本当に「${facilityToDelete.name}」を削除しますか？\n\nこの操作は取り消せません。` : ''}
        confirmText="削除する" cancelText="キャンセル" type="danger"
        onConfirm={handleConfirmDelete} onCancel={() => setShowConfirmModal(false)} />
      <SuccessModal isOpen={showSuccessModal} title="削除完了" message="施設を削除しました" onClose={() => setShowSuccessModal(false)} />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">施設管理</h1>
            <p className="text-sm text-gray-600">登録されている施設（{facilities.length}件）</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/facilities/import"><Button variant="secondary" className="text-sm">📥 インポート</Button></Link>
            <Link href="/admin/facilities/new"><Button variant="primary" className="text-sm">➕ 新規登録</Button></Link>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilterCategory('')}
            className={`px-3 py-1 rounded-full text-sm ${!filterCategory ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>すべて</button>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <button key={value} onClick={() => setFilterCategory(value)}
              className={`px-3 py-1 rounded-full text-sm ${filterCategory === value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{label}</button>
          ))}
        </div>

        {facilities.length === 0 ? (
          <div className="bg-gray-100 rounded-lg p-8 text-center"><p className="text-lg text-gray-600">施設が登録されていません</p></div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {facilities.map(facility => (
              <div key={facility.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-lg font-bold text-foreground">{facility.name}</h2>
                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
                        {CATEGORY_LABELS[facility.category] || facility.category}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">📍 {facility.address}（{facility.city}）</p>
                      {facility.phone && <p className="text-sm text-gray-600">📞 {facility.phone}</p>}
                      {facility.opening_hours && <p className="text-sm text-gray-600">🕒 {facility.opening_hours}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link href={`/admin/facilities/${facility.id}/edit`}>
                      <Button variant="secondary" className="w-full text-sm px-3 py-2">✏️ 編集</Button>
                    </Link>
                    <Button variant="secondary" onClick={() => handleDelete(facility)} disabled={isPending}
                      className="bg-error/10 text-error hover:bg-error/20 border-error text-sm px-3 py-2">🗑️ 削除</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function AdminFacilitiesPage() {
  return <Suspense fallback={<div className="p-4 text-center">読み込み中...</div>}><AdminFacilitiesContent /></Suspense>;
}
