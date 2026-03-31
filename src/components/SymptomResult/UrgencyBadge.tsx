import type { UrgencyLevel } from '@/types/ai';

interface UrgencyBadgeProps {
  urgency: UrgencyLevel;
  reason: string;
  advice: string;
  disclaimer: string;
}

const URGENCY_CONFIG = {
  emergency: {
    label: '緊急',
    icon: '🔴',
    bgClass: 'bg-red-50 border-red-500',
    textClass: 'text-red-700',
    badgeClass: 'bg-red-600 text-white',
    description: '今すぐ対応が必要です',
  },
  soon: {
    label: '早めに受診',
    icon: '🟡',
    bgClass: 'bg-yellow-50 border-yellow-500',
    textClass: 'text-yellow-800',
    badgeClass: 'bg-yellow-500 text-white',
    description: '当日〜翌日の受診をおすすめします',
  },
  watch: {
    label: '様子を見て受診',
    icon: '🟢',
    bgClass: 'bg-green-50 border-green-500',
    textClass: 'text-green-700',
    badgeClass: 'bg-green-600 text-white',
    description: '近日中の受診をおすすめします',
  },
} as const;

export default function UrgencyBadge({ urgency, reason, advice, disclaimer }: UrgencyBadgeProps) {
  const config = URGENCY_CONFIG[urgency];

  return (
    <div className={`border-2 rounded-xl p-6 ${config.bgClass}`}>
      {/* 緊急度ヘッダー */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{config.icon}</span>
        <div>
          <span className={`inline-block px-4 py-1 rounded-full font-bold text-lg ${config.badgeClass}`}>
            {config.label}
          </span>
          <p className={`text-base mt-1 ${config.textClass}`}>{config.description}</p>
        </div>
      </div>

      {/* 判定理由 */}
      <p className={`text-base mb-3 ${config.textClass}`}>{reason}</p>

      {/* アドバイス */}
      <p className="text-base text-gray-700 mb-4">{advice}</p>

      {/* 緊急時: 119番ボタン */}
      {urgency === 'emergency' && (
        <a
          href="tel:119"
          className="block w-full bg-red-600 text-white text-center text-xl font-bold py-4 rounded-lg hover:bg-red-700 transition-colors min-h-tap mb-4"
        >
          📞 119番に電話する
        </a>
      )}

      {/* 免責事項 */}
      <p className="text-sm text-gray-500">{disclaimer}</p>
    </div>
  );
}
