import type { SVGProps } from 'react';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
    size?: number;
}

/** 统一描边规格的图标基底 */
function Svg({ size = 22, ...rest }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            {...rest}
        />
    );
}

/* ------------------------------ 底部四节点 ------------------------------ */

/** 观测：波形 */
export function IconObserve(props: IconProps) {
    return (
        <Svg {...props}>
            <path d="M2.5 12.5h3.2l2.4-7 3.3 13.5 2.4-6.5h7.7" />
        </Svg>
    );
}

/** 行动：闪电 */
export function IconAct(props: IconProps) {
    return (
        <Svg {...props}>
            <path d="M13.2 2.5 4.6 13.6h5.6l-1.4 7.9 9-11.6h-5.7z" />
        </Svg>
    );
}

/** 配置：推子 */
export function IconConfigure(props: IconProps) {
    return (
        <Svg {...props}>
            <path d="M3.5 7.5h8M17.5 7.5h3M3.5 16.5h3M12.5 16.5h8" />
            <circle cx="14.2" cy="7.5" r="2.3" />
            <circle cx="9.4" cy="16.5" r="2.3" />
        </Svg>
    );
}

/** 设置：齿轮 */
export function IconSettings(props: IconProps) {
    return (
        <Svg {...props}>
            <circle cx="12" cy="12" r="3.1" />
            <path d="M19.4 14.6a1.7 1.7 0 0 0 .34 1.87l.06.06a2.05 2.05 0 1 1-2.9 2.9l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.55V21a2.05 2.05 0 1 1-4.1 0v-.1a1.7 1.7 0 0 0-1.1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2.05 2.05 0 1 1-2.9-2.9l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1.03H3a2.05 2.05 0 1 1 0-4.1h.1a1.7 1.7 0 0 0 1.55-1.1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2.05 2.05 0 1 1 2.9-2.9l.06.06a1.7 1.7 0 0 0 1.87.34h.08a1.7 1.7 0 0 0 1.03-1.55V3a2.05 2.05 0 1 1 4.1 0v.1a1.7 1.7 0 0 0 1.03 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2.05 2.05 0 1 1 2.9 2.9l-.06.06a1.7 1.7 0 0 0-.34 1.87v.08a1.7 1.7 0 0 0 1.55 1.03H21a2.05 2.05 0 1 1 0 4.1h-.1a1.7 1.7 0 0 0-1.5 1.31z" />
        </Svg>
    );
}

/* ------------------------------ 通用 ------------------------------ */

export function IconEye(props: IconProps) {
    return (
        <Svg {...props}>
            <path d="M2.5 12S6 5.75 12 5.75 21.5 12 21.5 12 18 18.25 12 18.25 2.5 12 2.5 12z" />
            <circle cx="12" cy="12" r="3" />
        </Svg>
    );
}

export function IconEyeOff(props: IconProps) {
    return (
        <Svg {...props}>
            <path d="M9.6 5.98A9.6 9.6 0 0 1 12 5.75c6 0 9.5 6.25 9.5 6.25a18.4 18.4 0 0 1-3.1 3.83M6.2 7.6A18.2 18.2 0 0 0 2.5 12S6 18.25 12 18.25a9.9 9.9 0 0 0 4.05-.83" />
            <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
            <path d="M3.5 3.5l17 17" />
        </Svg>
    );
}

export function IconChevronLeft(props: IconProps) {
    return (
        <Svg {...props}>
            <path d="M14.5 5.5 8 12l6.5 6.5" />
        </Svg>
    );
}

export function IconChevronRight(props: IconProps) {
    return (
        <Svg {...props}>
            <path d="M9.5 5.5 16 12l-6.5 6.5" />
        </Svg>
    );
}

export function IconCheck(props: IconProps) {
    return (
        <Svg {...props}>
            <path d="M4.5 12.5 9.5 17.5 19.5 6.5" />
        </Svg>
    );
}

/** 外观 / 强调色 */
export function IconPalette(props: IconProps) {
    return (
        <Svg {...props}>
            <circle cx="12" cy="12" r="9.25" />
            <circle cx="9" cy="9.6" r="1.15" fill="currentColor" stroke="none" />
            <circle cx="14.6" cy="8.6" r="1.15" fill="currentColor" stroke="none" />
            <circle cx="15.6" cy="14.2" r="1.15" fill="currentColor" stroke="none" />
            <circle cx="9.6" cy="15.2" r="1.15" fill="currentColor" stroke="none" />
        </Svg>
    );
}

