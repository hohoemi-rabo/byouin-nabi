'use client'

import { useState } from 'react';
import Button from '@/components/Common/Button';

interface SymptomDescriptionProps {
  description: string;
}

export default function SymptomDescription({ description }: SymptomDescriptionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(description);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error('コピーに失敗しました:', error);
      alert('コピーに失敗しました。手動でコピーしてください。');
    }
  };

  return (
    <div className="space-y-6">
      {/* 症状説明文 */}
      <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-primary">
          症状のまとめ
        </h2>
        <pre className="whitespace-pre-wrap font-sans text-lg leading-relaxed text-foreground">
          {description}
        </pre>
      </div>

      {/* コピーボタン */}
      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <Button
          variant={copied ? 'secondary' : 'primary'}
          onClick={handleCopy}
          className="text-lg px-8 py-4"
        >
          {copied ? 'コピーしました✓' : '文章をコピーする'}
        </Button>
      </div>

      {/* 使い方の説明 */}
      <div className="bg-info/10 border-2 border-info rounded-lg p-6">
        <h3 className="text-xl font-bold mb-3 text-info">
          この文章の使い方
        </h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex gap-2">
            <span className="flex-shrink-0">1.</span>
            <span>「文章をコピーする」ボタンでコピーできます</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0">2.</span>
            <span>病院の受付や医師に見せてください</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0">3.</span>
            <span>画像として保存したい場合は、スクリーンショットを撮ってください</span>
          </li>
        </ul>
      </div>

      {/* 免責事項（強調） */}
      <div className="bg-warning/10 border-2 border-warning rounded-lg p-6">
        <h3 className="text-xl font-bold mb-3 text-warning">
          ⚠️ 重要なお知らせ
        </h3>
        <p className="text-gray-700 text-lg leading-relaxed">
          この内容は参考情報であり、医学的な診断ではありません。
          症状がある場合は、必ず医療機関を受診し、医師の診察を受けてください。
          緊急の場合は、119番に電話してください。
        </p>
      </div>
    </div>
  );
}
