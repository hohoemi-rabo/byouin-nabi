import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-6 min-h-footer">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-gray-600 text-sm">
            &copy; {currentYear} 病院ナビ南信. All rights reserved.
          </div>

          <nav className="flex gap-6">
            <Link
              href="/terms"
              className="text-gray-600 hover:text-primary transition-colors min-h-tap flex items-center"
            >
              利用規約
            </Link>
            <Link
              href="/contact"
              className="text-gray-600 hover:text-primary transition-colors min-h-tap flex items-center"
            >
              お問い合わせ
            </Link>
          </nav>
        </div>

        <div className="mt-4 text-center text-gray-500 text-sm">
          <p>※ 本サービスは医療行為ではありません。症状がある場合は必ず医師の診察を受けてください。</p>
        </div>
      </div>
    </footer>
  );
}
