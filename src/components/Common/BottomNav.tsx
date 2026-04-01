'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
  { href: '/', icon: '🏠', label: 'ホーム', matchExact: true },
  { href: '/questionnaire', icon: '🩺', label: '症状', matchPrefix: ['/questionnaire', '/results'] },
  { href: '/outing', icon: '🚶', label: 'お出かけ', matchPrefix: ['/outing'] },
  { href: '/mypage', icon: '👤', label: 'マイページ', matchPrefix: ['/mypage'], requireAuth: true },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // 管理画面では非表示
  if (pathname.startsWith('/admin')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40" aria-label="メインナビゲーション">
      <div className="flex">
        {NAV_ITEMS.map(item => {
          const isActive = item.matchExact
            ? pathname === item.href
            : item.matchPrefix?.some(p => pathname.startsWith(p));

          const href = item.requireAuth && !user ? '/login' : item.href;

          return (
            <Link
              key={item.href}
              href={href}
              className={`flex-1 flex flex-col items-center py-2 transition-colors ${
                isActive ? 'text-primary' : 'text-gray-400'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs mt-0.5 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
