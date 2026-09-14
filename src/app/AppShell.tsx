import { useEffect, useRef } from 'react';
import { useTicker } from '../lib/hooks';
import { makeLiveTxn } from '../mock/feed';
import { useAccounts, useDispatch, useSettings } from '../state/store';
import { ActView } from '../views/act/ActView';
import { ConfigureView } from '../views/configure/ConfigureView';
import { ObserveView } from '../views/observe/ObserveView';
import { SettingsView } from '../views/settings/SettingsView';
import { AppHeader } from './AppHeader';
import { RouterOutlet } from './RouterOutlet';
import { useRouter } from './router';
import { TabBar } from './TabBar';
import type { TabKey } from './tabs';

function TabView({ tab }: { tab: TabKey }) {
    switch (tab) {
        case 'observe':
            return <ObserveView />;
        case 'act':
            return <ActView />;
        case 'configure':
            return <ConfigureView />;
        case 'settings':
            return <SettingsView />;
    }
}

export function AppShell() {
    const { loc } = useRouter();
    const settings = useSettings();
    const accounts = useAccounts();
    const dispatch = useDispatch();
    const scrollRef = useRef<HTMLElement | null>(null);
    const hasScreen = loc.depth > 0;

    /* 全局实时流水：无论在哪个节点都会累积，回到观测页即可见最新事件 */
    useTicker(
        () => {
            dispatch({ type: 'txn/add', txn: makeLiveTxn(accounts, Date.now()) });
        },
        { enabled: settings.chartMotion, min: 6000, max: 13000 },
    );

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: 0 });
    }, [loc.tab]);

    return (
        <div className="app">
            <AppHeader />

            <main className="app-scroll" ref={scrollRef} inert={hasScreen}>
                <TabView tab={loc.tab} />
            </main>

            <TabBar />
            <RouterOutlet />
        </div>
    );
}
