import { BASE_ACCOUNTS } from './accounts';
import { buildDataset } from './generator';

/** 数据集基准时间——整个 demo 的「现在」 */
export const SEED_NOW = Date.now();

const dataset = buildDataset(BASE_ACCOUNTS, SEED_NOW);

export const INITIAL_ACCOUNTS = dataset.accounts;
export const INITIAL_TXNS = dataset.txns;
