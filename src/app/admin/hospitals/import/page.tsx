'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { importHospitals, exportHospitalsCSV, type ImportResult } from '@/app/admin/actions';
import Button from '@/components/Common/Button';
import LoadingSpinner from '@/components/Common/LoadingSpinner';

export default function ImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importComplete, setImportComplete] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadCSV = async () => {
    try {
      const csvContent = await exportHospitalsCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hospitals_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'CSVのダウンロードに失敗しました');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    // 確認ダイアログ
    const confirmed = window.confirm(
      '⚠️ 重要な確認\n\n既存の病院データをすべて削除してから、新しいデータをインポートします。\nこの操作は取り消せません。\n\nよろしいですか？'
    );

    if (!confirmed) {
      return;
    }

    setIsImporting(true);
    setError(null);
    setResult(null);
    setImportComplete(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const importResult = await importHospitals(formData);
      setResult(importResult);
      setImportComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'インポートに失敗しました');
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setImportComplete(false);
  };

  return (
    <>
      {/* インポート中のローディングモーダル */}
      {isImporting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <LoadingSpinner size="lg" className="mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">
              インポート中...
            </h2>
            <p className="text-sm text-gray-600">
              データを処理しています。しばらくお待ちください。
            </p>
          </div>
        </div>
      )}

      {/* インポート完了モーダル */}
      {importComplete && result && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                インポート完了！
              </h2>
              <p className="text-sm text-gray-600">
                病院データのインポートが完了しました
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">成功:</span>
                  <span className="font-bold text-green-600 text-lg">
                    {result.success}件
                  </span>
                </div>
                {result.errors.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">エラー:</span>
                    <span className="font-bold text-red-600 text-lg">
                      {result.errors.length}件
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setImportComplete(false)}
              className="w-full bg-primary text-white px-6 py-3 rounded-lg text-base font-medium hover:bg-primary-dark transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            病院データ一括インポート
          </h1>
          <p className="text-sm text-gray-600">
            CSVまたはExcelファイルから病院データを一括で登録します
          </p>
        </div>

      <div className="bg-white rounded-lg shadow p-4">
        {/* CSVダウンロード */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-base font-semibold mb-2 text-blue-900">
            📥 登録データのダウンロード
          </h2>
          <p className="text-sm text-gray-700 mb-3">
            現在登録されている病院データをCSVファイルでダウンロードできます。<br />
            ダウンロードしたファイルを編集して、再度インポートすることも可能です。
          </p>
          <button
            onClick={handleDownloadCSV}
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
          >
            📄 登録データをCSVでダウンロード
          </button>
        </div>

        {/* ファイルアップロードフォーム */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              ファイルを選択（CSV, XLSX形式）
            </label>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => {
                setFile(e.target.files?.[0] || null);
                setResult(null);
                setError(null);
              }}
              className="border rounded px-3 py-2 w-full text-sm"
              disabled={isImporting}
            />
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                選択されたファイル: <strong>{file.name}</strong>
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              variant="primary"
              disabled={!file || isImporting}
              className="text-sm px-6 py-2"
            >
              {isImporting ? 'インポート中...' : 'インポート実行'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleReset}
              disabled={isImporting}
              className="text-sm px-6 py-2"
            >
              リセット
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/admin/hospitals')}
              disabled={isImporting}
              className="text-sm px-6 py-2"
            >
              病院一覧に戻る
            </Button>
          </div>
        </form>

        {/* エラー表示 */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <h2 className="font-bold text-base mb-2 text-red-900">
              ❌ エラーが発生しました
            </h2>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* インポート結果 */}
        {result && (
          <div className="mt-6 p-4 border rounded-lg bg-gray-50">
            <h2 className="font-bold text-lg mb-3 text-foreground">
              📊 インポート結果
            </h2>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-semibold text-green-600">
                  ✓ 成功: {result.success}件
                </span>
              </p>
              {result.errors.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-bold text-red-600 mb-2">
                    ✗ エラー: {result.errors.length}件
                  </p>
                  <div className="bg-white border border-red-200 rounded p-3 max-h-60 overflow-y-auto">
                    <ul className="space-y-1 text-sm">
                      {result.errors.map((err, idx) => (
                        <li key={idx} className="text-red-600">
                          <strong>{err.row}行目:</strong> {err.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {result.success > 0 && result.errors.length === 0 && (
                <p className="text-sm text-gray-700 mt-3">
                  すべてのデータが正常にインポートされました。
                </p>
              )}
            </div>
          </div>
        )}

        {/* 使い方の説明 */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-sm font-semibold mb-2 text-gray-900">
            📖 使い方
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
            <li>「登録データをCSVでダウンロード」をクリックして、現在のデータをダウンロード</li>
            <li>
              ダウンロードしたCSVファイルをExcel等で開いて編集（追加・修正・削除）<br />
              <span className="text-xs text-gray-600">※必須項目: 病院名、診療科、住所、電話番号、市町村</span>
            </li>
            <li>編集したファイル（CSVまたはExcel形式）を選択</li>
            <li>「インポート実行」ボタンをクリック</li>
            <li>確認ダイアログで「OK」を選択（既存データは全削除されます）</li>
            <li>結果を確認（エラーがある場合は修正して再度実行）</li>
          </ol>
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-xs font-semibold text-yellow-900">⚠️ 重要な注意</p>
            <p className="text-xs text-yellow-800 mt-1">
              インポート実行時、既存の病院データはすべて削除されます。<br />
              必要に応じて事前にバックアップを取ってください。
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
