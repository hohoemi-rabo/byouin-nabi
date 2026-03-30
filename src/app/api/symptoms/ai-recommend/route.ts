import { NextRequest, NextResponse } from 'next/server';
import { genAI, GEMINI_MODEL, AI_TIMEOUT_MS } from '@/lib/gemini';
import { getDepartments } from '@/lib/departmentMapping';
import { fallbackUrgency } from '@/lib/fallbackUrgency';
import { ALL_DEPARTMENTS } from '@/lib/masterData';
import type { AIRecommendResponse } from '@/types/ai';

const SYSTEM_PROMPT = `あなたは南信州地域の医療アクセスを支援するAIアシスタントです。
以下の症状情報を分析し、JSON形式で回答してください。

出力JSON構造:
{
  "urgency": "emergency" | "soon" | "watch",
  "urgency_reason": "緊急度の判定理由（1〜2文）",
  "recommended_departments": ["診療科1", "診療科2"],
  "department_reason": "診療科推奨の理由（1〜2文）",
  "advice": "受診までの注意点（2〜3文）",
  "disclaimer": "※この判定は医療診断ではありません。症状が重い場合はすぐに119番に電話してください。"
}

注意:
- 必ずJSONのみを返してください
- 緊急度は安全側（高め）に判定してください
- 推奨診療科は以下の20科から選択してください: ${ALL_DEPARTMENTS.join('、')}
- 医療行為や診断に該当する表現は避けてください`;

function buildUserPrompt(body: {
  questionnaire: {
    location: string[];
    duration: string | null;
    symptoms: string[];
    lumpSize?: string | null;
    conditions: string[];
    medicine: string | null;
    memo: string;
  };
  age_group?: string;
  area?: string;
}): string {
  const q = body.questionnaire;
  const parts = [
    `【部位】${q.location.join('、')}`,
    `【期間】${q.duration}`,
    `【症状】${q.symptoms.join('、')}`,
  ];
  if (q.lumpSize) parts.push(`【しこりの大きさ】${q.lumpSize}`);
  parts.push(`【持病】${q.conditions.join('、')}`);
  parts.push(`【服薬】${q.medicine || 'なし'}`);
  if (q.memo) parts.push(`【メモ】${q.memo}`);
  if (body.age_group) parts.push(`【年齢層】${body.age_group}`);
  if (body.area) parts.push(`【居住エリア】${body.area}`);
  return parts.join('\n');
}

function buildFallbackResponse(
  symptoms: string[],
  locations: string[]
): AIRecommendResponse {
  const urgency = fallbackUrgency(symptoms);
  const departments = getDepartments(locations, symptoms);

  const reasonMap = {
    emergency: '息苦しさやめまいなど、緊急性の高い症状が含まれています。',
    soon: '発熱や痛みがあるため、早めの受診をおすすめします。',
    watch: '現時点で緊急性は高くありませんが、症状が続く場合は受診してください。',
  };

  return {
    urgency,
    urgency_reason: reasonMap[urgency],
    recommended_departments: departments,
    department_reason: `選択された部位（${locations.join('、')}）と症状から判定しました。`,
    advice: urgency === 'emergency'
      ? '症状が重い場合はすぐに119番に電話してください。無理に動かず、安静にしてください。'
      : '受診前に保険証と服用中の薬があれば準備してください。症状の変化を記録しておくと医師に伝えやすくなります。',
    disclaimer: '※この判定は医療診断ではありません。症状が重い場合はすぐに119番に電話してください。',
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questionnaire } = body;

    // バリデーション
    if (!questionnaire?.location || !Array.isArray(questionnaire.location) || questionnaire.location.length === 0) {
      return NextResponse.json({ error: '部位が選択されていません' }, { status: 400 });
    }
    if (!questionnaire.duration) {
      return NextResponse.json({ error: '期間が選択されていません' }, { status: 400 });
    }

    // Gemini API が利用不可の場合はフォールバック
    if (!genAI) {
      const fallback = buildFallbackResponse(questionnaire.symptoms || [], questionnaire.location);
      return NextResponse.json({ ...fallback, source: 'fallback' });
    }

    // Gemini API 呼び出し（タイムアウト付き）
    try {
      const model = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      });

      const userPrompt = buildUserPrompt(body);

      const resultPromise = model.generateContent(
        SYSTEM_PROMPT + '\n\n' + userPrompt
      );

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI応答タイムアウト')), AI_TIMEOUT_MS)
      );

      const result = await Promise.race([resultPromise, timeoutPromise]);
      const text = result.response.text();
      const parsed: AIRecommendResponse = JSON.parse(text);

      // 診療科のバリデーション（マスターリストにない科を除外）
      const deptSet = new Set(ALL_DEPARTMENTS as readonly string[]);
      parsed.recommended_departments = parsed.recommended_departments.filter(d => deptSet.has(d));
      if (parsed.recommended_departments.length === 0) {
        parsed.recommended_departments = ['内科'];
      }

      return NextResponse.json({ ...parsed, source: 'ai' });
    } catch (aiError) {
      console.error('Gemini API error, falling back:', aiError);
      const fallback = buildFallbackResponse(questionnaire.symptoms || [], questionnaire.location);
      return NextResponse.json({ ...fallback, source: 'fallback' });
    }
  } catch (error) {
    console.error('AI recommend error:', error);
    return NextResponse.json({ error: 'AI推奨の取得に失敗しました' }, { status: 500 });
  }
}
