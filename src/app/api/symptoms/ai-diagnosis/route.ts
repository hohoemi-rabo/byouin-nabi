import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const AI_ENABLED = process.env.NEXT_PUBLIC_AI_DIAGNOSIS === 'true';

const openai = AI_ENABLED
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

export async function POST(request: NextRequest) {
  // 機能が無効化されている場合
  if (!AI_ENABLED) {
    return NextResponse.json(
      { error: 'AI診断機能は現在利用できません' },
      { status: 403 }
    );
  }

  if (!openai) {
    return NextResponse.json(
      { error: 'OpenAI APIが設定されていません' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { location, duration, symptoms, conditions, medicine, memo } = body;

    // バリデーション
    if (!location || !duration) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      );
    }

    const prompt = `あなたは経験豊富な医療アドバイザーです。
以下の症状情報から、可能性のある疾患や受診のアドバイスを提供してください。

【症状情報】
- 部位: ${location}
- 期間: ${duration}
- 症状: ${symptoms && symptoms.length > 0 ? symptoms.join('、') : 'なし'}
- 持病: ${conditions && conditions.length > 0 ? conditions.join('、') : 'なし'}
- 服薬: ${medicine || 'なし'}
- メモ: ${memo || 'なし'}

【回答形式】
以下の形式で回答してください：

◆考えられる可能性（3つまで）
1. ...
2. ...
3. ...

◆緊急度：[高/中/低]
- [緊急度の説明]

◆推奨診療科
- [診療科名]

◆受診時の注意点
- [注意点1]
- [注意点2]

◆日常生活でのケア
- [ケア方法1]
- [ケア方法2]

重要：これは医学的診断ではなく、参考情報です。必ず医師の診察を受けてください。`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const analysis = completion.choices[0].message.content;

    if (!analysis) {
      throw new Error('AI応答が空です');
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('AI diagnosis error:', error);

    // OpenAI APIエラーの詳細をログに記録
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }

    return NextResponse.json(
      { error: 'AI診断の取得に失敗しました' },
      { status: 500 }
    );
  }
}
