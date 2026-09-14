import { useMemo, useState } from 'react';
import { useRouter } from '../../app/router';
import { Amount } from '../../components/Amount';
import { AuthButton } from '../../components/AuthButton';
import { IconSwap } from '../../components/icons';
import { Pill } from '../../components/Pill';
import { Slider } from '../../components/Slider';
import { cx } from '../../lib/cx';
import { formatAmount } from '../../lib/format';
import { KIND_LABEL } from '../../mock/labels';
import type { Account } from '../../mock/types';
import { HOME_CITY } from '../../mock/cities';
import { useAccounts, useDispatch, useDraft, useSettings } from '../../state/store';

const PRESETS = [500, 1000, 5000, 10000];

/** 账户在某个方向上的「容量」：转出看可用，转入看可还/软上限 */
function capacity(account: Account, direction: 'out' | 'in'): number {
    if (direction === 'out') {
        return account.kind === 'credit'
            ? Math.max(0, (account.creditLimit ?? 0) - (account.creditUsed ?? 0))
            : account.balance;
    }
    return account.kind === 'credit'
        ? Math.max(0, account.creditUsed ?? 0)
        : Math.max(50_000, account.balance);
}

function availableLabel(account: Account): string {
    return account.kind === 'credit'
        ? `可用 ${formatAmount((account.creditLimit ?? 0) - (account.creditUsed ?? 0), { decimals: 0 })}`
        : `余额 ${formatAmount(account.balance, { decimals: 0 })}`;
}

/**
 * 资金调度：账户之间搬钱。
 * 滑块调额 → 实时预览转出/到账后的数字 → 长按确认。
 */
