import React from "react";
import { INK } from "./theme";

/** 角色外观：靠主色 + 头顶特征 + 肢体 + 配饰区分角色 */
export type Look = {
  body: string;
  shade: string;
  /** 眼睛颜色：深色身体用浅色眼 */
  eye?: string;
  top?: "none" | "feather" | "spikes" | "cat-ears" | "bunny-ears" | "hair" | "antenna" | "shell" | "flower" | "hat";
  topColor?: string;
  limbs?: "arms" | "wings";
  mouth?: "line" | "beak";
  beak?: string;
  legs?: 2 | 4;
  accessory?: "none" | "scarf" | "bow" | "glasses";
  accessoryColor?: string;
  /** 身体纹理：木纹/条纹 */
  pattern?: "none" | "wood" | "stripes";
};

export type Mood = "neutral" | "happy" | "sad" | "surprised" | "angry" | "sleepy" | "love";

type Props = {
  look: Look;
  /** 落脚点（脚底中心） */
  x: number;
  y: number;
  scale?: number;
  mood?: Mood;
  /** 1 朝右，-1 朝左 */
  facing?: 1 | -1;
  /** 背影：不画五官 */
  back?: boolean;
  /** 本镜局部帧（驱动呼吸、走路、说话、眼泪） */
  frame: number;
  walking?: boolean;
  talking?: boolean;
  tears?: boolean;
  /** 挥手/扇翅幅度 0~1 */
  wave?: number;
  /** 身体倾斜角度（度） */
  tilt?: number;
};

const BW = 120;
const BH = 90;
const LEG = 26;
const S = 4.5; // 主描边

