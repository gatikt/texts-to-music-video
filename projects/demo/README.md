# demo: "Group Chat at 2 A.M."

This is a 30-second, fully synthetic example project. It contains **no real data**. The people (Alex, Priya, Marco, Jules, Sam, Dee and Mom), the chats, the song and the lyrics are all invented. It exists to show the whole pipeline end to end.

## Run it
```
cd projects/demo/video/build
npm install                                   # deps + copies the shared engine in (engine/sync.mjs)
node tools/checkquotes.mjs                    # every receipt() is in data/dms.db → prints only OK
node render.mjs --sheet=1.2,4.4,7.4,12.4,15.5,18.9,24.9,28.4 --cols=4 --w=300 --out=previews/sheet.jpg
node render.mjs --frames=0:30 --workers=4     # ~1.5 min → out/frames30/
node render.mjs --encode --out=out/demo.mp4
```

## How each piece was made (all re-runnable)
| File | Made by |
|---|---|
| `data/dms.db` | `python3 make_demo_db.py`: 42 fake messages in 3 conversations, with the same schema as `scripts/build_dms.py` |
| `video/song_cut.wav` | `sh video/make_song.sh`: ffmpeg only. 120 BPM kick/clap/bass/synth over C–Am–F–G, 30 s. |
| `video/lyrics.txt` | written by hand: 2 verses + chorus + tag |
| `video/beats.json`, `aligned.json`, `chapters.json`, `build/src/timeline_data.js` | `python3 video/make_timing.py`. The timing is computed by hand from the known beat grid: one lyric line per bar from 2.0 s, with words on eighth notes. |
| `build/src/msg_data.js` | `node tools/msgcounts.mjs` (run in `build/`) |
| `build/src/story.js` | HUD birthday + story dates, which match the message timestamps |
| `build/src/ch/c01_verse1.js`, `c02_chorus.js`, `c03_verse2.js` | the three chapters |
