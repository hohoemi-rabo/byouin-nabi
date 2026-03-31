'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import Button from '@/components/Common/Button';
import LoadingSpinner from '@/components/Common/LoadingSpinner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowser();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError('メールアドレスまたはパスワードが正しくありません');
        setLoading(false);
      } else {
        window.location.href = '/mypage';
      }
    } catch {
      setError('エラーが発生しました');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">ログイン</h1>

        {error && (
          <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4 mb-6">
            <p className="text-red-600 text-base">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-base font-medium mb-2">
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-base focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-base font-medium mb-2">
              パスワード
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-base focus:border-primary focus:outline-none"
            />
          </div>

          <Button type="submit" variant="primary" disabled={loading} className="w-full text-lg py-4">
            {loading ? <span className="flex items-center justify-center gap-2"><LoadingSpinner size="sm" />ログイン中...</span> : 'ログイン'}
          </Button>
        </form>

        <div className="mt-8 text-center border-t pt-6">
          <p className="text-base text-gray-600 mb-3">アカウントをお持ちでない方</p>
          <Link href="/signup">
            <Button variant="secondary" className="w-full text-lg py-4">
              新規登録
            </Button>
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-gray-500 underline">
            ログインせずに使う
          </Link>
        </div>
      </div>
    </div>
  );
}
