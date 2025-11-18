import type { QuestionnaireData } from '@/types/questionnaire';

export function generateSymptomDescription(data: QuestionnaireData): string {
  let description = '';

  // 【症状について】セクション
  description += '【症状について】\n';
  description += `${data.location}が気になります。\n`;

  if (data.symptoms.length > 0) {
    description += `症状は「${data.symptoms.join('、')}」があります。\n`;
  }

  // 【いつから】セクション
  description += '\n【いつから】\n';
  description += `「${data.duration}」から続いています。\n`;

  // 【状態】セクション
  description += '\n【状態】\n';
  description += `・痛み：${data.symptoms.includes('痛い') ? 'あり' : 'なし'}\n`;

  // しこり・ふくらみの情報
  const hasLump = data.symptoms.includes('しこり・ふくらみ');
  description += `・しこり：${hasLump ? 'あり' : 'なし'}`;
  if (hasLump && data.lumpSize) {
    description += `（大きさ：${data.lumpSize}）`;
  }
  description += '\n';

  description += `・発熱：${data.symptoms.includes('熱がある') ? 'あり' : 'なし'}\n`;
  description += `・かゆみ：${data.symptoms.includes('かゆい') ? 'あり' : 'なし'}\n`;
  description += `・赤み・はれ：${data.symptoms.includes('赤い・はれている') ? 'あり' : 'なし'}\n`;
  description += `・せき：${data.symptoms.includes('せきが出る') ? 'あり' : 'なし'}\n`;
  description += `・息苦しさ：${data.symptoms.includes('息苦しい') ? 'あり' : 'なし'}\n`;
  description += `・めまい：${data.symptoms.includes('めまいがする') ? 'あり' : 'なし'}\n`;

  // 【持病・薬】セクション
  description += '\n【持病・薬】\n';

  if (data.conditions.length > 0) {
    description += `持病：${data.conditions.join('、')}\n`;
  } else {
    description += '持病：なし\n';
  }

  description += `薬：${data.medicine}\n`;

  // 【本人のメモ】セクション（任意）
  if (data.memo && data.memo.trim() !== '') {
    description += '\n【本人のメモ】\n';
    description += data.memo + '\n';
  }

  // 免責事項
  description += '\n━━━━━━━━━━━━━━━━━━━━\n';
  description += '※この内容は参考情報です。診断ではありません。\n';
  description += '　必ず医師の診察を受けてください。\n';
  description += '━━━━━━━━━━━━━━━━━━━━';

  return description;
}
