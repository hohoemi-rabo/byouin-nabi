'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/Common/Button';
import type { Hospital } from '@/types/hospital';

interface Stats {
  totalHospitals: number;
  cities: string[];
  categories: string[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/hospitals');
        if (!response.ok) {
          throw new Error('データの取得に失敗しました');
        }

        const data = await response.json();
        const hospitals: Hospital[] = data.hospitals || [];

        // 統計情報を計算
        const cities = Array.from(
          new Set(hospitals.map(h => h.city))
        ).sort();

        const categories = Array.from(
          new Set(hospitals.flatMap(h => h.category))
        ).sort();

        setStats({
          totalHospitals: hospitals.length,
          cities,
          categories,
        });
      } catch (err) {
        console.error('Stats fetch error:', err);
        setError(
          err instanceof Error ? err.message : 'データの取得に失敗しました'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-xl text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error/10 border-2 border-error rounded-lg p-6">
        <p className="text-error font-bold text-xl">❌ {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">
          ダッシュボード
        </h1>
        <p className="text-lg text-gray-600">
          病院ナビ南信 管理システムの概要
        </p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="text-5xl">🏥</div>
            <div>
              <p className="text-sm text-gray-600 mb-1">登録病院数</p>
              <p className="text-4xl font-bold text-primary">
                {stats?.totalHospitals || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="text-5xl">📍</div>
            <div>
              <p className="text-sm text-gray-600 mb-1">対応市町村数</p>
              <p className="text-4xl font-bold text-primary">
                {stats?.cities.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="text-5xl">🩺</div>
            <div>
              <p className="text-sm text-gray-600 mb-1">診療科目数</p>
              <p className="text-4xl font-bold text-primary">
                {stats?.categories.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* クイックアクション */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">クイックアクション</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/admin/hospitals">
            <Button variant="primary" className="text-lg">
              病院管理ページへ
            </Button>
          </Link>
          <Link href="/">
            <Button variant="secondary" className="text-lg">
              公開サイトを表示
            </Button>
          </Link>
        </div>
      </div>

      {/* 市町村一覧 */}
      {stats && stats.cities.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">対応市町村</h2>
          <div className="flex flex-wrap gap-2">
            {stats.cities.map((city) => (
              <span
                key={city}
                className="px-4 py-2 bg-gray-100 rounded-lg text-lg"
              >
                {city}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 診療科目一覧 */}
      {stats && stats.categories.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">登録診療科目</h2>
          <div className="flex flex-wrap gap-2">
            {stats.categories.map((category) => (
              <span
                key={category}
                className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-lg font-medium"
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
