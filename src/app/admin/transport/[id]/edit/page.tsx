import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase-admin';
import TransportForm from '@/components/Admin/TransportForm';
import { updateTransportService } from '@/app/admin/transport-actions';
import type { TransportService } from '@/types/transport';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditTransportPage({ params }: Props) {
  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from('transport_services')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    notFound();
  }

  const service = data as TransportService;
  const updateWithId = updateTransportService.bind(null, id);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">交通サービス編集</h1>
      <TransportForm service={service} action={updateWithId} mode="edit" />
    </div>
  );
}
