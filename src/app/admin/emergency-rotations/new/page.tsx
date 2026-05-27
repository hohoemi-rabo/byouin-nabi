import EmergencyRotationForm from '@/components/Admin/EmergencyRotationForm';
import { createEmergencyRotation } from '@/app/admin/actions';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function NewEmergencyRotationPage() {
  const { data: hospitals } = await supabaseAdmin
    .from('hospitals')
    .select('id, name')
    .order('name');

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">救急ローテーション 新規登録</h1>
        <p className="text-sm text-gray-600">1 件分の当番情報を登録します</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <EmergencyRotationForm
          hospitals={hospitals ?? []}
          action={createEmergencyRotation}
          mode="create"
        />
      </div>
    </div>
  );
}
