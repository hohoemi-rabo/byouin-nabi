'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuestionnaire } from '@/context/QuestionnaireContext';
import QuestionOption from './QuestionOption';
import Button from '@/components/Common/Button';
import {
  LOCATION_OPTIONS,
  DURATION_OPTIONS,
  SYMPTOM_OPTIONS,
  LUMP_SIZE_OPTIONS,
  CONDITION_OPTIONS,
  MEDICINE_OPTIONS,
} from '@/types/questionnaire';

export default function QuestionnaireForm() {
  const router = useRouter();
  const {
    data,
    updateLocation,
    updateDuration,
    updateSymptoms,
    updateLumpSize,
    updateConditions,
    updateMedicine,
    updateMemo,
    resetData,
  } = useQuestionnaire();

  const [errors, setErrors] = useState<string[]>([]);

  // 最初からやり直す
  const handleReset = () => {
    if (confirm('入力内容がすべてクリアされます。よろしいですか？')) {
      resetData();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 症状の選択/解除
  const handleSymptomToggle = (symptom: string) => {
    const newSymptoms = data.symptoms.includes(symptom)
      ? data.symptoms.filter(s => s !== symptom)
      : [...data.symptoms, symptom];
    updateSymptoms(newSymptoms);

    // 「しこり・ふくらみ」が解除されたら、lumpSizeもリセット
    if (!newSymptoms.includes('しこり・ふくらみ')) {
      updateLumpSize(null);
    }
  };

  // 持病の選択/解除
  const handleConditionToggle = (condition: string) => {
    if (condition === 'なし') {
      // 「なし」が選択されたら、他の選択肢をすべて解除
      updateConditions(['なし']);
    } else {
      // 他の選択肢が選択されたら、「なし」を解除
      const newConditions = data.conditions.includes(condition)
        ? data.conditions.filter(c => c !== condition)
        : [...data.conditions.filter(c => c !== 'なし'), condition];
      updateConditions(newConditions);
    }
  };

  // バリデーション
  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!data.location) {
      newErrors.push('どこが気になるか選択してください');
    }
    if (!data.duration) {
      newErrors.push('いつからか選択してください');
    }
    if (data.symptoms.length === 0) {
      newErrors.push('どんな状態か選択してください');
    }
    if (data.symptoms.includes('しこり・ふくらみ') && !data.lumpSize) {
      newErrors.push('しこりの大きさを選択してください');
    }
    if (data.conditions.length === 0) {
      newErrors.push('持病を選択してください（なしも含む）');
    }
    if (!data.medicine) {
      newErrors.push('薬の服用について選択してください');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      router.push('/results');
    } else {
      // エラーメッセージの位置までスクロール
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* 最初からやり直すボタン */}
      <div className="mb-8 text-right">
        <Button
          type="button"
          variant="secondary"
          onClick={handleReset}
          className="text-base"
        >
          🔄 最初からやり直す
        </Button>
      </div>

      {/* エラーメッセージ */}
      {errors.length > 0 && (
        <div className="mb-8 p-6 bg-error/10 border-2 border-error rounded-lg">
          <h3 className="text-xl font-bold text-error mb-3">
            入力内容を確認してください
          </h3>
          <ul className="list-disc list-inside space-y-2 text-error">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <form className="space-y-12">
        {/* Q1: どこが気になりますか？ */}
        <section>
          <h2 className="text-2xl font-bold mb-4">
            <span className="text-primary">Q1.</span> どこが気になりますか？
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {LOCATION_OPTIONS.map((location) => (
              <QuestionOption
                key={location}
                value={location}
                label={location}
                selected={data.location === location}
                onSelect={updateLocation}
              />
            ))}
          </div>
        </section>

        {/* Q2: いつからですか？ */}
        <section>
          <h2 className="text-2xl font-bold mb-4">
            <span className="text-primary">Q2.</span> いつからですか？
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DURATION_OPTIONS.map((duration) => (
              <QuestionOption
                key={duration}
                value={duration}
                label={duration}
                selected={data.duration === duration}
                onSelect={updateDuration}
              />
            ))}
          </div>
        </section>

        {/* Q3: どんな状態ですか？ */}
        <section>
          <h2 className="text-2xl font-bold mb-4">
            <span className="text-primary">Q3.</span> どんな状態ですか？
            <span className="text-sm text-gray-600 ml-2">（複数選択可）</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SYMPTOM_OPTIONS.map((symptom) => (
              <QuestionOption
                key={symptom}
                value={symptom}
                label={symptom}
                selected={data.symptoms.includes(symptom)}
                onSelect={handleSymptomToggle}
                multiSelect
              />
            ))}
          </div>
        </section>

        {/* Q4: 大きさ（条件付き） */}
        {data.symptoms.includes('しこり・ふくらみ') && (
          <section>
            <h2 className="text-2xl font-bold mb-4">
              <span className="text-primary">Q4.</span> しこりの大きさはどれくらいですか？
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {LUMP_SIZE_OPTIONS.map((size) => (
                <QuestionOption
                  key={size}
                  value={size}
                  label={size}
                  selected={data.lumpSize === size}
                  onSelect={updateLumpSize}
                />
              ))}
            </div>
          </section>
        )}

        {/* Q5: 持病 */}
        <section>
          <h2 className="text-2xl font-bold mb-4">
            <span className="text-primary">Q5.</span> 持病はありますか？
            <span className="text-sm text-gray-600 ml-2">（複数選択可）</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CONDITION_OPTIONS.map((condition) => (
              <QuestionOption
                key={condition}
                value={condition}
                label={condition}
                selected={data.conditions.includes(condition)}
                onSelect={handleConditionToggle}
                multiSelect
              />
            ))}
          </div>
        </section>

        {/* Q6: 薬 */}
        <section>
          <h2 className="text-2xl font-bold mb-4">
            <span className="text-primary">Q6.</span> 薬をのんでいますか？
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MEDICINE_OPTIONS.map((medicine) => (
              <QuestionOption
                key={medicine}
                value={medicine}
                label={medicine}
                selected={data.medicine === medicine}
                onSelect={updateMedicine}
              />
            ))}
          </div>
        </section>

        {/* Q7: 自由メモ */}
        <section>
          <h2 className="text-2xl font-bold mb-4">
            <span className="text-primary">Q7.</span> 他に伝えたいことはありますか？
            <span className="text-sm text-gray-600 ml-2">（任意）</span>
          </h2>
          <textarea
            value={data.memo}
            onChange={(e) => updateMemo(e.target.value)}
            placeholder="例：夜になると痛みが強くなります"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none min-h-[120px] text-lg"
            rows={5}
          />
        </section>

        {/* まとめるボタン */}
        <div className="text-center pt-8">
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            className="text-xl px-16 py-6"
          >
            まとめる
          </Button>
        </div>
      </form>
    </div>
  );
}
