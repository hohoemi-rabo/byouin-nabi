interface ErrorBoxProps {
  error: string;
  title?: string;
  onDismiss?: () => void;
}

/**
 * 統一されたエラー表示コンポーネント
 * アプリ全体で一貫したエラー表示を提供
 */
export default function ErrorBox({
  error,
  title = 'エラーが発生しました',
  onDismiss
}: ErrorBoxProps) {
  return (
    <div className="bg-error/10 border-2 border-error rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-error mb-2 flex items-center gap-2">
            ❌ {title}
          </h3>
          <p className="text-lg text-gray-700">{error}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-error hover:text-error/80 transition-colors text-2xl font-bold p-2 min-h-tap min-w-[48px] flex items-center justify-center"
            aria-label="閉じる"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
