import type { Settings } from './types';

/** 与 index.html 内联脚本中使用的 key 必须一致 */
export const SETTINGS_KEY = 'aurora.settings.v1';

export function loadSettings(): Partial<Settings> | null {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (!raw) return null;
        const parsed: unknown = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return null;

        const candidate = parsed as Partial<Settings>;
        const out: Partial<Settings> = {};

        if (
            candidate.themeMode === 'dark' ||
            candidate.themeMode === 'light' ||
            candidate.themeMode === 'system'
        ) {
            out.themeMode = candidate.themeMode;
        }
        if (candidate.density === 'comfortable' || candidate.density === 'compact') {
            out.density = candidate.density;
        }
        const accent = candidate.accent;
        if (
            accent &&
            typeof accent.h === 'number' &&
            typeof accent.s === 'number' &&
            typeof accent.l === 'number'
        ) {
            out.accent = { h: accent.h, s: accent.s, l: accent.l };
        }
        if (typeof candidate.chartMotion === 'boolean') out.chartMotion = candidate.chartMotion;
        if (typeof candidate.hideAmount === 'boolean') out.hideAmount = candidate.hideAmount;
        if (typeof candidate.notifyPush === 'boolean') out.notifyPush = candidate.notifyPush;
        if (typeof candidate.notifyMarketing === 'boolean') {
            out.notifyMarketing = candidate.notifyMarketing;
        }
        if (typeof candidate.biometric === 'boolean') out.biometric = candidate.biometric;

        return out;
    } catch {
        return null;
    }
}

export function saveSettings(settings: Settings): void {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
        /* 隐私模式等场景下静默失败，不影响使用 */
    }
}
