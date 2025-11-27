import LoadingSpinner from './LoadingSpinner';

interface LoadingBoxProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 統一されたローディング表示コンポーネント
 * アプリ全体で一貫したローディング表示を提供
 */
export default function LoadingBox({
  message = '読み込み中...',
  size = 'lg'
}: LoadingBoxProps) {
  const textSizeClass = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl'
  }[size];

  return (
    <div className="text-center py-12">
      <LoadingSpinner size={size} className="mb-4 mx-auto" />
      <p className={`text-gray-600 font-medium ${textSizeClass}`}>
        {message}
      </p>
    </div>
  );
}
