import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { METHOD_META, MethodPanel } from './auth/MethodPanel';
import { PasswordPad } from './auth/PasswordPad';
import { FaceEcho, PortEcho } from './auth/PhysicalEcho';

export type AuthMethod = 'password' | 'face' | 'fido';

/** 原地按住多久展开键盘 */
const HOLD_MS = 700;
/** 位移超过这个距离就不算「原地」，长按计时回退 */
const STAY_TOLERANCE = 26;
/** 上下甩到这个距离就触发对应验证方式 */
const FLICK_DISTANCE = 46;

type Stage = 'idle' | 'holding' | 'password' | 'face' | 'fido';

/** 带硬件动画的两条路径共用这两个阶段：扫描中 → 定格成功 */
type Phase = 'scan' | 'success';

interface AuthButtonProps {
    /** 主文案，如「确认划转」 */
    label: string;
    /** 面板里回显的上下文，通常是金额 */
    context?: string;
    /** 三种方式任意一条走通后回调 */
    onAuthorized: (method: AuthMethod) => void;
    disabled?: boolean;
}

/**
 * 三向认证控件：一个按钮上压三个验证入口。
 * - 原地按住 0.7 秒 → 原地展开 6 位密码键盘
 * - 按住上滑 → 面容 ID（把手机举到面前）
 * - 按住下滑 → 安全密钥（把密钥贴到充电口）
 * 方向映射是按物理动作定的：向上是举起，向下是往机身底部贴。
 *
 * 面容 / 密钥这两条路径除了按钮上方的面板，还会把同一套动画回显到硬件所在的位置：
 * 感应框去屏幕顶部，NFC 纹波去屏幕底部。
 */
export function AuthButton({
    label,
    context,
    onAuthorized,
    disabled = false,
}: AuthButtonProps) {
    const [stage, setStage] = useState<Stage>('idle');
    const [progress, setProgress] = useState(0);
    const [aim, setAim] = useState<'up' | 'down' | null>(null);
    /**
     * 阶段放在这里而不是面板里：顶部的感应框和底部的纹波要跟面板共用同一个值，
     * 否则三个地方各跑一套计时，一定是差半拍的。
     */
    const [phase, setPhase] = useState<Phase>('scan');

    const startRef = useRef<{ x: number; y: number } | null>(null);
    const movedRef = useRef(false);
    const heldRef = useRef(0);
    const lastRef = useRef(0);
    const rafRef = useRef(0);

    const stopTicker = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
    };

    useEffect(() => stopTicker, []);

    const authorizedRef = useRef(onAuthorized);
    useEffect(() => {
        authorizedRef.current = onAuthorized;
    });

    /* 带硬件动画的两条路径：扫描 → 定格成功 → 交回授权。面板与两处回显共用这个 phase */
    useEffect(() => {
        if (stage !== 'face' && stage !== 'fido') return;
        const meta = METHOD_META[stage];
        setPhase('scan');
        const timers = [
            window.setTimeout(() => setPhase('success'), meta.scan),
            window.setTimeout(() => authorizedRef.current(stage), meta.scan + meta.success),
        ];
        return () => timers.forEach((timer) => window.clearTimeout(timer));
    }, [stage]);

    const reset = () => {
        stopTicker();
        startRef.current = null;
        movedRef.current = false;
        heldRef.current = 0;
        setProgress(0);
        setAim(null);
        setStage('idle');
    };

    const handleDown = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (disabled || stage !== 'idle') return;
        event.preventDefault();
        try {
            event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
            /* 指针已失效或来自合成事件：捕获失败也不影响后续手势判定 */
        }

        startRef.current = { x: event.clientX, y: event.clientY };
        movedRef.current = false;
        heldRef.current = 0;
        lastRef.current = performance.now();
        setProgress(0);
        setAim(null);
        setStage('holding');

        const tick = (now: number) => {
            const delta = now - lastRef.current;
            lastRef.current = now;

            /* 只在「原地」累积；一旦移开就快速回退，避免边走边攒进度 */
            heldRef.current = movedRef.current
                ? Math.max(0, heldRef.current - delta * 2)
                : heldRef.current + delta;

            const next = Math.min(1, heldRef.current / HOLD_MS);
            setProgress(next);

            if (next >= 1) {
                stopTicker();
                startRef.current = null;
                setProgress(0);
                setStage('password');
                return;
            }
            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
    };

    const handleMove = (event: ReactPointerEvent<HTMLDivElement>) => {
        const start = startRef.current;
        if (!start || stage !== 'holding') return;

        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        const vertical = Math.abs(dy) > Math.abs(dx);

        movedRef.current = Math.hypot(dx, dy) > STAY_TOLERANCE;
        setAim(
            movedRef.current && vertical && Math.abs(dy) > FLICK_DISTANCE * 0.55
                ? dy < 0
                    ? 'up'
                    : 'down'
                : null,
        );

        if (vertical && Math.abs(dy) >= FLICK_DISTANCE) {
            stopTicker();
            startRef.current = null;
            setProgress(0);
            setAim(null);
            setStage(dy < 0 ? 'face' : 'fido');
        }
    };

    const handleUp = () => {
        if (stage !== 'holding') return;
        reset();
    };

    const panelOpen = stage === 'password' || stage === 'face' || stage === 'fido';

    return (
        <div
            className="auth"
            data-stage={stage}
            data-aim={aim ?? undefined}
            data-disabled={disabled || undefined}
        >
            {/* 同一套动画回显到硬件位置：感应框在顶部，纹波在底部 */}
            {stage === 'face' ? <FaceEcho phase={phase} /> : null}
            {stage === 'fido' ? <PortEcho phase={phase} /> : null}

            {panelOpen ? (
                <>
                    <div className="auth-scrim" aria-hidden="true" onClick={reset} />
                    <div className="auth-panel">
                        {stage === 'password' ? (
                            <PasswordPad
                                context={context}
                                onComplete={() => onAuthorized('password')}
                                onCancel={reset}
                            />
                        ) : null}
                        {stage === 'face' || stage === 'fido' ? (
                            <MethodPanel
                                method={stage}
                                context={context}
                                phase={phase}
                                onCancel={reset}
                            />
                        ) : null}
                    </div>
                </>
            ) : null}

            <div
                className="auth-trigger"
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-disabled={disabled}
                aria-label={`${label}：原地按住输入密码，上滑使用面容 ID，下滑使用安全密钥`}
                onPointerDown={handleDown}
                onPointerMove={handleMove}
                onPointerUp={handleUp}
                onPointerCancel={handleUp}
                onContextMenu={(event) => event.preventDefault()}
                onKeyDown={(event) => {
                    if (disabled) return;
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setStage('password');
                    }
                    if (event.key === 'Escape') reset();
                }}
            >
                <span className="auth-fill" style={{ transform: `scaleX(${progress})` }} />

                <span className="auth-dir auth-dir--up" data-active={aim === 'up'}>
                    ↑ 上滑 · 面容 ID
                </span>

                <span className="auth-body">
                    <span className="auth-label">{label}</span>
                    <span className="auth-sub">
                        {stage === 'holding' ? '按住不动 · 继续输入密码' : '按住不动输密码 · 上滑面容 · 下滑密钥'}
                    </span>
                </span>

                <span className="auth-dir auth-dir--down" data-active={aim === 'down'}>
                    ↓ 下滑 · 安全密钥
                </span>
            </div>
        </div>
    );
}
