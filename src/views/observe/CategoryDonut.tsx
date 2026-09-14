import { useMemo } from 'react';
import { Amount } from '../../components/Amount';
import { Pill } from '../../components/Pill';
import { cx } from '../../lib/cx';
import { useSettings, useTxns } from '../../state/store';
import { buildCategorySlices } from './analytics';

const RADIUS = 38;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const MAX_SEGMENTS = 6;

/** 支出分类占比：环图 + 榜单 */
interface CategoryDonutProps {
    /** 只看某个账户的流水；不传则看全部账户 */
    accountId?: string;
}

export function CategoryDonut({ accountId }: CategoryDonutProps) {
    const allTxns = useTxns();
    const { chartMotion } = useSettings();

    const txns = useMemo(
        () => (accountId ? allTxns.filter((txn) => txn.accountId === accountId) : allTxns),
        [allTxns, accountId],
    );

    const slices = useMemo(() => {
        const all = buildCategorySlices(txns, 30, Date.now());
        const total = all.reduce((sum, slice) => sum + slice.value, 0);
        if (total === 0) return [];

        const top = all.slice(0, MAX_SEGMENTS);
        const restValue = all.slice(MAX_SEGMENTS).reduce((sum, slice) => sum + slice.value, 0);

        if (restValue > 0) {
            /* 若真实分类里已有「其他」，就并进去，避免图例出现两条同名项 */
            const otherIndex = top.findIndex((slice) => slice.key === 'other');
            if (otherIndex >= 0) {
                const merged = top[otherIndex].value + restValue;
                top[otherIndex] = { key: 'other', label: '其他', value: merged, share: merged / total };
            } else {
                top.push({ key: 'other', label: '其他', value: restValue, share: restValue / total });
            }
        }

        return top.sort((a, b) => b.value - a.value);
    }, [txns]);

    const total = slices.reduce((sum, slice) => sum + slice.value, 0);
    let offset = 0;

    return (
        <section className="card card-pad">
            <header className="card-head">
                <span className="card-title">支出分类</span>
                <Pill tone="outline">近 30 天</Pill>
            </header>

            {total === 0 ? (
                <p className="empty">暂无支出</p>
            ) : (
                <div className="donut-layout">
                    <div className="donut-wrap">
                        <svg viewBox="0 0 100 100" className="donut" role="img" aria-label="支出分类占比">
                            <circle className="donut-track" cx="50" cy="50" r={RADIUS} />
                            {slices.map((slice, index) => {
                                const length = slice.share * CIRCUMFERENCE;
                                /* 分片之间留 2 单位的缝，视觉上更利落 */
                                const solid = Math.max(0.5, length - 2);
                                const element = (
                                    <circle
                                        key={`${slice.key}-${index}`}
                                        className={cx('donut-arc', `seg-${index % 8}`, chartMotion && 'donut-arc--in')}
                                        cx="50"
                                        cy="50"
                                        r={RADIUS}
                                        strokeDasharray={`${solid} ${CIRCUMFERENCE - solid}`}
                                        strokeDashoffset={-offset}
                                        style={chartMotion ? { animationDelay: `${index * 70}ms` } : undefined}
                                    />
                                );
                                offset += length;
                                return element;
                            })}
                        </svg>
                        <div className="donut-center">
                            <span className="donut-center-label">总支出</span>
                            <Amount value={total} className="donut-center-value" />
                        </div>
                    </div>

                    <ul className="donut-legend">
                        {slices.map((slice, index) => (
                            <li key={`${slice.key}-${index}`} className="donut-item">
                                <span className={cx('donut-dot', `seg-${index % 8}`)} />
                                <span className="donut-name ellipsis">{slice.label}</span>
                                <span className="donut-share tnum">{Math.round(slice.share * 100)}%</span>
                                <Amount value={slice.value} className="donut-value" />
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    );
}
