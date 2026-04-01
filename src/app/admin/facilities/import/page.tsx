'use client';

import { useState, useTransition } from 'react';
import Button from '@/components/Common/Button';
import ConfirmModal from '@/components/Common/ConfirmModal';
import { importFacilities, exportFacilitiesCSV } from '@/app/admin/facility-actions';

export default function FacilityImportPage() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success: number; errors: { row: number; message: string }[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleImport = () => { if (selectedFile) setShowConfirm(true); };

  const handleConfirmImport = () => {
    setShowConfirm(false);
    if (!selectedFile) return;
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        setResult(await importFacilities(formData));
      } catch (err) { setError(err instanceof Error ? err.message : 'インポートに失敗しました'); }
    });
  };

  const handleExport = () => {
    startTransition(async () => {
      try {
        const csv = await exportFacilitiesCSV();
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `facilities_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (err) { setError(err instanceof Error ? err.message : 'エクスポートに失敗しました'); }
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">施設データ インポート/エクスポート</h1>
      <ConfirmModal isOpen={showConfirm} title="データの置換"
        message="既存の施設データを全て削除し、CSVの内容で置き換えます。\n\nこの操作は取り消せません。続行しますか？"
        confirmText="インポート実行" cancelText="キャンセル" type="danger"
        onConfirm={handleConfirmImport} onCancel={() => setShowConfirm(false)} />

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-bold mb-3">📤 エクスポート</h2>
        <p className="text-sm text-gray-600 mb-4">現在登録されている施設データをCSVでダウンロードします。</p>
        <Button variant="secondary" onClick={handleExport} disabled={isPending} className="text-sm">
          {isPending ? 'ダウンロード中...' : 'CSVダウンロード'}
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold mb-3">📥 インポート</h2>
        <p className="text-sm text-gray-600 mb-2">CSVファイルから施設データを一括登録します。</p>
        <p className="text-xs text-error mb-4">※ 既存データは全て削除され、CSVの内容で置き換わります。</p>
        <div className="mb-4">
          <input type="file" accept=".csv" onChange={(e) => { setSelectedFile(e.target.files?.[0] || null); setResult(null); setError(null); }}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
        </div>
        {selectedFile && <Button variant="primary" onClick={handleImport} disabled={isPending} className="text-sm">{isPending ? 'インポート中...' : 'インポート実行'}</Button>}
        {error && <div className="mt-4 bg-error/10 border border-error rounded-lg p-3"><p className="text-error text-sm font-bold">{error}</p></div>}
        {result && (
          <div className="mt-4 bg-green-50 border border-green-300 rounded-lg p-4">
            <p className="text-green-700 font-bold">✅ {result.success}件のインポートが完了しました</p>
            {result.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-error font-bold">エラー（{result.errors.length}件）:</p>
                <ul className="text-xs text-error mt-1 space-y-1">
                  {result.errors.map((e, i) => <li key={i}>行{e.row}: {e.message}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
