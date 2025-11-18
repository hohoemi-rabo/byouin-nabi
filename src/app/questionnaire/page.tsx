import { QuestionnaireProvider } from '@/context/QuestionnaireContext';
import QuestionnaireForm from '@/components/Questionnaire/QuestionnaireForm';

export const metadata = {
  title: 'アンケート | 病院ナビ南信',
  description: '症状についてのアンケートにお答えください。適切な病院をご案内します。',
};

export default function QuestionnairePage() {
  return (
    <QuestionnaireProvider>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            症状についてお聞かせください
          </h1>
          <p className="text-lg text-gray-600">
            以下の質問にお答えいただくと、適切な病院をご案内します
          </p>
        </div>

        <QuestionnaireForm />
      </div>
    </QuestionnaireProvider>
  );
}
