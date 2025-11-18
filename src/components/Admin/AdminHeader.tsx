'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Button from '@/components/Common/Button';

export default function AdminHeader() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (!confirm('ログアウトしますか？')) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/admin/login');
      } else {
        alert('ログアウトに失敗しました');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('ログアウトに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            管理システム
          </h2>
          <p className="text-xs text-gray-600">
            病院情報の管理・編集
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            onClick={handleLogout}
            disabled={loading}
            className="text-sm px-3 py-2"
          >
            {loading ? 'ログアウト中...' : 'ログアウト'}
          </Button>
        </div>
      </div>
    </header>
  );
}
