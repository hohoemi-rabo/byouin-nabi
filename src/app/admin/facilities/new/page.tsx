import FacilityForm from '@/components/Admin/FacilityForm';
import { createFacility } from '@/app/admin/facility-actions';

export default function NewFacilityPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">施設新規登録</h1>
      <FacilityForm action={createFacility} mode="create" />
    </div>
  );
}
