import Link from 'next/link';
import FontSizeToggle from './FontSizeToggle';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between min-h-header">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="text-primary font-bold text-xl md:text-2xl">
            病院ナビ南信
          </div>
          <div className="text-gray-600 text-sm hidden md:block">
            症状から探す 安心の病院ナビ
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/search"
            className="bg-primary text-white px-4 py-2 rounded-lg font-medium text-base hover:bg-primary/90 transition-colors min-h-tap"
          >
            🔍 検索
          </Link>
          <FontSizeToggle />
        </div>
      </div>
    </header>
  );
}
