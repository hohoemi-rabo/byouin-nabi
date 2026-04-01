import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Hospital } from '@/types/hospital';
import HospitalCard from '@/components/HospitalList/HospitalCard';
import HospitalMapWrapper from '@/components/Map/HospitalMapWrapper';
import MobileFixedFooter from '@/components/Common/MobileFixedFooter';
import Button from '@/components/Common/Button';
import FavoriteButton from '@/components/User/FavoriteButton';
import HistoryRecorder from '@/components/User/HistoryRecorder';

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const hospital = await getHospital(id);

  if (!hospital) {
    return { title: '病院が見つかりません | 病院ナビ南信' };
  }

  return {
    title: `${hospital.name} | 病院ナビ南信`,
    description: `${hospital.name}（${hospital.address}）の診療情報。診療科: ${hospital.category.join('、')}`,
  };
}

export default async function HospitalDetailPage({ params, searchParams }: Props) {
  const [{ id }, resolvedSearchParams] = await Promise.all([params, searchParams]);
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

  // 戻るボタンのテキスト（スマホ用は短縮）
  const mobileBackText = from === 'results' ? '症状結果' : '検索結果';

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8 px-4 pb-24 md:pb-8">
        <div className="max-w-4xl mx-auto">
          {/* PC用の戻るリンク */}
          <div className="mb-6 hidden md:block">
            <Link
              href={backUrl}
              className="text-primary hover:underline text-lg"
            >
              {backText}
            </Link>
          </div>

          <h1 className="text-3xl font-bold mb-6">病院詳細</h1>

          <HistoryRecorder hospitalId={hospital.id} />
          <HospitalCard hospital={hospital} />

          {/* 地図（緯度経度がある場合のみ表示） */}
          {hospital.latitude && hospital.longitude && (
            <div className="mt-6 bg-white p-4 shadow-sm border-l-4 border-primary">
              <h2 className="text-lg font-bold mb-3">📍 地図</h2>
              <HospitalMapWrapper
                latitude={hospital.latitude}
                longitude={hospital.longitude}
                hospitalName={hospital.name}
              />
            </div>
          )}

          {/* アクションボタン */}
          <div className="mt-6 space-y-3">
            <FavoriteButton hospitalId={hospital.id} />
            <Link href={`/route?to=${hospital.id}&name=${encodeURIComponent(hospital.name)}`}>
              <Button variant="primary" className="w-full text-lg py-4">
                🚌 ここへの行き方を調べる
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* スマホ用固定フッター */}
      <MobileFixedFooter backUrl={backUrl} backText={mobileBackText} />
    </>
  );
}
