import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

/** 纸面颗粒（低频抖动模拟手绘动画）+ 柔光暗角；放在所有场景之上、字幕之下 */
export const PaperLook: React.FC<{ grain?: number; vignette?: number }> = ({ grain = 0.16, vignette = 0.28 }) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 3) % 6;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", opacity: grain, mixBlendMode: "multiply" }}>
        <filter id={`paper${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#paper${seed})`} />
      </svg>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(30,20,40,${vignette}) 100%)` }} />
    </AbsoluteFill>
  );
};
