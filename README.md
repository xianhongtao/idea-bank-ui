# 极光银行 · 设计验证 Demo

一个竖屏优先的移动端银行界面原型，用来验证一个信息架构命题：

> **底部栏只保留四个「根部控制节点」——观测、行动、配置、设置——能否装下银行 App 的全部功能？**

所有机构名、卡号、商户与流水均为虚构，不连接任何真实账户与后端。

设计说明见 [DESIGN.md](./DESIGN.md)。

**在线预览**：<https://xianhongtao.github.io/idea-bank-ui/>

## 运行

```bash
npm install
npm run dev          # http://localhost:5173
```

其他命令：

```bash
npm run typecheck    # tsc --noEmit
npm run build        # 产物在 dist/
npm run preview      # 预览构建产物
```

**建议用桌面浏览器的设备模拟查看**：打开开发者工具的设备工具栏，选 iPhone 尺寸（393×852），
再用 360×800 与 320×568 复核一遍窄屏表现。

## 部署

推送到 `main` 即自动发布到 GitHub Pages（见 `.github/workflows/deploy.yml`）：

```
npm ci → npm run typecheck → npm run build → 上传 dist/ → actions/deploy-pages
```

首次需要在仓库设置里做两件事：

1. **Settings → Pages → Source 选「GitHub Actions」**（不需要 `gh-pages` 分支）
2. 免费账号下 Pages 只支持**公开**仓库；私有仓库需要 Pro / Team / Enterprise

几个已经踩平的坑：

- Pages 把站点挂在 `/<repo>/` 子路径下，所以构建时 `base` 必须是 `/idea-bank-ui/`（见 `vite.config.ts`），
  否则 `index.html` 里的 `/assets/...` 会 404。本地 dev 仍用根路径，不受影响。
- 路由是 **hash 路由**，所有页面共用一个 pathname，所以子路径部署**不需要**服务端 rewrite，也不需要 `404.html`。
- 走 Actions 部署时 GitHub 不会跑 Jekyll，因此不需要 `.nojekyll`。

### 排查：线上白屏

如果页面能打开但**完全空白**、控制台在要 `/src/main.tsx`，说明 Pages 的 Source 选成了
**「Deploy from a branch」**——那样发布的是仓库源码（开发版 `index.html`），不是构建产物。

特征是 Actions 里会同时出现两套运行记录：本仓库的 `Deploy to GitHub Pages`，以及 GitHub 内置的
`pages-build-deployment`。**两者都会显示成功，但分支部署会覆盖 Actions 的产物**，所以只要
`pages-build-deployment` 还在跑，就说明 Source 还是分支模式，改成「GitHub Actions」即可。

## 技术选型

| 项 | 选择 | 理由 |
| --- | --- | --- |
| 构建 | Vite 8 | 基于 Rolldown / Oxc，构建约 0.2 秒，且**不依赖 esbuild**，因此没有 postinstall 生命周期脚本 |
| 框架 | React 19 + TypeScript | 组件化与类型约束 |
| 依赖 | **只有 react / react-dom** | 图表、路由、状态、图标全部自研，视觉与行为完全可控 |
| 样式 | 原生 CSS + 自定义属性 | 设计令牌驱动，不用框架以避开预设风格 |

自研的部分：

- `src/app/router.tsx` —— 约 100 行的 hash 路由 + 屏幕栈，浏览器返回键天然可用
- `src/components/Sparkline.tsx`、`views/observe/*Chart*.tsx` —— 全部图表是手写 SVG
- `src/views/observe/cnOutline.ts` + `projection.ts` —— 手写经纬度轮廓与投影
- `src/components/QrCode.tsx` —— 由种子推导的伪二维码
- `src/state/store.tsx` —— Context + useReducer

## 目录

