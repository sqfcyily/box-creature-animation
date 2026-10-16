/**
 * 预设场景：常用背景的现成组合，直接当作镜头背景用，或复制后修改。
 *   <Stage><PRESETS.rainyCity frame={l} /> <Creature .../></Stage>
 * PresetGallery 用于渲染参考图（refs/scene-*.jpg）：
 *   <Composition id="Presets" component={PresetGallery} defaultProps={{ preset: "seasideDusk" }} durationInFrames={90} fps={30} width={1280} height={720} />
 *   npx remotion still Presets out/scene.png --props='{"preset":"forest"}' --frame=40
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { Creature, LOOKS } from "./Creature";
import { Emote } from "./Emote";
import { PaperLook } from "./PaperLook";
import {
  Bench, Bottle, City, Clouds, Fireflies, Ground, Hills, Lamp, Orb, Rain, Room, Sea, Sky, Snow, Stage, Trees, Umbrella, Underwater,
} from "./Scenery";
import { DAY, DUSK, FOREST, INDOOR_WARM, NIGHT, Palette, RAIN, SNOW } from "./theme";

/** 清晨：粉蓝 → 金，象征新开始 */
export const DAWN: Palette = {
  ...DAY,
  skyTop: "#a9c2e6", skyBottom: "#f6d2c4", glow: "#ffd9b0", cloud: "#fbe3dc",
  far: "#b7b9d8", mid: "#a3a6cc", water: ["#6f9fcf", "#94bde0"], waterLine: "#cfe2f2", glitter: "#fff0d8",
};

type P = { frame: number };

export const PRESETS = {
  /** 海边·黄昏：怀念、告别 */
  seasideDusk: ({ frame }: P) => (
    <>
      <Sky p={DUSK} id="pd" frame={frame} />
      <Orb p={DUSK} id="pd" kind="sun" x={900} y={318} r={46} />
      <Clouds p={DUSK} id="pd" frame={frame} />
      <Hills p={DUSK} />
      <Sea p={DUSK} id="pd" frame={frame} orbX={900} orbR={46} />
    </>
  ),
  /** 海边·白天：甜蜜、日常 */
  seasideDay: ({ frame }: P) => (
    <>
      <Sky p={DAY} id="py" frame={frame} />
      <Orb p={DAY} id="py" kind="sun" x={1110} y={70} r={52} />
      <Clouds p={DAY} id="py" frame={frame} />
      <Hills p={DAY} />
      <Sea p={DAY} id="py" frame={frame} orbX={1110} orbR={52} />
    </>
  ),
  /** 海边·夜晚：孤独、思念 */
  seasideNight: ({ frame }: P) => (
    <>
      <Sky p={NIGHT} id="pn" frame={frame} stars />
      <Orb p={NIGHT} id="pn" kind="moon" x={860} y={92} r={30} />
      <Clouds p={NIGHT} id="pn" frame={frame} opacity={0.5} />
      <Hills p={NIGHT} />
      <Sea p={NIGHT} id="pn" frame={frame} orbX={860} orbR={30} />
    </>
  ),
  /** 清晨海边：希望、新开始 */
  dawn: ({ frame }: P) => (
    <>
      <Sky p={DAWN} id="pa" frame={frame} />
      <Orb p={DAWN} id="pa" kind="sun" x={380} y={330} r={40} />
      <Clouds p={DAWN} id="pa" frame={frame} />
      <Hills p={DAWN} side="right" />
      <Sea p={DAWN} id="pa" frame={frame} orbX={380} orbR={40} />
    </>
  ),
  /** 城市雨夜：低落、错过 */
  rainyCity: ({ frame }: P) => (
    <>
      <Sky p={RAIN} id="pr" frame={frame} horizon={470} />
      <City p={RAIN} id="pr" frame={frame} y={470} />
      <Ground p={RAIN} y={470} />
      <Lamp x={900} y={600} frame={frame} />
      <Rain frame={frame} groundY={640} />
    </>
  ),
  /** 温暖房间：安心、陪伴 */
  warmRoom: ({ frame }: P) => (
    <>
      <Room p={INDOOR_WARM} id="pw" frame={frame} windowSky={NIGHT} />
      <Orb p={INDOOR_WARM} id="pw" kind="glow" x={260} y={300} r={40} />
      <Fireflies frame={frame} count={14} color="#fff4d2" />
    </>
  ),
  /** 森林小路：冒险、寻找 */
  forest: ({ frame }: P) => (
    <>
      <Sky p={FOREST} id="pf" frame={frame} horizon={470} />
      <Orb p={FOREST} id="pf" kind="glow" x={640} y={200} r={60} />
      <Hills p={FOREST} y={470} side="both" peak={0.8} />
      <Trees p={FOREST} id="pf" frame={frame} xs={[80, 300, 980, 1200]} y={470} scale={0.9} color={FOREST.far} />
      <Ground p={FOREST} y={470} />
      <path d="M560,720 Q600,560 640,470 Q680,560 720,720 Z" fill="#d9c79a" opacity={0.7} />
      <Trees p={FOREST} id="pf2" frame={frame} xs={[60, 1220]} y={640} scale={1.4} />
      <Fireflies frame={frame} count={20} />
    </>
  ),
  /** 雪地：等待、纯净 */
  snow: ({ frame }: P) => (
    <>
      <Sky p={SNOW} id="ps" frame={frame} horizon={480} />
      <Hills p={SNOW} y={480} side="both" peak={0.9} />
      <Trees p={SNOW} id="ps" frame={frame} xs={[140, 260, 1040, 1170]} y={500} kind="pine" color={SNOW.mid} />
      <Ground p={SNOW} y={480} specks={false} />
      <Snow frame={frame} />
    </>
  ),
  /** 公园长椅·黄昏：相遇、等待 */
  parkBench: ({ frame }: P) => (
    <>
      <Sky p={DUSK} id="pb" frame={frame} horizon={470} />
      <Orb p={DUSK} id="pb" kind="sun" x={1000} y={380} r={44} />
      <Clouds p={DUSK} id="pb" frame={frame} />
      <Trees p={DUSK} id="pb" frame={frame} xs={[120, 330, 1180]} y={480} />
      <Ground p={{ ...DUSK, ground: "#b9a6a0", groundEdge: "#a08e92" }} y={470} />
      <Lamp x={880} y={600} frame={frame} on={false} />
    </>
  ),
  /** 山坡星空：心愿、遥望 */
  starryHill: ({ frame }: P) => (
    <>
      <Sky p={NIGHT} id="pt" frame={frame} horizon={640} stars />
      <Orb p={NIGHT} id="pt" kind="moon" x={1050} y={110} r={34} />
      <path d="M-20,720 L-20,560 Q320,470 700,540 Q1000,590 1300,560 L1300,720 Z" fill="#3f4775" stroke="#2b2230" strokeWidth={3} />
      <Fireflies frame={frame} count={18} color="#fff1c2" area={[300, 620]} />
    </>
  ),
  /** 海底：秘密、沉入心底 */
  underwater: ({ frame }: P) => <Underwater id="pu" frame={frame} />,
} satisfies Record<string, React.FC<P>>;

