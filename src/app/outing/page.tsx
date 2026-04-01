import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'お出かけナビ | 病院ナビ南信',
  description: '南信地域の買い物・役所・銀行などへの行き方をお調べします',
};

const CATEGORIES = [
  { key: 'shopping', icon: '🛒', label: '買い物', description: 'スーパー・ドラッグストア・商店街' },
  { key: 'government', icon: '🏛️', label: '役所・公共施設', description: '市役所・公民館・図書館' },
  { key: 'banking', icon: '🏧', label: '銀行・郵便局', description: '銀行・信用金庫・郵便局' },
  { key: 'welfare', icon: '🏥', label: '医療・福祉', description: '病院・デイサービス' },
  { key: 'leisure', icon: '🎭', label: '趣味・交流', description: '文化施設・公園・温泉' },
];

export default function OutingPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">🚶 お出かけナビ</h1>
          <p className="text-base text-gray-600">
            どこに行きたいですか？カテゴリを選んでください
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.key}
              href={`/outing/${cat.key}`}
              className="flex items-center gap-4 bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary hover:shadow-lg transition-all min-h-tap"
            >
              <span className="text-4xl">{cat.icon}</span>
              <div>
                <h2 className="text-xl font-bold text-foreground">{cat.label}</h2>
                <p className="text-sm text-gray-500">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/search" className="text-primary underline text-base">
            🏥 病院を探す場合はこちら
          </Link>
        </div>
      </div>
    </div>
  );
}
