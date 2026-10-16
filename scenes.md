# 场景设计

**原则**：场景从内容里来，不从模板里来，没有默认场景（海边只是预设之一）。先读内容，提取每段的 **地点 / 时间 / 天气 / 情绪**，然后：匹配第 2 节预设就直接用 → 不完全匹配就用第 1 节积木重组 → 积木也没有就按第 3 节现画。

示例：「放学路上」→ 积木组合（Sky + City(lit=false) + Ground + Trees，DUSK 色板）；「车站告别」→ 现画站台、站牌、列车剪影；「雪夜城市」→ rainyCity 的组合把 Rain 换成 Snow、色板换 NIGHT。

## 1. 场景积木（`templates/remotion/Scenery.tsx`）
所有积木都是 SVG `<g>`，在 1280×720 坐标系里摆放；按 `Palette` 取色，接收 `frame` 做微动。

| 积木 | 用途 | 关键参数 |
|---|---|---|
| `Sky` | 天空渐变 + 可选星星 | `p`, `stars` |
| `Orb` | 太阳/月牙 + 光晕 | `kind`, `x`, `y`, `r` |
| `Clouds` | 慢漂的柔边云 | `items`, `opacity` |
| `Hills` | 远山/丘陵两层剪影 | `y`, `side`, `peak` |
| `Sea` | 海面 + 波纹 + 天体碎光倒影 + 浪线沙滩 | `horizon`, `shore`, `orbX` |
| `Ground` | 平地（草地/雪地/路面），带地平线 | `y`, `color` |
| `Trees` | 一排手绘圆冠/尖冠树 | `xs`, `y`, `kind` |
| `City` | 远景楼群剪影 + 随机亮灯窗户 | `y`, `lit` |
| `Room` | 室内：墙、地板、窗（窗内可放天空）、可选台灯 | `p`, `windowSky` |
| `Rain` | 斜雨丝 | `density` |
| `Snow` | 飘雪 | `density` |
| `Fireflies` | 浮动光点（萤火、灰尘、星光） | `count`, `color` |

| `Underwater` | 海底整景：光束、水草、气泡、石头、海星 | `floorY` |

另有通用小物件：`Bottle`（漂流瓶）、`Lamp`（路灯）、`Umbrella`、`Bench`；爱心、闪光星等用 `Emote`。

## 2. 预设场景（`templates/remotion/Presets.tsx` 的 `PRESETS`，参考图在 `refs/`）
直接用作背景：`<Stage><PRESETS.forest frame={l} /> {角色…}</Stage>`。参考图里的角色只是示意比例和站位，预设本身不含角色。

| 预设 | 参考图 | 积木组合 | 适合 |
|---|---|---|---|
| `seasideDusk` | `scene-seaside-dusk.jpg` | Sky + Orb(sun) + Clouds + Hills + Sea | 怀念、告别、开场/结尾 |
| `seasideDay` | `scene-seaside-day.jpg` | 同上，DAY 色板 | 甜蜜、日常 |
| `seasideNight` | `scene-seaside-night.jpg` | Sky(stars) + Orb(moon) + Sea | 孤独、思念 |
| `dawn` | `scene-dawn.jpg` | 清晨海边，DAWN 色板 | 希望、新开始 |
| `rainyCity` | `scene-rainy-city.jpg` | Sky + City + Ground + Lamp + Rain | 低落、错过 |
| `warmRoom` | `scene-warm-room.jpg` | Room(windowSky=NIGHT) + 灯光晕 + 尘埃光点 | 安心、陪伴 |
| `forest` | `scene-forest.jpg` | Sky + Hills + 两层 Trees + Ground + 小路 + Fireflies | 冒险、寻找 |
| `snow` | `scene-snow.jpg` | Sky + Hills + Trees(pine) + 雪地 + Snow | 等待、纯净 |
| `parkBench` | `scene-park-bench.jpg` | 黄昏 Sky + Trees + Ground + Lamp（+ Bench） | 相遇、等待 |
| `starryHill` | `scene-starry-hill.jpg` | Sky(stars) + Orb(moon) + 山坡 + 光点 | 心愿、遥望 |
| `underwater` | `scene-underwater.jpg` | Underwater | 秘密、沉入心底 |

渲染参考图：在项目里临时注册 `<Composition id="Presets" component={PresetGallery} defaultProps={{ preset: "forest" }} …/>`，然后执行 `npx remotion still Presets out.png --props='{"preset":"forest"}' --frame=40`。新增预设后同样渲染一张存进 `refs/scene-<name>.jpg`。

## 3. 新场景设计规则（积木里没有时）
1. **三层纵深**：远景（剪影、低对比、偏天空色）/ 中景（主体建筑、地平线，描边 2.5px）/ 近景（角色站立面，描边 4px，最饱和）。
2. **形状极简**：每个物体 ≤ 3 个几何块 + 一条描边；不画纹理细节，用 2–3 条短线暗示（木纹、砖缝、波纹）。
3. **地平线高度**：天空占上方约 45%（y≈330）；角色站立线 y≈560–620，留出底部 ~90px 给字幕。
4. **必须有微动**：至少一种环境动效（云漂、水波、雨雪、灯光闪、树叶摇、光点浮）。
5. **光源统一**：每个场景一个主光源（太阳/月/台灯/路灯），配一圈 radialGradient 光晕，地面/水面有相应反光。
6. 新画的积木若通用，顺手抽成组件放进项目的 `Scenery.tsx`。

## 4. 情绪 → 色调
| 情绪 | 色调 | 典型时间/天气 |
|---|---|---|
| 甜蜜、温暖、日常 | 暖黄、奶油、青绿 | 白天、室内暖灯 |
| 怀念、告别、心动 | 紫粉、橙金 | 黄昏 |
| 孤独、思念、失去 | 深蓝紫 | 夜晚、月光 |
| 低落、委屈 | 冷灰蓝 | 雨天 |
| 安静、纯净、等待 | 白蓝 | 雪天 |
| 秘密、沉入心底 | 深蓝 + 光束 | 海底 |
| 希望、新开始 | 粉蓝 → 金 | 清晨日出 |
