import { cx } from '../lib/cx';

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    ariaLabel: string;
    disabled?: boolean;
    className?: string;
}

export function Switch({ checked, onChange, ariaLabel, disabled, className }: SwitchProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={ariaLabel}
            className={cx('switch', className)}
            disabled={disabled}
            onClick={() => onChange(!checked)}
        >
            <span className="switch-knob" />
        </button>
    );
}
