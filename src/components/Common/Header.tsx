import Link from 'next/link';
import HeaderAuthNav from './HeaderAuthNav';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-50 to-white border-b-4 border-primary sticky top-0 z-50 shadow-md" role="banner">
      <div className="container mx-auto px-4 flex items-center justify-between" style={{ height: '88px' }}>
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          aria-label="病院ナビ南信 ホームページ"
        >
          <div className="text-primary font-bold text-xl md:text-2xl leading-none">
            病院ナビ南信
          </div>
          <div className="text-gray-600 text-sm hidden md:block leading-none">
            症状から探す 安心の病院ナビ
          </div>
        </Link>

        <nav className="flex items-center gap-4" role="navigation" aria-label="メインナビゲーション">
          <Link
            href="/search"
            className="bg-success text-white px-4 py-2 rounded-lg font-medium text-base hover:bg-success-dark transition-colors min-h-tap shadow-sm"
            aria-label="病院を検索"
          >
            🔍 検索
          </Link>
          <HeaderAuthNav />
        </nav>
      </div>
    </header>
  );
}
