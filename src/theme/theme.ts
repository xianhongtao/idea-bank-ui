import type { AccentColor, Density, ThemeMode } from '../state/types';

/** 各主题下的页面底色，与 tokens.css 保持一致（用于同步 <meta name="theme-color">） */
export const THEME_BG: Record<'dark' | 'light', string> = {
    dark: '#0a0b0d',
    light: '#f6f7f9',
};

/** 近黑前景色（浅色强调色填充时使用） */
const INK = '#0b0b10';

export function clamp(v: number, min: number, max: number): number {
    return Math.min(Math.max(v, min), max);
}

/* ------------------------------ 颜色转换 ------------------------------ */

export function hexToHsl(hex: string): AccentColor {
    const raw = hex.replace('#', '').trim();
    const full = raw.length === 3 ? raw.replace(/(.)/g, '$1$1') : raw;
    const r = parseInt(full.slice(0, 2), 16) / 255;
    const g = parseInt(full.slice(2, 4), 16) / 255;
    const b = parseInt(full.slice(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    const l = (max + min) / 2;

    let h = 0;
    let s = 0;

    if (d !== 0) {
        s = d / (1 - Math.abs(2 * l - 1));
        if (max === r) h = ((g - b) / d) % 6;
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h *= 60;
        if (h < 0) h += 360;
    }

    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const hp = (((h % 360) + 360) % 360) / 60;
    const x = c * (1 - Math.abs((hp % 2) - 1));
    let r = 0;
    let g = 0;
    let b = 0;

    if (hp < 1) [r, g, b] = [c, x, 0];
    else if (hp < 2) [r, g, b] = [x, c, 0];
    else if (hp < 3) [r, g, b] = [0, c, x];
    else if (hp < 4) [r, g, b] = [0, x, c];
    else if (hp < 5) [r, g, b] = [x, 0, c];
    else[r, g, b] = [c, 0, x];

    const m = l - c / 2;
    return { r: r + m, g: g + m, b: b + m };
}

export function hslToHex(color: AccentColor): string {
    const { r, g, b } = hslToRgb(color.h, color.s / 100, color.l / 100);
    const to = (v: number) =>
        Math.round(clamp(v, 0, 1) * 255)
            .toString(16)
            .padStart(2, '0');
    return `#${to(r)}${to(g)}${to(b)}`;
}

/** 相对亮度（WCAG） */
function relativeLuminance(rgb: { r: number; g: number; b: number }): number {
    const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return 0.2126 * lin(rgb.r) + 0.7152 * lin(rgb.g) + 0.0722 * lin(rgb.b);
}

/** 在给定填充色上选择可读前景色（黑或白） */
export function readableOn(rgb: { r: number; g: number; b: number }): string {
    const l = relativeLuminance(rgb);
    const withWhite = 1.05 / (l + 0.05);
    const inkRgb = { r: 11 / 255, g: 11 / 255, b: 16 / 255 };
    const withInk = (l + 0.05) / (relativeLuminance(inkRgb) + 0.05);
    return withWhite >= withInk ? '#ffffff' : INK;
}

/* ------------------------------ 主题判定 ------------------------------ */

export function resolveTheme(mode: ThemeMode, prefersLight: boolean): 'dark' | 'light' {
    if (mode === 'light') return 'light';
    if (mode === 'dark') return 'dark';
    return prefersLight ? 'light' : 'dark';
}

/* ------------------------------ 应用主题 ------------------------------ */

export interface ApplyThemeOptions {
    resolved: 'dark' | 'light';
    accent: AccentColor;
    density: Density;
}

/**
 * 把设置写入 documentElement。
 * - --accent-l：用于填充（浅色主题下钳制亮度，保证白字仍可读）
 * - --accent-l-text：用于文字/图标（深色提亮、浅色压暗，保证对比度）
 */
export function applyTheme({ resolved, accent, density }: ApplyThemeOptions): void {
    const root = document.documentElement;
    root.dataset.theme = resolved;
    root.dataset.density = density;

    const fillL = resolved === 'dark' ? accent.l : Math.min(accent.l, 56);
    const textL = resolved === 'dark' ? clamp(accent.l, 60, 84) : Math.min(accent.l, 50);

    root.style.setProperty('--accent-h', String(accent.h));
    root.style.setProperty('--accent-s', `${accent.s}%`);
    root.style.setProperty('--accent-l', `${fillL}%`);
    root.style.setProperty('--accent-l-text', `${textL}%`);
    root.style.setProperty(
        '--accent-fg',
        readableOn(hslToRgb(accent.h, accent.s / 100, fillL / 100)),
    );

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_BG[resolved]);
}
