import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase-admin';
import FacilityForm from '@/components/Admin/FacilityForm';
import { updateFacility } from '@/app/admin/facility-actions';
import type { Facility } from '@/types/facility';

interface Props { params: Promise<{ id: string }> }

export default async function EditFacilityPage({ params }: Props) {
  const { id } = await params;
  const { data, error } = await supabaseAdmin.from('facilities').select('*').eq('id', id).single();
  if (error || !data) notFound();

  const facility = data as Facility;
  const updateWithId = updateFacility.bind(null, id);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">施設編集</h1>
      <FacilityForm facility={facility} action={updateWithId} mode="edit" />
    </div>
  );
}
