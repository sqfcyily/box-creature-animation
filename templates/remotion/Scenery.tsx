import React from "react";
import { AbsoluteFill } from "remotion";
import { H, INK, Palette, W, rand } from "./theme";

/**
 * 场景积木：全部是 SVG <g>，在 1280×720 坐标系内摆放。
 * 用法：<Stage><Sky p={P} id="s1" frame={f} /> <Hills .../> ... <Creature .../></Stage>
 * 同一画面出现多个积木时，给每个场景传不同的 id，避免 SVG defs 冲突。
 */
export const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {children}
    </svg>
  </AbsoluteFill>
);

/** 镜头：以 (cx, cy) 为中心缩放 + 平移 */
export const Cam: React.FC<{ z?: number; cx?: number; cy?: number; dx?: number; dy?: number; children: React.ReactNode }> = ({
  z = 1,
  cx = W / 2,
  cy = H / 2,
  dx = 0,
  dy = 0,
  children,
}) => (
  <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) scale(${z})`, transformOrigin: `${cx}px ${cy}px` }}>{children}</AbsoluteFill>
);

type Base = { p: Palette; id: string; frame: number };

/** 天空渐变（可选星星）；horizon 以下由地面/海面覆盖 */
export const Sky: React.FC<Base & { horizon?: number; stars?: boolean }> = ({ p, id, frame, horizon = 330, stars }) => (
  <g>
    <defs>
      <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={p.skyTop} />
        <stop offset="1" stopColor={p.skyBottom} />
      </linearGradient>
    </defs>
    <rect width={W} height={horizon + 4} fill={`url(#${id}-sky)`} />
    {stars &&
      Array.from({ length: 36 }, (_, i) => (
        <circle
          key={i}
          cx={rand("sx", i) * W}
          cy={rand("sy", i) * (horizon - 80)}
          r={1 + rand("sr", i) * 1.8}
          fill="#fff6d8"
          opacity={0.35 + 0.65 * (0.5 + 0.5 * Math.sin(frame / 9 + i * 2.3))}
        />
      ))}
  </g>
);

/** 太阳 / 月牙 + 光晕；也可当作台灯、路灯的光晕（kind="glow"） */
export const Orb: React.FC<{ p: Palette; id: string; kind: "sun" | "moon" | "glow"; x: number; y: number; r: number; color?: string }> = ({
  p,
  id,
  kind,
  x,
  y,
  r,
  color,
}) => {
  const c = color ?? p.glow;
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor={c} stopOpacity={0.95} />
          <stop offset="0.35" stopColor={c} stopOpacity={0.45} />
          <stop offset="1" stopColor={c} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={x} cy={y} r={r * 5.5} fill={`url(#${id}-glow)`} />
      {kind === "sun" && <circle cx={x} cy={y} r={r} fill={p.light} />}
      {kind === "moon" && (
        <path
          d={`M${x - r * 0.2},${y - r} A${r},${r} 0 1,0 ${x + r * 0.9},${y + r * 0.45} A${r * 0.82},${r * 0.82} 0 1,1 ${x - r * 0.2},${y - r} Z`}
          fill={p.light}
        />
      )}
    </g>
  );
};

/** 慢漂的柔边云 */
export const Clouds: React.FC<Base & { items?: { x: number; y: number; s: number }[]; opacity?: number }> = ({
  p,
  id,
  frame,
  items = [
    { x: 120, y: 120, s: 1.1 },
    { x: 820, y: 80, s: 0.8 },
    { x: 1080, y: 190, s: 1.3 },
  ],
  opacity = 0.85,
}) => (
  <g>
    <defs>
      <filter id={`${id}-soft`}>
        <feGaussianBlur stdDeviation="6" />
      </filter>
    </defs>
    {items.map((c, i) => (
      <g key={i} transform={`translate(${c.x + frame * (0.15 + i * 0.05)}, ${c.y}) scale(${c.s})`} opacity={opacity}>
        <path d="M-90,20 Q-90,-6 -60,-4 Q-50,-34 -14,-26 Q4,-48 36,-30 Q70,-36 74,-6 Q100,-2 96,20 Z" fill={p.cloud} filter={`url(#${id}-soft)`} />
      </g>
    ))}
  </g>
);

