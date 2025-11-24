'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ALL_DEPARTMENTS, ALL_CITIES } from '@/lib/masterData';
import type { Hospital } from '@/types/hospital';
import LoadingSpinner from '@/components/Common/LoadingSpinner';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URLパラメータから初期値を取得
  const initialCategories = searchParams.get('categories')?.split(',').filter(Boolean) || [];
  const initialCities = searchParams.get('cities')?.split(',').filter(Boolean) || [];
  const initialKeyword = searchParams.get('keyword') || '';
  const shouldAutoSearch = searchParams.toString().length > 0;

  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(initialCategories);
  const [selectedCities, setSelectedCities] = useState<string[]>(initialCities);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string>('');

  const handleDepartmentToggle = (dept: string) => {
    setSelectedDepartments(prev =>
      prev.includes(dept)
        ? prev.filter(d => d !== dept)
        : [...prev, dept]
    );
  };

  const handleCityToggle = (city: string) => {
    setSelectedCities(prev =>
      prev.includes(city)
        ? prev.filter(c => c !== city)
        : [...prev, city]
    );
  };

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const params = new URLSearchParams();

      if (selectedDepartments.length > 0) {
        params.append('categories', selectedDepartments.join(','));
      }

      if (selectedCities.length > 0) {
        params.append('cities', selectedCities.join(','));
      }

      if (keyword.trim()) {
        params.append('keyword', keyword.trim());
      }

      // URLを更新
      router.push(`/search?${params.toString()}`, { scroll: false });

      const response = await fetch(`/api/search?${params.toString()}`);

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

  // URLパラメータが変更されたら自動的に検索を実行
  useEffect(() => {
    if (shouldAutoSearch) {
      const executeSearch = async () => {
        setLoading(true);
        setError('');
        setSearched(true);

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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReset = () => {
    setSelectedDepartments([]);
    setSelectedCities([]);
    setKeyword('');
    setHospitals([]);
    setSearched(false);
    setError('');
    // URLもクリア
    router.push('/search');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">病院検索</h1>

        {/* 検索フォーム */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {/* キーワード検索 */}
          <div className="mb-6">
            <label className="block text-xl font-bold mb-3">
              病院名で検索
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="病院名を入力"
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-primary"
            />
          </div>

          {/* 診療科選択 */}
          <div className="mb-6">
            <label className="block text-xl font-bold mb-3">
              診療科で絞り込み
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {ALL_DEPARTMENTS.map((dept) => (
                <label
                  key={dept}
                  className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{
                    borderColor: selectedDepartments.includes(dept) ? '#1e40af' : '#d1d5db',
                    backgroundColor: selectedDepartments.includes(dept) ? '#eff6ff' : 'white',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedDepartments.includes(dept)}
                    onChange={() => handleDepartmentToggle(dept)}
                    className="mr-2 w-5 h-5"
                  />
                  <span className="text-base font-medium">{dept}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 市町村選択 */}
          <div className="mb-6">
            <label className="block text-xl font-bold mb-3">
              市町村で絞り込み
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {ALL_CITIES.map((city) => (
                <label
                  key={city}
                  className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{
                    borderColor: selectedCities.includes(city) ? '#1e40af' : '#d1d5db',
                    backgroundColor: selectedCities.includes(city) ? '#eff6ff' : 'white',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedCities.includes(city)}
                    onChange={() => handleCityToggle(city)}
                    className="mr-2 w-5 h-5"
                  />
                  <span className="text-base font-medium">{city}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ボタン */}
          <div className="flex gap-4">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex-1 bg-primary text-white px-6 py-4 rounded-lg text-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 min-h-tap"
            >
              {loading ? '検索中...' : '検索する'}
            </button>
            <button
              onClick={handleReset}
              disabled={loading}
              className="bg-gray-200 text-gray-700 px-6 py-4 rounded-lg text-xl font-bold hover:bg-gray-300 transition-colors disabled:opacity-50 min-h-tap"
            >
              リセット
            </button>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700 text-lg">{error}</p>
          </div>
        )}

        {/* 検索結果 */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : searched ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">
              検索結果: {hospitals.length}件
            </h2>

            {hospitals.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-xl text-gray-600">
                  該当する病院が見つかりませんでした
                </p>
                <p className="text-base text-gray-500 mt-2">
                  検索条件を変更してお試しください
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {hospitals.map((hospital) => {
                  // 現在の検索条件をクエリパラメータとして詳細ページに渡す
                  const detailUrl = `/hospital/${hospital.id}?${searchParams.toString()}`;

                  return (
                    <Link
                      key={hospital.id}
                      href={detailUrl}
                      className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                    >
                    <h3 className="text-2xl font-bold mb-3 text-primary">
                      {hospital.name}
                    </h3>

                    <div className="space-y-2">
                      <p className="text-lg">
                        <span className="mr-2">📍</span>
                        {hospital.address}
                      </p>

                      <p className="text-lg">
                        <span className="mr-2">📞</span>
                        {hospital.tel}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {hospital.category.map((cat) => (
                          <span
                            key={cat}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-base font-medium"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