export type PresetName = keyof typeof PRESETS;

/** 每个预设配一组示例角色，展示比例与站位（只用于参考图） */
const CAST: Record<PresetName, (f: number) => React.ReactNode> = {
  seasideDusk: (f) => <Creature look={LOOKS.boy} x={600} y={600} back frame={f} />,
  seasideDay: (f) => (
    <>
      <Creature look={LOOKS.boy} x={540} y={610} mood="happy" facing={1} frame={f} />
      <Creature look={LOOKS.girl} x={750} y={610} mood="happy" facing={-1} frame={f + 7} />
      <Emote kind="heart" x={645} y={430} frame={f} />
    </>
  ),
  seasideNight: (f) => (
    <>
      <Creature look={LOOKS.boy} x={640} y={590} mood="sad" frame={f} tears />
      <Bottle x={760} y={600} rot={-12} glow />
    </>
  ),
  dawn: (f) => <Creature look={LOOKS.bunny} x={720} y={610} mood="happy" facing={-1} frame={f} wave={0.5} />,
  rainyCity: (f) => (
    <>
      <Creature look={LOOKS.kid} x={560} y={600} mood="sad" frame={f} />
      <Umbrella x={626} y={446} color="#5f8fc4" tilt={-10} />
    </>
  ),
  warmRoom: (f) => (
    <>
      <Creature look={LOOKS.kid} x={480} y={600} mood="happy" frame={f} />
      <Creature look={LOOKS.cat} x={760} y={600} scale={0.75} mood="happy" facing={-1} frame={f + 9} />
    </>
  ),
  forest: (f) => (
    <>
      <Creature look={LOOKS.robot} x={560} y={620} mood="surprised" facing={1} frame={f} />
      <Emote kind="exclaim" x={560} y={460} frame={f} />
    </>
  ),
  snow: (f) => (
    <>
      <Creature look={{ ...LOOKS.kid, accessoryColor: "#5f8fc4" }} x={640} y={620} mood="neutral" frame={f} />
      <Emote kind="dots" x={640} y={470} frame={f} />
    </>
  ),
  parkBench: (f) => (
    <>
      <Bench x={560} y={620} />
      <Creature look={LOOKS.dove} x={500} y={578} scale={0.8} mood="happy" facing={1} frame={f} />
      <Creature look={LOOKS.crow} x={630} y={578} scale={0.8} mood="love" facing={-1} frame={f + 5} />
    </>
  ),
  starryHill: (f) => (
    <>
      <Creature look={LOOKS.girl} x={520} y={530} back frame={f} />
      <Creature look={LOOKS.boy} x={660} y={540} back frame={f + 6} />
    </>
  ),
  underwater: (f) => (
    <>
      <Bottle x={640} y={340 + Math.sin(f / 12) * 8} rot={-20} glow />
      <Creature look={LOOKS.girl} x={460} y={610} mood="surprised" facing={1} frame={f} />
      <Emote kind="question" x={460} y={450} frame={f} />
    </>
  ),
};

export const PresetGallery: React.FC<{ preset: PresetName; cast?: boolean }> = ({ preset, cast = true }) => {
  const C = PRESETS[preset];
  const frame = 40; // 参考图固定在第 40 帧，保证符号已弹出
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Stage>
        <C frame={frame} />
        {cast && CAST[preset](frame)}
      </Stage>
      <PaperLook />
    </AbsoluteFill>
  );
};
