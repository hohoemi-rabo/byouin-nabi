'use client';

import { useEffect, useState, useTransition, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { TransportService } from '@/types/transport';
import Button from '@/components/Common/Button';
import ConfirmModal from '@/components/Common/ConfirmModal';
import SuccessModal from '@/components/Common/SuccessModal';
import Toast from '@/components/Common/Toast';
import { deleteTransportService } from '@/app/admin/transport-actions';

const TYPE_LABELS: Record<string, string> = {
  route_bus: '路線バス',
  demand: 'デマンド交通',
  taxi: 'タクシー',
  welfare_taxi: '福祉タクシー',
  shuttle: '送迎バス',
};

function AdminTransportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [services, setServices] = useState<TransportService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [serviceToDelete, setServiceToDelete] = useState<TransportService | null>(null);
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const url = filterType ? `/api/transport?type=${filterType}` : '/api/transport';
        const response = await fetch(url);
        if (!response.ok) throw new Error('データの取得に失敗しました');
        const data = await response.json();
        setServices(data.services || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    setLoading(true);
    fetchServices();
  }, [filterType]);

  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'created') {
      setToastMessage('交通サービスを登録しました');
      setShowToast(true);
      router.replace('/admin/transport');
    } else if (success === 'updated') {
      setToastMessage('交通サービスを更新しました');
      setShowToast(true);
      router.replace('/admin/transport');
    }
  }, [searchParams, router]);

  const handleDelete = (service: TransportService) => {
    setServiceToDelete(service);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;
    setShowConfirmModal(false);
    startTransition(async () => {
      try {
        await deleteTransportService(serviceToDelete.id);
        setServices(services.filter(s => s.id !== serviceToDelete.id));
        setShowSuccessModal(true);
      } catch (err) {
        alert(err instanceof Error ? err.message : '削除に失敗しました');
      }
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><p className="text-base text-gray-600">読み込み中...</p></div>;
  }

  if (error) {
    return <div className="bg-error/10 border-2 border-error rounded-lg p-4"><p className="text-error font-bold text-sm">&#10060; {error}</p></div>;
  }

  return (
    <>
      <Toast message={toastMessage} type="success" isVisible={showToast} onClose={() => setShowToast(false)} />
      <ConfirmModal isOpen={showConfirmModal} title="交通サービスの削除"
        message={serviceToDelete ? `本当に「${serviceToDelete.name}」を削除しますか？\n\nこの操作は取り消せません。` : ''}
        confirmText="削除する" cancelText="キャンセル" type="danger"
        onConfirm={handleConfirmDelete} onCancel={() => setShowConfirmModal(false)} />
      <SuccessModal isOpen={showSuccessModal} title="削除完了" message="交通サービスを削除しました" onClose={() => setShowSuccessModal(false)} />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">交通手段管理</h1>
            <p className="text-sm text-gray-600">登録されている交通サービス（{services.length}件）</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/transport/import">
              <Button variant="secondary" className="text-sm">📥 インポート</Button>
            </Link>
            <Link href="/admin/transport/new">
              <Button variant="primary" className="text-sm">➕ 新規登録</Button>
            </Link>
          </div>
        </div>

        {/* 種別フィルター */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilterType('')}
            className={`px-3 py-1 rounded-full text-sm ${!filterType ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            すべて
          </button>
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <button key={value} onClick={() => setFilterType(value)}
              className={`px-3 py-1 rounded-full text-sm ${filterType === value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {label}
            </button>
          ))}
        </div>

        {services.length === 0 ? (
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <p className="text-lg text-gray-600">交通サービスが登録されていません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-lg font-bold text-foreground">{service.name}</h2>
                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
                        {TYPE_LABELS[service.service_type] || service.service_type}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">🏢 {service.operator}</p>
                      <p className="text-sm text-gray-600">📍 {service.service_area.join(', ')}</p>
                      {service.phone && <p className="text-sm text-gray-600">📞 {service.phone}</p>}
                      {service.fare_info && <p className="text-sm text-gray-600">💰 {service.fare_info}</p>}
                      <div className="flex gap-2 mt-1">
                        {service.advance_booking_required && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">要予約</span>
                        )}
                        {service.wheelchair_accessible && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">車椅子対応</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link href={`/admin/transport/${service.id}/edit`}>
                      <Button variant="secondary" className="w-full text-sm px-3 py-2">✏️ 編集</Button>
                    </Link>
                    <Button variant="secondary" onClick={() => handleDelete(service)} disabled={isPending}
                      className="bg-error/10 text-error hover:bg-error/20 border-error text-sm px-3 py-2">
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

export default function AdminTransportPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">読み込み中...</div>}>
      <AdminTransportContent />
    </Suspense>
  );
}
