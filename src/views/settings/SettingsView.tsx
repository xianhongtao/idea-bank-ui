import { useState, type ReactNode } from 'react';
import { useRouter } from '../../app/router';
import {
    IconActivity,
    IconBell,
    IconCard,
    IconChevronRight,
    IconEyeOff,
    IconInfo,
    IconPalette,
    IconRefresh,
    IconShield,
} from '../../components/icons';
import { Switch } from '../../components/Switch';
import { useDispatch, useSettings, useUpdateSettings } from '../../state/store';
import { DENSITY_LABEL, THEME_LABEL } from '../../theme/labels';

export function SettingsView() {
    const { push } = useRouter();
    const settings = useSettings();
    const updateSettings = useUpdateSettings();
    const dispatch = useDispatch();
    const [resetFlash, setResetFlash] = useState(false);

    const resetDemo = () => {
        dispatch({ type: 'demo/reset' });
        setResetFlash(true);
        window.setTimeout(() => setResetFlash(false), 2000);
    };

    return (
        <div className="view">
            <div className="group-label">外观</div>
            <div className="rows">
                <RowButton
                    icon={<IconPalette size={16} />}
                    label="主题与强调色"
                    hint={`${THEME_LABEL[settings.themeMode]} · ${DENSITY_LABEL[settings.density]}密度`}
                    onClick={() => push('appearance')}
                />
            </div>

            <div className="group-label">界面</div>
            <div className="rows">
                <RowSwitch
                    icon={<IconActivity size={16} />}
                    label="图表动效"
                    hint="柱状图、环图与数字滚动"
                    checked={settings.chartMotion}
                    onChange={(next) => updateSettings({ chartMotion: next })}
                />
                <RowSwitch
                    icon={<IconEyeOff size={16} />}
                    label="金额默认隐藏"
                    hint="打开应用时金额以掩码显示"
                    checked={settings.hideAmount}
                    onChange={(next) => updateSettings({ hideAmount: next })}
                />
            </div>

            <div className="group-label">通知</div>
            <div className="rows">
                <RowSwitch
                    icon={<IconBell size={16} />}
                    label="交易提醒推送"
                    hint="超过阈值时即时通知"
                    checked={settings.notifyPush}
                    onChange={(next) => updateSettings({ notifyPush: next })}
                />
                <RowSwitch
                    icon={<IconBell size={16} />}
                    label="营销与服务信息"
                    hint="产品推荐、活动与调研"
                    checked={settings.notifyMarketing}
                    onChange={(next) => updateSettings({ notifyMarketing: next })}
                />
            </div>

            <div className="group-label">安全</div>
            <div className="rows">
                <RowSwitch
                    icon={<IconShield size={16} />}
                    label="生物识别"
                    hint="进入应用与大额确认时校验"
                    checked={settings.biometric}
                    onChange={(next) => updateSettings({ biometric: next })}
                />
                <RowButton
                    icon={<IconCard size={16} />}
                    label="设备与登录"
                    hint="查看登录记录并下线其他设备"
                    onClick={() => push('devices')}
                />
            </div>

            <div className="group-label">关于</div>
            <div className="rows">
                <RowButton
                    icon={<IconInfo size={16} />}
                    label="关于极光银行 Demo"
                    value="v0.1.0"
                    onClick={() => push('about')}
                />
                <RowButton
                    icon={<IconRefresh size={16} />}
                    label="重置演示数据"
                    hint={resetFlash ? '已重置，流水恢复初始状态' : '恢复初始账户与流水（保留设置）'}
                    onClick={resetDemo}
                />
            </div>
        </div>
    );
}

interface RowButtonProps {
    icon: ReactNode;
    label: string;
    hint?: string;
    value?: string;
    onClick: () => void;
}

function RowButton({ icon, label, hint, value, onClick }: RowButtonProps) {
    return (
        <button type="button" className="row row--tap" onClick={onClick}>
            <span className="row-icon">{icon}</span>
            <span className="row-label">
                {label}
                {hint ? <span className="row-hint">{hint}</span> : null}
            </span>
            {value ? <span className="row-value">{value}</span> : null}
            <IconChevronRight size={16} className="row-chevron" />
        </button>
    );
}

interface RowSwitchProps {
    icon: ReactNode;
    label: string;
    hint: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

function RowSwitch({ icon, label, hint, checked, onChange }: RowSwitchProps) {
    return (
        <div className="row">
            <span className="row-icon">{icon}</span>
            <span className="row-label">
                {label}
                <span className="row-hint">{hint}</span>
            </span>
            <Switch checked={checked} onChange={onChange} ariaLabel={label} />
        </div>
    );
}
