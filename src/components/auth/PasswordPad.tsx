import { useEffect, useRef, useState } from 'react';
import { cx } from '../../lib/cx';

const LENGTH = 6;
/** 空字符串表示键盘最后一行的占位 */
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'];

interface PasswordPadProps {
    /** 面板里回显的上下文（通常是金额） */
    context?: string;
    onComplete: () => void;
    onCancel: () => void;
}

/** 原地展开的 6 位支付密码键盘 */
export function PasswordPad({ context, onComplete, onCancel }: PasswordPadProps) {
    const [digits, setDigits] = useState<number[]>([]);
    const [phase, setPhase] = useState<'input' | 'verifying' | 'done'>('input');

    const completeRef = useRef(onComplete);
    const timersRef = useRef<number[]>([]);

    useEffect(() => {
        completeRef.current = onComplete;
    });

    useEffect(
        () => () => {
            timersRef.current.forEach((timer) => window.clearTimeout(timer));
        },
        [],
    );

    const press = (key: string) => {
        if (phase !== 'input') return;

        if (key === 'back') {
            setDigits((list) => list.slice(0, -1));
            return;
        }
        if (!key || digits.length >= LENGTH) return;

        const next = [...digits, Number(key)];
        setDigits(next);

        if (next.length === LENGTH) {
            setPhase('verifying');
            timersRef.current.push(
                window.setTimeout(() => setPhase('done'), 720),
                window.setTimeout(() => completeRef.current(), 1080),
            );
        }
    };

    return (
        <div className="pad" data-phase={phase}>
            <div className="pad-head">
                <span className="pad-title">输入支付密码</span>
                {context ? <span className="pad-context mono">{context}</span> : null}
            </div>

            <div className="pad-dots" aria-label={`已输入 ${digits.length} 位，共 ${LENGTH} 位`}>
                {Array.from({ length: LENGTH }, (_, index) => (
                    <span
                        key={index}
                        className={cx('pad-dot', index < digits.length && 'pad-dot--on')}
                    />
                ))}
            </div>

            <div className="pad-keys">
                {KEYS.map((key, index) =>
                    key === '' ? (
                        <span key={`gap-${index}`} />
                    ) : (
                        <button
                            key={key}
                            type="button"
                            className={cx('pad-key', key === 'back' && 'pad-key--back')}
                            disabled={phase !== 'input'}
                            aria-label={key === 'back' ? '删除' : key}
                            onClick={() => press(key)}
                        >
                            {key === 'back' ? '⌫' : key}
                        </button>
                    ),
                )}
            </div>

            <div className="pad-foot">
                <span className="pad-hint">
                    {phase === 'input' ? '演示环境：任意 6 位数字均可通过' : '正在校验…'}
                </span>
                <button type="button" className="pad-cancel" onClick={onCancel}>
                    取消
                </button>
            </div>
        </div>
    );
}
