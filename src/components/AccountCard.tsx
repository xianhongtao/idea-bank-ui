import { Amount } from '../components/Amount';
import { Pill } from '../components/Pill';
import { Sparkline } from '../components/Sparkline';
import { KIND_LABEL, STATUS_LABEL, STATUS_TONE } from '../mock/labels';
import type { Account } from '../mock/types';
import { useSettings } from '../state/store';

interface AccountCardProps {
    account: Account;
    onOpen: () => void;
}

/** 账户卡片——观测页顶部的横向轮播单元 */
export function AccountCard({ account, onOpen }: AccountCardProps) {
    const { hideAmount } = useSettings();
    const isCredit = account.kind === 'credit';

    const available = (account.creditLimit ?? 0) - (account.creditUsed ?? 0);
    const primaryValue = isCredit ? available : account.balance;
    const primaryCaption = isCredit ? '可用额度' : '账户余额';

    /* 进度条：信用卡看额度占用，Ⅱ类卡看当日限额占用 */
    let meterLabel = '本月支出';
    let meterValue = account.monthSpend;
    let meterLimit = account.monthIncome;
    let meterRatio = 0;

    if (isCredit) {
        meterLabel = '已用额度';
        meterValue = account.creditUsed ?? 0;
        meterLimit = account.creditLimit ?? 0;
        meterRatio = meterLimit ? meterValue / meterLimit : 0;
    } else if (account.caps && account.usage) {
        meterLabel = '今日已用';
        meterValue = account.usage.today;
        meterLimit = account.caps.daily;
        meterRatio = meterLimit ? meterValue / meterLimit : 0;
    } else {
        meterRatio = meterLimit ? meterValue / meterLimit : 0;
    }

    return (
        <button
            type="button"
            className="account-card"
            data-kind={account.kind}
            onClick={onOpen}
            aria-label={`${account.product} 详情`}
        >
            <header className="account-head">
                <span className="account-kind">{KIND_LABEL[account.kind]}</span>
                <span className="account-tail mono">•••• {account.tail}</span>
                <Pill tone={STATUS_TONE[account.status]}>{STATUS_LABEL[account.status]}</Pill>
            </header>

            <div className="account-product">{account.product}</div>

            <div className="account-primary">
                <span className="account-caption">{primaryCaption}</span>
                <Amount
                    value={primaryValue}
                    currency
                    mode="balance"
                    className="account-total"
                />
            </div>

            <div className="meter">
                <div className="meter-bar">
                    <span
                        className="meter-fill"
                        style={{ width: `${Math.min(100, Math.round(meterRatio * 100))}%` }}
                    />
                </div>
                <div className="meter-legend">
                    <span>{meterLabel}</span>
                    <span className="mono">
                        {hideAmount ? '••••' : `${formatCompact(meterValue)} / ${formatCompact(meterLimit)}`}
                    </span>
                </div>
            </div>

            <div className="account-stats">
                {isCredit ? (
                    <>
                        <span>
                            本期应还 <Amount value={account.statementDue ?? 0} className="tnum" />
                        </span>
                        <span className="account-dot" />
                        <span>还款日 {String(account.dueDay ?? '--').padStart(2, '0')} 日</span>
                        <span className="account-dot" />
                        <span>{account.autoRepay ? '自动还款' : '手动还款'}</span>
                    </>
                ) : account.caps && account.usage ? (
                    <>
                        <span>单笔上限 {formatCompact(account.caps.single)}</span>
                        <span className="account-dot" />
                        <span>年累计 {formatCompact(account.usage.year)}</span>
                        <span className="account-dot" />
                        <span>额度 {formatCompact(account.caps.annual)}</span>
                    </>
                ) : (
                    <>
                        <span>
                            本月支出 <Amount value={account.monthSpend} className="tnum" />
                        </span>
                        <span className="account-dot" />
                        <span>
                            入账 <Amount value={account.monthIncome} className="tnum" />
                        </span>
                    </>
                )}
            </div>

            <Sparkline
                values={account.trend}
                height={36}
                tone={account.status === 'frozen' ? 'neg' : 'accent'}
                className="account-spark"
            />
        </button>
    );
}

/** 卡片内的小字数字：超过 1 万用「万」压缩，保持在两行内 */
function formatCompact(value: number): string {
    if (value >= 100_000) return `${(value / 10_000).toFixed(1)}万`;
    return value.toLocaleString('zh-CN', { maximumFractionDigits: 0 });
}
