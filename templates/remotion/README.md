# Remotion 模板

把本目录下的 `.tsx/.ts` 复制到项目 `src/<片名>/`，然后写主合成。

| 文件 | 内容 |
|---|---|
| `theme.ts` | 尺寸、墨色/金色、`ease`/`rand`/`sec` 工具、7 套色板（DUSK / DAY / NIGHT / RAIN / SNOW / FOREST / INDOOR_WARM） |
| `Creature.tsx` | 方块小生物：`look`（主色/头顶特征/翅膀或手/喙/腿数/配饰/纹理）、`mood`（7 种表情）、walking / talking / tears / wave / tilt；`LOOKS` 预设 |
| `Emote.tsx` | 情绪符号（? ! 汗 爱心 闪光 Zzz … 怒 音符）、对白气泡 `SpeechBubble` |
| `Scenery.tsx` | `Stage`（SVG 画布）、`Cam`（推拉镜头）、积木 Sky / Orb / Clouds / Hills / Sea / Ground / Trees / City / Room / Rain / Snow / Fireflies / Underwater，小物件 Lamp / Bench / Umbrella / Bottle |
| `Presets.tsx` | 11 个预设场景 `PRESETS`（海边黄昏/白天/夜、清晨、城市雨夜、温暖房间、森林、雪地、公园长椅、山坡星空、海底）和参考图渲染组件 `PresetGallery`，效果见技能 `refs/scene-*.jpg` |
| `Subtitles.tsx` | 底部字幕条，`cues`（秒）+ `mode`（first-gold / karaoke / plain）+ 对白角色名 |
| `PaperLook.tsx` | 纸面颗粒 + 暗角 |
| `Example.tsx` | 完整示例：故事旁白片（雨夜街头 → 温暖房间），演示时间轴由 TTS 时长驱动、交叉淡化、字幕、配音 |

## 主合成骨架
```tsx
loadFont({ family: KAI, url: staticFile("fonts/simkai.ttf") }); // 字体放 public/fonts/，没有就用系统楷体：C:/Windows/Fonts/simkai.ttf 复制过去

// 1) 时间轴：镜头起止由配音时长 / 歌词 cues 推出，不手写帧号
const SHOTS = VOICE.map(...)            // 故事：duration + 余量
// 或 const SHOTS = groupCuesIntoShots(CUES)  // 歌曲：一句一镜

// 2) 每个场景组件接收本镜局部帧 l，自己组合积木 + 角色 + 符号
const Shot1: React.FC<{ l: number }> = ({ l }) => (
  <Cam z={ease(l, [0, dur], [1, 1.08])}>
    <Stage>
      <Sky p={RAIN} id="s1" frame={l} /> <City p={RAIN} id="s1" frame={l} /> <Ground p={RAIN} y={520} />
      <Creature look={LOOKS.kid} x={640} y={600} mood="sad" frame={l} />
      <Rain frame={l} />
    </Stage>
  </Cam>
);

// 3) 合成：<Sequence> 排镜头（前后重叠 XF 帧做交叉淡化）→ <PaperLook/> → <Subtitles/> → <Audio/>
```

## 注意
- 每个场景的积木要传不同 `id`（SVG defs 去重）。
- 角色脚底 y 建议 560–620；字幕占底部 ~90px，关键内容别放进去。
- 交叉淡化：后一镜比前一镜早 XF 帧开始，并在开头 XF 帧内 opacity 0→1；前一镜不淡出（避免中间变暗）。
