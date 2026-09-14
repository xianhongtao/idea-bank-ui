import { useMemo, useState } from 'react';
import { useRouter } from '../../app/router';
import { IconRefresh } from '../../components/icons';
import { Pill } from '../../components/Pill';
import { QrCode } from '../../components/QrCode';
import { SegmentedControl } from '../../components/SegmentedControl';
import { cx } from '../../lib/cx';
import { useNow } from '../../lib/hooks';
import { KIND_LABEL } from '../../mock/labels';
import { useAccounts, useSelectedAccountId } from '../../state/store';

type Mode = 'pay' | 'receive';

/** 付款码 / 收款码：白色码面 + 每分钟自动刷新 */
export function PayCodeView() {
    const { loc, push } = useRouter();
    const accounts = useAccounts();
    const selectedId = useSelectedAccountId();
    const now = useNow(1000);

    const mode: Mode = loc.segments[0] === 'receive' ? 'receive' : 'pay';
    const [accountId, setAccountId] = useState(selectedId);
    const account = accounts.find((item) => item.id === accountId) ?? accounts[0];

    const minute = Math.floor(now / 60_000);
    const remain = 60 - (Math.floor(now / 1000) % 60);
    const seed = `${mode}-${account?.id ?? 'none'}-${minute}`;

    /* 条码：由种子确定性推导出条纹宽度 */
    const bars = useMemo(() => {
        const codes = seed.split('').map((char) => char.charCodeAt(0));
        return Array.from({ length: 46 }, (_, index) => {
            const value = (codes[index % codes.length] ?? 40) + index * 13;
            return { width: 1 + (value % 3), gap: 1 + ((value >> 2) % 2) };
        });
    }, [seed]);

    if (!account) {
        return <p className="empty">没有可用的账户。</p>;
    }

    return (
        <div className="stack">
            <SegmentedControl<Mode>
                ariaLabel="码类型"
                value={mode}
                onChange={(next) => push(next === 'receive' ? 'receive' : 'pay')}
                options={[
                    { value: 'pay', label: '付款码' },
                    { value: 'receive', label: '收款码' },
                ]}
            />

            <section className="code-card">
                <span className="code-card-title">
                    {mode === 'pay' ? '向商家出示付款码' : '向对方出示收款码'}
                </span>

                <div className="qr-plate">
                    <QrCode seed={seed} />
                </div>

                <div className="barcode" aria-hidden="true">
                    {bars.map((bar, index) => (
                        <span
                            key={index}
                            style={{ width: `${bar.width}px`, marginRight: `${bar.gap}px` }}
                        />
                    ))}
                </div>

                <span className="code-serial mono">
                    {account.kind === 'credit' ? '信用卡' : '储蓄卡'} · {account.tail} · 尾号唯一
                </span>

                <span className="code-refresh">
                    <IconRefresh size={13} />
                    {remain} 秒后自动更新
                </span>
            </section>

            <div className="flow-chips">
                {accounts.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        className="flow-chip"
                        aria-pressed={item.id === account.id}
                        onClick={() => setAccountId(item.id)}
                    >
                        <span className="flow-chip-name">{item.product}</span>
                        <span className="flow-chip-sub mono">{KIND_LABEL[item.kind]}</span>
                    </button>
                ))}
            </div>

            <p className={cx('muted', 'code-hint')}>
                演示图形，不可真实扫描；真实产品中码面由服务端签发并带时效签名。
            </p>

            <div className="card card-pad">
                <div className="card-head">
                    <span className="card-title">安全提示</span>
                    <Pill tone="warn">注意</Pill>
                </div>
                <p className="card-desc">
                    付款码等同于现金，请勿截图外发。收款码可长期出示，但也建议核对到账通知。
                </p>
            </div>
        </div>
    );
}
