'use client';

import Link from 'next/link';

interface MobileFixedFooterProps {
  backUrl: string;
  backText?: string;
}

export default function MobileFixedFooter({ backUrl, backText = '戻る' }: MobileFixedFooterProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 md:hidden z-50">
      <div className="flex gap-2">
        <Link
          href="/"
          className="flex-1 py-3 text-center text-lg font-bold text-gray-700 bg-gray-100 rounded-lg active:bg-gray-200"
        >
          ホーム
        </Link>
        <Link
          href={backUrl}
          className="flex-1 py-3 text-center text-lg font-bold text-gray-700 bg-gray-100 rounded-lg active:bg-gray-200"
        >
          {backText}
        </Link>
      </div>
    </div>
  );
}