```
src/
├─ app/         tabs(四节点定义) router(nav) AppShell AppHeader TabBar Screen RouterOutlet
├─ theme/       tokens.css(设计令牌) theme.ts(主题与强调色) labels.ts accentPresets.ts
├─ state/       store.tsx(全局状态) persist.ts(设置持久化) types.ts
├─ mock/        types catalog cities accounts generator feed dataset
├─ lib/         cx format random time hooks
├─ components/  AccountCard Amount AuthButton Card Pill QrCode SegmentedControl Slider Sparkline Switch icons
│              auth/ FaceGlyph KeyGlyph MethodPanel PasswordPad PhysicalEcho
└─ views/
   ├─ observe/    ObserveView AccountCarousel AccountCard AccountDetailView StreamLog
   │              CashflowChart CategoryDonut SpendHeatmap SpendMap analytics projection cnOutline
   ├─ act/        ActView PayCodeView ScanView TransferView FundFlowView
   ├─ configure/  ConfigureView
   └─ settings/   SettingsView AppearanceScreen DevicesScreen AboutScreen
```

## 数据

`src/mock/generator.ts` 用固定种子的 mulberry32 生成 40 天、约 150 条流水，并**从流水反推**所有派生指标，
保证数据内部自洽：

- 账户的「近 30 天支出 / 入账」= 该账户流水的实际求和
- 卡片上的 30 天走势 = 从当前余额/已用额度**倒推**每日日终值
- Ⅱ类卡的「今日已用」「年度已用」同样来自流水
- 净资产走势 = 储蓄账户日终余额之和 − 信用卡当日已用之和（还款双边记账，不会污染曲线）

`src/mock/feed.ts` 每 6–13 秒生成一条新流水，模拟实时推送；`AppShell` 里只挂一个定时器，避免多实例重复生成。

## 手动验证清单

- [x] 四个节点可切换；二级页可用返回键 / 浏览器后退退回
- [x] 账户卡片可横滑吸附，圆点指示器同步
- [x] 观测页默认是收拢的卡包，点按后铺开成卡片轮播，可显式收起
- [x] 卡包收拢时下方只有净资产走势与资产构成，不出现流水/图表/地图
- [x] 铺开后滑到哪张卡，下方的小结与流水/图表/地图就换成哪张卡的数据
- [x] 观测页（铺开后）：流水 / 图表 / 地图三视角切换正常
- [x] 账单日志持续滚动，暂停按钮可冻结视图，新事件有入场动画
- [x] 点账户卡片进入详情，详情内「配置此账户」可跳转到配置页并预选
- [x] 资金调度：滑块上限随账户变化，预览实时更新
- [x] 三个动作页共用同一个认证控件：原地按住 0.7 秒从按钮正上方长出密码键盘，按住向上甩走面容 ID，按住向下甩走安全密钥，三条路径都能提交
- [x] 认证面板「原地展开」：面板下沿距按钮顶边 10px，393×852 下完整落在视口内；遮罩 / 取消 / `Esc` 都能退出
- [x] 面容 / 密钥的动画会各回显一份到硬件位置：感应框在屏幕顶部正中（84×84），NFC 纹波原点正好落在屏幕最底边上（`originY === innerHeight`）；两处与面板共用同一个 `phase`，同步切换
- [x] 认证控件键盘可达：`Enter` 直接开密码键盘，方向提示随位移点亮，删除键与 6 位上限正常
- [x] 认证面板打开时 320 / 393 两档宽度仍无横向溢出
- [x] 配置页改动即时生效，并在观测页日志出现对应事件
- [x] 主题（深/浅/跟随系统）、强调色、界面密度改完刷新仍保持
- [x] 金额隐藏开关联动全站金额
- [x] 320 / 360 / 393 三档宽度均无横向溢出
- [x] `npm run typecheck` 无错误；`npm run build` 通过（JS gzip 约 98 kB）

## 已知限制

- 无后端、无真实扫码、无推送；二维码为伪图形
- 浅色主题令牌完整，但只有「观测」页做过逐屏校准
- 未做 PWA（无 manifest / service worker）
- 转账与调度的余额变动只作用于内存，刷新即回到初始状态
