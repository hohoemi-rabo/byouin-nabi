import HospitalForm from '@/components/Admin/HospitalForm';
import { createHospital } from '@/app/admin/actions';

export default function NewHospitalPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">
          病院を新規登録
        </h1>
        <p className="text-sm text-gray-600">
          新しい病院の情報を登録します
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <HospitalForm action={createHospital} mode="create" />
      </div>
    </div>
  );
}
