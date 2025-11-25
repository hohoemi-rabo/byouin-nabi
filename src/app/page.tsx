import StartQuestionnaireButton from "@/components/Common/StartQuestionnaireButton";
import Link from "next/link";
import Button from "@/components/Common/Button";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* ヒーローセクション */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
          症状があるのに、<br className="md:hidden" />
          どの病院に行けばいいか<br />
          わからない...
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8">
          そんな悩みを解決します
        </p>

        {/* ボタングループ */}
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <StartQuestionnaireButton className="text-xl px-12 py-6 w-full md:w-auto">
            症状から病院を探す
          </StartQuestionnaireButton>

          <Link href="/search" className="w-full md:w-auto">
            <Button variant="secondary" className="text-xl px-12 py-6 w-full">
              🔍 地域・診療科から探す
            </Button>
          </Link>
        </div>
      </section>

      {/* サービス説明セクション */}
      <section className="max-w-4xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          病院ナビ南信の特徴
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-bold mb-3">簡単アンケート</h3>
            <p className="text-gray-700">
              症状や痛みの場所を選ぶだけ。
              <br />
              スマホ操作が苦手でも大丈夫です。
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="text-4xl mb-4">🏥</div>
            <h3 className="text-xl font-bold mb-3">最適な病院を提案</h3>
            <p className="text-gray-700">
              症状に合った診療科の病院を自動で表示。
              <br />
              迷わず受診できます。
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold mb-3">症状を文章で説明</h3>
            <p className="text-gray-700">
              医師に見せられる症状説明文を自動作成。
              <br />
              画像で保存もできます。
            </p>
          </div>
        </div>
      </section>

      {/* 使い方セクション */}
      <section className="max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">使い方</h2>

        <ol className="space-y-6">
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
              1
            </span>
            <div>
              <h3 className="text-xl font-bold mb-2">症状を選ぶ</h3>
              <p className="text-gray-700">
                痛みや症状がある場所、いつから症状があるかなどを選択します。
              </p>
            </div>
          </li>

          <li className="flex gap-4">
            <span className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
              2
            </span>
            <div>
              <h3 className="text-xl font-bold mb-2">病院を確認</h3>
              <p className="text-gray-700">
                症状に合った診療科の病院リストが表示されます。電話番号や地図も確認できます。
              </p>
            </div>
          </li>

          <li className="flex gap-4">
            <span className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
              3
            </span>
            <div>
              <h3 className="text-xl font-bold mb-2">病院へ連絡・受診</h3>
              <p className="text-gray-700">
                気になる病院に電話で問い合わせ、または直接受診してください。
              </p>
            </div>
          </li>
        </ol>
      </section>

      {/* CTAセクション */}
      <section className="text-center bg-primary-light/10 py-12 px-4 rounded-lg">
        <h2 className="text-3xl font-bold mb-6">今すぐ病院を探す</h2>
        <p className="text-xl text-gray-700 mb-8">
          症状がある方は、お早めに適切な医療機関を受診しましょう。
        </p>

        {/* ボタングループ */}
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <StartQuestionnaireButton className="text-xl px-12 py-6 w-full md:w-auto">
            アンケートを始める
          </StartQuestionnaireButton>

          <Link href="/search" className="w-full md:w-auto">
            <Button variant="secondary" className="text-xl px-12 py-6 w-full">
              🔍 地域・診療科から探す
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
