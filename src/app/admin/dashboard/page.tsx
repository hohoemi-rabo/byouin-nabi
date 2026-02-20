import Link from 'next/link';
import Button from '@/components/Common/Button';
import { supabase } from '@/lib/supabase';
import type { Hospital } from '@/types/hospital';

export default async function AdminDashboardPage() {
  const { data: hospitals, error } = await supabase
    .from('hospitals')
    .select('*')
    .order('name');

  if (error) {
    throw new Error('データの取得に失敗しました: ' + error.message);
  }

  const hospitalList: Hospital[] = hospitals || [];

  // 統計情報を計算
  const cities = Array.from(
    new Set(hospitalList.map(h => h.city))
  ).sort();

  const categories = Array.from(
    new Set(hospitalList.flatMap(h => h.category))
  ).sort();

  const stats = {
    totalHospitals: hospitalList.length,
    cities,
    categories,
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">
          ダッシュボード
        </h1>
        <p className="text-sm text-gray-600">
          病院ナビ南信 管理システムの概要
        </p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🏥</div>
            <div>
              <p className="text-xs text-gray-600">登録病院数</p>
              <p className="text-2xl font-bold text-primary">
                {stats.totalHospitals}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">📍</div>
            <div>
              <p className="text-xs text-gray-600">対応市町村数</p>
              <p className="text-2xl font-bold text-primary">
                {stats.cities.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🩺</div>
            <div>
              <p className="text-xs text-gray-600">診療科目数</p>
              <p className="text-2xl font-bold text-primary">
                {stats.categories.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* クイックアクション */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-bold mb-3">クイックアクション</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/hospitals">
            <Button variant="primary" className="text-sm">
              病院管理ページへ
            </Button>
          </Link>
          <Link href="/">
            <Button variant="secondary" className="text-sm">
              公開サイトを表示
            </Button>
          </Link>
        </div>
      </div>

      {/* 市町村一覧 */}
      {stats.cities.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-bold mb-3">対応市町村</h2>
          <div className="flex flex-wrap gap-2">
            {stats.cities.map((city) => (
              <span
                key={city}
                className="px-3 py-1 bg-gray-100 rounded text-sm"
              >
                {city}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 診療科目一覧 */}
      {stats.categories.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-bold mb-3">登録診療科目</h2>
          <div className="flex flex-wrap gap-2">
            {stats.categories.map((category) => (
              <span
                key={category}
                className="px-3 py-1 bg-primary/10 text-primary rounded text-sm font-medium"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
