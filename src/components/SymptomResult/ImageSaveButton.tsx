'use client';

import { useState } from 'react';
import Button from '@/components/Common/Button';
import { useRouter } from 'next/navigation';

interface ImageSaveButtonProps {
  targetId: string;
}

export default function ImageSaveButton({ targetId }: ImageSaveButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const element = document.getElementById(targetId);
      if (!element) {
        throw new Error('保存対象が見つかりません');
      }

      // html2canvasを動的インポート（~300KB、使用時のみロード）
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(element);

      // CanvasをBlobに変換
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('画像の生成に失敗しました');
        }

        // ダウンロード
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_');
        link.href = url;
        link.download = `症状説明_${timestamp}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // メモリ解放
        URL.revokeObjectURL(url);
        setIsSaved(true);
      }, 'image/png');
    } catch (err) {
      console.error('Image save error:', err);
      setError(err instanceof Error ? err.message : '画像の保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <div className="space-y-4">
      {/* 保存ボタン */}
      {!isSaved && (
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-purple text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-purple/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-tap w-full md:w-auto shadow-md"
        >
          {isLoading ? '保存中...' : '📸 症状説明を画像で保存'}
        </button>
      )}

      {/* エラーメッセージ */}
      {error && (
        <div className="p-4 bg-error/10 border-2 border-error rounded-lg">
          <p className="text-error font-bold">❌ {error}</p>
          <p className="text-sm text-gray-600 mt-2">
            もう一度お試しください。問題が続く場合は、ブラウザを変えて試してみてください。
          </p>
        </div>
      )}

      {/* 保存完了メッセージ */}
      {isSaved && (
        <div className="p-6 bg-success/10 border-2 border-success rounded-lg">
          <p className="text-2xl font-bold text-success mb-4">
            ✓ 保存が完了しました
          </p>
          <p className="text-lg text-gray-700 mb-6">
            症状説明の画像が端末に保存されました。<br />
            病院の受付や医師に見せる際にご利用ください。
          </p>
          <div className="flex flex-col md:flex-row gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsSaved(false)}
              className="text-base"
            >
              もう一度保存する
            </Button>
            <Button
              variant="primary"
              onClick={handleBackToHome}
              className="text-base"
            >
              トップページに戻る
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
