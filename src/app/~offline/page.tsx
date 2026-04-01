'use client';

export default function OfflinePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto text-center">
        <div className="text-6xl mb-6">📵</div>
        <h1 className="text-2xl font-bold mb-4">
          インターネットに接続されていません
        </h1>
        <p className="text-base text-gray-600 mb-8">
          電波の届く場所に移動してから、もう一度お試しください。
        </p>

        {/* 119番ボタン（電話は常に利用可能） */}
        <div className="mb-8">
          <a
            href="tel:119"
            className="block w-full bg-red-600 text-white text-center text-xl font-bold py-5 rounded-xl hover:bg-red-700 transition-colors shadow-lg"
          >
            📞 緊急時は 119番
          </a>
          <p className="text-sm text-gray-500 mt-2">
            電話はインターネット接続なしで利用できます
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="bg-primary text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-primary/90 transition-colors min-h-tap"
        >
          再読み込み
        </button>
      </div>
    </div>
  );
}