/** 远山两层剪影；side 决定在左还是右 */
export const Hills: React.FC<{ p: Palette; y?: number; side?: "left" | "right" | "both"; peak?: number }> = ({ p, y = 330, side = "left", peak = 1 }) => {
  const one = (flip: boolean, k: number) => {
    const t = (px: number) => (flip ? W - px : px);
    return (
      <g key={k}>
        <path
          d={`M${t(-20)},${y} L${t(-20)},${y - 120 * peak} Q${t(60)},${y - 190 * peak} ${t(140)},${y - 165 * peak} Q${t(210)},${y - 150 * peak} ${t(260)},${y - 205 * peak} Q${t(330)},${y - 150 * peak} ${t(470)},${y - 40 * peak} L${t(540)},${y} Z`}
          fill={p.far}
          stroke={INK}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        <path
          d={`M${t(-20)},${y} L${t(-20)},${y - 60 * peak} Q${t(120)},${y - 110 * peak} ${t(260)},${y - 70 * peak} Q${t(380)},${y - 40 * peak} ${t(600)},${y} Z`}
          fill={p.mid}
          stroke={INK}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
      </g>
    );
  };
  return <g>{side === "both" ? [one(false, 0), one(true, 1)] : one(side === "right", 0)}</g>;
};

/** 海面：渐变 + 横向波纹 + 天体碎光倒影 + 涌退的浪线与沙滩 */
export const Sea: React.FC<Base & { horizon?: number; shore?: number; orbX?: number; orbR?: number }> = ({
  p,
  id,
  frame,
  horizon = 330,
  shore = 452,
  orbX,
  orbR = 40,
}) => {
  const shoreY = shore + Math.sin(frame / 26) * 14;
  const wavePath = (yy: number, amp: number, ph: number) => {
    let d = `M-20,${yy}`;
    for (let x = 0; x <= W + 40; x += 80) d += ` Q${x + 40},${yy + Math.sin(x / 90 + ph + frame / 30) * amp} ${x + 80},${yy}`;
    return d;
  };
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-sea`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.water[0]} />
          <stop offset="1" stopColor={p.water[1]} />
        </linearGradient>
        <linearGradient id={`${id}-sand`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.groundEdge} />
          <stop offset="0.3" stopColor={p.ground} />
          <stop offset="1" stopColor={p.ground} />
        </linearGradient>
      </defs>
      <rect y={horizon} width={W} height={shore - horizon + 40} fill={`url(#${id}-sea)`} />
      <line x1={0} y1={horizon} x2={W} y2={horizon} stroke={INK} strokeWidth={3} />
      {Array.from({ length: 22 }, (_, i) => {
        const ly = horizon + 14 + rand("wy", i) * (shore - horizon - 40);
        const lx = ((rand("wx", i) * W + frame * (0.3 + rand("wv", i) * 0.4)) % (W + 120)) - 60;
        return <line key={i} x1={lx} y1={ly} x2={lx + 30 + rand("wl", i) * 60} y2={ly} stroke={p.waterLine} strokeWidth={3} strokeLinecap="round" opacity={0.55} />;
      })}
      {orbX !== undefined &&
        Array.from({ length: 9 }, (_, i) => {
          const t = i / 8;
          const w = orbR * (0.9 + t * 1.6) * (0.75 + 0.25 * Math.sin(frame / 7 + i * 1.9));
          return (
            <rect
              key={i}
              x={orbX - w / 2 + Math.sin(frame / 11 + i) * 4}
              y={horizon + 10 + t * (shore - horizon - 30)}
              width={w}
              height={6 + t * 4}
              rx={4}
              fill={p.glitter}
              opacity={Math.max(0.15, 0.55 + 0.45 * Math.sin(frame / 6 + i * 2.7))}
            />
          );
        })}
      <path d={`${wavePath(shoreY, 5, 0)} L${W + 40},${H} L-20,${H} Z`} fill={`url(#${id}-sand)`} />
      <path d={`${wavePath(shoreY, 5, 0)} L${W + 40},${shoreY + 46} L-20,${shoreY + 46} Z`} fill={p.groundEdge} opacity={0.55} />
      <path d={wavePath(shoreY, 5, 0)} fill="none" stroke={p.foam} strokeWidth={9} strokeLinecap="round" />
      <path d={wavePath(shoreY + 14, 3, 1.4)} fill="none" stroke={p.foam} strokeWidth={3} opacity={0.5 + 0.4 * Math.sin(frame / 26)} />
      <Specks y0={shore + 70} />
    </g>
  );
};

