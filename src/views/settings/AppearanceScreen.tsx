import { Card } from '../../components/Card';
import { SegmentedControl } from '../../components/SegmentedControl';
import { useSettings, useStore, useUpdateSettings } from '../../state/store';
import type { Density, ThemeMode } from '../../state/types';
import { ACCENT_PRESETS } from '../../theme/accentPresets';
import { DENSITY_LABEL, THEME_LABEL } from '../../theme/labels';
import { hexToHsl } from '../../theme/theme';

export function AppearanceScreen() {
    const settings = useSettings();
    const updateSettings = useUpdateSettings();
    const { resolvedTheme } = useStore();

    return (
        <>
            <div className="group-label">主题</div>
            <SegmentedControl<ThemeMode>
                ariaLabel="主题模式"
                value={settings.themeMode}
                onChange={(themeMode) => updateSettings({ themeMode })}
                options={[
                    { value: 'dark', label: '深色' },
                    { value: 'light', label: '浅色' },
                    { value: 'system', label: '跟随系统' },
                ]}
            />
            <p className="muted" style={{ marginTop: 8, paddingLeft: 2 }}>
                当前生效：{THEME_LABEL[resolvedTheme]}（
                {settings.themeMode === 'system' ? '跟随系统' : '手动指定'}）
            </p>

            <div className="group-label">强调色</div>
            <Card pad={false}>
                <div className="swatches">
                    {ACCENT_PRESETS.map((preset) => {
                        const hsl = hexToHsl(preset.hex);
                        const active =
                            Math.abs(settings.accent.h - hsl.h) <= 2 &&
                            Math.abs(settings.accent.s - hsl.s) <= 2 &&
                            Math.abs(settings.accent.l - hsl.l) <= 2;
                        return (
                            <button
                                key={preset.id}
                                type="button"
                                className="swatch"
                                style={{ color: preset.hex }}
                                aria-pressed={active}
                                aria-label={preset.name}
                                title={preset.name}
                                onClick={() => updateSettings({ accent: hsl })}
                            />
                        );
                    })}
                </div>
            </Card>
            <p className="muted" style={{ marginTop: 8, paddingLeft: 2 }}>
                浅色主题下会自动压低亮度，保证填充上的文字与正文对比度达标。
            </p>

            <div className="group-label">界面密度</div>
            <SegmentedControl<Density>
                ariaLabel="界面密度"
                value={settings.density}
                onChange={(density) => updateSettings({ density })}
                options={[
                    { value: 'comfortable', label: '标准' },
                    { value: 'compact', label: '紧凑' },
                ]}
            />
            <p className="muted" style={{ marginTop: 8, paddingLeft: 2 }}>
                当前：{DENSITY_LABEL[settings.density]}密度（切换后列表行高与间距即时变化）
            </p>
        </>
    );
}
