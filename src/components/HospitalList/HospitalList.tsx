'use client';

import { useEffect, useState } from 'react';
import HospitalCard from './HospitalCard';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import type { Hospital } from '@/types/hospital';

interface HospitalListProps {
  departments: string[];
}

export default function HospitalList({ departments }: HospitalListProps) {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // AbortControllerで重複リクエストをキャンセル
    const abortController = new AbortController();

    const fetchHospitals = async () => {
      if (departments.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const categoriesParam = departments.join(',');
        const response = await fetch(
          `/api/hospitals/search?categories=${encodeURIComponent(categoriesParam)}`,
          { signal: abortController.signal }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '病院の検索に失敗しました');
        }

        const data = await response.json();
        setHospitals(data.hospitals);
      } catch (err) {
        // AbortErrorは無視（正常なキャンセル）
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        console.error('Hospital fetch error:', err);
        setError(err instanceof Error ? err.message : '病院の検索に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();

    // クリーンアップ：コンポーネントがアンマウントされたらリクエストをキャンセル
    return () => {
      abortController.abort();
    };
  }, [departments]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-xl text-gray-600">病院を検索しています...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error/10 border-2 border-error rounded-lg p-6">
        <h3 className="text-xl font-bold text-error mb-2">
          エラーが発生しました
        </h3>
        <p className="text-lg text-gray-700">{error}</p>
      </div>
    );
  }

  if (hospitals.length === 0) {
    return (
      <div className="bg-warning/10 border-2 border-warning rounded-lg p-6">
        <h3 className="text-xl font-bold text-warning mb-2">
          該当する病院が見つかりませんでした
        </h3>
        <p className="text-lg text-gray-700">
          現在、推奨される診療科に対応する病院の登録がありません。
          お近くの病院にお問い合わせいただくか、別の診療科もご検討ください。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-info/10 border border-info rounded-lg p-4">
        <p className="text-lg text-gray-700">
          <strong>{hospitals.length}件</strong>の病院が見つかりました
        </p>
      </div>

      <div className="space-y-6">
        {hospitals.map((hospital) => (
          <HospitalCard
            key={hospital.id}
            hospital={hospital}
            highlightCategories={departments}
          />
        ))}
      </div>
    </div>
  );
}
