'use client';

import { useState } from 'react';
import LoadingSpinner from '@/components/Common/LoadingSpinner';

const AI_ENABLED = process.env.NEXT_PUBLIC_AI_DIAGNOSIS === 'true';

interface AIDiagnosisButtonProps {
  questionnaireData: {
    location: string | null;
    duration: string | null;
    symptoms: string[];
    conditions: string[];
    medicine: string | null;
    memo: string | null;
  };
}

export default function AIDiagnosisButton({ questionnaireData }: AIDiagnosisButtonProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 機能が無効の場合は何も表示しない
  if (!AI_ENABLED) {
    return null;
  }

  const handleAnalyze = async () => {
    if (!agreed) {
      setError('免責事項に同意してください');
      return;
    }

    // 必須データのチェック
    if (!questionnaireData.location || !questionnaireData.duration) {
      setError('症状データが不完全です。アンケートをやり直してください。');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/symptoms/ai-diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionnaireData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'AI診断の取得に失敗しました');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err) {
      console.error('AI diagnosis error:', err);
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 border-t pt-8">
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
        <h3 className="text-2xl font-bold text-yellow-800 mb-4 flex items-center gap-2">
          🧪 AI診断（実験的機能）
        </h3>

        {/* 免責事項 */}
        <div className="bg-white border-2 border-red-500 rounded-lg p-4 mb-4">
          <p className="text-red-600 font-bold text-lg mb-3">
            ⚠️ 重要な注意事項
          </p>
          <ul className="text-base space-y-2 text-red-600">
            <li>• <strong>これはAIによる分析であり、医学的診断ではありません</strong></li>
            <li>• この機能は実験的で、テスト段階です</li>
            <li>• <strong>必ず医師の診察を受けてください</strong></li>
            <li>• 緊急時は119番通報してください</li>
            <li>• この情報は参考程度にご利用ください</li>
          </ul>
        </div>

        {/* 同意チェックボックス */}
        <label className="flex items-start gap-3 mb-4 cursor-pointer p-3 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-5 h-5 min-w-[20px]"
          />
          <span className="text-base">
            上記の注意事項を理解し、参考情報として利用することに同意します
          </span>
        </label>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-4">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* AI診断ボタン */}
        <div className="flex justify-center">
          <button
            onClick={handleAnalyze}
            disabled={!agreed || isLoading}
            className="bg-yellow-600 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-tap w-full md:w-auto"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                AI分析中...
              </span>
            ) : (
              '🤖 AI診断を試す'
            )}
          </button>
        </div>
      </div>

      {/* AI分析結果 */}
      {analysis && (
        <div className="mt-6 bg-white border-2 border-gray-200 rounded-lg p-6 shadow-sm">
          <h4 className="font-bold text-xl mb-4 text-foreground flex items-center gap-2">
            🤖 AI分析結果
          </h4>
          <div className="whitespace-pre-wrap text-base leading-relaxed text-gray-800 mb-6">
            {analysis}
          </div>

          {/* 再度の免責事項 */}
          <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4">
            <p className="text-red-600 font-bold text-base">
              ⚠️ この分析は参考情報です。必ず医師の診察を受けてください。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
