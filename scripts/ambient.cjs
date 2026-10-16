// 合成氛围配乐：柔和钢琴琶音 + 可选海浪 / 雨声 / 风声（WAV 44.1kHz 16bit 立体声，固定种子可复现）
// 用法：node ambient.cjs <out.wav> --dur 10 --chords "F:0,C:3.07,G:4.67,Am:6.27" [--waves] [--rain] [--wind] [--seed 1]
// 和弦：C D E F G A B 加可选 # / b，后缀 m（小三）/ 7 / maj7 / add9 / sus2，冒号后为开始秒数。
const fs = require("fs");
const path = require("path");

const argv = process.argv.slice(2);
const opt = (k, d) => {
  const i = argv.indexOf(`--${k}`);
  return i >= 0 ? argv[i + 1] : d;
};
const flag = (k) => argv.includes(`--${k}`);
const out = argv[0];
if (!out || out.startsWith("--")) {
  console.log(fs.readFileSync(__filename, "utf8").split("\n").slice(0, 4).join("\n"));
  process.exit(1);
}

const SR = 44100;
const DUR = Number(opt("dur", 10)) + 0.3;
const n = Math.round(DUR * SR);
const L = new Float32Array(n);
const R = new Float32Array(n);
let seed = Number(opt("seed", 20261016)) >>> 0;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0), seed / 4294967296);

// —— 噪声类环境声 ——
function noiseBed({ cutoff, gain, swellPeriod, swellDepth, cutoffSwing = 0 }) {
  let a1 = 0, b1 = 0, a2 = 0, b2 = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const sw = swellPeriod ? 0.5 + 0.5 * Math.sin((2 * Math.PI * t) / swellPeriod - 0.6) : 1;
    const env = 1 - swellDepth + swellDepth * sw * sw;
    const c = cutoff + cutoffSwing * sw;
    a1 += c * (rnd() * 2 - 1 - a1);
    b1 += c * (rnd() * 2 - 1 - b1);
    a2 += 0.3 * (a1 - a2);
    b2 += 0.3 * (b1 - b2);
    L[i] += a2 * env * gain;
    R[i] += b2 * env * gain;
  }
}
if (flag("waves")) noiseBed({ cutoff: 0.03, cutoffSwing: 0.05, gain: 2.2, swellPeriod: 5.44, swellDepth: 0.75 });
if (flag("wind")) noiseBed({ cutoff: 0.012, cutoffSwing: 0.01, gain: 2.6, swellPeriod: 7.3, swellDepth: 0.5 });
if (flag("rain")) {
  noiseBed({ cutoff: 0.35, gain: 0.25, swellPeriod: 0, swellDepth: 0 });
  for (let k = 0; k < DUR * 40; k++) {
    // 雨滴：短促的高频点
    const s0 = Math.floor(rnd() * (n - 2000));
    const amp = 0.05 + rnd() * 0.08;
    const pan = rnd();
    for (let j = 0; j < 600; j++) {
      const v = (rnd() * 2 - 1) * amp * Math.exp(-j / 90);
      L[s0 + j] += v * (1 - pan);
      R[s0 + j] += v * pan;
    }
  }
}

// —— 钢琴 ——
const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const QUAL = { "": [0, 4, 7, 12], m: [0, 3, 7, 12], "7": [0, 4, 7, 10], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10], add9: [0, 4, 7, 14], sus2: [0, 2, 7, 12] };
function parseChord(s) {
  const m = s.trim().match(/^([A-G])([#b]?)(maj7|m7|add9|sus2|m|7)?$/);
  if (!m) throw new Error("无法解析和弦: " + s);
  const root = NOTE[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0);
  return { root, iv: QUAL[m[3] || ""] };
}
const hz = (mid) => 440 * Math.pow(2, (mid - 69) / 12);
function note(t0, midi, vel, len = 3.2, pan = 0) {
  const f = hz(midi);
  const s0 = Math.round(t0 * SR);
  const m = Math.min(n - s0, Math.round(len * SR));
  for (let k = 0; k < m; k++) {
    const t = k / SR;
    const env = Math.min(1, t / 0.006) * Math.exp(-t * 1.6);
    const v =
      Math.sin(2 * Math.PI * f * t) +
      0.45 * Math.sin(2 * Math.PI * 2 * f * t) * Math.exp(-t * 3) +
      0.18 * Math.sin(2 * Math.PI * 3 * f * t) * Math.exp(-t * 5) +
      0.08 * Math.sin(2 * Math.PI * 4.01 * f * t) * Math.exp(-t * 7);
    L[s0 + k] += v * env * vel * (1 - pan) * 0.5;
    R[s0 + k] += v * env * vel * (1 + pan) * 0.5;
  }
}
const chords = (opt("chords", "C:0") || "").split(",").filter(Boolean).map((c) => {
  const [name, at] = c.split(":");
  return { ...parseChord(name), at: Number(at) };
});
chords.forEach((c, idx) => {
  const next = idx + 1 < chords.length ? chords[idx + 1].at : DUR;
  const span = next - c.at;
  const r = (c.root + 12) % 12;
  const bass = 36 + r;
  const base = 60 + r - (r > 6 ? 12 : 0); // 和弦落在中音区 C4 附近
  // 每 ~3.2s 重新拨一次，长段落不至于断音
  for (let t = c.at; t < next - 0.4; t += 3.2) {
    note(t + 0.15, bass, 0.32, 4, -0.2);
    note(t + 0.15, bass + 12, 0.16, 4, -0.1);
    c.iv.forEach((iv, j) => note(t + 0.15 + 0.32 * j, base + iv, 0.17 - j * 0.015, 3.4, -0.3 + j * 0.2));
    if (span < 3.2) break;
  }
});

// —— 写 WAV（峰值归一化到 0.9） ——
let peak = 0;
for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const g = peak > 0.9 ? 0.9 / peak : 1;
const buf = Buffer.alloc(44 + n * 4);
buf.write("RIFF", 0);
buf.writeUInt32LE(36 + n * 4, 4);
buf.write("WAVEfmt ", 8);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write("data", 36);
buf.writeUInt32LE(n * 4, 40);
for (let i = 0; i < n; i++) {
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * g)) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * g)) * 32767), 46 + i * 4);
}
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, buf);
console.log(`${out} ${DUR.toFixed(1)}s`);
