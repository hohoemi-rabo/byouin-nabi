import { notFound } from 'next/navigation';
import HospitalForm from '@/components/Admin/HospitalForm';
import { updateHospital } from '@/app/admin/actions';
import { supabase } from '@/lib/supabase';
import type { Hospital } from '@/types/hospital';

export default async function EditHospitalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 病院情報を取得
  const { data: hospital, error } = await supabase
    .from('hospitals')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !hospital) {
    notFound();
  }

  // Server ActionにIDをバインド
  const updateWithId = updateHospital.bind(null, id);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">
          病院情報を編集
        </h1>
        <p className="text-sm text-gray-600">
          {hospital.name} の情報を編集します
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <HospitalForm
          hospital={hospital as Hospital}
          action={updateWithId}
          mode="edit"
        />
      </div>
    </div>
  );
}
