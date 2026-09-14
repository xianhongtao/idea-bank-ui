import type { Density, ThemeMode } from '../state/types';

export const THEME_LABEL: Record<ThemeMode, string> = {
    dark: '深色',
    light: '浅色',
    system: '跟随系统',
};

export const DENSITY_LABEL: Record<Density, string> = {
    comfortable: '标准',
    compact: '紧凑',
};
