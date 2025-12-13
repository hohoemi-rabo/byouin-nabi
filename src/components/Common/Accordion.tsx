'use client';

import { useState, useRef, ReactNode } from 'react';

type AccordionVariant = 'default' | 'highlight' | 'gradient';

interface AccordionProps {
  title: string;
  icon?: string;
  description?: string;
  badge?: string;
  badgeColor?: 'blue' | 'green' | 'orange' | 'purple';
  variant?: AccordionVariant;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}

export default function Accordion({
  title,
  icon,
  description,
  badge,
  badgeColor = 'blue',
  variant = 'default',
  defaultOpen = false,
  children,
  className = '',
}: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const accordionRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    const willOpen = !isOpen;
    setIsOpen(willOpen);

    // 開く時にアコーディオン全体が見えるようにスクロール
    if (willOpen && accordionRef.current) {
      // アニメーション完了後にスクロール（300msのアニメーション + 余裕）
      setTimeout(() => {
        accordionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 350);
    }
  };

  // バリアントに応じたスタイル
  const variantStyles = {
    default: 'bg-white hover:bg-gray-50',
    highlight: 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-l-4 border-primary',
    gradient: 'bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 hover:from-purple-100 hover:via-pink-100 hover:to-orange-100 border-l-4 border-purple-400',
  };

  // バッジの色
  const badgeColors = {
    blue: 'bg-blue-500 text-white',
    green: 'bg-green-500 text-white',
    orange: 'bg-orange-500 text-white',
    purple: 'bg-purple-500 text-white',
  };

  return (
    <div ref={accordionRef} className={`rounded-xl shadow-md overflow-hidden transition-all duration-300 ${isOpen ? 'ring-2 ring-primary/30' : ''} ${className}`}>
      {/* ヘッダー（クリックで開閉） */}
      <button
        onClick={handleToggle}
        className={`w-full flex items-center justify-between p-4 md:p-5 text-left transition-all duration-200 min-h-tap ${variantStyles[variant]}`}
        aria-expanded={isOpen}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {icon && <span className="text-2xl">{icon}</span>}
            <span className="text-lg md:text-xl font-bold text-foreground">{title}</span>
            {badge && (
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${badgeColors[badgeColor]} animate-pulse`}>
                {badge}
              </span>
            )}
          </div>
          {description && !isOpen && (
            <p className="text-sm text-gray-500 mt-1 ml-0 md:ml-9">
              {description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-2">
          {!isOpen && (
            <span className="text-xs text-primary font-medium hidden md:inline">
              タップして開く
            </span>
          )}
          <span
            className={`text-xl text-gray-400 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
          >
            ▼
          </span>
        </div>
      </button>

      {/* コンテンツ（CSS Gridアニメーション） */}
      {/*
        元のコード（max-height方式）- 戻す場合はこちらを使用:
        <div className={`overflow-hidden transition-all duration-300 ease-out ${
          isOpen ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="p-4 md:p-5 bg-white border-t border-gray-100">
            {children}
          </div>
        </div>
      */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-4 md:p-5 bg-white border-t border-gray-100">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
