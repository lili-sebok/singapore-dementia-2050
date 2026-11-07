# Word timestamps for tools/align.ts: whisper_words.py <16 kHz mono wav> <out.json> [script]
#
# Transcribes in chunks of about CHUNK seconds, cut in the longest pause near each boundary, each chunk on
# its own (no text carried over from the previous one). One pass over the whole file lets a mishearing
# carry forward and squash later lines; chunks contain it. The prompt is the script's vocabulary (names and
# figures), so they come back spelled our way.

import os, re, sys, json, wave, numpy as np
from faster_whisper import WhisperModel

SR = 16000
CHUNK = float(os.environ.get("CHUNK", 24))

w = wave.open(sys.argv[1])
a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
script = sys.argv[3] if len(sys.argv) > 3 else ""

# vocabulary prompt: words with digits or capitals, each once, in script order
seen, vocab = set(), []
for t in script.split():
    t = t.strip(".,;:!?\"'()")
    if t and (re.search(r"\d", t) or t[0].isupper()) and t.lower() not in seen:
        seen.add(t.lower()); vocab.append(t)
prompt = " ".join(vocab)[:600] or None

# cut points: the quietest 0.3 s window within 6 s before each CHUNK boundary
hop = int(0.05 * SR)
rms = np.sqrt(np.convolve(a ** 2, np.ones(hop) / hop, mode="same")[::hop] + 1e-12)
win = int(0.3 * SR / hop)
quiet = np.convolve(rms, np.ones(win) / win, mode="same")
cuts, t = [0.0], CHUNK
dur = len(a) / SR
while t < dur - 4:
    lo, hi = int((t - 6) * SR / hop), int(t * SR / hop)
    k = lo + int(np.argmin(quiet[lo:hi]))
    cuts.append(k * hop / SR)
    t = cuts[-1] + CHUNK
cuts.append(dur)

m = WhisperModel("small.en", device="cpu", compute_type="int8")
out = []
for c0, c1 in zip(cuts, cuts[1:]):
    seg = a[int(c0 * SR):int(c1 * SR)]
    segs, _ = m.transcribe(seg, word_timestamps=True, initial_prompt=prompt, condition_on_previous_text=False)
    for s in segs:
        for x in s.words:
            out.append({"w": x.word.strip(), "s": round(c0 + x.start, 3), "e": round(c0 + x.end, 3)})
print(f"whisper: {len(cuts) - 1} chunks, {len(out)} words", file=sys.stderr)
json.dump(out, open(sys.argv[2], "w"))
