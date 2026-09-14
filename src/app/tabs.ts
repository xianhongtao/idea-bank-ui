import type { FC } from 'react';
import {
    IconAct,
    IconConfigure,
    IconObserve,
    IconSettings,
    type IconProps,
} from '../components/icons';

/** 底部栏的四个根控制节点：看 / 做 / 调 / 改 */
export const TABS = ['observe', 'act', 'configure', 'settings'] as const;

export type TabKey = (typeof TABS)[number];

export interface TabMeta {
    key: TabKey;
    /** 底部栏标签 */
    label: string;
    /** 顶栏主标题 */
    title: string;
    /** 顶栏副标题 */
    sub: string;
    Icon: FC<IconProps>;
}

export const TAB_META: Record<TabKey, TabMeta> = {
    observe: {
        key: 'observe',
        label: '观测',
        title: '观测',
        sub: '全部账户 · 实时同步',
        Icon: IconObserve,
    },
    act: {
        key: 'act',
        label: '行动',
        title: '行动',
        sub: '扫码 · 转账 · 资金调度',
        Icon: IconAct,
    },
    configure: {
        key: 'configure',
        label: '配置',
        title: '配置',
        sub: '按账户设定规则与限额',
        Icon: IconConfigure,
    },
    settings: {
        key: 'settings',
        label: '设置',
        title: '设置',
        sub: '极光银行 Demo',
        Icon: IconSettings,
    },
};
