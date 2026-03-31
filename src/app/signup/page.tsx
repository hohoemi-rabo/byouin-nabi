'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import Button from '@/components/Common/Button';
import LoadingSpinner from '@/components/Common/LoadingSpinner';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    if (password.length < 6) {
      setError('パスワードは6文字以上にしてください');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowser();
      const { error } = await supabase.auth.signUp({ email, password });

      if (error) {
        if (error.message.includes('already registered')) {
          setError('このメールアドレスは既に登録されています。ログインしてください。');
        } else {
          setError('登録に失敗しました: ' + error.message);
        }
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
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">新規登録</h1>

        {error && (
          <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4 mb-6">
            <p className="text-red-600 text-base">{error}</p>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
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
              パスワード（6文字以上）
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-base focus:border-primary focus:outline-none"
            />
          </div>

          <Button type="submit" variant="primary" disabled={loading} className="w-full text-lg py-4">
            {loading ? <span className="flex items-center justify-center gap-2"><LoadingSpinner size="sm" />登録中...</span> : '登録する'}
          </Button>
        </form>

        <div className="mt-8 text-center border-t pt-6">
          <p className="text-base text-gray-600 mb-3">アカウントをお持ちの方</p>
          <Link href="/login">
            <Button variant="secondary" className="w-full text-lg py-4">
              ログイン
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