export function FundFlowView() {
    const accounts = useAccounts();
    const draft = useDraft();
    const dispatch = useDispatch();
    const { back } = useRouter();
    const { hideAmount } = useSettings();

    /* 默认从储蓄账户转出、转入信用卡：跨信用卡取现不是该被默认推荐的路径 */
    const [fromId, setFromId] = useState(
        () => accounts.find((item) => item.kind === 'debit1')?.id ?? accounts[0]?.id ?? '',
    );
    const [toId, setToId] = useState(
        () =>
            draft?.toAccountId ??
            accounts.find((item) => item.kind === 'credit')?.id ??
            accounts[1]?.id ??
            '',
    );
    const [amount, setAmount] = useState(1000);
    const [done, setDone] = useState(false);

    const from = accounts.find((account) => account.id === fromId) ?? accounts[0];
    const to = accounts.find((account) => account.id === toId) ?? accounts[1] ?? accounts[0];

    const max = useMemo(() => {
        if (!from || !to) return 0;
        const limit = Math.min(capacity(from, 'out'), capacity(to, 'in'));
        return Math.max(0, Math.floor(limit / 100) * 100);
    }, [from, to]);

    const capped = Math.min(amount, Math.max(100, max));

    if (!from || !to) {
        return <p className="empty">没有可用的账户。</p>;
    }

    const pick = (side: 'from' | 'to', id: string) => {
        if (side === 'from') {
            if (id === toId) setToId(fromId);
            setFromId(id);
        } else {
            if (id === fromId) setFromId(toId);
            setToId(id);
        }
    };

    const confirm = () => {
        if (capped <= 0) return;
        const stamp = Date.now();

        dispatch({
            type: 'account/patch',
            id: from.id,
            patch:
                from.kind === 'credit'
                    ? { creditUsed: (from.creditUsed ?? 0) + capped }
                    : { balance: from.balance - capped },
        });
        dispatch({
            type: 'account/patch',
            id: to.id,
            patch:
                to.kind === 'credit'
                    ? { creditUsed: Math.max(0, (to.creditUsed ?? 0) - capped) }
                    : { balance: to.balance + capped },
        });

        dispatch({
            type: 'txn/add',
            txn: {
                id: `flow-out-${stamp}`,
                accountId: from.id,
                ts: stamp,
                type: 'transfer',
                merchant: `资金调度 · 转入${to.product}`,
                category: 'other',
                city: HOME_CITY,
                amount: -capped,
                status: 'success',
                channel: '应用内',
            },
        });
        dispatch({
            type: 'txn/add',
            txn: {
                id: `flow-in-${stamp}`,
                accountId: to.id,
                ts: stamp + 1,
                type: 'income',
                merchant: `资金调度 · 来自${from.product}`,
                category: 'other',
                city: HOME_CITY,
                amount: capped,
                status: 'success',
                channel: '应用内',
            },
        });

        setDone(true);
    };

    if (done) {
        return (
            <div className="stack">
                <section className="card card-pad">
                    <div className="card-head">
                        <span className="card-title">调度已提交</span>
                        <Pill tone="pos">成功</Pill>
                    </div>
                    <p className="card-desc">
                        {from.product} → {to.product}，金额 ¥ {formatAmount(capped)}，实时到账。
                    </p>
                </section>

                <section className="card card-pad">
                    <dl className="flow-preview">
                        <div className="flow-row">
                            <dt>{from.product} {from.kind === 'credit' ? '可用额度' : '余额'}</dt>
                            <dd>
                                <Amount
                                    value={
                                        from.kind === 'credit'
                                            ? (from.creditLimit ?? 0) - (from.creditUsed ?? 0)
                                            : from.balance
                                    }
                                />
                            </dd>
                        </div>
                        <div className="flow-row">
                            <dt>{to.product} {to.kind === 'credit' ? '可用额度' : '余额'}</dt>
                            <dd>
                                <Amount
                                    value={
                                        to.kind === 'credit'
                                            ? (to.creditLimit ?? 0) - (to.creditUsed ?? 0)
                                            : to.balance
                                    }
                                />
                            </dd>
                        </div>
                    </dl>
                </section>

                <button type="button" className="btn-primary" onClick={back}>
                    完成
                </button>
            </div>
        );
    }

    return (
        <div className="stack">
            <section className="card card-pad">
                <span className="group-label">转出账户</span>
                <div className="flow-chips">
                    {accounts.map((account) => (
                        <button
                            key={account.id}
                            type="button"
                            className="flow-chip"
                            aria-pressed={account.id === fromId}
                            onClick={() => pick('from', account.id)}
                        >
                            <span className="flow-chip-name">{account.product}</span>
                            <span className="flow-chip-sub mono">
                                {KIND_LABEL[account.kind]} · {availableLabel(account)}
                            </span>
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    className="flow-swap"
                    aria-label="调换转出与转入账户"
                    onClick={() => {
                        setFromId(toId);
                        setToId(fromId);
                    }}
                >
                    <IconSwap size={17} />
                </button>

                <span className="group-label">转入账户</span>
                <div className="flow-chips">
                    {accounts.map((account) => (
                        <button
                            key={account.id}
                            type="button"
                            className="flow-chip"
                            aria-pressed={account.id === toId}
                            onClick={() => pick('to', account.id)}
                        >
                            <span className="flow-chip-name">{account.product}</span>
                            <span className="flow-chip-sub mono">
                                {KIND_LABEL[account.kind]} · {availableLabel(account)}
                            </span>
                        </button>
                    ))}
                </div>
            </section>

            <section className="card card-pad">
                <div className="card-head">
                    <span className="card-title">调度金额</span>
                    <Pill tone="accent">上限 {hideAmount ? '••••' : `¥${formatAmount(max, { decimals: 0 })}`}</Pill>
                </div>
                <p className="flow-amount mono">¥ {hideAmount ? '••••' : formatAmount(capped)}</p>

                <Slider
                    value={capped}
                    min={100}
                    max={Math.max(100, max)}
                    step={100}
                    ariaLabel="调度金额"
                    onChange={setAmount}
                />

                <div className="flow-presets">
                    {PRESETS.filter((preset) => preset <= max).map((preset) => (
                        <button
                            key={preset}
                            type="button"
                            className={cx('chip', capped === preset && 'chip--on')}
                            onClick={() => setAmount(preset)}
                        >
                            {preset >= 10000 ? `${preset / 10000} 万` : formatAmount(preset, { decimals: 0 })}
                        </button>
                    ))}
                    <button
                        type="button"
                        className={cx('chip', capped === max && 'chip--on')}
                        onClick={() => setAmount(max)}
                    >
                        全部
                    </button>
                </div>
            </section>

            <section className="card card-pad">
                <dl className="flow-preview">
                    <div className="flow-row">
                        <dt>{from.product} 转出后{from.kind === 'credit' ? '可用额度' : '余额'}</dt>
                        <dd>
                            <Amount
                                value={
                                    from.kind === 'credit'
                                        ? Math.max(0, (from.creditLimit ?? 0) - (from.creditUsed ?? 0) - capped)
                                        : Math.max(0, from.balance - capped)
                                }
                            />
                        </dd>
                    </div>
                    <div className="flow-row">
                        <dt>{to.product} 到账后{to.kind === 'credit' ? '可用额度' : '余额'}</dt>
                        <dd>
                            <Amount
                                value={
                                    to.kind === 'credit'
                                        ? (to.creditLimit ?? 0) - Math.max(0, (to.creditUsed ?? 0) - capped)
                                        : to.balance + capped
                                }
                            />
                        </dd>
                    </div>
                    <div className="flow-row">
                        <dt>手续费</dt>
                        <dd className="muted">{formatAmount(0)}</dd>
                    </div>
                    <div className="flow-row">
                        <dt>到账时间</dt>
                        <dd>实时</dd>
                    </div>
                </dl>
            </section>

            <AuthButton
                label="确认划转"
                context={`¥ ${formatAmount(capped)}`}
                onAuthorized={confirm}
                disabled={max <= 0}
            />
            <p className="muted flow-hint">演示环境，不会发生真实资金变动。</p>
        </div>
    );
}
