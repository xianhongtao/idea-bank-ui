import type { ReactNode } from 'react';
import { cx } from '../lib/cx';

export type PillTone = 'neutral' | 'accent' | 'pos' | 'neg' | 'warn' | 'outline';

interface PillProps {
    children: ReactNode;
    tone?: PillTone;
    className?: string;
}

export function Pill({ children, tone = 'neutral', className }: PillProps) {
    return (
        <span className={cx('pill', tone !== 'neutral' && `pill--${tone}`, className)}>{children}</span>
    );
}
