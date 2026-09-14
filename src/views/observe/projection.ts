/**
 * 极简等距圆柱投影：轮廓与城市点共用同一函数，保证两者永远对齐。
 * 经度按 35°N 的纬度圈缩放（cos35° ≈ 0.82），避免中国版图被横向拉宽。
 */
const GEO = {
    minLon: 73,
    maxLon: 135,
    minLat: 18,
    maxLat: 54,
    lonScale: 0.82,
} as const;

export const MAP_WIDTH = (GEO.maxLon - GEO.minLon) * GEO.lonScale;
export const MAP_HEIGHT = GEO.maxLat - GEO.minLat;

export function project(lon: number, lat: number): [number, number] {
    const x = (lon - GEO.minLon) * GEO.lonScale;
    const y = GEO.maxLat - lat;
    return [x, y];
}
