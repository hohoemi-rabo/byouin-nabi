'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuestionnaireProvider, useQuestionnaire } from '@/context/QuestionnaireContext';
import SymptomDescription from '@/components/SymptomResult/SymptomDescription';
import RecommendedDepartments from '@/components/SymptomResult/RecommendedDepartments';
import HospitalList from '@/components/HospitalList/HospitalList';
import ImageSaveButton from '@/components/SymptomResult/ImageSaveButton';
import UrgencyBadge from '@/components/SymptomResult/UrgencyBadge';
import ErrorBox from '@/components/Common/ErrorBox';
import LoadingBox from '@/components/Common/LoadingBox';
import Button from '@/components/Common/Button';
import Accordion from '@/components/Common/Accordion';
import MobileFixedFooter from '@/components/Common/MobileFixedFooter';
import { getDepartments } from '@/lib/departmentMapping';
import type { AIRecommendResponse } from '@/types/ai';

function ResultsContent() {
  const router = useRouter();
  const { data, isLoaded, resetData } = useQuestionnaire();
  const [description, setDescription] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AIRecommendResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (data.location.length === 0 || !data.duration) {
      router.push('/questionnaire');
      return;
    }

    const fetchData = async () => {
      try {
        // 症状説明文生成と AI 緊急度判定を並列実行
        const [descRes, aiRes] = await Promise.all([
          fetch('/api/symptoms/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          }),
          fetch('/api/symptoms/ai-recommend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questionnaire: data }),
          }),
        ]);

        if (!descRes.ok) {
          const errorData = await descRes.json();
          throw new Error(errorData.error || '症状説明文の生成に失敗しました');
        }

        const descResult = await descRes.json();
        setDescription(descResult.description);

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          setAiResult(aiData);
        }
      } catch (err) {
        console.error('Error loading results:', err);
        setError(err instanceof Error ? err.message : '結果の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <LoadingBox message="症状をまとめていま���..." size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <ErrorBox error={error} />
          <div className="mt-6">
            <Button variant="primary" onClick={() => router.push('/questionnaire')}>
              アンケートに戻る
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!description) return null;

  // 推奨診療科: AI結果があればそちらを優先、なければルールベース
  const ruleDepartments = getDepartments(data.location, data.symptoms);
  const recommendedDepartments = aiResult?.recommended_departments?.length
    ? aiResult.recommended_departments
    : ruleDepartments;

  const handleBackToHome = () => {
    resetData();
    router.push('/');
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-5xl mx-auto">
        {/* ヘ��ダー */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            症状のま���めが完成しました
          </h1>
          <p className="text-base text-gray-600">
            各セクショ��をタップして内容を確認できます
          </p>
        </div>

        {/* 緊急度判���（最上部に大きく表示） */}
        {aiResult && (
          <div className="mb-6">
            <UrgencyBadge
              urgency={aiResult.urgency}
              reason={aiResult.urgency_reason}
              advice={aiResult.advice}
              disclaimer={aiResult.disclaimer}
            />
          </div>
        )}

        {/* アコーディオンセ���ション */}
        <div className="space-y-4 mb-8">
          {/* 推奨される診療科（デフォルト���開く） */}
          <Accordion title="推奨される診療科" icon="🏥" defaultOpen={true}>
            <RecommendedDepartments departments={recommendedDepartments} />
            {aiResult?.department_reason && (
              <p className="mt-3 text-sm text-gray-600 bg-blue-50 rounded-lg p-3">
                💡 {aiResult.department_reason}
              </p>
            )}
          </Accordion>

          {/* ��状まとめ */}
          <Accordion
            title="症状まとめを見る"
            icon="📝"
            description="病院で見せられる説明文を作成��ました"
            badge="便利"
            badgeColor="green"
            variant="highlight"
          >
            <div className="mb-6">
              <p className="text-base text-gray-600 mb-4 text-center">
                病院の受付や医師に見せてください
              </p>
              <SymptomDescription description={description} />
            </div>
            <div className="flex justify-center">
              <ImageSaveButton targetId="symptom-description" />
            </div>
          </Accordion>
        </div>

        {/* 対応病院リスト（常に表示��� */}
        <div className="mt-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
            <span>📋</span>
            <span>対応している病院</span>
          </h2>
          <HospitalList departments={recommendedDepartments} />
        </div>

        {/* アクションボタン（PC用） */}
        <div className="mt-10 hidden md:flex flex-col md:flex-row gap-4 justify-center">
          <Button
            variant="secondary"
            onClick={() => router.push('/questionnaire')}
            className="text-lg px-8 py-4"
          >
            アンケートに戻る
          </Button>
          <Button
            variant="primary"
            onClick={handleBackToHome}
            className="text-lg px-8 py-4"
          >
            トップページに戻る
          </Button>
        </div>

        {/* スマホ用の余白（固定フッター分） */}
        <div className="h-20 md:hidden" />
      </div>

      {/* スマホ用固定フッター */}
      <MobileFixedFooter backUrl="/questionnaire" backText="やり直す" />
    </div>
  );
}

export default function ResultsPage() {
  return (
    <QuestionnaireProvider>
      <ResultsContent />
    </QuestionnaireProvider>
  );
}
