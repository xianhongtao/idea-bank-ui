import { cx } from '../lib/cx';

export interface SegmentedOption<T extends string> {
    value: T;
    label: string;
}

interface SegmentedControlProps<T extends string> {
    value: T;
    options: Array<SegmentedOption<T>>;
    onChange: (value: T) => void;
    ariaLabel?: string;
    className?: string;
}

export function SegmentedControl<T extends string>({
    value,
    options,
    onChange,
    ariaLabel,
    className,
}: SegmentedControlProps<T>) {
    const count = options.length;
    const activeIndex = Math.max(
        0,
        options.findIndex((option) => option.value === value),
    );

    return (
        <div
            className={cx('segmented', className)}
            role="tablist"
            aria-label={ariaLabel}
            style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
        >
            <span
                className="segmented-thumb"
                style={{
                    width: `calc((100% - 6px) / ${count})`,
                    transform: `translateX(${activeIndex * 100}%)`,
                }}
            />
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    role="tab"
                    className="segmented-btn"
                    aria-selected={option.value === value}
                    onClick={() => onChange(option.value)}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}
