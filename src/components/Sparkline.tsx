import { useId } from 'react';
import { cx } from '../lib/cx';

interface SparklineProps {
    values: number[];
    /** SVG 逻辑高度，实际宽度随容器拉伸 */
    height?: number;
    tone?: 'accent' | 'pos' | 'neg';
    className?: string;
}

/**
 * 迷你走势图。用 preserveAspectRatio="none" 横向拉满，
 * 线条用 vector-effect 保持描边粗细不被拉变形。
 */
export function Sparkline({ values, height = 34, tone = 'accent', className }: SparklineProps) {
    const gradientId = useId();
    const width = 100;

    if (values.length < 2) {
        return <div className={cx('sparkline', className)} style={{ height }} />;
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const pad = 4;

    const points = values.map((value, index) => {
        const x = (index / (values.length - 1)) * width;
        const y = pad + (1 - (value - min) / span) * (height - pad * 2);
        return [x, y] as const;
    });

    const line = points
        .map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`)
        .join(' ');
    const area = `${line} L${width} ${height} L0 ${height} Z`;

    return (
        <svg
            className={cx('sparkline', className)}
            data-tone={tone}
            viewBox={`0 0 ${width} ${height}`}
            height={height}
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
        >
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop className="spark-stop-a" offset="0%" />
                    <stop className="spark-stop-b" offset="100%" />
                </linearGradient>
            </defs>
            <path className="spark-area" d={area} fill={`url(#${gradientId})`} />
            <path
                className="spark-line"
                d={line}
                fill="none"
                strokeWidth={1.6}
                vectorEffect="non-scaling-stroke"
                strokeLinejoin="round"
                strokeLinecap="round"
            />
        </svg>
    );
}