/** 平地（草地/雪地/路面），带一条描边地平线 */
export const Ground: React.FC<{ p: Palette; y?: number; color?: string; edge?: boolean; specks?: boolean }> = ({ p, y = 470, color, edge = true, specks = true }) => (
  <g>
    <rect y={y} width={W} height={H - y} fill={color ?? p.ground} />
    <rect y={y} width={W} height={18} fill={p.groundEdge} opacity={0.6} />
    {edge && <line x1={0} y1={y} x2={W} y2={y} stroke={INK} strokeWidth={3} />}
    {specks && <Specks y0={y + 40} />}
  </g>
);

/** 地面小点，增加手绘质感 */
export const Specks: React.FC<{ y0: number; count?: number }> = ({ y0, count = 26 }) => (
  <g>
    {Array.from({ length: count }, (_, i) => (
      <circle key={i} cx={rand("px", i) * W} cy={y0 + rand("py", i) * (H - y0 - 10)} r={1.6 + rand("pr", i) * 1.6} fill={INK} opacity={0.18} />
    ))}
  </g>
);

/** 一排手绘树：round=圆冠阔叶，pine=尖冠松树；树冠随风轻摆 */
export const Trees: React.FC<Base & { xs: number[]; y: number; kind?: "round" | "pine"; scale?: number; color?: string }> = ({
  p,
  frame,
  xs,
  y,
  kind = "round",
  scale = 1,
  color,
}) => (
  <g>
    {xs.map((x, i) => {
      const s = scale * (0.85 + rand("ts", i) * 0.3);
      const sway = Math.sin(frame / 30 + i) * 2;
      const c = color ?? p.mid;
      return (
        <g key={i} transform={`translate(${x}, ${y}) scale(${s})`}>
          <rect x={-7} y={-60} width={14} height={60} fill="#8a6a4e" stroke={INK} strokeWidth={3} />
          <g transform={`rotate(${sway}, 0, -60)`}>
            {kind === "round" ? (
              <path d="M-52,-70 Q-62,-120 -22,-128 Q-10,-160 22,-146 Q60,-140 56,-100 Q70,-70 40,-62 Q0,-50 -40,-60 Q-58,-62 -52,-70 Z" fill={c} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
            ) : (
              <path d="M0,-170 L-30,-118 L-18,-118 L-44,-80 L-28,-80 L-56,-50 L56,-50 L28,-80 L44,-80 L18,-118 L30,-118 Z" fill={c} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
            )}
          </g>
        </g>
      );
    })}
  </g>
);

