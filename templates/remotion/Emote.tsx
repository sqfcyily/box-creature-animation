import React from "react";
import { Easing } from "remotion";
import { INK, KAI, ease } from "./theme";

export type EmoteKind = "question" | "exclaim" | "sweat" | "heart" | "sparkle" | "zzz" | "dots" | "anger" | "note";

/**
 * 漫画情绪符号：在 (x, y) 处弹出并轻浮动。
 * frame 为本镜局部帧，at 为出现帧。一般放在角色头顶：y = 角色脚底 y - 150 * scale。
 */
export const Emote: React.FC<{ kind: EmoteKind; x: number; y: number; frame: number; at?: number; size?: number }> = ({
  kind,
  x,
  y,
  frame,
  at = 0,
  size = 1,
}) => {
  const p = ease(frame, [at, at + 14], [0, 1], Easing.out(Easing.back(2.4)));
  if (p <= 0) return null;
  const float = Math.sin((frame - at) / 10) * 4;
  const st = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  const el = (() => {
    switch (kind) {
      case "question":
        return <text x={0} y={12} fontSize={46} fontWeight={900} textAnchor="middle" fill="#7fb6e6" {...st} paintOrder="stroke" fontFamily="Arial">?</text>;
      case "exclaim":
        return <text x={0} y={14} fontSize={50} fontWeight={900} textAnchor="middle" fill="#ffd14a" {...st} paintOrder="stroke" fontFamily="Arial">!</text>;
      case "sweat":
        return (
          <>
            <path d="M0,-14 Q10,0 0,9 Q-10,0 0,-14 Z" fill="#8fd0f2" {...st} />
            <path d="M16,-2 Q22,6 16,12 Q10,6 16,-2 Z" fill="#8fd0f2" {...st} strokeWidth={2.5} />
          </>
        );
      case "heart":
        return <path d="M0,14 C-28,-6 -22,-30 -8,-30 C-2,-30 0,-24 0,-20 C0,-24 2,-30 8,-30 C22,-30 28,-6 0,14 Z" fill="#f27a8a" {...st} />;
      case "sparkle":
        return (
          <>
            <path d="M0,-16 L4,-4 L16,0 L4,4 L0,16 L-4,4 L-16,0 L-4,-4 Z" fill="#ffe08a" {...st} strokeWidth={2.5} />
            <path d="M20,-14 L22,-9 L27,-7 L22,-5 L20,0 L18,-5 L13,-7 L18,-9 Z" fill="#ffe08a" {...st} strokeWidth={2} />
          </>
        );
      case "zzz":
        return (
          <text x={0} y={0} fontSize={26} fontWeight={900} fill="#c9c3f2" {...st} strokeWidth={2.5} paintOrder="stroke" fontFamily="Arial">
            Z<tspan dx={2} dy={-10} fontSize={20}>z</tspan><tspan dx={2} dy={-8} fontSize={15}>z</tspan>
          </text>
        );
      case "dots":
        return [-14, 0, 14].map((dx, i) => <circle key={i} cx={dx} cy={0} r={4} fill={INK} opacity={ease(frame, [at + i * 6, at + i * 6 + 6], [0, 1])} />);
      case "anger":
        return <path d="M-12,-4 L-4,-4 L-4,-12 M4,-12 L4,-4 L12,-4 M12,4 L4,4 L4,12 M-4,12 L-4,4 L-12,4" fill="none" stroke="#e0504a" strokeWidth={4.5} strokeLinecap="round" />;
      case "note":
        return (
          <>
            <path d="M-4,10 L-4,-16 L12,-20 L12,4" fill="none" {...st} strokeWidth={3.5} />
            <ellipse cx={-9} cy={10} rx={7} ry={5} fill={INK} />
            <ellipse cx={7} cy={4} rx={7} ry={5} fill={INK} />
          </>
        );
    }
  })();
  return <g transform={`translate(${x}, ${y + float - (1 - p) * 10}) scale(${p * size})`} opacity={Math.min(1, p)}>{el}</g>;
};

/** 对白气泡（≤12 字），尾巴指向说话者；from/to 为局部帧 */
export const SpeechBubble: React.FC<{ text: string; x: number; y: number; frame: number; from: number; to: number; tail?: "left" | "right" | "down" }> = ({
  text,
  x,
  y,
  frame,
  from,
  to,
  tail = "down",
}) => {
  const p = Math.min(ease(frame, [from, from + 10], [0, 1], Easing.out(Easing.back(1.8))), ease(frame, [to - 6, to], [1, 0]));
  if (p <= 0) return null;
  const w = Array.from(text).length * 26 + 40;
  const h = 52;
  const tx = tail === "left" ? -w / 2 + 28 : tail === "right" ? w / 2 - 28 : 0;
  return (
    <g transform={`translate(${x}, ${y}) scale(${p})`} opacity={Math.min(1, p)}>
      <rect x={-w / 2} y={-h} width={w} height={h} rx={22} fill="#fffaf0" stroke={INK} strokeWidth={3.5} />
      <path d={`M${tx - 10},-2 L${tx},16 L${tx + 10},-2`} fill="#fffaf0" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
      <rect x={tx - 12} y={-6} width={24} height={6} fill="#fffaf0" />
      <text x={0} y={-h / 2 + 9} textAnchor="middle" fontSize={26} fontFamily={KAI} fill={INK}>
        {text}
      </text>
    </g>
  );
};
