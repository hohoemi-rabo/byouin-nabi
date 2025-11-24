'use client';

import { useEffect } from 'react';
import Button from '@/components/Common/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // エラーをログに記録
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-3xl md:text-4xl font-bold text-error mb-4">
            エラーが発生しました
          </h1>
        </div>

        <p className="text-xl md:text-2xl text-gray-700 mb-8">
          申し訳ございません。問題が発生しました。
          <br />
          もう一度お試しいただくか、トップページに戻ってください。
        </p>

        {/* エラー詳細（開発環境のみ） */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
            <p className="font-bold text-red-800 mb-2">エラー詳細（開発環境）:</p>
            <p className="text-base text-red-700 font-mono break-words">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            onClick={reset}
            className="text-xl px-8 py-4"
            aria-label="もう一度試す"
          >
            🔄 もう一度試す
          </Button>
          <Button
            variant="secondary"
            onClick={() => window.location.href = '/'}
            className="text-xl px-8 py-4"
            aria-label="トップページに戻る"
          >
            🏠 トップページに戻る
          </Button>
        </div>
      </div>
    </div>
  );
}
