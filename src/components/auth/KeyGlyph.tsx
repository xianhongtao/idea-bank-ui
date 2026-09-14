interface KeyGlyphProps {
  phase: 'scan' | 'success';
}

/**
 * NFC 纹波：从钥匙与充电口的接触点扩散进机身。
 * 屏幕底部（充电口的物理位置）的回显要复用同一份图形，所以单独抽出来，
 * 避免两处各画一遍、越改越不像。
 */
export function NfcRipples() {
  return (
    <g className="fido-ripples">
      <circle className="fido-ripple" cx="50" cy="66" r="15" />
      <circle className="fido-ripple" cx="50" cy="66" r="15" />
      <circle className="fido-ripple" cx="50" cy="66" r="15" />
    </g>
  );
}

/**
 * 安全密钥图形：手机侧影 + 底部充电口，密钥从下方滑上来「贴」到口上，
 * 贴合瞬间有回弹，随后 NFC 纹波从接触点扩散进机身，最后机身内亮起对勾。
 */
export function KeyGlyph({ phase }: KeyGlyphProps) {
  return (
    <svg
      className="fido"
      data-phase={phase}
      viewBox="0 0 100 100"
      role="img"
      aria-label="安全密钥贴合充电口"
    >
      <rect className="fido-phone" pathLength={1} x="31" y="9" width="38" height="57" rx="9" />
      <rect className="fido-port" x="45.6" y="62.4" width="8.8" height="3" rx="1.5" />

      <NfcRipples />

      <g className="fido-key">
        <rect x="38" y="68" width="24" height="14" rx="6" />
        <circle cx="44.6" cy="75" r="2.7" />
      </g>

      <path className="fido-check" pathLength={1} d="M39 36l8 8 14-16" />
    </svg>
  );
}
