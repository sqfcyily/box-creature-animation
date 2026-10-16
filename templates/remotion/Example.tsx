/**
 * 示例：故事旁白片《雨夜》——雨夜街头 → 温暖房间。
 * 时间轴完全由 voice.ts（tts.py 生成）推出：镜头时长 = 配音时长 + PAD。
 *
 * 准备：
 *   story.json = [
 *     {"id":"s1","text":"下雨的晚上，小方一个人走在回家的路上。"},
 *     {"id":"s2","text":"推开门，暖黄的灯亮着，小猫已经在等他了。"}
 *   ]
 *   python <技能>/scripts/tts.py story.json src/<片名>/voice.ts public/<片名>/vo
 *   node   <技能>/scripts/ambient.cjs public/<片名>/ambient.wav --dur 12 --chords "Am:0,F:3,C:6,G:9" --rain
 * Root.tsx：<Composition id="RainyNight" component={Example} durationInFrames={EX_TOTAL} fps={30} width={1280} height={720} />
 */
import React from "react";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import { AbsoluteFill, Easing, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Creature, LOOKS } from "./Creature";
import { Emote } from "./Emote";
import { PaperLook } from "./PaperLook";
import { Cam, City, Fireflies, Ground, Lamp, Orb, Room, Rain, Sky, Stage, Umbrella } from "./Scenery";
import { Cue, Subtitles } from "./Subtitles";
import { FPS, INDOOR_WARM, KAI, NIGHT, RAIN, clamp, ease, sec } from "./theme";
import { VOICE } from "./voice";

loadFont({ family: KAI, url: staticFile("fonts/simkai.ttf") });

const PAD = 1.0; // 每镜配音后留白（秒）
const LEAD = 0.5; // 每镜配音前留白（秒）
const XF = 12; // 交叉淡化帧数

/** 由配音时长推出镜头表与全片字幕 */
const SHOTS = (() => {
  let at = 0;
  return VOICE.map((v) => {
    const from = at;
    const dur = sec(LEAD + v.duration + PAD);
    at += dur - XF;
    return { ...v, from, dur };
  });
})();
export const EX_TOTAL = SHOTS[SHOTS.length - 1].from + SHOTS[SHOTS.length - 1].dur;
const CUES: Cue[] = SHOTS.flatMap((s) => s.subs.map((c) => ({ text: c.text, start: s.from / FPS + LEAD + c.start, end: s.from / FPS + LEAD + c.end })));

/** 镜 1：雨夜街头，小方撑伞慢慢走，路灯下停住叹气 */
const Street: React.FC<{ l: number; dur: number }> = ({ l, dur }) => {
  const x = ease(l, [0, dur * 0.7], [300, 600], Easing.inOut(Easing.quad));
  const walking = l < dur * 0.7;
  return (
    <Cam z={ease(l, [0, dur], [1, 1.06])} cy={560}>
      <Stage>
        <Sky p={RAIN} id="st" frame={l} horizon={470} />
        <City p={RAIN} id="st" frame={l} y={470} />
        <Ground p={RAIN} y={470} />
        <Lamp x={760} y={600} frame={l} />
        <Creature look={LOOKS.kid} x={x} y={600} mood="sad" facing={1} frame={l} walking={walking} />
        {/* 伞柄在身体右侧（手的位置），伞面高过头顶，避免遮脸 */}
        <Umbrella x={x + 66} y={446 + Math.sin(l / 4) * (walking ? 2 : 0)} color="#5f8fc4" tilt={-10} />
        <Emote kind="dots" x={x - 95} y={470} frame={l} at={Math.round(dur * 0.75)} />
        <Rain frame={l} groundY={640} />
      </Stage>
    </Cam>
  );
};

/** 镜 2：温暖房间，小猫在等，看到他冒爱心，小方开心 */
const Home: React.FC<{ l: number; dur: number }> = ({ l, dur }) => (
  <Cam z={ease(l, [0, dur], [1.02, 1.1])} cy={560}>
    <Stage>
      <Room p={INDOOR_WARM} id="hm" frame={l} windowSky={NIGHT} />
      <Orb p={INDOOR_WARM} id="hm" kind="glow" x={260} y={300} r={40} />
      <Creature look={LOOKS.kid} x={480} y={600} mood={l > 20 ? "happy" : "neutral"} facing={1} frame={l} wave={ease(l, [30, 45, 80], [0, 0.6, 0])} />
      <Creature look={LOOKS.cat} x={760} y={600} scale={0.75} mood="happy" facing={-1} frame={l + 9} />
      <Emote kind="heart" x={760} y={470} frame={l} at={24} />
      <Emote kind="sparkle" x={530} y={450} frame={l} at={36} size={0.8} />
      <Fireflies frame={l} count={14} color="#fff4d2" />
    </Stage>
  </Cam>
);

const SCENES = [Street, Home];

export const Example: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {SHOTS.map((s, i) => {
        const C = SCENES[i];
        return (
          <Sequence key={s.id} from={s.from} durationInFrames={s.dur} name={s.id}>
            <AbsoluteFill style={{ opacity: i === 0 ? 1 : interpolate(f - s.from, [0, XF], [0, 1], clamp) }}>
              <C l={f - s.from} dur={s.dur} />
            </AbsoluteFill>
            {s.clips.map((c, k) => (
              <Sequence key={k} from={sec(LEAD + c.start)} layout="none">
                <Audio src={staticFile(c.src)} />
              </Sequence>
            ))}
          </Sequence>
        );
      })}
      <PaperLook />
      <Subtitles cues={CUES} mode="plain" />
      <Audio src={staticFile("rainy-night/ambient.wav")} volume={(af) => interpolate(af, [0, 15, EX_TOTAL - 30, EX_TOTAL], [0, 0.35, 0.35, 0], clamp)} />
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: interpolate(f, [EX_TOTAL - 18, EX_TOTAL], [0, 1], clamp) }} />
    </AbsoluteFill>
  );
};
