'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuestionnaireProvider, useQuestionnaire } from '@/context/QuestionnaireContext';
import SymptomDescription from '@/components/SymptomResult/SymptomDescription';
import RecommendedDepartments from '@/components/SymptomResult/RecommendedDepartments';
import HospitalList from '@/components/HospitalList/HospitalList';
import ImageSaveButton from '@/components/SymptomResult/ImageSaveButton';
import AIDiagnosisButton from '@/components/SymptomResult/AIDiagnosisButton';
import ErrorBox from '@/components/Common/ErrorBox';
import LoadingBox from '@/components/Common/LoadingBox';
import Button from '@/components/Common/Button';
import Accordion from '@/components/Common/Accordion';
import MobileFixedFooter from '@/components/Common/MobileFixedFooter';
import { getDepartments } from '@/lib/departmentMapping';

function ResultsContent() {
  const router = useRouter();
  const { data, isLoaded, resetData } = useQuestionnaire();
  const [description, setDescription] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateDescription = async () => {
      // LocalStorageからのデータ読み込みを待つ
      if (!isLoaded) {
        return;
      }

      // データが空の場合、アンケートページに戻る
      if (data.location.length === 0 || !data.duration) {
        router.push('/questionnaire');
        return;
      }

      try {
        setLoading(true);
        const response = await fetch('/api/symptoms/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '症状説明文の生成に失敗しました');
        }

        const result = await response.json();
        setDescription(result.description);
      } catch (err) {
        console.error('Error generating description:', err);
        setError(err instanceof Error ? err.message : '症状説明文の生成に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    generateDescription();
  }, [data, router, isLoaded]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <LoadingBox message="症状をまとめています..." size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <ErrorBox error={error} />
          <div className="mt-6">
            <Button
              variant="primary"
              onClick={() => router.push('/questionnaire')}
            >
              アンケートに戻る
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!description) {
    return null;
  }

  // 推奨される診療科を計算
  const recommendedDepartments = getDepartments(data.location, data.symptoms);

  // トップページに戻る際にデータをクリア
  const handleBackToHome = () => {
    resetData();
    router.push('/');
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-5xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            症状のまとめが完成しました
          </h1>
          <p className="text-base text-gray-600">
            各セクションをタップして内容を確認できます
          </p>
        </div>

        {/* アコーディオンセクション */}
        <div className="space-y-4 mb-8">
          {/* 推奨される診療科（デフォルトで開く） */}
          <Accordion title="推奨される診療科" icon="🏥" defaultOpen={true}>
            <RecommendedDepartments departments={recommendedDepartments} />
          </Accordion>

          {/* 症状まとめ */}
          <Accordion
            title="症状まとめを見る"
            icon="📝"
            description="病院で見せられる説明文を作成しました"
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

          {/* AI診断 */}
          <Accordion
            title="AI診断を試す"
            icon="🤖"
            description="AIが症状を分析して可能性のある病気を提案します"
            badge="実験的"
            badgeColor="purple"
            variant="gradient"
          >
            <AIDiagnosisButton questionnaireData={data} />
          </Accordion>
        </div>

        {/* 対応病院リスト（常に表示） */}
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
