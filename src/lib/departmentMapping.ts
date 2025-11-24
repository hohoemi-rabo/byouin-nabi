/**
 * 症状部位から推奨診療科へのマッピングテーブル
 * アンケートの選択肢（LOCATION_OPTIONS）に対応
 */
export const DEPARTMENT_MAPPING: Record<string, string[]> = {
  'のど': ['耳鼻いんこう科', '内科'],
  'むね': ['内科', '循環器内科', '呼吸器内科'],
  'おなか': ['内科', '消化器内科', '外科'],
  'あし': ['整形外科', '内科'],
  'うで': ['整形外科', '内科'],
  'あたま': ['内科', '脳神経外科', '神経内科'],
  'かお': ['皮膚科', '耳鼻いんこう科', '内科'],
  'せなか': ['整形外科', '内科'],
  'こし': ['整形外科', '内科'],
  'その他': ['内科'],
};

/**
 * 緊急性の高い症状のリスト
 */
const EMERGENCY_SYMPTOMS = [
  '息苦しい',
  '熱がある',
  'めまいがする',
];

/**
 * 皮膚関連の症状リスト
 */
const SKIN_SYMPTOMS = [
  'かゆい',
  '赤い・はれている',
  'しこり・ふくらみ',
];

/**
 * 症状部位と症状から推奨される診療科を判定する
 * @param location 症状部位
 * @param symptoms 症状リスト
 * @returns 推奨診療科のリスト（優先順位付き）
 */
export function getDepartments(location: string, symptoms: string[]): string[] {
  // 基本的なマッピングから診療科を取得
  let departments = [...(DEPARTMENT_MAPPING[location] || ['内科'])];

  // 緊急性の高い症状がある場合、内科を最優先にする
  const hasEmergency = symptoms.some(s => EMERGENCY_SYMPTOMS.includes(s));
  if (hasEmergency && !departments.includes('内科')) {
    departments = ['内科', ...departments];
  } else if (hasEmergency && departments[0] !== '内科') {
    // 内科を最優先に移動
    departments = ['内科', ...departments.filter(d => d !== '内科')];
  }

  // 皮膚関連の症状がある場合、皮膚科を追加
  const hasSkinSymptom = symptoms.some(s => SKIN_SYMPTOMS.includes(s));
  if (hasSkinSymptom && !departments.includes('皮膚科')) {
    // 内科の次に皮膚科を追加
    const internalIndex = departments.indexOf('内科');
    if (internalIndex !== -1) {
      departments.splice(internalIndex + 1, 0, '皮膚科');
    } else {
      departments.push('皮膚科');
    }
  }

  // 重複を除去して返す
  return Array.from(new Set(departments));
}

/**
 * 診療科リストを日本語の読みやすい形式に整形
 * @param departments 診療科リスト
 * @returns 整形された文字列（例：「内科、整形外科」）
 */
export function formatDepartments(departments: string[]): string {
  return departments.join('、');
}
