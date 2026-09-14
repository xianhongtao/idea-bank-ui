import { Pill } from '../../components/Pill';
import { useAccounts, useTxns } from '../../state/store';

const FACTS = [
    ['产品名称', '极光银行 · 设计验证 Demo'],
    ['版本', 'v0.1.0'],
    ['构建', 'Vite 8 · React 19 · TypeScript 7'],
    ['设计语言', '深色科技风，四节点底部控制栏'],
];

/** 关于：说明 demo 的性质与数据来源 */
export function AboutScreen() {
    const accounts = useAccounts();
    const txns = useTxns();

    return (
        <div className="stack">
            <section className="card card-pad">
                <div className="card-head">
                    <span className="card-title">关于本 Demo</span>
                    <Pill tone="accent">非真实银行</Pill>
                </div>
                <p className="card-desc">
                    这是一个用于验证设计理念的原型，用来回答一个问题：
                    <strong>底部栏能否只保留四个「根部控制节点」——观测、行动、配置、设置——就把银行 App
                        的全部功能装下？</strong>
                    <br />
                    所有机构名、卡号、商户与流水均为虚构，不连接任何真实账户与后端。
                </p>
            </section>

            <section className="card card-pad">
                <div className="card-head">
                    <span className="card-title">构建信息</span>
                </div>
                <dl className="flow-preview">
                    {FACTS.map(([label, value]) => (
                        <div key={label} className="flow-row">
                            <dt>{label}</dt>
                            <dd>{value}</dd>
                        </div>
                    ))}
                </dl>
            </section>

            <section className="card card-pad">
                <div className="card-head">
                    <span className="card-title">演示数据</span>
                </div>
                <dl className="flow-preview">
                    <div className="flow-row">
                        <dt>账户数</dt>
                        <dd>{accounts.length}</dd>
                    </div>
                    <div className="flow-row">
                        <dt>流水条数</dt>
                        <dd>{txns.length}</dd>
                    </div>
                    <div className="flow-row">
                        <dt>数据生成方式</dt>
                        <dd>前端确定性伪随机</dd>
                    </div>
                    <div className="flow-row">
                        <dt>持久化范围</dt>
                        <dd>仅设置项，流水刷新即重置</dd>
                    </div>
                </dl>
            </section>
        </div>
    );
}
