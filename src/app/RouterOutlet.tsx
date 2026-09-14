import type { ComponentType } from 'react';
import { INITIAL_ACCOUNTS } from '../mock/dataset';
import { FundFlowView } from '../views/act/FundFlowView';
import { PayCodeView } from '../views/act/PayCodeView';
import { ScanView } from '../views/act/ScanView';
import { TransferView } from '../views/act/TransferView';
import { AccountDetailView } from '../views/observe/AccountDetailView';
import { AboutScreen } from '../views/settings/AboutScreen';
import { AppearanceScreen } from '../views/settings/AppearanceScreen';
import { DevicesScreen } from '../views/settings/DevicesScreen';
import { useRouter } from './router';
import { Screen } from './Screen';
import type { TabKey } from './tabs';

interface ScreenEntry {
    title: string;
    Component: ComponentType;
}

/** 屏幕解析器：按顺序尝试，返回 null 表示不匹配 */
type Resolver = (tab: TabKey, segment: string) => ScreenEntry | null;

const RESOLVERS: Resolver[] = [
    (tab, segment) => {
        if (tab !== 'settings') return null;
        const screens: Record<string, ScreenEntry> = {
            appearance: { title: '外观', Component: AppearanceScreen },
            devices: { title: '设备与登录', Component: DevicesScreen },
            about: { title: '关于', Component: AboutScreen },
        };
        return screens[segment] ?? null;
    },
    (tab, segment) => {
        if (tab !== 'act') return null;
        const screens: Record<string, ScreenEntry> = {
            pay: { title: '付款码', Component: PayCodeView },
            receive: { title: '收款码', Component: PayCodeView },
            scan: { title: '扫码付', Component: ScanView },
            transfer: { title: '转账', Component: TransferView },
            'fund-flow': { title: '资金调度', Component: FundFlowView },
        };
        return screens[segment] ?? null;
    },
    (tab, segment) => {
        if (tab !== 'observe' || !segment.startsWith('acc-')) return null;
        const account = INITIAL_ACCOUNTS.find((item) => item.id === segment.slice(4));
        if (!account) return null;
        return { title: account.product, Component: AccountDetailView };
    },
];

export function RouterOutlet() {
    const { loc, dir } = useRouter();
    if (loc.depth === 0) return null;

    const segment = loc.segments[0] ?? '';
    let entry: ScreenEntry | null = null;
    for (const resolve of RESOLVERS) {
        entry = resolve(loc.tab, segment);
        if (entry) break;
    }

    if (!entry) {
        return (
            <Screen title="未知页面" dir={dir}>
                <p className="empty">没有找到这个页面。</p>
            </Screen>
        );
    }

    const { title, Component } = entry;
    return (
        <Screen title={title} dir={dir}>
            <Component />
        </Screen>
    );
}
