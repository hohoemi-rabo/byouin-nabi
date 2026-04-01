import { supabase } from '@/lib/supabase';
import type { Hospital } from '@/types/hospital';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '緊急時ガイド | 病院ナビ南信',
  description: '緊急時の対応ガイド。119番通報、救急対応病院一覧。',
};

export default async function EmergencyPage() {
  const { data: hospitals } = await supabase
    .from('hospitals')
    .select('*')
    .eq('emergency_available', true)
    .order('name');

  const emergencyHospitals = (hospitals || []) as Hospital[];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-red-700">
          緊急時ガイド
        </h1>

        {/* 119番ボタン */}
        <div className="mb-8">
          <a
            href="tel:119"
            className="block w-full bg-red-600 text-white text-center text-2xl font-bold py-6 rounded-xl hover:bg-red-700 transition-colors shadow-lg"
          >
            📞 119番に電話する
          </a>
          <p className="text-center text-red-600 font-bold mt-3 text-base">
            意識がない・呼吸困難・激しい胸の痛みなどは迷わず119番
          </p>
        </div>

        {/* 応急処置ガイド */}
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-red-700">応急処置の基本</h2>
          <ul className="space-y-3 text-base text-gray-800">
            <li className="flex items-start gap-2">
              <span className="font-bold text-red-600 mt-0.5">1.</span>
              <span><strong>安全確認</strong> — 周囲の安全を確認し、患者を安全な場所へ</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-red-600 mt-0.5">2.</span>
              <span><strong>119番通報</strong> — 場所・状況・患者の状態を伝える</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-red-600 mt-0.5">3.</span>
              <span><strong>安静に</strong> — 無理に動かさず、楽な姿勢にする</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-red-600 mt-0.5">4.</span>
              <span><strong>保温</strong> — 毛布などで体温を保つ</span>
            </li>
          </ul>
        </div>

        {/* 救急対応病院リスト */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">🏥 救急対応病院</h2>
          {emergencyHospitals.length === 0 ? (
            <p className="text-gray-600">救急対応病院の情報は現在登録されていません。119番をご利用ください。</p>
          ) : (
            <div className="space-y-3">
              {emergencyHospitals.map(h => (
                <div key={h.id} className="bg-white border-2 border-gray-200 rounded-xl p-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-lg">{h.name}</h3>
                    <p className="text-sm text-gray-600">{h.address}</p>
                  </div>
                  <a
                    href={`tel:${h.tel}`}
                    className="flex items-center gap-1 bg-success text-white px-5 py-3 rounded-lg font-bold text-base whitespace-nowrap min-h-tap shadow-md hover:bg-success/90"
                  >
                    📞 {h.tel}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 免責事項 */}
        <div className="bg-gray-100 rounded-xl p-4 text-sm text-gray-600">
          <p>※ このページの情報は参考情報です。緊急の場合は迷わず119番に電話してください。</p>
          <p>※ 本サービスは医療行為ではありません。</p>
        </div>
      </div>
    </div>
  );
}
