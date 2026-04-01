'use client';

import { useState } from 'react';
import Button from '@/components/Common/Button';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import type { FollowUpQuestion, FollowUpAnswer, AIRecommendResponse } from '@/types/ai';
import type { QuestionnaireData } from '@/types/questionnaire';

interface FollowUpChatProps {
  questionnaireData: QuestionnaireData;
  initialAiResult: AIRecommendResponse;
  onReassessment: (result: AIRecommendResponse) => void;
}

export default function FollowUpChat({ questionnaireData, initialAiResult, onReassessment }: FollowUpChatProps) {
  const [questions, setQuestions] = useState<FollowUpQuestion[]>([]);
  const [answers, setAnswers] = useState<FollowUpAnswer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [phase, setPhase] = useState<'idle' | 'loading-questions' | 'answering' | 'reassessing' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setPhase('loading-questions');
    setError(null);

    try {
      const res = await fetch('/api/symptoms/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionnaire: questionnaireData,
          ai_result: initialAiResult,
        }),
      });

      const data = await res.json();
      if (!data.questions || data.questions.length === 0) {
        setError('追加の質問を生成できませんでした。');
        setPhase('idle');
        return;
      }

      setQuestions(data.questions);
      setPhase('answering');
    } catch {
      setError('エラーが発生しました。');
      setPhase('idle');
    }
  };

  const handleAnswer = (answer: string) => {
    const q = questions[currentIndex];
    const newAnswers = [...answers, { question_id: q.id, question_text: q.text, answer }];
    setAnswers(newAnswers);
    setTextInput('');

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      runReassessment(newAnswers);
    }
  };

  const handleSkip = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      runReassessment(answers);
    }
  };

  const runReassessment = async (finalAnswers: FollowUpAnswer[]) => {
    setPhase('reassessing');

    try {
      const res = await fetch('/api/symptoms/ai-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionnaire: questionnaireData,
          follow_up_answers: finalAnswers,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onReassessment(data);
      }
    } catch {
      // 再判定失敗は無視（初回結果が残る）
    } finally {
      setPhase('done');
    }
  };

  // 開始前
  if (phase === 'idle') {
    return (
      <div className="mt-6">
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <Button variant="secondary" onClick={handleStart} className="w-full text-lg py-4">
          🔍 もっと詳しく調べる
        </Button>
        <p className="text-sm text-gray-500 text-center mt-2">
          AIが追加の質問をして、より正確に判定します
        </p>
      </div>
    );
  }

  // 質問生成中
  if (phase === 'loading-questions') {
    return (
      <div className="mt-6 flex items-center justify-center gap-3 py-8">
        <LoadingSpinner size="md" />
        <span className="text-base text-gray-600">追加の質問を考えています...</span>
      </div>
    );
  }

  // 再判定中
  if (phase === 'reassessing') {
    return (
      <div className="mt-6 flex items-center justify-center gap-3 py-8">
        <LoadingSpinner size="md" />
        <span className="text-base text-gray-600">追加情報をもとに再判定しています...</span>
      </div>
    );
  }

  // 完了
  if (phase === 'done') {
    return (
      <div className="mt-6 bg-green-50 border-2 border-green-300 rounded-xl p-4 text-center">
        <p className="text-green-700 font-bold text-base">✅ 追加情報をもとに判定を更新しました</p>
      </div>
    );
  }

  // 質問回答中
  const currentQuestion = questions[currentIndex];

  return (
    <div className="mt-6 space-y-4">
      {/* 回答済みの質問 */}
      {answers.map((a, i) => (
        <div key={i} className="space-y-2">
          <div className="bg-blue-50 rounded-xl p-4 ml-4">
            <p className="text-base font-medium text-gray-800">🤖 {questions[i].text}</p>
          </div>
          <div className="bg-gray-100 rounded-xl p-4 mr-4 text-right">
            <p className="text-base text-gray-800">{a.answer}</p>
          </div>
        </div>
      ))}

      {/* 現在の質問 */}
      <div className="bg-blue-50 rounded-xl p-4 ml-4">
        <p className="text-base font-medium text-gray-800">🤖 {currentQuestion.text}</p>
        <p className="text-xs text-gray-500 mt-1">質問 {currentIndex + 1} / {questions.length}</p>
      </div>

      {/* 回答UI */}
      {currentQuestion.type === 'select' && currentQuestion.options ? (
        <div className="grid grid-cols-2 gap-2">
          {currentQuestion.options.map(option => (
            <button key={option} onClick={() => handleAnswer(option)}
              className="p-3 border-2 border-gray-300 rounded-xl text-base font-medium hover:border-primary hover:bg-blue-50 transition-colors min-h-tap">
              {option}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex gap-2">
          <input type="text" value={textInput} onChange={(e) => setTextInput(e.target.value)}
            placeholder="回答を入力..."
            className="flex-1 border-2 border-gray-300 rounded-xl px-4 py-3 text-base focus:border-primary focus:outline-none" />
          <Button variant="primary" onClick={() => handleAnswer(textInput)} disabled={!textInput.trim()}>
            送信
          </Button>
        </div>
      )}

      {/* スキップ */}
      <button onClick={handleSkip} className="text-sm text-gray-500 underline block mx-auto">
        この質問をスキップ
      </button>
    </div>
  );
}
