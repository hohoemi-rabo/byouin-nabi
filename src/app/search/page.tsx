'use client';

import { useState, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ALL_DEPARTMENTS, ALL_CITIES } from '@/lib/masterData';
import { parseCommaSeparatedList, toCommaSeparatedString, toggleArrayItem } from '@/lib/queryUtils';
import LoadingBox from '@/components/Common/LoadingBox';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URLパラメータから初期値を取得（検索結果ページから戻ってきた場合の復元用）
  const initialCategories = parseCommaSeparatedList(searchParams.get('categories'));
  const initialCities = parseCommaSeparatedList(searchParams.get('cities'));
  const initialKeyword = searchParams.get('keyword') || '';

  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(initialCategories);
  const [selectedCities, setSelectedCities] = useState<string[]>(initialCities);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [barrierFree, setBarrierFree] = useState(searchParams.get('barrier_free') === 'true');
  const [parking, setParking] = useState(searchParams.get('parking') === 'true');
  const [emergency, setEmergency] = useState(searchParams.get('emergency') === 'true');

  // トグル処理を汎用化
  const handleDepartmentToggle = useCallback((dept: string) => {
    setSelectedDepartments(prev => toggleArrayItem(prev, dept));
  }, []);

  const handleCityToggle = useCallback((city: string) => {
    setSelectedCities(prev => toggleArrayItem(prev, city));
  }, []);

  // 検索ボタンクリック時に検索結果ページへ遷移
  const handleSearch = () => {
    // 検索条件がない場合は何もしない
    if (selectedDepartments.length === 0 && selectedCities.length === 0 && !keyword.trim()) {
      return;
    }

    const params = new URLSearchParams();

    const categoriesStr = toCommaSeparatedString(selectedDepartments);
    if (categoriesStr) {
      params.append('categories', categoriesStr);
    }

    const citiesStr = toCommaSeparatedString(selectedCities);
    if (citiesStr) {
      params.append('cities', citiesStr);
    }

    if (keyword.trim()) {
      params.append('keyword', keyword.trim());
    }
    if (barrierFree) params.append('barrier_free', 'true');
    if (parking) params.append('parking', 'true');
    if (emergency) params.append('emergency', 'true');

    // 検索結果ページへ遷移
    router.push(`/search/results?${params.toString()}`);
  };

  const handleReset = () => {
    setSelectedDepartments([]);
    setSelectedCities([]);
    setKeyword('');
    setBarrierFree(false);
    setParking(false);
    setEmergency(false);
    // URLもクリア
    router.push('/search');
  };

  // 検索条件が入力されているか
  const hasSearchCondition = selectedDepartments.length > 0 || selectedCities.length > 0 || keyword.trim().length > 0 || barrierFree || parking || emergency;

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

          {/* 設備フィルター */}
          <div className="mb-6">
            <label className="block text-xl font-bold mb-3">
              設備で絞り込み
            </label>
            <div className="flex flex-wrap gap-3">
              <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${barrierFree ? 'border-primary bg-blue-50' : 'border-gray-300'}`}>
                <input type="checkbox" checked={barrierFree} onChange={(e) => setBarrierFree(e.target.checked)} className="mr-2 w-5 h-5" />
                <span className="text-base font-medium">♿ バリアフリー</span>
              </label>
              <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${parking ? 'border-primary bg-blue-50' : 'border-gray-300'}`}>
                <input type="checkbox" checked={parking} onChange={(e) => setParking(e.target.checked)} className="mr-2 w-5 h-5" />
                <span className="text-base font-medium">🅿️ 駐車場あり</span>
              </label>
              <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${emergency ? 'border-primary bg-blue-50' : 'border-gray-300'}`}>
                <input type="checkbox" checked={emergency} onChange={(e) => setEmergency(e.target.checked)} className="mr-2 w-5 h-5" />
                <span className="text-base font-medium">🚑 救急対応</span>
              </label>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex gap-4">
            <button
              onClick={handleSearch}
              disabled={!hasSearchCondition}
              className="flex-1 bg-primary text-white px-6 py-4 rounded-lg text-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-tap"
            >
              検索する
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-200 text-gray-700 px-6 py-4 rounded-lg text-xl font-bold hover:bg-gray-300 transition-colors min-h-tap"
            >
              リセット
            </button>
          </div>

          {/* 検索条件未入力時のメッセージ */}
          {!hasSearchCondition && (
            <p className="text-center text-gray-500 mt-4">
              診療科、市町村、または病院名を入力してください
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <LoadingBox message="ページを読み込み中..." size="lg" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
