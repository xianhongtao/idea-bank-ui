import type { CategoryKey, TxnType } from './types';

export const CATEGORY_LABEL: Record<CategoryKey, string> = {
    dining: '餐饮',
    transport: '交通',
    shopping: '购物',
    groceries: '日用',
    entertainment: '娱乐',
    utilities: '缴费',
    housing: '居住',
    medical: '医疗',
    travel: '旅行',
    other: '其他',
};

/** 分类权重（占比参考） */
export const CATEGORY_WEIGHTS: ReadonlyArray<readonly [CategoryKey, number]> = [
    ['dining', 26],
    ['transport', 15],
    ['shopping', 15],
    ['groceries', 13],
    ['entertainment', 9],
    ['other', 6],
    ['utilities', 5],
    ['travel', 5],
    ['housing', 3],
    ['medical', 3],
];

/** 单笔金额区间（元）——量级与月收入匹配，避免出现「支出远超收入」的假数据 */
export const AMOUNT_RANGE: Record<CategoryKey, readonly [number, number]> = {
    dining: [12, 88],
    transport: [3, 46],
    shopping: [29, 680],
    groceries: [18, 168],
    entertainment: [15, 158],
    utilities: [28, 260],
    housing: [1800, 2600],
    medical: [46, 380],
    travel: [280, 1600],
    other: [10, 220],
};

/** 虚构商户名（避免使用真实品牌） */
export const MERCHANTS: Record<CategoryKey, readonly string[]> = {
    dining: ['山野小馆', '琥珀咖啡', '午食町', '一面之缘', '炭火屋', '稻香食堂', '街角面包房'],
    transport: ['城市地铁', '快行网约车', '绿色单车', '环城加油', '机场快线', '立体车库'],
    shopping: ['万象城百货', '数码港', '家居生活馆', '衣橱季', '极客优选', '拾光书店'],
    groceries: ['邻里鲜生', '仓储会员店', '社区超市', '鲜到家', '晨光便利店'],
    entertainment: ['星光影城', '云音乐订阅', '蒸汽游戏平台', '剧本空间', '力量健身房'],
    utilities: ['城市电力', '移动通信', '城市燃气', '自来水公司', '宽带续费'],
    housing: ['物业管理费', '房租代扣', '家装分期', '家电维修'],
    medical: ['市立医院', '健康药房', '在线问诊', '体检中心'],
    travel: ['云端航空', '栖岸酒店', '民宿平台', '铁路客运', '租车服务'],
    other: ['生活服务', '其他消费', '公益捐赠', '快递代收'],
};

/** 交易类型 → 短标签（日志里的类型位） */
export const TYPE_LABEL: Record<TxnType, string> = {
    pos: '扫码',
    online: '线上',
    transfer: '转账',
    income: '入账',
    refund: '退款',
    subscription: '代扣',
    fee: '费用',
    repay: '还款',
    config: '配置',
};

export const TYPE_CHANNEL: Record<TxnType, readonly string[]> = {
    pos: ['扫码', 'NFC 闪付'],
    online: ['线上支付'],
    transfer: ['转账'],
    income: ['代发', '转账'],
    refund: ['原路退回'],
    subscription: ['自动代扣'],
    fee: ['系统扣收'],
    repay: ['自动还款', '主动还款'],
    config: ['应用内'],
};

/** 转账对象（虚构人名） */
export const PAYEES: readonly string[] = ['陈嘉树', '林知遥', '周砚', '李沐', '沈见山', '许屿'];
