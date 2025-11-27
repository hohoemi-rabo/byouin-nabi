'use client';

import { useEffect, useState } from 'react';
import HospitalListItem from './HospitalListItem';
import ErrorBox from '@/components/Common/ErrorBox';
import LoadingBox from '@/components/Common/LoadingBox';
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
          `/api/search?categories=${encodeURIComponent(categoriesParam)}`,
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
    return <LoadingBox message="病院を検索しています..." size="lg" />;
  }

  if (error) {
    return <ErrorBox error={error} title="病院の検索に失敗しました" />;
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
      <div className="bg-purple-light border-l-8 border-purple rounded-lg p-4 shadow-md">
        <p className="text-lg text-gray-800 font-medium">
          <strong className="text-purple text-xl">{hospitals.length}件</strong>の病院が見つかりました
        </p>
      </div>

      <div className="space-y-4">
        {hospitals.map((hospital) => (
          <HospitalListItem
            key={hospital.id}
            hospital={hospital}
            highlightCategories={departments}
            detailUrl={`/hospital/${hospital.id}?from=results`}
          />
        ))}
      </div>
    </div>
  );
}
