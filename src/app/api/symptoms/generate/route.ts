import { NextRequest, NextResponse } from 'next/server';
import { generateSymptomDescription } from '@/lib/generateSymptomDescription';
import type { QuestionnaireData } from '@/types/questionnaire';

export async function POST(request: NextRequest) {
  try {
    const body: QuestionnaireData = await request.json();

    // バリデーション
    if (!body.location || body.location.length === 0) {
      return NextResponse.json(
        { error: 'どこが気になるか選択してください' },
        { status: 400 }
      );
    }

    if (!body.duration) {
      return NextResponse.json(
        { error: 'いつからか選択してください' },
        { status: 400 }
      );
    }

    if (!body.symptoms || body.symptoms.length === 0) {
      return NextResponse.json(
        { error: 'どんな状態か選択してください' },
        { status: 400 }
      );
    }

    if (body.symptoms.includes('しこり・ふくらみ') && !body.lumpSize) {
      return NextResponse.json(
        { error: 'しこりの大きさを選択してください' },
        { status: 400 }
      );
    }

    if (!body.conditions || body.conditions.length === 0) {
      return NextResponse.json(
        { error: '持病を選択してください（なしも含む）' },
        { status: 400 }
      );
    }

    if (!body.medicine) {
      return NextResponse.json(
        { error: '薬の服用について選択してください' },
        { status: 400 }
      );
    }

    // 症状説明文を生成
    const description = generateSymptomDescription(body);

    return NextResponse.json({ description });
  } catch (error) {
    console.error('Symptom generation error:', error);
    return NextResponse.json(
      { error: '症状説明文の生成に失敗しました' },
      { status: 500 }
    );
  }
}