/** 远景楼群剪影 + 亮灯窗户（窗户偶尔熄灭/点亮） */
export const City: React.FC<Base & { y?: number; lit?: boolean }> = ({ p, frame, y = 470, lit = true }) => {
  const blds = Array.from({ length: 14 }, (_, i) => ({
    x: i * 96 - 20 + rand("bx", i) * 20,
    w: 70 + rand("bw", i) * 40,
    h: 120 + rand("bh", i) * 170,
  }));
  return (
    <g>
      {blds.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={y - b.h} width={b.w} height={b.h} fill={i % 2 ? p.far : p.mid} stroke={INK} strokeWidth={2.5} />
          {lit &&
            Array.from({ length: Math.floor(b.h / 34) * 2 }, (_, k) => {
              const on = rand(`win${i}`, k) > 0.62 !== (rand(`wt${i}`, k) > 0.97 && Math.sin(frame / 40 + k) > 0);
              if (!on) return null;
              return <rect key={k} x={b.x + 12 + (k % 2) * (b.w / 2 - 6)} y={y - b.h + 16 + Math.floor(k / 2) * 34} width={14} height={16} rx={2} fill={p.glow} opacity={0.85} />;
            })}
        </g>
      ))}
    </g>
  );
};

/** 室内：墙（sky 色）、踢脚线、地板（ground 色）、一扇窗（窗内放 windowSky 色板的天空） */
export const Room: React.FC<Base & { floorY?: number; windowSky?: Palette; window?: { x: number; y: number; w: number; h: number } }> = ({
  p,
  id,
  frame,
  floorY = 500,
  windowSky,
  window: win = { x: 820, y: 110, w: 260, h: 220 },
}) => (
  <g>
    <defs>
      <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={p.skyTop} />
        <stop offset="1" stopColor={p.skyBottom} />
      </linearGradient>
      <clipPath id={`${id}-win`}>
        <rect x={win.x} y={win.y} width={win.w} height={win.h} rx={6} />
      </clipPath>
    </defs>
    <rect width={W} height={floorY} fill={`url(#${id}-wall)`} />
    {windowSky && (
      <g clipPath={`url(#${id}-win)`}>
        <rect x={win.x} y={win.y} width={win.w} height={win.h} fill={windowSky.skyTop} />
        {Array.from({ length: 10 }, (_, i) => (
          <circle key={i} cx={win.x + rand("ws", i) * win.w} cy={win.y + rand("wy", i) * win.h * 0.8} r={1.6} fill="#fff6d8" opacity={0.4 + 0.6 * Math.abs(Math.sin(frame / 12 + i))} />
        ))}
      </g>
    )}
    <rect x={win.x} y={win.y} width={win.w} height={win.h} rx={6} fill="none" stroke={INK} strokeWidth={6} />
    <line x1={win.x + win.w / 2} y1={win.y} x2={win.x + win.w / 2} y2={win.y + win.h} stroke={INK} strokeWidth={4} />
    <line x1={win.x} y1={win.y + win.h / 2} x2={win.x + win.w} y2={win.y + win.h / 2} stroke={INK} strokeWidth={4} />
    <rect x={win.x - 14} y={win.y + win.h} width={win.w + 28} height={12} rx={3} fill={p.mid} stroke={INK} strokeWidth={3} />
    <rect y={floorY} width={W} height={H - floorY} fill={p.ground} />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <line key={i} x1={0} y1={floorY + 30 + i * 40} x2={W} y2={floorY + 30 + i * 40} stroke={p.groundEdge} strokeWidth={2} opacity={0.6} />
    ))}
    <rect y={floorY - 14} width={W} height={14} fill={p.mid} stroke={INK} strokeWidth={3} />
  </g>
);

/** 斜雨丝（含地面溅起的小圈） */
export const Rain: React.FC<{ frame: number; density?: number; color?: string; groundY?: number }> = ({ frame, density = 70, color = "#c9d3ea", groundY = 620 }) => (
  <g>
    {Array.from({ length: density }, (_, i) => {
      const speed = 22 + rand("rv", i) * 10;
      const y = ((rand("ry", i) * H + frame * speed) % (H + 60)) - 60;
      const x = rand("rx", i) * (W + 200) - 100 - y * 0.18;
      return <line key={i} x1={x} y1={y} x2={x - 7} y2={y + 34} stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.55} />;
    })}
    {Array.from({ length: 10 }, (_, i) => {
      const t = ((frame + i * 7) % 20) / 20;
      return <ellipse key={`s${i}`} cx={rand("rsx", i) * W} cy={groundY - rand("rsy", i) * 120} rx={4 + t * 14} ry={1.5 + t * 4} fill="none" stroke={color} strokeWidth={1.5} opacity={1 - t} />;
    })}
  </g>
);

