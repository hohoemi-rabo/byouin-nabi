'use client';

import Link from 'next/link';

interface MobileFixedFooterProps {
  backUrl: string;
  backText?: string;
}

export default function MobileFixedFooter({ backUrl, backText = '戻る' }: MobileFixedFooterProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 md:hidden z-50">
      <div className="flex">
        <Link
          href="/"
          className="flex-1 py-4 text-center text-lg font-bold text-gray-700 border-r border-gray-300 active:bg-gray-100"
        >
          ホーム
        </Link>
        <Link
          href={backUrl}
          className="flex-1 py-4 text-center text-lg font-bold text-gray-700 active:bg-gray-100"
        >
          {backText}
        </Link>
      </div>
    </div>
  );
}
