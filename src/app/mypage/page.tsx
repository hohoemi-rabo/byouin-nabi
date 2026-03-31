'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/Auth/AuthGuard';
import Button from '@/components/Common/Button';
import MobileFixedFooter from '@/components/Common/MobileFixedFooter';

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
  const { profile, signOut } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">マイページ</h1>

        {/* プロフィール */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">👤 プロフィール</h2>
            <Link href="/mypage/profile">
              <Button variant="secondary" className="text-sm">✏️ 編集</Button>
            </Link>
          </div>

          {profile ? (
            <div className="space-y-2 text-base">
              <p><span className="font-medium text-gray-600">表示名:</span> {profile.display_name}</p>
              <p><span className="font-medium text-gray-600">年齢層:</span> {AGE_LABELS[profile.age_group] || profile.age_group}</p>
              <p><span className="font-medium text-gray-600">居住地区:</span> {profile.area}</p>
              <p><span className="font-medium text-gray-600">自家用車:</span> {profile.has_car ? 'あり' : 'なし'}</p>
              <p><span className="font-medium text-gray-600">移動補助:</span> {MOBILITY_LABELS[profile.mobility_aid] || 'なし'}</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-3">プロフィールが未設定です</p>
              <Link href="/mypage/profile">
                <Button variant="primary" className="text-lg py-3">プロフィールを設定する</Button>
              </Link>
            </div>
          )}
        </div>

        {/* かかりつけ医（021で実装予定） */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold mb-3">⭐ かかりつけ医</h2>
          <p className="text-gray-500">この機能は準備中です</p>
        </div>

        {/* 受診履歴（021で実装予定） */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold mb-3">📋 受診履歴</h2>
          <p className="text-gray-500">この機能は準備中です</p>
        </div>

        {/* ログアウト */}
        <div className="mt-8">
          <button
            onClick={signOut}
            className="w-full text-center text-error underline text-base py-3"
          >
            ログアウト
          </button>
        </div>

        <div className="h-20 md:hidden" />
      </div>

      <MobileFixedFooter backUrl="/" backText="ホーム" />
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
