import NightEmergencyGenerateForm from '@/components/Admin/NightEmergencyGenerateForm';

export default function GenerateNightEmergencyPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">夜間急患診療所 月次データ自動生成</h1>
        <p className="text-sm text-gray-600">
          指定月の 1 日〜月末まで、夜間枠（全日）と昼間枠（日曜・祝日のみ）を一括生成します
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <NightEmergencyGenerateForm />
      </div>
    </div>
  );
}
