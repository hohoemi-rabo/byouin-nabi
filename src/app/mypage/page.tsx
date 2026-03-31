'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/Auth/AuthGuard';
import Button from '@/components/Common/Button';
import type { Hospital } from '@/types/hospital';

const AGE_LABELS: Record<string, string> = {
  under39: '〜39歳',
  '40to64': '40〜64歳',
  '65to74': '65〜74歳',
  over75: '75歳以上',
};

const MOBILITY_LABELS: Record<string, string> = {
  none: 'なし',
  cane: '杖',
  wheelchair: '車椅子',
};

interface FavoriteItem {
  id: string;
  hospital_id: string;
  hospital: Hospital;
}

interface HistoryItem {
  id: string;
  search_type: string;
  result_hospital_id: string | null;
  hospital: Hospital | null;
  created_at: string;
}

function MypageContent() {
  const { user, profile, signOut } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [favRes, histRes] = await Promise.all([
        fetch('/api/user/favorites'),
        fetch('/api/user/history'),
      ]);

      if (favRes.ok) {
        const data = await favRes.json();
        setFavorites(data.favorites || []);
      }
      if (histRes.ok) {
        const data = await histRes.json();
        setHistory(data.history || []);
      }
    };

    fetchData();
  }, [user]);

  const handleRemoveFavorite = async (hospitalId: string) => {
    const res = await fetch('/api/user/favorites', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hospital_id: hospitalId }),
    });
    if (res.ok) {
      setFavorites(favorites.filter(f => f.hospital_id !== hospitalId));
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">マイページ</h1>

        {/* アカウント情報 */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold mb-3">👤 アカウント</h2>
          <p className="text-base text-gray-600">{user?.email}</p>
        </div>

        {/* プロフィール */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">📋 プロフィール</h2>
            <Link href="/mypage/profile">
              <Button variant="secondary" className="text-sm">
                {profile ? '✏️ 編集' : '➕ 設定する'}
              </Button>
            </Link>
          </div>
          {profile ? (
            <div className="space-y-2 text-base">
              <p><span className="text-gray-500">表示名:</span> {profile.display_name}</p>
              <p><span className="text-gray-500">年齢層:</span> {AGE_LABELS[profile.age_group] || profile.age_group}</p>
              <p><span className="text-gray-500">住所:</span> {profile.area}</p>
              <p><span className="text-gray-500">自家用車:</span> {profile.has_car ? 'あり' : 'なし'}</p>
              <p><span className="text-gray-500">移動補助:</span> {MOBILITY_LABELS[profile.mobility_aid] || 'なし'}</p>
            </div>
          ) : (
            <p className="text-gray-500">プロフィールを設定すると、より適切な病院をおすすめできます。</p>
          )}
        </div>

        {/* かかりつけ医 */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">⭐ かかりつけ医</h2>
          {favorites.length === 0 ? (
            <p className="text-gray-500">病院詳細ページから「かかりつけ医に登録」できます。（最大5件）</p>
          ) : (
            <div className="space-y-3">
              {favorites.map(fav => (
                <div key={fav.id} className="border rounded-lg p-3 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <Link href={`/hospital/${fav.hospital_id}`} className="font-bold text-primary hover:underline">
                      {fav.hospital?.name || '不明な病院'}
                    </Link>
                    {fav.hospital?.tel && (
                      <a href={`tel:${fav.hospital.tel}`} className="block text-sm text-gray-600 mt-1">
                        📞 {fav.hospital.tel}
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveFavorite(fav.hospital_id)}
                    className="text-sm text-error hover:underline whitespace-nowrap"
                  >
                    解除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 受診履歴 */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">🕒 受診履歴</h2>
          {history.length === 0 ? (
            <p className="text-gray-500">病院を閲覧すると履歴が記録されます。</p>
          ) : (
            <div className="space-y-2">
              {history.map(item => (
                <div key={item.id} className="border rounded-lg p-3 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {item.hospital ? (
                      <Link href={`/hospital/${item.result_hospital_id}`} className="font-medium text-primary hover:underline">
                        {item.hospital.name}
                      </Link>
                    ) : (
                      <span className="text-gray-600">検索（{item.search_type}）</span>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(item.created_at).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  {item.result_hospital_id && (
                    <Link href={`/hospital/${item.result_hospital_id}`}>
                      <Button variant="secondary" className="text-xs px-3 py-1">詳細</Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 設定・ログアウト */}
        <div className="space-y-3">
          <Link href="/mypage/settings">
            <Button variant="secondary" className="w-full">⚙️ 設定</Button>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full text-center text-error underline text-base py-3"
          >
            ログアウト
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MypagePage() {
  return (
    <AuthGuard>
      <MypageContent />
    </AuthGuard>
  );
}
