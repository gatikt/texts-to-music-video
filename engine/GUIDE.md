# GUIDE: read this before touching anything

This is the house style and the hard rules for every agent that builds a chapter. Each project adds a short **project header** to its own `STORYBOARD.md`: the song, its length and BPM, the story, the audience and the tone. This file is about how the video is made.

We make **vertical (1080×1920) painted music videos** out of someone's real text messages. Every frame is painted in headless Chrome with **p5.js + p5.brush** (watercolour, boiling ink). Crisp 2D overlays sit on top: lettering, real chat "receipts", taped photo prints, and the HUD. The bar is that it looks hand-made, charming, funny and *alive*. It must never look like clip-art or a template.

## Look ("riso storybook")
- **Ground and characters.** Use warm paper (`PAL.paper`) and painted watercolour sets (`fill` with bleed/texture). Characters get flat `wash` colour. Their ink outlines boil 12× a second, and that boil is intended.
- **Palette.** Each shot uses 3–4 inks, such as navy `PAL.night`/`PAL.indigo`, hot pink `PAL.hot`/`PAL.rose`, coral `PAL.coral` and butter `PAL.butter`, on cream paper. Use big **sunbursts** for choruses. Avoid muddy mixes and rainbow soup. `PAL.hot` is the accent, so use it on purpose.
- **Palette arc.** Give the song a colour arc, for example cool and lonely for the silences, warm for the texting, night indigo for 2 a.m., and a sunrise for the finale.
- **Characters** (`src/cast.js`) are cute, simple and expressive, with big readable silhouettes. Think picture-book or indie animation. Avoid both Pixar and stick figures.
- **Receipts and photo prints** are the "evidence" layer slapped on top of the painted world. They are the punchlines, so use them sparingly and time them.

## Composition (portrait safe zones)
- **Karaoke strip** (default on) sits at **y≈1600–1800** whenever a lyric plays.
  - Keep faces and key action between **y≈260 and y≈1560**.
  - Turn the strip off with `{karaoke:'none'}` *only* when the shot shows the lyric itself big (`bigLyric`).
- **HUD:**
  - The date stamp sits top-left and the MSGS SENT odometer top-right, both at y≈70–190.
  - Keep both clear. Hide them per shot with `{stamp:false}` / `{meter:false}` only when the shot needs the full frame.
- **Big lyric type** is for **hooks**: the opening, every chorus hook and a few punchlines. Elsewhere, let the karaoke carry the words and let the pictures tell the joke. When the type is big, keep the background calm behind it (most sets take `o.calm:'top'`) and put characters on the other side.
- **One shot, one action:**
  - Each shot has one clear focal action.
  - Shots are short (1.5–4 s).
  - Something *happens* in every shot: a pop, a fall, a chase, a transformation.
- **Alternate scales.** Alternate character close-ups that have strong expressions with wide group or dance shots. Cut on beats, and hold a chorus image one beat longer.

## Motion, beats and word-timed hits
- **Hits land on beats.** Use the real beat grid: `beatT(n)`, `beatN(t)`, `pulse(t)`, `snapBeat(time)`.
- **Hits land on sung words.** Use `TL.lines[i].words[j].s` / `wordT(i, j)`. A receipt should pop *on* the word that it pays off. Check the times in `src/timeline_data.js`.
- **Movement:**
  - Use squash and stretch, anticipation and overshoot (`backOut`, `elasticOut`, `kf`).
  - The camera always moves: `camBegin/camEnd` for push, pan, tilt and whip, and `shakeXY` on hits.
  - Faces never snap. Use `mood()`.
- **Transitions are motivated.** Examples: a phone screen fills the frame, a bubble pops to white, an iris on a heart, a whip pan, or a match cut on shape.

## Hard rules
1. **Every frame is a pure function of t.** Frames render in parallel and out of order.
   - Keep no state between frames.
   - Never call `Math.random()`. Use `hash(i)`/`jit()`.
   - Never use `Date.now()`/`new Date()` for anything time-varying.
2. **Only verified quotes go in `receipt()`.**
   - Quote verbatim and give the correct sender: `'me'` = the protagonist, `'her'` = anyone else. Name the real sender in a comment.
   - `node tools/checkquotes.mjs src/ch/<yours>.js` must print only `OK`.
   - Lettering and SFX words are fine ("HEHE", "3 AM"). Never fabricate messages, dates or facts.
3. **Dates on screen are real.** HUD dates come from `STORY_DATES` (`src/story.js`) and must be the verified timestamp of the moment shown. Weekdays must match the calendar.
4. **No logos and no IP.** That rules out brand marks, team jerseys or team colours, recognisable characters, real company lock-ups and real addresses. Generic places only. Nothing private about third parties.
5. **Continuity.**
   - Each person keeps the same look at the same age across every chapter, as defined in `LOOKS.md`.
   - The same garment keeps the same colour everywhere.
   - The same place uses the same set and dressing.
