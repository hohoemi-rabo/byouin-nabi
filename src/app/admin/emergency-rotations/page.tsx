import Link from 'next/link';
import Button from '@/components/Common/Button';
import EmergencyRotationListClient from '@/components/Admin/EmergencyRotationListClient';
import {
  getEmergencyRotationsByMonth,
  getAvailableSourceMonths,
} from '@/app/admin/actions';

function defaultMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

interface Props {
  searchParams: Promise<{ month?: string }>;
}

export default async function AdminEmergencyRotationsPage({ searchParams }: Props) {
  const { month } = await searchParams;
  const currentMonth = month ?? defaultMonth();

  const [rotations, availableMonths] = await Promise.all([
    getEmergencyRotationsByMonth(currentMonth),
    getAvailableSourceMonths(),
  ]);

  // 現在月が availableMonths に無くてもタブに表示する
  const months = availableMonths.includes(currentMonth)
    ? availableMonths
    : [currentMonth, ...availableMonths];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">救急ローテーション管理</h1>
          <p className="text-sm text-gray-600">
            飯伊地区包括医療協議会発行の休日当番医・夜間急患診療所の予定を管理します
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Link href="/admin/emergency-rotations/new">
            <Button variant="primary" className="text-sm">➕ 新規登録</Button>
          </Link>
          <Link href="/admin/emergency-rotations/import">
            <Button variant="secondary" className="text-sm">📥 CSV インポート</Button>
          </Link>
          <Link href="/admin/emergency-rotations/generate-night">
            <Button variant="secondary" className="text-sm">🌙 夜間急患の月次生成</Button>
          </Link>
        </div>
      </div>

      <EmergencyRotationListClient
        rotations={rotations}
        availableMonths={months}
        currentMonth={currentMonth}
      />
    </div>
  );
}
