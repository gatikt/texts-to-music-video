"""Align the written lyrics to whisper's word times -> per-word sung times for karaoke + animation cues.

usage: python3 scripts/align_lyrics.py <dir> <song_end_seconds>
  <dir> has lyrics.txt + transcript.json (from analyze_audio.py). Writes <dir>/aligned.json and prints one line per lyric.
CHECK THE OUTPUT: whisper often merges/skips a repeated chorus. If a chorus' lines all get squashed into a tiny window,
copy the timing from another chorus with a time offset (e.g. chorus 1 = chorus 2 - 60 s)."""
import json, re, difflib, sys, os, argparse
ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
ap.add_argument('dir'); ap.add_argument('end', type=float, help='song end time in seconds (duration of song_cut.wav)')
A = ap.parse_args()
os.chdir(A.dir); END = A.end
lines = []; sec = None
for raw in open('lyrics.txt').read().splitlines():
    l = raw.strip()
    if not l: continue
    if l.startswith('[') and l.endswith(']'): sec = l[1:-1]; continue
    lines.append({'sec': sec, 'text': l})
norm = lambda w: re.sub(r"[^a-z0-9]", "", w.lower().replace('a.m.', 'am'))
tr = json.load(open('transcript.json')); W = [w for s in tr for w in s['words']]; wt = [norm(w['w']) for w in W]
L = [(i, j, w) for i, ln in enumerate(lines) for j, w in enumerate(ln['text'].split())]
lt = [norm(w) for _, _, w in L]
sm = difflib.SequenceMatcher(None, lt, wt, autojunk=False); times = [None] * len(L)
for a, b, n in sm.get_matching_blocks():
    for k in range(n): times[a + k] = W[b + k]['s']
for tag, i1, i2, j1, j2 in sm.get_opcodes():
    if tag == 'replace':
        for k in range(i2 - i1):
            jj = j1 + round(k * (j2 - j1) / max(1, i2 - i1))
            if jj < j2: times[i1 + k] = W[jj]['s']
for k in range(len(times)):  # interpolate words whisper never heard
    if times[k] is None:
        p = next((times[q] for q in range(k - 1, -1, -1) if times[q] is not None), 0)
        n = next((times[q] for q in range(k + 1, len(times)) if times[q] is not None), p + 0.5)
        times[k] = p + (n - p) * 0.5
for k in range(1, len(times)):
    if times[k] < times[k - 1]: times[k] = times[k - 1] + 0.05
out = []
for i, ln in enumerate(lines):
    ws = [{'w': w, 's': round(times[k], 2)} for k, (ii, j, w) in enumerate(L) if ii == i]
    out.append({'i': i, 'sec': ln['sec'], 'who': None, 's': ws[0]['s'], 'text': ln['text'], 'words': ws})
for i, ln in enumerate(out):
    nxt = out[i + 1]['s'] if i + 1 < len(out) else END - 1.2
    ln['e'] = round(min(nxt, ln['words'][-1]['s'] + 1.6), 2)
json.dump(out, open('aligned.json', 'w'), indent=0)
for o in out: print(f"{o['i']:3d} {o['s']:7.2f}-{o['e']:7.2f} {str(o['sec'])[:14]:14s} {o['text'][:70]}")
