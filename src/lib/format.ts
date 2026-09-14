/** 金额隐藏时使用的占位符 */
export const MASK = '••••••';

/** 千分位金额，不带货币符号 */
export function formatAmount(
    value: number,
    options: { decimals?: number; sign?: boolean } = {},
): string {
    const { decimals = 2, sign = false } = options;
    const body = Math.abs(value).toLocaleString('zh-CN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
    if (!sign) return body;
    return `${value < 0 ? '−' : '+'}${body}`;
}

/** 需要时替换为掩码 */
export function maskValue(value: string, hidden: boolean): string {
    return hidden ? MASK : value;
}

/** 相对时间：刚刚 / N 分钟前 / N 小时前 */
export function relativeTime(timestamp: number, now = Date.now()): string {
    const diff = Math.max(0, now - timestamp);
    const minute = 60_000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) return '刚刚';
    if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`;
    if (diff < day) return `${Math.floor(diff / hour)} 小时前`;
    if (diff < 7 * day) return `${Math.floor(diff / day)} 天前`;
    return new Date(timestamp).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
}

/** 日志用紧凑时间戳：14:32:07 */
export function clockTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

/** 账期：09/01 */
export function shortDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
}
