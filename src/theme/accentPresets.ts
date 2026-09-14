export interface AccentPreset {
    id: string;
    name: string;
    hex: string;
}

/** 默认强调色：紫罗兰 */
export const DEFAULT_ACCENT_HEX = '#7c5cff';

export const ACCENT_PRESETS: AccentPreset[] = [
    { id: 'violet', name: '紫罗兰', hex: '#7c5cff' },
    { id: 'indigo', name: '靛蓝', hex: '#6366f1' },
    { id: 'cyan', name: '天青', hex: '#38bdf8' },
    { id: 'teal', name: '青碧', hex: '#2dd4bf' },
    { id: 'green', name: '翠绿', hex: '#4ade80' },
    { id: 'amber', name: '琥珀', hex: '#fbbf24' },
    { id: 'orange', name: '云橙', hex: '#f6821f' },
    { id: 'rose', name: '绯红', hex: '#fb7185' },
];
