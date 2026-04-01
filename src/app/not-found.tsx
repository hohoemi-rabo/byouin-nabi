import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            ページが見つかりません
          </h1>
        </div>

        <p className="text-xl md:text-2xl text-gray-700 mb-8">
          お探しのページは存在しないか、移動した可能性があります。
          <br />
          URLをご確認いただくか、トップページからお探しください。
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-block bg-primary text-white px-8 py-4 rounded-lg min-h-tap font-medium text-xl hover:bg-primary/90 transition-colors text-center"
          >
            🏠 トップページに戻る
          </Link>
          <Link
            href="/search"
            className="inline-block bg-gray-200 text-foreground px-8 py-4 rounded-lg min-h-tap font-medium text-xl hover:bg-gray-300 transition-colors text-center"
          >
            🔎 病院を検索する
          </Link>
        </div>
      </div>
    </div>
  );
}
