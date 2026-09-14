import { useMemo } from 'react';
import { Amount } from '../../components/Amount';
import { Pill } from '../../components/Pill';
import { cx } from '../../lib/cx';
import { MASK, formatAmount } from '../../lib/format';
import { cityByName, HOME_CITY } from '../../mock/cities';
import { useSettings, useTxns } from '../../state/store';
import { buildCitySpend } from './analytics';
import { CHINA_PATH, HAINAN_PATH, TAIWAN_PATH } from './cnOutline';
import { MAP_HEIGHT, MAP_WIDTH, project } from './projection';

interface MapPoint {
    id: string;
    name: string;
    lon: number;
    lat: number;
    value: number;
    count: number;
}

/** 消费地图：中国轮廓 + 城市光点 + 常驻地到各地的弧线 */
interface SpendMapProps {
    /** 只看某个账户的流水；不传则看全部账户 */
    accountId?: string;
}

export function SpendMap({ accountId }: SpendMapProps) {
    const allTxns = useTxns();
    const { hideAmount, chartMotion } = useSettings();

    const txns = useMemo(
        () => (accountId ? allTxns.filter((txn) => txn.accountId === accountId) : allTxns),
        [allTxns, accountId],
    );

    const points = useMemo<MapPoint[]>(() => {
        const out: MapPoint[] = [];
        for (const item of buildCitySpend(txns, 30, Date.now())) {
            const city = cityByName(item.city);
            if (!city) continue;
            out.push({
                id: city.id,
                name: city.name,
                lon: city.lon,
                lat: city.lat,
                value: item.value,
                count: item.count,
            });
        }
        return out;
    }, [txns]);

    const max = Math.max(1, ...points.map((point) => point.value));
    const total = points.reduce((sum, point) => sum + point.value, 0);
    const home = points.find((point) => point.name === HOME_CITY) ?? points[0];

    return (
        <section className="card card-pad">
            <header className="card-head">
                <span className="card-title">消费地图</span>
                <Pill tone="outline">近 30 天</Pill>
            </header>

            <div className="map-wrap">
                <svg
                    className="map"
                    viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
                    role="img"
                    aria-label="消费城市分布"
                >
                    <g className="map-land">
                        <path d={CHINA_PATH} />
                        <path d={HAINAN_PATH} />
                        <path d={TAIWAN_PATH} />
                    </g>

                    {home ? (
                        <g>
                            {points
                                .filter((point) => point.id !== home.id)
                                .map((point, index) => (
                                    <path
                                        key={point.id}
                                        className={cx('map-arc', chartMotion && 'map-arc--in')}
                                        d={arcPath(home, point)}
                                        pathLength={1}
                                        style={chartMotion ? { animationDelay: `${140 + index * 55}ms` } : undefined}
                                    />
                                ))}
                        </g>
                    ) : null}

                    <g>
                        {points.map((point) => {
                            const [x, y] = project(point.lon, point.lat);
                            /* 半径以像素为目标：地图宽约 50.8 用户单位，最大点约 7px */
                            const radius = 0.4 + 0.78 * Math.sqrt(point.value / max);
                            const isHome = home !== undefined && point.id === home.id;
                            return (
                                <g key={point.id}>
                                    {isHome ? (
                                        <circle className="map-pulse" cx={x} cy={y} r={radius * 2.2} />
                                    ) : null}
                                    <circle className={cx('map-dot', isHome && 'map-dot--home')} cx={x} cy={y} r={radius} />
                                </g>
                            );
                        })}
                    </g>
                </svg>

                {points.slice(0, 3).map((point, index) => {
                    const [x, y] = project(point.lon, point.lat);
                    return (
                        <span
                            key={point.id}
                            className="map-pin-label"
                            data-slot={index}
                            style={{
                                left: `${(x / MAP_WIDTH) * 100}%`,
                                top: `${(y / MAP_HEIGHT) * 100}%`,
                            }}
                        >
                            {point.name}
                        </span>
                    );
                })}
            </div>

            <ul className="map-rank">
                {points.slice(0, 5).map((point) => (
                    <li key={point.id} className="map-rank-item">
                        <span className="map-rank-name">{point.name}</span>
                        <span className="map-rank-bar">
                            <span
                                className="map-rank-fill"
                                style={{ width: `${Math.round((point.value / max) * 100)}%` }}
                            />
                        </span>
                        <span className="map-rank-count muted">{point.count} 笔</span>
                        <Amount value={point.value} className="map-rank-value" />
                    </li>
                ))}
            </ul>

            <div className="map-foot">
                <span>覆盖 {points.length} 个城市</span>
                <span>合计 {hideAmount ? MASK : formatAmount(total, { decimals: 0 })} 元</span>
            </div>
        </section>
    );
}

function arcPath(from: MapPoint, to: MapPoint): string {
    const [x1, y1] = project(from.lon, from.lat);
    const [x2, y2] = project(to.lon, to.lat);
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.hypot(dx, dy) || 1;
    const bend = length * 0.2;
    const cx = (x1 + x2) / 2 - (dy / length) * bend;
    const cy = (y1 + y2) / 2 + (dx / length) * bend;
    return `M${x1.toFixed(2)} ${y1.toFixed(2)} Q${cx.toFixed(2)} ${cy.toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}
