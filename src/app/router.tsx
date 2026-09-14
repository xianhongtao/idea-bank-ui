import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import { TABS, type TabKey } from './tabs';

/** 导航方向，用于决定屏幕过场动画 */
export type NavDir = 'push' | 'pop' | 'none';

export interface Location {
    /** 当前激活的根节点 */
    tab: TabKey;
    /** 叠加在该节点之上的屏幕段，例如 /observe/acc-1 → ['acc-1'] */
    segments: string[];
    path: string;
    depth: number;
}

const ROOT: Location = { tab: 'observe', segments: [], path: '/observe', depth: 0 };

function isTab(value: string | undefined): value is TabKey {
    return value !== undefined && (TABS as readonly string[]).includes(value);
}

export function parseLocation(hash: string): Location {
    const parts = hash.replace(/^#/, '').split('/').filter(Boolean);
    const [first, ...rest] = parts;
    if (!isTab(first)) return ROOT;
    return {
        tab: first,
        segments: rest,
        path: `/${[first, ...rest].join('/')}`,
        depth: rest.length,
    };
}

function absoluteUrl(path: string): string {
    const { pathname, search } = window.location;
    return `${pathname}${search}#${path}`;
}

interface RouterValue {
    loc: Location;
    dir: NavDir;
    /** 切换根节点（替换式，不堆积历史） */
    setTab: (tab: TabKey) => void;
    /** 在当前节点上打开一个屏幕（入栈） */
    push: (segment: string) => void;
    /** 返回上一屏 */
    back: () => void;
}

const RouterContext = createContext<RouterValue | null>(null);

export function RouterProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<{ loc: Location; dir: NavDir }>(() => ({
        loc: parseLocation(window.location.hash),
        dir: 'none',
    }));

    useEffect(() => {
        if (!window.location.hash) {
            window.history.replaceState(null, '', absoluteUrl('/observe'));
        }

        const onHashChange = () => {
            setState((prev) => {
                const loc = parseLocation(window.location.hash);
                if (loc.path === prev.loc.path) return prev;
                const dir: NavDir =
                    loc.depth > prev.loc.depth ? 'push' : loc.depth < prev.loc.depth ? 'pop' : 'none';
                return { loc, dir };
            });
        };

        window.addEventListener('hashchange', onHashChange);
        return () => window.removeEventListener('hashchange', onHashChange);
    }, []);

    const setTab = useCallback((tab: TabKey) => {
        const current = parseLocation(window.location.hash);
        if (current.tab === tab && current.depth === 0) return;
        window.location.replace(absoluteUrl(`/${tab}`));
    }, []);

    const push = useCallback((segment: string) => {
        const current = parseLocation(window.location.hash);
        const target = `/${current.tab}/${segment}`;
        if (current.path === target) return;
        if (current.depth > 0) {
            window.location.replace(absoluteUrl(target));
        } else {
            window.location.hash = target;
        }
    }, []);

    const back = useCallback(() => {
        const current = parseLocation(window.location.hash);
        if (current.depth === 0) return;
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.replace(absoluteUrl(`/${current.tab}`));
        }
    }, []);

    const value = useMemo<RouterValue>(
        () => ({ loc: state.loc, dir: state.dir, setTab, push, back }),
        [state, setTab, push, back],
    );

    return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter(): RouterValue {
    const ctx = useContext(RouterContext);
    if (!ctx) throw new Error('useRouter 必须在 RouterProvider 内部使用');
    return ctx;
}
