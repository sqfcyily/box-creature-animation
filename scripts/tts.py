"""旁白/对白配音 + 句级字幕时间戳（edge-tts，需联网；pip install edge-tts）

用法：python tts.py <story.json> <out.ts> <音频输出目录> [--rate=-6%] [--public-prefix=<相对 public 的目录>]

story.json：
[
  {"id": "s1", "text": "从前，有一只小乌鸦。"},
  {"id": "s2", "text": "你好呀！", "speaker": "小白", "voice": "zh-CN-XiaoyiNeural"}
]
- voice 缺省用 DEFAULT_VOICE；同一 id 多条（多人对白）会顺序拼接为同一镜的多段音频：<id>_<n>.mp3
产出 <out.ts>：
export const VOICE = [{ id, duration, clips: [{ src, start, duration }], subs: [{ text, start, end, speaker? }] }] as const;
- 时间单位为秒，相对本镜开头；同镜多段之间留 GAP 秒。
- 字幕行按标点切分，每行 ≤ MAX_CHARS 字。
"""
import asyncio, json, os, re, sys

sys.stdout.reconfigure(encoding="utf-8")  # Windows 控制台默认 GBK，避免中文乱码

DEFAULT_VOICE = "zh-CN-XiaoxiaoNeural"
MAX_CHARS = 18
GAP = 0.35
PUNCT = r"[，。；：！？、,.!?;:\s“”\"‘’…]"


def split_lines(text):
    parts = [p for p in re.split(r"(?<=[。；！？!?；])", text) if p.strip()]
    lines = []
    for p in parts:
        if len(p) <= MAX_CHARS + 2:
            lines.append(p)
            continue
        buf = ""
        for s in [s for s in re.split(r"(?<=[，、,：:])", p) if s]:
            if buf and len(buf) + len(s) > MAX_CHARS:
                lines.append(buf)
                buf = s
            else:
                buf += s
        if buf:
            lines.append(buf)
    return lines


async def synth(text, voice, rate, path):
    import edge_tts

    comm = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary")
    audio, words = bytearray(), []
    async for chunk in comm.stream():
        if chunk["type"] == "audio":
            audio += chunk["data"]
        elif chunk["type"] == "WordBoundary":
            words.append({"t": chunk["offset"] / 1e7, "d": chunk["duration"] / 1e7, "w": chunk["text"]})
    with open(path, "wb") as f:
        f.write(audio)
    return words


def align(text, words, base, speaker):
    subs, wi = [], 0
    for line in split_lines(text):
        core = re.sub(PUNCT, "", line)
        consumed, start, end = "", None, None
        while wi < len(words) and len(consumed) < len(core):
            w = words[wi]
            start = w["t"] if start is None else start
            consumed += re.sub(PUNCT, "", w["w"])
            end = w["t"] + w["d"]
            wi += 1
        shown = line.strip().rstrip("，、；：。,;:.")
        sub = {"text": shown, "start": round(base + (start or 0), 3), "end": round(base + (end or 0), 3)}
        if speaker:
            sub["speaker"] = speaker
        subs.append(sub)
    return subs


async def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    opts = dict(a[2:].split("=", 1) for a in sys.argv[1:] if a.startswith("--") and "=" in a)
    if len(args) < 3:
        print(__doc__)
        sys.exit(1)
    story_path, out_ts, audio_dir = args
    rate = opts.get("rate", "-6%")
    prefix = opts.get("public-prefix", os.path.relpath(audio_dir, "public").replace("\\", "/"))
    os.makedirs(audio_dir, exist_ok=True)
    with open(story_path, encoding="utf-8") as f:
        items = json.load(f)

    shots, order = {}, []
    for it in items:
        if it["id"] not in shots:
            shots[it["id"]] = []
            order.append(it["id"])
        shots[it["id"]].append(it)

    res = []
    for sid in order:
        t, clips, subs = 0.0, [], []
        for n, it in enumerate(shots[sid]):
            name = f"{sid}.mp3" if len(shots[sid]) == 1 else f"{sid}_{n}.mp3"
            words = await synth(it["text"], it.get("voice", DEFAULT_VOICE), it.get("rate", rate), os.path.join(audio_dir, name))
            dur = (words[-1]["t"] + words[-1]["d"]) if words else 0
            clips.append({"src": f"{prefix}/{name}", "start": round(t, 3), "duration": round(dur, 3)})
            subs += align(it["text"], words, t, it.get("speaker"))
            t += dur + GAP
        total = round(t - GAP, 3)
        res.append({"id": sid, "duration": total, "clips": clips, "subs": subs})
        print(sid, total, [s["text"] for s in subs])

    os.makedirs(os.path.dirname(out_ts) or ".", exist_ok=True)
    with open(out_ts, "w", encoding="utf-8") as f:
        f.write("// 由 tts.py 自动生成：配音片段与句级字幕时间戳（秒，相对本镜开头）\nexport const VOICE = ")
        json.dump(res, f, ensure_ascii=False, indent=1)
        f.write(" as const;\n")


asyncio.run(main())
