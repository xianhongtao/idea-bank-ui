import { useMemo } from 'react';
import { cx } from '../lib/cx';
import { createRng } from '../lib/random';

/** 模块数：29 × 29 与实际付款码的观感接近 */
const SIZE = 29;
/** 定位角尺寸 */
const FINDER = 7;

interface Module {
    x: number;
    y: number;
}

/** FNV-1a：把种子摊成整数，保证同一个账号每次画出的图形一致 */
function hashSeed(seed: string): number {
    let hash = 2166136261;
    for (let index = 0; index < seed.length; index += 1) {
        hash ^= seed.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

function buildModules(seed: string): Module[] {
    const rng = createRng(hashSeed(seed));
    const filled: boolean[][] = Array.from({ length: SIZE }, () =>
        new Array<boolean>(SIZE).fill(false),
    );

    /** 定位角及其一圈留白不参与随机填充 */
    const reserved = (x: number, y: number) =>
        (x < FINDER + 1 && y < FINDER + 1) ||
        (x > SIZE - FINDER - 2 && y < FINDER + 1) ||
        (x < FINDER + 1 && y > SIZE - FINDER - 2);

    for (let y = 0; y < SIZE; y += 1) {
        for (let x = 0; x < SIZE; x += 1) {
            if (reserved(x, y)) continue;
            filled[y][x] = rng() > 0.5;
        }
    }

    const modules: Module[] = [];
    for (let y = 0; y < SIZE; y += 1) {
        for (let x = 0; x < SIZE; x += 1) {
            if (filled[y][x]) modules.push({ x, y });
        }
    }

    for (const [originX, originY] of [
        [0, 0],
        [SIZE - FINDER, 0],
        [0, SIZE - FINDER],
    ]) {
        for (let y = 0; y < FINDER; y += 1) {
            for (let x = 0; x < FINDER; x += 1) {
                const ring = x === 0 || y === 0 || x === FINDER - 1 || y === FINDER - 1;
                const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
                if (ring || core) modules.push({ x: originX + x, y: originY + y });
            }
        }
    }

    return modules;
}

/** 演示用的伪二维码图形（不是可扫描的真实码） */
export function QrCode({ seed, className }: { seed: string; className?: string }) {
    const modules = useMemo(() => buildModules(seed), [seed]);

    return (
        <svg
            className={cx('qr', className)}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            role="img"
            aria-label="演示用二维码图形"
        >
            {modules.map((module) => (
                <rect key={`${module.x}-${module.y}`} x={module.x} y={module.y} width={1} height={1} />
            ))}
        </svg>
    );
}
