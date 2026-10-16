# 字幕与旁白（全部自动生成）

字幕永远由代码渲染（`templates/remotion/Subtitles.tsx`），时间轴来自脚本产物，**不要手写帧号、不要让 AI 画字**。

## 统一数据格式
所有来源最终都转成：
```ts
type Cue = { text: string; start: number; end: number; speaker?: string }; // 秒
```
放在 `src/<片名>/cues.ts`（或 JSON），主合成用 `Math.round(sec * fps)` 转帧。

## 1. 歌曲
| 已有材料 | 做法 |
|---|---|
| LRC 歌词文件（推荐，网易云/QQ音乐/歌曲宝可找到） | `node scripts/lrc.cjs song.lrc src/<片名>/cues.ts --from 00:55.28 --to 01:02.10`：截取片段、时间归零、每句 end = 下一句 start |
| 只有歌词文本 | `node scripts/lrc.cjs lyrics.txt ... --cps 3`：按字数自动分配（默认每秒 3 字，句间留 0.3s） |
| 用户提供了音频 | 用 LRC 对齐；没有 LRC 时先按字数生成，再让用户听后告诉偏差，整体平移 `--offset` |
- 样式：底部居中深色圆角条 `rgba(30,25,35,0.72)`，白色楷体 34px（1280 宽时），首字金 `#F2C14E`；可选 `karaoke` 模式逐字染金。

## 2. 故事 / 旁白
- `python scripts/tts.py story.json src/<片名>/voice.ts public/<片名>/vo`
  - 输入 `story.json`：`[{ "id": "s1", "text": "……", "voice": "zh-CN-XiaoxiaoNeural" }, …]`
  - 产出：每镜一个 mp3 + `voice.ts`（每镜 `duration` 与句级 `subs[{text,start,end}]`，长句自动按标点切成 ≤18 字的字幕行）
- 依赖：`pip install -U edge-tts`（需联网）。**报 403 `Invalid response status` 时先 `pip install -U edge-tts` 升级**（旧版鉴权参数失效，7.2.8 → 7.3.1 已验证可解决）。
- 镜头时长 = `duration + 余量`；字幕 start/end 加上该镜在全片的起点即可。
- 推荐音色：讲故事 `zh-CN-XiaoxiaoNeural`（温柔女声）/ `zh-CN-YunxiNeural`（少年感男声）/ `zh-CN-YunjianNeural`（沉稳男声）；童话感可 `rate: "-8%"`。

## 3. 剧情对白
- `story.json` 每条加 `speaker`，并为不同角色配不同 `voice`（如 小白=`zh-CN-XiaoyiNeural`，小黑=`zh-CN-YunxiNeural`）。
- 画面：说话者头顶 `SpeechBubble`（≤12 字）+ 底部字幕带角色名前缀（`小白：……`，名字用角色主色）。
- 说话动画：说话期间角色 y 方向 `|sin(frame/3)|*3` 轻跳。

## 4. 无配音的纯字幕（故事卡片式）
- 按字数估时：每字 0.22s + 每句 0.8s 停顿，`lrc.cjs --cps 4.5` 同样可用。

## 5. 背景音乐
- 原曲有版权：用户没提供音频就不要用。
- `node scripts/ambient.cjs public/<片名>/ambient.wav --dur 10 --chords "F:0,C:3.07,G:4.67,Am:6.27" --waves`：合成柔和钢琴琶音 + 可选海浪/雨声（`--rain`）/风声，和弦切换点对齐镜头切换。
