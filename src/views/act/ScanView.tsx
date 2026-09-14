import { useEffect, useMemo, useState } from 'react';
import { Amount } from '../../components/Amount';
import { AuthButton } from '../../components/AuthButton';
import { Pill } from '../../components/Pill';
import { cx } from '../../lib/cx';
import { formatAmount } from '../../lib/format';
import { HOME_CITY } from '../../mock/cities';
import { useAccounts, useDispatch } from '../../state/store';

const MERCHANTS = ['山野小馆', '琥珀咖啡', '邻里鲜生', '环城加油', '星光影城'];
const QUICK = [12, 28, 58, 128];

type Stage = 'scan' | 'found' | 'paid';

/** 扫码付：取景框 → 识别收款方 → 输入金额 → 长按确认 */
export function ScanView() {
    const accounts = useAccounts();
    const dispatch = useDispatch();

    const [stage, setStage] = useState<Stage>('scan');
    const [accountId, setAccountId] = useState(accounts[0]?.id ?? '');
    const [amountText, setAmountText] = useState('');

    const merchant = useMemo(
        () => MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)],
        [],
    );

    const account = accounts.find((item) => item.id === accountId) ?? accounts[0];
    const amount = Number(amountText) || 0;

    useEffect(() => {
        if (stage !== 'scan') return;
        const timer = window.setTimeout(() => setStage('found'), 2200);
        return () => window.clearTimeout(timer);
    }, [stage]);

    if (!account) return <p className="empty">没有可用的账户。</p>;

    const spendable =
        account.kind === 'credit'
            ? Math.max(0, (account.creditLimit ?? 0) - (account.creditUsed ?? 0))
            : account.balance;
    const over = amount > spendable;

    const pay = () => {
        if (amount <= 0 || over) return;
        const stamp = Date.now();
        dispatch({
            type: 'account/patch',
            id: account.id,
            patch:
                account.kind === 'credit'
                    ? { creditUsed: (account.creditUsed ?? 0) + amount }
                    : { balance: Math.max(0, account.balance - amount) },
        });
        dispatch({
            type: 'txn/add',
            txn: {
                id: `scan-${stamp}`,
                accountId: account.id,
                ts: stamp,
                type: 'pos',
                merchant,
                category: 'dining',
                city: HOME_CITY,
                amount: -amount,
                status: 'success',
                channel: '扫码',
            },
        });
        setStage('paid');
    };

    if (stage === 'paid') {
        return (
            <div className="stack">
                <section className="card card-pad">
                    <div className="card-head">
                        <span className="card-title">付款成功</span>
                        <Pill tone="pos">已完成</Pill>
                    </div>
                    <p className="scan-paid-amount mono">¥ {formatAmount(amount)}</p>
                    <p className="card-desc">
                        收款方 {merchant} · 由 {account.product} 支付
                    </p>
                </section>
                <button type="button" className="btn-primary" onClick={() => setStage('scan')}>
                    再扫一次
                </button>
            </div>
        );
    }

    if (stage === 'scan') {
        return (
            <div className="stack">
                <div className="scanner">
                    <span className="scanner-corner" data-corner="tl" />
                    <span className="scanner-corner" data-corner="tr" />
                    <span className="scanner-corner" data-corner="bl" />
                    <span className="scanner-corner" data-corner="br" />
                    <span className="scanner-line" />
                    <span className="scanner-hint">将二维码放入框内，正在识别…</span>
                </div>
                <p className="muted code-hint">
                    演示环境不调用摄像头，约 2 秒后模拟识别结果。
                </p>
            </div>
        );
    }

    return (
        <div className="stack">
            <section className="card card-pad">
                <div className="card-head">
                    <span className="card-title">识别到收款方</span>
                    <Pill tone="accent">已识别</Pill>
                </div>
                <p className="scan-merchant">{merchant}</p>

                <div className="field">
                    <span className="field-label">付款金额</span>
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
                            {value}
                        </button>
                    ))}
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
                                可用 {formatAmount(spendable, { decimals: 0 })}
                            </span>
                        </button>
                    ))}
                </div>

                <dl className="flow-preview">
                    <div className="flow-row">
                        <dt>付款后{account.kind === 'credit' ? '可用额度' : '余额'}</dt>
                        <dd>
                            <Amount value={Math.max(0, spendable - amount)} />
                        </dd>
                    </div>
                    <div className="flow-row">
                        <dt>手续费</dt>
                        <dd className="muted">{formatAmount(0)}</dd>
                    </div>
                </dl>
            </section>

            <AuthButton
                label="确认付款"
                context={amount > 0 ? `¥ ${formatAmount(amount)}` : undefined}
                onAuthorized={pay}
                disabled={amount <= 0 || over}
            />
            {over ? <p className="flow-hint warn">金额超过该账户可用余额。</p> : null}
        </div>
    );
}
