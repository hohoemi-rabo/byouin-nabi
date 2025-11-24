import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto" role="contentinfo">
      <div className="container mx-auto px-4 py-6 min-h-footer">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* 左側: ナビゲーションリンク */}
          <nav className="flex gap-6 md:flex-1" aria-label="フッターナビゲーション">
            <Link
              href="/contact"
              className="text-gray-600 hover:text-primary transition-colors min-h-tap flex items-center"
              aria-label="お問い合わせ"
            >
              お問い合わせ
            </Link>
            <Link
              href="/terms"
              className="text-gray-600 hover:text-primary transition-colors min-h-tap flex items-center"
              aria-label="利用規約"
            >
              利用規約
            </Link>
          </nav>

          {/* 中央: © 表記 */}
          <div className="text-gray-600 text-sm text-center md:flex-shrink-0">
            &copy; {currentYear} 病院ナビ南信. All rights reserved.
          </div>

          {/* 右側: 空白（モバイルでは非表示） */}
          <div className="hidden md:block md:flex-1"></div>
        </div>

        <div className="mt-4 text-center text-gray-500 text-sm" role="note" aria-label="免責事項">
          <p>※ 本サービスは医療行為ではありません。症状がある場合は必ず医師の診察を受けてください。</p>
        </div>
      </div>
    </footer>
  );
}
