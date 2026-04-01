import { NextRequest, NextResponse } from 'next/server';
import { genAI, GEMINI_MODEL, AI_TIMEOUT_MS } from '@/lib/gemini';

const FOLLOW_UP_PROMPT = `あなたは医療アクセスを支援するAIアシスタントです。
以下の症状情報をもとに、より詳しい判定をするための追加質問を2〜3個生成してください。

出力JSON構造（配列のみ返してください）:
[
  {
    "id": "q1",
    "text": "質問文",
    "type": "select",
    "options": ["選択肢1", "選択肢2", "選択肢3"]
  }
]

ルール:
- 必ず2〜3個の質問を生成
- type は "select"（選択式）または "text"（自由入力）
- select の場合は options に3〜5個の選択肢を含める
- 質問は症状の深掘りに有用なもの（痛みの場所の詳細、痛みの種類、関連症状など）
- シニア向けにわかりやすい日本語で
- 医療診断に該当する表現は避ける`;

export async function POST(request: NextRequest) {
  try {
    const { questionnaire, ai_result } = await request.json();

    if (!genAI) {
      return NextResponse.json({ questions: [] });
    }

    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    });

    const symptomSummary = [
      `部位: ${questionnaire.location?.join('、')}`,
      `期間: ${questionnaire.duration}`,
      `症状: ${questionnaire.symptoms?.join('、')}`,
      `持病: ${questionnaire.conditions?.join('、')}`,
      ai_result?.urgency ? `初回判定の緊急度: ${ai_result.urgency}` : '',
      ai_result?.recommended_departments ? `初回推奨診療科: ${ai_result.recommended_departments.join('、')}` : '',
    ].filter(Boolean).join('\n');

    const resultPromise = model.generateContent(
      FOLLOW_UP_PROMPT + '\n\n【現在の症状情報】\n' + symptomSummary
    );

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('タイムアウト')), AI_TIMEOUT_MS)
    );

    const result = await Promise.race([resultPromise, timeoutPromise]);
    const text = result.response.text();
    const questions = JSON.parse(text);

    // 最大3問に制限
    return NextResponse.json({ questions: questions.slice(0, 3) });
  } catch (error) {
    console.error('Follow-up question generation error:', error);
    return NextResponse.json({ questions: [] });
  }
}
