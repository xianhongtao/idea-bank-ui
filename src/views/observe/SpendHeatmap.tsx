import { useMemo, useState } from 'react';
import { Amount } from '../../components/Amount';
import { Pill } from '../../components/Pill';
import { formatAmount } from '../../lib/format';
import { formatMonthDay } from '../../lib/time';
import { useSettings, useTxns } from '../../state/store';
import { buildHeatmap, heatLevel } from './analytics';

const WEEKS = 6;
/** 隔行标注：中文在 10px 下只有单字勉强可辨，隔行放更清楚 */
const WEEKDAY_LABELS = ['一', '', '三', '', '五', '', '日'];

/** 支出热力网格：6 周 × 7 天，点格子看当天金额 */
interface SpendHeatmapProps {
    /** 只看某个账户的流水；不传则看全部账户 */
    accountId?: string;
}

export function SpendHeatmap({ accountId }: SpendHeatmapProps) {
    const allTxns = useTxns();
    const { hideAmount } = useSettings();
    const now = useMemo(() => Date.now(), []);

    const txns = useMemo(
        () => (accountId ? allTxns.filter((txn) => txn.accountId === accountId) : allTxns),
        [allTxns, accountId],
    );

    const weeks = useMemo(() => buildHeatmap(txns, WEEKS, now), [txns, now]);
    const cells = useMemo(() => weeks.flatMap((week) => week.days), [weeks]);

    const max = Math.max(0, ...cells.filter((cell) => !cell.future).map((cell) => cell.value));
    const active = cells.filter((cell) => !cell.future && cell.value > 0);

    const [selectedTs, setSelectedTs] = useState<number | null>(null);
    const selected = selectedTs === null ? null : (cells.find((cell) => cell.ts === selectedTs) ?? null);

    const average = active.length > 0 ? active.reduce((sum, cell) => sum + cell.value, 0) / active.length : 0;
    const peak = active.reduce((best, cell) => (cell.value > best.value ? cell : best), {
        ts: 0,
        value: 0,
        future: false,
    });

    return (
        <section className="card card-pad">
            <header className="card-head">
                <span className="card-title">支出热力</span>
                <Pill tone="outline">最近 {WEEKS} 周</Pill>
            </header>

            <div className="heat">
                <div className="heat-labels">
                    {WEEKDAY_LABELS.map((label, index) => (
                        <span key={index}>{label}</span>
                    ))}
                </div>

                <div className="heat-weeks">
                    {cells.map((cell) => (
                        <button
                            key={cell.ts}
                            type="button"
                            className="heat-cell"
                            data-level={heatLevel(cell.value, max)}
                            data-future={cell.future || undefined}
                            aria-pressed={cell.ts === selectedTs}
                            aria-label={`${formatMonthDay(cell.ts)}${cell.future ? '（未到）' : ''} ${hideAmount ? '金额已隐藏' : formatAmount(cell.value, { decimals: 0 })
                                } 元`}
                            title={formatMonthDay(cell.ts)}
                            onClick={() => setSelectedTs(cell.ts === selectedTs ? null : cell.ts)}
                        />
                    ))}
                </div>

                <dl className="heat-side">
                    <div className="heat-stat">
                        <dt>有支出天数</dt>
                        <dd>
                            {active.length} / {cells.filter((cell) => !cell.future).length}
                        </dd>
                    </div>
                    <div className="heat-stat">
                        <dt>日均</dt>
                        <dd>
                            <Amount value={average} />
                        </dd>
                    </div>
                    <div className="heat-stat">
                        <dt>最高单日</dt>
                        <dd>
                            <Amount value={peak.value} />
                            <span className="heat-stat-sub"> {formatMonthDay(peak.ts)}</span>
                        </dd>
                    </div>
                    <div className="heat-stat">
                        <dt>{selected ? formatMonthDay(selected.ts) : '点选格子'}</dt>
                        <dd>
                            {selected ? <Amount value={selected.value} /> : <span className="muted">查看当天支出</span>}
                        </dd>
                    </div>
                </dl>
            </div>

            <div className="heat-legend">
                <span className="muted">少</span>
                {[0, 1, 2, 3, 4].map((level) => (
                    <span key={level} className="heat-cell" data-level={level} />
                ))}
                <span className="muted">多</span>
                <span className="heat-legend-hint muted">跨度 {WEEKS * 7} 天</span>
            </div>
        </section>
    );
}
