'use client';

import { useEffect, useState } from 'react';
import HospitalListItem from './HospitalListItem';
import ErrorBox from '@/components/Common/ErrorBox';
import LoadingBox from '@/components/Common/LoadingBox';
import { sortByScore } from '@/lib/hospitalScoring';
import { useAuth } from '@/context/AuthContext';
import type { Hospital } from '@/types/hospital';
import type { UrgencyLevel } from '@/types/ai';

interface HospitalListProps {
  departments: string[];
  urgency?: UrgencyLevel;
}

export default function HospitalList({ departments, urgency }: HospitalListProps) {
  const { user } = useAuth();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      if (departments.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const categoriesParam = departments.join(',');

        // 病院データとかかりつけ医を並列取得
        const fetches: Promise<Response>[] = [
          fetch(`/api/search?categories=${encodeURIComponent(categoriesParam)}`, {
            signal: abortController.signal,
          }),
        ];

        if (user) {
          fetches.push(fetch('/api/user/favorites', { signal: abortController.signal }));
        }

        const [hospitalRes, favRes] = await Promise.all(fetches);

        if (!hospitalRes.ok) {
          const errorData = await hospitalRes.json();
          throw new Error(errorData.error || '病院の検索に失敗しました');
        }

        const hospitalData = await hospitalRes.json();
        let fetchedHospitals: Hospital[] = hospitalData.hospitals;

        // かかりつけ医ID取得
        let favIds: string[] = [];
        if (favRes?.ok) {
          const favData = await favRes.json();
          favIds = (favData.favorites || []).map((f: { hospital_id: string }) => f.hospital_id);
          setFavoriteIds(favIds);
        }

        // 緊急時は救急対応病院のみ
        if (urgency === 'emergency') {
          fetchedHospitals = fetchedHospitals.filter(h => h.emergency_available);
        }

        // スコアリング順にソート
        const sorted = sortByScore(fetchedHospitals, {
          recommendedDepartments: departments,
          favoriteHospitalIds: favIds,
          urgency,
        });

        setHospitals(sorted);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error('Hospital fetch error:', err);
        setError(err instanceof Error ? err.message : '病院の検索に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => abortController.abort();
  }, [departments, user, urgency]);

  if (loading) return <LoadingBox message="病院を検索しています..." size="lg" />;
  if (error) return <ErrorBox error={error} title="病院の検索に失敗しました" />;

  if (hospitals.length === 0) {
    return (
      <div className="bg-warning/10 border-2 border-warning rounded-lg p-6">
        <h3 className="text-xl font-bold text-warning mb-2">
          該当する病院が見つかりませんでした
        </h3>
        <p className="text-lg text-gray-700">
          {urgency === 'emergency'
            ? '救急対応の病院が見つかりませんでした。119番に電話してください。'
            : 'お近くの病院にお問い合わせいただくか、別の診療科もご検討ください。'}
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
            isFavorite={favoriteIds.includes(hospital.id)}
            showRouteButton
          />
        ))}
      </div>
    </div>
  );
}
