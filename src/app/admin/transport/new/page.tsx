import TransportForm from '@/components/Admin/TransportForm';
import { createTransportService } from '@/app/admin/transport-actions';

export default function NewTransportPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">交通サービス新規登録</h1>
      <TransportForm action={createTransportService} mode="create" />
    </div>
  );
}
