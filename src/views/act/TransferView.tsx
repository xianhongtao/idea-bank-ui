import { useState } from 'react';
import { useRouter } from '../../app/router';
import { Amount } from '../../components/Amount';
import { AuthButton } from '../../components/AuthButton';
import { Pill } from '../../components/Pill';
import { cx } from '../../lib/cx';
import { formatAmount } from '../../lib/format';
import { HOME_CITY } from '../../mock/cities';
import { useAccounts, useDispatch, useDraft } from '../../state/store';

const QUICK = [100, 500, 1000, 5000];

/** 转账：收款人 → 付款账户 → 金额 → 长按确认 */
export function TransferView() {
    const accounts = useAccounts();
    const draft = useDraft();
    const dispatch = useDispatch();
    const { back } = useRouter();

    const [payee, setPayee] = useState(draft?.payee ?? '');
    const [amountText, setAmountText] = useState(draft?.amount ? String(draft.amount) : '');
    const [note, setNote] = useState('');
    const [accountId, setAccountId] = useState(accounts[0]?.id ?? '');
    const [done, setDone] = useState(false);

    const account = accounts.find((item) => item.id === accountId) ?? accounts[0];
    const amount = Number(amountText) || 0;

    if (!account) return <p className="empty">没有可用的账户。</p>;

    const spendable =
        account.kind === 'credit'
            ? Math.max(0, (account.creditLimit ?? 0) - (account.creditUsed ?? 0))
            : account.balance;
    /* 大额转账收 0.1% 手续费，用来演示「到手金额」的预览价值 */
    const fee = amount > 50_000 ? Math.round(amount * 0.001 * 100) / 100 : 0;
    const total = amount + fee;
    const over = total > spendable;
    const ready = payee.trim().length > 0 && amount > 0 && !over;

    const submit = () => {
        if (!ready) return;
        const stamp = Date.now();
        dispatch({
            type: 'account/patch',
            id: account.id,
            patch:
                account.kind === 'credit'
                    ? { creditUsed: (account.creditUsed ?? 0) + total }
                    : { balance: Math.max(0, account.balance - total) },
        });
        dispatch({
            type: 'txn/add',
            txn: {
                id: `transfer-${stamp}`,
                accountId: account.id,
                ts: stamp,
                type: 'transfer',
                merchant: `转账 · ${payee.trim()}`,
                category: 'other',
                city: HOME_CITY,
                amount: -total,
                status: 'success',
                channel: '转账',
            },
        });
        setDone(true);
    };

    if (done) {
        return (
            <div className="stack">
                <section className="card card-pad">
                    <div className="card-head">
                        <span className="card-title">转账已提交</span>
                        <Pill tone="pos">成功</Pill>
                    </div>
                    <p className="scan-paid-amount mono">¥ {formatAmount(amount)}</p>
                    <p className="card-desc">
                        收款人 {payee} · 由 {account.product} 转出
                        {fee > 0 ? `，含手续费 ${formatAmount(fee)}` : ''}
                        {note ? ` · 备注「${note}」` : ''}
                    </p>
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
                <div className="field">
                    <span className="field-label">收款人</span>
                    <input
                        className="field-input"
                        placeholder="姓名或手机号"
                        value={payee}
                        onChange={(event) => setPayee(event.target.value)}
                    />
                </div>

                <div className="field">
                    <span className="field-label">金额</span>
                    <input
                        className="field-input"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={amountText}
                        onChange={(event) => setAmountText(event.target.value.replace(/[^\d.]/g, ''))}
                    />
                </div>

                <div className="flow-presets">
                    {QUICK.map((value) => (
                        <button
                            key={value}
                            type="button"
                            className={cx('chip', amount === value && 'chip--on')}
                            onClick={() => setAmountText(String(value))}
                        >
                            {value >= 10000 ? `${value / 10000} 万` : value}
                        </button>
                    ))}
                </div>

                <div className="field">
                    <span className="field-label">备注</span>
                    <input
                        className="field-input"
                        placeholder="选填"
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                    />
                </div>
            </section>

            <section className="card card-pad">
                <span className="group-label">付款账户</span>
                <div className="flow-chips">
                    {accounts.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            className="flow-chip"
                            aria-pressed={item.id === account.id}
                            onClick={() => setAccountId(item.id)}
                        >
                            <span className="flow-chip-name">{item.product}</span>
                            <span className="flow-chip-sub mono">
                                可用 {formatAmount(spendableOf(item), { decimals: 0 })}
                            </span>
                        </button>
                    ))}
                </div>

                <dl className="flow-preview">
                    <div className="flow-row">
                        <dt>转账金额</dt>
                        <dd>
                            <Amount value={amount} />
                        </dd>
                    </div>
                    <div className="flow-row">
                        <dt>手续费{amount > 50_000 ? '（0.1%）' : ''}</dt>
                        <dd className={cx(fee === 0 && 'muted')}>{formatAmount(fee)}</dd>
                    </div>
                    <div className="flow-row">
                        <dt>合计支出</dt>
                        <dd>
                            <Amount value={total} />
                        </dd>
                    </div>
                    <div className="flow-row">
                        <dt>付款后{account.kind === 'credit' ? '可用额度' : '余额'}</dt>
                        <dd>
                            <Amount value={Math.max(0, spendable - total)} />
                        </dd>
                    </div>
                </dl>
            </section>

            <AuthButton
                label="确认转账"
                context={`¥ ${formatAmount(total)}`}
                onAuthorized={submit}
                disabled={!ready}
            />
            {over ? <p className="flow-hint warn">合计支出超过该账户可用余额。</p> : null}
            {!over && !ready ? <p className="flow-hint">填写收款人与金额后可提交。</p> : null}
        </div>
    );
}

function spendableOf(account: { kind: string; balance: number; creditLimit?: number; creditUsed?: number }): number {
    return account.kind === 'credit'
        ? Math.max(0, (account.creditLimit ?? 0) - (account.creditUsed ?? 0))
        : account.balance;
}
