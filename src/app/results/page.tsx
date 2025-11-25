'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuestionnaireProvider, useQuestionnaire } from '@/context/QuestionnaireContext';
import SymptomDescription from '@/components/SymptomResult/SymptomDescription';
import RecommendedDepartments from '@/components/SymptomResult/RecommendedDepartments';
import HospitalList from '@/components/HospitalList/HospitalList';
import ImageSaveButton from '@/components/SymptomResult/ImageSaveButton';
import AIDiagnosisButton from '@/components/SymptomResult/AIDiagnosisButton';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import Button from '@/components/Common/Button';
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
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-xl text-gray-600">症状をまとめています...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-error/10 border-2 border-error rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-error mb-3">
              エラーが発生しました
            </h2>
            <p className="text-lg text-gray-700 mb-6">{error}</p>
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
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            症状のまとめが完成しました
          </h1>
          <p className="text-lg text-gray-600">
            以下の内容を病院の受付や医師に見せてください
          </p>
        </div>

        {/* 推奨される診療科 */}
        <RecommendedDepartments departments={recommendedDepartments} />

        {/* AI診断機能（実験的） */}
        <div className="mb-8">
          <AIDiagnosisButton questionnaireData={data} />
        </div>

        {/* 症状説明文 */}
        <SymptomDescription description={description} />

        {/* 画像保存ボタン */}
        <div className="mt-8 mb-8 flex justify-center">
          <ImageSaveButton targetId="symptom-description" />
        </div>

        {/* アクションボタン（中間） */}
        <div className="flex flex-col md:flex-row gap-4 justify-center mb-12">
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

        {/* 対応病院リスト */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
            対応している病院
          </h2>
          <HospitalList departments={recommendedDepartments} />
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col md:flex-row gap-4 justify-center">
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
      </div>
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
