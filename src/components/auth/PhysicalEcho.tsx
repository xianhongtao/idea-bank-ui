import { FaceGlyph } from './FaceGlyph';
import { NfcRipples } from './KeyGlyph';

type Phase = 'scan' | 'success';

/**
 * 把面板里那两套动画**原样复制**到硬件的物理位置上：
 *
 * - 面容感应框 → 屏幕顶部中心（Face ID 传感器在机身顶部）
 * - NFC 纹波   → 屏幕底部中心（充电口在机身底部）
 *
 * 这里不新造动画：图形元素和 CSS 关键帧都跟面板里那份完全共用，
 * 所以两边永远同步、也不会出现「同一件事两套画法」。
 */

export function FaceEcho({ phase }: { phase: Phase }) {
  return (
    <div className="echo echo--face" aria-hidden="true">
      <FaceGlyph phase={phase} />
    </div>
  );
}

export function PortEcho({ phase }: { phase: Phase }) {
  return (
    <div className="echo echo--port" data-phase={phase} aria-hidden="true">
      <svg className="port-echo" viewBox="0 0 100 100">
        <NfcRipples />
      </svg>
    </div>
  );
}
