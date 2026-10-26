"""Beat grid + word-level transcript of the song.

usage: .venv/bin/python scripts/analyze_audio.py <dir> [--audio song_cut.wav] [--model medium.en]
  <dir> has the audio file and lyrics.txt (lyrics only, with [Section] tags).
Writes beats.json {tempo, beats[]} and transcript.json [{s,e,text,words:[{w,s,e}]}].
First run downloads the faster-whisper model (medium.en is ~1.5 GB, cached in ~/.cache/huggingface)."""
import sys, os, json, argparse
ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
ap.add_argument('dir'); ap.add_argument('--audio', default='song.wav', help='audio file inside <dir> (default song.wav)')
ap.add_argument('--model', default='medium.en', help='faster-whisper model name')
A = ap.parse_args()
os.environ.setdefault('HF_HUB_DISABLE_TELEMETRY', '1')
import numpy as np, librosa
from faster_whisper import WhisperModel
os.chdir(A.dir)
y, sr = librosa.load(A.audio, sr=22050, mono=True)
tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units='time')
json.dump({'tempo': float(np.atleast_1d(tempo)[0]), 'beats': [round(float(b), 3) for b in beats]}, open('beats.json', 'w'))
print('tempo', np.round(tempo, 2), 'beats', len(beats))
# loudness every 5 s — helps find the intro/drops/outro when cutting chapters
rms = librosa.feature.rms(y=y)[0]; t = librosa.times_like(rms, sr=sr)
print('  '.join(f"{b0:4.0f}:{20*np.log10(rms[(t>=b0)&(t<b0+5)].mean()+1e-9):5.1f}" for b0 in np.arange(0, t[-1], 5)))
lyr = open('lyrics.txt').read()
prompt = ' '.join(l for l in lyr.splitlines() if l.strip() and not l.strip().startswith('['))[:800]
audio, _ = librosa.load(A.audio, sr=16000, mono=True)
m = WhisperModel(A.model, device='cpu', compute_type='int8')
segs, _ = m.transcribe(audio, word_timestamps=True, vad_filter=False, initial_prompt=prompt, condition_on_previous_text=False, beam_size=5)
out = []
for s in segs:
    out.append({'s': round(s.start, 2), 'e': round(s.end, 2), 'text': s.text.strip(), 'words': [{'w': x.word, 's': round(x.start, 2), 'e': round(x.end, 2)} for x in s.words]})
    print(f"{s.start:6.2f}-{s.end:6.2f} {s.text.strip()}")
json.dump(out, open('transcript.json', 'w'), indent=1)
