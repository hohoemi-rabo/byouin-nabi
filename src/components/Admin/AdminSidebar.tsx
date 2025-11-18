'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      href: '/admin/dashboard',
      label: 'ダッシュボード',
      icon: '📊',
    },
    {
      href: '/admin/hospitals',
      label: '病院管理',
      icon: '🏥',
    },
  ];

  return (
    <aside className="w-56 bg-gray-800 text-white min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">管理画面</h1>
        <p className="text-xs text-gray-400 mt-1">病院ナビ南信</p>
      </div>

      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg
                    transition-colors duration-200
                    ${
                      isActive
                        ? 'bg-primary text-white font-bold'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-gray-700">
        <p className="text-xs text-gray-400">
          © 2025 病院ナビ南信
        </p>
      </div>
    </aside>
  );
}
