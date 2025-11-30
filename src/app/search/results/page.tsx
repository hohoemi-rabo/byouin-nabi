'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { parseCommaSeparatedList } from '@/lib/queryUtils';
import type { Hospital } from '@/types/hospital';
import ErrorBox from '@/components/Common/ErrorBox';
import LoadingBox from '@/components/Common/LoadingBox';
import HospitalListItem from '@/components/HospitalList/HospitalListItem';
import Link from 'next/link';

function SearchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URLパラメータから検索条件を取得
  const categories = parseCommaSeparatedList(searchParams.get('categories'));
  const cities = parseCommaSeparatedList(searchParams.get('cities'));
  const keyword = searchParams.get('keyword') || '';

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // 検索条件がない場合は検索ページにリダイレクト
  useEffect(() => {
    if (categories.length === 0 && cities.length === 0 && !keyword) {
      router.push('/search');
      return;
    }
  }, [categories.length, cities.length, keyword, router]);

  // 検索を実行
  useEffect(() => {
    const executeSearch = async () => {
      if (categories.length === 0 && cities.length === 0 && !keyword) {
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await fetch(`/api/search?${searchParams.toString()}`);

        if (!response.ok) {
          throw new Error('検索に失敗しました');
        }

        const data = await response.json();
        setHospitals(data.hospitals || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : '検索に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    executeSearch();
  }, [searchParams, categories.length, cities.length, keyword]);

  // 検索条件の表示用テキスト
  const getSearchSummary = () => {
    const parts: string[] = [];
    if (categories.length > 0) {
      parts.push(`診療科: ${categories.join(', ')}`);
    }
    if (cities.length > 0) {
      parts.push(`市町村: ${cities.join(', ')}`);
    }
    if (keyword) {
      parts.push(`キーワード: ${keyword}`);
    }
    return parts;
  };

  const searchSummary = getSearchSummary();

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8 px-4 pb-24 md:pb-8">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">検索結果</h1>

          {/* 検索条件の表示 */}
          {searchSummary.length > 0 && (
            <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
              <p className="text-sm text-gray-500 mb-2">検索条件:</p>
              <div className="flex flex-wrap gap-2">
                {searchSummary.map((item, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 条件変更ボタン（PC用、ヘッダー部分） */}
          <div className="hidden md:flex justify-center">
            <Link
              href={`/search?${searchParams.toString()}`}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg text-lg font-bold hover:bg-gray-300 transition-colors min-h-tap inline-flex items-center gap-2"
            >
              ← 条件を変更する
            </Link>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-6">
            <ErrorBox error={error} title="検索に失敗しました" />
          </div>
        )}

        {/* 検索結果 */}
        {loading ? (
          <LoadingBox message="検索中..." size="lg" />
        ) : (
          <div>
            {/* 件数表示 */}
            <div className="bg-purple-light border-l-8 border-purple rounded-lg p-4 mb-6 shadow-md">
              <h2 className="text-2xl font-bold text-gray-800">
                <span className="text-purple">{hospitals.length}件</span>の病院が見つかりました
              </h2>
            </div>

            {hospitals.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-xl text-gray-600 mb-4">
                  該当する病院が見つかりませんでした
                </p>
                <p className="text-base text-gray-500">
                  検索条件を変更してお試しください
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {hospitals.map((hospital) => {
                  const detailUrl = `/hospital/${hospital.id}?${searchParams.toString()}`;

                  return (
                    <HospitalListItem
                      key={hospital.id}
                      hospital={hospital}
                      highlightCategories={categories}
                      detailUrl={detailUrl}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 下部の条件変更ボタン（PC用） */}
        {!loading && hospitals.length > 0 && (
          <div className="mt-8 hidden md:flex justify-center">
            <Link
              href={`/search?${searchParams.toString()}`}
              className="bg-primary text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-primary/90 transition-colors min-h-tap inline-flex items-center gap-2"
            >
              条件を変更して再検索
            </Link>
          </div>
        )}
      </div>
    </div>

      {/* スマホ用固定フッター */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 md:hidden z-50">
        <div className="flex">
          <Link
            href="/"
            className="flex-1 py-4 text-center text-lg font-bold text-gray-700 border-r border-gray-300 active:bg-gray-100"
          >
            ホーム
          </Link>
          <Link
            href={`/search?${searchParams.toString()}`}
            className="flex-1 py-4 text-center text-lg font-bold text-gray-700 active:bg-gray-100"
          >
            条件を変更
          </Link>
        </div>
      </div>
    </>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <LoadingBox message="読み込み中..." size="lg" />
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
