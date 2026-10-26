// cast.js — a generic, reusable picture-book cast. Flat wash colour + boiling ink, chibi proportions (head ≈ 1/3 of body).
// ME (the protagonist; o.age 12→19+ scales them), MOM, DAD, SIBLING (ages 8→14), FRIEND A–H, COFOUNDER, COWORKER,
// GRANDPA, PARTNER (long hair; alias crush) and generic KIDs for crowds. Re-skin them per project (skin/hair/outfits) from your LOOKS.md.
// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// MINI MANUAL
//   EVERY CHARACTER FUNCTION has the same signature and options:  fn(x, y, u, o) → anchors {head, top, mouth, chest, handL, handR, u}
//     me (= hero)  mom  dad  sibling (= brother)  friendA … friendH  cofounder  coworker  grandpa  partner (= crush)  kid
//     castMember(name, x, y, u, o) is the generic form (name = any of the above as a string, e.g. 'friendC').
//     (x, y) = ground point between the feet.  u = unit in px.  (With o.sit, (x,y) is the SEAT point = hips.)
//     Use the SAME u for everyone in a shot: each character's height (k, relative to ME at 19) is built in:
//       sibling@8 .62 · me@12 .80 · me@13 .84 · sibling@14 .87 · mom .88 · me@14 .90 · me@15 .95 · me@16 .98
//       friends .95 / 1.0 / 1.05 (a spread, see below) · me@17+ 1.0 · dad/cofounder 1.0
//     PROPORTIONS (ME at 19, in u; others scale by k, kids also get a bigger head (hs) and shorter legs (legF)):
//       ground 0 · ankle −0.36 · knee ≈ −2.0 · hips −3.65 · shirt hem −3.4 · shoulders −6.7 · chin −7.15
//       head centre −9.3 (head 4.6u wide × 4.3u tall) · crown −11.45 · big hair (e.g. curls) reaches ≈ −12.5
//       → ≈ 11.5u to crown, 12.5u with big hair (head ≈ 37% of height). Shoulder half-width 1.68.
//       Arms: upper 1.85 + fore 1.75 (reach ≈ ear height). Shoulder joints at (±1.5, −6.5).
//       Typical sizes: full body u≈40–60 (480–720 px tall); crowd u≈8–14; close-up o.headOnly with u≈80–160.
//   AGE  o.age on me (12–19+) and sibling (6–16) is a growth knob: it sets height (k), head size (hs) and leg length.
//     Omit it for the default adult ME. The look per age is a plain, neutral progression you can re-tune per project:
//       me       12–13 k.80–.84, big head · 14–15 k.90–.95 · 16+ k.98–1 (same hair at every age unless you set one)
//       sibling  6 k.56 · 8 k.62 · 10 k.70 · 12 k.77 · 14 k.87 · 16 k.94
//     Hair, glasses and facial hair come from the base character (CAST.CHAR.me / .sibling), not from the age.
//     Default outfit per age: me 12–13 'kidhoodie', 14–15 'hoodie', 16+ 'tee'; sibling 8 'tee', 10+ 'hoodie'.
//     PROJECT OVERRIDES (put them in the project-owned src/cast_project.js, which loads after this file; never edit the
//     engine copy inside build/, `npm install` / sync re-copies it):
//       Object.assign(CAST.CHAR.me, {skin:'#..', hair:'#..', hairStyle:'wavy', glasses:'rect'})   base look
//       Object.assign(CAST.ME_AGE[14], {hairStyle:'fringe', def:'sprint'})                       per-age look / default outfit
//       CAST.OUT.me.myJacket = {top:'#..', jacket:'#..', jacketType:'zip', sleeve:'long', pants:'#..', shoes:'#..'}
//       New person: CAST.CHAR.aunt = {...CAST.CHAR.mom, hair:'#..'}; CAST.OUT.aunt = {...};
//                   window.aunt = (x, y, u, o) => castMember('aunt', x, y, u, o)
//   POSE OPTIONS (all optional)
//     dy        hop height in u (+ = up)                 sq      squash (+ squash, − stretch), ~±0.25
//     rot       whole-body rotation (rad, about feet)    lean    upper-body lean about hips (rad; mirrored by flip)
//     flip      true = mirrored (faces screen-left)      sx      horizontal squeeze 0..1 (fake spin), scale  size multiplier
//     aL, aR    arm angles: 0 = straight out sideways, + raised, − down, −1.3 ≈ hanging. L/R = screen-left/right arm
//     eL, eR    elbow bend added to the forearm (+ bends the forearm upward / inward)
//     handL, handR    [x, y] hand TARGET in body units from the ground point (IK, overrides angles):
//                     [0.5,-7.6] hand at mouth · [±0.55,-6.85] fists under chin · [-1.45,-4.3] hand on hip
//                     (targets are in the standard adult frame, so the same pose reads the same on kids and tall friends)
//     handLw, handRw  [x, y] hand target in WORLD px (hold hands / pat a head: pass the other character's returned anchors)
//     elbowUp   flip IK elbow side.  pointL, pointR  extend an index finger.  armsBehind  hands behind back (shy)
//     legL, legR lift 0..1 (knee up).  toeL, toeR  toe twist (rad).  stance  feet spread (0 = default)
//     walk      walk phase (in steps) — drives legs/arms/bob.   run  same, sprint version (adds lean)
//     sit       sit on a ledge at (x,y): legs dangle (legL/legR swing them)
//     back      seen from behind.  headTilt (rad).  nod 0..1 (head drops, for looking down)
//     turn      −1..1 face turned toward screen-left/right (3/4 view)
//     look, lookY  −1..1 eye direction.  t  pass time → auto-blink, breathing, wobbles, sing flaps (recommended)
//   FACE
//     eyes : normal happy closed wink heart star wide sleepy side cry swirl down
//     mouth: smile grin o O flat wobble sing (o.open 0..1; auto-flaps with o.t) tongue cat smirk
//     brows: relaxed up worried angry flat (default derives from eyes).  blush 0..1.  glowFace 0..1 (phone light)
//     emote + emoteK (0..1 pop): heart sweat ! ? !? music sparkle zzz anger steam
//     glasses: o.glasses = false (off) | 'round' 'rect' 'rectBig' 'thin' 'browline' 'clear' 'thick' 'tort' 'shades'.
//              o.shades = true → sunglasses
//     o.stache 0..1 / o.beard 'stubble'|'chin'|'full' override facial hair.  o.hoops (earrings; off by default)
//   ACCESSORY OPTIONS (any character)
//     o.hat 'grad' | 'party' | 'helmet' | 'cap' (o.capCol) | 'none'   (o.capArt 'stars' decorated grad cap)
//     o.neckPillow (bool or colour) · o.headphones (around the neck) · o.backpack colour (straps in front, pack from behind)
//     o.strap colour (one-shoulder backpack strap) · o.lanyard colour · o.bandaid (on the screen-right upper arm, short sleeves)
//     o.earbuds (wired) · o.lei (flower garland) · o.rosette (award ribbon) · o.boot (off by default: a walking boot on one
//     foot; o.boot 'l'|'r' or o.bootSide picks the screen side, default 'r'; outfit 'boot' turns it on)
//     o.jerseyNum (number/text on any jersey; jerseys are plain by default) · o.shirtText (a short print on the chest,
//     o.shirtCol its colour) — both use the mini font below
//   OUTFITS (o.outfit) — a neutral wardrobe catalogue. Any outfit works at any age; re-colour freely per project
//   (keep one garment = one colour across the whole film).
//     me:
//       casual     'tee' (black, default) · 'hoodie' (grey) · 'kidhoodie' (grey hoodie over a yellow tee, earbuds) ·
//                  'orangehoodie' · 'bluehoodie' (+ red shorts) · 'tealtee' · 'cargo' (charcoal tee, khaki cargos) ·
//                  'zipcargo' (zip hoodie over a red tee) · 'pinktee' (zip jacket over a pink tee) · 'knit' (cream sweater) ·
//                  'launch' (black tee, open grey hoodie) · 'college' (blue hoodie, small chest print) · 'chore' (chore jacket + badge) ·
//                  'overshirt' · 'puffer' (black puffer) · 'bandaid' (tee + plaster on the arm, jacket over one shoulder) · 'bomber'
//       travel     'airport' (zip hoodie, joggers, neck pillow) · 'aloha' (open print shirt over a tank, shorts, sandals)
//       sleepwear  'pj' (tee + plaid PJs) · 'lounge' (hoodie + plaid PJs) · 'nighthoodie' (black hoodie + plaid PJs) ·
//                  'naptee' (print tee, dotted PJs)
//       formal     'debate' (oversized blazer, long tie, khakis) · 'fair' (collared shirt, loose tie, shorts) · 'greysuit' ·
//                  'greensuit' · 'purplesuit' (+ rosette) · 'navyblazer' (+ lanyard) · 'grad' (gown + mortarboard; add o.lei,
//                  o.capArt, o.shades)
//       sport      'bball' (jersey + shorts, high-tops) · 'qb' (football jersey + pads; add o.hat:'helmet') · 'drumline'
//                  (marching-band black + quad drums) · 'sprint' (hoodie, joggers) · 'boot' (same + o.boot walking boot, bag strap)
//       cultural / costume  'kurta' (a long tunic, pink) · 'festive' (an embroidered tunic, cream→gold) · 'pirate' (costume)
//     mom:    'home' (default: striped tee, jeans) · 'apron' · 'tunic' · 'tealdress' · 'pinksweater' · 'dotdress' ·
//             'yellow' · 'gown' · 'salwar' (tunic + scarf set) · 'zip'
//     dad:    'polo' (default) · 'dadtee' (graphic tee, chinos) · 'lavpolo' · 'blazer' · 'brownblazer' · 'olive'
//             (quarter-zip) · 'floral' (+ lanyard).  o.shades for sunglasses.
//     sibling: 'tee' · 'cape' (superhero cape) · 'hoodie' · 'grey' · 'blazer' · 'greenhoodie' · 'zip' · 'concert' · 'formal'
//     The friends are interchangeable placeholder archetypes: heights .95 / 1.0 / 1.05 and a mix of hair, glasses and
//     facial hair so a group reads at a glance. They are not anyone in particular; re-skin all of them per project.
//     friendA: 'tee' (navy, default) · 'red' (open overshirt) · 'jumpsuit'        friendB: 'night' (zip jacket, default) · 'aloha'
//     friendC: 'hoodie' (default) · 'bowtie' · 'grad' (starry cap)                friendD: 'hoodie' (default) · 'tiedye'
//     friendE: 'cyan' (tee + cargos) · friendF: 'tee' (graphic tee) · friendG: 'hoodie' · friendH: 'tee'
//     cofounder: 'hoodie' (default; add o.headphones) · 'tan' · 'black'
//     coworker: 'black'.  grandpa: 'shirt' (patterned short-sleeve, all-grey hair).
//     kid (generic crowd): o.seed picks skin/hair/glasses/colour; o.age (12–15, default 13);
//             o.outfit 'blazer' | 'tee' | 'hoodie' | 'jersey' | 'suit'; o.girl
//     partner: 'sweater' · 'jersey' (plain; o.jerseyNum) · 'hoodie' · 'lehenga' (o.spin) · 'sailor' (sailor-collar costume)
//   HOLDING  o.holdR / o.holdL = 'phone' | 'phoneback' | 'flowers' | 'boba' | 'icecream' | 'bowlingball' | 'golfclub'
//            | 'briefcase' | 'briefcaseOpen' (a circuit-board project inside) | 'plaque' | 'cake' (o.cakeText, default
//            'HBD') | 'megaphone' | 'form' (a signed form; o.strike 0..1 red cross-out; alias 'lease') | 'takeout' (plain kraft bag, NO logo)
//            | 'keys' | 'laptop' | 'football' | 'basketball' | 'ladle' | 'partyhorn' | 'mic' | 'toycar' | 'sticks'
//            | 'sign' (o.signText, '\n' for lines; default 'HOORAY') | 'certificate' | 'trifold'
//            o.holdBoth = same list, drawn between both hands (e.g. texting, the cake, the laptop).  o.holdRotR/L/B rotate.
//            (cake: hands at [±1.75,-5.3] hold the plate edge so the icing stays readable; sign: one hand, holdR)
//            o.phoneCol (phone case colour), o.ballCol (bowling ball colour)
//   o.headOnly → only head + hair (floating heads, avatars).  o.bust → no legs/feet (close-ups cut by the frame).
//     Both keep the ground-point convention: chin sits at y − 7.15u·k, head centre at y − 9.3u·k.
//   o.ink line colour, o.boil jitter scale, o.line line-weight scale.
//
//   crew(x, y, u, o) — the friend group line-up, centred on x, all on ground y. Returns {name: anchors}.
//     o.names  default ['friendA','friendB','friendC','me','friendD','friendE','friendF']  (any names work)
//     o.gap    spacing in u (default 6.2) · o.style move() style for everyone (default 'idle') · o.t time
//     o.each   {name: extra options} (e.g. {me:{age:19, eyes:'happy'}, friendC:{holdBoth:'cake'}}) · o.me shortcut
//     Default props (o.props:false to drop): friendC holds the cake, friendE the megaphone, friendF a party horn.
//   mood(t, keys)  keys = [[t0,'normal'], [t1,'happy','heart'], [t2,'wide','!','O']]   (time, eyes, emote?, mouth?)
//     → {eyes, take, emote, emoteK, mouth?}: blinks INTO each new face and adds a squash 'take' (spread it into o;
//        the character adds o.take to sq). Emote pops in with overshoot.
//   move(style, t, seed?) → beat-synced pose (spread into o). Styles: idle bounce sway hop groove spin wave shy giggle
//     point dance (4-beat point choreo) garba (circle-dance clap-step) text (thumbs typing, head down) walk run
//     hype (hand cupped at mouth, other arm pumping) cheer (both arms up, on the beat)
//     (some styles also suggest eyes/mouth/blush; your own o wins.)
//   dancer(name, x, y, u, style, t, extra) = character + move(style) + {t} + extra (extra wins).
//   tiny(name, x, y, u, o) — 6–8 shape far-distance version for crowds/silhouettes. o: back, dy, rot, flip, outfit, age,
//     seed (kid), arms:'up'|'wave', t, color (top colour override), sil (single-colour silhouette colour).
//   mixPose(a, b, k) — blend two pose objects (numbers + [x,y] targets).
//   strokeText(x, y, h, txt, col, o) — the hand-stroked mini font the shirts use (A–Z 0–9 . ! ? ' - #), world px,
//     centred; o.w line weight, o.rot. Good for tiny painted labels on props.
//   CAST.LOOKS — hex tokens (SKIN_ME, SKIN_MOM, SKIN_DAD, SKIN_SIB, HAIR_BLK, HAIR_MOM, GREY_DAD)
// Cost: ≈ 45–110 brush shapes per character (patterned shirts / props at the top end); tiny ≈ 7.
// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
(() => {
  // ---------- tiny affine toolkit (local units → world px) ----------
  const mm = (A, B) => [A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1], A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3], A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5]];
  const mT = (x, y) => [1, 0, 0, 1, x, y];
  const mR = a => { const c = Math.cos(a), s = Math.sin(a); return [c, s, -s, c, 0, 0]; };
  const mS = (sx, sy = sx) => [sx, 0, 0, sy, 0, 0];
  const ap = (M, p) => [M[0] * p[0] + M[2] * p[1] + M[4], M[1] * p[0] + M[3] * p[1] + M[5]];
  const inv = M => { const [a, b, c, d, e, f] = M, det = a * d - b * c; return [d / det, -b / det, -c / det, a / det, (c * f - d * e) / det, (b * e - a * f) / det]; };
  const chain = (...Ms) => Ms.reduce(mm);
  const V = { add: (a, b) => [a[0] + b[0], a[1] + b[1]], sub: (a, b) => [a[0] - b[0], a[1] - b[1]], mul: (a, k) => [a[0] * k, a[1] * k], len: a => Math.hypot(a[0], a[1]), lerp: (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)] };

  // Catmull-Rom smoothing so few control points give round, organic shapes
  function cr(pts, closed = true, sub = 3) {
    const n = pts.length; if (n < 3) return pts.slice();
    const out = [], g = i => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))], last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
      for (let k = 0; k < sub; k++) {
        const t = k / sub, t2 = t * t, t3 = t2 * t, f = j => .5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3);
        out.push([f(0), f(1)]);
      }
    }
    if (!closed) out.push(pts[n - 1]);
    return out;
  }
  const E = (cx, cy, rx, ry, n = 16, rot = 0) => { const p = [], c = Math.cos(rot), s = Math.sin(rot); for (let i = 0; i < n; i++) { const a = i / n * TAU, x = Math.cos(a) * rx, y = Math.sin(a) * ry; p.push([cx + x * c - y * s, cy + x * s + y * c]); } return p; };
  const mirror = pts => pts.map(([x, y]) => [-x, y]);
  const sym = half => [...half, ...mirror(half).reverse()];
  const arc = (rx, ry, a0, a1, n, cy = 0) => { const p = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; p.push([Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return p; };
  const PI = Math.PI;

  // ---------- draw context ----------
  let K = { u: 40, sw: .7, J: 1, ink: PAL.ink };
  function shp(M, pts, col, o = {}) {
    const P0 = o.raw ? pts : cr(pts, true, o.sub ?? 3), j = K.J * (o.j ?? 1);
    const P = P0.map(p => { const q = ap(M, p); return [q[0] + jit(j), q[1] + jit(j)]; });
    paint(P, { wash: col, washOp: o.op, ink: o.ink === undefined ? K.ink : o.ink, sw: (o.sw ?? 1) * K.sw, br: o.br });
  }
  function ln(M, pts, w = 1, col, br = 'ink') {
    let P = pts.length === 2 ? [pts[0], V.lerp(pts[0], pts[1], .5), pts[1]] : pts;
    const j = K.J * .6;
    P = P.map(p => { const q = ap(M, p); return [q[0] + jit(j), q[1] + jit(j)]; });
    inkLine(P, w * K.sw, col || K.ink, br, .5);
  }
  // thick limb outline along a path with tapering radius and round caps
  function limbPts(path, r0, r1) {
    const n = path.length, L = [], R = [], rad = i => lerp(r0, r1, n > 1 ? i / (n - 1) : 0);
    for (let i = 0; i < n; i++) {
      const a = path[Math.max(0, i - 1)], b = path[Math.min(n - 1, i + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      const r = rad(i); L.push([path[i][0] - dy * r, path[i][1] + dx * r]); R.push([path[i][0] + dy * r, path[i][1] - dx * r]);
    }
    const out = [...L], e = path[n - 1], s0 = path[0];
    let a0 = Math.atan2(L[n - 1][1] - e[1], L[n - 1][0] - e[0]);
    for (let k = 1; k < 6; k++) { const a = a0 - k / 6 * Math.PI; out.push([e[0] + Math.cos(a) * r1, e[1] + Math.sin(a) * r1]); }
    out.push(...R.reverse());
    a0 = Math.atan2(R[R.length - 1][1] - s0[1], R[R.length - 1][0] - s0[0]);
    for (let k = 1; k < 6; k++) { const a = a0 - k / 6 * Math.PI; out.push([s0[0] + Math.cos(a) * r0, s0[1] + Math.sin(a) * r0]); }
    return out;
  }
  const limb = (M, path, r0, r1, col, o = {}) => shp(M, limbPts(cr(path, false, 3), r0, r1), col, { raw: true, ...o });

  // ---------- hand-stroked mini font (for shirt prints, cakes, signs) ----------
  const O_ = [[.5, 0], [.08, .22], [0, .5], [.08, .8], [.5, 1], [.92, .8], [1, .5], [.92, .22], [.5, 0]];
  const GLY = {
    A: [[[0, 1], [.5, 0], [1, 1]], [[.22, .62], [.78, .62]]], B: [[[0, 1], [0, 0], [.65, 0], [.9, .22], [.65, .47], [0, .47]], [[.65, .47], [.95, .72], [.7, 1], [0, 1]]],
    C: [[[1, .16], [.65, 0], [.25, .06], [0, .5], [.25, .94], [.65, 1], [1, .84]]], D: [[[0, 0], [0, 1], [.55, 1], [1, .62], [1, .38], [.55, 0], [0, 0]]],
    E: [[[1, 0], [0, 0], [0, 1], [1, 1]], [[0, .5], [.75, .5]]], F: [[[1, 0], [0, 0], [0, 1]], [[0, .5], [.75, .5]]],
    G: [[[1, .16], [.65, 0], [.25, .06], [0, .5], [.25, .94], [.7, 1], [1, .78], [1, .56], [.55, .56]]], H: [[[0, 0], [0, 1]], [[1, 0], [1, 1]], [[0, .5], [1, .5]]],
    I: [[[.5, 0], [.5, 1]], [[.15, 0], [.85, 0]], [[.15, 1], [.85, 1]]], J: [[[.9, 0], [.9, .75], [.6, 1], [.25, 1], [0, .75]]],
    K: [[[0, 0], [0, 1]], [[1, 0], [0, .62]], [[.35, .4], [1, 1]]], L: [[[0, 0], [0, 1], [.9, 1]]], M: [[[0, 1], [0, 0], [.5, .62], [1, 0], [1, 1]]],
    N: [[[0, 1], [0, 0], [1, 1], [1, 0]]], O: [O_], P: [[[0, 1], [0, 0], [.72, 0], [1, .25], [.72, .5], [0, .5]]],
    Q: [O_, [[.6, .7], [1.05, 1.1]]], R: [[[0, 1], [0, 0], [.72, 0], [1, .25], [.72, .5], [0, .5]], [[.45, .5], [1, 1]]],
    S: [[[1, .14], [.7, 0], [.28, 0], [0, .22], [.22, .46], [.78, .54], [1, .78], [.72, 1], [.28, 1], [0, .86]]], T: [[[0, 0], [1, 0]], [[.5, 0], [.5, 1]]],
    U: [[[0, 0], [0, .7], [.3, 1], [.7, 1], [1, .7], [1, 0]]], V: [[[0, 0], [.5, 1], [1, 0]]], W: [[[0, 0], [.22, 1], [.5, .4], [.78, 1], [1, 0]]],
    X: [[[0, 0], [1, 1]], [[1, 0], [0, 1]]], Y: [[[0, 0], [.5, .5], [1, 0]], [[.5, .5], [.5, 1]]], Z: [[[0, 0], [1, 0], [0, 1], [1, 1]]],
    0: [O_], 1: [[[.22, .22], [.55, 0], [.55, 1]], [[.2, 1], [.9, 1]]], 2: [[[0, .2], [.3, 0], [.72, 0], [1, .25], [.85, .52], [0, 1], [1, 1]]],
    3: [[[0, .1], [.4, 0], [.85, .1], [.85, .4], [.4, .5], [.95, .65], [.9, .92], [.45, 1], [0, .9]]], 4: [[[.75, 1], [.75, 0], [0, .7], [1, .7]]],
    5: [[[.95, 0], [.1, 0], [0, .45], [.6, .4], [1, .7], [.7, 1], [0, .92]]], 6: [[[.9, .05], [.4, .05], [0, .55], [.15, .95], [.6, 1], [.95, .75], [.6, .48], [.05, .6]]],
    7: [[[0, 0], [1, 0], [.4, 1]]], 8: [[[.5, .47], [.12, .27], [.2, .04], [.5, 0], [.8, .04], [.88, .27], [.5, .47], [.05, .72], [.18, .96], [.5, 1], [.82, .96], [.95, .72], [.5, .47]]],
    9: [[[.95, .4], [.4, .52], [.05, .25], [.4, 0], [.9, .1], [.95, .4], [.6, 1]]],
    '.': [[[.45, .92], [.55, 1]]], '!': [[[.5, 0], [.5, .66]], [[.45, .93], [.55, 1]]], '?': [[[0, .2], [.3, 0], [.75, .05], [.9, .3], [.5, .55], [.5, .72]], [[.45, .93], [.55, 1]]],
    "'": [[[.5, 0], [.45, .3]]], '-': [[[.15, .55], [.85, .55]]], '#': [[[.3, 0], [.2, 1]], [[.8, 0], [.7, 1]], [[0, .33], [1, .33]], [[0, .67], [1, .67]]],
  };
  // txt centred at (cx, cy) in M's units, cap height h
  function stext(M, txt, cx, cy, h, col, w = 1, wid = .62, maxW = 1e9) {
    const chars = String(txt).toUpperCase().split(''); let adv = h * (wid + .26), W = chars.length * adv - h * .26;
    if (W > maxW) { const k = maxW / W; h *= k; adv *= k; W = maxW; }
    chars.forEach((ch, i) => {
      const g = GLY[ch]; if (!g) return;
      const x0 = cx - W / 2 + i * adv, y0 = cy - h / 2;
      for (const st of g) ln(M, st.map(([px, py]) => [x0 + px * h * wid, y0 + py * h]), w, col);
    });
  }
  function strokeText(x, y, h, txt, col = PAL.ink, o = {}) { K = { u: h, sw: clamp(h * .07 * (o.w ?? 1), .3, 4), J: Math.min(h * .015, 2), ink: PAL.ink }; stext(chain(mT(x, y), mR(o.rot || 0)), txt, 0, 0, h, col, 1); }

  // ---------- characters ----------
  const isPartner = n => n === 'partner' || n === 'crush';
  const SKIN_ME = '#B0754F';
  const CHAR = {
    me: { k: 1, skin: SKIN_ME, skinSh: '#8E5A3B', nose: '#7A4A33', hair: '#221A20', hairHi: '#5B4A5E', shX: 1.68, hipX: .72, rx: 2.32, ry: 2.16, l1: 1.85, l2: 1.75, hand: .42, def: 'tee', browY: -.62, browW: 2.3, eyeY: .42, blink: 0, hairStyle: 'swept' },
    partner: { k: .94, skin: '#C88E69', skinSh: '#A66E4C', nose: '#93603F', hair: '#2A1C23', hairHi: '#5E4553', shX: 1.5, hipX: .68, rx: 2.24, ry: 2.12, l1: 1.8, l2: 1.7, hand: .38, lashes: true, def: 'sweater', browY: -.52, browW: 1.5, eyeY: .38, blink: 1.71 },
    mom: { k: .88, skin: '#BE8460', skinSh: '#9A6644', nose: '#8C5A3E', hair: '#2B1D18', hairHi: '#6A4434', shX: 1.46, hipX: .68, rx: 2.24, ry: 2.14, l1: 1.78, l2: 1.68, hand: .38, lashes: true, def: 'home', browY: -.56, browW: 1.6, eyeY: .4, blink: 2.31, hairStyle: 'mom', blush: .38 },
    dad: { k: 1.0, skin: '#A86E4B', skinSh: '#87553A', nose: '#6E4430', hair: '#1F1A1C', hairHi: '#4E4450', shX: 1.9, hipX: .8, rx: 2.4, ry: 2.2, l1: 1.88, l2: 1.78, hand: .46, def: 'polo', browY: -.66, browW: 2.5, eyeY: .44, blink: .83, hairStyle: 'dad', belly: .2, armW: 1.08, legW: 1.06 },
    sibling: { k: .87, skin: '#B47A54', skinSh: '#925F40', nose: '#7E4E36', hair: '#1F1A1C', hairHi: '#4E4450', shX: 1.55, hipX: .68, rx: 2.3, ry: 2.18, l1: 1.8, l2: 1.7, hand: .4, browY: -.6, browW: 2.1, eyeY: .44, blink: 1.33, hairStyle: 'neat', hs: 1.04, legF: .96, def: 'hoodie' },
    friendC: { k: 1.05, skin: '#A87050', skinSh: '#87573C', nose: '#6E4430', hair: '#1F1A1C', hairHi: '#4E4450', shX: 1.66, hipX: .72, rx: 2.3, ry: 2.2, l1: 1.85, l2: 1.75, hand: .42, def: 'hoodie', browY: -.64, browW: 2.4, eyeY: .44, blink: .47, hairStyle: 'long' },
    friendA: { k: 1, skin: '#A06A48', skinSh: '#80523A', nose: '#6A402C', hair: '#1A1517', hairHi: '#4A4048', shX: 1.58, hipX: .7, rx: 2.22, ry: 2.22, l1: 1.85, l2: 1.75, hand: .42, def: 'red', browY: -.62, browW: 2.3, eyeY: .42, blink: 2.9, hairStyle: 'short' },
    friendB: { k: 1.0, skin: '#9E6746', skinSh: '#7E5036', nose: '#663F2C', hair: '#1A1517', hairHi: '#4A4048', shX: 1.66, hipX: .72, rx: 2.32, ry: 2.18, l1: 1.85, l2: 1.75, hand: .42, def: 'night', browY: -.62, browW: 2.3, eyeY: .44, blink: 1.9, hairStyle: 'wavy', glasses: 'round' },
    friendD: { k: .95, skin: '#AC7352', skinSh: '#8A593D', nose: '#704630', hair: '#1C1619', hairHi: '#55474F', shX: 1.62, hipX: .72, rx: 2.28, ry: 2.2, l1: 1.88, l2: 1.78, hand: .42, def: 'hoodie', browY: -.62, browW: 2.3, eyeY: .44, blink: 3.1, hairStyle: 'short', glasses: 'rect', beard: 'stubble' },
    friendF: { k: .95, skin: '#C08A63', skinSh: '#9E6E4C', nose: '#86563A', hair: '#241C1E', hairHi: '#5A4C55', shX: 1.64, hipX: .72, rx: 2.3, ry: 2.16, l1: 1.85, l2: 1.75, hand: .42, def: 'tee', browY: -.62, browW: 2.2, eyeY: .42, blink: 2.4, hairStyle: 'wavyUp' },
    friendE: { k: 1.0, skin: '#9C6646', skinSh: '#7C4F36', nose: '#663F2C', hair: '#1A1517', hairHi: '#4A4048', shX: 1.68, hipX: .72, rx: 2.32, ry: 2.2, l1: 1.85, l2: 1.75, hand: .42, def: 'cyan', browY: -.64, browW: 2.4, eyeY: .44, blink: 1.2, hairStyle: 'bigcurls' },
    friendG: { k: 1.05, skin: '#B07650', skinSh: '#8E5C3E', nose: '#784A33', hair: '#1F1A1C', hairHi: '#4E4450', shX: 1.8, hipX: .76, rx: 2.34, ry: 2.18, l1: 1.85, l2: 1.75, hand: .44, def: 'hoodie', browY: -.62, browW: 2.4, eyeY: .44, blink: 2.7, hairStyle: 'neat', glasses: 'thick', armW: 1.12 },
    friendH: { k: 1, skin: '#A66E4B', skinSh: '#87553A', nose: '#6E4430', hair: '#1F1A1C', hairHi: '#4E4450', shX: 1.64, hipX: .72, rx: 2.3, ry: 2.18, l1: 1.85, l2: 1.75, hand: .42, def: 'tee', browY: -.62, browW: 2.2, eyeY: .44, blink: 3.4, hairStyle: 'swept', beard: 'chin' },
    cofounder: { k: 1.0, skin: '#E2B48E', skinSh: '#C2926D', nose: '#B07D5C', hair: '#16141A', hairHi: '#4A4652', shX: 1.62, hipX: .72, rx: 2.26, ry: 2.2, l1: 1.88, l2: 1.78, hand: .42, def: 'hoodie', browY: -.6, browW: 2.1, eyeY: .44, blink: 1.6, hairStyle: 'neat', eyeShape: 'calm' },
    coworker: { k: 1.02, skin: '#E8C3A0', skinSh: '#C9A07C', nose: '#B4876A', hair: '#5A3E2E', hairHi: '#8A6A55', shX: 1.66, hipX: .72, rx: 2.28, ry: 2.2, l1: 1.86, l2: 1.76, hand: .42, def: 'black', browY: -.62, browW: 2.1, eyeY: .44, blink: 2.2, hairStyle: 'wavyUp' },
    grandpa: { k: .97, skin: '#A87050', skinSh: '#87573C', nose: '#6E4430', hair: '#C9C6C0', hairHi: '#F4F1EA', shX: 1.66, hipX: .72, rx: 2.3, ry: 2.2, l1: 1.82, l2: 1.72, hand: .42, def: 'shirt', browY: -.64, browW: 2.3, eyeY: .44, blink: 1.1, hairStyle: 'dad', glasses: 'thin', greyAll: true },
    kid: { k: .82, skin: '#B0754F', skinSh: '#8E5A3B', nose: '#7A4A33', hair: '#1F1A1C', hairHi: '#4E4450', shX: 1.58, hipX: .7, rx: 2.36, ry: 2.2, l1: 1.8, l2: 1.7, hand: .4, def: 'tee', browY: -.6, browW: 2.1, eyeY: .44, blink: 0, hairStyle: 'neat', hs: 1.1, legF: .9 },
  };
  CHAR.brother = CHAR.sibling; CHAR.hero = CHAR.me; CHAR.crush = CHAR.partner;
  // Age = growth knob only (height, head, legs) + a default outfit; hair/glasses/facial hair come from CHAR.me.
  // Projects re-tune these from src/cast_project.js (Object.assign(CAST.ME_AGE[14], {...})).
  const ME_AGE = {
    12: { k: .80, hs: 1.13, legF: .88, rx: 2.42, ry: 2.24, def: 'kidhoodie', shX: 1.56 },
    13: { k: .84, hs: 1.11, legF: .9, rx: 2.4, ry: 2.23, def: 'kidhoodie', shX: 1.57 },
    14: { k: .90, hs: 1.06, legF: .97, rx: 2.34, ry: 2.2, def: 'hoodie', shX: 1.6 },
    15: { k: .95, hs: 1.03, def: 'hoodie', shX: 1.64 },
    16: { k: .98, hs: 1.01, def: 'tee' },
    17: { k: 1, def: 'tee' },
    18: { k: 1, def: 'tee' },
    19: { k: 1, def: 'tee' },
  };
  const SIBLING_AGE = {
    6: { k: .56, hs: 1.2, legF: .82, def: 'tee', rx: 2.42, ry: 2.26, shX: 1.46 },
    8: { k: .62, hs: 1.18, legF: .84, def: 'tee', rx: 2.4, ry: 2.24, shX: 1.5 },
    10: { k: .70, hs: 1.13, legF: .88, def: 'hoodie', rx: 2.38, ry: 2.22, shX: 1.5 },
    12: { k: .77, hs: 1.09, legF: .91, def: 'hoodie', shX: 1.52 },
    14: { k: .87, hs: 1.04, legF: .96, def: 'hoodie' },
    16: { k: .94, hs: 1.02, def: 'hoodie' },
  };
  const KID_SKIN = ['#B0754F', '#C08A63', '#9E6746', '#D9A47E', '#E2B48E', '#A87050', '#8E5A3B'];
  const KID_TOP = ['#2F55B5', '#C93A50', '#3E9C97', '#E9AE3C', '#7E62AE', '#86AE7A', '#2A3358', '#F2876A'];
  const KID_HAIR = ['neat', 'fringe', 'short', 'swept'];
  const ageKey = (tab, a) => { const ks = Object.keys(tab).map(Number).sort((p, q) => p - q); let best = ks[0]; for (const k of ks) if (a >= k) best = k; return tab[best]; };
  function resolveChar(name, o) {
    let C = CHAR[name] || CHAR.kid;
    if ((name === 'me' || name === 'hero') && o.age != null) C = { ...C, ...ageKey(ME_AGE, o.age) };
    if (name === 'sibling' || name === 'brother') C = { ...C, ...ageKey(SIBLING_AGE, o.age ?? 14) };
    if (name === 'kid') {
      const s = o.seed || 0, h = i => hash(s * 13.71 + i * 3.3 + 1), age = o.age ?? 13, girl = o.girl ?? h(5) < .35;
      C = { ...C, skin: KID_SKIN[Math.floor(h(1) * KID_SKIN.length)], hairStyle: girl ? 'kidgirl' : KID_HAIR[Math.floor(h(2) * KID_HAIR.length)], glasses: h(3) < .35 ? 'rect' : null,
        k: lerp(.78, .95, clamp((age - 12) / 3)) * (.96 + h(4) * .08), hs: lerp(1.12, 1.03, clamp((age - 12) / 3)), lashes: girl, blink: h(6) * 3, hair: h(7) < .2 ? '#3A2A24' : '#1F1A1C', top: KID_TOP[Math.floor(h(8) * KID_TOP.length)] };
      C.skinSh = C.skin; C.nose = '#7A4A33';
    }
    const ov = {};
    if (o.glasses !== undefined) ov.glasses = o.glasses;
    if (o.shades) ov.glasses = 'shades';
    if (o.stache !== undefined) ov.stache = o.stache;
    if (o.beard !== undefined) ov.beard = o.beard;
    if (o.hoops !== undefined) ov.hoops = o.hoops;
    return { ...C, ...ov };
  }

  // ---------- outfits ----------
  const SHOE = '#F6F2EA', BLK = '#221E26', SOCK = '#F6F3EC';
  const JEANS = '#3F4D72', PLAID = { pantsPat: 'plaid', pantsPatCol: '#C93A50' };
  const OUT = {
    me: {
      tee: { top: '#2E2A35', trim: '#615B6B', sleeve: 'short', pants: JEANS, shoes: SHOE, neck: 'crew' },
      hoodie: { top: '#8E8F9A', trim: '#6B6C77', sleeve: 'long', hood: true, pocket: true, pants: JEANS, shoes: SHOE },
      pirate: { top: '#F7EFDC', trim: '#CDBF9E', sleeve: 'puff', vest: '#2B2531', sash: '#C93A50', pants: '#2B2531', shoes: '#5E3D2B', hat: 'pirate', neck: 'v' },
      // formal / sport / kid casual
      debate: { top: '#F6F3EC', trim: '#D9D3C6', collar: '#FFFFFF', tie: '#7A2335', tieLen: -3.95, jacket: '#2A3358', jacketType: 'blazer', big: true, sleeve: 'paws', pants: '#B9A37E', shoes: BLK },
      bball: { top: '#F4F1EA', trim: '#2F55B5', sleeve: 'none', neck: 'v', jersey: true, shorts: true, pants: '#1E1C22', shoes: SHOE, hightop: true },
      kidhoodie: { top: '#8E8F9A', trim: '#6B6C77', sleeve: 'long', hood: true, pocket: true, teePeek: '#E8C95A', pants: JEANS, shoes: SHOE, earbuds: true },
      // travel / lounge
      airport: { top: '#2E3A5C', trim: '#1F2A44', sleeve: 'long', hood: true, zip: true, pants: '#2B2531', shoes: SHOE, pillow: '#C3B1E1' },
      lounge: { top: '#8E8F9A', trim: '#6B6C77', sleeve: 'long', hood: true, pocket: true, pants: '#3F4D72', ...PLAID, sock: true },
      // smart-casual / sporty casual (o.boot adds a walking boot to any outfit)
      fair: { top: '#BFD4EA', trim: '#9DB6D0', collar: '#D6E4F2', tie: '#26325C', tieLoose: true, tieLen: -4.6, sleeve: 'rolled', shorts: true, pants: '#3F4D72', ...PLAID, sock: true },
      boot: { top: '#C8571E', trim: '#A2441A', sleeve: 'long', hood: true, pocket: true, pants: '#6E6A74', shoes: SHOE, bootR: true, strap: '#3A3A44' },
      sprint: { top: '#C8571E', trim: '#A2441A', sleeve: 'long', hood: true, pocket: true, pants: '#6E6A74', sock: true },
      // suits / hoodies
      greysuit: { top: '#8E2232', trim: '#6E1A26', collar: '#8E2232', tie: '#A9ABB2', jacket: '#6F7078', jacketType: 'blazer', sleeve: 'long', pants: '#6F7078', shoes: BLK, lanyard: '#2F55B5' },
      greensuit: { top: '#F6F3EC', collar: '#FFFFFF', tie: '#7A5A3A', tiePat: '#D9B25A', jacket: '#24493F', jacketType: 'blazer', sleeve: 'long', pants: '#24493F', shoes: BLK },
      orangehoodie: { top: '#C8571E', trim: '#A2441A', sleeve: 'long', hood: true, pocket: true, pants: JEANS, shoes: SHOE, strap: '#8E8F9A' },
      bluehoodie: { top: '#3F6FAE', trim: '#2F5A90', sleeve: 'long', hood: true, pocket: true, shorts: true, pants: '#B8333A', shoes: SHOE },
      // sport / band
      qb: { top: '#B8333A', trim: '#F4F1EA', sleeve: 'short', pads: true, neck: 'v', jersey: true, pants: '#D6D3CC', shoes: '#1E1C22', cleats: true },
      drumline: { top: '#1E1C22', trim: '#3A3640', sleeve: 'short', neck: 'crew', pants: '#1E1C22', shoes: SHOE, quads: true },
      // outerwear
      puffer: { top: '#1E1E24', trim: '#3A3A44', sleeve: 'long', puffer: true, big: true, zip: true, neckCol: '#BFD4EA', pants: '#6E6A74', shoes: SHOE, shoeTrim: BLK },
      bandaid: { top: '#BFD4EA', trim: '#9DB6D0', sleeve: 'short', neck: 'crew', print: null, bandaid: true, drape: '#1E1E24', pants: '#6E6A74', shoes: SHOE },
      bomber: { top: '#1E1C22', jacket: '#7A2335', jacketType: 'zip', sleeve: 'long', pants: '#1E1C22', shoes: '#F4F1EA', shoeTrim: '#C93A50' },
      // sleepwear / formal / graduation / campus / cultural
      pj: { top: '#9A9AA4', trim: '#7E7E88', sleeve: 'short', neck: 'crew', pants: '#2E3A5C', pantsPat: 'plaid', pantsPatCol: '#F2E3C3', sock: true },
      purplesuit: { top: '#5A4A7E', collar: '#5A4A7E', jacket: '#3A3A42', jacketType: 'blazer', sleeve: 'long', pants: '#3A3A42', shoes: BLK, rosette: true },
      grad: { top: '#1F2A55', trim: '#2C3A6E', sleeve: 'wide', gown: true, hat: 'grad', pants: '#1E1C22', shoes: BLK },
      tealtee: { top: '#3E7C9B', trim: '#2F6280', sleeve: 'short', neck: 'crew', pants: '#1E1C22', shoes: SHOE },
      college: { top: '#3A5A8C', trim: '#2E4A74', sleeve: 'long', hood: true, pocket: true, print: { txt: 'HELLO', col: '#F2E3C3', y: -6.15, h: .6, w: 1.6 }, pants: JEANS, shoes: SHOE },
      kurta: { top: '#F2B8C6', trim: '#D98CA0', sleeve: 'long', neck: 'mandarin', tunic: -1.9, pants: '#F4F1EA', shoes: '#C9A26A' },
      // vacation / business / casual
      aloha: { top: '#F4F1EA', trim: '#D9D3C6', sleeve: 'short', neck: 'scoop', jacket: '#2F6FB0', jacketType: 'open', jacketPat: 'hawaii', patCol: '#F4F1EA', patCol2: '#1E3E8A', shorts: true, pants: '#2B2531', shoes: '#C9A26A' },
      navyblazer: { top: '#BFD4EA', collar: '#D6E4F2', jacket: '#1F2A55', jacketType: 'blazer', sleeve: 'long', pants: '#3A3A42', shoes: BLK, lanyard: '#C93A50' },
      cargo: { top: '#5A5862', trim: '#45434C', sleeve: 'short', neck: 'crew', chestLogo: true, pants: '#A9997A', cargo: true, shoes: '#E9E5DC' },
      zipcargo: { top: '#7A2335', jacket: '#2E2C34', jacketType: 'zip', hood: true, sleeve: 'long', pants: '#A9997A', cargo: true, shoes: SHOE },
      // casual / sleepwear / cultural
      nighthoodie: { top: '#16151A', trim: '#3A3840', sleeve: 'long', hood: true, pocket: true, pants: '#2E3A5C', ...PLAID, sock: true },
      launch: { top: '#16151A', neck: 'crew', trim: '#3A3840', jacket: '#8E8F9A', jacketType: 'zip', hood: true, sleeve: 'long', pants: JEANS, shoes: SHOE },
      knit: { top: '#EDE3CF', trim: '#CDBF9E', sleeve: 'long', knit: true, neck: 'crew', pants: JEANS, shoes: SHOE },
      pinktee: { top: '#D9A9A6', neck: 'crew', trim: '#B98986', jacket: '#2E2C34', jacketType: 'zip', sleeve: 'long', pants: '#2B2531', shoes: SHOE },
      chore: { top: '#1F2A55', neck: 'crew', trim: '#2C3A6E', jacket: '#4E5A3C', jacketType: 'chore', badge: true, sleeve: 'long', pants: '#3A3A42', shoes: SHOE },
      overshirt: { top: '#BFD4EA', collar: '#D6E4F2', jacket: '#1F2A55', jacketType: 'overshirt', sleeve: 'long', pants: '#3A3A42', shoes: BLK },
      naptee: { top: '#E9D79A', trim: '#CDB86E', sleeve: 'short', neck: 'crew', print: [{ txt: 'GOOD', col: '#1F2A55', y: -6.7, h: .5 }, { txt: 'NIGHT', col: '#1F2A55', y: -5.95, h: .6, w: 1.6 }], pants: '#1F2A55', pantsPat: 'dots', pantsPatCol: '#9CB0D8', sock: true },
      festive: { top: '#F3E6C4', trim: '#D9B25A', ombre: '#E9AE3C', sleeve: 'long', neck: 'mandarin', tunic: -1.7, embroid: '#D9B25A', pants: '#F3E6C4', shoes: '#C9A26A' },
    },
    mom: {
      home: { top: '#F2E3C3', trim: '#C3B1E1', sleeve: 'short', neck: 'scoop', pat: 'stripes', patCol: '#C3B1E1', pants: '#7F96BF', shoes: SHOE },
      apron: { top: '#F2E3C3', trim: '#C3B1E1', sleeve: 'short', neck: 'scoop', pat: 'stripes', patCol: '#C3B1E1', apron: '#F3A7B5', pants: '#7F96BF', shoes: SHOE },
      tunic: { top: '#E07A5F', trim: '#C2603F', sleeve: 'long', neck: 'v', tunic: -1.8, embroid: '#F7D774', pants: '#2B2531', shoes: '#C9A26A' },
      tealdress: { top: '#2F5F5A', trim: '#244A46', sleeve: 'short', neck: 'scoop', dress: true, skirtY: -1.15, heels: '#C93A50' },
      pinksweater: { top: '#D9447A', trim: '#B5325F', sleeve: 'long', knit: true, neck: 'crew', pants: JEANS, shoes: SHOE },
      dotdress: { top: '#3E6FB8', trim: '#2F5A9A', sleeve: 'none', oneShoulder: true, dress: true, skirtY: -.3, pat: 'dots', patCol: '#E9C96A', heels: '#E9C96A', bag: '#F3A7B5' },
      yellow: { top: '#F3D25A', trim: '#D9B53E', sleeve: 'short', neck: 'scoop', pants: '#9DB4D6', shoes: SHOE },
      gown: { top: '#BFD9E8', trim: '#9CC1D6', sleeve: 'none', neck: 'scoop', dress: true, skirtY: -.25, pat: 'sparkle', patCol: '#FFFFFF', heels: '#C9CCD2' },
      salwar: { top: '#E46F8C', trim: '#C9506E', sleeve: 'long', neck: 'v', tunic: -1.6, pat: 'dots', patCol: '#F7D774', pants: '#F7D774', shoes: '#C9A26A', dupatta: '#F7D774' },
      zip: { top: '#E9E9EE', trim: '#C9C9D2', sleeve: 'long', hood: true, zip: true, pants: JEANS, shoes: SHOE },
    },
    dad: {
      dadtee: { top: '#3E6F8E', trim: '#2F5A76', sleeve: 'short', neck: 'crew', dadPrint: true, pants: '#7A5A3A', shoes: '#2B2531' },
      polo: { top: '#D8C9A6', trim: '#6E5340', sleeve: 'short', neck: 'polo', pat: 'stripes', patCol: '#6E5340', pants: '#7A5A3A', shoes: '#2B2531' },
      lavpolo: { top: '#A9A3BE', trim: '#8A84A0', sleeve: 'short', neck: 'polo', pat: 'stripes', patCol: '#8A84A0', pants: '#B9A37E', shoes: '#2B2531' },
      blazer: { top: '#DDE6EE', collar: '#F4F6F8', jacket: '#4A5068', jacketType: 'blazer', jacketPat: 'plaid', patCol: '#6A7090', sleeve: 'long', pants: JEANS, shoes: '#6E5340' },
      brownblazer: { top: '#F4F1EA', collar: '#FFFFFF', jacket: '#6E4A32', jacketType: 'blazer', sleeve: 'long', pants: '#2B2531', shoes: BLK },
      olive: { top: '#5A6248', trim: '#474E38', sleeve: 'long', neck: 'qzip', pants: '#B9A37E', shoes: '#2B2531' },
      floral: { top: '#F2C49A', trim: '#D9A67A', sleeve: 'short', collar: '#F2C49A', pat: 'flowers', patCol: '#E46F8C', patCol2: '#86AE7A', lanyard: '#2F55B5', pants: '#B9A37E', shoes: '#2B2531' },
    },
    sibling: {
      tee: { top: '#E8C95A', trim: '#C9AA3E', sleeve: 'short', neck: 'crew', pants: JEANS, shoes: SHOE },
      cape: { top: '#B8333A', trim: '#8E2228', sleeve: 'long', neck: 'crew', cape: '#C93A50', emblem: '#F7D774', pants: '#2B2531', shoes: '#1E1C22' },
      hoodie: { top: '#3A4A6E', trim: '#2A3858', sleeve: 'long', hood: true, pocket: true, hoodCol: '#8E8F9A', pants: '#1E1C22', shoes: SHOE },
      grey: { top: '#9A9AA4', trim: '#7E7E88', sleeve: 'short', neck: 'crew', pants: '#1E1C22', shoes: SHOE },
      blazer: { top: '#F6F3EC', collar: '#FFFFFF', jacket: '#1F2A55', jacketType: 'blazer', sleeve: 'long', pants: '#3A3A42', shoes: BLK },
      greenhoodie: { top: '#3E7A4E', trim: '#2E5E3A', sleeve: 'long', hood: true, pocket: true, pants: '#1E1C22', shoes: SHOE },
      zip: { top: '#C9C8CE', trim: '#A9A8B0', sleeve: 'long', hood: true, zip: true, pants: JEANS, shoes: SHOE },
      concert: { top: '#1E1C22', collar: '#1E1C22', trim: '#3A3640', sleeve: 'long', buttons: true, pants: '#1E1C22', shoes: BLK },
      formal: { top: '#F6F3EC', collar: '#FFFFFF', tie: '#7A2335', jacket: '#1E1C22', jacketType: 'blazer', sleeve: 'long', pants: '#1E1C22', shoes: BLK },
    },
    friendC: {
      hoodie: { top: '#3A4A6E', trim: '#2A3858', sleeve: 'long', hood: true, pocket: true, pants: '#1E1C22', shoes: SHOE },
      bowtie: { top: '#1E1C22', collar: '#1E1C22', bowtie: '#3E9C97', sleeve: 'long', buttons: true, pants: '#1E1C22', shoes: BLK },
      grad: { top: '#1F2A55', trim: '#2C3A6E', sleeve: 'wide', gown: true, hat: 'grad', capArt: 'stars', pants: '#1E1C22', shoes: BLK },
    },
    friendA: {
      tee: { top: '#2A3358', trim: '#1F2A44', sleeve: 'short', neck: 'crew', pants: '#A9997A', shoes: SHOE },
      red: { top: '#F4F1EA', trim: '#D9D3C6', neck: 'crew', jacket: '#C9302C', jacketType: 'open', sleeve: 'short', pants: '#2B2531', shoes: SHOE },
      jumpsuit: { top: '#C8302E', trim: '#A02420', sleeve: 'long', zip: true, collar: '#C8302E', pants: '#C8302E', shoes: SHOE, belt: '#A02420' },
    },
    friendB: {
      aloha: { top: '#8E8F9A', trim: '#6B6C77', sleeve: 'short', neck: 'scoop', jacket: '#7FB8C2', jacketType: 'open', jacketPat: 'hawaii', patCol: '#F4F1EA', patCol2: '#2E6E78', shorts: true, pants: '#2E3A5C', shoes: SHOE },
      night: { top: '#1E1C22', neck: 'crew', jacket: '#16151A', jacketType: 'zip', sleeve: 'long', pants: '#3A3A42', shoes: SHOE },
    },
    friendD: {
      hoodie: { top: '#C9A24A', trim: '#A8852F', sleeve: 'long', hood: true, pocket: true, pants: JEANS, shoes: SHOE },
      tiedye: { top: '#BFD8E8', trim: '#9CC1D6', sleeve: 'long', hood: true, pocket: true, pat: 'tiedye', patCol: '#C3B1E1', patCol2: '#F3D3E0', pants: '#2B2531', shoes: SHOE },
    },
    friendF: { tee: { top: '#F4F1EA', trim: '#D9D3C6', sleeve: 'short', neck: 'crew', graphic: true, pants: JEANS, shoes: SHOE } },
    friendE: { cyan: { top: '#2BB3E0', trim: '#1F94BD', sleeve: 'short', neck: 'crew', pants: '#A9997A', cargo: true, shoes: SHOE } },
    friendG: { hoodie: { top: '#7E62AE', trim: '#644C90', sleeve: 'long', hood: true, pocket: true, pants: JEANS, shoes: SHOE } },
    friendH: { tee: { top: '#F2876A', trim: '#D46A50', sleeve: 'short', neck: 'crew', pants: '#2B2531', shoes: SHOE } },
    cofounder: {
      hoodie: { top: '#1E1C22', trim: '#3A3640', sleeve: 'long', hood: true, pocket: true, pants: '#2B2531', shoes: SHOE },
      tan: { top: '#D9B98A', trim: '#B99A6E', sleeve: 'short', neck: 'crew', pants: '#1E1C22', shoes: SHOE },
      black: { top: '#16151A', trim: '#3A3840', sleeve: 'short', neck: 'crew', pants: JEANS, shoes: SHOE },
    },
    coworker: { black: { top: '#16151A', trim: '#3A3840', sleeve: 'short', neck: 'crew', pants: '#2B2531', shoes: SHOE } },
    grandpa: { shirt: { top: '#6E3E2A', trim: '#5A3222', sleeve: 'short', collar: '#6E3E2A', pat: 'dots', patCol: '#C9A26A', pants: '#B9A37E', shoes: '#4A3A30' } },
    kid: {
      tee: { top: '#2F55B5', trim: '#24438F', sleeve: 'short', neck: 'crew', pants: JEANS, shoes: SHOE },
      hoodie: { top: '#2F55B5', trim: '#24438F', sleeve: 'long', hood: true, pocket: true, pants: JEANS, shoes: SHOE },
      blazer: { top: '#F6F3EC', collar: '#FFFFFF', tie: '#C93A50', jacket: '#2A3358', jacketType: 'blazer', big: true, sleeve: 'long', pants: '#B9A37E', shoes: BLK },
      suit: { top: '#F6F3EC', collar: '#FFFFFF', tie: '#2F55B5', jacket: '#3A3A42', jacketType: 'blazer', sleeve: 'long', pants: '#3A3A42', shoes: BLK, lanyard: '#C93A50' },
      jersey: { top: '#F4F1EA', trim: '#C93A50', sleeve: 'none', neck: 'v', jersey: true, shorts: true, pants: '#C93A50', shoes: SHOE },
    },
    partner: {
      sweater: { top: '#F2E3C3', trim: '#CDB68C', sleeve: 'long', knit: true, pants: '#89A5CA', shoes: SHOE, neck: 'crew' },
      jersey: { top: '#29252E', trim: '#F4EFE6', sleeve: 'short', jersey: true, pants: '#89A5CA', shoes: SHOE, neck: 'v' },
      hoodie: { top: '#8E8F9A', trim: '#6B6C77', sleeve: 'paws', hood: true, pocket: true, big: true, pants: '#89A5CA', shoes: SHOE },
      lehenga: { top: '#FCF8F0', trim: '#E2C877', sleeve: 'short', crop: true, skirt: 'lehenga', shoes: '#E6BE5E', neck: 'scoop' },
      sailor: { top: '#FCFBF7', trim: '#C9C4B8', sleeve: 'short', sailorCollar: '#2D3F7C', bow: '#E2475E', skirt: 'sailor', skirtCol: '#2D3F7C', pants: null, shoes: '#2B2531', hat: 'sailor' },
    },
  };
  OUT.brother = OUT.sibling; OUT.hero = OUT.me; OUT.crush = OUT.partner;
  function outfitOf(name, k, C, o = {}) {
    const tab = OUT[name] || OUT.kid;
    let F = tab[k || C.def] || tab[C.def] || Object.values(tab)[0];
    if (name === 'kid' && k !== 'blazer' && k !== 'suit') F = { ...F, top: C.top, trim: PAL.ink, pants: k === 'jersey' ? C.top : F.pants };
    // per-call accessory overrides
    const ov = {};
    if (o.boot !== undefined) ov.bootR = !!o.boot;
    if (typeof o.boot === 'string' || o.bootSide) ov.bootSide = String(typeof o.boot === 'string' ? o.boot : o.bootSide)[0].toLowerCase();
    if (o.hat !== undefined) ov.hat = o.hat === 'none' ? null : o.hat;
    if (o.capArt) ov.capArt = o.capArt;
    if (o.neckPillow !== undefined) ov.pillow = o.neckPillow === true ? '#C3B1E1' : o.neckPillow || null;
    for (const key of ['headphones', 'strap', 'lanyard', 'bandaid', 'earbuds', 'lei', 'rosette', 'backpack']) if (o[key] !== undefined) ov[key] = o[key];
    // chest prints: o.jerseyNum on a jersey (big number), o.shirtText on anything (small line); dark tops get light ink
    const lt = c => { const n = parseInt(String(c || '#888').slice(1, 7), 16); return ((n >> 16 & 255) * .3 + (n >> 8 & 255) * .59 + (n & 255) * .11) / 255; };
    const prCol = o.shirtCol || (lt(F.top) < .45 ? '#F4F1EA' : PAL.ink);
    if (o.jerseyNum != null && o.jerseyNum !== false && o.jerseyNum !== '') ov.print = { txt: String(o.jerseyNum), col: o.shirtCol || (F.trim !== F.top ? F.trim : prCol), y: -5.7, h: 1.05, w: 1.6 };
    if (o.shirtText) ov.print = { txt: String(o.shirtText), col: prCol, y: -6.1, h: .5, w: 1.1 };
    if (ov.print) { if (F.dadPrint) ov.dadPrint = false; if (F.graphic) ov.graphic = false; }   // a custom print replaces the stock graphic
    return Object.keys(ov).length ? { ...F, ...ov } : F;
  }

  // ---------- eyes ----------
  const EYE = '#2A2230', WHITE = '#FFFFFF', MOUTH = '#6E2433', TONGUE = '#F07C8E';
  function eye(M, type, s, C, o) {
    // M = eye-local transform (origin at eye centre). s = −1 screen-left eye, +1 screen-right eye.
    const lx = clamp(o.look ?? 0, -1, 1) * .1, ly = clamp(o.lookY ?? 0, -1, 1) * .08, lash = C.lashes;
    const lashLine = (y0 = 0) => ln(M, [[-s * .36, -.26 + y0], [0, -.47 + y0], [s * .34, -.32 + y0], [s * .5, -.44 + y0]], 1.7);
    const oval = (rx, ry) => {
      shp(M, E(lx, ly, rx, ry, 14), EYE, { ink: null, raw: true });
      if (lash) shp(M, E(lx, ly + ry * .42, rx * .72, ry * .42, 12), '#6A4036', { ink: null, raw: true, op: 200 });
      shp(M, E(lx + .1, ly - ry * .4, .12, .13, 10), WHITE, { ink: null, raw: true });
      shp(M, E(lx - .1, ly + ry * .38, .055, .055, 8), WHITE, { ink: null, raw: true });
    };
    const R = lash ? [.3, .44] : C.eyeShape === 'calm' ? [.29, .3] : [.27, .38];
    switch (type) {
      case 'happy': ln(M, [[-.33, .1], [0, -.2], [.33, .1]], 1.9); if (lash) ln(M, [[s * .33, .1], [s * .46, .02]], 1.4); break;
      case 'closed': ln(M, [[-.33, -.02], [0, .15], [.33, -.02]], 1.7); if (lash) { ln(M, [[s * .33, -.02], [s * .47, -.12]], 1.3); ln(M, [[s * .12, .12], [s * .16, .26]], 1); } break;
      case 'down': ln(M, [[-.33, .08], [0, .2], [.33, .08]], 1.7); shp(M, E(lx, .2, .2, .07, 10), EYE, { ink: null, raw: true }); if (lash) ln(M, [[s * .33, .08], [s * .46, .02]], 1.3); break;
      case 'wink':
        if (s > 0) ln(M, [[.26, -.24], [-.24, 0], [.26, .22]], 1.9); else { oval(...R); if (lash) lashLine(); }
        break;
      case 'heart': shp(M, heartPts(0, .02, .55, 24), PAL.hot, { raw: true, sw: .9 }); shp(M, E(-.18, -.18, .1, .08, 8), WHITE, { ink: null, raw: true }); break;
      case 'star': shp(M, starPts(0, 0, .58, .46, 5), PAL.butter, { raw: true, sw: .9 }); shp(M, E(-.12, -.14, .08, .08, 8), WHITE, { ink: null, raw: true }); break;
      case 'wide':
        shp(M, E(0, 0, .38, .5, 16), WHITE, { raw: true, sw: .9 });
        shp(M, E(lx * 1.6, ly, .15, .18, 10), EYE, { ink: null, raw: true }); shp(M, E(lx * 1.6 + .05, ly - .07, .05, .05, 6), WHITE, { ink: null, raw: true });
        break;
      case 'sleepy':
        shp(M, [[-.3, .02], [.3, .02], [.27, .2], [0, .34], [-.27, .2]], EYE, { ink: null });
        ln(M, [[-.4, .02], [0, -.04], [.4, .02]], 1.8); if (lash) ln(M, [[s * .4, .02], [s * .5, .1]], 1.2);
        break;
      case 'side': {
        const d = Math.sign(o.look || 1) * .12;
        shp(M, E(d, .05, R[0] * .9, R[1] * .9, 12), EYE, { ink: null, raw: true });
        shp(M, E(d + .08, -.03, .07, .07, 6), WHITE, { ink: null, raw: true });
        shp(M, [[-.48, -.75], [.48, -.75], [.48, -.1], [-.48, -.12]], o._skin, { ink: null, raw: true });
        ln(M, [[-.4, -.1], [0, -.14], [.4, -.11]], 1.8);
        break;
      }
      case 'cry': {
        oval(...R); if (lash) lashLine();
        const w = o.t != null ? Math.sin(o.t * 14 + s) * .06 : 0;
        shp(M, [[-.14, .36], [.14, .36], [.2 + w, 1.0], [.16, 1.55], [0, 1.68 + w], [-.16, 1.55], [-.2 - w, 1.0]], '#A6D8F2', { ink: '#5B9AC6', sw: .7, op: 235 });
        shp(M, E(.05, -.05, .3, .1, 10), WHITE, { ink: null, raw: true, op: 160 });
        break;
      }
      case 'swirl': { const p = []; for (let i = 0; i <= 22; i++) { const a = i / 22 * 3.6 * Math.PI + (o.t || 0) * 6 * s, r = .04 + .34 * i / 22; p.push([Math.cos(a) * r, Math.sin(a) * r]); } ln(M, p, 1.4); break; }
      default: oval(...R); if (lash) lashLine();
    }
  }
  const BROWS = { relaxed: [.05, -.06, .02], up: [-.22, -.36, -.18], worried: [.1, -.12, -.3], angry: [-.2, -.02, .16], flat: [0, 0, 0] };
  const browFor = e => ({ cry: 'worried', swirl: 'worried', wide: 'up', heart: 'up', star: 'up', sleepy: 'flat', side: 'flat', down: 'relaxed' }[e] || 'relaxed');
  function mouth(M, type, o) {
    switch (type) {
      case 'grin':
        shp(M, [[-.52, -.1], [.52, -.1], [.36, .26], [0, .42], [-.36, .26]], MOUTH, { sw: .9 });
        shp(M, [[-.44, -.08], [.44, -.08], [.38, .06], [-.38, .06]], WHITE, { ink: null });
        shp(M, E(0, .28, .2, .09, 10), TONGUE, { ink: null, raw: true }); break;
      case 'o': shp(M, E(0, .06, .14, .17, 10), MOUTH, { raw: true, sw: .8 }); break;
      case 'O': shp(M, E(0, .14, .3, .38, 14), MOUTH, { raw: true, sw: .9 }); shp(M, E(0, .36, .17, .09, 10), TONGUE, { ink: null, raw: true }); break;
      case 'flat': ln(M, [[-.3, .02], [0, .04], [.3, .01]], 1.4); break;
      case 'wobble': { const p = []; for (let i = 0; i <= 6; i++) p.push([-.42 + i * .14, (i % 2 ? .07 : -.03)]); ln(M, p, 1.3); break; }
      case 'sing': {
        const op = clamp(o.open ?? (o.t != null ? .35 + .5 * Math.abs(Math.sin(o.t * 8.5)) : .6));
        const h = .12 + .32 * op, w = .3 - .05 * op;
        shp(M, [[-w, -.05], [w, -.05], [w * .9, h * .7], [0, h + .05], [-w * .9, h * .7]], MOUTH, { sw: .9 });
        shp(M, E(0, h * .78, w * .55, .07 + .05 * op, 10), TONGUE, { ink: null, raw: true });
        break;
      }
      case 'tongue': ln(M, [[-.4, -.04], [0, .14], [.4, -.04]], 1.4); shp(M, E(.1, .26, .17, .2, 12), TONGUE, { raw: true, sw: .8 }); ln(M, [[.1, .14], [.1, .3]], .8); break;
      case 'cat': ln(M, [[-.38, -.06], [-.19, .12], [0, -.02], [.19, .12], [.38, -.06]], 1.4); break;
      case 'smirk': ln(M, [[-.32, .06], [.1, .07], [.4, -.1]], 1.4); break;
      default: ln(M, [[-.42, -.06], [0, .17], [.42, -.06]], 1.5);
    }
  }

  // ---------- hair ----------
  function curlCloud(extra = 0) {
    const p = [], N = 30;
    for (let i = 0; i <= N; i++) {
      const a = Math.PI * 1.03 + i / N * Math.PI * .94, up = Math.max(0, -Math.sin(a));
      const lobe = Math.pow(Math.abs(Math.sin(i / N * Math.PI * 5.5)), .6);
      const r = 2.45 + extra + (.62 + extra * 1.5) * up * up + (.2 + extra * .6) * lobe;
      p.push([Math.cos(a) * r * 1.04 + .28 * up * up * up, Math.sin(a) * r]);
    }
    return p;
  }
  function curlHair(M, C, back) {
    const cloud = curlCloud(C.curlsBig || 0);
    if (back) { shp(M, [...cloud, [2.35, .7], [1.4, 1.45], [0, 1.6], [-1.4, 1.45], [-2.35, .7]], C.hair, { sw: 1.1 }); curls(M, C, true); return; }
    const fr = [];
    for (let j = 0; j <= 12; j++) { const x = 1.95 - 3.9 * j / 12, lobe = Math.pow(Math.abs(Math.sin(j / 12 * Math.PI * 3.5)), .7); fr.push([x, -1.12 + .42 * lobe + (j === 7 ? .18 : 0) + (C.curlsBig ? .12 : 0)]); }
    shp(M, [...cloud, [2.42, .25], [2.12, .05], ...fr, [-2.12, .05], [-2.42, .25]], C.hair, { sw: 1.1, sub: 2 });
    curls(M, C, false);
  }
  function curls(M, C, back) {
    const cs = back ? [[-1.3, -1.2], [.2, -1.9], [1.4, -1.1], [-.4, -.2], [.9, .3]] : [[-1.45, -2.0], [-.2, -2.75], [1.2, -2.35], [.45, -1.65], [-.95, -1.45]];
    cs.forEach(([x, y], i) => { const p = []; for (let k = 0; k <= 7; k++) { const a = k / 7 * 4.4 + i, r = .1 + .22 * k / 7; p.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } ln(M, p, 1.0, C.hairHi); });
  }
  // generic cap that wraps the back of the head (back view / tiny back)
  const capBack = (r = 2.5, low = 1.55) => [...arc(r, r * .98, PI * 1.0, PI * 2.0, 14), [r * .95, .7], [1.4, low - .1], [0, low], [-1.4, low - .1], [-r * .95, .7]];
  const spiral = (M, C, x, y, i, s = 1) => { const p = []; for (let k = 0; k <= 7; k++) { const a = k / 7 * 4.4 + i, r = (.1 + .22 * k / 7) * s; p.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } ln(M, p, 1.0, C.hairHi); };
  const HAIR = {
    // straight helmet + heavy side-swept fringe (generic kids use it too)
    fringe: {
      main: () => [...arc(2.56, 2.5, PI * .97, PI * 2.03, 16, -.06), [2.5, .5], [2.2, .38], [2.08, -.3], [1.7, -.62], [1.3, -.42], [.88, -.86], [.38, -.6], [-.12, -1.0], [-.62, -.76], [-1.12, -1.08], [-1.6, -.86], [-2.02, -.55], [-2.2, .38], [-2.5, .5]],
      hi: (M, C) => { ln(M, [[-1.7, -1.75], [-.7, -2.2], [.4, -2.25]], 1.4, C.hairHi); ln(M, [[.95, -1.85], [1.75, -1.35]], 1.2, C.hairHi); ln(M, [[-.3, -1.5], [.3, -1.3]], .9, C.hairHi); },
    },
    // neat, straight, short fringe
    neat: {
      main: () => [...arc(2.48, 2.42, PI * .98, PI * 2.02, 16, -.04), [2.44, .3], [2.18, .2], [2.04, -.55], [1.55, -1.02], [.95, -.92], [.35, -1.16], [-.28, -1.02], [-.9, -1.22], [-1.5, -1.06], [-2.02, -.66], [-2.18, .2], [-2.44, .3]],
      hi: (M, C) => { ln(M, [[-1.4, -1.85], [-.4, -2.2], [.7, -2.1]], 1.3, C.hairHi); ln(M, [[1.2, -1.75], [1.8, -1.3]], 1.1, C.hairHi); },
    },
    kidgirl: {
      behind: () => [[-2.5, 0], [-2.45, -1.3], [-1.7, -2.25], [0, -2.5], [1.7, -2.25], [2.45, -1.3], [2.5, 0], [2.65, 1.6], [2.55, 3.4], [2.0, 3.7], [1.2, 3.5], [-1.2, 3.5], [-2.0, 3.7], [-2.55, 3.4], [-2.65, 1.6]],
      main: () => [...arc(2.5, 2.45, PI * .98, PI * 2.02, 16, -.02), [2.45, .5], [2.1, .55], [1.95, -.4], [1.4, -1.05], [.5, -1.3], [0, -1.15], [-.5, -1.3], [-1.4, -1.05], [-1.95, -.4], [-2.1, .55], [-2.45, .5]],
      hi: (M, C) => { ln(M, [[-1.3, -1.9], [-.4, -2.2]], 1.3, C.hairHi); ln(M, [[.5, -2.15], [1.4, -1.85]], 1.3, C.hairHi); },
    },
    // wavy cloud, side part, loose waves dipping onto the forehead
    wavy: {
      main: () => { const p = [], N = 26; for (let i = 0; i <= N; i++) { const a = PI * .99 + i / N * PI * 1.02, up = Math.max(0, -Math.sin(a)), lobe = Math.pow(Math.abs(Math.sin(i / N * PI * 4.5)), .6); const r = 2.48 + .55 * up * up + .24 * lobe; p.push([Math.cos(a) * r * 1.04, Math.sin(a) * r]); }
        return [...p, [2.52, .32], [2.2, .2], [2.08, -.5], [1.8, -.98], [1.38, -.72], [.98, -1.22], [.42, -1.04], [-.1, -1.5], [-.66, -1.86], [-.95, -2.1], [-1.22, -1.62], [-1.75, -1.22], [-2.1, -.5], [-2.2, .2], [-2.52, .32]]; },
      hi: (M, C) => { ln(M, [[-.95, -2.1], [-.35, -2.6], [.45, -2.5], [1.05, -2.8], [1.75, -2.35]], 1.5, C.hairHi); ln(M, [[-1.3, -2.35], [-1.95, -1.85]], 1.2, C.hairHi); ln(M, [[-.95, -2.1], [-.82, -2.85]], 1.0, C.hairHi); spiral(M, C, 1.55, -1.25, 1, .7); ln(M, [[.2, -1.45], [.75, -1.75]], 1.0, C.hairHi); },
    },
    // tall pompadour — a rolling wave of hair swept up and back, short sides
    pomp: {
      main: () => [[-2.42, .2], [-2.5, -.9], [-2.45, -1.8], [-2.15, -2.6], [-1.5, -3.25], [-.6, -3.75], [.4, -4.08], [1.35, -4.02], [2.12, -3.55], [2.5, -2.8], [2.56, -1.8], [2.5, -.8], [2.42, .2], [2.18, .1], [2.05, -.85], [1.75, -1.5], [1.1, -1.72], [.5, -1.55], [-.1, -1.76], [-.8, -1.66], [-1.5, -1.42], [-2.0, -.85], [-2.2, .1]],
      hi: (M, C) => { ln(M, [[-1.95, -2.3], [-1.05, -3.12], [.2, -3.55], [1.3, -3.48], [2.02, -2.92]], 1.7, C.hairHi); ln(M, [[-1.55, -1.95], [-.5, -2.5], [.7, -2.78], [1.72, -2.38]], 1.4, C.hairHi); spiral(M, C, 1.25, -2.0, 2, .85); },
    },
    // wavy hair swept up, messy
    swept: {
      main: () => [[-2.5, .3], [-2.56, -1.0], [-2.28, -2.1], [-1.55, -2.85], [-.42, -3.22], [.72, -3.28], [1.62, -2.98], [2.32, -2.2], [2.56, -1.1], [2.5, .3], [2.2, .15], [2.0, -.72], [1.55, -1.28], [1.08, -1.05], [.72, -1.48], [.1, -1.36], [-.32, -1.72], [-.96, -1.5], [-1.6, -1.2], [-2.05, -.6], [-2.2, .15]],
      hi: (M, C) => { ln(M, [[-1.6, -2.1], [-.7, -2.6], [.3, -2.6]], 1.3, C.hairHi); ln(M, [[.9, -2.35], [1.7, -2.0]], 1.2, C.hairHi); ln(M, [[1.08, -1.05], [1.0, -1.6]], 1.0, C.hairHi); },
    },
    // wavy, pushed up with a soft front wave
    wavyUp: {
      main: () => [[-2.5, .3], [-2.55, -1.05], [-2.25, -2.15], [-1.5, -2.85], [-.4, -3.12], [.75, -3.1], [1.65, -2.8], [2.32, -2.1], [2.55, -1.05], [2.5, .3], [2.2, .15], [2.02, -.75], [1.5, -1.42], [.7, -1.6], [.1, -1.4], [-.55, -1.7], [-1.3, -1.5], [-1.85, -1.05], [-2.2, .15]],
      hi: (M, C) => { ln(M, [[-1.85, -1.9], [-1.1, -2.5], [-.2, -2.6], [.6, -2.4]], 1.3, C.hairHi); ln(M, [[1.0, -2.2], [1.75, -1.85]], 1.2, C.hairHi); },
    },
    // short crop
    short: {
      main: () => [[-2.42, .0], [-2.5, -1.0], [-2.22, -1.98], [-1.42, -2.6], [0, -2.82], [1.42, -2.6], [2.22, -1.98], [2.5, -1.0], [2.42, .0], [2.18, -.12], [2.04, -.92], [1.6, -1.32], [.8, -1.36], [0, -1.52], [-.8, -1.36], [-1.6, -1.32], [-2.04, -.92], [-2.18, -.12]],
      hi: (M, C) => { for (let i = 0; i < 6; i++) { const x = -1.5 + i * .6; ln(M, [[x, -1.65 - (i % 2) * .15], [x + .12, -2.05 - (i % 2) * .1]], .9, C.hairHi); } },
    },
    // short, combed back (C.greyTemples adds grey at the sides; C.greyAll = all grey)
    dad: {
      main: () => [[-2.42, -.05], [-2.5, -1.1], [-2.18, -1.98], [-1.36, -2.54], [0, -2.72], [1.36, -2.54], [2.18, -1.98], [2.5, -1.1], [2.42, -.05], [2.2, -.25], [1.96, -1.08], [1.48, -1.86], [.78, -1.74], [0, -1.62], [-.78, -1.74], [-1.48, -1.86], [-1.96, -1.08], [-2.2, -.25]],
      hi: (M, C) => {
        if (C.greyTemples && !C.greyAll) for (const s of [-1, 1]) shp(M, E(s * 2.26, -.45, .2, .4, 10, s * .2), '#8C8782', { raw: true, ink: null, op: 220 });
        for (let i = 0; i < 4; i++) { const x = -.9 + i * .6; ln(M, [[x, -1.85], [x * .85, -2.25], [x * .7, -2.5]], .9, C.greyAll ? '#F4F1EA' : '#4E4450'); }
      },
    },
    // shoulder-length, layered, softly wavy, side part
    mom: {
      behind: () => [[-2.5, 0], [-2.44, -1.3], [-1.7, -2.24], [0, -2.52], [1.7, -2.24], [2.44, -1.3], [2.5, 0], [2.72, 1.3], [2.92, 2.4], [2.82, 3.2], [2.35, 3.05], [1.95, 3.35], [1.5, 3.0], [-1.5, 3.0], [-1.95, 3.35], [-2.35, 3.05], [-2.82, 3.2], [-2.92, 2.4], [-2.72, 1.3]],
      main: () => [...arc(2.46, 2.46, PI * .98, PI * 2.02, 14, -.02), [2.4, .38], [2.08, .5], [1.94, -.26], [1.5, -1.0], [.82, -1.42], [-.06, -1.72], [-.62, -1.95], [-.8, -1.56], [-1.34, -1.24], [-1.86, -.6], [-2.08, .5], [-2.4, .38]],
      strands: s => [[s * 1.92, -.4], [s * 2.06, .55], [s * 1.9, 1.45], [s * 2.04, 2.25], [s * 2.4, 2.88], [s * 2.78, 2.5], [s * 2.86, 1.5], [s * 2.72, .4], [s * 2.5, -.6]],
      hi: (M, C) => { ln(M, [[-.62, -1.95], [-1.4, -1.7], [-1.95, -1.1]], 1.4, C.hairHi); ln(M, [[-.3, -2.1], [.6, -1.95], [1.5, -1.45]], 1.4, C.hairHi); for (const s of [-1, 1]) ln(M, [[s * 2.3, .4], [s * 2.2, 1.3], [s * 2.45, 2.2]], .9, C.hairHi); },
    },
    // shoulder-length wavy, centre part
    long: {
      behind: () => [[-2.5, 0], [-2.45, -1.4], [-1.7, -2.3], [0, -2.56], [1.7, -2.3], [2.45, -1.4], [2.5, 0], [2.72, 1.3], [2.86, 2.35], [2.62, 3.0], [2.2, 2.8], [1.75, 3.1], [1.3, 2.7], [-1.3, 2.7], [-1.75, 3.1], [-2.2, 2.8], [-2.62, 3.0], [-2.86, 2.35], [-2.72, 1.3]],
      main: () => [[-2.45, .4], [-2.52, -1.0], [-2.02, -2.12], [-1.0, -2.58], [0, -2.64], [1.0, -2.58], [2.02, -2.12], [2.52, -1.0], [2.45, .4], [2.15, .3], [1.95, -.62], [1.5, -1.3], [.8, -1.6], [.1, -1.9], [0, -1.72], [-.1, -1.9], [-.8, -1.6], [-1.5, -1.3], [-1.95, -.62], [-2.15, .3]],
      strands: s => [[s * 1.95, -.6], [s * 2.15, .4], [s * 2.0, 1.3], [s * 2.15, 2.1], [s * 2.42, 2.62], [s * 2.72, 2.2], [s * 2.78, 1.2], [s * 2.58, .0], [s * 2.46, -.9]],
      hi: (M, C) => { for (const s of [-1, 1]) { ln(M, [[s * .15, -1.95], [s * .9, -2.2], [s * 1.7, -1.8]], 1.2, C.hairHi); ln(M, [[s * 2.35, .2], [s * 2.25, 1.2], [s * 2.5, 2.1]], .9, C.hairHi); } },
    },
    // big curly hair (bigger and rounder than 'curls', curls dropping at the sides)
    bigcurls: {
      main: () => { const p = [], N = 34; for (let i = 0; i <= N; i++) { const a = PI * .92 + i / N * PI * 1.16, up = Math.max(0, -Math.sin(a)), lobe = Math.pow(Math.abs(Math.sin(i / N * PI * 7.5)), .5); const r = 2.6 + .55 * up * up + .26 * lobe; p.push([Math.cos(a) * r * 1.06, Math.sin(a) * r]); }
        const fr = []; for (let j = 0; j <= 12; j++) { const x = 2.0 - 4.0 * j / 12, lobe = Math.pow(Math.abs(Math.sin(j / 12 * PI * 4.5)), .7); fr.push([x, -1.0 + .45 * lobe]); }
        return [...p, [2.55, 1.05], [2.22, .7], ...fr, [-2.22, .7], [-2.55, 1.05]]; },
      hi: (M, C) => { [[-1.6, -2.1], [-.4, -2.9], [.9, -2.7], [1.9, -1.7], [.2, -1.85], [-1.1, -1.5], [2.3, -.1], [-2.3, -.2]].forEach(([x, y], i) => spiral(M, C, x, y, i)); },
    },
    // longish straight hair, fringe swept to one side, ears covered
    side: {
      behind: () => [[-2.55, 0], [-2.52, -1.3], [-1.72, -2.32], [0, -2.6], [1.72, -2.32], [2.52, -1.3], [2.55, 0], [2.6, 1.05], [2.15, 1.35], [-2.15, 1.35], [-2.6, 1.05]],
      main: () => [...arc(2.55, 2.52, PI * .97, PI * 2.03, 16, -.04), [2.58, 1.0], [2.26, 1.05], [2.1, .2], [1.95, -.3], [1.6, -.22], [1.25, -.5], [.75, -.42], [.3, -.72], [-.25, -.78], [-.7, -1.02], [-1.25, -1.16], [-1.75, -1.0], [-2.06, -.5], [-2.22, .55], [-2.58, .95]],
      hi: (M, C) => { ln(M, [[-1.6, -2.0], [-.4, -1.7], [.9, -1.05], [1.6, -.45]], 1.3, C.hairHi); ln(M, [[-.7, -2.45], [.6, -2.1], [1.8, -1.2]], 1.2, C.hairHi); ln(M, [[-.2, -1.25], [.6, -.85]], 1.0, C.hairHi); ln(M, [[2.3, -.6], [2.35, .6]], .9, C.hairHi); },
    },
  };
  function hairFront(Mh, C) {
    if (C.hairStyle === 'curls') return curlHair(Mh, C, false);
    const H = HAIR[C.hairStyle] || HAIR.neat;
    if (H.strands) for (const s of [-1, 1]) shp(Mh, H.strands(s), C.hair, { sw: 1.0 });
    shp(Mh, H.main(), C.hair, { sw: 1.1, sub: 2 });
    H.hi(Mh, C);
  }
  function hairBehind(Mh, C, headOnly) {
    const H = HAIR[C.hairStyle]; if (!H || !H.behind) return;
    shp(Mh, headOnly ? H.behind().map(([x, y]) => [x, y > 0 ? y * .55 : y]) : H.behind(), C.hair, { sw: 1.05 });
  }
  function hairBack(Mh, C) {
    if (C.hairStyle === 'curls') return curlHair(Mh, C, true);
    const H = HAIR[C.hairStyle] || HAIR.neat;
    if (H.behind) { shp(Mh, H.behind(), C.hair, { sw: 1.05 }); ln(Mh, [[0, -2.3], [.1, 0], [-.05, 2.2]], .8, C.hairHi); return; }
    const tall = C.hairStyle === 'pomp' ? .9 : C.hairStyle === 'bigcurls' ? .6 : ['swept', 'wavyUp', 'wavy'].includes(C.hairStyle) ? .5 : 0;
    const tight = C.hairStyle === 'dad' || C.hairStyle === 'short', P = capBack(C.hairStyle === 'bigcurls' ? 2.75 : tight ? C.rx + .1 : 2.52, tight ? .75 : 1.55).map(([x, y]) => [x, y < 0 ? y * (1 + tall * Math.max(0, -y) / 2.5 * .4) : y]);
    shp(Mh, P, C.hair, { sw: 1.05 });
    if (C.hairStyle === 'dad' && !C.greyAll) for (const s of [-1, 1]) shp(Mh, E(s * 2.2, -.1, .3, .55, 10), '#8C8782', { raw: true, ink: null, op: 220 });
    if (C.hairStyle === 'bigcurls') [[-1.2, -1.4], [.4, -2.1], [1.4, -.8], [-.3, -.1]].forEach(([x, y], i) => spiral(Mh, C, x, y, i));
    else ln(Mh, [[-1.2, -1.6], [0, -2.0], [1.2, -1.6]], 1.0, C.hairHi);
  }
  function hairTinyPts(C, back) {
    if (C.hairStyle === 'curls' || !C.hairStyle) return back ? [...curlCloud(), [2.3, .7], [0, 1.5], [-2.3, .7]] : [...curlCloud(), [2.4, .2], [1.8, -.9], [0, -1.0], [-1.8, -.9], [-2.4, .2]];
    const H = HAIR[C.hairStyle] || HAIR.neat;
    if (back) return H.behind ? H.behind() : capBack(2.5, 1.4);
    return H.main();
  }
  const LONG_BACK = [[-2.48, .1], [-2.42, -1.2], [-1.7, -2.15], [0, -2.5], [1.7, -2.15], [2.42, -1.2], [2.48, .1], [2.62, 1.8], [2.45, 3.6], [2.2, 4.8], [1.85, 5.2], [1.5, 4.95], [1.0, 5.3], [.45, 5.05], [0, 5.25], [-.45, 5.05], [-1.0, 5.3], [-1.5, 4.95], [-1.85, 5.2], [-2.2, 4.8], [-2.45, 3.6], [-2.62, 1.8]];
  function longCap(M, C) {
    const top = [];
    for (let i = 0; i <= 12; i++) { const a = Math.PI * 1.03 + i / 12 * Math.PI * .94; top.push([Math.cos(a) * 2.42, Math.sin(a) * 2.45 - .02]); }
    shp(M, [...top, [2.36, .35], [2.1, .55], [1.95, -.2], [1.55, -.95], [.85, -1.35], [.12, -1.62], [-.05, -1.45], [-.7, -1.3], [-1.45, -.95], [-1.95, -.2], [-2.1, .55], [-2.36, .35]], C.hair, { sw: 1.05 });
    ln(M, [[-1.55, -1.55], [-1.1, -1.9], [-.55, -2.08]], 1.6, C.hairHi); ln(M, [[.55, -2.08], [1.1, -1.9], [1.5, -1.6]], 1.6, C.hairHi); ln(M, [[-.2, -2.15], [.15, -2.17]], 1.6, C.hairHi);
  }
  function longStrand(M, C, s) {
    const p = [[1.92, -.4], [2.02, .7], [1.86, 1.7], [1.42, 2.65], [1.22, 3.7], [1.32, 4.55], [1.6, 4.15], [1.98, 4.45], [2.2, 3.4], [2.58, 2.2], [2.66, .8], [2.48, -.5]];
    shp(M, s < 0 ? mirror(p) : p, C.hair, { sw: 1.0 });
    ln(M, [[s * 2.2, .9], [s * 2.05, 2.1], [s * 1.7, 3.3]], .8, C.hairHi);
  }

  // ---------- held props (local units, origin = hand centre) ----------
  function prop(M, kind, o) {
    switch (kind) {
      case 'phone': case 'phoneback': {
        const back = kind === 'phoneback';
        if (!back) shp(M, E(0, -.15, 1.35, 1.25, 14), '#CFEFFF', { ink: null, raw: true, op: 70 });
        shp(M, rrPts(-.44, -.8, .88, 1.55, .17), back ? (o.phoneCol || '#2B2531') : '#211D27', { raw: true, sw: .9 });
        if (!back) shp(M, rrPts(-.34, -.68, .68, 1.28, .1), '#BFE6FF', { raw: true, ink: null });
        else { shp(M, E(-.18, -.55, .13, .13, 8), '#5C5566', { raw: true, ink: null }); }
        break;
      }
      case 'flowers': {
        shp(M, [[-.2, -1.3], [-1.0, -1.85], [-.75, -1.2]], PAL.sage, { sw: .7 }); shp(M, [[.2, -1.3], [1.0, -1.8], [.75, -1.15]], PAL.sage, { sw: .7 });
        const B = [[-.55, -1.55, PAL.hot], [.55, -1.6, PAL.coral], [0, -1.95, PAL.butter], [-.3, -1.25, '#FFFFFF'], [.32, -1.22, PAL.lilac]];
        for (const [x, y, c] of B) { shp(M, E(x, y, .34, .32, 10), c, { raw: true, sw: .8 }); shp(M, E(x, y, .1, .1, 6), PAL.ochre, { raw: true, ink: null }); }
        shp(M, [[-.8, -1.15], [.8, -1.15], [.12, .95], [-.12, .95]], '#F4C3CF', { sw: .9 });
        shp(M, [[-.32, -.15], [0, -.02], [.32, -.18], [.3, .12], [0, .02], [-.3, .12]], PAL.hot, { sw: .7 });
        break;
      }
      case 'boba':
        ln(M, [[.1, -1.0], [.2, -1.45], [.32, -1.95]], 3.2, PAL.hot);
        shp(M, [[-.46, -1.0], [.46, -1.0], [.37, .72], [-.37, .72]], '#E9D0AE', { sw: .9 });
        for (let i = 0; i < 5; i++) shp(M, E(-.26 + i * .13, .5 - (i % 2) * .12, .09, .09, 6), '#3A2A2C', { raw: true, ink: null });
        shp(M, E(0, -1.0, .5, .13, 12), '#FFFFFF', { raw: true, sw: .8 });
        shp(M, E(-.14, -.45, .045, .06, 6), EYE, { raw: true, ink: null }); shp(M, E(.14, -.45, .045, .06, 6), EYE, { raw: true, ink: null });
        ln(M, [[-.08, -.32], [0, -.27], [.08, -.32]], .7);
        break;
      case 'icecream':
        shp(M, [[-.42, -.45], [.42, -.45], [0, .95]], '#E3A85E', { sw: .9, raw: true });
        ln(M, [[-.22, -.3], [.12, .4]], .6, '#B07A3A'); ln(M, [[.22, -.3], [-.12, .4]], .6, '#B07A3A');
        shp(M, [[-.58, -.55], [-.5, -1.05], [0, -1.32], [.5, -1.05], [.58, -.55], [.3, -.42], [.18, -.25], [0, -.45], [-.3, -.45]], '#F7B2C8', { sw: .9 });
        ln(M, [[-.2, -.95], [-.1, -.88]], 1, PAL.teal); ln(M, [[.2, -1.05], [.28, -.96]], 1, PAL.butter); ln(M, [[.05, -.75], [.12, -.68]], 1, PAL.violet);
        break;
      case 'bowlingball':
        shp(M, E(0, 0, .82, .82, 18), o.ballCol || '#E2477A', { raw: true, sw: 1 });
        [[-.18, -.3], [.12, -.36], [-.02, -.06]].forEach(([x, y]) => shp(M, E(x, y, .09, .1, 6), EYE, { raw: true, ink: null }));
        ln(M, [[-.55, .25], [-.45, .5], [-.2, .62]], 1, '#FFFFFF');
        break;
      case 'golfclub':
        ln(M, [[0, .2], [.15, 1.9], [.3, 3.55]], 1.5, '#AEB3C0');
        ln(M, [[0, -.45], [.02, .1], [.04, .6]], 3.2, '#2B2531');
        shp(M, [[.12, 3.42], [.8, 3.48], [.88, 3.78], [.18, 3.86]], '#C9CDD6', { sw: .9 });
        break;
      case 'briefcase':
        ln(M, [[-.45, .25], [-.42, -.2], [0, -.32], [.42, -.2], [.45, .25]], 2.2, '#1E1C22');
        shp(M, rrPts(-1.55, .2, 3.1, 2.15, .3), '#1E1C22', { raw: true, sw: 1 });
        ln(M, [[-1.5, .62], [0, .65], [1.5, .62]], .8, '#3A3840');
        for (const s of [-1, 1]) shp(M, rrPts(s * .95 - .2, .42, .4, .3, .06), '#C9CCD2', { raw: true, sw: .7 });
        ln(M, [[-1.2, 2.1], [1.2, 2.1]], .7, '#3A3840');
        break;
      case 'briefcaseOpen': {
        shp(M, rrPts(-1.6, .2, 3.2, 1.6, .25), '#1E1C22', { raw: true, sw: 1 });
        shp(M, [[-1.6, .25], [1.6, .25], [1.4, -2.0], [-1.4, -2.0]], '#26242B', { sw: 1, raw: true });
        // lid holds a generic circuit board: two chips, traces and a blinking LED
        shp(M, rrPts(-1.15, -1.8, 2.3, 1.25, .1), '#2E6B4A', { raw: true, sw: .8 });
        for (const [cx, w] of [[-.55, .55], [.35, .4]]) { shp(M, rrPts(cx - w / 2, -1.5, w, .45, .04), '#1E1C22', { raw: true, sw: .5 }); for (let i = 0; i < 3; i++) { const x = cx - w / 2 + (i + .5) * w / 3; ln(M, [[x, -1.5], [x, -1.62]], .5, '#C9CCD2'); ln(M, [[x, -1.05], [x, -.93]], .5, '#C9CCD2'); } }
        ln(M, [[-1.0, -.75], [-.2, -.75], [.1, -1.0], [.85, -1.0]], .6, '#D9B25A');
        const tt = o.t || 0; shp(M, E(.85, -1.55, .1, .1, 8), Math.floor(tt * 3) % 2 ? '#E0344A' : '#7A2A30', { raw: true, sw: .5 });
        [['#3E9C97', -1.3], ['#F2876A', -.2], ['#F7D774', .8]].forEach(([c, x0], i) => ln(M, [[x0, .5], [x0 + .4, 1.1 - i * .1], [x0 + .1, 1.55], [x0 + .6, 1.3]], 1.4, c));
        for (const s of [-1, 1]) shp(M, rrPts(s * .95 - .2, .32, .4, .26, .06), '#C9CCD2', { raw: true, sw: .7 });
        break;
      }
      case 'plaque':
        shp(M, rrPts(-.95, -1.55, 1.9, 2.4, .18), '#6E4A32', { raw: true, sw: 1 });
        shp(M, rrPts(-.68, -1.25, 1.36, 1.8, .08), '#D9B25A', { raw: true, sw: .7 });
        stext(M, '1ST', 0, -.6, .55, '#6E4A32', 1.1);
        ln(M, [[-.45, .05], [.45, .05]], .6, '#8A6A3A'); ln(M, [[-.35, .3], [.35, .3]], .6, '#8A6A3A');
        break;
      case 'certificate':
        shp(M, rrPts(-1.15, -1.5, 2.3, 1.7, .05), '#FBF7EF', { raw: true, sw: .9 });
        shp(M, rrPts(-1.0, -1.38, 2.0, 1.46, .04), '#FBF7EF', { raw: true, ink: '#D9B25A', sw: .6 });
        for (let i = 0; i < 3; i++) ln(M, [[-.7, -1.05 + i * .3], [.7, -1.05 + i * .3]], .5, '#9A9AA4');
        shp(M, starPts(.62, -.1, .3, .7, 10), '#D9B25A', { raw: true, sw: .6 });
        break;
      case 'cake': {
        const txt = o.cakeText ?? 'HBD';
        shp(M, E(0, .55, 1.9, .38, 20), '#F4F1EA', { raw: true, sw: .9 });
        shp(M, [[-1.5, -1.0], [1.5, -1.0], [1.5, .45], [-1.5, .45]], '#F7E7C9', { sw: 1 });
        shp(M, E(0, -1.0, 1.5, .4, 20), '#FBF4E6', { raw: true, sw: .9 });
        const drip = []; for (let i = 0; i <= 10; i++) { const x = -1.5 + i * .3; drip.push([x, -.95 + (i % 2 ? .38 : .12)]); }
        shp(M, [[-1.52, -1.1], [1.52, -1.1], ...drip.reverse()], '#F3A7B5', { ink: null });
        [[-.9, '#E0344A'], [-.2, '#E0344A'], [.6, '#E0344A'], [1.1, '#86AE7A']].forEach(([x, c]) => shp(M, E(x, -1.08, .16, .14, 8), c, { raw: true, sw: .6 }));
        ln(M, [[.15, -1.15], [.15, -2.05]], 2.0, '#F4F1EA'); shp(M, [[.15, -2.55], [.32, -2.15], [.15, -2.0], [-.02, -2.15]], PAL.ochre, { ink: null, raw: true });
        if (txt) stext(M, txt, 0, -.25, .62, '#D9447A', 1.6, .62, 2.6);
        break;
      }
      case 'megaphone':
        shp(M, [[.1, -.3], [1.9, -.95], [2.05, 0], [1.9, .95], [.1, .3]], PAL.butter, { sw: 1, raw: true });
        shp(M, E(1.98, 0, .22, .95, 14), '#F4F1EA', { raw: true, sw: .9 });
        shp(M, rrPts(-.35, -.3, .5, .6, .1), '#2B2531', { raw: true, sw: .8 });
        ln(M, [[.7, -.48], [.75, .48]], .8, '#E9AE3C');
        break;
      case 'form': case 'lease': {   // a generic signed form ('lease' is an older alias; o.leaseStrike = o.strike)
        shp(M, [[-1.1, -2.2], [1.1, -2.2], [1.15, .4], [-1.05, .45]], '#FBF7EF', { sw: .9 });
        stext(M, o.formText ?? 'FORM', 0, -1.85, .32, PAL.ink, .9);
        for (let i = 0; i < 6; i++) ln(M, [[-.85, -1.4 + i * .3], [.6 + (i % 3) * .1, -1.4 + i * .3]], .5, '#9A9AA4');
        const st = clamp(o.strike ?? o.leaseStrike ?? 0); if (st > 0) ln(M, [[-.95, -.55], [lerp(-.95, .95, st), -.62]], 2.4, '#E0344A');
        break;
      }
      case 'takeout':   // plain kraft takeout bag: folded top, a hand-drawn star sticker — no logo
        shp(M, [[-.95, -.1], [.95, -.1], [1.1, 2.2], [-1.1, 2.2]], '#D9B98A', { sw: 1 });
        shp(M, [[-.95, -.1], [.95, -.1], [.9, -.45], [-.9, -.45]], '#C9A577', { sw: .7, raw: true });
        shp(M, starPts(0, 1.05, .42, .5, 5), PAL.coral, { raw: true, sw: .6 });
        break;
      case 'keys':
        shp(M, E(0, .45, .32, .32, 12), null, { raw: true, sw: 1.1, ink: '#C9CCD2' });
        ln(M, [[.1, .7], [.25, 1.4]], 1.6, '#C9CCD2'); ln(M, [[-.1, .72], [-.45, 1.3]], 1.6, '#D9B25A');
        shp(M, rrPts(-.35, .55, .7, .45, .15), '#2B2531', { raw: true, sw: .7 });
        break;
      case 'laptop':
        shp(M, E(0, -1.2, 2.2, 1.4, 16), '#CFEFFF', { ink: null, raw: true, op: 55 });
        shp(M, [[-1.7, -2.3], [1.7, -2.3], [1.75, .0], [-1.75, .0]], '#C9CCD2', { sw: 1, raw: true });
        shp(M, [[-2.0, 0], [2.0, 0], [2.2, .35], [-2.2, .35]], '#AEB3C0', { sw: .9, raw: true });
        shp(M, E(0, -1.15, .28, .3, 10), '#F4F2EE', { raw: true, ink: null, op: 200 });
        shp(M, rrPts(.7, -2.0, .55, .4, .08), PAL.hot, { raw: true, sw: .6 });
        break;
      case 'football':
        shp(M, E(0, 0, .95, .58, 16, -.4), '#7A4A2E', { raw: true, sw: 1 });
        ln(chain(M, mR(-.4)), [[-.45, 0], [.45, 0]], 1, '#F4F1EA'); for (let i = -1; i <= 1; i++) ln(chain(M, mR(-.4)), [[i * .2, -.12], [i * .2, .12]], .8, '#F4F1EA');
        break;
      case 'basketball':
        shp(M, E(0, -.2, .82, .82, 16), '#E07A32', { raw: true, sw: 1 });
        ln(M, [[-.82, -.2], [.82, -.2]], .8); ln(M, [[0, -1.02], [0, .62]], .8); ln(M, [[-.55, -.8], [-.3, -.2], [-.55, .4]], .8); ln(M, [[.55, -.8], [.3, -.2], [.55, .4]], .8);
        break;
      case 'ladle':
        ln(M, [[0, .3], [.05, -1.2], [.25, -2.2]], 1.8, '#C9CCD2');
        shp(M, E(.35, -2.55, .55, .4, 12), '#C9CCD2', { raw: true, sw: .9 });
        break;
      case 'partyhorn':
        shp(M, [[0, -.18], [1.6, -.1], [1.6, .1], [0, .18]], PAL.hot, { sw: .8, raw: true });
        for (let i = 1; i < 4; i++) ln(M, [[i * .4, -.14], [i * .4 + .1, .14]], .8, PAL.butter);
        shp(M, E(1.85, -.05, .3, .26, 10), PAL.butter, { raw: true, sw: .7 });
        break;
      case 'mic':
        ln(M, [[0, .3], [0, -.6]], 2.4, '#2B2531');
        shp(M, E(0, -1.0, .38, .42, 12), '#9A9AA4', { raw: true, sw: .9 }); ln(M, [[-.3, -1.0], [.3, -1.0]], .6, '#5C5862');
        break;
      case 'toycar':
        shp(M, [[-1.4, -.2], [-1.2, -.5], [-.4, -.55], [0, -.95], [.7, -.95], [1.1, -.5], [1.5, -.4], [1.55, .05], [-1.45, .05]], '#D0262E', { sw: .9 });
        shp(M, [[.05, -.85], [.6, -.85], [.9, -.52], [.05, -.52]], '#BFE6FF', { sw: .6, raw: true });
        for (const x of [-.8, .95]) shp(M, E(x, .1, .3, .3, 10), '#1E1C22', { raw: true, sw: .7 });
        shp(M, E(1.45, -.2, .08, .06, 6), PAL.butter, { raw: true, ink: null });
        break;
      case 'sticks':
        ln(M, [[0, .3], [.3, -1.2], [.55, -2.3]], 1.4, '#E9D7A6'); shp(M, E(.57, -2.4, .12, .14, 8), '#E9D7A6', { raw: true, sw: .6 });
        break;
      case 'sign': {
        ln(M, [[0, .2], [0, -.9]], 2.4, '#B98A5A');
        shp(M, [[-2.1, -3.0], [2.1, -3.0], [2.2, -.8], [-2.05, -.85]], '#E9D7A6', { sw: 1 });
        const lines = String(o.signText ?? 'HOORAY').split('\n');
        lines.forEach((l, i) => stext(M, l, 0, -1.9 + (i - (lines.length - 1) / 2) * .75, Math.min(.6, 3.4 / Math.max(1, l.length * .9)), o.signCol || PAL.hot, 1.2));
        break;
      }
      case 'trifold':
        shp(M, [[-2.6, -2.4], [-1.0, -2.6], [-1.0, .2], [-2.6, .05]], '#F4F1EA', { sw: .9, raw: true });
        shp(M, [[-1.0, -2.6], [1.0, -2.6], [1.0, .2], [-1.0, .2]], '#F4F1EA', { sw: .9, raw: true });
        shp(M, [[1.0, -2.6], [2.6, -2.4], [2.6, .05], [1.0, .2]], '#F4F1EA', { sw: .9, raw: true });
        [[-2.3, -2.1, '#2F55B5'], [-.75, -2.3, '#2F55B5'], [1.25, -2.1, '#F7D774'], [-2.3, -1.0, '#F7D774'], [-.75, -1.2, '#F7D774'], [1.25, -1.0, '#2F55B5']].forEach(([x, y, c]) => shp(M, rrPts(x, y, 1.15 + (x > -1 && x < 1 ? .35 : 0), .8, .05), c, { raw: true, ink: null, op: 200 }));
        break;
    }
  }

  // ---------- emotes ----------
  function emote(Mu, kind, k, o, U) {
    if (!kind || k <= .01) return;
    const t = o.t || 0, B = chain(Mu, mT(2.55, -12.3), mS(clamp(k, 0, 1.4)));
    const at = p => ap(B, p);
    switch (kind) {
      case 'heart': { const b = 1 + .1 * Math.sin(t * 13); shp(chain(B, mS(b)), heartPts(0, 0, .85, 28), PAL.hot, { raw: true, sw: 1 }); shp(B, heartPts(1.0, .9, .38, 20), PAL.rose, { raw: true, sw: .8 }); shp(B, E(-.35, -.35, .14, .1, 8), WHITE, { raw: true, ink: null }); break; }
      case 'sweat': { const S = chain(Mu, mT(2.35, -10.9 + (t * .8 % .6)), mS(clamp(k))); shp(S, [[0, -.6], [.34, .08], [.24, .38], [0, .46], [-.24, .38], [-.34, .08]], '#A6D8F2', { ink: '#4D86B5', sw: .9 }); break; }
      case '!': case '?': case '!?': case 'zzz': {
        const [x, y] = at([0, .1]);
        letter(kind, x, y + (kind === 'zzz' ? -Math.sin(t * 2) * U * .3 : 0), U * (kind === 'zzz' ? 1.5 : 2.3), kind === 'zzz' ? PAL.lilac : PAL.hot, { font: 'marker', pop: k, rot: -.12 + (kind === 'zzz' ? .2 : 0), shadow: PAL.ink });
        break;
      }
      case 'music': {
        const f = chain(B, mT(-.2, -((t * .9) % 1) * .6));
        shp(f, E(-.45, .55, .26, .19, 10, -.4), EYE, { raw: true, ink: null }); shp(f, E(.5, .3, .26, .19, 10, -.4), EYE, { raw: true, ink: null });
        ln(f, [[-.22, .5], [-.21, -.2], [-.2, -.9]], 1.4); ln(f, [[.73, .25], [.74, -.4], [.75, -1.15]], 1.4); ln(f, [[-.2, -.9], [.3, -1.05], [.75, -1.15]], 2.4);
        break;
      }
      case 'sparkle': [[0, 0, .7], [1.0, .9, .4], [-.8, 1.0, .32]].forEach(([x, y, r], i) => shp(B, starPts(x, y, r * (1 + .15 * Math.sin(t * 9 + i * 2)), .3, 4), PAL.butter, { raw: true, sw: .8 })); break;
      case 'anger': { const A = chain(Mu, mT(1.9, -11.6), mS(clamp(k, 0, 1.3) * (1 + .12 * Math.sin(t * 16)))), c = '#E0344A';
        ln(A, [[-.5, -.15], [-.18, -.18], [-.15, -.5]], 2.2, c); ln(A, [[.5, -.15], [.18, -.18], [.15, -.5]], 2.2, c); ln(A, [[-.5, .15], [-.18, .18], [-.15, .5]], 2.2, c); ln(A, [[.5, .15], [.18, .18], [.15, .5]], 2.2, c); break; }
      case 'steam': for (let i = 0; i < 3; i++) { const ph = (t * .9 + i / 3) % 1, x = -1.4 + i * 1.4 - 2.55, y = -.3 - ph * 1.6; shp(chain(Mu, mT(2.55, -12.3), mS(clamp(k))), E(x, y, .45 * (1 - ph * .4), .36 * (1 - ph * .4), 10), '#FFFFFF', { raw: true, sw: .8, op: 255 * (1 - ph * .7) }); } break;
    }
  }

  // ---------- arms ----------
  function armPts(C, F, s, o, Mu, ang, el, tgt) {
    const S = [s * (C.shX - .18 + (F.big ? .2 : 0) + (F.pads ? .32 : 0)), -7.1];
    let l1 = C.l1, l2 = C.l2, Eb, Wr;
    if (tgt) {
      const d = V.sub(tgt, S), dist = V.len(d) || 1e-3;
      const maxL = (l1 + l2) * .995; if (dist > maxL) { const k = dist / maxL; l1 *= k; l2 *= k; }
      const base = Math.atan2(d[1], d[0]), A = Math.acos(clamp((l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist), -1, 1));
      const c1 = V.add(S, [Math.cos(base + A) * l1, Math.sin(base + A) * l1]), c2 = V.add(S, [Math.cos(base - A) * l1, Math.sin(base - A) * l1]);
      const sc = p => .55 * p[1] + s * p[0];   // prefer elbows out & down
      Eb = (sc(c1) > sc(c2)) !== !!o.elbowUp ? c1 : c2; Wr = tgt;
    } else {
      Eb = V.add(S, [s * Math.cos(ang) * l1, -Math.sin(ang) * l1]);
      Wr = V.add(Eb, [s * Math.cos(ang + el) * l2, -Math.sin(ang + el) * l2]);
    }
    const dir = V.mul(V.sub(Wr, Eb), 1 / (V.len(V.sub(Wr, Eb)) || 1));
    return { S, Eb, Wr, dir, H: tgt ? Wr : V.add(Wr, V.mul(dir, .18)) };
  }
  function teeSleeve(Mu, A, s, F, col, trim) {
    const d = V.sub(A.Eb, A.S), L = V.len(d) || 1, a = V.mul(d, 1 / L), nrm = [-a[1], a[0]], P1 = V.add(A.S, V.mul(a, L * .52));
    // nrm points to one side; choose the side that is 'up/outward' for the shoulder top
    const up = (nrm[1] < 0) ? nrm : V.mul(nrm, -1), dn = V.mul(up, -1), w = F.pads ? 1.25 : 1;
    shp(Mu, [V.add(A.S, V.add(V.mul(up, .5 * w), V.mul(a, -.35))), V.add(P1, V.mul(up, .56 * w)), V.add(P1, V.mul(dn, .56 * w)), V.add(A.S, V.add(V.mul(dn, .42 * w), V.mul(a, .1)))], col, { sub: 2 });
    ln(Mu, [V.add(P1, V.add(V.mul(up, .5 * w), V.mul(a, -.14))), V.add(P1, V.mul(a, -.1)), V.add(P1, V.add(V.mul(dn, .5 * w), V.mul(a, -.14)))], F.jersey ? 1.6 : .7, trim);
  }
  function drawArm(Mu, C, F, A, s, o, hold, point) {
    const sk = C.skin, aw = C.armW || 1, r = C.hand * Math.sqrt(aw);
    const sl = (s < 0 ? F.sleeveL : F.sleeveR) || F.sleeve, sc = F.sleeveCol || F.jacket || F.top, trim = F.jacket ? PAL.ink : F.trim;
    if (sl === 'short') {
      limb(Mu, [V.lerp(A.S, A.Eb, .3), A.Eb, A.Wr], .44 * aw, .36 * aw, sk);
      teeSleeve(Mu, A, s, F, sc, F.jacket ? sc : trim);
      if (F.bandaid && s > 0) { const c = V.lerp(A.S, A.Eb, .74); shp(Mu, E(c[0], c[1], .26, .2, 10), '#E9C9A8', { raw: true, sw: .6 }); }
    } else if (sl === 'none') {
      limb(Mu, [A.S, A.Eb, A.Wr], .46 * aw, .36 * aw, sk);
      if (F.jersey) ln(Mu, [V.add(A.S, [-s * .1, -.45]), V.add(A.S, [s * .3, .1]), V.add(A.S, [s * .05, .55])], 1.6, F.trim);
    } else if (sl === 'rolled') {
      limb(Mu, [A.Eb, A.Wr], .38 * aw, .35 * aw, sk);
      limb(Mu, [A.S, V.lerp(A.S, A.Eb, 1.06)], .52 * aw, .48 * aw, sc);
      ln(Mu, [V.add(A.Eb, [-A.dir[1] * .5, A.dir[0] * .5]), V.add(A.Eb, [A.dir[1] * .5, -A.dir[0] * .5])], 1.8, F.trim);
    } else if (sl === 'puff') {
      limb(Mu, [A.S, A.Eb, A.Wr], .6, .5, F.top);
      shp(Mu, E(A.Wr[0], A.Wr[1], .38, .38, 10), F.trim, { raw: true, sw: .8 });
    } else if (sl === 'paws') {
      // sleeve first, then the peeking hand, then the held prop — otherwise the sleeve hides the hand and the phone
      limb(Mu, [A.S, A.Eb, V.add(A.Wr, V.mul(A.dir, .2))], .56, .5, sc);
      ln(Mu, [V.add(A.Wr, [-A.dir[1] * .45, A.dir[0] * .45]), V.add(A.Wr, [A.dir[1] * .45, -A.dir[0] * .45])], .7, F.jacket ? '#1A2040' : F.trim);
      shp(Mu, E(A.H[0] + A.dir[0] * .12, A.H[1] + A.dir[1] * .12, r * .8, r * .75, 10), sk, { raw: true, sw: .85 });
      if (hold) prop(chain(Mu, mT(...A.H), mR(o['holdRot' + (s < 0 ? 'L' : 'R')] || 0)), hold, o);
      if (point) limb(Mu, [A.H, V.add(A.H, V.mul(A.dir, .62))], .13, .12, sk, { sw: .8 });
      return;
    } else if (sl === 'wide') {
      limb(Mu, [A.S, A.Eb, A.Wr], .56, .66, sc);
      ln(Mu, [V.add(A.Wr, [-A.dir[1] * .62, A.dir[0] * .62]), V.add(A.Wr, [A.dir[1] * .62, -A.dir[0] * .62])], .8, F.trim);
    } else {
      const puffy = F.puffer ? 1.18 : 1;
      limb(Mu, [A.S, A.Eb, A.Wr], .5 * aw * puffy, .41 * aw * puffy, sc);
      if (F.puffer) for (const c of [V.lerp(A.S, A.Eb, .5), V.lerp(A.Eb, A.Wr, .5)]) ln(Mu, [V.add(c, [-A.dir[1] * .5, A.dir[0] * .5]), V.add(c, [A.dir[1] * .5, -A.dir[0] * .5])], .6, '#3A3A44');
      ln(Mu, [V.add(A.Wr, [-A.dir[1] * .4, A.dir[0] * .4]), V.add(A.Wr, [A.dir[1] * .4, -A.dir[0] * .4])], .8, F.jacket ? PAL.ink : F.trim);
    }
    if (hold) prop(chain(Mu, mT(...A.H), mR(o['holdRot' + (s < 0 ? 'L' : 'R')] || 0)), hold, o);
    if (point) limb(Mu, [A.H, V.add(A.H, V.mul(A.dir, .62))], .13, .12, sk, { sw: .8 });
    shp(Mu, E(A.H[0], A.H[1], r, r * .94, 12), sk, { raw: true, sw: .9 });
  }

  // ---------- legs ----------
  function legGeo(C, s, lift, o, sit) {
    const H = [s * C.hipX, -4.25];
    if (sit) {
      const Kn = [s * (C.hipX + .12), -3.85], sh = 2.1 * (1 - lift * .55);
      return { H, Kn, A: [s * (C.hipX + .2 + lift * .15), Kn[1] + sh], lift: 0 };
    }
    const A = [s * (C.hipX + .1 + (o.stance || 0) * .5), -.42 - lift * 1.45];
    const Kn = [(H[0] + A[0]) / 2 + s * (.06 + lift * .55), (H[1] + A[1]) / 2 - lift * .35];
    return { H, Kn, A, lift };
  }
  function legPattern(M, F, G, s, w) {
    if (!F.pantsPat) return;
    const top = F.shorts ? [G.H, V.lerp(G.H, G.Kn, 1.05)] : [G.H, G.Kn, G.A];
    const at = f => { if (top.length === 2) return V.lerp(top[0], top[1], f); return f < .5 ? V.lerp(top[0], top[1], f * 2) : V.lerp(top[1], top[2], f * 2 - 1); };
    const c = F.pantsPatCol;
    if (F.pantsPat === 'plaid') {
      const n = F.shorts ? 2 : 4;
      for (let i = 1; i <= n; i++) { const p = at(i / (n + .6)); ln(M, [[p[0] - .55 * w, p[1]], [p[0] + .55 * w, p[1] + .04]], 1.1, c); }
      const a = at(.05), b = at(F.shorts ? .92 : .9); ln(M, [[a[0] + s * .12, a[1]], [b[0] + s * .1, b[1]]], .9, c);
    } else {
      const n = F.shorts ? 3 : 5;
      for (let i = 0; i < n; i++) { const p = at((i + .6) / (n + .4)); shp(M, E(p[0] + (i % 2 ? .22 : -.22) * w, p[1], .13, .13, 8), c, { raw: true, ink: null }); if (F.pantsPat === 'flowers') shp(M, E(p[0] + (i % 2 ? .22 : -.22) * w, p[1], .05, .05, 6), PAL.butter, { raw: true, ink: null }); }
    }
  }
  function drawLeg(M, C, F, G, s, toe, legCol, shin) {
    const w = C.legW || 1;
    if (legCol) {
      if (F.shorts && legCol !== C.skin) {
        limb(M, [G.H, G.Kn, G.A], .5 * w, .4 * w, C.skin);
        limb(M, [G.H, V.lerp(G.H, G.Kn, 1.12)], .72 * w, .7 * w, legCol);
      } else limb(M, [G.H, G.Kn, G.A], .62 * w, .48 * w, legCol);
      if (!shin) legPattern(M, F, G, s, w);
      if (F.cargo && !shin) { const p = V.lerp(G.H, G.Kn, .8); shp(M, rrPts(p[0] + s * .18 - .3, p[1] - .35, .6, .7, .1), legCol, { raw: true, sw: .7 }); ln(M, [[p[0] + s * .18 - .3, p[1] - .2], [p[0] + s * .18 + .3, p[1] - .2]], .6); }
    }
    if (F.bootR && s === (F.bootSide === 'l' ? -1 : 1)) boot(M, G, s, toe); else shoe(M, F, G.A, s, toe, C);
  }
  function boot(M, G, s, toe) {
    const A = G.A, top = V.lerp(G.Kn, A, .18), Ms = chain(M, mT(A[0] + s * .1, A[1] + .3), mR(s * (toe || 0)));
    limb(M, [top, V.lerp(top, A, .95)], .66, .74, '#26242B');
    shp(Ms, [[-.75, -.05], [-.72, -.75], [.25, -.72], [.95, -.4], [1.15, -.05]].map(([x, y]) => [x * s, y]), '#26242B', { sw: 1 });
    shp(Ms, [[-.82, -.1], [1.2, -.1], [1.15, .2], [-.78, .22]].map(([x, y]) => [x * s, y]), '#4A4652', { sw: .9, raw: true });
    for (const f of [.15, .45, .75]) { const p = V.lerp(top, A, f); ln(M, [[p[0] - .66, p[1]], [p[0] + .66, p[1] + .04]], 1.7, '#7A7682'); }
    ln(Ms, [[s * .1, -.62], [s * .75, -.38]], 1.5, '#7A7682');
  }
  function shoe(M, F, A, s, toe, C) {
    const Ms = chain(M, mT(A[0] + s * .14, A[1] + .17), mR(s * (toe || 0)));
    if (F.bare) {
      shp(Ms, [[-.5, .24], [-.48, -.22], [-.05, -.32], [.5, -.2], [.72, .06], [.6, .26]].map(([x, y]) => [x * s, y]), C ? C.skin : SKIN_ME, { sw: .8 });
      for (let i = 0; i < 3; i++) ln(Ms, [[s * (.3 + i * .14), .02], [s * (.33 + i * .14), .2]], .5, C ? C.skinSh : PAL.ink);
      return;
    }
    if (F.sock) { shp(Ms, [[-.55, .24], [-.56, -.4], [-.1, -.44], [.45, -.24], [.72, .04], [.62, .26]].map(([x, y]) => [x * s, y]), SOCK, { sw: .85 }); ln(Ms, [[-.5 * s, -.3], [0, -.33]], .6, '#D9D3C6'); return; }
    if (F.heels) {
      shp(Ms, [[-.42, .1], [-.38, -.24], [.0, -.3], [.55, -.06], [.72, .2], [.3, .24], [-.1, .02]].map(([x, y]) => [x * s, y]), F.heels, { sw: .8 });
      ln(Ms, [[-.38 * s, .08], [-.36 * s, .4]], 1.6, F.heels); return;
    }
    shp(Ms, [[-.66, .26], [-.62, -.2], [-.15, -.4], [.5, -.26], [.84, .06], [.74, .28]].map(([x, y]) => [x * s, y]), F.shoes, { sw: .9 });
    if (F.hightop) shp(Ms, [[-.62, -.15], [-.6, -.75], [.1, -.75], [.15, -.3]].map(([x, y]) => [x * s, y]), F.shoes, { sw: .8 });
    if (F.shoeTrim) ln(Ms, [[-.45 * s, -.18], [.1 * s, -.1], [.55 * s, .05]], 1.2, F.shoeTrim);
    ln(Ms, [[-.6 * s, .14], [0, .17], [.68 * s, .14]], .7, F.cleats ? '#5C5862' : F.shoes === SHOE ? '#C9C2B6' : PAL.ink);
  }

  // ---------- torso ----------
  function torsoPts(C, F, hem) {
    const s = C.shX, b = (F.big ? .32 : 0) + (F.pads ? .2 : 0) + (F.puffer ? .12 : 0), bl = C.belly || 0;
    return sym([[.62, -7.72], [s - .28 + b * .5, -7.56], [s + b * .6, -7.16], [s - .1 + b, -6.35], [s - .26 + b + bl * .55, -5.3], [s - .2 + b * 1.15 + bl * .7, hem + .1], [.01, hem - .06]]).concat([[0, -7.45]]);
  }
  // one jacket panel (s = side), inner edge at x = gap, with a V-opening from the neck down to vY
  function panelPts(C, F, hem, s, gap, vY, drop) {
    const sx = C.shX, b = (F.big ? .32 : 0) + (F.puffer ? .12 : 0), bl = C.belly || 0;
    const P = [[.62, -7.74], [sx - .26 + b * .5, -7.58], [sx + .02 + b * .6, -7.16], [sx - .08 + b, -6.35], [sx - .22 + b + bl * .55, -5.3], [sx - .16 + b * 1.15 + bl * .75, hem + .1 + drop], [gap, hem + drop - .02], [gap, vY], [F.jacketType === 'blazer' ? .62 : .42, -7.55]];
    return P.map(([x, y]) => [x * s, y]);
  }

  // ---------- the character ----------
  const HIP = 3.65, LEGK = HIP / 4.25, UP = .6;
  function person(name, x, y, u, o = {}) {
    const C = resolveChar(name, o), F = outfitOf(name, o.outfit, C, o), U = u * C.k * (o.scale ?? 1);
    K = { u: U, sw: clamp(U * .07 / 4 * (o.line ?? 1), .28, 3.2), J: Math.min(U * .028, 3) * (o.boil ?? 1), ink: o.ink || PAL.ink };
    const fl = o.flip ? -1 : 1, t = o.t, back = !!o.back, sit = !!o.sit, legF = C.legF || 1, HIPc = HIP * legF;
    let aL = o.aL ?? -1.4, aR = o.aR ?? -1.4, eL = o.eL ?? .22, eR = o.eR ?? .22, legL = o.legL ?? 0, legR = o.legR ?? 0, dy = o.dy ?? 0, lean = o.lean ?? 0;
    if (o.walk != null) { const w = Math.sin(o.walk * Math.PI); legL = o.legL ?? Math.max(0, w) * .5; legR = o.legR ?? Math.max(0, -w) * .5; aL = o.aL ?? -1.3 + .32 * w; aR = o.aR ?? -1.3 - .32 * w; dy += .18 * Math.abs(w); }
    if (o.run != null) { const w = Math.sin(o.run * Math.PI); legL = o.legL ?? Math.max(0, w) * .95; legR = o.legR ?? Math.max(0, -w) * .95; aL = o.aL ?? -.75 + .55 * w; aR = o.aR ?? -.75 - .55 * w; eL = o.eL ?? 1.7; eR = o.eR ?? 1.7; dy += .5 * Math.abs(w); lean += o.lean == null ? .16 : 0; }
    const sq = (o.sq ?? 0) + (o.take ?? 0) + (t != null ? .012 * Math.sin(t * 2.2 + C.blink) : 0);
    let Mg = chain(mT(x, y - dy * U), mR(o.rot ?? 0), mS(fl * U * (1 + sq * .6) * (o.sx ?? 1), U * (1 - sq)));
    if (sit) Mg = mm(Mg, mT(0, HIPc));
    const Mb = mm(Mg, mS(1, LEGK * legF));                             // legs/skirts are designed hip=-4.25, squashed to HIP
    const Mu = chain(Mg, mT(0, -HIPc), mR(lean), mT(0, HIP), mT(0, UP)); // upper body designed 0.6u higher, shifted down
    const Mh = chain(Mu, mT(0, -7.75 + (o.nod ?? 0) * .45), mR(o.headTilt ?? 0), mS(C.hs || 1), mT(0, -2.15));
    const toLocal = w => w ? ap(inv(Mu), w) : null;
    const dz = h => h && [h[0], h[1] - UP];   // caller targets are true body units; arms live in the upper-body frame
    const tL = dz(o.handL) || toLocal(o.handLw), tR = dz(o.handR) || toLocal(o.handRw);
    const AL = armPts(C, F, -1, o, Mu, aL, eL, tL), AR = armPts(C, F, 1, o, Mu, aR, eR, tR);
    // eyes / face state
    let eyes = o.eyes || 'normal';
    if (t != null && o.blink !== false && ['normal', 'side', 'wide', 'heart', 'star', 'cry'].includes(eyes) && frac((t + C.blink) / 3.7) < .036) eyes = 'closed';
    const fo = { ...o, _skin: C.skin };
    const anchors = { head: ap(Mh, [0, 0]), top: ap(Mh, [0, -2.7]), mouth: ap(Mh, [0, 1.4]), chest: ap(Mu, [0, -6]), handL: ap(Mu, AL.H), handR: ap(Mu, AR.H), u: U };

    if (isPartner(name) && !back) {   // her long hair, behind everything
      shp(Mh, o.headOnly ? LONG_BACK.map(([x, y]) => [x, y > 0 ? y * .55 : y]) : LONG_BACK, C.hair, { sw: 1.05 });
      if (!o.headOnly) for (const s of [-1, 1]) ln(Mh, [[s * 2.3, 1.6], [s * 2.25, 3.2], [s * 2.0, 4.6]], .8, C.hairHi);
    } else if (!back) hairBehind(Mh, C, o.headOnly);
    if (!o.headOnly) {
      // 1. things behind the body
      if (F.cape && !back) { const w = Math.sin((t || 0) * 3) * .15; shp(Mu, [[-1.3, -7.6], [1.3, -7.6], [2.3 + w, -2.4], [1.4, -1.9], [0, -2.2 + w * .5], [-1.4, -1.9], [-2.3 - w, -2.4]], F.cape, { sw: 1 }); }
      if (o.armsBehind) { drawArm(Mu, C, F, AL, -1, o, null, false); drawArm(Mu, C, F, AR, 1, o, null, false); }
      // 2. legs
      const GL = legGeo(C, -1, legL, o, sit), GR = legGeo(C, 1, legR, o, sit), lw = C.legW || 1;
      const legCol = F.skirt === 'sailor' || F.dress ? C.skin : F.skirt === 'lehenga' ? null : F.pants;
      if (legCol && !sit && !F.dress) shp(Mb, [[-1.2, -4.9], [1.2, -4.9], [1.3, -3.8], [0, -3.5], [-1.3, -3.8]], F.pants || C.skin, { ink: null });
      if (sit && legCol) { limb(Mb, [GL.H, GL.Kn], .72 * lw, .66 * lw, legCol); limb(Mb, [GR.H, GR.Kn], .72 * lw, .66 * lw, legCol); }
      const legs = () => { if (sit) { drawLeg(Mb, C, F, { ...GL, H: GL.Kn, Kn: V.lerp(GL.Kn, GL.A, .5) }, -1, o.toeL, F.shorts ? C.skin : legCol, true); drawLeg(Mb, C, F, { ...GR, H: GR.Kn, Kn: V.lerp(GR.Kn, GR.A, .5) }, 1, o.toeR, F.shorts ? C.skin : legCol, true); } else { drawLeg(Mb, C, F, GL, -1, o.toeL, legCol); drawLeg(Mb, C, F, GR, 1, o.toeR, legCol); } };
      if (F.skirt !== 'lehenga' && !o.bust) legs();
      // 3. torso + outfit
      shp(Mu, [[-.42, -7.2], [.42, -7.2], [.4, -8.4], [-.4, -8.4]], C.skin, { raw: true, sw: .8 });
      const hem = F.crop ? -5.6 : F.big ? -3.15 : -4.0;
      if (F.crop) shp(Mu, torsoPts(C, F, -4.6), C.skin, { sw: .9 });
      if (F.skirt === 'lehenga' && !o.bust) lehenga(Mb, C, F, o, GL, GR, legL, legR);
      if (F.skirt === 'sailor') { shp(Mb, [[-1.42, -4.95], [1.42, -4.95], [1.95, -2.55], [0, -2.4], [-1.95, -2.55]], F.skirtCol, { sw: 1 }); [-.9, 0, .9].forEach(px => ln(Mb, [[px * .7, -4.7], [px * 1.05, -3.6], [px * 1.3, -2.6]], .7, '#4D5E99')); }
      shp(Mu, torsoPts(C, F, hem), F.top, { sw: 1.05 });
      if (!o.bust) lowerGarments(Mb, C, F, back);
      outfitDetails(Mu, C, F, hem, back, fl);
      if (F.skirt === 'lehenga') dupatta(Mu, C, F, o);
    }
    // 4. head
    if (!back) {
      for (const s of [-1, 1]) shp(Mh, E(s * (C.rx - .08) - (o.turn || 0) * .35, .42, .42, .55, 12), C.skin, { raw: true, sw: .9 });
      shp(Mh, E(0, 0, C.rx, C.ry, 26), C.skin, { raw: true, sw: 1.05 });
      face(Mh, C, F, fo, eyes, name);
      if (isPartner(name)) { longStrand(Mh, C, -1); longStrand(Mh, C, 1); longCap(Mh, C); if (F.skirt === 'lehenga') shp(Mh, E(0, -.62, .1, .12, 8), '#D8314E', { raw: true, ink: null }); }
      else hairFront(Mh, C);
      if (C.hoops) for (const s of [-1, 1]) shp(Mh, E(s * (C.rx + .02), 1.2, .26, .3, 12), null, { raw: true, ink: '#D9B25A', sw: 1.3 });
    } else {
      shp(Mh, E(0, 0, C.rx, C.ry, 26), C.skin, { raw: true, sw: 1.05 });
      if (isPartner(name)) { shp(Mh, LONG_BACK, C.hair, { sw: 1.05 }); ln(Mh, [[0, -2.4], [.1, 0], [-.05, 2.5], [.1, 4.8]], .8, C.hairHi); ln(Mh, [[-1.2, -1.8], [-1.6, 1.0], [-1.5, 4.2]], .8, C.hairHi); ln(Mh, [[1.2, -1.8], [1.6, 1.0], [1.5, 4.2]], .8, C.hairHi); }
      else hairBack(Mh, C);
    }
    hat(Mh, F, o, back);
    if (back && F.backpack && !o.headOnly) shp(Mu, rrPts(-1.35, -7.3, 2.7, 3.4, .55), F.backpack, { raw: true, sw: 1 });
    // 5. arms in front
    if (!o.headOnly) {
      if (o.holdBoth) prop(chain(Mu, mT(...V.lerp(AL.H, AR.H, .5)), mR(o.holdRotB || 0)), o.holdBoth, o);
      if (!o.armsBehind) { drawArm(Mu, C, F, AL, -1, o, o.holdL, o.pointL); drawArm(Mu, C, F, AR, 1, o, o.holdR, o.pointR); }
    }
    emote(Mu, o.emote, o.emoteK ?? (o.emote ? 1 : 0), o, U);
    return anchors;
  }

  // ---------- glasses ----------
  const GLS = {
    round: { ink: '#191419', sw: 1.6, ell: true, w: .66, h: .58 },
    rect: { ink: '#16141A', sw: 1.8, w: .68, h: .5, r: .2 },
    rectBig: { ink: '#16141A', sw: 2.0, w: .74, h: .58, r: .2, dy: .1 },
    thin: { ink: '#2A2830', sw: 1.1, w: .7, h: .48, r: .18 },
    browline: { ink: '#9AA0AA', sw: 1.05, w: .7, h: .5, r: .22, top: '#16141A', topW: 1.9 },
    clear: { ink: '#A8987A', sw: .95, w: .72, h: .52, r: .2, fill: '#D9CDB8', fillOp: 70, top: '#3A3238', topW: 1.3 },
    thick: { ink: '#1A1620', sw: 2.5, w: .76, h: .6, r: .22 },
    tort: { ink: '#5A3E2E', sw: 1.8, ell: true, w: .64, h: .6 },
    shades: { ink: '#16141A', sw: 1.6, w: .76, h: .52, r: .24, fill: '#1E1C22', fillOp: 240 },
  };
  function face(Mh, C, F, o, eyes, name) {
    const turn = clamp(o.turn ?? 0, -1, 1), fx = turn * .55;
    const bl = o.blush ?? (isPartner(name) ? .45 : C.blush ?? .25);
    if (bl > 0) for (const s of [-1, 1]) {
      shp(Mh, E(s * 1.4 + turn * .4, 1.02, .46, .27, 12), '#F27F98', { raw: true, ink: null, op: 255 * clamp(bl) * .6 });
      if (bl > .6) for (let i = 0; i < 3; i++) ln(Mh, [[s * 1.4 + turn * .4 - .25 + i * .2, .92], [s * 1.4 + turn * .4 - .33 + i * .2, 1.12]], .6, '#D9506F');
    }
    // facial hair (under the mouth line)
    const beard = C.beard, stub = C.stubble || 0;
    if (beard === 'stubble' || beard === 'full' || stub) {
      const op = beard === 'full' ? 150 : beard === 'stubble' ? 70 : 255 * stub * .25;
      const outer = arc(C.rx * .97, C.ry * .97, PI * .08, PI * .92, 12), inner = arc(1.25, .5, PI * .92, PI * .08, 8, 1.35);
      shp(Mh, [...outer, ...inner].map(([px, py]) => [px + fx * .8, py]), beard === 'full' ? C.hair : '#3A2E30', { raw: true, ink: null, op });
    }
    if (beard === 'chin' || beard === 'full') shp(Mh, [[-.5 + fx, 1.82], [.5 + fx, 1.82], [.4 + fx, 2.12], [fx, 2.24], [-.4 + fx, 2.12]], C.hair, { ink: null, op: 230 });
    if (C.stache) shp(Mh, [[-.56, 1.31], [-.12, 1.2], [0, 1.25], [.12, 1.2], [.56, 1.31], [.44, 1.36], [0, 1.31], [-.44, 1.36]].map(([px, py]) => [px + fx * 1.05, py]), C.stache < .7 ? '#4A3A3A' : C.hair, { ink: null, op: 255 * clamp(C.stache) * (C.stache < .7 ? .55 : .8) });
    const ex = .84, ey = C.eyeY, gk = F.shades && o.glasses === undefined ? 'shades' : C.glasses, G = gk === true ? GLS.round : GLS[gk];
    for (const s of [-1, 1]) {
      const far = Math.sign(turn) === s ? 1 - Math.abs(turn) * .3 : 1;
      const Me = chain(Mh, mT(s * ex * (1 - Math.abs(turn) * .12) + fx, ey), mS(far, 1));
      eye(Me, eyes, s, C, o);
      if (G) {
        const gy = G.dy || 0, frame = G.ell ? E(0, -.02 + gy, G.w, G.h, 16) : rrPts(-G.w, -G.h + gy, G.w * 2, G.h * 2, G.r);
        shp(Me, frame, G.fill || '#FFFFFF', { raw: true, op: G.fillOp ?? 26, ink: G.ink, sw: G.sw });
        if (G.top) ln(Me, [[-G.w - .02, -G.h + gy + .08], [0, -G.h + gy - .02], [G.w + .02, -G.h + gy + .08]], G.topW, G.top);
        ln(Me, [[.2, -.4 + gy], [.32, -.32 + gy], [.42, -.18 + gy]], .8, '#FFFFFF');
      }
      const b = BROWS[o.brows || browFor(eyes)], by = C.browY - (G ? .02 : 0) - (G && !G.ell && G.h >= .58 ? .1 : 0);
      ln(chain(Mh, mT(s * ex + fx, by)), [[-s * .4, b[0]], [s * .02, b[1]], [s * .42, b[2]]], C.browW, C.greyAll ? '#8C8782' : C.hair);
    }
    if (G) {
      const gy = G.dy || 0, bw = G.top ? G.topW * .6 : G.sw * .85, bc = G.top || G.ink;
      ln(Mh, [[-ex + fx + G.w, ey - .08 + gy], [fx, ey - .2 + gy], [ex + fx - G.w, ey - .08 + gy]], bw, bc);
      if (Math.abs(turn) < .6) for (const s of [-1, 1]) ln(Mh, [[s * (ex + G.w) + fx, ey - .1 + gy], [s * 1.95, ey - .02], [s * 2.25, ey + .05]], Math.max(1, G.sw * .7), bc);
    }
    ln(Mh, [[fx * 1.25 + .06, .9], [fx * 1.25 + .16, 1.07], [fx * 1.25 - .02, 1.12]], .9, C.nose);
    mouth(chain(Mh, mT(fx * 1.05, 1.47)), o.mouth || 'smile', o);
    if (o.glowFace) shp(Mh, E(0, .9, 2.0, 1.4, 16), '#BFE6FF', { raw: true, ink: null, op: 90 * clamp(o.glowFace) });
  }

  // tunics, dresses, gowns, aprons — everything that hangs below the waist (drawn after legs, before the torso)
  function lowerGarments(Mb, C, F, back) {
    const sx = C.shX, bl = C.belly || 0;
    // fill without an outline (it overlaps the torso hem and hides it), then ink only the sides and the hem
    const skirt = (P, col, op) => { shp(Mb, P, col, { ink: null, raw: true, op }); ln(Mb, [P[1], P[2]], 1); ln(Mb, [P[P.length - 1], P[0]], 1); ln(Mb, P.slice(2), 1); };
    if (F.dress) {
      const y1 = F.skirtY ?? -1.2, w1 = y1 > -.6 ? 2.05 : 1.75;
      skirt([[-1.38, -5.6], [1.38, -5.6], [w1, y1 + .05], [w1 * .5, y1 + .14], [0, y1 + .05], [-w1 * .5, y1 + .14], [-w1, y1 + .05]], F.top);
      for (const px of [-.6, .6]) ln(Mb, [[px * .8, -4.6], [px * 1.3, y1 + .3]], .6, F.trim);
      if (F.pat) pattern(Mb, F.pat, F.patCol, F.patCol2, yy => lerp(1.2, w1 - .35, clamp((yy + 4.8) / (y1 + 4.8))), -4.6, y1 + .4, 7);
    }
    if (F.tunic != null) {
      const y1 = F.tunic, w = sx - .02 + bl;
      skirt([[-w + .1, -5.7], [w - .1, -5.7], [w + .2, y1 + .05], [0, y1 + .12], [-w - .2, y1 + .05]], F.top);
      for (const s of [-1, 1]) ln(Mb, [[s * (w + .1), y1 + .02], [s * (w - .05), y1 - 1.1]], .8);   // side slits
      if (F.ombre) shp(Mb, [[-w - .05, lerp(-5.2, y1, .45)], [w + .05, lerp(-5.2, y1, .45)], [w + .18, y1 + .04], [0, y1 + .1], [-w - .18, y1 + .04]], F.ombre, { ink: null, raw: true, op: 170 });
      if (F.embroid) ln(Mb, [[-w - .1, y1 - .25], [0, y1 - .17], [w + .1, y1 - .25]], 1.4, F.embroid);
      if (F.pat) pattern(Mb, F.pat, F.patCol, F.patCol2, () => w - .35, -4.6, y1 + .5, 4);
    }
    if (F.gown) {
      skirt([[-1.55, -5.7], [1.55, -5.7], [2.0, -.75], [0, -.62], [-2.0, -.75]], F.top);
      for (const px of [-.9, .9]) ln(Mb, [[px * .7, -4.5], [px * 1.25, -1.0]], .7, F.trim);
      ln(Mb, [[0, -4.8], [0, -.8]], .7, F.trim);
    }
    if (F.apron && !back) {
      shp(Mb, [[-1.35, -4.85], [1.35, -4.85], [1.5, -2.2], [-1.5, -2.2]], F.apron, { sw: .9, raw: true });
      shp(Mb, rrPts(-.55, -3.9, 1.1, .6, .1), F.apron, { raw: true, sw: .7 });
    }
  }
  // scatter a pattern inside a shape: halfW(y) gives the usable half width at y
  function pattern(M, kind, c1, c2, halfW, y0, y1, rows, gapX = 0) {
    if (kind === 'stripes') { for (let i = 0; i < rows; i++) { const yy = lerp(y0, y1, (i + .5) / rows), w = halfW(yy); ln(M, [[-w, yy], [0, yy + .03], [w, yy]], 1.2, c1); } return; }
    if (kind === 'tiedye') { [[-.7, -6.6, .9], [.8, -5.8, 1.0], [-.5, -4.8, .8], [.9, -7.1, .55]].forEach(([px, py, r], i) => { if (py > y1 + .3 || py < y0 - .3) return; shp(M, E(px, py, r, r * .8, 12, i), i % 2 ? c1 : c2, { raw: true, ink: null, op: 165 }); shp(M, E(px, py, r * .45, r * .35, 10, i), i % 2 ? c2 : c1, { raw: true, ink: null, op: 140 }); }); return; }
    let n = 0;
    for (let i = 0; i < rows; i++) for (let j = 0; j < 4; j++) {
      const yy = lerp(y0, y1, (i + .5) / rows), w = halfW(yy), xx = lerp(-w, w, (j + (i % 2 ? .75 : .25)) / 4);
      if (Math.abs(xx) < gapX + .2) continue;
      if (kind === 'hawaii') { const a = hash(i * 7 + j * 3) * 3; shp(M, E(xx, yy, .36, .15, 10, a), n % 2 ? c1 : (c2 || c1), { raw: true, ink: null, op: 230 }); ln(M, [[xx - Math.cos(a) * .3, yy - Math.sin(a) * .3], [xx + Math.cos(a) * .3, yy + Math.sin(a) * .3]], .5, n % 2 ? (c2 || c1) : c1); }
      else if (kind === 'dots') shp(M, E(xx, yy, .12, .12, 8), c1, { raw: true, ink: null });
      else if (kind === 'sparkle') shp(M, starPts(xx, yy, .2, .3, 4), c1, { raw: true, ink: null, op: 220 });
      else if (kind === 'flowers') { for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; shp(M, E(xx + Math.cos(a) * .14, yy + Math.sin(a) * .14, .1, .1, 6), c1, { raw: true, ink: null }); } shp(M, E(xx, yy, .07, .07, 6), c2 || PAL.butter, { raw: true, ink: null }); }
      else if (kind === 'plaid') { ln(M, [[xx - .45, yy], [xx + .45, yy]], .7, c1); ln(M, [[xx, yy - .4], [xx, yy + .4]], .7, c1); }
      n++;
    }
  }

  function outfitDetails(Mu, C, F, hem, back, fl = 1) {
    const sx = C.shX, Mp = mm(Mu, mS(fl, 1));   // Mp: text never reads mirrored
    const halfW = yy => Math.max(.4, sx - .38 + (C.belly || 0) * clamp((yy + 6.2) / 2.2) * .6 + (F.big ? .3 : 0));
    if (F.pat && !F.dress && F.tunic == null && !back) pattern(Mu, F.pat, F.patCol, F.patCol2, halfW, -7.0, hem + .35, F.pat === 'stripes' ? 7 : 4);
    if (F.pat && F.tunic != null && !back) pattern(Mu, F.pat, F.patCol, F.patCol2, halfW, -7.0, hem + .35, 3);
    if (F.neck === 'crew' && !back) ln(Mu, [[-.6, -7.66], [0, -7.36], [.6, -7.66]], 1.1, F.trim);
    if (F.neckCol && F.zip && !back) shp(Mu, [[-.5, -7.72], [.5, -7.72], [.3, -7.25], [-.3, -7.25]], F.neckCol, { raw: true, sw: .7 });
    if (F.neck === 'v' && !back) { shp(Mu, [[-.5, -7.7], [.5, -7.7], [0, -6.95]], F.vest ? F.top : C.skin, { ink: null }); ln(Mu, [[-.55, -7.68], [0, -6.9], [.55, -7.68]], F.jersey ? 1.8 : 1.1, F.trim); }
    if (F.neck === 'scoop' && !back) { shp(Mu, [[-.75, -7.7], [.75, -7.7], [.45, -7.05], [0, -6.9], [-.45, -7.05]], C.skin, { ink: null }); ln(Mu, [[-.75, -7.68], [0, -6.88], [.75, -7.68]], 1.1, F.trim); }
    if (F.oneShoulder && !back) { shp(Mu, [[-.2, -7.75], [-1.5, -7.5], [-1.45, -6.9], [-.4, -6.85]], C.skin, { ink: null }); ln(Mu, [[-1.5, -6.95], [-.4, -6.9], [.6, -7.7]], 1, F.trim); }
    if (F.neck === 'mandarin' && !back) { const ec = F.embroid || F.trim; ln(Mu, [[-.55, -7.7], [0, -7.62], [.55, -7.7]], 1.8, ec); ln(Mu, [[0, -7.6], [0, -6.2]], 1.2, ec); for (let i = 0; i < 3; i++) shp(Mu, E(.12, -7.3 + i * .38, .07, .07, 6), ec, { raw: true, ink: null }); }
    if ((F.neck === 'polo' || F.neck === 'qzip') && !back) {
      for (const s of [-1, 1]) shp(Mu, [[s * .08, -7.3], [s * .7, -7.78], [s * .95, -7.15], [s * .3, -6.95]], F.top, { sw: .8, raw: true });
      ln(Mu, [[0, -7.3], [0, -6.4]], .9, F.trim);
      if (F.neck === 'polo') for (let i = 0; i < 2; i++) shp(Mu, E(.12, -7.05 + i * .35, .06, .06, 6), F.trim, { raw: true, ink: null });
    }
    if (F.knit) { ln(Mu, [[-1.3, hem + .42], [0, hem + .36], [1.3, hem + .42]], .8, F.trim); for (let i = -2; i <= 2; i++) ln(Mu, [[i * .5, hem + .38], [i * .5 + .02, hem + .1]], .5, F.trim); }
    if (F.puffer) for (let i = 1; i <= 3; i++) { const yy = lerp(-7.2, hem, i / 4), w = sx - .05; ln(Mu, [[-w, yy], [0, yy + .08], [w, yy]], .8, '#3A3A44'); }
    if (F.teePeek && !back) shp(Mu, [[-sx + .1, hem + .05], [sx - .1, hem + .05], [sx - .15, hem + .32], [-sx + .15, hem + .32]], F.teePeek, { sw: .7, raw: true });
    if (F.zip && !back) ln(Mu, [[0, -7.35], [0, -5.2], [0, hem + .05]], .9, F.trim);
    if (F.buttons && !back) { ln(Mu, [[0, -7.3], [0, hem]], .7, F.trim); for (let i = 0; i < 4; i++) shp(Mu, E(.12, -6.9 + i * .7, .06, .06, 6), '#5C5862', { raw: true, ink: null }); }
    if (F.jersey && F.top !== F.trim && !back) ln(Mu, [[-sx + .25, hem - .35], [0, hem - .4], [sx - .25, hem - .35]], 1.6, F.trim);
    // prints / logos (front only, never mirrored)
    if (F.print && !back) for (const p of [].concat(F.print)) stext(Mp, p.txt, 0, p.y ?? -6.1, p.h ?? .6, p.col, p.w ?? 1.3, .62, 2 * (sx - .68));
    if (F.dadPrint && !back) {   // simple graphic tee: a star in a ring (o.shirtText swaps in a text print instead)
      shp(Mp, E(0, -6.05, .95, .9, 16), F.trim, { raw: true, ink: null, op: 200 });
      shp(Mp, starPts(0, -6.05, .55, .5, 5), '#F7D774', { raw: true, sw: .7 });
    }
    if (F.chestLogo && !back) { shp(Mp, rrPts(-.95, -6.95, .5, .42, .05), F.top, { raw: true, sw: .6 }); ln(Mp, [[-.95, -6.8], [-.45, -6.8]], .5, F.trim); }   // plain chest pocket
    if (F.chestDot && !back) shp(Mp, E(-.75, -6.7, .16, .16, 8), F.chestDot, { raw: true, ink: null });
    if (F.graphic && !back) { shp(Mp, E(-.1, -6.0, .75, .7, 14), '#C93A50', { raw: true, ink: null, op: 220 }); shp(Mp, starPts(.25, -5.85, .5, .45, 5), '#2F55B5', { raw: true, sw: .6 }); }
    if (F.emblem && !back) shp(Mp, [[0, -6.9], [.55, -6.3], [0, -5.6], [-.55, -6.3]], F.emblem, { raw: true, sw: .8 });
    // shirt collar + tie (under any jacket)
    if (F.collar && !back) for (const s of [-1, 1]) shp(Mu, [[s * .05, -7.25], [s * .62, -7.8], [s * .85, -7.0], [s * .32, -6.9]], F.collar, { sw: .8, raw: true });
    if (F.tie && !back) {
      const lo = F.tieLoose, ky = lo ? -6.95 : -7.25, Mt = lo ? chain(Mu, mT(0, ky), mR(.12), mT(0, -ky)) : Mu, ty = F.tieLen ?? -5.0;
      shp(Mt, [[-.22, ky - .12], [.22, ky - .12], [.16, ky + .22], [-.16, ky + .22]], F.tie, { raw: true, sw: .8 });
      shp(Mt, [[-.16, ky + .22], [.16, ky + .22], [.34, ty + .25], [0, ty + .5], [-.34, ty + .25]], F.tie, { raw: true, sw: .8 });
      if (F.tiePat) for (let i = 1; i < 4; i++) { const yy = lerp(ky + .3, ty + .2, i / 4); ln(Mt, [[-.25, yy], [.25, yy + .12]], .6, F.tiePat); }
    }
    if (F.bowtie && !back) { for (const s of [-1, 1]) shp(Mu, [[0, -7.15], [s * .5, -7.4], [s * .5, -6.9]], F.bowtie, { raw: true, sw: .8 }); shp(Mu, E(0, -7.15, .12, .12, 8), F.bowtie, { raw: true, sw: .7 }); }
    // jackets / open shirts
    if (F.jacket && !back) {
      const jt = F.jacketType, gap = { blazer: .02, open: .32, zip: .3, chore: .04, overshirt: .04 }[jt] ?? .1;
      const vY = { blazer: -5.35, open: -6.35, zip: -7.3, chore: -6.8, overshirt: -6.6 }[jt] ?? -7.0, drop = jt === 'blazer' || jt === 'chore' ? .3 : jt === 'overshirt' ? .15 : 0;
      for (const s of [-1, 1]) {
        shp(Mu, panelPts(C, F, hem, s, gap, vY, drop), F.jacket, { sw: 1, sub: 2 });
        if (jt === 'blazer') shp(Mu, [[s * .64, -7.58], [s * 1.12, -7.1], [s * .92, -6.8], [s * 1.08, -6.55], [s * (gap + .08), vY - .02]], F.jacket, { sw: .8, raw: true });
        if (jt === 'open' || jt === 'overshirt' || jt === 'chore') shp(Mu, [[s * .4, -7.6], [s * 1.0, -7.45], [s * .82, -6.95], [s * (gap + .1), vY + .05]], F.jacket, { sw: .8, raw: true });
        if (jt === 'chore' || jt === 'overshirt') shp(Mu, rrPts(s * 1.0 - .4, -6.6, .8, .6, .08), F.jacket, { raw: true, sw: .7 });
        if (jt === 'chore') shp(Mu, rrPts(s * .95 - .45, -5.0, .9, .75, .1), F.jacket, { raw: true, sw: .7 });
      }
      if (F.jacketPat) pattern(Mu, F.jacketPat, F.patCol, F.patCol2, () => sx - .3, -7.0, hem + .3, F.jacketPat === 'plaid' ? 3 : 4, gap + .15);
      if (jt === 'blazer') for (let i = 0; i < 2; i++) shp(Mu, E(-.18, -5.25 + i * .55, .07, .07, 6), '#16141A', { raw: true, ink: null });
      if (F.hood && jt === 'zip') shp(Mu, [[-1.25, -7.85], [-1.05, -7.3], [-.45, -7.45], [.45, -7.45], [1.05, -7.3], [1.25, -7.85], [.7, -7.62], [0, -7.55], [-.7, -7.62]], F.jacket, { sw: .9 });
    }
    if (F.hood && !(F.jacket && F.jacketType === 'zip')) {
      const hc = F.hoodCol || F.top;
      if (!back) { shp(Mu, [[-1.25, -7.85], [-1.05, -7.25], [0, -7.0], [1.05, -7.25], [1.25, -7.85], [.7, -7.62], [0, -7.5], [-.7, -7.62]], hc, { sw: .9 }); if (!F.zip) for (const s of [-1, 1]) ln(Mu, [[s * .35, -7.1], [s * .38, -6.6], [s * .34, -6.2]], .8, '#E9E9EE'); }
      else shp(Mu, [[-1.3, -7.7], [1.3, -7.7], [1.1, -6.3], [0, -5.9], [-1.1, -6.3]], hc, { sw: .9 });
    }
    if (F.pocket && !back && !F.jacket) { const y0 = F.big ? -4.5 : -5.25, y1 = F.big ? -3.6 : -4.4; ln(Mu, [[-1.25, y1], [-.95, y0], [.95, y0], [1.25, y1]], .8, F.trim); }
    if (F.vest) {
      for (const s of [-1, 1]) shp(Mu, [[-.6, -7.72], [-1.55, -7.45], [-1.62, -6.35], [-1.42, -5.0], [-1.5, -4.05], [-.6, -4.0], [-.38, -5.6], [-.45, -6.9]].map(([x, y]) => [x * -s, y]), F.vest, { sw: .9 });
      shp(Mu, [[-1.5, -4.85], [1.5, -4.85], [1.55, -4.3], [-1.55, -4.3]], F.sash, { sw: .9, raw: true });
      shp(Mu, [[1.0, -4.5], [1.5, -3.6], [1.15, -3.45], [.75, -4.4]], F.sash, { sw: .8 });
    }
    if (F.belt && !back) shp(Mu, [[-sx + .2, -4.75], [sx - .2, -4.75], [sx - .18, -4.45], [-sx + .18, -4.45]], F.belt, { raw: true, sw: .7 });
    if (F.sailorCollar && !back) {   // sailor collar
      shp(Mu, [[-.6, -7.72], [-1.55, -7.45], [-1.25, -6.65], [0, -5.85], [1.25, -6.65], [1.55, -7.45], [.6, -7.72], [0, -6.6]], F.sailorCollar, { sw: .9, sub: 2 });
      ln(Mu, [[-1.3, -7.32], [-1.05, -6.75], [0, -6.1], [1.05, -6.75], [1.3, -7.32]], .8, '#FFFFFF');
      shp(Mu, [[0, -6.0], [-.7, -6.35], [-.62, -5.65]], F.bow, { sw: .8, raw: true }); shp(Mu, [[0, -6.0], [.7, -6.35], [.62, -5.65]], F.bow, { sw: .8, raw: true });
      shp(Mu, E(0, -6.0, .16, .16, 8), F.bow, { raw: true, sw: .8 });
    }
    if (F.crop && !back) for (let i = 0; i < 5; i++) shp(Mu, E(-1.0 + i * .5, -5.85 + (i % 2) * .08, .07, .07, 6), F.trim, { raw: true, ink: null });
    // apron bib, shoulder pads, drape, quads, accessories
    if (F.apron && !back) { shp(Mu, [[-.85, -7.0], [.85, -7.0], [1.1, -4.3], [-1.1, -4.3]], F.apron, { sw: .9, raw: true }); ln(Mu, [[-.8, -7.0], [-.4, -7.75]], .9, F.apron); ln(Mu, [[.8, -7.0], [.4, -7.75]], .9, F.apron); }
    if (F.pads && !back) for (const s of [-1, 1]) { shp(Mu, E(s * (sx + .05), -7.35, .95, .55, 14, s * -.25), F.top, { raw: true, sw: 1 }); ln(Mu, [[s * (sx - .6), -7.55], [s * (sx + .2), -7.75], [s * (sx + .8), -7.4]], 1.4, F.trim); }
    if (F.drape && !back) { shp(Mu, [[-.55, -7.78], [-1.85, -7.62], [-2.35, -6.5], [-2.25, -4.6], [-1.6, -4.35], [-1.45, -6.3], [-.85, -7.25]], F.drape, { sw: 1 }); for (const yy of [-6.6, -5.6]) ln(Mu, [[-2.25, yy], [-1.5, yy + .1]], .7, '#3A3A44'); }
    if (F.quads && !back) { [[-1.45, -4.1, .62], [1.5, -4.1, .58], [-.55, -3.55, .72], [.55, -3.55, .72]].forEach(([px, py, r]) => { shp(Mu, [[px - r, py], [px + r, py], [px + r, py + .7], [px, py + .9], [px - r, py + .7]], '#C9CCD2', { sw: .8 }); shp(Mu, E(px, py, r, r * .42, 14), '#F4F1EA', { raw: true, sw: .8 }); }); ln(Mu, [[-1.3, -7.5], [-1.1, -4.6]], 1.4, '#9A9AA4'); ln(Mu, [[1.3, -7.5], [1.1, -4.6]], 1.4, '#9A9AA4'); }
    if (F.strap && !back) ln(Mu, [[sx - .55, -7.65], [sx - .25, -6.0], [sx - .45, -4.5]], 2.6, F.strap);
    if (F.backpack && !back) for (const s of [-1, 1]) ln(Mu, [[s * (sx - .55), -7.65], [s * (sx - .3), -6.0], [s * (sx - .5), -4.6]], 2.4, F.backpack);
    if (F.lanyard && !back) { ln(Mu, [[-.5, -7.6], [-.25, -6.6], [0, -5.75]], .9, F.lanyard); ln(Mu, [[.5, -7.6], [.25, -6.6], [0, -5.75]], .9, F.lanyard); shp(Mu, rrPts(-.35, -5.8, .7, .9, .08), '#F4F1EA', { raw: true, sw: .7 }); ln(Mu, [[-.2, -5.4], [.2, -5.4]], .6, '#9A9AA4'); }
    if (F.badge && !back) { shp(Mp, rrPts(.45, -6.55, .75, .45, .05), '#F4F1EA', { raw: true, sw: .6 }); ln(Mp, [[.55, -6.35], [1.05, -6.35]], .5, '#E0344A'); }
    if (F.rosette && !back) { const rx = .95, ry = -6.4; shp(Mp, [[rx - .2, ry + .2], [rx - .45, ry + 1.5], [rx - .1, ry + 1.25], [rx, ry + .3]], '#2F55B5', { raw: true, sw: .6 }); shp(Mp, [[rx + .2, ry + .2], [rx + .45, ry + 1.5], [rx + .1, ry + 1.25], [rx, ry + .3]], '#E0344A', { raw: true, sw: .6 }); shp(Mp, starPts(rx, ry, .55, .75, 12), '#E0344A', { raw: true, sw: .7 }); shp(Mp, E(rx, ry, .25, .25, 10), '#F4F1EA', { raw: true, sw: .6 }); }
    if (F.lei && !back) for (let i = 0; i <= 9; i++) { const a = PI * (.05 + .9 * i / 9), px = Math.cos(a) * 1.25, py = -7.55 + Math.sin(a) * .9; shp(Mu, E(px, py, .26, .24, 8), ['#F3A7B5', '#F7D774', '#FFFFFF'][i % 3], { raw: true, sw: .6 }); }
    if (F.dupatta && !back) shp(Mu, [[-1.55, -7.6], [-.9, -7.7], [.5, -6.4], [1.55, -4.4], [1.15, -4.2], [-.2, -5.9], [-1.4, -7.0]], F.dupatta, { op: 200, sw: .7 });
    if (F.bag && !back) { ln(Mu, [[1.2, -7.55], [1.55, -5.5], [1.8, -4.6]], .8, '#D9B25A'); shp(Mu, rrPts(1.4, -4.7, .9, .7, .15), F.bag, { raw: true, sw: .8 }); }
    if (F.headphones && !back) { ln(Mu, [[-1.05, -7.3], [0, -6.85], [1.05, -7.3]], 2.4, '#5C5862'); for (const s of [-1, 1]) { shp(Mu, E(s * 1.1, -7.45, .48, .56, 12), '#4A4652', { raw: true, sw: .9 }); shp(Mu, E(s * 1.1, -7.45, .24, .3, 10), '#8E8F9A', { raw: true, ink: null }); } }
    if (F.pillow && !back) { for (const s of [-1, 1]) shp(Mu, [[s * .5, -7.0], [s * 1.25, -7.15], [s * 1.75, -7.65], [s * 1.6, -8.1], [s * 1.0, -7.9], [s * .5, -7.6]], F.pillow, { sw: .9 }); shp(Mu, E(0, -7.05, .7, .3, 12), F.pillow, { raw: true, sw: .9 }); }
    if (F.earbuds && !back) { ln(Mu, [[-1.95, -8.9], [-1.0, -7.4], [-.25, -6.2], [-.6, -5.0]], .7, '#F4F1EA'); ln(Mu, [[1.95, -8.9], [1.0, -7.4], [.25, -6.2]], .7, '#F4F1EA'); }
  }
  function lehenga(Mb, C, F, o, GL, GR, legL, legR) {
    const sp = clamp(o.spin ?? 0, 0, 1.5), t = o.t || 0, Wd = 2.75 + sp * 1.25, hemY = -.32 + sp * .25, n = 14, hem = [];
    for (let i = 0; i <= n; i++) {
      const k = i / n, x = Wd - 2 * Wd * k, side = x > 0 ? legR : legL;
      hem.push([x, hemY - side * .35 + Math.sin(k * 9 + t * 9) * .14 * sp + (i % 2 ? .1 : 0) * (1 - sp * .5)]);
    }
    shoe(Mb, F, [GL.A[0] - sp * .2, -.42 - legL * .3], -1, o.toeL); shoe(Mb, F, [GR.A[0] + sp * .2, -.42 - legR * .3], 1, o.toeR);
    const pts = [[-1.35, -5.05], [1.35, -5.05], [1.9 + sp * .3, -3.0], ...hem, [-1.9 - sp * .3, -3.0]];
    shp(Mb, pts, '#FBF7EF', { sw: 1.05, sub: 2 });
    const band = [...hem.map(([x, y]) => [x * .99, y - .55]), ...hem.slice().reverse()];
    shp(Mb, band, '#EFDCA4', { ink: null, raw: true, op: 220 });
    ln(Mb, hem.map(([x, y]) => [x * .99, y - .55]), .7, '#C9A94E');
    for (let i = -2; i <= 2; i++) if (i) ln(Mb, [[i * .45, -4.8], [i * (.9 + sp * .25), -2.6], [i * (1.05 + sp * .55), hemY - .6]], .55, '#D8CDB5');
    for (let i = 0; i < 9; i++) {
      const v = hash(i * 7.3 + 1), h = hash(i * 3.1 + 2) * 2 - 1, yy = lerp(-4.6, hemY - .9, v), hw = lerp(1.35, Wd, (yy + 5.05) / (5.05 + hemY)) * .82;
      const r = .1 + .09 * Math.pow(Math.sin(t * 6 + i * 1.7), 2);
      shp(Mb, starPts(h * hw, yy, r * 1.6, .3, 4), i % 3 === 0 ? PAL.lilac : '#E8C65A', { raw: true, ink: null });
    }
  }
  function dupatta(Mu, C, F, o) {
    const w = Math.sin((o.t || 0) * 3) * .1;
    shp(Mu, [[-1.55, -7.5], [-.9, -7.65], [.4, -6.2], [1.75 + w, -4.6], [1.9 + w, -3.5], [1.4 + w, -3.6], [1.2, -4.4], [-.2, -5.7], [-1.45, -6.9]], '#FFFFFF', { op: 150, ink: '#D6C08A', sw: .7 });
  }
  function hat(Mh, F, o = {}, back) {
    if (F.hat === 'pirate') {
      const Hm = mm(Mh, mT(0, .45));
      shp(Hm, [[-3.0, -2.15], [-1.6, -2.75], [0, -2.5], [1.6, -2.75], [3.0, -2.15], [2.25, -3.45], [1.0, -4.0], [0, -4.35], [-1.0, -4.0], [-2.25, -3.45]], '#221D27', { sw: 1.05 });
      shp(Hm, E(0, -3.15, .32, .28, 10), '#FFFFFF', { raw: true, sw: .7 }); ln(Hm, [[-.5, -2.75], [0, -2.82], [.5, -2.75]], .9, '#FFFFFF');
      ln(Hm, [[-2.7, -2.3], [0, -2.62], [2.7, -2.3]], .9, PAL.ochre);
    }
    if (F.hat === 'sailor') {
      const M = chain(Mh, mT(.75, -2.25), mR(.22));
      shp(M, [[-1.3, .1], [-1.15, -.75], [0, -1.05], [1.15, -.75], [1.3, .1]], '#FFFFFF', { sw: .9 });
      shp(M, [[-1.35, -.05], [1.35, -.05], [1.38, .32], [-1.38, .32]], '#2D3F7C', { sw: .8, raw: true });
    }
    if (F.hat === 'grad') {
      const M = chain(Mh, mT(0, -2.35), mR(-.06));
      shp(M, [[-1.75, .05], [1.75, .05], [1.6, .75], [-1.6, .75]], '#1F2A55', { sw: .9, raw: true });
      shp(M, [[-3.0, -.35], [0, -1.15], [3.0, -.35], [0, .45]], '#1F2A55', { sw: 1, raw: true });
      if (F.capArt === 'stars' || F.capArt === 'boat') { shp(M, [[-2.2, -.35], [0, -.95], [2.2, -.35], [0, .25]], '#2F55B5', { raw: true, ink: null, op: 240 }); for (let i = 0; i < 4; i++) { const cx = -1.2 + i * .8, p = []; for (let k = 0; k <= 6; k++) { const a = k / 6 * 4 + i, r = .06 + .18 * k / 6; p.push([cx + Math.cos(a) * r, -.35 + Math.sin(a) * r * .5]); } ln(M, p, .9, '#F2C94C'); } }
      shp(M, E(0, -.35, .16, .1, 8), '#F2C94C', { raw: true, ink: null });
      ln(M, [[0, -.35], [1.6, -.2], [2.1, .4], [2.15, 1.3]], 1, '#F2C94C'); shp(M, [[2.0, 1.2], [2.3, 1.2], [2.25, 1.9], [2.05, 1.9]], '#F2C94C', { raw: true, ink: null });
    }
    if (F.hat === 'party') {
      const M = chain(Mh, mT(.65, -2.15), mR(.25));
      shp(M, [[-1.0, .1], [1.0, .1], [0, -2.8]], PAL.hot, { raw: true, sw: .9 });
      for (let i = 1; i <= 2; i++) ln(M, [[-1.0 + i * .35, .1 - i * .9], [1.0 - i * .35, .1 - i * .9]], 1.2, PAL.butter);
      shp(M, E(0, -2.85, .3, .3, 8), PAL.butter, { raw: true, sw: .7 });
    }
    if (F.hat === 'helmet') {
      shp(Mh, [...arc(2.85, 2.8, PI * .9, PI * 2.1, 18, -.1), [2.6, 1.3], [1.7, 1.3], [1.5, .2], [-1.5, .2], [-1.7, 1.3], [-2.6, 1.3]], o.helmetCol || '#B8333A', { sw: 1.1, sub: 2 });
      ln(Mh, [[0, -2.9], [0, -.4]], 2.2, '#F4F1EA');
      if (!back) { ln(Mh, [[-1.5, 1.2], [0, 1.5], [1.5, 1.2]], 1.6, '#C9CCD2'); ln(Mh, [[-1.6, .5], [0, .75], [1.6, .5]], 1.6, '#C9CCD2'); for (const s of [-1, 1]) ln(Mh, [[s * .6, .6], [s * .6, 1.45]], 1.3, '#C9CCD2'); }
    }
    if (F.hat === 'cap') {
      shp(Mh, [...arc(2.5, 2.45, PI * .98, PI * 2.02, 14, -.35), [2.4, -.55], [-2.4, -.55]], o.capCol || '#C93A50', { sw: 1, sub: 2 });
      if (!back) shp(Mh, [[-1.6, -.6], [1.6, -.6], [2.0, -.1], [-2.0, -.1]], o.capCol || '#C93A50', { sw: .9 });
    }
  }

  // ---------- tiny far version ----------
  function tiny(name, x, y, u, o = {}) {
    const C = resolveChar(name, o), F = outfitOf(name, o.outfit, C, o), U = u * C.k * (o.scale ?? 1), fl = o.flip ? -1 : 1;
    K = { u: U, sw: clamp(U * .07 / 4, .22, .9), J: U * .02, ink: o.ink || PAL.ink };
    const M = chain(mT(x, y - (o.dy || 0) * U), mR(o.rot || 0), mS(fl * U, U)), sil = o.sil, c = col => sil || col, ink = sil ? null : undefined;
    const Mh = chain(M, mT(0, -9.9), mS(C.hs || 1));
    const top = o.color || F.jacket || F.top;
    const H = HAIR[C.hairStyle];
    if (isPartner(name)) shp(Mh, [[-2.4, 0], [-2.3, -1.6], [0, -2.5], [2.3, -1.6], [2.4, 0], [2.5, 4.8], [-2.5, 4.8]], c(C.hair), { sub: 2, ink });
    else if (H && H.behind && !o.back) shp(Mh, H.behind(), c(C.hair), { sub: 2, ink });
    shp(M, [[-1.2, -4.3], [1.2, -4.3], [1.05, 0], [.2, 0], [0, -2.4], [-.2, 0], [-1.05, 0]], c(F.skirt === 'lehenga' ? '#FBF7EF' : F.dress ? C.skin : F.pants || C.skin), { raw: true, ink });
    if (F.skirt === 'lehenga') shp(M, [[-1.3, -5], [1.3, -5], [2.6, -.2], [-2.6, -.2]], c('#FBF7EF'), { sub: 2, ink });
    if (F.dress || F.gown) shp(M, [[-1.3, -5], [1.3, -5], [1.9, -.9], [-1.9, -.9]], c(F.top), { sub: 2, ink });
    shp(M, rrPts(-1.6 - (C.belly || 0) * .3, -7.6, 3.2 + (C.belly || 0) * .6, 3.6, .9), c(top), { raw: true, ink });
    if (o.arms === 'up' || o.arms === 'wave') { const w = o.arms === 'wave' ? Math.sin((o.t || 0) * 10) * .4 : 0; for (const s of [-1, 1]) limb(M, [[s * 1.4, -7.1], [s * (2.4 + w * s), -9.2], [s * (2.6 + w), -10.8]], .45, .4, c(top), { ink }); }
    shp(Mh, E(0, 0, C.rx, C.ry, 16), c(C.skin), { raw: true, ink });
    shp(Mh, hairTinyPts(C, o.back), c(C.hair), { ink, sub: 2 });
    if (!o.back && !sil && U > 5) { for (const s of [-1, 1]) shp(Mh, E(s * .85, .45, .26, .34, 8), EYE, { raw: true, ink: null }); if (C.glasses) ln(Mh, [[-1.5, .4], [0, .3], [1.5, .4]], .6, '#191419'); }
    return { head: ap(Mh, [0, 0]), top: ap(Mh, [0, -2.7]) };
  }

  // ---------- mood: faces never snap ----------
  function mood(t, keys) {
    let i = 0; for (let k = 0; k < keys.length; k++) if (t >= keys[k][0]) i = k;
    const [t0, eyes0, emo, mouth0] = keys[i], dt = t - t0, next = keys[i + 1];
    let eyes = eyes0, take = 0;
    if (i > 0 && dt >= 0 && dt < .09) eyes = 'closed';
    if (next && next[0] - t < .04 && next[0] - t >= 0) eyes = 'closed';
    if (i > 0 && dt >= 0) take = .09 * Math.exp(-dt * 7) * Math.cos(dt * 21);
    const emoteK = emo ? backOut(seg(dt, .02, .3)) : 0;
    const r = { eyes, take, emote: emo || null, emoteK };
    if (mouth0) r.mouth = mouth0;
    return r;
  }

  // ---------- move: beat-synced pose library ----------
  const DANCE = [
    { handR: [3.55, -9.6], handL: [-1.45, -4.9], pointR: 1, lean: .07, headTilt: -.09, legL: 0, legR: 0, dy: 0, rot: 0 },
    { handR: [-1.15, -4.95], handL: [-3.35, -6.5], pointR: 1, lean: -.08, headTilt: .1, legL: 0, legR: .32, dy: 0, rot: -.03 },
    { handR: [.55, -7.45], handL: [-.55, -7.45], pointR: 0, lean: 0, headTilt: -.14, legL: 0, legR: 0, dy: .2, rot: 0 },
    { handR: [2.9, -4.7], handL: [-1.25, -9.7], pointR: 0, lean: .11, headTilt: .12, legL: .32, legR: 0, dy: 0, rot: .04 },
  ];
  function mixPose(a, b, k) {
    const r = { ...a, ...b };
    for (const key in r) {
      const va = a[key], vb = b[key];
      if (typeof va === 'number' && typeof vb === 'number') r[key] = lerp(va, vb, k);
      else if (Array.isArray(va) && Array.isArray(vb)) r[key] = [lerp(va[0], vb[0], k), lerp(va[1], vb[1], k)];
      else r[key] = k < .5 ? (va ?? vb) : (vb ?? va);
    }
    return r;
  }
  function move(style, t, seed = 0) {
    const p = moveRaw(style, t, seed);   // presets authored in the upper-body frame → convert to body units
    for (const k of ['handL', 'handR']) if (p[k]) p[k] = [p[k][0], p[k][1] + UP];
    return p;
  }
  function moveRaw(style, t, seed) {
    const n = beatN(t), P = beatPh(t), cont = n + P, pl = pulse(t, 7), sn = Math.sin(cont * Math.PI), ph = seed * 1.913;
    switch (style) {
      case 'bounce': return { sq: .08 * pl - .02, dy: .25 * Math.sin(P * Math.PI), aL: -1.15 + .18 * pl, aR: -1.15 + .18 * pl, eL: .6, eR: .6, headTilt: .05 * Math.sin(n * Math.PI / 2 + 1) };
      case 'sway': return { rot: .06 * sn, headTilt: -.07 * sn, aL: -1.2 + .22 * sn, aR: -1.2 - .22 * sn, eL: .3, eR: .3, sq: .03 * pl };
      case 'hop': { const air = Math.sin(P * Math.PI); return { dy: 1.2 * Math.pow(air, .8), sq: .17 * pulse(t, 14) - .08 * air, aL: -.7 + 1.0 * air, aR: -.7 + 1.0 * air, eL: .4, eR: .4, legL: .25 * air, legR: .25 * air }; }
      case 'groove': return { headTilt: .1 * sn, lean: .08 * sn, dy: -.12 * pl, sq: .05 * pl, aL: -.75 + .3 * sn, eL: 1.6, aR: -.75 - .3 * sn, eR: 1.6, legL: .28 * Math.max(0, sn), legR: .28 * Math.max(0, -sn) };
      case 'spin': { const k = frac(cont / 2), a = easeInOut(k) * TAU, c = Math.cos(a); return { sx: Math.max(.3, Math.abs(c)), back: c < 0, spin: 1, aL: .12, aR: .12, eL: .3, eR: .3, dy: .25 * Math.sin(k * Math.PI), headTilt: .1 * Math.sin(a) }; }
      case 'wave': return { aR: .95, eR: .5 + .5 * Math.sin(cont * TAU), aL: -1.3, eL: .2, headTilt: .08, sq: .03 * pl };
      case 'shy': return { armsBehind: true, aL: -1.5, aR: -1.5, eL: -.5, eR: -.5, toeR: .55 * Math.sin(cont * Math.PI / 2 + ph), legR: .1 + .06 * Math.sin(cont * Math.PI), headTilt: .16 + .05 * Math.sin(cont * Math.PI / 2), rot: .025 * Math.sin(cont * Math.PI / 2), blush: .95 };
      case 'giggle': return { handR: [.55, -8.15], handL: [-.85, -5.9], sq: .035 * Math.sin(t * TAU * 8), dy: .06 * Math.abs(Math.sin(t * TAU * 4)), headTilt: .1 + .03 * Math.sin(t * TAU * 8), eyes: 'happy', mouth: 'grin', blush: .8 };
      case 'point': return { handR: [3.8, -7.75 - .35 * pl], pointR: 1, handL: [-1.45, -4.9], lean: .05 + .03 * pl, sq: .04 * pl };
      case 'dance': {
        const i = ((n % 4) + 4) % 4, prev = DANCE[(i + 3) % 4], cur = DANCE[i], k = backOut(seg(P, 0, .3), 2.2);
        const p = mixPose(prev, cur, k); p.pointR = cur.pointR && k > .4; p.sq = .06 * pl; p.dy = (p.dy || 0) + .15 * Math.sin(P * Math.PI);
        return p;
      }
      case 'garba': {
        const side = n % 2 ? 1 : -1, k = ease(seg(P, 0, .35)), sx = lerp(-side, side, k), sep = .3 + .55 * (1 - pulse(t, 9));
        const c = [sx * 2.0, -8.5 - .3 * Math.sin(P * Math.PI)];
        return { handL: [c[0] - sep * .5, c[1]], handR: [c[0] + sep * .5, c[1]], lean: .07 * sx, rot: .03 * sx, legL: side < 0 ? .45 * Math.sin(P * Math.PI) : 0, legR: side > 0 ? .45 * Math.sin(P * Math.PI) : 0, dy: .15 * Math.sin(P * Math.PI), spin: .55 + .3 * Math.abs(sx), headTilt: -.08 * sx, eyes: 'happy', mouth: 'grin' };
      }
      case 'text': { const a = pulse2(t, 12), odd = n % 2; return { handR: [.5, -6.4 - .14 * a * odd], handL: [-.5, -6.4 - .14 * a * (1 - odd)], holdBoth: 'phoneback', nod: .55, lookY: 1, eyes: 'down', glowFace: .7, sq: .015 * pl }; }
      case 'hype': return { handL: [-.95, -7.95], aR: .55 + .75 * pl, eR: .9 - .5 * pl, lean: .06 + .04 * pl, sq: .07 * pl, dy: .12 * pl, mouth: 'O', brows: 'angry', headTilt: -.06 };
      case 'cheer': { const up = pulse(t, 6); return { aL: .55 + .5 * up, aR: .55 + .5 * up, eL: .35, eR: .35, dy: .5 * Math.sin(P * Math.PI), sq: .1 * pulse(t, 12), eyes: 'happy', mouth: 'grin' }; }
      case 'walk': return { walk: cont + ph, rot: .02 * sn };
      case 'run': return { run: cont * 2 + ph };
      default: return { aL: -1.32 + .03 * wob(t, .37, ph), aR: -1.32 + .03 * wob(t, .41, ph + .3), eL: .2, eR: .2, sq: .012 * wob(t, .33, ph), headTilt: .03 * wob(t, .19, ph) };
    }
  }

  // ---------- public API ----------
  const castMember = (name, x, y, u, o) => person(name, x, y, u, o);
  const mk = name => (x, y, u, o) => person(name, x, y, u, o);
  const me = mk('me'), partner = mk('partner'), mom = mk('mom'), dad = mk('dad'), sibling = mk('sibling');
  const friendA = mk('friendA'), friendB = mk('friendB'), friendC = mk('friendC'), friendD = mk('friendD'), friendE = mk('friendE'), friendF = mk('friendF');
  const friendG = mk('friendG'), friendH = mk('friendH'), cofounder = mk('cofounder'), coworker = mk('coworker'), grandpa = mk('grandpa'), kid = mk('kid');
  function dancer(name, x, y, u, style, t, extra = {}) { return person(name, x, y, u, { ...move(style, t, extra.seed || 0), t, ...extra }); }
  const CREW_PROPS = { friendC: { holdBoth: 'cake', handL: [-1.75, -5.3], handR: [1.75, -5.3] }, friendE: { holdR: 'megaphone', handR: [1.3, -8.0], holdRotR: -.35 }, friendF: { holdR: 'partyhorn', handR: [.7, -7.7], holdRotR: -.2 } };
  function crew(x, y, u, o = {}) {
    const names = o.names || ['friendA', 'friendB', 'friendC', 'me', 'friendD', 'friendE', 'friendF'], gap = (o.gap ?? 6.2) * u, t = o.t;
    const out = {}, x0 = x - (names.length - 1) * gap / 2;
    names.forEach((nm, i) => {
      const extra = { ...(o.props === false ? {} : CREW_PROPS[nm] || {}), ...(nm === 'me' ? { age: 19, ...(o.me || {}) } : {}), ...((o.each || {})[nm] || {}) };
      const pose = t != null ? move(o.style || 'idle', t, i + 1) : {};
      out[nm] = person(nm, x0 + i * gap, y, u, { ...pose, t, ...extra });
    });
    return out;
  }
  const LOOKS = { SKIN_ME, SKIN_MOM: '#BE8460', SKIN_DAD: '#A86E4B', SKIN_SIB: '#B47A54', HAIR_BLK: '#1F1A1C', HAIR_MOM: '#2B1D18', GREY_DAD: '#8C8782' };
  Object.assign(window, { me, hero: me, partner, crush: partner, mom, dad, sibling, brother: sibling, friendA, friendB, friendC, friendD, friendE, friendF, friendG, friendH, cofounder, coworker, grandpa, kid,
    castMember, crew, dancer, move, mood, tiny, mixPose, strokeText, CAST: { CHAR, OUT, ME_AGE, SIBLING_AGE, LOOKS } });
})();
