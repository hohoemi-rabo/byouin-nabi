import LoadingSpinner from '@/components/Common/LoadingSpinner';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-6" />
        <p className="text-2xl md:text-3xl font-medium text-gray-700">
          読み込み中...
        </p>
        <p className="text-lg md:text-xl text-gray-500 mt-2">
          しばらくお待ちください
        </p>
      </div>
    </div>
  );
}
