'use client';

import { useState, useEffect } from 'react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // スクロール位置を監視
  useEffect(() => {
    const toggleVisibility = () => {
      // 300px以上スクロールしたら表示
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  // トップへスクロール
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-primary text-white rounded-full p-4 shadow-lg hover:bg-primary-dark hover:scale-110 transition-all duration-300 z-40 min-h-tap min-w-[60px] hidden md:flex items-center justify-center animate-fadeInUp"
          aria-label="ページトップへ戻る"
          title="ページトップへ戻る"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
          <span className="sr-only">ページトップへ戻る</span>
        </button>
      )}
    </>
  );
}
