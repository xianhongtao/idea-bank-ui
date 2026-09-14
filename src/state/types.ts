/** 主题模式：深色 / 浅色 / 跟随系统 */
export type ThemeMode = 'dark' | 'light' | 'system';

/** 界面密度 */
export type Density = 'comfortable' | 'compact';

/** 强调色以 HSL 分量存储，便于推导 dim / glow / 前景色 */
export interface AccentColor {
    h: number; // 0-360
    s: number; // 0-100
    l: number; // 0-100
}

/** 用户可持久化的设置（不含业务数据） */
export interface Settings {
    themeMode: ThemeMode;
    accent: AccentColor;
    density: Density;
    /** 图表与数字滚动动效开关 */
    chartMotion: boolean;
    /** 全局金额隐藏 */
    hideAmount: boolean;
    /** 交易提醒推送 */
    notifyPush: boolean;
    /** 营销与服务信息 */
    notifyMarketing: boolean;
    /** 生物识别校验 */
    biometric: boolean;
}
