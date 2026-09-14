import { Amount } from '../../components/Amount';
import { Pill } from '../../components/Pill';
import { Sparkline } from '../../components/Sparkline';
import { cx } from '../../lib/cx';
import type { Overview } from './analytics';

export interface PeriodSummary {
    spend: number;
    income: number;
    count: number;
}

interface OverviewPanelProps {
    overview: Overview;
    summary: PeriodSummary;
}

/** 卡包收拢时下方只保留总体趋势：净资产走势 + 资产构成 */
export function OverviewPanel({ overview, summary }: OverviewPanelProps) {
    const positive = overview.delta >= 0;
    const liabilityTotal = overview.savings + overview.creditUsed;
    const savingsShare = liabilityTotal > 0 ? (overview.savings / liabilityTotal) * 100 : 100;

    return (
        <>
            <section className="card card-pad overview-card">
                <div className="card-head">
                    <span className="card-title">净资产走势</span>
                    <Pill tone="outline">近 30 天</Pill>
                </div>

                <div className="hero-value">
                    <Amount value={overview.net} currency className="hero-total" />
                    <span className={cx('hero-delta', positive ? 'amount--pos' : 'amount--neg')}>
                        {positive ? '▲' : '▼'} {formatAbs(overview.delta)} 元
                    </span>
                </div>

                <Sparkline
                    values={overview.netSeries}
                    height={96}
                    tone={positive ? 'accent' : 'neg'}
                    className="hero-spark"
                />

                <div className="hero-axis">
                    <span>30 天前</span>
                    <span>15 天前</span>
                    <span>今天</span>
                </div>
            </section>

            <section className="card card-pad overview-card">
                <div className="card-head">
                    <span className="card-title">资产构成</span>
                    <Pill tone="outline">当前</Pill>
                </div>

                <div className="composition">
                    <span className="comp-bar">
                        <span className="comp-seg comp-seg--saving" style={{ width: `${savingsShare}%` }} />
                        <span
                            className="comp-seg comp-seg--credit"
                            style={{ width: `${100 - savingsShare}%` }}
                        />
                    </span>

                    <div className="comp-legend">
                        <span className="comp-dot comp-dot--saving" />
                        <span>储蓄余额</span>
                        <Amount value={overview.savings} className="comp-amount" />
                    </div>
                    <div className="comp-legend">
                        <span className="comp-dot comp-dot--credit" />
                        <span>信用卡已用</span>
                        <Amount value={overview.creditUsed} className="comp-amount" />
                    </div>
                    <div className="comp-legend">
                        <span className="comp-dot comp-dot--ghost" />
                        <span>可用总额度</span>
                        <Amount
                            value={Math.max(0, overview.creditLimit - overview.creditUsed)}
                            className="comp-amount"
                        />
                    </div>
                </div>

                <dl className="flow-preview">
                    <div className="flow-row">
                        <dt>近 30 天支出</dt>
                        <dd>
                            <Amount value={summary.spend} />
                        </dd>
                    </div>
                    <div className="flow-row">
                        <dt>近 30 天入账</dt>
                        <dd>
                            <Amount value={summary.income} />
                        </dd>
                    </div>
                    <div className="flow-row">
                        <dt>交易笔数</dt>
                        <dd className="mono">{summary.count}</dd>
                    </div>
                </dl>
            </section>
        </>
    );
}

function formatAbs(value: number): string {
    const abs = Math.abs(value);
    if (abs >= 10_000) return `${(abs / 10_000).toFixed(2)} 万`;
    return abs.toLocaleString('zh-CN', { maximumFractionDigits: 0 });
}
