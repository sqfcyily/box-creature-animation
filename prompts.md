# 提示词库（AI 生图/生视频备选方案）

> 默认走 Remotion 代码方案；只有用户要求或画面超出代码表现力时才用本文件。
> 提示词结构：**风格前缀 + 场景片段 + 角色设定 + 本镜动作/表情/符号 + 运镜**，每镜附负面词。场景片段按 `scenes.md` 为内容现编，下表只是示例。

## 1. 风格前缀（每个镜头都要带，与场景无关）

**英文**
```
2D flat hand-drawn cartoon animation, picture-book illustration style, bold dark outlines,
soft paper grain texture, watercolor gradient shading, minimalist cute box-shaped creatures
(rounded rectangle body, four short stubby legs, tiny thin arms, simple dot eyes and line mouth),
manga emotion symbols, simple layered background with soft bloom glow,
muted warm palette, healing and slightly melancholic mood, static wide shot, 16:9
```

**中文**
```
2D扁平手绘卡通动画，绘本插画风格，深色粗描边，柔和纸张颗粒质感，水彩渐变上色，
极简方块造型的可爱小生物（圆角矩形身体、四条短腿、细小手臂、点状眼睛与线条嘴），
漫画式情绪符号，简洁分层背景与柔和光晕，低饱和暖色调，治愈又略带忧伤的氛围，固定横向全景构图，16:9
```

## 2. 场景片段示例
| 场景 | 适用情绪 | 英文片段 |
|---|---|---|
| 城市雨夜 | 低落、错过 | `rainy city night, distant building silhouettes with a few warm lit windows, wet street reflecting a yellow street lamp, thin slanted rain lines, cool grey-blue tones` |
| 温暖房间 | 日常、安心 | `cozy small room, warm desk lamp glow, window showing night sky with stars, wooden floor, floating dust motes` |
| 森林小路 | 冒险、寻找 | `quiet forest path, rounded hand-drawn trees in two layers, soft green and amber light, fireflies` |
| 雪地 | 等待、纯净 | `snowy field, pointed pine trees, gentle falling snow, pale blue and white palette` |
| 海边黄昏 | 怀念、开场、结尾 | `seaside at sunset, purple-pink sky, large golden sun glow near horizon, lavender mountains, deep blue sea, pale lilac wet sand` |
| 海边白天 | 甜蜜回忆、相处 | `seaside in warm golden daylight haze, turquoise sea, pale cream sand, beige hazy mountains, bright sun flare top right` |
| 海边夜晚 | 孤独、寻找、失去 | `seaside at night, deep indigo sky, thin crescent moon, small sparkling stars, moonlight glitter path on dark sea, cool blue-purple tones` |
| 海底 | 秘密、沉没、心事 | `deep blue underwater, light rays from above, tall green seaweed, rising bubbles, small orange fish, red starfish, pale round rocks on seabed` |

## 3. 角色设定（按内容设计，每个镜头都要带，用于保持一致）
写法：`a <主色> box creature with <头顶特征>, <配饰>, four short legs, tiny arms, dot eyes`。示例：
- 木纹男孩（LOOKS.boy）：`an orange-brown box creature with subtle wood-grain lines, four short legs, tiny arms, dot eyes`
- 贝壳女孩（LOOKS.girl）：`a light teal-blue box creature with a small pink seashell on its head`
- 白鸽：`a creamy white box creature with a small curled feather tuft on top, little white wings, small orange beak`
- 乌鸦：`a charcoal black box creature with three short spiky feathers on top, little dark wings, small yellow beak`
- 角色体型很小，大约占画面高度的 1/5 到 1/4，通常站在画面中下部。

## 4. 表情和情绪符号
| 情绪 | 表情 | 符号 |
|---|---|---|
| 开心 | `^ ^ closed happy eyes, small smile` | 爱心 `small pink heart` |
| 惊喜 | `sparkling star eyes, open mouth` | 闪光 `sparkles` |
| 疑惑 | `blank dot eyes` | `blue question mark above head` |
| 发现 | `wide eyes` | `yellow exclamation mark above head` |
| 难过 | `teary eyes, wavy frown` | `blue sweat drops / tear drops` |
| 害羞 | `blush, tiny wavy mouth` | `heart` |

## 5. 常用道具和镜头语言
- 道具按场景挑：雨伞 `a small red umbrella`、路灯 `a yellow street lamp glowing`、长椅 `a small wooden park bench`、台灯 `a warm desk lamp`、漂流瓶 `a small glass message bottle with a red heart note inside`、围巾 `a tiny red scarf`
- 回忆 / 想念：倒影（湿沙、水洼、窗玻璃）里出现对方；或画面暖色虚化 + 圆形遮罩
- 距离感：对方变得很小、发着光，在远处（海平线、对面楼顶、山顶、星空里）
- 运镜：以 `static wide shot` 为主，情绪高潮处用 `slow push-in`，转场用 `slow pan` 或淡入淡出

## 6. 负面提示词
```
3D render, realistic, photorealistic, anime human, detailed faces, complex shading, high saturation neon,
text, letters, watermark, subtitles, deformed characters, extra limbs, cluttered background
```

## 7. 字幕
不要让 AI 画字。AI 生成的画面素材导入 Remotion 后，用 `templates/remotion/Subtitles.tsx` 自动叠加字幕（方案见 `subtitles.md`）。

## 8. 示例镜头
```
[风格前缀] + [城市雨夜], a small box creature with brown hair block and red scarf walks alone under a blue umbrella,
sad dot eyes, a puddle on the street reflects a yellow street lamp, "..." above head, static wide shot
```
```
[风格前缀] + [温暖房间], the box creature opens the door and smiles ^^, a striped orange box cat with triangle ears
waits on the wooden floor with a small pink heart above head, warm desk lamp glow, slow push-in
```
```
[风格前缀] + [海边黄昏], the orange box creature stands on wet sand looking confused with a blue "?" above head,
its mirror reflection below shows the teal box creature with a seashell smiling, nostalgic memory feeling, slow push-in
```
