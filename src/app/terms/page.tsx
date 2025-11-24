import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '利用規約 | 病院ナビ南信',
  description: '病院ナビ南信の利用規約です。本サービスをご利用いただく前に必ずお読みください。',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
          利用規約
        </h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 space-y-8">
          {/* はじめに */}
          <section>
            <p className="text-lg leading-relaxed">
              この利用規約（以下、「本規約」といいます。）は、病院ナビ南信（以下、「本サービス」といいます。）の利用条件を定めるものです。
              本サービスをご利用いただく際には、本規約の全ての内容をご確認いただき、同意いただく必要があります。
            </p>
          </section>

          {/* 第1条 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary border-b-2 border-primary pb-2">
              第1条（サービスの概要）
            </h2>
            <div className="space-y-3 text-lg leading-relaxed">
              <p>
                本サービスは、症状や部位に基づいて適切な診療科や医療機関を検索できる情報提供サービスです。
              </p>
              <p className="font-bold text-error">
                ※ 本サービスは医療行為ではなく、医学的診断を行うものではありません。
                必ず医師の診察を受けてください。
              </p>
            </div>
          </section>

          {/* 第2条 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary border-b-2 border-primary pb-2">
              第2条（利用条件）
            </h2>
            <div className="space-y-3 text-lg leading-relaxed">
              <p>
                ユーザーは、本サービスを利用するにあたり、以下の事項を理解し、同意するものとします。
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>本サービスは参考情報の提供を目的としており、医学的診断や治療を行うものではありません。</li>
                <li>症状がある場合は、必ず医師の診察を受けてください。</li>
                <li>緊急時は119番に通報してください。</li>
                <li>本サービスの情報は定期的に更新されますが、常に最新であることを保証するものではありません。</li>
              </ul>
            </div>
          </section>

          {/* 第3条 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary border-b-2 border-primary pb-2">
              第3条（免責事項）
            </h2>
            <div className="space-y-3 text-lg leading-relaxed">
              <p>
                本サービスは、以下の事項について一切の責任を負いません。
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>本サービスの情報に基づいて行われた行為の結果について</li>
                <li>本サービスの利用により発生した損害について</li>
                <li>医療機関の診療内容、診療時間、休診日等の正確性について</li>
                <li>本サービスの中断、停止、終了により発生した損害について</li>
                <li>AI診断機能（実験的機能）の提供内容について</li>
              </ul>
              <p className="font-bold text-error mt-4">
                本サービスは情報提供のみを目的としており、医療行為ではありません。
                健康上の問題については、必ず医師にご相談ください。
              </p>
            </div>
          </section>

          {/* 第4条 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary border-b-2 border-primary pb-2">
              第4条（個人情報の取り扱い）
            </h2>
            <div className="space-y-3 text-lg leading-relaxed">
              <p>
                本サービスは、ユーザーの個人情報を以下のように取り扱います。
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>本サービスは、アンケート回答データをブラウザのローカルストレージに保存します。</li>
                <li>入力された症状情報は、サーバーに保存されません。</li>
                <li>AI診断機能を利用した場合、OpenAI APIに症状情報が送信されます（機能が有効な場合のみ）。</li>
                <li>個人を特定できる情報（氏名、住所、電話番号等）は収集しません。</li>
              </ul>
            </div>
          </section>

          {/* 第5条 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary border-b-2 border-primary pb-2">
              第5条（禁止事項）
            </h2>
            <div className="space-y-3 text-lg leading-relaxed">
              <p>
                ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません。
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>法令または公序良俗に違反する行為</li>
                <li>犯罪行為に関連する行為</li>
                <li>本サービスの運営を妨害する行為</li>
                <li>他のユーザーまたは第三者の権利を侵害する行為</li>
                <li>本サービスを商用目的で利用する行為</li>
                <li>不正アクセス、サーバーへの過度な負荷をかける行為</li>
              </ul>
            </div>
          </section>

          {/* 第6条 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary border-b-2 border-primary pb-2">
              第6条（サービスの変更・停止）
            </h2>
            <div className="space-y-3 text-lg leading-relaxed">
              <p>
                運営者は、以下の場合に本サービスの全部または一部を変更、停止、または終了することができます。
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>本サービスの保守、点検、修理等を行う場合</li>
                <li>地震、落雷、火災、停電等の不可抗力により本サービスの提供ができない場合</li>
                <li>その他、運営者が必要と判断した場合</li>
              </ul>
            </div>
          </section>

          {/* 第7条 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary border-b-2 border-primary pb-2">
              第7条（規約の変更）
            </h2>
            <div className="space-y-3 text-lg leading-relaxed">
              <p>
                運営者は、必要と判断した場合、本規約を変更することができます。
                変更後の規約は、本サービス上に掲載した時点で効力を生じるものとします。
              </p>
            </div>
          </section>

          {/* 第8条 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary border-b-2 border-primary pb-2">
              第8条（準拠法・管轄裁判所）
            </h2>
            <div className="space-y-3 text-lg leading-relaxed">
              <p>
                本規約の解釈にあたっては、日本法を準拠法とします。
              </p>
              <p>
                本サービスに関して紛争が生じた場合には、運営者の所在地を管轄する裁判所を専属的合意管轄裁判所とします。
              </p>
            </div>
          </section>

          {/* 制定日 */}
          <section className="text-right text-gray-600 text-base pt-4 border-t border-gray-200">
            <p>制定日：2025年11月24日</p>
          </section>
        </div>

        {/* 戻るボタン */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block bg-primary text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-primary-dark transition-colors min-h-tap"
          >
            トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
