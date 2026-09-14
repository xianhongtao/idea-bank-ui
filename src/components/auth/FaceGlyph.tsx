interface FaceGlyphProps {
  phase: 'scan' | 'success';
}

/**
 * 面容扫描图形：圆角感应框 + 线描五官，扫完折成对勾。
 * 手写的几何动画，致敬 iOS 那套「五官游走 → 定格成对勾」的表达方式。
 */
export function FaceGlyph({ phase }: FaceGlyphProps) {
  return (
    <svg
      className="face"
      data-phase={phase}
      viewBox="0 0 100 100"
      role="img"
      aria-label="面容扫描"
    >
      <rect className="face-frame" pathLength={1} x="13" y="13" width="74" height="74" rx="23" />

      <g className="face-parts">
        <g className="face-look">
          <path className="face-eye" d="M38.5 38.5v10" />
          <path className="face-eye" d="M61.5 38.5v10" />
        </g>
        <path className="face-mouth" d="M39 61c3.6 5.4 18.4 5.4 22 0" />
      </g>

      <path className="face-check" pathLength={1} d="M35 51.5l10.5 10.5L66 40" />
    </svg>
  );
}
