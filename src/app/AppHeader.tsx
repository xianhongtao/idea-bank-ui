import { IconEye, IconEyeOff } from '../components/icons';
import { useSettings, useUpdateSettings } from '../state/store';
import { useRouter } from './router';
import { TAB_META } from './tabs';

export function AppHeader() {
    const { loc } = useRouter();
    const settings = useSettings();
    const updateSettings = useUpdateSettings();
    const meta = TAB_META[loc.tab];
    const BrandIcon = meta.Icon;

    return (
        <header className="header">
            <div className="header-inner">
                <span className="brand">
                    <BrandIcon size={16} />
                </span>

                <div className="header-titles">
                    <div className="header-title">
                        {meta.title}
                        <span className="live-dot" />
                    </div>
                    <div className="header-sub ellipsis">{meta.sub}</div>
                </div>

                <button
                    type="button"
                    className="icon-btn"
                    aria-pressed={settings.hideAmount}
                    aria-label={settings.hideAmount ? '显示金额' : '隐藏金额'}
                    onClick={() => updateSettings({ hideAmount: !settings.hideAmount })}
                >
                    {settings.hideAmount ? <IconEyeOff size={19} /> : <IconEye size={19} />}
                </button>
            </div>
        </header>
    );
}
