import { notFound } from 'next/navigation';
import EmergencyRotationForm from '@/components/Admin/EmergencyRotationForm';
import { updateEmergencyRotation } from '@/app/admin/actions';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { EmergencyRotation } from '@/types/emergency-rotation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditEmergencyRotationPage({ params }: Props) {
  const { id } = await params;

  const [rotationRes, hospitalsRes] = await Promise.all([
    supabaseAdmin.from('emergency_rotations').select('*').eq('id', id).single(),
    supabaseAdmin.from('hospitals').select('id, name').order('name'),
  ]);

  if (rotationRes.error || !rotationRes.data) {
    notFound();
  }

  const rotation = rotationRes.data as EmergencyRotation;
  const updateWithId = updateEmergencyRotation.bind(null, id);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">救急ローテーション編集</h1>
        <p className="text-sm text-gray-600">
          {rotation.duty_date} / {rotation.facility_name} の情報を編集します
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <EmergencyRotationForm
          rotation={rotation}
          hospitals={hospitalsRes.data ?? []}
          action={updateWithId}
          mode="edit"
        />
      </div>
    </div>
  );
}
