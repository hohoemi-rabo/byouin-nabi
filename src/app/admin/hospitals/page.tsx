'use client';

import { useEffect, useState } from 'react';
import type { Hospital } from '@/types/hospital';

export default function AdminHospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await fetch('/api/hospitals');
        if (!response.ok) {
          throw new Error('病院データの取得に失敗しました');
        }

        const data = await response.json();
        setHospitals(data.hospitals || []);
      } catch (err) {
        console.error('Hospitals fetch error:', err);
        setError(
          err instanceof Error ? err.message : '病院データの取得に失敗しました'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            病院管理
          </h1>
          <p className="text-lg text-gray-600">
            登録されている病院の一覧（{hospitals.length}件）
          </p>
        </div>

        <div className="bg-gray-100 border-2 border-gray-300 rounded-lg px-6 py-3">
          <p className="text-lg text-gray-600">
            病院の登録・編集・削除機能は<br />
            チケット009で実装予定です
          </p>
        </div>
      </div>

      {hospitals.length === 0 ? (
        <div className="bg-gray-100 rounded-lg p-12 text-center">
          <p className="text-2xl text-gray-600">
            病院が登録されていません
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {hospitals.map((hospital) => (
            <div
              key={hospital.id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    {hospital.name}
                  </h2>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-medium text-gray-700">
                        📍
                      </span>
                      <p className="text-lg text-gray-600">
                        {hospital.address} ({hospital.city})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-lg font-medium text-gray-700">
                        📞
                      </span>
                      <p className="text-lg text-gray-600">{hospital.tel}</p>
                    </div>

                    {hospital.opening_hours && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-medium text-gray-700">
                          🕒
                        </span>
                        <p className="text-lg text-gray-600">
                          {hospital.opening_hours}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mt-3">
                      {hospital.category.map((cat) => (
                        <span
                          key={cat}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-base font-medium"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>

                    {hospital.note && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-base text-gray-700">
                          💡 {hospital.note}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
