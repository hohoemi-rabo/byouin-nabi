'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ALL_CITIES } from '@/lib/masterData';
import FacilityCard from '@/components/Outing/FacilityCard';
import LoadingBox from '@/components/Common/LoadingBox';
import ErrorBox from '@/components/Common/ErrorBox';
import MobileFixedFooter from '@/components/Common/MobileFixedFooter';
import type { Facility } from '@/types/facility';

const CATEGORY_LABELS: Record<string, string> = {
  shopping: '🛒 買い物',
  government: '🏛️ 役所・公共施設',
  banking: '🏧 銀行・郵便局',
  welfare: '🏥 医療・福祉',
  leisure: '🎭 趣味・交流',
};

export default function OutingCategoryPage() {
  const params = useParams();
  const category = params.category as string;
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCity, setFilterCity] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let url = `/api/facilities?category=${category}`;
        if (filterCity) url += `&city=${encodeURIComponent(filterCity)}`;
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
    fetchData();
  }, [category, filterCity]);

  const label = CATEGORY_LABELS[category] || category;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4">
          <Link href="/outing" className="text-primary hover:underline text-base">← カテゴリ選択に戻る</Link>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-4">{label}</h1>

        {/* 市町村フィルター */}
        <div className="mb-6">
          <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)}
            className="w-full md:w-auto border-2 border-gray-300 rounded-lg px-4 py-2 text-base focus:border-primary focus:outline-none">
            <option value="">すべての地域</option>
            {ALL_CITIES.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <LoadingBox message="施設を検索中..." size="lg" />
        ) : error ? (
          <ErrorBox error={error} />
        ) : facilities.length === 0 ? (
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <p className="text-lg text-gray-600">該当する施設が見つかりませんでした</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">{facilities.length}件の施設</p>
            <div className="space-y-4">
              {facilities.map(facility => (
                <FacilityCard key={facility.id} facility={facility} />
              ))}
            </div>
          </>
        )}

        <div className="h-20 md:hidden" />
      </div>

      <MobileFixedFooter backUrl="/outing" backText="カテゴリ" />
    </div>
  );
}
