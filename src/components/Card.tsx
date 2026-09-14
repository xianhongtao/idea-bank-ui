import type { ReactNode } from 'react';
import { cx } from '../lib/cx';

interface CardProps {
    children: ReactNode;
    className?: string;
    /** 是否套用内边距（默认套用） */
    pad?: boolean;
}

export function Card({ children, className, pad = true }: CardProps) {
    return <div className={cx('card', pad && 'card-pad', className)}>{children}</div>;
}
