import { useMemo, useState } from 'react';
import { Amount } from '../../components/Amount';
import { Pill } from '../../components/Pill';
import { SegmentedControl } from '../../components/SegmentedControl';
import { KIND_LABEL } from '../../mock/labels';
import type { Txn } from '../../mock/types';
import { useAccounts, useTxns } from '../../state/store';
import { AccountCarousel } from './AccountCarousel';
import { buildOverview } from './analytics';
import { CardPack } from './CardPack';
import { CashflowChart } from './CashflowChart';
import { CategoryDonut } from './CategoryDonut';
import { OverviewPanel, type PeriodSummary } from './OverviewPanel';
import { SpendHeatmap } from './SpendHeatmap';
import { SpendMap } from './SpendMap';
import { StreamLog } from './StreamLog';

const THIRTY_DAYS = 30 * 86_400_000;

/** 观测面的三种视角：事件流 / 图表 / 地理 */
type Lens = 'stream' | 'chart' | 'map';

export function ObserveView() {
    const accounts = useAccounts();
    const txns = useTxns();
    const [lens, setLens] = useState<Lens>('stream');
    /** 卡包是否铺开。默认收拢，只给总体趋势 */
    const [packOpen, setPackOpen] = useState(false);
    /** 铺开后当前展示的那张卡——下方所有内容都跟随它 */
    const [activeIndex, setActiveIndex] = useState(0);

    const overview = useMemo(() => buildOverview(accounts), [accounts]);
    const totalSummary = useMemo(() => summarize(txns), [txns]);

    const activeAccount = accounts[activeIndex] ?? accounts[0];
    const scopedTxns = useMemo(
        () => txns.filter((txn) => txn.accountId === activeAccount.id),
        [txns, activeAccount.id],
    );
    const accountSummary = useMemo(() => summarize(scopedTxns), [scopedTxns]);

    /* ---------------- 收拢：卡包 + 总体趋势 ---------------- */
    if (!packOpen) {
        return (
            <div className="view">
                <CardPack accounts={accounts} overview={overview} onOpen={() => setPackOpen(true)} />
                <OverviewPanel overview={overview} summary={totalSummary} />
            </div>
        );
    }

    /* ---------------- 铺开：逐张卡片 + 完整观测面 ---------------- */
    return (
        <div className="view">
            <div className="pack-bar">
                <span className="pack-bar-title">我的账户</span>
                <span className="pack-bar-count">{accounts.length} 张</span>
                <button type="button" className="log-action" onClick={() => setPackOpen(false)}>
                    收起卡包
                </button>
            </div>

            <div className="unfold">
                <AccountCarousel activeIndex={activeIndex} onActiveIndexChange={setActiveIndex} />
            </div>

            <section className="card summary-card">
                <header className="scope-head">
                    <span className="scope-name">{activeAccount.product}</span>
                    <span className="scope-meta mono">
                        {KIND_LABEL[activeAccount.kind]} · •••• {activeAccount.tail}
                    </span>
                    <Pill tone="outline">近 30 天</Pill>
                </header>

                <div className="summary">
                    <div className="summary-cell">
                        <span className="summary-label">支出</span>
                        <Amount value={accountSummary.spend} className="summary-value" />
                    </div>
                    <div className="summary-cell">
                        <span className="summary-label">入账</span>
                        <Amount value={accountSummary.income} className="summary-value" />
                    </div>
                    <div className="summary-cell">
                        <span className="summary-label">交易笔数</span>
                        <span className="summary-value tnum">{accountSummary.count}</span>
                    </div>
                </div>
            </section>

            <SegmentedControl<Lens>
                ariaLabel="观测视角"
                value={lens}
                onChange={setLens}
                options={[
                    { value: 'stream', label: '流水' },
                    { value: 'chart', label: '图表' },
                    { value: 'map', label: '地图' },
                ]}
            />

            {/* key 里带上账户与视角：切卡或切视角时内容重新入场，暗示「换了一份数据」 */}
            <div className="scope-body" key={`${activeAccount.id}-${lens}`}>
                {lens === 'stream' ? <StreamLog accountId={activeAccount.id} /> : null}

                {lens === 'chart' ? (
                    <>
                        <CashflowChart accountId={activeAccount.id} />
                        <CategoryDonut accountId={activeAccount.id} />
                        <SpendHeatmap accountId={activeAccount.id} />
                    </>
                ) : null}

                {lens === 'map' ? <SpendMap accountId={activeAccount.id} /> : null}
            </div>
        </div>
    );
}

/** 统计一段时间内的支出 / 入账 / 笔数（还款是账户间划转，不计入） */
function summarize(list: readonly Txn[]): PeriodSummary {
    const since = Date.now() - THIRTY_DAYS;
    let spend = 0;
    let income = 0;
    let count = 0;

    for (const txn of list) {
        if (txn.ts < since || txn.type === 'config' || txn.type === 'repay') continue;
        count += 1;
        if (txn.amount < 0) spend += -txn.amount;
        else income += txn.amount;
    }

    return { spend, income, count };
}
