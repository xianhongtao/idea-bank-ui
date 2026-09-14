import { CATEGORY_LABEL } from '../../mock/catalog';
import type { Account, CategoryKey, Txn } from '../../mock/types';
import { round2 } from '../../lib/random';
import { DAY, startOfDay } from '../../lib/time';

export interface DailyFlow {
    ts: number;
    spend: number;
    income: number;
    net: number;
}

export interface CategorySlice {
    key: CategoryKey;
    label: string;
    value: number;
    share: number;
}

export interface CitySpend {
    city: string;
    value: number;
    count: number;
}

export interface HeatDay {
    ts: number;
    value: number;
    future: boolean;
}

export interface HeatWeek {
    days: HeatDay[];
}

/** 还款属于账户间内部划转，计入支出会与刷卡消费重复计算 */
function isCounted(txn: Txn): boolean {
    return txn.type !== 'config' && txn.type !== 'repay';
}

/** 按天聚合的收支 */
export function buildDailyFlow(txns: readonly Txn[], days: number, now: number): DailyFlow[] {
    const today = startOfDay(now);
    const buckets: DailyFlow[] = [];

    for (let offset = days - 1; offset >= 0; offset -= 1) {
        buckets.push({ ts: today - offset * DAY, spend: 0, income: 0, net: 0 });
    }

    const indexByDay = new Map(buckets.map((bucket, index) => [bucket.ts, index] as const));

    for (const txn of txns) {
        if (!isCounted(txn)) continue;
        const index = indexByDay.get(startOfDay(txn.ts));
        if (index === undefined) continue;
        const bucket = buckets[index];
        if (txn.amount < 0) bucket.spend += -txn.amount;
        else bucket.income += txn.amount;
    }

    for (const bucket of buckets) {
        bucket.spend = round2(bucket.spend);
        bucket.income = round2(bucket.income);
        bucket.net = round2(bucket.income - bucket.spend);
    }

    return buckets;
}

/** 支出分类占比，按金额降序 */
export function buildCategorySlices(
    txns: readonly Txn[],
    days: number,
    now: number,
): CategorySlice[] {
    const since = startOfDay(now) - (days - 1) * DAY;
    const totals = new Map<CategoryKey, number>();

    for (const txn of txns) {
        if (!isCounted(txn) || txn.amount >= 0 || txn.ts < since) continue;
        totals.set(txn.category, (totals.get(txn.category) ?? 0) + -txn.amount);
    }

    const total = [...totals.values()].reduce((sum, value) => sum + value, 0);
    if (total === 0) return [];

    return [...totals]
        .map(([key, value]) => ({
            key,
            label: CATEGORY_LABEL[key],
            value: round2(value),
            share: value / total,
        }))
        .sort((a, b) => b.value - a.value);
}

/** 城市消费排行（仅统计支出） */
export function buildCitySpend(txns: readonly Txn[], days: number, now: number): CitySpend[] {
    const since = startOfDay(now) - (days - 1) * DAY;
    const map = new Map<string, { value: number; count: number }>();

    for (const txn of txns) {
        if (!isCounted(txn) || txn.amount >= 0 || txn.ts < since) continue;
        const entry = map.get(txn.city) ?? { value: 0, count: 0 };
        entry.value += -txn.amount;
        entry.count += 1;
        map.set(txn.city, entry);
    }

    return [...map]
        .map(([city, entry]) => ({ city, value: round2(entry.value), count: entry.count }))
        .sort((a, b) => b.value - a.value);
}

/** 周 × 星期的支出热力网格（周一开头） */
export function buildHeatmap(txns: readonly Txn[], weeks: number, now: number): HeatWeek[] {
    const today = startOfDay(now);
    const weekday = (new Date(today).getDay() + 6) % 7;
    const start = today - (weekday + (weeks - 1) * 7) * DAY;

    const totals = new Map<number, number>();
    for (const txn of txns) {
        if (!isCounted(txn) || txn.amount >= 0) continue;
        const key = startOfDay(txn.ts);
        totals.set(key, (totals.get(key) ?? 0) + -txn.amount);
    }

    const out: HeatWeek[] = [];
    for (let week = 0; week < weeks; week += 1) {
        const days: HeatDay[] = [];
        for (let day = 0; day < 7; day += 1) {
            const ts = start + (week * 7 + day) * DAY;
            days.push({ ts, value: round2(totals.get(ts) ?? 0), future: ts > today });
        }
        out.push({ days });
    }

    return out;
}

/** 把一组数值映射到 0-4 的热力等级 */
export function heatLevel(value: number, max: number): number {
    if (value <= 0 || max <= 0) return 0;
    const ratio = value / max;
    if (ratio <= 0.15) return 1;
    if (ratio <= 0.35) return 2;
    if (ratio <= 0.65) return 3;
    return 4;
}

/* ------------------------------------------------------------------ */
/* 总览级指标                                                          */
/* ------------------------------------------------------------------ */

export interface Overview {
    /** 净资产逐日序列（储蓄余额 − 信用卡已用） */
    netSeries: number[];
    net: number;
    /** 近 30 天净资产变化 */
    delta: number;
    savings: number;
    creditUsed: number;
    creditLimit: number;
    savingsCount: number;
    creditCount: number;
}

/**
 * 净资产走势由各账户的日终序列合成——
 * 储蓄卡取余额，信用卡取已用额度并取负，两者本来就是同一套坐标（都是日终值）。
 */
export function buildOverview(accounts: readonly Account[]): Overview {
    const savingsAccounts = accounts.filter((account) => account.kind !== 'credit');
    const creditAccounts = accounts.filter((account) => account.kind === 'credit');

    const savings = savingsAccounts.reduce((sum, account) => sum + account.balance, 0);
    const creditUsed = creditAccounts.reduce((sum, account) => sum + (account.creditUsed ?? 0), 0);
    const creditLimit = creditAccounts.reduce((sum, account) => sum + (account.creditLimit ?? 0), 0);

    const length = accounts.reduce((max, account) => Math.max(max, account.trend.length), 0);
    const netSeries: number[] = [];

    for (let index = 0; index < length; index += 1) {
        let value = 0;
        for (const account of accounts) {
            const point = account.trend[index] ?? account.trend[account.trend.length - 1] ?? 0;
            value += account.kind === 'credit' ? -point : point;
        }
        netSeries.push(round2(value));
    }

    const net = round2(savings - creditUsed);
    const first = netSeries[0] ?? net;

    return {
        netSeries,
        net,
        delta: round2(net - first),
        savings: round2(savings),
        creditUsed: round2(creditUsed),
        creditLimit,
        savingsCount: savingsAccounts.length,
        creditCount: creditAccounts.length,
    };
}