/** 飘雪 */
export const Snow: React.FC<{ frame: number; density?: number }> = ({ frame, density = 60 }) => (
  <g>
    {Array.from({ length: density }, (_, i) => {
      const y = ((rand("sy", i) * H + frame * (0.8 + rand("sv", i) * 1.2)) % (H + 20)) - 10;
      const x = rand("sx", i) * W + Math.sin(frame / 25 + i) * 12;
      return <circle key={i} cx={x} cy={y} r={2 + rand("sr", i) * 3} fill="#fff" opacity={0.85} />;
    })}
  </g>
);

/** 浮动光点：萤火虫 / 灰尘 / 星光 / 气泡（dir=-1 向上） */
export const Fireflies: React.FC<{ frame: number; count?: number; color?: string; dir?: 1 | -1; area?: [number, number] }> = ({
  frame,
  count = 24,
  color = "#fff0a8",
  dir = -1,
  area = [0, H],
}) => (
  <g>
    {Array.from({ length: count }, (_, i) => {
      const span = area[1] - area[0];
      const y = area[0] + ((((rand("fy", i) * span + dir * frame * (0.2 + rand("fv", i) * 0.4)) % span) + span) % span);
      const x = rand("fx", i) * W + Math.sin(frame / 40 + i) * 16;
      return <circle key={i} cx={x} cy={y} r={2 + rand("fr", i) * 2.5} fill={color} opacity={0.3 + 0.6 * (0.5 + 0.5 * Math.sin(frame / 12 + i * 1.7))} />;
    })}
  </g>
);

/* ---------- 小物件 ---------- */

export const Lamp: React.FC<{ x: number; y: number; on?: boolean; frame: number; color?: string }> = ({ x, y, on = true, frame, color = "#ffd58a" }) => (
  <g transform={`translate(${x}, ${y})`}>
    {on && <ellipse cx={0} cy={-6} rx={90} ry={22} fill={color} opacity={0.18 + 0.04 * Math.sin(frame / 5)} />}
    {on && <path d="M-14,-250 L-80,-6 L80,-6 L14,-250 Z" fill={color} opacity={0.1} />}
    <rect x={-5} y={-260} width={10} height={260} fill="#3c3846" stroke={INK} strokeWidth={2.5} />
    <path d="M-22,-250 L22,-250 L14,-276 L-14,-276 Z" fill="#3c3846" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
    <circle cx={0} cy={-246} r={8} fill={on ? color : "#777"} />
  </g>
);

