import { FaceGlyph } from './FaceGlyph';
import { KeyGlyph } from './KeyGlyph';

type Method = 'face' | 'fido';

interface MethodMeta {
  title: string;
  caption: string;
  /** 扫描阶段时长 */
  scan: number;
  /** 成功定格时长 */
  success: number;
}

export const METHOD_META: Record<Method, MethodMeta> = {
  face: { title: '面容 ID', caption: '请将手机举到面前', scan: 1700, success: 700 },
  fido: { title: '安全密钥', caption: '将密钥贴近充电口', scan: 1500, success: 700 },
};

interface MethodPanelProps {
  method: Method;
  context?: string;
  /** 阶段由 AuthButton 统一驱动：面板和物理位置的回显共用同一个值，保证同步 */
  phase: 'scan' | 'success';
  onCancel: () => void;
}

/**
 * 面容 / 安全密钥的验证面板：只负责画。
 * 计时（scan → success → 交回授权）挪到了 AuthButton，
 * 因为屏幕顶部 / 底部的回显也要跟着同一个 phase 走。
 */
export function MethodPanel({ method, context, phase, onCancel }: MethodPanelProps) {
  const meta = METHOD_META[method];

  return (
    <div className="method" data-phase={phase}>
      <div className="pad-head">
        <span className="pad-title">{meta.title}</span>
        {context ? <span className="pad-context mono">{context}</span> : null}
      </div>

      <div className="method-glyph">
        {method === 'face' ? <FaceGlyph phase={phase} /> : <KeyGlyph phase={phase} />}
      </div>

      <p className="method-caption">{phase === 'scan' ? meta.caption : '验证通过'}</p>

      <div className="pad-foot">
        <span className="pad-hint">{phase === 'scan' ? '正在验证…' : '已通过'}</span>
        <button type="button" className="pad-cancel" onClick={onCancel}>
          取消
        </button>
      </div>
    </div>
  );
}
