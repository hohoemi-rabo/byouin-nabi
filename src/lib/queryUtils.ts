/**
 * クエリ文字列のユーティリティ関数
 */

/**
 * カンマ区切りの文字列を配列に変換
 * @param value - カンマ区切りの文字列（null可）
 * @returns トリムされた空でない文字列の配列
 */
export function parseCommaSeparatedList(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

/**
 * 配列をカンマ区切りの文字列に変換
 * @param values - 文字列の配列
 * @returns カンマ区切りの文字列（空配列の場合は空文字列）
 */
export function toCommaSeparatedString(values: string[]): string {
  return values.filter(Boolean).join(',');
}

/**
 * 配列のトグル処理（要素があれば削除、なければ追加）
 * @param array - 対象の配列
 * @param item - トグルする要素
 * @returns 新しい配列
 */
export function toggleArrayItem<T>(array: T[], item: T): T[] {
  return array.includes(item)
    ? array.filter(x => x !== item)
    : [...array, item];
}
