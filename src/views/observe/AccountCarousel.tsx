import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from '../../app/router';
import { AccountCard } from '../../components/AccountCard';
import { useAccounts, useDispatch } from '../../state/store';

interface AccountCarouselProps {
    /** 当前展示的卡片序号（由父层持有，下方内容要跟着它走） */
    activeIndex: number;
    onActiveIndexChange: (index: number) => void;
}

/** 观测页顶部的账户卡片轮播（横向吸附） */
export function AccountCarousel({ activeIndex, onActiveIndexChange }: AccountCarouselProps) {
    const accounts = useAccounts();
    const dispatch = useDispatch();
    const { push } = useRouter();

    const trackRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef(0);

    /** 单卡步进 = 卡宽 + 间距 */
    const stepSize = useCallback(() => {
        const track = trackRef.current;
        const first = track?.firstElementChild;
        if (!track || !(first instanceof HTMLElement)) return 0;
        const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
        return first.offsetWidth + gap;
    }, []);

    const handleScroll = useCallback(() => {
        if (rafRef.current) return;
        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = 0;
            const track = trackRef.current;
            const size = stepSize();
            if (!track || !size) return;
            const index = Math.round(track.scrollLeft / size);
            onActiveIndexChange(Math.max(0, Math.min(accounts.length - 1, index)));
        });
    }, [accounts.length, onActiveIndexChange, stepSize]);

    useEffect(
        () => () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        },
        [],
    );

    const goTo = (index: number) => {
        onActiveIndexChange(index);
        trackRef.current?.scrollTo({ left: index * stepSize(), behavior: 'smooth' });
    };

    return (
        <section className="carousel" aria-label="我的账户">
            <div className="carousel-track" ref={trackRef} onScroll={handleScroll}>
                {accounts.map((account) => (
                    <AccountCard
                        key={account.id}
                        account={account}
                        onOpen={() => {
                            dispatch({ type: 'ui/selectAccount', id: account.id });
                            push(`acc-${account.id}`);
                        }}
                    />
                ))}
            </div>

            <div className="carousel-dots">
                {accounts.map((account, index) => (
                    <button
                        key={account.id}
                        type="button"
                        className="carousel-dot"
                        aria-label={`第 ${index + 1} 张卡：${account.product}`}
                        aria-current={index === activeIndex}
                        onClick={() => goTo(index)}
                    />
                ))}
            </div>
        </section>
    );
}
