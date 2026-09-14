import { useMemo, useState } from 'react';
import { useNow } from '../../lib/hooks';
import { cx } from '../../lib/cx';
import { MASK, clockTime, formatAmount, relativeTime } from '../../lib/format';
import { TYPE_LABEL } from '../../mock/catalog';
import type { Txn } from '../../mock/types';
import { useSettings, useTxns } from '../../state/store';

/** 模块加载时刻：早于它的流水视为历史数据，不做入场动画 */
const SESSION_START = Date.now();

interface StreamLogProps {
    /** 只看某个账户的流水 */
    accountId?: string;
    limit?: number;
}

/** 账单日志——Cloudflare 事件流风格的高密度列表 */
export function StreamLog({ accountId, limit = 36 }: StreamLogProps) {
    const txns = useTxns();
    const { hideAmount } = useSettings();
    const now = useNow(30_000);
    const [frozen, setFrozen] = useState<Txn[] | null>(null);

    const current = useMemo(() => {
        const scoped = accountId ? txns.filter((txn) => txn.accountId === accountId) : txns;
        return scoped.slice(0, limit);
    }, [txns, accountId, limit]);

    const rows = frozen ?? current;

    return (
        <section className="card log">
            <header className="log-head">
                <span className="card-title">账单日志</span>
                <span className="log-live">
                    <span className={cx('live-dot', frozen && 'live-dot--paused')} />
                    {frozen ? '已暂停' : '实时'}
                </span>
                <button
                    type="button"
                    className="log-action"
                    aria-pressed={frozen !== null}
                    onClick={() => setFrozen(frozen ? null : current)}
                >
                    {frozen ? '继续' : '暂停'}
                </button>
            </header>

            {rows.length === 0 ? (
                <p className="empty">暂无流水</p>
            ) : (
                <ul className="log-list">
                    {rows.map((txn) => (
                        <LogRow key={txn.id} txn={txn} hidden={hideAmount} />
                    ))}
                </ul>
            )}

            <footer className="log-foot">
                <span>{rows.length > 0 ? `最近一笔 ${relativeTime(rows[0].ts, now)}` : '等待新事件'}</span>
                <span>共 {rows.length} 条</span>
            </footer>
        </section>
    );
}

function LogRow({ txn, hidden }: { txn: Txn; hidden: boolean }) {
    const isConfig = txn.type === 'config';
    const isNew = txn.ts >= SESSION_START;
    const text = isConfig ? '已生效' : formatAmount(txn.amount, { sign: true });
    const tone = isConfig ? 'accent' : txn.amount < 0 ? 'neg' : 'pos';

    return (
        <li className={cx('log-row', isNew && 'log-row--new')} data-status={txn.status}>
            <span className="log-time mono">{clockTime(txn.ts)}</span>
            <span className="log-type" data-type={txn.type}>
                {TYPE_LABEL[txn.type]}
            </span>
            <span className="log-merchant ellipsis">{txn.merchant}</span>
            <span className={cx('log-amount', `log-amount--${tone}`)}>
                {hidden && !isConfig ? MASK : text}
            </span>
        </li>
    );
}
