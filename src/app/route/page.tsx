'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import LocationInput from '@/components/Route/LocationInput';
import RouteCard from '@/components/Route/RouteCard';
import LoadingBox from '@/components/Common/LoadingBox';
import ErrorBox from '@/components/Common/ErrorBox';
import MobileFixedFooter from '@/components/Common/MobileFixedFooter';
import SearchLogger from '@/components/Common/SearchLogger';
import type { RouteSearchResponse } from '@/types/route';

function RouteContent() {
  const searchParams = useSearchParams();
  const toParam = searchParams.get('to');
  const fromParam = searchParams.get('from');
  const hospitalName = searchParams.get('name') || '目的地';

  const [result, setResult] = useState<RouteSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoSearched = useRef(false);

  const handleLocationSelect = useCallback(async (location: { lat: number; lng: number }) => {
    setLoading(true);
    setError(null);

    try {
      const toBody = toParam?.includes(',')
        ? { lat: parseFloat(toParam.split(',')[0]), lng: parseFloat(toParam.split(',')[1]) }
        : { hospital_id: toParam };

      const res = await fetch('/api/route/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: { lat: location.lat, lng: location.lng },
          to: toBody,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'ルート検索に失敗しました');
      }

      const data: RouteSearchResponse = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ルート検索に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [toParam]);

  // fromParam がある場合は初回のみ自動検索（useEffect で実行）
  useEffect(() => {
    if (!fromParam || autoSearched.current) return;
    autoSearched.current = true;

    const [lat, lng] = fromParam.split(',').map(Number);
    if (!isNaN(lat) && !isNaN(lng)) {
      handleLocationSelect({ lat, lng });
    }
  }, [fromParam, handleLocationSelect]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {toParam && <SearchLogger logType="route" searchData={{ to: toParam }} />}
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          🚌 {hospitalName} への行き方
        </h1>
        <p className="text-base text-gray-600 mb-6">
          出発地を入力すると、交通手段をお調べします
        </p>

        {/* 出発地入力（結果が出るまで表示） */}
        {!result && !loading && (
          <div className="mb-8">
            <LocationInput onLocationSelect={handleLocationSelect} />
          </div>
        )}

        {/* ローディング */}
        {loading && (
          <div className="py-12">
            <LoadingBox message="ルートを検索中..." size="lg" />
          </div>
        )}

        {/* エラー */}
        {error && (
          <div className="mb-6">
            <ErrorBox error={error} />
            <div className="mt-4">
              <LocationInput onLocationSelect={handleLocationSelect} />
            </div>
          </div>
        )}

        {/* ルート結果 */}
        {result && (
          <>
            <div className="mb-4 text-sm text-gray-600">
              {result.destination.name} までのルート（{result.routes.length}件）
            </div>

            <div className="space-y-4 mb-6">
              {result.routes.map((route, i) => (
                <RouteCard key={i} route={route} index={i} />
              ))}
            </div>

            {result.routes.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6">
                <p className="text-yellow-800">ルートが見つかりませんでした。</p>
              </div>
            )}

            {/* 出発地を変更 */}
            <button
              onClick={() => { setResult(null); autoSearched.current = false; setError(null); }}
              className="text-primary underline text-base mb-6 block"
            >
              📍 出発地を変更する
            </button>

            {/* 案内 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <p>💡 交通手段がわからない場合は、飯田市役所（0265-22-4511）にお電話ください。</p>
            </div>
          </>
        )}

        <div className="h-20 md:hidden" />
      </div>

      <MobileFixedFooter backUrl={toParam ? `/hospital/${toParam}` : '/'} backText="戻る" />
    </div>
  );
}

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingBox message="読み込み中..." />}>
      <RouteContent />
    </Suspense>
  );
}
