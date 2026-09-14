import { createRng, pick, pickWeighted, randFloat, randInt, round2 } from '../lib/random';
import type { AccountBase } from './accounts';
import { AMOUNT_RANGE, CATEGORY_WEIGHTS, MERCHANTS, PAYEES, TYPE_CHANNEL } from './catalog';
import { CITY_WEIGHTS } from './cities';
import type { Account, AccountKind, CategoryKey, Txn, TxnStatus, TxnType } from './types';

const DAY = 86_400_000;
const SEED = 20260914;
/** 生成多久的历史流水 */
const HISTORY_DAYS = 40;

/** 各账户的交易占比——信用卡主卡最活跃 */
const ACCOUNT_WEIGHTS: ReadonlyArray<readonly [string, number]> = [
    ['credit-star', 38],
    ['debit-1', 30],
    ['debit-2', 24],
    ['credit-cloud', 8],
];

const TYPE_WEIGHTS: ReadonlyArray<readonly [TxnType, number]> = [
    ['pos', 56],
    ['online', 25],
    ['subscription', 6],
    ['transfer', 6],
    ['refund', 4],
    ['fee', 3],
];

export interface Dataset {
    accounts: Account[];
    txns: Txn[];
}

export function buildDataset(bases: readonly AccountBase[], now: number): Dataset {
    const rng = createRng(SEED);
    const txns = generateHistory(bases, now, rng);
    const accounts = bases.map((base) => enrich(base, txns, now));
    return { accounts, txns };
}

/* ------------------------------------------------------------------ */
/* 历史流水                                                            */
/* ------------------------------------------------------------------ */

function startOfDay(ts: number): number {
    const date = new Date(ts);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
}

function generateHistory(bases: readonly AccountBase[], now: number, rng: () => number): Txn[] {
    const out: Txn[] = [];
    const kindById = new Map(bases.map((base) => [base.id, base.kind] as const));
    const todayStart = startOfDay(now);
    let seq = 0;

    const add = (txn: Omit<Txn, 'id'>) => {
        seq += 1;
        out.push({ ...txn, id: `txn-${seq.toString().padStart(4, '0')}` });
    };

    for (let offset = HISTORY_DAYS - 1; offset >= 0; offset--) {
        const dayStart = todayStart - offset * DAY;
        const dayOfMonth = new Date(dayStart).getDate();

        /* ---- 每月固定事件（只补历史日，避免出现未来时间戳） ---- */
        if (offset > 0) {
            if (dayOfMonth === 10) {
                add({
                    accountId: 'debit-1',
                    ts: dayStart + 9.5 * 3_600_000,
                    type: 'income',
                    merchant: '晨曦薪金 · 工资代发',
                    category: 'other',
                    city: '北京',
                    amount: round2(randFloat(rng, 34_000, 42_000)),
                    status: 'success',
                    channel: '代发',
                });
            }
            if (dayOfMonth === 1) {
                add({
                    accountId: 'debit-1',
                    ts: dayStart + 10 * 3_600_000,
                    type: 'subscription',
                    merchant: '房租代扣',
                    category: 'housing',
                    city: '北京',
                    amount: -round2(randFloat(rng, 3200, 3800)),
                    status: 'success',
                    channel: '自动代扣',
                });
            }
            if (dayOfMonth === 25) {
                /* 还款是账户间划转：储蓄卡出账、信用卡入账，两边都要记。
                   只记一边的话，合成的净资产走势会把还款当成凭空消失的钱。 */
                const repayment = round2(randFloat(rng, 6200, 9800));
                add({
                    accountId: 'debit-1',
                    ts: dayStart + 8 * 3_600_000,
                    type: 'repay',
                    merchant: '星轨白金卡 · 自动还款',
                    category: 'other',
                    city: '北京',
                    amount: -repayment,
                    status: 'success',
                    channel: '自动还款',
                });
                add({
                    accountId: 'credit-star',
                    ts: dayStart + 8 * 3_600_000 + 1000,
                    type: 'repay',
                    merchant: '收到自动还款',
                    category: 'other',
                    city: '北京',
                    amount: repayment,
                    status: 'success',
                    channel: '自动还款',
                });
            }
            if (dayOfMonth === 15) {
                add({
                    accountId: 'credit-cloud',
                    ts: dayStart + 12 * 3_600_000,
                    type: 'subscription',
                    merchant: '云音乐订阅',
                    category: 'entertainment',
                    city: '北京',
                    amount: -28,
                    status: 'success',
                    channel: '自动代扣',
                });
            }
        }

        /* ---- 随机消费 ---- */
        const count = randInt(rng, 3, 7);
        for (let index = 0; index < count; index += 1) {
            const accountId = pickWeighted(rng, ACCOUNT_WEIGHTS);
            const kind = kindById.get(accountId) ?? 'debit1';
            const ts =
                offset === 0
                    ? now - randInt(rng, 4, 620) * 60_000 - randInt(rng, 0, 59) * 1000
                    : dayStart + randInt(rng, 7, 23) * 3_600_000 + randInt(rng, 0, 59) * 60_000;
            add(makeTxn(rng, accountId, kind, ts));
        }
    }

    return out.sort((a, b) => b.ts - a.ts);
}

