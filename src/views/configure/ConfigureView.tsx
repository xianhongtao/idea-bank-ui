import { useMemo } from 'react';
import { Amount } from '../../components/Amount';
import { Pill } from '../../components/Pill';
import { Slider } from '../../components/Slider';
import { Switch } from '../../components/Switch';
import { formatAmount } from '../../lib/format';
import { startOfDay } from '../../lib/time';
import { HOME_CITY } from '../../mock/cities';
import { KIND_LABEL, STATUS_LABEL, STATUS_TONE } from '../../mock/labels';
import type { AccountSettings } from '../../mock/types';
import { useAccounts, useDispatch, useSelectedAccountId, useTxns } from '../../state/store';

const ALERT_PRESETS = [200, 500, 1000, 5000];

/** 没有监管上限时滑块的可用区间 */
const SLIDER_MAX = { single: 100_000, daily: 200_000, monthly: 500_000 };

export function ConfigureView() {
    const accounts = useAccounts();
    const selectedId = useSelectedAccountId();
    const dispatch = useDispatch();
    const txns = useTxns();

    const account = accounts.find((item) => item.id === selectedId) ?? accounts[0];

    const usage = useMemo(() => {
        if (!account) return { single: 0, today: 0 };
        const mine = txns.filter(
            (txn) => txn.accountId === account.id && txn.amount < 0 && txn.type !== 'repay',
        );
        const todayStart = startOfDay(Date.now());
        return {
            single: mine.reduce((best, txn) => Math.max(best, -txn.amount), 0),
            today: mine
                .filter((txn) => txn.ts >= todayStart)
                .reduce((sum, txn) => sum + -txn.amount, 0),
        };
    }, [txns, account]);

    if (!account) return <p className="empty">没有可用的账户。</p>;

    const { settings } = account;
    const isCredit = account.kind === 'credit';
    const frozen = account.status === 'frozen';

    /** 改动立即落库，并向观测页的账单日志广播一条配置事件 */
    const apply = (patch: Partial<AccountSettings>, label: string, value: string) => {
        dispatch({
            type: 'account/patch',
            id: account.id,
            patch: { settings: { ...settings, ...patch } },
        });
        const stamp = Date.now();
        dispatch({
            type: 'txn/add',
            txn: {
                id: `cfg-${stamp}-${label}`,
                accountId: account.id,
                ts: stamp,
                type: 'config',
                merchant: `${account.product} · ${label} → ${value}`,
                category: 'other',
                city: HOME_CITY,
                amount: 0,
                status: 'success',
                channel: '应用内',
                note: label,
            },
        });
    };

    const toggleStatus = () => {
        const next = frozen ? 'normal' : 'frozen';
        dispatch({ type: 'account/patch', id: account.id, patch: { status: next } });
        const stamp = Date.now();
        dispatch({
            type: 'txn/add',
            txn: {
                id: `cfg-freeze-${stamp}`,
                accountId: account.id,
                ts: stamp,
                type: 'config',
                merchant: `${account.product} · ${frozen ? '已解冻' : '已冻结'}`,
                category: 'other',
                city: HOME_CITY,
                amount: 0,
                status: 'success',
                channel: '应用内',
            },
        });
    };

    return (
        <div className="view">
            <div className="flow-chips">
                {accounts.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        className="flow-chip"
                        aria-pressed={item.id === account.id}
                        onClick={() => dispatch({ type: 'ui/selectAccount', id: item.id })}
                    >
                        <span className="flow-chip-name">{item.product}</span>
                        <span className="flow-chip-sub mono">{KIND_LABEL[item.kind]}</span>
                    </button>
                ))}
            </div>

            <section className="card card-pad">
                <header className="account-head">
                    <span className="account-kind">{KIND_LABEL[account.kind]}</span>
                    <span className="account-tail mono">•••• {account.tail}</span>
                    <Pill tone={STATUS_TONE[account.status]}>{STATUS_LABEL[account.status]}</Pill>
                </header>
                <div className="account-product">{account.product}</div>
            </section>

            <section className="card card-pad">
                <div className="card-head">
                    <span className="card-title">限额管理</span>
                    <Pill tone="outline">对比近 30 天用量</Pill>
                </div>

                <LimitRow
                    label="单笔限额"
                    value={settings.singleLimit}
                    max={SLIDER_MAX.single}
                    usage={usage.single}
                    onChange={(next) =>
                        apply({ singleLimit: next }, '单笔限额', formatAmount(next, { decimals: 0 }))
                    }
                />

                <LimitRow
                    label="日累计限额"
                    value={settings.dailyLimit}
                    max={SLIDER_MAX.daily}
                    usage={usage.today}
                    hardCap={account.caps?.daily}
                    onChange={(next) =>
                        apply({ dailyLimit: next }, '日累计限额', formatAmount(next, { decimals: 0 }))
                    }
                />

                <LimitRow
                    label="月累计限额"
                    value={settings.monthlyLimit}
                    max={SLIDER_MAX.monthly}
                    usage={account.monthSpend}
                    onChange={(next) =>
                        apply({ monthlyLimit: next }, '月累计限额', formatAmount(next, { decimals: 0 }))
                    }
                />

                {account.caps ? (
                    <p className="muted cfg-note">
                        Ⅱ类账户受监管约束：单笔上限 {formatAmount(account.caps.single, { decimals: 0 })}、日累计{' '}
                        {formatAmount(account.caps.daily, { decimals: 0 })}、年累计{' '}
                        {formatAmount(account.caps.annual, { decimals: 0 })}，滑块无法越过这些上限。
                    </p>
                ) : null}
            </section>

            <section className="card card-pad">
                <div className="card-head">
                    <span className="card-title">功能开关</span>
                    <Pill tone="outline">即时生效</Pill>
                </div>

                <div className="cfg-rows">
                    <SwitchRow
                        label="境外交易"
                        hint={isCredit ? '境外网站与本币 / 外币结算' : '境外取现与消费'}
                        checked={settings.overseas}
                        onChange={(next) => apply({ overseas: next }, '境外交易', next ? '已开启' : '已关闭')}
                    />
                    <SwitchRow
                        label="免密支付"
                        hint="单笔 1000 元以下免密"
                        checked={settings.contactless}
                        onChange={(next) =>
                            apply({ contactless: next }, '免密支付', next ? '已开启' : '已关闭')
                        }
                    />
                    <SwitchRow
                        label="线上支付"
                        hint="网页与 App 内付款"
                        checked={settings.online}
                        onChange={(next) => apply({ online: next }, '线上支付', next ? '已开启' : '已关闭')}
                    />
                    {isCredit ? (
                        <SwitchRow
                            label="自动还款"
                            hint={`还款日 ${account.dueDay} 日，从晨曦薪金卡扣款`}
                            checked={settings.autoRepay}
                            onChange={(next) =>
                                apply({ autoRepay: next }, '自动还款', next ? '已开启' : '已关闭')
                            }
                        />
                    ) : null}
                    <SwitchRow
                        label="夜间锁卡"
                        hint="23:00 - 06:00 拒绝交易"
                        checked={settings.nightLock}
                        onChange={(next) => apply({ nightLock: next }, '夜间锁卡', next ? '已开启' : '已关闭')}
                    />
                    <SwitchRow
                        label="交易提醒"
                        hint="超过阈值即时推送"
                        checked={settings.alertEnabled}
                        onChange={(next) =>
                            apply({ alertEnabled: next }, '交易提醒', next ? '已开启' : '已关闭')
                        }
                    />
                </div>

                <div className="cfg-threshold">
                    <span className="field-label">提醒阈值</span>
                    <div className="flow-presets">
                        {ALERT_PRESETS.map((preset) => (
                            <button
                                key={preset}
                                type="button"
                                className={settings.alertThreshold === preset ? 'chip chip--on' : 'chip'}
                                onClick={() =>
                                    apply(
                                        { alertThreshold: preset },
                                        '提醒阈值',
                                        `${formatAmount(preset, { decimals: 0 })} 元`,
                                    )
                                }
                            >
                                {formatAmount(preset, { decimals: 0 })}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="card card-pad">
                <div className="card-head">
                    <span className="card-title">还款设置</span>
                </div>
                <dl className="flow-preview">
                    <div className="flow-row">
                        <dt>账单日</dt>
                        <dd>每月 {account.statementDay ?? 1} 日</dd>
                    </div>
                    <div className="flow-row">
                        <dt>还款日</dt>
                        <dd>每月 {account.dueDay ?? 15} 日</dd>
                    </div>
                    <div className="flow-row">
                        <dt>{isCredit ? '本期应还' : '本月支出'}</dt>
                        <dd>
                            <Amount value={isCredit ? (account.statementDue ?? 0) : account.monthSpend} />
                        </dd>
                    </div>
                </dl>
            </section>

            <section className="card card-pad danger-card">
                <div className="card-head">
                    <span className="card-title">危险操作</span>
                    <Pill tone="neg">谨慎操作</Pill>
                </div>
                <p className="card-desc">
                    冻结后该卡立即停止一切支付与取现；已发生的分期与账单仍需按时还款。
                </p>
                <button type="button" className="btn-danger" onClick={toggleStatus}>
                    {frozen ? '解除冻结' : '冻结此卡'}
                </button>
            </section>
        </div>
    );
}

interface LimitRowProps {
    label: string;
    value: number;
    max: number;
    usage: number;
    hardCap?: number;
    onChange: (value: number) => void;
}

function LimitRow({ label, value, max, usage, hardCap, onChange }: LimitRowProps) {
    const ratio = value > 0 ? Math.min(1, usage / value) : 0;
    const sliderMax = Math.max(max, hardCap ?? 0, value);

    return (
        <div className="limit">
            <div className="limit-head">
                <span className="limit-label">{label}</span>
                {hardCap ? (
                    <Pill tone="warn">监管上限 {formatAmount(hardCap, { decimals: 0 })}</Pill>
                ) : null}
                <span className="limit-value mono">{formatAmount(value, { decimals: 0 })}</span>
            </div>

            <Slider
                value={value}
                min={500}
                max={sliderMax}
                step={100}
                ariaLabel={label}
                onChange={(next) => onChange(hardCap ? Math.min(next, hardCap) : next)}
            />

            <div className="meter-bar">
                <span className="meter-fill" style={{ width: `${Math.round(ratio * 100)}%` }} />
            </div>
            <div className="meter-legend">
                <span>{usage > 0 ? '已有用量' : '暂无用量'}</span>
                <span className="mono">
                    {formatAmount(usage, { decimals: 0 })} / {formatAmount(value, { decimals: 0 })}
                </span>
            </div>
        </div>
    );
}

interface SwitchRowProps {
    label: string;
    hint: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

function SwitchRow({ label, hint, checked, onChange }: SwitchRowProps) {
    return (
        <div className="cfg-row">
            <span className="cfg-row-text">
                <span className="cfg-row-label">{label}</span>
                <span className="cfg-row-hint">{hint}</span>
            </span>
            <Switch checked={checked} onChange={onChange} ariaLabel={label} />
        </div>
    );
}
