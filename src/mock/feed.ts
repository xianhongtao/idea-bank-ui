import { createRng, pick, pickWeighted, randFloat, round2 } from '../lib/random';
import { AMOUNT_RANGE, CATEGORY_WEIGHTS, MERCHANTS, PAYEES, TYPE_CHANNEL } from './catalog';
import { CITY_WEIGHTS } from './cities';
import type { Account, Txn, TxnStatus, TxnType } from './types';

/** 实时事件以小额消费为主，偶发转账/退款 */
const LIVE_TYPE_WEIGHTS: ReadonlyArray<readonly [TxnType, number]> = [
    ['pos', 62],
    ['online', 23],
    ['transfer', 6],
    ['refund', 3],
    ['subscription', 3],
    ['fee', 3],
];

let counter = 0;

/** 生成一条「刚刚发生」的流水，用于模拟实时推送 */
export function makeLiveTxn(accounts: readonly Account[], now: number): Txn {
    counter += 1;
    const rng = createRng((now ^ Math.imul(counter, 2654435761)) >>> 0);

    const account = pick(rng, accounts);
    const type = pickWeighted(rng, LIVE_TYPE_WEIGHTS);
    const category =
        type === 'pos' || type === 'online' ? pickWeighted(rng, CATEGORY_WEIGHTS) : 'other';

    const [low, high] = AMOUNT_RANGE[category];
    let amount = round2(randFloat(rng, low, high));
    if (account.kind === 'debit2') amount = Math.min(amount, round2(randFloat(rng, 18, 880)));

    const status: TxnStatus = rng() > 0.94 ? 'pending' : 'success';

    let merchant = pick(rng, MERCHANTS[category]);
    if (type === 'transfer') merchant = `转账 · ${pick(rng, PAYEES)}`;
    else if (type === 'fee') merchant = '账户管理费';

    return {
        id: `live-${now}-${counter}`,
        accountId: account.id,
        ts: now,
        type,
        merchant,
        category,
        city: pickWeighted(rng, CITY_WEIGHTS),
        amount: type === 'refund' ? amount : -amount,
        status,
        channel: pick(rng, TYPE_CHANNEL[type]),
    };
}
