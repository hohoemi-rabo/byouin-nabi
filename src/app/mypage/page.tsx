'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/Auth/AuthGuard';
import Button from '@/components/Common/Button';

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

function MypageContent() {
  const { user, profile, signOut } = useAuth();

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
              <p><span className="text-gray-500">居住地区:</span> {profile.area}</p>
              <p><span className="text-gray-500">自家用車:</span> {profile.has_car ? 'あり' : 'なし'}</p>
              <p><span className="text-gray-500">移動補助:</span> {MOBILITY_LABELS[profile.mobility_aid] || 'なし'}</p>
            </div>
          ) : (
            <p className="text-gray-500">プロフィールを設定すると、より適切な病院や交通手段をおすすめできます。</p>
          )}
        </div>

        {/* かかりつけ医（021で実装） */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold mb-3">⭐ かかりつけ医</h2>
          <p className="text-gray-500">準備中</p>
        </div>

        {/* 受診履歴（021で実装） */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold mb-3">📋 受診履歴</h2>
          <p className="text-gray-500">準備中</p>
        </div>

        {/* ログアウト */}
        <button
          onClick={handleSignOut}
          className="w-full text-center text-error underline text-base py-3"
        >
          ログアウト
        </button>
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
