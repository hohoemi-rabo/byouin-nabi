import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Hospital } from '@/types/hospital';
import HospitalCard from '@/components/HospitalList/HospitalCard';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getHospital(id: string): Promise<Hospital | null> {
  const { data: hospital, error } = await supabase
    .from('hospitals')
    .select(`
      *,
      schedules:hospital_schedules(*)
    `)
    .eq('id', id)
    .single();

  if (error || !hospital) {
    return null;
  }

  return hospital as Hospital;
}

export default async function HospitalDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const hospital = await getHospital(id);

  if (!hospital) {
    notFound();
  }

  // 戻り先を判定
  const from = resolvedSearchParams.from as string | undefined;

  let backUrl = '/search';
  let backText = '← 検索結果に戻る';

  if (from === 'results') {
    // /results ページから来た場合
    backUrl = '/results';
    backText = '← 症状結果に戻る';
  } else {
    // /search ページから来た場合、検索条件を保持
    const queryParams = new URLSearchParams();
    if (resolvedSearchParams.categories) {
      queryParams.append('categories', resolvedSearchParams.categories as string);
    }
    if (resolvedSearchParams.cities) {
      queryParams.append('cities', resolvedSearchParams.cities as string);
    }
    if (resolvedSearchParams.keyword) {
      queryParams.append('keyword', resolvedSearchParams.keyword as string);
    }

    if (queryParams.toString()) {
      backUrl = `/search?${queryParams.toString()}`;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href={backUrl}
            className="text-primary hover:underline text-lg"
          >
            {backText}
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6">病院詳細</h1>

        <HospitalCard hospital={hospital} />
      </div>
    </div>
  );
}
