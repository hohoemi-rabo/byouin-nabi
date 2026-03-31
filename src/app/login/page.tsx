'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import Button from '@/components/Common/Button';
import LoadingSpinner from '@/components/Common/LoadingSpinner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'magic' | 'password'>('magic');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (error) {
      setError('ログインリンクの送信に失敗しました。メールアドレスを確認してください。');
    } else {
      setMessage('ログインリンクをメールで送信しました。メールを確認してリンクをタップしてください。');
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    setError(null);

    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError('メールアドレスまたはパスワードが正しくありません。');
    } else {
      router.push('/mypage');
      router.refresh();
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">ログイン</h1>
        <p className="text-base text-gray-600 text-center mb-8">
          病院ナビ南信のアカウントにログイン
        </p>

        {/* 成功メッセージ */}
        {message && (
          <div className="bg-green-50 border-2 border-green-400 rounded-xl p-4 mb-6">
            <p className="text-green-700 text-base font-medium">✅ {message}</p>
          </div>
        )}

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4 mb-6">
            <p className="text-red-600 text-base font-medium">{error}</p>
          </div>
        )}

        {/* マジックリンクログイン（メイン） */}
        {mode === 'magic' && (
          <form onSubmit={handleMagicLink} className="space-y-4">
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

            <Button type="submit" variant="primary" disabled={loading} className="w-full text-lg py-4">
              {loading ? <span className="flex items-center justify-center gap-2"><LoadingSpinner size="sm" />送信中...</span> : '📩 ログインリンクを送信'}
            </Button>

            <p className="text-sm text-gray-600 text-center">
              メールに届くリンクをタップするだけでログインできます。
              <br />パスワードは不要です。
            </p>
          </form>
        )}

        {/* パスワードログイン（サブ） */}
        {mode === 'password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label htmlFor="email-pw" className="block text-base font-medium mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                id="email-pw"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
        )}

        {/* モード切替 */}
        <div className="mt-6 text-center">
          <button
            onClick={() => { setMode(mode === 'magic' ? 'password' : 'magic'); setError(null); setMessage(null); }}
            className="text-primary underline text-sm"
          >
            {mode === 'magic' ? 'パスワードでログイン' : 'メールリンクでログイン'}
          </button>
        </div>

        {/* サインアップリンク */}
        <div className="mt-8 text-center border-t pt-6">
          <p className="text-base text-gray-600 mb-3">アカウントをお持ちでない方</p>
          <Link href="/signup">
            <Button variant="secondary" className="w-full text-lg py-4">
              新規登録
            </Button>
          </Link>
        </div>

        {/* ゲスト利用 */}
        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-gray-500 underline">
            ログインせずに使う
          </Link>
        </div>
      </div>
    </div>
  );
}
