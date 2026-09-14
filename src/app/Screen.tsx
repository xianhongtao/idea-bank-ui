import type { ReactNode } from 'react';
import { IconChevronLeft } from '../components/icons';
import { useRouter, type NavDir } from './router';

interface ScreenProps {
    title: string;
    dir: NavDir;
    children: ReactNode;
    /** 右上角操作区 */
    actions?: ReactNode;
}

/** push 屏幕的统一外壳：返回键 + 标题 + 可滚动内容 */
export function Screen({ title, dir, children, actions }: ScreenProps) {
    const { back } = useRouter();

    return (
        <div className="screen" data-dir={dir}>
            <div className="screen-header">
                <div className="screen-header-inner">
                    <button type="button" className="icon-btn" onClick={back} aria-label="返回">
                        <IconChevronLeft size={20} />
                    </button>
                    <h1 className="screen-title">{title}</h1>
                    <span style={{ flex: 1 }} />
                    {actions}
                </div>
            </div>
            <div className="screen-body">{children}</div>
        </div>
    );
}
