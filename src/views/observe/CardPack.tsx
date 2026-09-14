import { Amount } from '../../components/Amount';
import { Pill } from '../../components/Pill';
import { formatAmount } from '../../lib/format';
import type { Account } from '../../mock/types';
import type { Overview } from './analytics';

interface CardPackProps {
    accounts: Account[];
    overview: Overview;
    onOpen: () => void;
}

/**
 * 未展开时的卡包：所有卡片叠放在一起、以不同角度露出边缘，
 * 正面是一张总览卡，只在收拢状态下出现。
 */
export function CardPack({ accounts, overview, onOpen }: CardPackProps) {
    const usedRatio = overview.creditLimit > 0 ? overview.creditUsed / overview.creditLimit : 0;

    return (
        <div className="pack">
            {[3, 2, 1].map((layer) => (
                <span key={layer} className="pack-layer" data-i={layer} aria-hidden="true" />
            ))}

            <button
                type="button"
                className="pack-front"
                onClick={onOpen}
                aria-label={`展开卡包，共 ${accounts.length} 张卡`}
            >
                <span className="pack-row">
                    <span className="account-kind">账户总览</span>
                    <Pill tone="accent">{accounts.length} 张卡</Pill>
                </span>

                <span className="pack-label">净资产</span>
                <Amount value={overview.net} currency className="pack-total" />

                <span className="pack-split">
                    <span>
                        储蓄 {overview.savingsCount} 张 · {formatAmount(overview.savings, { decimals: 0 })}
                    </span>
                    <span>
                        信用 {overview.creditCount} 张 · 已用{' '}
                        {formatAmount(overview.creditUsed, { decimals: 0 })}
                    </span>
                </span>

                <span className="meter">
                    <span className="meter-bar">
                        <span
                            className="meter-fill"
                            style={{ width: `${Math.min(100, Math.round(usedRatio * 100))}%` }}
                        />
                    </span>
                    <span className="meter-legend">
                        <span>信用额度占用</span>
                        <span className="mono">{Math.round(usedRatio * 100)}%</span>
                    </span>
                </span>

                <span className="pack-hint">点按展开卡包</span>
            </button>
        </div>
    );
}
