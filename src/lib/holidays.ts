import * as holidayJp from '@holiday-jp/holiday_jp';

/**
 * 指定日が日本の祝日かどうかを判定（振替休日も含む）
 */
export function isJapaneseHoliday(date: Date): boolean {
  return holidayJp.isHoliday(date);
}

/**
 * 指定日が「休日扱い」（日曜 OR 祝日）かどうかを判定
 * 夜間急患診療所の昼間枠生成に使用
 */
export function isHolidayOrSunday(date: Date): boolean {
  return date.getDay() === 0 || isJapaneseHoliday(date);
}