export const Bench: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x}, ${y})`} stroke={INK} strokeWidth={3} strokeLinejoin="round">
    <rect x={-110} y={-70} width={220} height={14} rx={3} fill="#b07a52" />
    <rect x={-110} y={-44} width={220} height={14} rx={3} fill="#b07a52" />
    <rect x={-96} y={-30} width={10} height={30} fill="#5a4a46" />
    <rect x={86} y={-30} width={10} height={30} fill="#5a4a46" />
  </g>
);

export const Umbrella: React.FC<{ x: number; y: number; color?: string; tilt?: number }> = ({ x, y, color = "#e0625a", tilt = 0 }) => (
  <g transform={`translate(${x}, ${y}) rotate(${tilt})`} stroke={INK} strokeWidth={3} strokeLinejoin="round">
    <line x1={0} y1={0} x2={0} y2={110} />
    <path d="M-90,0 Q-90,-70 0,-74 Q90,-70 90,0 Q68,-14 45,0 Q22,-14 0,0 Q-22,-14 -45,0 Q-68,-14 -90,0 Z" fill={color} />
  </g>
);

export const Bottle: React.FC<{ x: number; y: number; rot?: number; glow?: boolean }> = ({ x, y, rot = 0, glow = false }) => (
  <g transform={`translate(${x}, ${y}) rotate(${rot})`}>
    {glow && <circle r={34} fill="#fff6c8" opacity={0.35} />}
    <rect x={-22} y={-12} width={36} height={24} rx={8} fill="#d8eef0" stroke={INK} strokeWidth={3} />
    <rect x={14} y={-6} width={12} height={12} rx={2} fill="#d8eef0" stroke={INK} strokeWidth={3} />
    <rect x={24} y={-5} width={6} height={10} fill="#b07a52" stroke={INK} strokeWidth={2} />
    <path d="M-8,4 C-16,-2 -13,-9 -8,-7 C-6,-7 -6,-5 -6,-4 C-6,-5 -5,-7 -3,-7 C2,-9 4,-2 -4,4 Z" fill="#f27a8a" />
  </g>
);

/** 海底：深蓝渐变 + 顶部光束 + 摇摆水草 + 上浮气泡 + 海床石头/海星 */
export const Underwater: React.FC<{ id: string; frame: number; floorY?: number }> = ({ id, frame, floorY = 600 }) => (
  <g>
    <defs>
      <linearGradient id={`${id}-uw`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2f6f9e" />
        <stop offset="1" stopColor="#123a66" />
      </linearGradient>
      <linearGradient id={`${id}-ray`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#d8f2ff" stopOpacity={0.35} />
        <stop offset="1" stopColor="#d8f2ff" stopOpacity={0} />
      </linearGradient>
    </defs>
    <rect width={W} height={H} fill={`url(#${id}-uw)`} />
    {[180, 420, 700, 980].map((x, i) => (
      <path key={i} d={`M${x - 30},0 L${x + 30},0 L${x + 160},${H} L${x + 40},${H} Z`} fill={`url(#${id}-ray)`} opacity={0.6 + 0.4 * Math.sin(frame / 20 + i)} />
    ))}
    <path d={`M0,${floorY} Q320,${floorY - 24} 640,${floorY - 6} Q960,${floorY + 12} ${W},${floorY - 14} L${W},${H} L0,${H} Z`} fill="#c9b78f" stroke={INK} strokeWidth={3} />
    {[90, 210, 1010, 1160, 1220].map((x, i) => {
      const h = 140 + rand("kh", i) * 120;
      const sw = Math.sin(frame / 18 + i) * 14;
      return (
        <path
          key={i}
          d={`M${x},${floorY} Q${x - 20 + sw / 2},${floorY - h * 0.5} ${x + sw},${floorY - h} Q${x + 18 + sw / 2},${floorY - h * 0.5} ${x + 14},${floorY} Z`}
          fill={i % 2 ? "#4f9a6a" : "#3f8a5e"}
          stroke={INK}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
      );
    })}
    {[[340, 18], [880, 26], [1080, 14]].map(([x, r], i) => (
      <ellipse key={i} cx={x} cy={floorY + 4} rx={r * 1.6} ry={r} fill="#d9d2c2" stroke={INK} strokeWidth={2.5} />
    ))}
    <path transform={`translate(760, ${floorY + 20}) rotate(12)`} d="M0,-16 L5,-5 L16,-4 L8,4 L10,15 L0,9 L-10,15 L-8,4 L-16,-4 L-5,-5 Z" fill="#e0625a" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
    {Array.from({ length: 18 }, (_, i) => {
      const y = H - ((rand("by", i) * H + frame * (0.8 + rand("bv", i))) % (H + 40));
      const x = rand("bx", i) * W + Math.sin(frame / 15 + i) * 8;
      return <circle key={i} cx={x} cy={y} r={3 + rand("br", i) * 6} fill="none" stroke="#d8f2ff" strokeWidth={2} opacity={0.7} />;
    })}
  </g>
);
