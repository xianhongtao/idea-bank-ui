import type { Account } from './types';

export const KIND_LABEL: Record<Account['kind'], string> = {
    credit: '信用卡',
    debit1: 'Ⅰ类储蓄卡',
    debit2: 'Ⅱ类储蓄卡',
};

export const STATUS_LABEL: Record<Account['status'], string> = {
    normal: '正常',
    due: '待还款',
    frozen: '已冻结',
};

export const STATUS_TONE: Record<Account['status'], 'pos' | 'warn' | 'neg'> = {
    normal: 'pos',
    due: 'warn',
    frozen: 'neg',
};