6. **Seams.** The last frame of your chapter must hand off cleanly to the next one. Check stills at every seam ±0.1 s.
7. **Edit only your own files.** Shared files are read-only: the engine copies (`core.js`, `frame.js`, `cast.js`, `props.js`, `studio.html`, `render.mjs`; `npm install` re-copies them from `engine/`, so edits there are lost) and the project files other agents own (`timeline_data.js`, `story.js`, `cast_project.js`, `props_project.js`, `hud.js`). Write private helpers inside your chapter's IIFE, and report real engine bugs in your final message.
8. **Stay local.** No network calls. No environment dumps.
9. **Performance.** Stay at or under ~1.5 s per frame (renders are usually 0.05–0.4 s). Hundreds of brush shapes are fine; thousands are not.

## API cheat-sheet (src/core.js, src/frame.js)

**Structure and painting**
- `chapter(name, start, end, [[t0, fn, {karaoke:'sub'|'none', meter, stamp, date, time, age}], ...])`. `fn(t, lt, dur)` paints the whole frame, background included.
- Paint:
  - `bg(col)`
  - `paint(pts, {wash, washOp, fill, fillOp, bleed, tex, border, hatch:{d,a,b,c,w}, ink, sw, br, curv})`. Pass `ink:null` for no outline.
  - `inkLine(pts, sw, col, brush, curv)`
  - `wash(pts, col, op)`
  - `glow(cx, cy, r, col, op)`
- Geometry: `rectPts, ellPts, rrPts, starPts, heartPts, xform(pts, dx, dy, s, r)`.
- Camera: `camBegin(cx, cy, zoom, rot) … camEnd()`, plus `toScreen`.
- Effects: `flash(k, col)`, `iris(cx, cy, r, col)`, `irisShape(pts, col)`.
- Timing: `seg, kf, ease, easeOut, easeIn, easeInOut, backOut, elasticOut, wob, hash, pulse, pulse2, beatN, beatT, beatPh, snapBeat, lineAt, wordT`.

**Overlays.** These are crisp 2D and go through the camera unless you pass `screen:true`.
- `letter(txt, x, y, size, col, {font:'marker'|'shantell'|'caveat'|'slab', weight, stretch:'condensed', pop, rot, alpha, shadow, stroke, align})`
- `sfx(txt, x, y, size, col, age, {life, rot})`
- `receipt(text, 'her'|'me', x, y, {pop, rot, size, alpha, maxW, mirror})`:
  - x is the outer edge: the left edge for 'her', the right edge for 'me'.
  - y is the top.
  - `mirror` shows the message on the *other* person's phone.
- `tsLabel(text, x, y)`
- `photo(name, x, y, w, {rot, pop, tape, alpha})`: centred; `name` is a file in `assets/`.
- `bigLyric(t, lineIdx, {x, y, size, color, shadow, maxW, align, colors, font, rot})`: words slam in on their sung times.

**HUD** (`src/story.js`)
- `storyKeys([[t, 'YYYY-MM-DD', 'H:MM AM', {label, roll, age}], ...])`
- `HUD.birthday = [Y, M, D]` (M is 1–12; turns on the auto `AGE n` line)
- `HUD.label`
- The odometer reads `src/msg_data.js`, which `node tools/msgcounts.mjs` writes from the DB.

**Project overlays.** A project customises the engine without editing it. These project-owned files load after the engine and before the chapters (see `engine/README.md`): `src/cast_project.js` (re-skins, outfits, extra people), `src/props_project.js` (extra sets and props), `src/hud.js` (HUD tweaks) and `src/story.js` (story dates). Read their headers too.

**Cast and props.** See the top-of-file manuals in `src/cast.js` and `src/props.js`:
- characters: `me`, `mom`, `dad`, `sibling`, `friendA…H`, `cofounder`, `coworker`, `grandpa`, `partner`, `kid`
- `crew`, `move`, `mood`, `tiny`
- sets: `homeRoomSet`, `kitchenSet`, `dormSet`, `apartmentSet`, `gymSet`, `cityNightSet` and the rest
- props: `phone`, `laptop`, `car`, `takeoutBag` and the rest

## Checking your work (run from build/)
```
node render.mjs --sheet=0.2,0.8,1.5,2.3,3.1,4.0,5.2,6.0 --cols=4 --w=300 --out=previews/<you>/a.jpg
node render.mjs --stills=1.5,6.8 --out=previews/<you>/stills
node render.mjs --clip=0:8 --out=previews/<you>/clip.mp4      # low-res clip with audio (for timing)
node tools/checkquotes.mjs src/ch/<yours>.js                    # must print only OK
```
Open sheets and stills with the Read tool and look hard:
- the first and last frame of every shot
- motion across consecutive times (every ~0.1 s around a hit)
- readability at phone size
- nothing important under the karaoke strip or the HUD
- contrast between the characters and the background

Iterate until the work is genuinely good. Then do one more pass asking: "is this the most charming, surprising version of this shot?"

### Lab benches
Put test benches in `src/lab/p_<name>.js` (the `p_` prefix keeps project benches apart from the engine's) using `labShot((t)=>{...}, {karaoke:'none', meter:false})`, and render them with `--lab=<name>`. Lab files never ship. The engine ships these benches:
- `cast_lineup`: pages at t=0.5 … 11.5
- `sets_home`, `sets_places`, `sets_props`, `sets_calm`
- `hud_test`

For example: `node render.mjs --lab=cast_lineup --sheet=0.5,1.5,2.5,5.5 --out=previews/cast.jpg`.
