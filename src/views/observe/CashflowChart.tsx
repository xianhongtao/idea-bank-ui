import { useMemo } from 'react';
import { Amount } from '../../components/Amount';
import { Pill } from '../../components/Pill';
import { cx } from '../../lib/cx';
import { formatMonthDay } from '../../lib/time';
import { useSettings, useTxns } from '../../state/store';
import { buildDailyFlow } from './analytics';

const VIEW_W = 300;
const VIEW_H = 84;
const DAYS = 30;
const BASE_Y = VIEW_H - 1;
const MAX_BAR = VIEW_H - 18;

/**
 * 每日支出（柱）+ 当日入账（点）。
 * 用支出单一序列做刻度，避免发薪日的大额入账把日常消费压成看不见的细线。
 */
interface CashflowChartProps {
    /** 只看某个账户的流水；不传则看全部账户 */
    accountId?: string;
}

export function CashflowChart({ accountId }: CashflowChartProps) {
    const allTxns = useTxns();
    const { chartMotion } = useSettings();

    const txns = useMemo(
        () => (accountId ? allTxns.filter((txn) => txn.accountId === accountId) : allTxns),
        [allTxns, accountId],
    );

    const days = useMemo(() => buildDailyFlow(txns, DAYS, Date.now()), [txns]);

    const maxSpend = Math.max(1, ...days.map((day) => day.spend));
    const maxIncome = Math.max(1, ...days.map((day) => day.income));
    const slot = VIEW_W / days.length;
    const barWidth = slot * 0.6;

    const totals = useMemo(
        () =>
            days.reduce(
                (acc, day) => ({ spend: acc.spend + day.spend, income: acc.income + day.income }),
                { spend: 0, income: 0 },
            ),
        [days],
    );

    return (
        <section className="card card-pad">
            <header className="card-head">
                <span className="card-title">每日支出</span>
                <Pill tone="outline">近 30 天</Pill>
            </header>

            <svg
                className="chart-svg"
                viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                height={VIEW_H}
                preserveAspectRatio="none"
                role="img"
                aria-label="近 30 天每日支出与入账"
            >
                <line className="chart-axis" x1="0" y1={BASE_Y} x2={VIEW_W} y2={BASE_Y} />
                {days.map((day, index) => {
                    const height = day.spend > 0 ? Math.max(1.5, (day.spend / maxSpend) * MAX_BAR) : 0;
                    const x = index * slot + (slot - barWidth) / 2;
                    const top = BASE_Y - height;
                    return (
                        <g key={day.ts}>
                            {height > 0 ? (
                                <rect
                                    className={cx('chart-bar', chartMotion && 'chart-bar--in')}
                                    x={x}
                                    y={top}
                                    width={barWidth}
                                    height={height}
                                    rx={1.1}
                                    style={chartMotion ? { animationDelay: `${index * 14}ms` } : undefined}
                                />
                            ) : null}
                            {day.income > 0 ? (
                                <circle
                                    className={cx('chart-dot', chartMotion && 'chart-dot--in')}
                                    cx={x + barWidth / 2}
                                    cy={Math.max(6, top - 5)}
                                    r={1.6 + 2.2 * Math.sqrt(day.income / maxIncome)}
                                    style={chartMotion ? { animationDelay: `${220 + index * 14}ms` } : undefined}
                                />
                            ) : null}
                        </g>
                    );
                })}
            </svg>

            <div className="chart-months">
                <span>{formatMonthDay(days[0].ts)}</span>
                <span>{formatMonthDay(days[Math.floor(days.length / 2)].ts)}</span>
                <span>今天</span>
            </div>

            <div className="chart-legend">
                <span>
                    <span className="chart-key chart-key--bar" />
                    当日支出
                </span>
                <span>
                    <span className="chart-key chart-key--dot" />
                    当日入账
                </span>
            </div>

            <div className="chart-stats">
                <div className="chart-stat">
                    <span className="summary-label">支出</span>
                    <Amount value={totals.spend} className="summary-value" />
                </div>
                <div className="chart-stat">
                    <span className="summary-label">入账</span>
                    <Amount value={totals.income} className="summary-value" />
                </div>
                <div className="chart-stat">
                    <span className="summary-label">净额</span>
                    <Amount value={totals.income - totals.spend} className="summary-value" mode="flow" />
                </div>
            </div>
        </section>
    );
}

