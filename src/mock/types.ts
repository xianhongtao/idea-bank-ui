/** 账户类型：信用卡 / Ⅰ类储蓄卡 / Ⅱ类储蓄卡 */
export type AccountKind = 'credit' | 'debit1' | 'debit2';

/** Ⅱ类账户的监管上限 */
export interface AccountCaps {
    single: number;
    daily: number;
    annual: number;
}

/** 当期已用额度 */
export interface AccountUsage {
    today: number;
    month: number;
    year: number;
}

export interface Installment {
    id: string;
    title: string;
    totalPeriods: number;
    paidPeriods: number;
    perPeriod: number;
    nextDate: string;
}

/** 用户可为单个账户调整的规则 */
export interface AccountSettings {
    singleLimit: number;
    dailyLimit: number;
    monthlyLimit: number;
    overseas: boolean;
    contactless: boolean;
    online: boolean;
    autoRepay: boolean;
    nightLock: boolean;
    alertEnabled: boolean;
    /** 超过该金额提醒（元） */
    alertThreshold: number;
}

export interface Account {
    id: string;
    bank: string;
    kind: AccountKind;
    /** 产品名 */
    product: string;
    /** 卡号后四位 */
    tail: string;
    /** 储蓄账户余额 */
    balance: number;
    /** 信用卡总额度 */
    creditLimit?: number;
    /** 信用卡已用额度 */
    creditUsed?: number;
    /** 本期应还 */
    statementDue?: number;
    /** 最低还款额 */
    minPayment?: number;
    statementDay?: number;
    dueDay?: number;
    /** 是否已开自动还款 */
    autoRepay?: boolean;
    caps?: AccountCaps;
    usage?: AccountUsage;
    status: 'normal' | 'due' | 'frozen';
    /** 近 30 天日终余额（信用卡为已用额度） */
    trend: number[];
    /** 近 30 天支出合计 */
    monthSpend: number;
    /** 近 30 天入账合计 */
    monthIncome: number;
    /** 近 12 个月期末余额/已用额度 */
    monthly: number[];
    installments?: Installment[];
    /** 当前生效的账户规则 */
    settings: AccountSettings;
}

export type TxnType =
    | 'pos'
    | 'online'
    | 'transfer'
    | 'income'
    | 'refund'
    | 'subscription'
    | 'fee'
    | 'repay'
    | 'config';

export type TxnStatus = 'success' | 'pending' | 'failed';

export type CategoryKey =
    | 'dining'
    | 'transport'
    | 'shopping'
    | 'groceries'
    | 'entertainment'
    | 'utilities'
    | 'housing'
    | 'medical'
    | 'travel'
    | 'other';

export interface Txn {
    id: string;
    accountId: string;
    ts: number;
    type: TxnType;
    merchant: string;
    category: CategoryKey;
    city: string;
    /** 负数=支出，正数=入账 */
    amount: number;
    status: TxnStatus;
    /** 渠道：扫码 / NFC 闪付 / 线上支付 … */
    channel: string;
    /** config 类事件的说明文字 */
    note?: string;
}
