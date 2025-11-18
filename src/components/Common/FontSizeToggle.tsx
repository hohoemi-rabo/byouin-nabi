'use client'

import { useEffect, useState } from 'react';

export default function FontSizeToggle() {
  const [isLargeText, setIsLargeText] = useState(false);

  useEffect(() => {
    // LocalStorageから設定を読み込み
    const savedSetting = localStorage.getItem('fontSize');
    const isLarge = savedSetting === 'large';
    setIsLargeText(isLarge);

    // bodyにクラスを適用
    if (isLarge) {
      document.body.classList.add('large-text');
    }
  }, []);

  const toggleFontSize = () => {
    const newIsLarge = !isLargeText;
    setIsLargeText(newIsLarge);

    // LocalStorageに保存
    localStorage.setItem('fontSize', newIsLarge ? 'large' : 'normal');

    // bodyのクラスを切り替え
    if (newIsLarge) {
      document.body.classList.add('large-text');
    } else {
      document.body.classList.remove('large-text');
    }
  };

  return (
    <button
      onClick={toggleFontSize}
      className="px-4 py-2 min-h-tap min-w-tap bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-medium"
      aria-label={isLargeText ? '通常の文字サイズに切り替え' : '大きな文字サイズに切り替え'}
    >
      {isLargeText ? '標準' : '大'}
    </button>
  );
}
