import { Easing, interpolate, random } from "remotion";

export const W = 1280;
export const H = 720;
export const FPS = 30;
/** 字幕字体族名：在主合成里 loadFont({ family: KAI, url: staticFile("fonts/xxx.ttf") }) */
export const KAI = "BoxKai";

export const INK = "#2b2230";
export const GOLD = "#F2C14E";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 带缓动、两端钳制的插值 */
export const ease = (f: number, i: number[], o: number[], e: (t: number) => number = Easing.inOut(Easing.cubic)) =>
  interpolate(f, i, o, { ...clamp, easing: e });

/** 确定性随机 */
export const rand = (key: string, i: number) => random(`${key}-${i}`);

/** 秒 → 帧 */
export const sec = (s: number) => Math.round(s * FPS);

export type Palette = {
  skyTop: string;
  skyBottom: string;
  glow: string;
  light: string;
  cloud: string;
  far: string; // 远景剪影（远山/远楼）
  mid: string; // 中景（近山/树/墙）
  ground: string; // 站立面
  groundEdge: string; // 地平线/湿沙/路沿
  water: [string, string];
  waterLine: string;
  glitter: string;
  foam: string;
};

/** 时段/场景色板，新场景在此基础上微调 */
export const DUSK: Palette = {
  skyTop: "#7d6a9e", skyBottom: "#e9b7b4", glow: "#ffd9a0", light: "#fff3d6", cloud: "#f3d0bf",
  far: "#9c86b5", mid: "#b49ac4", ground: "#e8cfa2", groundEdge: "#c9a9bb",
  water: ["#3d6f9e", "#5b86ae"], waterLine: "#8fb3d1", glitter: "#ffe7a8", foam: "#f6f1f4",
};
export const DAY: Palette = {
  skyTop: "#f2dca6", skyBottom: "#f8ecc9", glow: "#fff2c4", light: "#fffbe8", cloud: "#fbf3dc",
  far: "#e3d5b5", mid: "#d8c7a4", ground: "#f1dfb6", groundEdge: "#e2cf9e",
  water: ["#3fa8b0", "#6cc4c2"], waterLine: "#a6e0d9", glitter: "#fffbe6", foam: "#fdfaf0",
};
export const NIGHT: Palette = {
  skyTop: "#1d1d45", skyBottom: "#4a4878", glow: "#b9b6ea", light: "#fff6d8", cloud: "#6b6896",
  far: "#4f4a7e", mid: "#5f5a8e", ground: "#5e5b80", groundEdge: "#3b3f6c",
  water: ["#1f3560", "#2c4677"], waterLine: "#5d79a8", glitter: "#fff1c2", foam: "#d9def3",
};
export const RAIN: Palette = {
  skyTop: "#3a4258", skyBottom: "#6b7590", glow: "#ffd58a", light: "#ffe7b0", cloud: "#5a6178",
  far: "#4a5268", mid: "#3c4358", ground: "#4b5166", groundEdge: "#363c4f",
  water: ["#3a4a66", "#4c5c7a"], waterLine: "#7d8aa6", glitter: "#ffd58a", foam: "#c9d0de",
};
export const SNOW: Palette = {
  skyTop: "#b9cbe0", skyBottom: "#e6eef6", glow: "#ffffff", light: "#fffdf4", cloud: "#f2f6fa",
  far: "#a9bcd4", mid: "#8fa7c2", ground: "#f4f7fb", groundEdge: "#d6e0ec",
  water: ["#8fb0cc", "#a9c4da"], waterLine: "#d6e4f0", glitter: "#ffffff", foam: "#ffffff",
};
export const FOREST: Palette = {
  skyTop: "#cfe3c8", skyBottom: "#f3ecc8", glow: "#fff0b8", light: "#fffbe2", cloud: "#f6f6e6",
  far: "#a9c39c", mid: "#6f9a6a", ground: "#9cbf7a", groundEdge: "#86aa66",
  water: ["#6fa7a0", "#8cc0b5"], waterLine: "#c4e2d8", glitter: "#fffbe2", foam: "#f4fbf2",
};
/** 室内暖灯：sky* 作墙面，ground 作地板 */
export const INDOOR_WARM: Palette = {
  skyTop: "#e9c9a3", skyBottom: "#f3dcbc", glow: "#ffd98c", light: "#fff4d2", cloud: "#f7e6cc",
  far: "#d9b48c", mid: "#b98a62", ground: "#c99a6e", groundEdge: "#a87a52",
  water: ["#6f8fb0", "#8aa6c2"], waterLine: "#b8cbe0", glitter: "#fff4d2", foam: "#fff",
};
