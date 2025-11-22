'use client';

import { useEffect, useState, useTransition, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Hospital } from '@/types/hospital';
import Button from '@/components/Common/Button';
import ConfirmModal from '@/components/Common/ConfirmModal';
import SuccessModal from '@/components/Common/SuccessModal';
import Toast from '@/components/Common/Toast';
import { deleteHospital } from '@/app/admin/actions';

function AdminHospitalsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [hospitalToDelete, setHospitalToDelete] = useState<Hospital | null>(null);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await fetch('/api/hospitals');
        if (!response.ok) {
          throw new Error('病院データの取得に失敗しました');
        }

        const data = await response.json();
        setHospitals(data.hospitals || []);
      } catch (err) {
        console.error('Hospitals fetch error:', err);
        setError(
          err instanceof Error ? err.message : '病院データの取得に失敗しました'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  // クエリパラメータから成功メッセージを検知
  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'created') {
      setToastMessage('病院を登録しました');
      setShowToast(true);
      // URLパラメータをクリア
      router.replace('/admin/hospitals');
    } else if (success === 'updated') {
      setToastMessage('病院を更新しました');
      setShowToast(true);
      // URLパラメータをクリア
      router.replace('/admin/hospitals');
    }
  }, [searchParams, router]);

  const handleDelete = (hospital: Hospital) => {
    setHospitalToDelete(hospital);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!hospitalToDelete) return;

    setShowConfirmModal(false);

    startTransition(async () => {
      try {
        await deleteHospital(hospitalToDelete.id);
        // 削除成功後、リストを更新
        setHospitals(hospitals.filter(h => h.id !== hospitalToDelete.id));
        setShowSuccessModal(true);
      } catch (err) {
        console.error('Delete error:', err);
        alert(err instanceof Error ? err.message : '削除に失敗しました');
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-base text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error/10 border-2 border-error rounded-lg p-4">
        <p className="text-error font-bold text-sm">❌ {error}</p>
      </div>
    );
  }

  return (
    <>
      {/* トースト通知 */}
      <Toast
        message={toastMessage}
        type="success"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      {/* 確認モーダル */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title="病院の削除"
        message={hospitalToDelete ? `本当に「${hospitalToDelete.name}」を削除しますか？\n\nこの操作は取り消せません。` : ''}
        confirmText="削除する"
        cancelText="キャンセル"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirmModal(false)}
      />

      {/* 成功モーダル */}
      <SuccessModal
        isOpen={showSuccessModal}
        title="削除完了"
        message="病院を削除しました"
        onClose={() => setShowSuccessModal(false)}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            病院管理
          </h1>
          <p className="text-sm text-gray-600">
            登録されている病院の一覧（{hospitals.length}件）
          </p>
        </div>

        <Link href="/admin/hospitals/new">
          <Button variant="primary" className="text-sm">
            ➕ 新規登録
          </Button>
        </Link>
      </div>

      {hospitals.length === 0 ? (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-lg text-gray-600">
            病院が登録されていません
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {hospitals.map((hospital) => (
            <div
              key={hospital.id}
              className="bg-white rounded-lg shadow p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-foreground mb-2">
                    {hospital.name}
                  </h2>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        📍
                      </span>
                      <p className="text-sm text-gray-600">
                        {hospital.address} ({hospital.city})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        📞
                      </span>
                      <p className="text-sm text-gray-600">{hospital.tel}</p>
                    </div>

                    {hospital.opening_hours && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          🕒
                        </span>
                        <p className="text-sm text-gray-600">
                          {hospital.opening_hours}
                        </p>
                      </div>
                    )}

                    {hospital.website && (
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          🌐
                        </span>
                        <a
                          href={hospital.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {hospital.website}
                        </a>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1 mt-2">
                      {hospital.category.map((cat) => (
                        <span
                          key={cat}
                          className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>

                    {hospital.note && (
                      <div className="mt-2 p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-700">
                          💡 {hospital.note}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Link href={`/admin/hospitals/${hospital.id}/edit`}>
                    <Button variant="secondary" className="w-full text-sm px-3 py-2">
                      ✏️ 編集
                    </Button>
                  </Link>
                  <Link href={`/admin/hospitals/${hospital.id}/schedules`}>
                    <Button variant="secondary" className="w-full text-sm px-3 py-2">
                      🕒 診療時間
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    onClick={() => handleDelete(hospital)}
                    disabled={isPending}
                    className="bg-error/10 text-error hover:bg-error/20 border-error text-sm px-3 py-2"
                  >
                    🗑️ 削除
                  </Button>
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

export default function AdminHospitalsPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">読み込み中...</div>}>
      <AdminHospitalsContent />
    </Suspense>
  );
}