/** 界面密度 */
export function IconDensity(props: IconProps) {
    return (
        <Svg {...props}>
            <path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" />
        </Svg>
    );
}

/** 动效开关 */
export function IconActivity(props: IconProps) {
    return (
        <Svg {...props}>
            <path d="M3.5 12h3l2-5.5 2.6 11 2.4-7 1.8 3.5h5.2" />
        </Svg>
    );
}

/** 卡 / 账户 */
export function IconCard(props: IconProps) {
    return (
        <Svg {...props}>
            <rect x="2.75" y="5.25" width="18.5" height="13.5" rx="3" />
            <path d="M2.75 9.75h18.5M6.5 14.5h4" />
        </Svg>
    );
}

/** 隐私 / 隐藏金额 */
export function IconEyeSlashBox(props: IconProps) {
    return (
        <Svg {...props}>
            <rect x="3" y="4.5" width="18" height="15" rx="3" />
            <path d="M7.5 12h9" />
        </Svg>
    );
}

export function IconBell(props: IconProps) {
    return (
        <Svg {...props}>
            <path d="M18 9.5a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16s-2-1.5-2-6.5z" />
            <path d="M10.2 19.2a2.1 2.1 0 0 0 3.6 0" />
        </Svg>
    );
}

export function IconShield(props: IconProps) {
    return (
        <Svg {...props}>
            <path d="M12 3.2 5 6v5.6c0 4.3 2.9 8.1 7 9.2 4.1-1.1 7-4.9 7-9.2V6z" />
            <path d="M9.4 12.2 11.3 14l3.5-3.6" />
        </Svg>
    );
}

export function IconInfo(props: IconProps) {
    return (
        <Svg {...props}>
            <circle cx="12" cy="12" r="9.25" />
            <path d="M12 11v5.5M12 7.8h.01" />
        </Svg>
    );
}

/** 扫码取景框 */
export function IconScan(props: IconProps) {
    return (
        <Svg {...props}>
            <path d="M3 8.5v-3A2.5 2.5 0 0 1 5.5 3h3M15.5 3h3A2.5 2.5 0 0 1 21 5.5v3M21 15.5v3a2.5 2.5 0 0 1-2.5 2.5h-3M8.5 21h-3A2.5 2.5 0 0 1 3 18.5v-3" />
            <path d="M3.5 12h17" />
        </Svg>
    );
}

/** 资金调度：双向箭头 */
export function IconSwap(props: IconProps) {
    return (
        <Svg {...props}>
            <path d="M7.5 4.5v15M7.5 19.5 4.5 16.5M7.5 19.5l3-3" />
            <path d="M16.5 19.5v-15M16.5 4.5 13.5 7.5M16.5 4.5l3 3" />
        </Svg>
    );
}

/** 转账 */
export function IconSend(props: IconProps) {
    return (
        <Svg {...props}>
            <path d="M3.5 12h12M11 7.5 15.5 12 11 16.5" />
            <path d="M19.5 4.5v15" />
        </Svg>
    );
}

/** 分期 */
export function IconLayers(props: IconProps) {
    return (
        <Svg {...props}>
            <path d="M12 3.5 3.5 8l8.5 4.5L20.5 8z" />
            <path d="M3.5 12.5 12 17l8.5-4.5" />
        </Svg>
    );
}

/** AA 收款 */
export function IconUsers(props: IconProps) {
    return (
        <Svg {...props}>
            <circle cx="9.2" cy="8" r="3.2" />
            <path d="M3.2 19.5c0-3.2 2.7-5.5 6-5.5s6 2.3 6 5.5" />
            <path d="M16.2 5.3a3.2 3.2 0 0 1 0 6.1M17.8 14.5c2 .7 3.3 2.5 3.3 5" />
        </Svg>
    );
}

/** 二维码 */
export function IconQr(props: IconProps) {
    return (
        <Svg {...props}>
            <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
            <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
            <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
            <path d="M13.8 13.8h2.4v2.4h-2.4zM18.6 13.8h1.6M13.8 18.6h1.6M18.6 18.6h1.6v1.6h-1.6z" />
        </Svg>
    );
}

/** 刷新 */
export function IconRefresh(props: IconProps) {
    return (
        <Svg {...props}>
            <path d="M20 12a8 8 0 1 1-2.5-5.8" />
            <path d="M20.6 4.2v4.6h-4.6" />
        </Svg>
    );
}
