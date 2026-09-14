import { useMemo } from 'react';
import { useRouter } from '../../app/router';
import { Amount } from '../../components/Amount';
import { IconCard, IconQr, IconScan, IconSend, IconSwap } from '../../components/icons';
import { relativeTime } from '../../lib/format';
import { useAccounts, useDispatch, useTxns } from '../../state/store';

/** 行动页的四个操作入口，全部直达可用流程 */
const TILES = [
    { id: 'scan', label: '扫码付', hint: '对准二维码', Icon: IconScan },
    { id: 'transfer', label: '转账', hint: '转给他人', Icon: IconSend },
    { id: 'fund-flow', label: '资金调度', hint: '账户间搬钱', Icon: IconSwap },
    { id: 'repay', label: '信用卡还款', hint: '一键还入', Icon: IconCard },
];

export function ActView() {
    const { push } = useRouter();
    const accounts = useAccounts();
    const txns = useTxns();
    const dispatch = useDispatch();

    const recent = useMemo(
        () => txns.filter((txn) => txn.type !== 'config' && txn.amount < 0).slice(0, 4),
        [txns],
    );

    const openRepay = () => {
        const card = accounts.find((account) => account.kind === 'credit');
        if (!card) return;
        dispatch({ type: 'ui/setDraft', draft: { toAccountId: card.id } });
        push('fund-flow');
    };

    return (
        <div className="view">
            <div className="code-row">
                <button type="button" className="code-btn" onClick={() => push('pay')}>
                    <IconQr size={22} />
                    <span className="code-btn-label">付款码</span>
                    <span className="code-btn-hint">出示给商家扫</span>
                </button>
                <button type="button" className="code-btn" onClick={() => push('receive')}>
                    <IconQr size={22} />
                    <span className="code-btn-label">收款码</span>
                    <span className="code-btn-hint">让对方扫你</span>
                </button>
            </div>

            <div className="tile-grid">
                {TILES.map((tile) => {
                    const Icon = tile.Icon;
                    return (
                        <button
                            key={tile.id}
                            type="button"
                            className="tile"
                            onClick={() => {
                                if (tile.id === 'repay') {
                                    openRepay();
                                    return;
                                }
                                if (tile.id === 'transfer') {
                                    dispatch({ type: 'ui/setDraft', draft: null });
                                }
                                push(tile.id);
                            }}
                        >
                            <span className="tile-icon">
                                <Icon size={20} />
                            </span>
                            <span className="tile-label">{tile.label}</span>
                            <span className="tile-hint">{tile.hint}</span>
                        </button>
                    );
                })}
            </div>

            <section className="card log">
                <header className="log-head">
                    <span className="card-title">最近动态</span>
                    <span className="log-live">
                        <span className="live-dot" />
                        可重放
                    </span>
                </header>
                <ul className="log-list">
                    {recent.map((txn) => (
                        <li key={txn.id}>
                            <button
                                type="button"
                                className="row row--tap replay-row"
                                onClick={() => {
                                    dispatch({
                                        type: 'ui/setDraft',
                                        draft: { payee: txn.merchant, amount: Math.round(-txn.amount) },
                                    });
                                    push('transfer');
                                }}
                            >
                                <span className="row-label">
                                    {txn.merchant}
                                    <span className="row-hint">{relativeTime(txn.ts)} · 点击重放这笔转账</span>
                                </span>
                                <Amount value={txn.amount} mode="flow" className="row-value" />
                            </button>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
