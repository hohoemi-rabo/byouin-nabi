import EmergencyRotationImportClient from '@/components/Admin/EmergencyRotationImportClient';

export default function EmergencyRotationImportPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">救急ローテーション 一括インポート</h1>
        <p className="text-sm text-gray-600">CSV / Excel から月単位で当番医データを取り込みます</p>
      </div>

      <EmergencyRotationImportClient />
    </div>
  );
}
