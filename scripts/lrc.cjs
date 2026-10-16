// 歌词 → 字幕 cues（秒）。支持 LRC（带时间戳）或纯文本（按字数自动估时）。
// 用法：
//   node lrc.cjs song.lrc  src/<片名>/cues.ts [--from 00:55.28] [--to 01:02.10] [--offset 0.3] [--lead 0.5]
//   node lrc.cjs lyrics.txt src/<片名>/cues.ts [--cps 3] [--gap 0.3] [--lead 0.3]
// - LRC：截取 [from, to) 区间的歌词行，时间整体平移使片段从 --lead 秒开始；每句 end = 下一句 start - 0.1（末句 = to 或 +3s）
// - 纯文本：每行一句，时长 = 字数 / cps（夹在 2.2~4.5s），句间留 gap
// 产出：export const CUES: Cue[] = [...]; export const CUES_END = <秒>;
const fs = require("fs");
const path = require("path");

const argv = process.argv.slice(2);
const opt = (k, d) => {
  const i = argv.indexOf(`--${k}`);
  return i >= 0 ? argv[i + 1] : d;
};
const [src, out] = argv.filter((a, i) => !a.startsWith("--") && !(i > 0 && argv[i - 1].startsWith("--")));
if (!src || !out) {
  console.log(fs.readFileSync(__filename, "utf8").split("\n").slice(0, 7).join("\n"));
  process.exit(1);
}
const toSec = (s) => {
  if (s === undefined) return undefined;
  const m = String(s).match(/^(?:(\d+):)?(\d+(?:\.\d+)?)$/);
  return m ? (Number(m[1] || 0) * 60 + Number(m[2])) : Number(s);
};

const raw = fs.readFileSync(src, "utf8").replace(/^\uFEFF/, "");
const lead = Number(opt("lead", 0.3));
let cues = [];

if (/\[\d+:\d+(?:[.:]\d+)?\]/.test(raw)) {
  const offset = Number(opt("offset", 0));
  const lines = [];
  for (const line of raw.split(/\r?\n/)) {
    const tags = [...line.matchAll(/\[(\d+):(\d+(?:[.:]\d+)?)\]/g)];
    const text = line.replace(/\[[^\]]*\]/g, "").trim();
    if (!tags.length || !text) continue;
    for (const t of tags) lines.push({ t: Number(t[1]) * 60 + Number(t[2].replace(":", ".")), text });
  }
  lines.sort((a, b) => a.t - b.t);
  const from = toSec(opt("from")) ?? (lines[0]?.t ?? 0);
  const to = toSec(opt("to")) ?? Infinity;
  const sel = lines.filter((l) => l.t >= from - 0.05 && l.t < to);
  const shift = lead - from + offset;
  cues = sel.map((l, i) => {
    const next = i + 1 < sel.length ? sel[i + 1].t : Math.min(to, l.t + 3.5);
    return { text: l.text, start: +(l.t + shift).toFixed(3), end: +(next + shift - 0.1).toFixed(3) };
  });
} else {
  const cps = Number(opt("cps", 3));
  const gap = Number(opt("gap", 0.3));
  let t = lead;
  for (const text of raw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)) {
    const n = Array.from(text.replace(/[\s，。！？、,.!?]/g, "")).length;
    const d = Math.min(4.5, Math.max(2.2, n / cps));
    cues.push({ text, start: +t.toFixed(3), end: +(t + d).toFixed(3) });
    t += d + gap;
  }
}

const end = cues.length ? cues[cues.length - 1].end : 0;
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(
  out,
  `// 由 lrc.cjs 自动生成（秒）\nimport type { Cue } from "./Subtitles";\n\nexport const CUES: Cue[] = ${JSON.stringify(cues, null, 1)};\nexport const CUES_END = ${end};\n`,
);
cues.forEach((c) => console.log(`${c.start.toFixed(2)}–${c.end.toFixed(2)}  ${c.text}`));
console.log(`→ ${out}（共 ${cues.length} 句，结束于 ${end.toFixed(2)}s）`);
