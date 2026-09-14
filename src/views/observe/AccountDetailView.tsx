import type { ReactNode } from 'react';
import { useRouter } from '../../app/router';
import { Amount } from '../../components/Amount';
import { Card } from '../../components/Card';
import { IconChevronRight, IconConfigure } from '../../components/icons';
import { Pill } from '../../components/Pill';
import { Sparkline } from '../../components/Sparkline';
import { KIND_LABEL, STATUS_LABEL, STATUS_TONE } from '../../mock/labels';
import { useAccount, useAccounts, useDispatch, useSettings } from '../../state/store';
import { StreamLog } from './StreamLog';

/** 账户详情：卡片只是入口，这里是完整账本 */
export function AccountDetailView() {
    const { loc, setTab } = useRouter();
    const dispatch = useDispatch();
    const { hideAmount } = useSettings();
    const id = (loc.segments[0] ?? '').replace(/^acc-/, '');
    const account = useAccount(id);
    const accounts = useAccounts();

    if (!account) {
        return <p className="empty">没有找到这个账户。</p>;
    }

    const isCredit = account.kind === 'credit';
    const available = (account.creditLimit ?? 0) - (account.creditUsed ?? 0);
    const months = lastMonths(account.monthly.length);
    const rank = accounts.findIndex((item) => item.id === account.id) + 1;

    const stats: Array<{ label: string; value: ReactNode }> = isCredit
        ? [
            { label: '总额度', value: <Amount value={account.creditLimit ?? 0} /> },
            { label: '已用额度', value: <Amount value={account.creditUsed ?? 0} /> },
            { label: '本期应还', value: <Amount value={account.statementDue ?? 0} /> },
            { label: '最低还款', value: <Amount value={account.minPayment ?? 0} /> },
            { label: '账单日', value: `每月 ${account.statementDay} 日` },
            { label: '还款日', value: `每月 ${account.dueDay} 日` },
        ]
        : account.caps && account.usage
            ? [
                { label: '单笔上限', value: <Amount value={account.caps.single} /> },
                { label: '日累计上限', value: <Amount value={account.caps.daily} /> },
                { label: '年累计上限', value: <Amount value={account.caps.annual} /> },
                { label: '今日已用', value: <Amount value={account.usage.today} /> },
                { label: '年度已用', value: <Amount value={account.usage.year} /> },
                { label: '本月支出', value: <Amount value={account.monthSpend} /> },
            ]
            : [
                { label: '本月支出', value: <Amount value={account.monthSpend} /> },
                { label: '本月入账', value: <Amount value={account.monthIncome} /> },
                { label: '净流入', value: <Amount value={account.monthIncome - account.monthSpend} /> },
                { label: '卡号', value: <span className="mono">•••• {account.tail}</span> },
                { label: '所属机构', value: account.bank },
                { label: '卡片序号', value: `第 ${rank} 张` },
            ];

    return (
        <>
            <Card className="card--clip">
                <header className="account-head">
                    <span className="account-kind">{KIND_LABEL[account.kind]}</span>
                    <span className="account-tail mono">•••• {account.tail}</span>
                    <Pill tone={STATUS_TONE[account.status]}>{STATUS_LABEL[account.status]}</Pill>
                </header>

                <div className="account-product">{account.product}</div>

                <div className="account-primary">
                    <span className="account-caption">{isCredit ? '可用额度' : '账户余额'}</span>
                    <Amount
                        value={isCredit ? available : account.balance}
                        currency
                        className="account-total"
                    />
                </div>

                <dl className="detail-grid">
                    {stats.map((stat) => (
                        <Stat key={stat.label} label={stat.label} value={stat.value} />
                    ))}
                </dl>
            </Card>

            <Card>
                <div className="card-head">
                    <span className="card-title">近 12 个月走势</span>
                    <Pill tone="outline">期末值</Pill>
                </div>
                <Sparkline
                    values={account.monthly}
                    height={72}
                    tone={isCredit ? 'accent' : 'pos'}
                    className="detail-chart"
                />
                <div className="chart-months">
                    <span>{months[0]}</span>
                    <span>{months[Math.floor(months.length / 3)]}</span>
                    <span>{months[Math.floor((months.length * 2) / 3)]}</span>
                    <span>{months[months.length - 1]}（本月）</span>
                </div>
                {hideAmount ? <p className="muted">金额已隐藏</p> : null}
            </Card>

            {account.installments && account.installments.length > 0 ? (
                <Card>
                    <div className="card-head">
                        <span className="card-title">分期计划</span>
                        <Pill tone="accent">{account.installments.length} 笔在还</Pill>
                    </div>
                    <ul className="installments">
                        {account.installments.map((item) => (
                            <li key={item.id} className="installment">
                                <div className="installment-head">
                                    <span className="ellipsis">{item.title}</span>
                                    <Amount value={item.perPeriod} className="installment-amount" />
                                </div>
                                <div className="meter-bar">
                                    <span
                                        className="meter-fill"
                                        style={{ width: `${Math.round((item.paidPeriods / item.totalPeriods) * 100)}%` }}
                                    />
                                </div>
                                <div className="meter-legend">
                                    <span>
                                        已还 {item.paidPeriods}/{item.totalPeriods} 期
                                    </span>
                                    <span>下期 {item.nextDate}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>
            ) : null}

            <button
                type="button"
                className="row row--tap detail-action"
                onClick={() => {
                    dispatch({ type: 'ui/selectAccount', id: account.id });
                    setTab('configure');
                }}
            >
                <span className="row-icon">
                    <IconConfigure size={16} />
                </span>
                <span className="row-label">
                    配置此账户
                    <span className="row-hint">限额、功能开关与安全设置</span>
                </span>
                <IconChevronRight size={16} className="row-chevron" />
            </button>

            <StreamLog accountId={account.id} limit={12} />
        </>
    );
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="stat">
            <dt className="stat-label">{label}</dt>
            <dd className="stat-value">{value}</dd>
        </div>
    );
}

/** 最近 n 个月的短标签，如 10月 */
function lastMonths(count: number): string[] {
    const now = new Date();
    const out: string[] = [];
    for (let index = count - 1; index >= 0; index -= 1) {
        const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
        out.push(`${date.getMonth() + 1}月`);
    }
    return out;
}
