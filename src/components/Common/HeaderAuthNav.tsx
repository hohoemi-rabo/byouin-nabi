'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function HeaderAuthNav() {
  const { user, isLoading } = useAuth();

  // ローディング中は固定幅のプレースホルダーで場所を確保（ちらつき防止）
  if (isLoading) {
    return <div className="w-10 h-10" />;
  }

  if (user) {
    return (
      <Link
        href="/mypage"
        className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors text-lg"
        aria-label="マイページ"
      >
        👤
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="text-primary text-sm font-medium hover:underline min-h-tap flex items-center"
    >
      ログイン
    </Link>
  );
}
