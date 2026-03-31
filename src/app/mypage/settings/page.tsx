'use client';

import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/Auth/AuthGuard';
import Button from '@/components/Common/Button';
import Link from 'next/link';

function SettingsContent() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <Link href="/mypage" className="text-primary hover:underline text-base">
            ← マイページに戻る
          </Link>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-6">設定</h1>

        {/* アカウント */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold mb-3">アカウント情報</h2>
          <p className="text-base text-gray-600">{user?.email}</p>
        </div>

        {/* プロフィール編集 */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold mb-3">プロフィール</h2>
          <Link href="/mypage/profile">
            <Button variant="secondary" className="w-full">✏️ プロフィールを編集</Button>
          </Link>
        </div>

        {/* ログアウト */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <h2 className="text-lg font-bold mb-3">ログアウト</h2>
          <button
            onClick={handleSignOut}
            className="w-full bg-red-50 text-error border-2 border-error rounded-lg px-6 py-3 font-medium hover:bg-red-100 transition-colors min-h-tap"
          >
            ログアウトする
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}
