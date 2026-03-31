'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface HeaderAuthNavProps {
  initialLoggedIn: boolean;
}

export default function HeaderAuthNav({ initialLoggedIn }: HeaderAuthNavProps) {
  const { user, isLoading } = useAuth();

  // ローディング中はサーバーサイドの初期値で表示（ちらつき防止）
  const loggedIn = isLoading ? initialLoggedIn : !!user;

  if (loggedIn) {
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
