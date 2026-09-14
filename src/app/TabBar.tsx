import { useRouter } from './router';
import { TAB_META, TABS } from './tabs';

export function TabBar() {
    const { loc, setTab } = useRouter();
    const activeIndex = TABS.indexOf(loc.tab);

    return (
        <nav className="tabbar" role="tablist" aria-label="主导航">
            <span
                className="tabbar-indicator"
                style={{ transform: `translateX(${activeIndex * 100}%)` }}
            />
            {TABS.map((key) => {
                const meta = TAB_META[key];
                const Icon = meta.Icon;
                const selected = key === loc.tab;
                return (
                    <button
                        key={key}
                        type="button"
                        role="tab"
                        className="tab"
                        aria-selected={selected}
                        onClick={() => setTab(key)}
                    >
                        <Icon size={22} />
                        <span className="tab-label">{meta.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
