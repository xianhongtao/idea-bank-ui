import { cx } from '../lib/cx';
import { formatAmount, maskValue } from '../lib/format';
import { useSettings } from '../state/store';

interface AmountProps {
    value: number;
    /**
     * balance：余额类，不带符号
     * flow：流水类，带 + / −
     */
    mode?: 'balance' | 'flow';
    /** 显示货币符号 */
    currency?: boolean;
    /** 按正负着色（flow 模式默认开启） */
    colored?: boolean;
    className?: string;
}

/** 统一处理「金额隐藏」与正负着色的金额文本 */
export function Amount({
    value,
    mode = 'balance',
    currency = false,
    colored,
    className,
}: AmountProps) {
    const { hideAmount } = useSettings();
    const showTone = colored ?? mode === 'flow';
    const text = formatAmount(value, { sign: mode === 'flow' });
    const tone = mode === 'flow' ? (value < 0 ? 'neg' : 'pos') : undefined;

    return (
        <span className={cx('amount', showTone && tone && `amount--${tone}`, className)}>
            {currency && !hideAmount ? <span className="amount-symbol">¥</span> : null}
            <span className="tnum">{maskValue(text, hideAmount)}</span>
        </span>
    );
}
