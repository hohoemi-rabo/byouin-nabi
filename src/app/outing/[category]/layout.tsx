import type { Metadata } from 'next';

const CATEGORY_LABELS: Record<string, string> = {
  shopping: '買い物',
  government: '役所・公共施設',
  banking: '銀行・郵便局',
  welfare: '医療・福祉',
  leisure: '趣味・交流',
};

interface Props {
  params: Promise<{ category: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const label = CATEGORY_LABELS[category] || category;

  return {
    title: `${label} | おでかけナビ | 病院ナビ南信`,
    description: `南信地域の${label}施設一覧。シニアの方のおでかけをサポートします。`,
  };
}

export default function OutingCategoryLayout({ children }: Props) {
  return children;
}
