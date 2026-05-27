'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Common/Button';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import ConfirmModal from '@/components/Common/ConfirmModal';
import { importEmergencyRotations } from '@/app/admin/actions';
import type { ImportRotationResult } from '@/types/emergency-rotation';

function defaultMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function EmergencyRotationImportClient() {
  const router = useRouter();
  const [sourceMonth, setSourceMonth] = useState(defaultMonth());
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState<ImportRotationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setShowConfirm(true);
  };

  const confirmImport = async () => {
    setShowConfirm(false);
    setIsImporting(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file!);
      const res = await importEmergencyRotations(formData, sourceMonth);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'インポートに失敗しました');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <ConfirmModal
        isOpen={showConfirm}
        title="インポート実行の確認"
        message={`${sourceMonth} に既存のローテーションデータがある場合、すべて削除してから新しいデータを登録します。\n\nこの操作は取り消せません。実行しますか？`}
        confirmText="インポート実行"
        cancelText="キャンセル"
        type="danger"
        onConfirm={confirmImport}
        onCancel={() => setShowConfirm(false)}
      />

      {isImporting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <LoadingSpinner size="lg" className="mb-4" />
            <h2 className="text-xl font-bold mb-2">インポート中...</h2>
            <p className="text-sm text-gray-600">データを処理しています</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4 max-w-2xl space-y-4">
        {/* テンプレートダウンロード */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <h2 className="text-sm font-semibold text-blue-900 mb-2">
            📥 CSV テンプレート
          </h2>
          <p className="text-xs text-gray-700 mb-2">
            以下のテンプレートをダウンロードして編集してください。
            <br />
            空のテンプレートには種別 4 種（当番医・歯科・薬局・夜間急患）の記入例が 1 行ずつ入っています。
            実データを入力後、<strong>例の行（【例】で始まる行）は削除</strong>してからアップロードしてください。
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href="/templates/emergency-rotations-template.csv"
              download
              className="inline-block bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700"
            >
              📄 空のテンプレート（記入例 4 行付き）
            </a>
            <a
              href="/templates/emergency-rotations-sample.csv"
              download
              className="inline-block bg-blue-100 text-blue-700 px-3 py-1.5 rounded text-xs hover:bg-blue-200 border border-blue-300"
            >
              📄 記入例つき（2026年6月分）
            </a>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="source_month" className="block text-sm font-medium mb-1">
              対象月 <span className="text-error">*</span>
            </label>
            <input
              type="month"
              id="source_month"
              value={sourceMonth}
              onChange={(e) => setSourceMonth(e.target.value)}
              required
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            <p className="text-xs text-gray-600 mt-1">
              CSV の `duty_date` がこの月と一致しないとエラーになります
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              ファイル（CSV / XLSX） <span className="text-error">*</span>
            </label>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => {
                setFile(e.target.files?.[0] || null);
                setResult(null);
                setError(null);
              }}
              className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
              disabled={isImporting}
            />
            {file && (
              <p className="mt-2 text-xs text-gray-600">
                選択: <strong>{file.name}</strong>
              </p>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-300 rounded p-3 text-xs text-yellow-900">
            ⚠️ {sourceMonth} の既存ローテーションは上書きされます
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              variant="primary"
              disabled={!file || isImporting}
              className="text-sm"
            >
              {isImporting ? 'インポート中...' : 'インポート実行'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/admin/emergency-rotations')}
              disabled={isImporting}
              className="text-sm"
            >
              戻る
            </Button>
          </div>
        </form>

        {error && (
          <div className="p-3 bg-red-50 border-2 border-red-200 rounded">
            <p className="text-sm text-red-700 font-bold">❌ {error}</p>
          </div>
        )}

        {result && (
          <div className="p-4 border rounded bg-gray-50">
            <h2 className="font-bold text-base mb-3">📊 インポート結果</h2>
            <p className="text-sm font-semibold text-green-600 mb-2">
              ✓ 成功: {result.success} 件
            </p>
            {result.errors.length > 0 && (
              <>
                <p className="text-sm font-bold text-red-600 mb-2">
                  ✗ エラー: {result.errors.length} 件
                </p>
                <div className="bg-white border border-red-200 rounded p-2 max-h-48 overflow-y-auto">
                  <ul className="space-y-1 text-xs">
                    {result.errors.map((err, idx) => (
                      <li key={idx} className="text-red-600">
                        <strong>{err.row}行目:</strong> {err.message}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
            {result.success > 0 && (
              <Button
                type="button"
                variant="primary"
                onClick={() => router.push(`/admin/emergency-rotations?month=${sourceMonth}`)}
                className="text-sm mt-3"
              >
                一覧で確認する
              </Button>
            )}
          </div>
        )}

        <div className="p-3 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700">
          <h3 className="font-semibold mb-1">📖 CSV フォーマット</h3>
          <code className="block bg-white p-2 rounded text-xs mb-2 overflow-x-auto">
            duty_date,rotation_type,area,department,facility_name,phone,start_time,end_time,note
          </code>
          <ul className="list-disc list-inside space-y-0.5">
            <li>
              <code>rotation_type</code>: <code>night_emergency</code> / <code>duty_doctor</code> /
              <code> duty_dentist</code> / <code>duty_pharmacy</code>
            </li>
            <li><code>department</code>: 薬局・夜間急患では空欄</li>
            <li><code>start_time</code>, <code>end_time</code>: HH:MM 形式</li>
            <li>施設名が病院マスタと完全一致すれば自動で紐付けられます</li>
          </ul>
        </div>
      </div>
    </>
  );
}
