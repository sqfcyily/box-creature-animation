import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FPS, GOLD, KAI, clamp } from "./theme";

/** 统一字幕数据（秒）；由 scripts/lrc.cjs 或 scripts/tts.py 自动生成 */
export type Cue = { text: string; start: number; end: number; speaker?: string };

type Mode = "first-gold" | "karaoke" | "plain";

const Line: React.FC<{ cue: Cue; mode: Mode; speakerColors?: Record<string, string>; offset: number }> = ({ cue, mode, speakerColors, offset }) => {
  const frame = useCurrentFrame();
  const from = Math.round((cue.start + offset) * FPS);
  const to = Math.round((cue.end + offset) * FPS);
  if (frame < from || frame > to + 8) return null;
  const op = Math.min(interpolate(frame, [from, from + 6], [0, 1], clamp), interpolate(frame, [to, to + 8], [1, 0], clamp));
  const chars = Array.from(cue.text);
  // 卡拉 OK：在本句前 85% 时间内逐字染金
  const sung = mode === "karaoke" ? interpolate(frame, [from, from + (to - from) * 0.85], [0, chars.length], clamp) : 0;
  const color = (i: number) => {
    if (mode === "karaoke") return i < sung ? GOLD : "#fffaf0";
    if (mode === "first-gold") return i === 0 ? GOLD : "#fffaf0";
    return "#fffaf0";
  };
  return (
    <div
      style={{
        position: "absolute",
        bottom: 26,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        opacity: op,
        transform: `translateY(${(1 - op) * 8}px)`,
      }}
    >
      <div
        style={{
          maxWidth: "86%",
          padding: "8px 34px 10px",
          borderRadius: 14,
          background: "rgba(30,25,35,0.72)",
          fontFamily: KAI,
          fontSize: 34,
          letterSpacing: 5,
          lineHeight: 1.25,
          color: "#fffaf0",
          textAlign: "center",
        }}
      >
        {cue.speaker && <span style={{ color: speakerColors?.[cue.speaker] ?? GOLD }}>{cue.speaker}：</span>}
        {chars.map((ch, i) => (
          <span key={i} style={{ color: color(i) }}>
            {ch}
          </span>
        ))}
      </div>
    </div>
  );
};

/**
 * 底部字幕条：深色圆角底 + 白色楷体。
 * mode：first-gold（歌词默认，首字金）/ karaoke（逐字染金）/ plain（旁白）
 * offset：整体平移秒数（对齐音频时用）
 */
export const Subtitles: React.FC<{ cues: Cue[]; mode?: Mode; speakerColors?: Record<string, string>; offset?: number }> = ({
  cues,
  mode = "first-gold",
  speakerColors,
  offset = 0,
}) => (
  <>
    {cues.map((c, i) => (
      <Line key={i} cue={c} mode={mode} speakerColors={speakerColors} offset={offset} />
    ))}
  </>
);
