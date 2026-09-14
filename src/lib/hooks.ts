import { useEffect, useRef, useState, type RefObject } from 'react';

export interface TickerOptions {
    enabled: boolean;
    /** 间隔下限（毫秒） */
    min?: number;
    /** 间隔上限（毫秒） */
    max?: number;
}

/**
 * 不规律间隔的定时器——用来模拟「实时推送」的节奏感。
 * 组件卸载或 enabled 变为 false 时自动停止。
 */
export function useTicker(callback: () => void, { enabled, min = 4000, max = 9000 }: TickerOptions): void {
    const callbackRef = useRef(callback);
    const minRef = useRef(min);
    const maxRef = useRef(max);

    useEffect(() => {
        callbackRef.current = callback;
        minRef.current = min;
        maxRef.current = max;
    });

    useEffect(() => {
        if (!enabled) return;
        let timer = 0;
        let stopped = false;

        const schedule = () => {
            const delay = minRef.current + Math.random() * (maxRef.current - minRef.current);
            timer = window.setTimeout(() => {
                if (stopped) return;
                callbackRef.current();
                schedule();
            }, delay);
        };

        schedule();
        return () => {
            stopped = true;
            window.clearTimeout(timer);
        };
    }, [enabled]);
}

/** 周期性刷新的当前时间戳——用于「N 秒前」这类相对时间 */
export function useNow(intervalMs = 1000): number {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), intervalMs);
        return () => window.clearInterval(timer);
    }, [intervalMs]);

    return now;
}

/** 元素是否在视口内（用于暂停离屏动画） */
export function useOnScreen<T extends Element>(ref: RefObject<T | null>): boolean {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) setVisible(entry.isIntersecting);
            },
            { rootMargin: '80px' },
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [ref]);

    return visible;
}
