export interface City {
    id: string;
    name: string;
    /** 经度 */
    lon: number;
    /** 纬度 */
    lat: number;
}

/** 用于消费地图的城市坐标（真实经纬度，便于后续按同一投影绘制轮廓） */
export const CITIES: readonly City[] = [
    { id: 'beijing', name: '北京', lon: 116.41, lat: 39.9 },
    { id: 'shanghai', name: '上海', lon: 121.47, lat: 31.23 },
    { id: 'shenzhen', name: '深圳', lon: 114.06, lat: 22.54 },
    { id: 'guangzhou', name: '广州', lon: 113.26, lat: 23.13 },
    { id: 'hangzhou', name: '杭州', lon: 120.15, lat: 30.27 },
    { id: 'chengdu', name: '成都', lon: 104.07, lat: 30.57 },
    { id: 'chongqing', name: '重庆', lon: 106.55, lat: 29.56 },
    { id: 'wuhan', name: '武汉', lon: 114.3, lat: 30.59 },
    { id: 'xian', name: '西安', lon: 108.94, lat: 34.34 },
    { id: 'nanjing', name: '南京', lon: 118.8, lat: 32.06 },
    { id: 'changsha', name: '长沙', lon: 112.94, lat: 28.23 },
    { id: 'qingdao', name: '青岛', lon: 120.38, lat: 36.07 },
    { id: 'sanya', name: '三亚', lon: 109.51, lat: 18.25 },
];

export const CITY_NAMES: readonly string[] = CITIES.map((city) => city.name);

/** 交易发生地权重——北京占大头，符合「本地为主 + 偶尔出行」的真实分布 */
export const CITY_WEIGHTS: ReadonlyArray<readonly [string, number]> = [
    ['北京', 27],
    ['上海', 17],
    ['深圳', 11],
    ['杭州', 10],
    ['广州', 8],
    ['成都', 7],
    ['南京', 5],
    ['武汉', 4],
    ['西安', 3],
    ['青岛', 3],
    ['重庆', 3],
    ['长沙', 1],
    ['三亚', 1],
];

export function cityByName(name: string): City | undefined {
    return CITIES.find((city) => city.name === name);
}

/** 用户常驻地——消费地图上的弧线从这座城市发出 */
export const HOME_CITY = '北京';