function makeTxn(rng: () => number, accountId: string, kind: AccountKind, ts: number): Omit<Txn, 'id'> {
    const type = pickWeighted(rng, TYPE_WEIGHTS);
    const category: CategoryKey =
        type === 'pos' || type === 'online' ? pickWeighted(rng, CATEGORY_WEIGHTS) : 'other';
    const [low, high] = AMOUNT_RANGE[category];
    let amount = round2(randFloat(rng, low, high));
    // Ⅱ类账户以小额日常消费为主
    if (kind === 'debit2') amount = Math.min(amount, round2(randFloat(rng, 18, 880)));

    const roll = rng();
    const status: TxnStatus = roll > 0.985 ? 'failed' : roll > 0.945 ? 'pending' : 'success';
    const channel = pick(rng, TYPE_CHANNEL[type]);

    let merchant = pick(rng, MERCHANTS[category]);
    if (type === 'transfer') merchant = `转账 · ${pick(rng, PAYEES)}`;
    else if (type === 'fee') merchant = '账户管理费';
    else if (type === 'refund') merchant = `原路退回 · ${pick(rng, MERCHANTS[category])}`;

    const signed = type === 'refund' || type === 'income' ? amount : -amount;

    return {
        accountId,
        ts,
        type,
        merchant,
        category,
        city: pickWeighted(rng, CITY_WEIGHTS),
        amount: signed,
        status,
        channel,
    };
}

/* ------------------------------------------------------------------ */
/* 派生指标                                                            */
/* ------------------------------------------------------------------ */

function enrich(base: AccountBase, txns: readonly Txn[], now: number): Account {
    const mine = txns.filter((txn) => txn.accountId === base.id);
    const since = now - 30 * DAY;

    let monthSpend = 0;
    let monthIncome = 0;
    for (const txn of mine) {
        if (txn.ts < since) continue;
        if (txn.amount < 0) monthSpend += -txn.amount;
        else monthIncome += txn.amount;
    }

    const account: Account = {
        ...base,
        monthSpend: round2(monthSpend),
        monthIncome: round2(monthIncome),
        trend: buildTrend(base.kind, currentValue(base), mine, now),
        monthly: buildMonthly(base.id, currentValue(base), base.kind === 'credit' ? 0.24 : 0.07),
    };

    if (base.kind === 'debit2') {
        const todayStart = startOfDay(now);
        const today = mine
            .filter((txn) => txn.ts >= todayStart && txn.amount < 0)
            .reduce((sum, txn) => sum + -txn.amount, 0);
        const yearRng = createRng(base.id.length * 7919 + 13);
        account.usage = {
            today: round2(today),
            month: account.monthSpend,
            year: round2(account.monthSpend * randFloat(yearRng, 4.4, 5.4)),
        };
    }

    return account;
}

function currentValue(base: AccountBase): number {
    return base.kind === 'credit' ? (base.creditUsed ?? 0) : base.balance;
}

/** 从当前值反推每日日终值 */
function buildTrend(
    kind: AccountKind,
    current: number,
    txns: readonly Txn[],
    now: number,
    days = 30,
): number[] {
    const todayStart = startOfDay(now);
    const nets = new Array<number>(days).fill(0);

    for (const txn of txns) {
        const index = days - 1 - Math.floor((todayStart - startOfDay(txn.ts)) / DAY);
        if (index < 0 || index >= days) continue;
        nets[index] += txn.amount;
    }

    const sign = kind === 'credit' ? 1 : -1;
    const series = new Array<number>(days).fill(0);
    series[days - 1] = current;
    for (let index = days - 2; index >= 0; index -= 1) {
        series[index] = series[index + 1] + sign * nets[index + 1];
    }

    return series.map((value) => round2(Math.max(0, value)));
}

/** 近 12 个月期末值（历史不足，按当前值向前回溯模拟） */
function buildMonthly(seedKey: string, current: number, volatility: number): number[] {
    const rng = createRng(seedKey.length * 31 + 7);
    const values: number[] = [current];
    for (let index = 1; index < 12; index += 1) {
        const previous = values[values.length - 1];
        values.push(round2(Math.max(0, previous * (1 + randFloat(rng, -volatility, volatility * 0.65)))));
    }
    return values.reverse();
}
