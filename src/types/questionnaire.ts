export interface QuestionnaireData {
  location: string | null;              // のど, むね, おなか, etc.
  duration: string | null;              // 今日, 2-3日前, 1週間前, etc.
  symptoms: string[];                   // 痛い, しこり・ふくらみ, かゆい, etc.
  lumpSize?: string | null;             // 条件付き: 小さい（〜1cm）, 1〜3cm, 3cm以上
  conditions: string[];                 // なし, 血圧・心臓, 糖尿病, etc.
  medicine: string | null;              // のんでいる, のんでいない
  memo: string;                         // 自由記述
}

export const LOCATION_OPTIONS = [
  'のど',
  'むね',
  'おなか',
  'あし',
  'うで',
  'あたま',
  'かお',
  'せなか',
  'こし',
  'その他',
] as const;

export const DURATION_OPTIONS = [
  '今日',
  '2-3日前',
  '1週間前',
  '2週間前',
  '1ヶ月以上前',
] as const;

export const SYMPTOM_OPTIONS = [
  '痛い',
  'しこり・ふくらみ',
  'かゆい',
  '赤い・はれている',
  '熱がある',
  'せきが出る',
  '息苦しい',
  'めまいがする',
  'その他',
] as const;

export const LUMP_SIZE_OPTIONS = [
  '小さい（〜1cm）',
  '1〜3cm',
  '3cm以上',
] as const;

export const CONDITION_OPTIONS = [
  'なし',
  '血圧・心臓',
  '糖尿病',
  '腎臓',
  '肝臓',
  'がん',
  'アレルギー',
  'その他',
] as const;

export const MEDICINE_OPTIONS = [
  'のんでいる',
  'のんでいない',
] as const;
