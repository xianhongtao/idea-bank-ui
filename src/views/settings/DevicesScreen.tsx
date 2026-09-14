import { useState } from 'react';
import { Pill } from '../../components/Pill';
import { IconCard } from '../../components/icons';

interface Device {
    id: string;
    name: string;
    meta: string;
    place: string;
    seen: string;
    current?: boolean;
}

const INITIAL_DEVICES: Device[] = [
    {
        id: 'iphone',
        name: 'iPhone 17 Pro',
        meta: 'iOS 27 · 已开启双重验证',
        place: '北京',
        seen: '当前在线',
        current: true,
    },
    {
        id: 'ipad',
        name: 'iPad Air',
        meta: 'iPadOS 27 · 免密登录',
        place: '北京',
        seen: '昨天 21:40',
    },
    {
        id: 'mac',
        name: 'MacBook Pro',
        meta: 'macOS 27 · 网页版',
        place: '上海',
        seen: '3 天前',
    },
];

interface LoginRecord {
    id: string;
    label: string;
    time: string;
    flagged?: boolean;
}

const LOGINS: LoginRecord[] = [
    { id: 'l1', label: 'iPhone 17 Pro · 北京', time: '今天 08:12' },
    { id: 'l2', label: 'MacBook Pro · 上海', time: '3 天前 14:26' },
    { id: 'l3', label: '未知设备 · 杭州', time: '9 天前 03:41', flagged: true },
];

/** 设备与登录：可下线设备，并回看近期登录记录 */
export function DevicesScreen() {
    const [devices, setDevices] = useState(INITIAL_DEVICES);

    return (
        <div className="stack">
            <section className="card card-pad">
                <div className="card-head">
                    <span className="card-title">已登录设备</span>
                    <Pill tone="outline">{devices.length} 台</Pill>
                </div>

                <div className="cfg-rows">
                    {devices.map((device) => (
                        <div key={device.id} className="device-row">
                            <span className="row-icon">
                                <IconCard size={16} />
                            </span>
                            <span className="row-label">
                                {device.name}
                                <span className="row-hint">
                                    {device.meta} · {device.place} · {device.seen}
                                </span>
                            </span>
                            {device.current ? (
                                <Pill tone="pos">本机</Pill>
                            ) : (
                                <button
                                    type="button"
                                    className="chip"
                                    onClick={() =>
                                        setDevices((list) => list.filter((item) => item.id !== device.id))
                                    }
                                >
                                    下线
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {devices.length === 1 ? (
                    <p className="muted cfg-note">仅剩当前设备。下线其他设备后重新登录需要再次验证。</p>
                ) : null}
            </section>

            <section className="card card-pad">
                <div className="card-head">
                    <span className="card-title">登录日志</span>
                    <Pill tone="warn">1 条异常</Pill>
                </div>
                <dl className="flow-preview">
                    {LOGINS.map((record) => (
                        <div key={record.id} className="flow-row">
                            <dt>{record.label}</dt>
                            <dd>
                                {record.time}
                                {record.flagged ? ' · 已拦截' : ''}
                            </dd>
                        </div>
                    ))}
                </dl>
                <p className="muted cfg-note">
                    异地或异常时间的登录会被二次校验；如非本人操作，建议立即修改支付密码。
                </p>
            </section>
        </div>
    );
}
