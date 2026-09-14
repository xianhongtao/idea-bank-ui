import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
    useState,
    type Dispatch,
    type ReactNode,
} from 'react';
import { DEFAULT_ACCENT_HEX } from '../theme/accentPresets';
import { applyTheme, hexToHsl, resolveTheme } from '../theme/theme';
import { INITIAL_ACCOUNTS, INITIAL_TXNS } from '../mock/dataset';
import type { Account, Txn } from '../mock/types';
import { loadSettings, saveSettings } from './persist';
import type { Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
    themeMode: 'dark',
    accent: hexToHsl(DEFAULT_ACCENT_HEX),
    density: 'comfortable',
    chartMotion: true,
    hideAmount: false,
    notifyPush: true,
    notifyMarketing: false,
    biometric: true,
};

/** 跨屏幕传参的草稿（如「再来一次」预填转账） */
export interface TransferDraft {
    payee?: string;
    toAccountId?: string;
    amount?: number;
}

/** 业务数据 + 用户设置。业务数据不持久化，刷新即重置。 */
export interface AppState {
    settings: Settings;
    accounts: Account[];
    txns: Txn[];
    /** 配置页当前选中的账户 */
    selectedAccountId: string;
    /** 预填到转账 / 调度页的草稿 */
    draft: TransferDraft | null;
}

export type Action =
    | { type: 'settings/patch'; patch: Partial<Settings> }
    | { type: 'settings/reset' }
    | { type: 'txn/add'; txn: Txn }
    | { type: 'account/patch'; id: string; patch: Partial<Account> }
    | { type: 'ui/selectAccount'; id: string }
    | { type: 'ui/setDraft'; draft: TransferDraft | null }
    | { type: 'demo/reset' };

/** 日志流最多保留的条数 */
const MAX_TXNS = 400;

function createInitialState(): AppState {
    return {
        settings: { ...DEFAULT_SETTINGS, ...(loadSettings() ?? {}) },
        accounts: INITIAL_ACCOUNTS.map((account) => ({ ...account })),
        txns: INITIAL_TXNS.slice(),
        selectedAccountId: INITIAL_ACCOUNTS[0].id,
        draft: null,
    };
}

function reducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case 'settings/patch':
            return { ...state, settings: { ...state.settings, ...action.patch } };
        case 'settings/reset':
            return { ...state, settings: { ...DEFAULT_SETTINGS } };
        case 'txn/add':
            return { ...state, txns: [action.txn, ...state.txns].slice(0, MAX_TXNS) };
        case 'account/patch':
            return {
                ...state,
                accounts: state.accounts.map((account) =>
                    account.id === action.id ? { ...account, ...action.patch } : account,
                ),
            };
        case 'ui/selectAccount':
            return { ...state, selectedAccountId: action.id };
        case 'ui/setDraft':
            return { ...state, draft: action.draft };
        case 'demo/reset':
            return { ...createInitialState(), settings: state.settings };
        default:
            return state;
    }
}

/** 跟随系统深色/浅色的实时偏好 */
function usePrefersLight(): boolean {
    const [prefersLight, setPrefersLight] = useState(
        () => window.matchMedia('(prefers-color-scheme: light)').matches,
    );

    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: light)');
        const onChange = (event: MediaQueryListEvent) => setPrefersLight(event.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    return prefersLight;
}

interface StoreValue {
    state: AppState;
    settings: Settings;
    accounts: Account[];
    txns: Txn[];
    dispatch: Dispatch<Action>;
    resolvedTheme: 'dark' | 'light';
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

    const prefersLight = usePrefersLight();
    const { settings, accounts, txns } = state;
    const resolvedTheme = resolveTheme(settings.themeMode, prefersLight);
    const { accent, density } = settings;

    useEffect(() => {
        applyTheme({ resolved: resolvedTheme, accent, density });
    }, [resolvedTheme, accent, density]);

    useEffect(() => {
        saveSettings(settings);
    }, [settings]);

    const value = useMemo<StoreValue>(
        () => ({ state, settings, accounts, txns, dispatch, resolvedTheme }),
        [state, settings, accounts, txns, resolvedTheme],
    );

    return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
    const ctx = useContext(StoreContext);
    if (!ctx) throw new Error('useStore 必须在 StoreProvider 内部使用');
    return ctx;
}

export function useSettings(): Settings {
    return useStore().settings;
}

export function useAccounts(): Account[] {
    return useStore().accounts;
}

export function useTxns(): Txn[] {
    return useStore().txns;
}

export function useAccount(id: string): Account | undefined {
    const accounts = useStore().accounts;
    return accounts.find((account) => account.id === id);
}

export function useSelectedAccountId(): string {
    return useStore().state.selectedAccountId;
}

export function useDraft(): TransferDraft | null {
    return useStore().state.draft;
}

export function useDispatch(): Dispatch<Action> {
    return useStore().dispatch;
}

export function useUpdateSettings(): (patch: Partial<Settings>) => void {
    const { dispatch } = useStore();
    return useCallback(
        (patch: Partial<Settings>) => dispatch({ type: 'settings/patch', patch }),
        [dispatch],
    );
}

export function useResetSettings(): () => void {
    const { dispatch } = useStore();
    return useCallback(() => dispatch({ type: 'settings/reset' }), [dispatch]);
}
