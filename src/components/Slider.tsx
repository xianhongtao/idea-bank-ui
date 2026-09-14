import type { CSSProperties } from 'react';
import { cx } from '../lib/cx';

interface SliderProps {
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
    ariaLabel: string;
    className?: string;
}

/** 原生 range 包一层，用自定义属性把已填充比例交给 CSS 画轨道 */
export function Slider({ value, min, max, step = 1, onChange, ariaLabel, className }: SliderProps) {
    const ratio = max > min ? (value - min) / (max - min) : 0;

    return (
        <div className={cx('slider', className)}>
            <input
                type="range"
                className="slider-input"
                min={min}
                max={max}
                step={step}
                value={value}
                aria-label={ariaLabel}
                onChange={(event) => onChange(Number(event.target.value))}
                style={{ '--fill': `${Math.round(ratio * 100)}%` } as CSSProperties}
            />
        </div>
    );
}
