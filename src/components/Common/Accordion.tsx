'use client';

import { useState, ReactNode } from 'react';

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
    <div className={`rounded-xl shadow-md overflow-hidden transition-all duration-300 ${isOpen ? 'ring-2 ring-primary/30' : ''} ${className}`}>
      {/* ヘッダー（クリックで開閉） */}
      <button
        onClick={() => setIsOpen(!isOpen)}
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

      {/* コンテンツ（アニメーション付き） */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 md:p-5 bg-white border-t border-gray-100">
          {children}
        </div>
      </div>
    </div>
  );
}
