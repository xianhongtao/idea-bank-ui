/** 可复现的伪随机数（mulberry32）——保证每次刷新看到的 mock 数据一致 */
export function createRng(seed: number): () => number {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function pick<T>(rng: () => number, list: readonly T[]): T {
    return list[Math.floor(rng() * list.length)];
}

export function pickWeighted<T>(rng: () => number, entries: ReadonlyArray<readonly [T, number]>): T {
    const total = entries.reduce((sum, entry) => sum + entry[1], 0);
    let roll = rng() * total;
    for (const [value, weight] of entries) {
        roll -= weight;
        if (roll <= 0) return value;
    }
    return entries[entries.length - 1][0];
}

export function randInt(rng: () => number, min: number, max: number): number {
    return Math.floor(rng() * (max - min + 1)) + min;
}

export function randFloat(rng: () => number, min: number, max: number): number {
    return rng() * (max - min) + min;
}

export function round2(value: number): number {
    return Math.round(value * 100) / 100;
}