/** 方块小生物：圆角矩形身体 + 短腿 + 小手/小翅膀 + 点状眼 */
export const Creature: React.FC<Props> = ({
  look,
  x,
  y,
  scale = 1,
  mood = "neutral",
  facing = 1,
  back = false,
  frame,
  walking = false,
  talking = false,
  tears = false,
  wave = 0,
  tilt = 0,
}) => {
  const {
    body,
    shade,
    eye = INK,
    top = "none",
    topColor = body,
    limbs = "arms",
    mouth = "line",
    beak = "#f0a35e",
    legs = 4,
    accessory = "none",
    accessoryColor = "#e0625a",
    pattern = "none",
  } = look;
  const breathe = Math.sin(frame / 14) * 1.6;
  const bob = (walking ? Math.abs(Math.sin(frame / 4)) * -6 : 0) + (talking ? -Math.abs(Math.sin(frame / 3)) * 3 : 0);
  const T = -LEG - BH + breathe + bob; // 身体顶边
  const fx = back ? 0 : facing * 10;
  const eyeY = T + 34;

  // —— 腿 ——
  const legXs = legs === 4 ? [-44, -20, 6, 30] : [-30, 16];
  const legEls = legXs.map((lx, i) => {
    const lift = walking ? Math.max(0, Math.sin(frame / 4 + (i % 2) * Math.PI)) * 8 : 0;
    return <rect key={i} x={lx} y={-LEG - lift + bob} width={14} height={LEG} rx={2} fill={shade} stroke={INK} strokeWidth={4} />;
  });

  // —— 手 / 翅膀 ——
  const swing = Math.sin(frame / 3) * 28 * wave;
  const limb = (side: 1 | -1) => {
    const rot = -side * (swing + 10);
    if (limbs === "wings") {
      return (
        <g transform={`translate(${side * (BW / 2 - 2)}, ${T + BH * 0.55}) rotate(${rot})`}>
          <path
            d={`M0,-14 Q${side * 30},-24 ${side * 38},-2 Q${side * 40},8 ${side * 29},9 Q${side * 31},18 ${side * 19},17 Q${side * 14},24 0,14 Z`}
            fill={body}
            stroke={INK}
            strokeWidth={4}
            strokeLinejoin="round"
          />
        </g>
      );
    }
    return (
      <g transform={`translate(${side * (BW / 2)}, ${T + BH * 0.5}) rotate(${rot * 1.4})`}>
        <rect x={side > 0 ? 0 : -26} y={-5} width={26} height={10} rx={4} fill={shade} stroke={INK} strokeWidth={3.5} />
      </g>
    );
  };

  // —— 头顶特征 ——
  const topEl = (() => {
    const st = { fill: topColor, stroke: INK, strokeWidth: 3.5, strokeLinejoin: "round" as const };
    switch (top) {
      case "feather":
        return <path d={`M-6,${T + 2} Q-14,${T - 26} 4,${T - 30} Q-2,${T - 16} 10,${T - 22} Q6,${T - 8} 8,${T + 2} Z`} {...st} />;
      case "spikes":
        return <path d={`M-14,${T + 2} L-10,${T - 16} L-4,${T + 2} L2,${T - 20} L8,${T + 2} L14,${T - 14} L18,${T + 2}`} {...st} />;
      case "cat-ears":
        return (
          <>
            <path d={`M-52,${T + 4} L-44,${T - 24} L-24,${T + 4} Z`} {...st} />
            <path d={`M24,${T + 4} L44,${T - 24} L52,${T + 4} Z`} {...st} />
          </>
        );
      case "bunny-ears":
        return (
          <>
            <rect x={-38} y={T - 44} width={18} height={50} rx={9} {...st} />
            <rect x={20} y={T - 44} width={18} height={50} rx={9} {...st} />
          </>
        );
      case "hair":
        return <path d={`M${-BW / 2 + 2},${T + 18} Q${-BW / 2},${T - 14} 0,${T - 12} Q${BW / 2},${T - 14} ${BW / 2 - 2},${T + 18} Q20,${T + 4} 0,${T + 12} Q-24,${T + 2} ${-BW / 2 + 2},${T + 18} Z`} {...st} />;
      case "antenna":
        return (
          <>
            <line x1={0} y1={T} x2={0} y2={T - 24} stroke={INK} strokeWidth={3.5} />
            <circle cx={0} cy={T - 28} r={6} {...st} />
          </>
        );
      case "shell":
        return <path d={`M-14,${T + 2} Q-16,${T - 20} 0,${T - 22} Q16,${T - 20} 14,${T + 2} Z M-6,${T} L-4,${T - 18} M6,${T} L4,${T - 18}`} {...st} />;
      case "flower":
        return (
          <g transform={`translate(18, ${T - 6})`}>
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx={0} cy={-8} rx={6} ry={9} transform={`rotate(${a})`} fill={topColor} stroke={INK} strokeWidth={2.5} />
            ))}
            <circle r={5} fill="#ffd36b" stroke={INK} strokeWidth={2.5} />
          </g>
        );
      case "hat":
        return (
          <>
            <rect x={-46} y={T - 6} width={92} height={10} rx={4} {...st} />
            <rect x={-28} y={T - 36} width={56} height={32} rx={6} {...st} />
          </>
        );
      default:
        return null;
    }
  })();

  // —— 眼睛 ——
  const ex = [-22 + fx, 22 + fx];
  const eyes = back
    ? null
    : ex.map((e, i) => {
        if (mood === "happy" || mood === "love")
          return <path key={i} d={`M${e - 9},${eyeY + 3} Q${e},${eyeY - 9} ${e + 9},${eyeY + 3}`} fill="none" stroke={eye} strokeWidth={4.5} strokeLinecap="round" />;
        if (mood === "sleepy")
          return <line key={i} x1={e - 8} y1={eyeY} x2={e + 8} y2={eyeY} stroke={eye} strokeWidth={4.5} strokeLinecap="round" />;
        const r = mood === "surprised" ? 8.5 : 6.5;
        const brow =
          mood === "sad"
            ? i === 0 ? `M${e - 10},${eyeY - 10} L${e + 7},${eyeY - 15}` : `M${e - 7},${eyeY - 15} L${e + 10},${eyeY - 10}`
            : mood === "angry"
              ? i === 0 ? `M${e - 10},${eyeY - 15} L${e + 7},${eyeY - 9}` : `M${e - 7},${eyeY - 9} L${e + 10},${eyeY - 15}`
              : null;
        return (
          <g key={i}>
            <circle cx={e} cy={eyeY} r={r} fill={eye} />
            <circle cx={e + 2} cy={eyeY - 2} r={2} fill={eye === INK ? "#fff" : INK} />
            {brow && <path d={brow} stroke={eye} strokeWidth={3.5} strokeLinecap="round" />}
          </g>
        );
      });

  // —— 嘴 ——
  const my = eyeY + 18;
  const open = talking ? Math.abs(Math.sin(frame / 3)) * 6 : 0;
  const mouthEl = back
    ? null
    : mouth === "beak"
      ? <path d={`M${fx - 9},${my} L${fx + 9},${my} L${fx},${my + 12 + open} Z`} fill={beak} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      : mood === "surprised" || talking
        ? <ellipse cx={fx} cy={my + 2} rx={5} ry={3 + open} fill={INK} />
        : mood === "sad"
          ? <path d={`M${fx - 8},${my + 5} Q${fx},${my - 3} ${fx + 8},${my + 5}`} fill="none" stroke={eye} strokeWidth={3.5} strokeLinecap="round" />
          : mood === "happy" || mood === "love"
            ? <path d={`M${fx - 8},${my} Q${fx},${my + 9} ${fx + 8},${my}`} fill="none" stroke={eye} strokeWidth={3.5} strokeLinecap="round" />
            : <line x1={fx - 6} y1={my + 2} x2={fx + 6} y2={my + 2} stroke={eye} strokeWidth={3.5} strokeLinecap="round" />;

  const blush =
    !back && (mood === "happy" || mood === "love")
      ? [-36 + fx, 36 + fx].map((bx, i) => <ellipse key={i} cx={bx} cy={eyeY + 14} rx={9} ry={5} fill="#f2949b" opacity={0.75} />)
      : null;

  const tearDrops =
    tears && !back
      ? [0, 1].flatMap((side) =>
          [0, 1].map((k) => {
            const t = ((frame + k * 22 + side * 11) % 44) / 44;
            const tx = ex[side] + (side === 0 ? -6 : 6);
            return (
              <path
                key={`${side}-${k}`}
                d="M0,-11 Q8,0 0,8 Q-8,0 0,-11 Z"
                transform={`translate(${tx}, ${eyeY + 12 + t * 46})`}
                fill="#8fd0f2"
                stroke={INK}
                strokeWidth={2}
                opacity={1 - t * 0.8}
              />
            );
          }),
        )
      : null;

  const patternEl =
    pattern === "wood"
      ? [0.3, 0.55, 0.78].map((p, i) => (
          <path key={i} d={`M${-BW / 2 + 10},${T + BH * p} q${BW * 0.3},-4 ${BW * 0.55},0`} fill="none" stroke={shade} strokeWidth={2.5} strokeLinecap="round" />
        ))
      : pattern === "stripes"
        ? [-30, 0, 30].map((sx, i) => <rect key={i} x={sx - 5} y={T + 4} width={10} height={BH - 8} fill={shade} opacity={0.55} />)
        : null;

  const accEl = (() => {
    if (back && accessory === "glasses") return null;
    switch (accessory) {
      case "scarf":
        return (
          <>
            <rect x={-BW / 2 - 2} y={T + BH - 30} width={BW + 4} height={14} rx={6} fill={accessoryColor} stroke={INK} strokeWidth={3} />
            <rect x={BW / 2 - 30} y={T + BH - 20} width={14} height={26} rx={4} fill={accessoryColor} stroke={INK} strokeWidth={3} />
          </>
        );
      case "bow":
        return (
          <g transform={`translate(${-30}, ${T + 2})`}>
            <path d="M0,0 L-16,-10 L-16,10 Z M0,0 L16,-10 L16,10 Z" fill={accessoryColor} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
            <circle r={4} fill={accessoryColor} stroke={INK} strokeWidth={2.5} />
          </g>
        );
      case "glasses":
        return (
          <g fill="none" stroke={INK} strokeWidth={3}>
            <circle cx={ex[0]} cy={eyeY} r={13} />
            <circle cx={ex[1]} cy={eyeY} r={13} />
            <line x1={ex[0] + 13} y1={eyeY} x2={ex[1] - 13} y2={eyeY} />
          </g>
        );
      default:
        return null;
    }
  })();

  return (
    <g transform={`translate(${x}, ${y}) scale(${scale}) rotate(${tilt})`}>
      <ellipse cx={0} cy={2} rx={BW * 0.62} ry={8} fill="#000" opacity={0.12} />
      {legEls}
      {limb(-1)}
      {limb(1)}
      {top !== "hair" && top !== "hat" && topEl}
      <rect x={-BW / 2} y={T} width={BW} height={BH} rx={9} fill={body} stroke={INK} strokeWidth={S} />
      {patternEl}
      <rect x={-BW / 2 + 5} y={T + BH - 16} width={BW - 10} height={10} rx={4} fill={shade} opacity={0.8} />
      {(top === "hair" || top === "hat") && topEl}
      {blush}
      {eyes}
      {mouthEl}
      {accEl}
      {tearDrops}
    </g>
  );
};

/** 常用角色预设，可直接用或复制修改 */
export const LOOKS = {
  dove: { body: "#f7f4ee", shade: "#e3ddd3", top: "feather", limbs: "wings", mouth: "beak" },
  crow: { body: "#3b3644", shade: "#2c2834", eye: "#fffaf0", top: "spikes", limbs: "wings", mouth: "beak", beak: "#d9a441" },
  boy: { body: "#d9875a", shade: "#b86a44", pattern: "wood" },
  girl: { body: "#8ccfcf", shade: "#6fb1b3", top: "shell", topColor: "#f7b6b9" },
  cat: { body: "#f2c27a", shade: "#d9a55c", top: "cat-ears", pattern: "stripes" },
  bunny: { body: "#fbf6f0", shade: "#e8ded3", top: "bunny-ears", legs: 2 },
  robot: { body: "#b9c6d3", shade: "#92a3b4", top: "antenna", topColor: "#f27a8a" },
  kid: { body: "#f4d6b0", shade: "#dfba90", top: "hair", topColor: "#5a4636", legs: 2, accessory: "scarf" },
} satisfies Record<string, Look>;
