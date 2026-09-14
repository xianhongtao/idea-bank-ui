export const DAY = 86_400_000;

/** 当天零点的时间戳 */
export function startOfDay(ts: number): number {
    const date = new Date(ts);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
}

/** 周一为一周之始，返回该周周一的零点 */
export function startOfWeek(ts: number): number {
    const day = startOfDay(ts);
    const weekday = (new Date(day).getDay() + 6) % 7; // 0 = 周一
    return day - weekday * DAY;
}

/** 0 = 周一 … 6 = 周日 */
export function weekdayIndex(ts: number): number {
    return (new Date(ts).getDay() + 6) % 7;
}

export function formatMonthDay(ts: number): string {
    const date = new Date(ts);
    return `${date.getMonth() + 1}/${date.getDate()}`;
}
