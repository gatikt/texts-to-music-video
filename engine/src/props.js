// props.js — painted SETS (full-frame backgrounds) and PROPS (objects). Generic, reusable places and things — no real
// addresses, no brands, no logos. Re-colour / re-dress them per project from your SETTINGS.md.
/* ============================================================================================
 API (all globals; also grouped as SETS.* and PROPS.*). Everything is painted with p5.brush.
 Every function is a pure function of its args (+ o.t, default = global frame time T).

 ---- SETS: fn(t, o) paints the ENTIRE 1080x1920 frame (call first in your shot, inside camBegin
      if you want the camera to move over it). Common options:
        o.calm: 'top' | 'bottom'  — drops clutter in that zone (top ≈ y<820, bottom ≈ y>1250) for big type
        o.boil: true              — let the set's texture boil 12×/s like characters (default: static texture,
                                    deliberate motion like twinkles/steam/drift still animates with t)
      Most sets RETURN an anchors object (world px) so characters land on the furniture.
   cafeSet(t, o)         cozy cafe: chalk menu board ("COFFEE"), window w/ drizzle, pendant lamps, counter,
                         pastry case, steaming cup. o.rain (bool, default true), o.outside 'day'|'dusk'
   campusSet(t, o)       a generic campus quad: clock tower + stone gateway + trees + plaza. o.time 'day'|'dusk'|'night',
                         o.gate (true), o.towerX (700)
   cityNightSet(t, o)    HERO: waterfront railing, a suspension bridge with travelling lights, skyline, moon, stars,
                         water reflections, lamp. o.lights (string lights across the top, default false), o.moon (true), o.lamp (true),
                         o.palm (a palm silhouette, default false)
   bedroomNightSet(t,o)  dark room, window (moon + city), curtains, fairy lights, wall clock, bed + blanket,
                         phone glow pool. o.clock '3:00', o.glow {x,y,r} | false (default {x:540,y:1380,r:300}),
                         o.lamp (bedside lamp on, default false)
   roadSet(t, o)         o.view 'street' (traffic jam, red tail lights) | 'dash' (car POV, windshield, wheel,
                         swinging air freshener, phone on mount). o.speed (lane dashes scroll; default 0 = jam),
                         o.phone {screen:'map'|'glow'|...} for the dash phone, o.time 'dusk'|'night'
   bowlingSet(t, o)      neon alley: lanes in perspective, pins at the end, neon STRIKE sign, score screens
                         (o.scores [a,b] totals), ball return. o.pinsDown 0..1 (end pins fall), o.neon (true)
   skySet(t, o)          o.mood 'grey' | 'pink' | 'sunrise' | 'night'; drifting clouds; o.sun 0..1 (sunrise
                         height), o.rain (grey only), o.clouds (count, default 6)
   paperVoid(t, o)       paper + riso halftone dots in two corners. o.tint (wash col), o.tintOp (40),
                         o.dot (PAL.hot), o.dot2 (PAL.teal), o.corners 'tl-br'|'tr-bl'|'all'|'none'
   dateNightSet(t, o)    string-light patio: brick facade, glowing arched window, striped awning w/ "PIZZA",
                         plants, foreground table w/ checked cloth + candle. o.table (true)
   homeRoomSet(t,o)      a bedroom: window over a quiet street + hills, corkboard whose ribbons/medals pile up with
                         o.level (a "how far along" knob 0..4), shelf + trophy (level>=1, o.trophy text), desk + lamp + laptop,
                         quilt bed, basketball under the bed, poster tube. o.time 'day'|'night'|'dusk' + o.dusk 0..1, o.lamp,
                         o.suitcase (packed, by the door), o.who 'sibling' (alternate dressing: blue quilt, plant, pennant, hoodie
                         on the chair), o.laptop false|'zoom'|'glow'|text. → {bed (sit point), desk, chair, door, floor}
   homeStairsSet(t,o)    a two-storey staircase, one vertical set — a bedroom door ajar at the top (o.door 0..1 light spill),
                         loft balusters, 12 steps rising bottom-right→top-left, white banister, photo frames, a hallway below with a
                         lamp on a console table (o.glow 0..1 lamp light; o.kitchenGlow alias). o.time 'day'|'night'.
                         → {step(k)→[x,y] foot point (0=bottom..n), n, top, bottom}
   kitchenSet(t,o)       o.view 'island' (painted cabinets o.cabinets, plain counter o.counter, window over the sink, stove with
                         pot + pan steaming (o.cooking), microwave, island + bar stools (o.stools, default 2), o.sofa sofa back in
                         the foreground) | 'nook' (butter walls, window + blinds, magnet board, round glass table with plates).
                         o.plate (a plate under a glass cover; o.note adds a note), o.phone (a phone on the island),
                         o.time 'day'|'evening'. → {counter, island, table}
   diningRoomSet(t,o)    dining room: patterned wallpaper (o.wall colour), wainscoting, a pendant light (o.chandelier glow),
                         long table (o.cover: a table runner), wooden chairs. o.plates n, o.plate (covered plate), o.laptop (a
                         laptop on the table). → {table, seatL, seatR}
   debateSet(t,o)        classroom set up for a speech/debate round: whiteboard (o.board, default 'DEBATE'), clock, door (o.room:
                         optional door plate), o.tab (a taped notice, default false), a tall wooden lectern (o.podiumH px, default 640)
                         with gooseneck mic, other kids' backs at desks (o.kids). → {podium:[x, topY], floor, standX}
   gymSet(t,o)           school gym: cinderblock, high windows, HOME/GUEST scoreboard (o.score [a,b], default dashes), folding
                         bleachers with spectators (o.crowd), wall hoop. o.arc 0..1 = a dotted ball-trajectory arc + ball,
                         o.shooter [x,y]. → {hoop, floor, shooter}
   scienceFairSet(t,o)   o.mode 'zoom' (default: a desk at night with a laptop video call — a grid of tiles (o.whiz, see zoomGrid)
                         — o.gadget adds a gadget case beside it (default false; o.open, o.spark)) → {screen, desk, briefcase}
                         | 'hall' (a convention hall: pennants, two rows of tables with tri-folds, one empty table near-left;
                         o.showcase: the near-right table gets a glowing display + banner o.banner (default 'BIG IDEA');
                         o.dream = thought-bubble frame) → {table (the empty table), next}
   classroomSet(t,o)     o.kind 'bio' (black-top lab benches with laptops, periodic table, cell-membrane poster, door) | 'test'
                         (QUIET / TEST IN PROGRESS board, rows of desks, clock o.clock ('11:00'), a backpack; o.buzz 0..1 makes
                         it shake and leak notification bubbles). → {seat, door, backpack}
   bandRoomSet(t,o)      instrument lockers, SIGN UP sheet, music on a butter poster, horseshoe risers, black stands,
                         percussion corner (bass drum, quads, sticks). → {floor, drums}
   courtSet(t,o)         outdoor neighbourhood court at dusk (o.time 'day'): golden hills, chain-link, hoop, two bikes, a paper
                         bag on the bench. → {hoop, floor}
   footballFieldSet(t,o) o.mode 'night' (Friday lights: light towers, far bleachers crowd, red track, turf, near bleachers,
                         a phone filming with a red dot — o.filming) | 'paper' (a field inked on notebook paper, hot end zone
                         lettered o.endzone ('GOAL'), 5/10 numbers, a big hot yard line o.marker (yards, default 5); o.zoom = tiny video call in the end
                         zone). → {yardY(yd)→y (0 = goal line), goalY, midX}
   clinicSet(t,o)        generic clinic lobby: fluorescent panels, blue wayfinding sign o.sign ('CLINIC'), take-a-number
                         kiosk (o.ticket, default 'A12'), sanitizer stand, stanchion line, plastic chairs, o.line people waiting.
                         → {lineX(i)→[x,y] spot i in line (0 = front), floor}
   dormSet(t,o)          a dorm room: indigo walls (o.time 'day' = white), window over rooftops, closet, pennant (o.pennant,
                         default 'GO!'), desk + chair + laptop + paper stack (o.paper: a form on the desk), mini fridge, quilted
                         bed (o.bed colour), round rug, sneakers, string lights (o.lights). → {bedL, rug, desk, window}
   apartmentSet(t,o)     shared apartment: white walls, grey plank floor, spinning ceiling fan, group-photo banner, door with a
                         mini hoop + paper sign (o.hoop), kitchen bar (blender, paper towels, microwave, o.stools n (2)), sectional,
                         giant plush bear, bean bag, card table. o.cake (birthday cake on the bar), o.card (birthday card),
                         o.shake 0..1 (room jitter), o.time 'night'. → {couch, bar, door, floor}
   videoCallSet(t,o)     study lounge at night with a laptop video call: glass wall to the night street + lamps, long table, a
                         laptop call (o.call 0..1, o.partners tiles) + a second laptop (o.notes text, 'NOTES'), papers. o.shake.
                         → {screen, seatL, seatR, table}
   oceanBalconySet(t,o)  balcony over the sea. o.time 'night' (default: moon path, shore lights) | 'sunset' (pink coral sky) |
                         'day' (deep blue, a cloud, surf, beach, shade tree, low building). o.headland (land on the horizon,
                         default false). White rail + glass. → {rail, sea}
   officeSet(t,o)        small office: blond-wood slats, cobalt accent panel (abstract shapes, o.sign optional text),
                         window to a city street with a passing bus (o.bus 0..1, default drifting; o.tram alias), desk + monitor
                         (o.monitor, default 'DASHBOARD') + laptop terminal, iced coffee, chair. o.time 'night'. o.view 'stage' =
                         a theatre-stage visual pun: red curtains, footlights, STAGING sign, a chained hot PROD door (o.prod 0..1 swings it
                         open with light). → {desk, chair, stage, door}
   bridgeDriveSet(t,o)   o.view 'backseat' (default: car back seat — big side window, suspender cables + light strings strobing
                         past (o.speed), blurred skyline, tail lights, rain on glass (o.rain), front seat back, phone glow pool)
                         → {window} | 'wide' (suspension span side-on: towers w/ red beacons, light-dotted cable, deck, skyline /
                         water reflections; put car() on deckY) → {deckY}. o.time 'night' (default) | 'golden' (golden hour).
   featureWallSet(t,o)   a bright painted feature wall with an abstract mark (no letters, no real lock-up), a photo backdrop.
                         o.col (wall colour). → {wall:{x,y,w,h}, floor}
   hackerHouseSet(t,o)   a living room turned office: violet LED strip, sliding glass door + sheer curtains + string lights,
                         wheeled whiteboard of flows (o.board, default 'IDEAS'), dining-table desk with laptop + external monitor,
                         red cups, mesh chair, dumbbells. o.time 'night'. → {desk, chair, board, screen}
   highriseSet(t,o)      upper-floor city apartment: floor-to-ceiling black-framed glass over water, glass tower next door
                         (o.bridge: a bridge span in the view, default false), bare quilted mattress, counter + takeout box.
                         o.time 'day'|'dusk'|'night'. → {bed, window, counter}
   airportGateSet(t,o)   dark gate before dawn: tarmac with blue taxi lights, plane at the gate, GATE sign (no number/airport),
                         carpet, two rows of empty seats. → {seat(i), floor}
   takeoutShopSet(t,o)   late-night takeout counter (NO logo): violet/pink neon, icon menu boards, window to the lot, PICKUP
                         shelf with o.bags takeoutBag()s, bar-height counter. → {shelf, counter}
   conferenceSet(t,o)    conference doors (generic): banner (o.banner text, default abstract shapes), glass doors with
                         light + crowd, a check-in table with name badges. → {door, floor}

 ---- PROPS: fn(x, y, s, o). s = scale (1 = natural size, sizes below), o.rot (radians), o.flip (mirror),
      o.t (time for life; default T). Anchor = CENTER unless noted.
   phone(x,y,s,o)        150×300. o.screen 'glow'|'off'|'chat'|'map'|'call'|'zoom' (o.tiles)|'record' (filming + red dot)|
                         'contacts' (list scrolling like a slot machine, o.scroll)|'email'|'results' (a page with a banner + star;
                         'portal' alias)|'confetti' (results + falling confetti); o.notif (badge number); o.halo (true).
                         RETURNS screen rect {x,y,w,h, body:{x,y,w,h}} in world px (rot ignored).
                         For 'chat' put receipt()s inside `.body` (below the header).
   laptop(x,y,s,o)       thin laptop, 460 wide, anchor = hinge centre. o.screen text (e.g. 'HELLO'),
                         o.glow (true). RETURNS screen rect {x,y,w,h}.
   flowers(x,y,s,o)      wrapped bouquet ~300×420, anchor = grip (where a hand holds it). o.wrap col,
                         o.blooms [cols], o.sway (0..1)
   boba(x,y,s,o)         anchor bottom-centre, 120×270. o.tea col, o.straw col
   froyo(x,y,s,o)        frozen-yogurt cup, anchor bottom-centre, 170×230. o.swirl col
   iceCream(x,y,s,o)     cone, anchor = centre of scoops, ~150×330. o.scoops [cols], o.melt 0..1
   pizza(x,y,s,o)        square-slice tray 440×300 (o.missing 0..5 slices eaten) or o.slice:true single slice
   golf(x,y,s,o)         club + ball + tee, anchor = tee base on the ground. o.swing (radians club angle),
                         o.ball {dx,dy} ball offset (flying), o.club (true), o.tee (true)
   bowlingBall(x,y,s,o)  r=80. o.col, o.spin (radians)
   bowlingPins(x,y,s,o)  10 pins, anchor bottom-centre of the formation (~300×230). o.fall 0..1 knocks them over
   car(x,y,s,o)          side view, anchor = bottom centre (ground), 560×230. o.col, o.shake 0..1, o.speed
                         (wheel spin), o.facing 1|-1, o.lights (headlights on), o.passengers (window tint lighter)
   blanket(x,y,s,o)      soft folded blanket 520×300. o.col, o.col2 (stripe), o.drape 'pile'|'flat'
   hoodie(x,y,s,o)       hoodie laid flat/held, 400×430. o.col, o.wave (0..1 sleeve wave)
   calendarPages(x,y,s,o) tear-off calendar 300×380. o.n (number), o.label ('DAYS'), o.tear 0..1 (top page
                         peels away, revealing o.next ?? o.n+1)
   clock(x,y,s,o)        analog, r=110. o.time 'H:MM' (or o.h, o.m numbers), o.rim col
   heart(x,y,s,o)        r≈100. o.beat 0..1 (pulse scale), o.col, o.crack (0..1)
   stringLights(x1,y1,x2,y2,t,o)  draped bulbs. o.sag (120), o.n (14), o.cols [..]
   meterProp(x,y,s,o)    giant thermometer, anchor bottom-centre, ~260×980. o.v 0..100, o.glow (0..1),
                         o.cracked (0..1), o.label (false | [line1, line2], default ['LOVE', 'METER'])
   sparkle(x,y,s,t,o)    4-point twinkle star, r≈40. o.col
   cloud(x,y,s,o)        o.kind 'speech'|'thought', o.w (420), o.h (260), o.tail [tx,ty] (world), o.col
   chatBubbleShape(x,y,s,o) painted chat bubble, anchor centre. o.who 'me'|'her', o.w (360), o.h (130),
                         o.typing (bouncing dots), o.text (painted scribble text, keep short), o.col (e.g. PAL.hot)
   mic(x,y,s,o)          handheld mic, anchor = handle centre, ~70×260
   lehengaSwirl(x,y,s,o) twirling embroidered full skirt (lehenga-style), anchor = waist centre (top), ~560×440. o.spin (0..1+),
                         o.col (cream white)
   pirateHat(x,y,s,o) / sailorHat(x,y,s,o)  anchor = bottom centre (sits on the head), ~300 / 220 wide
   briefcaseMachine(x,y,s,o)  (alias gadgetCase) a hobby electronics kit in a hard black case, ~560×300, anchor = hinge.
                         o.open 0..1 (lid swings up showing foam), inside: small screen, breadboard, jumper wires, battery
                         pack, little motor + fan, blinking LED. o.spark 0..1 (a wire sparks), o.cape (tiny cape),
                         o.readout (short text on the small screen, default none).
   walkingBoot(x,y,s,o)  grey air-cast walker with black velcro straps, rocker sole; anchor = sole bottom-centre, ~290×440.
                         o.off (lying on its side), o.strap col.
   trifold(x,y,s,o)      science-fair tri-fold on its table edge, anchor bottom-centre, ~620×420. o.title (short scribble),
                         o.col header, o.panels, o.angle fold, o.byline.
   trophy(x,y,s,o)       o.kind 'cup' (anchor base, ~300×480) | 'medal' | 'star' (a big medal with an embossed star; 'globe'
                         alias; anchor = medal centre, ribbon above). o.place text, o.col metal, o.cape, o.ribbon col.
   ribbon(x,y,s,o)       rosette ribbon, anchor = rosette centre, ~190×330. o.place (e.g. '1ST'), o.col, o.droop 0..1.
   placard(x,y,s,o)      name placard "<o.title> / <o.name>" (defaults 'REP.' / 'YOU'), 360×100.
   confettiLaptop(x,y,s,o)  laptop() showing a celebration screen (banner + gold star), raining riso confetti. o.burst 0..1 (drive with
                         seg()), o.screen (optional text instead). RETURNS screen rect.
   takeoutBag(x,y,s,o)   plain kraft paper bag, coral band + butter star (no logo), stapled receipt (o.receipt, o.items
                         ['COMBO #2', 'XTRA SAUCE']), o.steam, o.crumple. anchor bottom-centre, ~220×300.
   backpack(x,y,s,o)     a backpack (no logos), ~300×460, anchor centre. o.col/o.col2, o.view 'front'|'back' (straps),
                         o.tag (swinging lanyard tag), o.patch (hot patch).
   rejectionEmail(x,y,s,o)  email card 520×380: header o.from ('RE: UPDATE'), big o.word ('UNFORTUNATELY,'), grey body lines,
                         o.stamp 0..1 pops a hot "NO" stamp, o.count (a butter "×N" tally sticker).
   leasePaper(x,y,s,o)   (alias signaturePaper) a paper with signature lines: o.title ('FORM'), o.lines (4), o.signed (how many are signed,
                         default 0), o.blank (index of the highlighted unsigned line, default = first unsigned), o.ring 0..1 draws
                         a hot circle round it. 520×700.
   birthdayCake(x,y,s,o) vanilla cake with pink drips + sparkles; anchor = plate. o.candles n | o.num (big number
                         candles, e.g. '21'), o.lit (flicker), o.col frosting.
   savedPlate(x,y,s,o)   a covered plate: plate under a glass cover (o.note adds a sticky note); o.lid 0..1 lifts it.
   birthdayCard(x,y,s,o) sage "IT'S YOUR BIRTHDAY!" card with cartoon pandas, 300×420; o.open 0..1 reveals the signed inside.
   basketball / football / suitcase / bandaid (adhesive bandage)
   zoomGrid(x,y,w,h,t,o) paints a video-call grid INTO any screen rect (laptop()/phone() return one): o.n tiles, o.me (your tile,
                         green border), o.whiz + o.whizIdx (one tile shows someone in a lab coat with a glowing vial), o.hands, o.grey.
 ---- lettering painted INTO the world (sits under characters, unlike letter()):
   scribble(txt, x, y, size, col, {br:'ink'|'marker'|'cpencil'|'charcoal', sw, align:'center'|'left'|'right',
            slant, track, j})  — hand-lettered capitals/digits/():%!?.-' ; y = vertical middle. Returns width.
 ---- small helpers exported for chapters: halo(cx,cy,r,col,op,n) (clean light glow on dark),
      skyBands(y0,y1,cols,n,amp,seed) (painterly banded gradient), steam(x,y,t,n,h,col,op),
      blobPerson(x,y,s,col,skin,t,i) (6-shape background person: head + shoulders, for crowds/bleachers/lines).
 Benches: src/lab/sets_home.js, sets_places.js, sets_props.js, sets_calm.js
============================================================================================ */
(() => {
  const I = PAL.ink;
  const TT = () => (typeof T === 'number' ? T : 0);
  const N = (v, d) => (v === undefined || v === null ? d : v);

  // ---------- painting helpers ----------
  const F = (pts, col, o = {}) => paint(pts, { wash: col, washOp: N(o.op, 255), ink: N(o.ink, null), sw: N(o.sw, 1), br: o.br, curv: o.curv });
  const Rc = (x, y, w, h, col, o = {}) => F(rectPts(x, y, w, h, N(o.j, 0)), col, o);
  const Ec = (cx, cy, rx, ry, col, o = {}) => F(ellPts(cx, cy, rx, ry, N(o.n, 24), N(o.j, 0), N(o.rot, 0)), col, o);
  const RRc = (x, y, w, h, r, col, o = {}) => F(rrPts(x, y, w, h, Math.min(r, w / 2, h / 2), N(o.j, 0)), col, o);
  const TX = (pts, col, op = 90, o = {}) => paint(pts, { fill: col, fillOp: op, bleed: N(o.bleed, .04), tex: N(o.tex, .55), border: N(o.border, .3), ink: null, curv: o.curv });
  const ln = (pts, sw = 1, col = I, br = 'ink', curv = .5) => inkLine(pts, sw, col, br, curv);
  const tw = (i, t, f = .7) => .5 + .5 * Math.sin((t * f * (.6 + hash(i * 3.3)) + hash(i * 7.7)) * TAU);
  function ramp(cols, k) { k = clamp(k) * (cols.length - 1); const i = Math.min(cols.length - 2, Math.floor(k)); return mixCol(cols[i], cols[i + 1], k - i); }
  // clean, light-adding-looking glow: concentric low-opacity washes (fill() goes muddy on dark grounds)
  function halo(cx, cy, r, col, op = 70, n = 6) { for (let i = 0; i < n; i++) { const k = 1 - Math.pow(i / n, .85) * .86; Ec(cx, cy, r * k, r * k, col, { op: op / n * (.8 + i * .32), n: 24 }); } }
  // banded painterly gradient: each band has a wavy top edge and overlaps the previous one
  function skyBands(y0, y1, cols, n = 10, amp = 12, seed = 0, x0 = -90, x1 = W + 90) {
    const bh = (y1 - y0) / n;
    for (let i = 0; i < n; i++) {
      const y = y0 + i * bh, pts = [], st = 8;
      for (let k = 0; k <= st; k++) { const x = lerp(x0, x1, k / st); pts.push([x, y + (i ? Math.sin(k * 1.7 + seed + i * 2.1) * amp + (hash(seed * 13 + i * 7 + k) - .5) * amp : -40)]); }
      pts.push([x1, y1 + 60], [x0, y1 + 60]);
      F(pts, ramp(cols, i / (n - 1)));
    }
  }
  function stars(n, y0, y1, t, seed = 1, col = '#FFF6DA', x0 = 0, x1 = W) {
    for (let i = 0; i < n; i++) {
      const x = lerp(x0, x1, hash(seed * 31 + i * 1.37)), y = lerp(y0, y1, Math.pow(hash(seed * 17 + i * 2.71), 1.3)), b = tw(i + seed * 50, t, .9);
      const r = 2.5 + hash(i * 5.1 + seed) * 5 + b * 3;
      if (hash(i * 9.3 + seed) > .72) { halo(x, y, r * 4, col, 30 * b, 2); F(starPts(x, y, r * 2.2, .28, 4), col, { op: 160 + 95 * b }); }
      else Ec(x, y, r * .55, r * .55, col, { op: 110 + 140 * b, n: 8 });
    }
  }
  // seed the set's randomness → static texture (opt in to boiling with o.boil); restore the frame's seed after
  const setBegin = (id, t, o) => randomSeed(9000 + id * 101 + (o.boil ? Math.floor(t * BOIL) : 0));
  const setEnd = () => randomSeed(1000 + Math.floor(TT() * BOIL));
  const xf = (x, y, s, o, fn) => { push(); translate(x, y); rotate(o.rot || 0); scale(s * (o.flip ? -1 : 1), s); fn(); pop(); };
  const shade = (c, k) => mixCol(c, k > 0 ? '#FFFFFF' : '#1A1530', Math.abs(k));

  // ---------- painted stroke lettering ----------
  const GL = {
    A: [[[0, 1], [.3, 0], [.6, 1]], [[.13, .62], [.47, .62]]],
    B: [[[0, 1], [0, 0], [.38, 0], [.5, .1], [.5, .36], [.38, .47], [0, .47]], [[.38, .47], [.56, .6], [.56, .86], [.42, 1], [0, 1]]],
    C: [[[.58, .14], [.44, 0], [.2, 0], [.02, .22], [0, .5], [.02, .78], [.2, 1], [.44, 1], [.58, .86]]],
    D: [[[0, 0], [0, 1], [.28, 1], [.52, .8], [.56, .5], [.52, .2], [.28, 0], [0, 0]]],
    E: [[[.54, 0], [0, 0], [0, 1], [.54, 1]], [[0, .5], [.42, .5]]],
    F: [[[.54, 0], [0, 0], [0, 1]], [[0, .5], [.42, .5]]],
    G: [[[.58, .14], [.44, 0], [.2, 0], [.02, .22], [0, .5], [.02, .78], [.2, 1], [.44, 1], [.6, .82], [.6, .56], [.34, .56]]],
    H: [[[0, 0], [0, 1]], [[.55, 0], [.55, 1]], [[0, .5], [.55, .5]]],
    I: [[[.06, 0], [.42, 0]], [[.24, 0], [.24, 1]], [[.06, 1], [.42, 1]]],
    J: [[[.55, 0], [.55, .74], [.42, .96], [.2, 1], [0, .84]]],
    K: [[[0, 0], [0, 1]], [[.55, 0], [0, .58]], [[.17, .42], [.58, 1]]],
    L: [[[0, 0], [0, 1], [.5, 1]]],
    M: [[[0, 1], [0, 0], [.33, .62], [.66, 0], [.66, 1]]],
    N: [[[0, 1], [0, 0], [.55, 1], [.55, 0]]],
    O: [[[.3, 0], [.08, .12], [0, .5], [.08, .88], [.3, 1], [.52, .88], [.6, .5], [.52, .12], [.3, 0]]],
    P: [[[0, 1], [0, 0], [.38, 0], [.54, .13], [.54, .36], [.38, .5], [0, .5]]],
    Q: [[[.3, 0], [.08, .12], [0, .5], [.08, .88], [.3, 1], [.52, .88], [.6, .5], [.52, .12], [.3, 0]], [[.36, .72], [.64, 1.04]]],
    R: [[[0, 1], [0, 0], [.38, 0], [.54, .13], [.54, .36], [.38, .5], [0, .5]], [[.24, .5], [.58, 1]]],
    S: [[[.55, .12], [.4, 0], [.15, 0], [0, .14], [.02, .34], [.2, .46], [.4, .54], [.56, .7], [.55, .87], [.4, 1], [.14, 1], [0, .88]]],
    T: [[[0, 0], [.6, 0]], [[.3, 0], [.3, 1]]],
    U: [[[0, 0], [0, .72], [.12, .95], [.3, 1], [.48, .95], [.58, .72], [.58, 0]]],
    V: [[[0, 0], [.3, 1], [.6, 0]]],
    W: [[[0, 0], [.18, 1], [.36, .38], [.54, 1], [.72, 0]]],
    X: [[[0, 0], [.55, 1]], [[.55, 0], [0, 1]]],
    Y: [[[0, 0], [.3, .5], [.6, 0]], [[.3, .5], [.3, 1]]],
    Z: [[[0, 0], [.55, 0], [0, 1], [.56, 1]]],
    0: [[[.28, 0], [.06, .14], [0, .5], [.06, .86], [.28, 1], [.5, .86], [.56, .5], [.5, .14], [.28, 0]]],
    1: [[[.06, .2], [.26, 0], [.26, 1]], [[.04, 1], [.48, 1]]],
    2: [[[0, .2], [.14, .02], [.38, 0], [.54, .16], [.52, .36], [0, 1], [.58, 1]]],
    3: [[[0, .1], [.2, 0], [.44, 0], [.55, .14], [.54, .34], [.36, .47], [.18, .47]], [[.36, .47], [.57, .6], [.58, .84], [.42, 1], [.14, 1], [0, .9]]],
    4: [[[.44, 1], [.44, 0], [0, .68], [.6, .68]]],
    5: [[[.54, 0], [.06, 0], [.02, .44], [.32, .38], [.54, .52], [.56, .84], [.4, 1], [.12, 1], [0, .9]]],
    6: [[[.5, .04], [.3, 0], [.1, .14], [0, .5], [.02, .82], [.18, 1], [.4, 1], [.55, .84], [.54, .6], [.38, .47], [.16, .48], [.02, .62]]],
    7: [[[0, 0], [.58, 0], [.2, 1]]],
    8: [[[.28, .47], [.07, .36], [.06, .12], [.28, 0], [.5, .12], [.49, .36], [.28, .47], [.03, .62], [.03, .87], [.28, 1], [.54, .87], [.54, .62], [.28, .47]]],
    9: [[[.55, .4], [.4, .52], [.15, .52], [0, .38], [0, .14], [.16, 0], [.4, 0], [.56, .16], [.55, .45], [.48, .8], [.3, 1], [.06, .96]]],
    ':': [[[.08, .28], [.1, .31]], [[.08, .78], [.1, .81]]],
    '.': [[[.08, .94], [.1, .97]]],
    ',': [[[.12, .9], [.06, 1.1]]],
    '!': [[[.1, 0], [.1, .68]], [[.1, .92], [.11, .96]]],
    '?': [[[0, .18], [.14, .01], [.38, 0], [.54, .16], [.5, .36], [.28, .5], [.28, .7]], [[.28, .92], [.29, .96]]],
    "'": [[[.12, 0], [.08, .26]]],
    '’': [[[.12, 0], [.08, .26]]],
    '-': [[[.04, .52], [.4, .52]]],
    '+': [[[.04, .5], [.5, .5]], [[.27, .26], [.27, .74]]],
    '/': [[[.45, 0], [0, 1]]],
    '(': [[[.28, -.04], [.08, .3], [.06, .7], [.28, 1.04]]],
    ')': [[[.04, -.04], [.24, .3], [.26, .7], [.04, 1.04]]],
    '%': [[[.56, 0], [0, 1]], [[.12, .04], [.02, .16], [.12, .3], [.22, .16], [.12, .04]], [[.46, .7], [.36, .84], [.46, .98], [.56, .84], [.46, .7]]],
    '$': [[[.5, .16], [.36, .06], [.12, .08], [.04, .26], [.2, .44], [.4, .54], [.52, .74], [.4, .92], [.14, .92], [0, .82]], [[.27, -.06], [.27, 1.06]]],
  };
  const GW = { M: .66, W: .72, I: .48, ':': .2, '.': .2, ',': .2, '!': .22, "'": .22, '’': .22, '(': .34, ')': .34, '1': .5, '-': .44, '/': .45 };
  const ROUND = new Set('CGOQSUJ0235689?()$%BDP');
  function scribble(txt, x, y, size, col = I, o = {}) {
    const br = o.br || 'ink', sw = N(o.sw, Math.max(.35, size / 70)), track = N(o.track, .2), sl = N(o.slant, 0), wj = N(o.j, size * .018);
    const chars = [...String(txt).toUpperCase()], adv = c => (c === ' ' ? .42 : N(GW[c], .6)) + track;
    const total = (chars.reduce((s, c) => s + adv(c), 0) - track) * size;
    let cx = o.align === 'left' ? x : o.align === 'right' ? x - total : x - total / 2;
    const top = y - size / 2;
    for (const c of chars) {
      const g = GL[c];
      if (g) for (const s of g) ln(s.map(([u, v]) => [cx + u * size + (1 - v) * sl * size + jit(wj), top + v * size + jit(wj)]), sw, col, br, ROUND.has(c) ? .5 : 0);
      cx += adv(c) * size;
    }
    return total;
  }

  // ======================================================================================
  //                                         SETS
  // ======================================================================================

  // ---------- CAFE ----------
  function cafeSet(t, o = {}) {
    setBegin(1, t, o);
    const calmTop = o.calm === 'top', calmBot = o.calm === 'bottom';
    skyBands(-40, 1300, ['#F6E3BE', '#F1D7A6', '#E9C690', '#DDB17C'], 8, 8, 2);
    TX(rectPts(-60, 0, W + 120, 1280), '#E0B98A', 70, { tex: .7 });
    // wainscot / lower wall wood
    Rc(-40, 1040, W + 80, 240, '#B9835A');
    for (let i = 0; i < 12; i++) ln([[i * 98 + 20, 1050], [i * 98 + 20, 1270]], .5, '#8E5E3E', 'ink', 0);
    // window (left)
    const wx = 40, wy = calmTop ? 520 : 250, ww = 300, wh = calmTop ? 470 : 680;
    RRc(wx - 18, wy - 18, ww + 36, wh + 36, 10, '#5C4033', { ink: I, sw: 1 });
    const out = o.outside === 'dusk' ? ['#4C4B8E', '#B474A0', '#F2A98A'] : ['#A9CDE3', '#D5E6EC', '#E9EEE6'];
    skyBands(wy, wy + wh, out, 5, 4, 7, wx, wx + ww);
    // street outside: a tree + a building + a passing pedestrian umbrella
    Rc(wx + 170, wy + wh * .35, 130, wh * .65, o.outside === 'dusk' ? '#5E4E7E' : '#C9B9A6');
    for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) Rc(wx + 190 + c * 55, wy + wh * .4 + r * wh * .13, 30, 34, o.outside === 'dusk' ? '#F7D774' : '#8FB5C9', { op: 220 });
    Ec(wx + 70, wy + wh * .55, 90, 110, '#7FA872', { n: 18 }); TX(ellPts(wx + 70, wy + wh * .55, 95, 115, 18), '#5E8E5E', 120, { tex: .7 });
    Rc(wx + 64, wy + wh * .7, 14, wh * .3, '#5C4033');
    if (o.rain !== false) for (let i = 0; i < 26; i++) { const x = wx + 10 + hash(i * 3.1) * (ww - 20), y0 = wy + ((hash(i * 7.3) * wh + t * 520) % wh); if (y0 < wh - 30) ln([[x, wy + y0], [x - 6, wy + y0 + 30]], .35, '#FFFFFF', 'ink', 0); }
    // mullions
    Rc(wx + ww / 2 - 6, wy, 12, wh, '#5C4033'); Rc(wx, wy + wh * .45 - 6, ww, 12, '#5C4033');
    Rc(wx - 30, wy + wh + 14, ww + 60, 26, '#E8D5B0', { ink: I, sw: .8 }); // sill
    // plant on the sill
    RRc(wx + 30, wy + wh - 40, 70, 54, 10, '#E46F8C', { ink: I, sw: .8 });
    for (let k = 0; k < 5; k++) ln([[wx + 65, wy + wh - 36], [wx + 30 + k * 18, wy + wh - 110 - hash(k) * 30]], 1.3, '#4E8A5E', 'ink');
    if (!calmTop) {
      // pendant lamps (cords disappear behind the board)
      [[300, 780], [800, 800]].forEach(([lx, ly], i) => {
        ln([[lx, -10], [lx, ly - 70]], .6, I, 'ink', 0);
        const fl = .85 + .15 * tw(i + 40, t, 3.3);
        halo(lx, ly + 10, 210, '#FFE2A0', 70 * fl, 4);
        F([[lx - 26, ly - 72], [lx + 26, ly - 72], [lx + 74, ly], [lx - 74, ly]], '#2F5B4A', { ink: I, sw: 1, j: .6 });
        Ec(lx, ly + 6, 30, 14, '#FFF3C4', { op: 255 * fl });
      });
      // chalk menu board
      const bx = 400, by = 200, bw = 620, bh = 470;
      RRc(bx - 22, by - 22, bw + 44, bh + 44, 14, '#6B4A35', { ink: I, sw: 1.2 });
      Rc(bx, by, bw, bh, '#25463C');
      TX(rectPts(bx, by, bw, bh), '#3C6656', 120, { tex: .8 });
      const ch = '#F6EEDB';
      scribble('COFFEE', bx + bw / 2, by + 70, 74, ch, { br: 'cpencil', sw: 1.6, slant: .08 });
      ln([[bx + 150, by + 128], [bx + bw - 150, by + 124]], .8, PAL.blush, 'cpencil', 0);
      const items = ['LATTE', 'MOCHA', 'CHAI', 'COLD BREW'];
      items.forEach((it, i) => {
        const yy = by + 185 + i * 66;
        scribble(it, bx + 50, yy, 34, ch, { align: 'left', br: 'cpencil', sw: 1.1 });
        ln([[bx + 340, yy + 10], [bx + 470, yy + 10]], .4, ch, 'cpencil', 0);
        scribble(['5', '6', '4', '5'][i], bx + bw - 60, yy, 34, PAL.butter, { br: 'cpencil', sw: 1.1 });
      });
      // doodled heart + cup in the corner
      F(heartPts(bx + bw - 70, by + 64, 26), PAL.hot, { op: 200, ink: ch, sw: .6, br: 'cpencil' });
    }
    // counter
    const cy = 1265;
    Rc(-60, cy, W + 120, 40, '#E7D3B4', { ink: I, sw: 1.2 });
    Rc(-60, cy + 40, W + 120, H - cy, '#2F5B4A');
    TX(rectPts(-60, cy + 40, W + 120, H - cy), '#3D7360', 110, { tex: .7 });
    Rc(-60, cy + 40, W + 120, 26, '#24493C');
    if (!calmBot) for (let i = 0; i < 6; i++) RRc(i * 190 - 40, cy + 110, 160, 330, 14, '#356B57', { ink: '#1E3E33', sw: .6 });
    Rc(-60, cy + 480, W + 120, 18, '#C9A44A', { op: 200 });
    // pastry case (right)
    const px = 600, py = 1010, pw = 440, ph = 255;
    RRc(px, py, pw, ph, 12, '#D9ECEF', { op: 140, ink: I, sw: 1 });
    Rc(px + 10, py + ph * .52, pw - 20, 8, '#B9835A');
    // croissants
    for (let i = 0; i < 3; i++) { const cx = px + 80 + i * 130, yy = py + ph * .45; F([[cx - 50, yy], [cx - 30, yy - 30], [cx, yy - 40], [cx + 30, yy - 30], [cx + 50, yy], [cx + 20, yy - 10], [cx - 20, yy - 10]], '#E9AE3C', { ink: I, sw: .8, curv: .4 }); ln([[cx - 18, yy - 30], [cx - 10, yy - 8]], .5, '#B7772A'); ln([[cx + 16, yy - 30], [cx + 8, yy - 8]], .5, '#B7772A'); }
    // muffins + cookies bottom shelf
    for (let i = 0; i < 4; i++) { const cx = px + 70 + i * 100, yy = py + ph - 20; F([[cx - 34, yy], [cx - 28, yy - 40], [cx + 28, yy - 40], [cx + 34, yy]], '#F3A7B5', { ink: I, sw: .7 }); Ec(cx, yy - 46, 38, 24, i % 2 ? '#7A4E36' : '#E9C690', { ink: I, sw: .7 }); }
    F([[px + 30, py + 20], [px + 90, py + 20], [px + 40, py + ph - 20]], '#FFFFFF', { op: 60 });
    // register side: cups + steaming latte
    const ux = 220, uy = cy;
    // espresso machine
    RRc(ux - 210, uy - 230, 200, 230, 16, '#C9CCD6', { ink: I, sw: 1 });
    Rc(ux - 200, uy - 222, 180, 40, '#2F5B4A', { ink: I, sw: .5 });
    for (let k = 0; k < 2; k++) { Rc(ux - 175 + k * 90, uy - 150, 40, 20, '#2A2230'); Rc(ux - 165 + k * 90, uy - 130, 20, 26, '#7E838E'); }
    Ec(ux - 110, uy - 202, 10, 10, '#E14C5A', { op: 220 });
    Rc(ux - 200, uy - 40, 180, 30, '#9AA0AC', { ink: I, sw: .5 });
    // tip jar
    RRc(ux + 150, uy - 70, 54, 70, 10, '#D9ECEF', { op: 160, ink: I, sw: .7 }); Ec(ux + 170, uy - 18, 10, 8, '#86AE7A'); Ec(ux + 186, uy - 26, 8, 6, '#C9A44A');
    F([[ux + 20, uy - 110], [ux + 120, uy - 110], [ux + 110, uy], [ux + 30, uy]], '#FFFDF5', { ink: I, sw: 1 });
    Rc(ux + 24, uy - 80, 92, 34, '#2F5B4A');
    Ec(ux + 70, uy - 112, 52, 10, '#C8A27A', { ink: I, sw: .7 });
    for (let k = 0; k < 3; k++) { const ph2 = t * 1.1 + k * .33, a = frac(ph2); ln([[ux + 50 + k * 20, uy - 125 - a * 40], [ux + 46 + k * 20 + Math.sin(ph2 * 9) * 12, uy - 160 - a * 60], [ux + 54 + k * 20 + Math.sin(ph2 * 9 + 2) * 12, uy - 200 - a * 70]], .5, '#FFFFFF', 'ink'); }
    setEnd();
  }

  // ---------- CAMPUS (generic clock tower + stone gateway) ----------
  function campusSet(t, o = {}) {
    setBegin(2, t, o);
    const tm = o.time || 'day', calmTop = o.calm === 'top', night = tm === 'night', dusk = tm === 'dusk';
    const skies = { day: ['#7DB7E0', '#A6D0EC', '#CBE3EF', '#F1EAD8'], dusk: ['#3B3F82', '#7D5FA6', '#D9789A', '#F5A673', '#F8D38A'], night: ['#11143A', '#1C2154', '#2C3270', '#45478A'] };
    skyBands(-40, 1150, skies[tm] || skies.day, 10, 12, 4);
    if (night) { stars(40, 40, 760, t, 3); halo(240, 300, 150, '#FFF3D6', 50, 3); Ec(240, 300, 58, 58, '#FFF3D6'); Ec(225, 290, 12, 10, '#E8D9B6', { op: 160 }); }
    if (dusk) { halo(540, 1080, 420, '#FFD38A', 80, 4); }
    if (tm === 'day') { // drifting puffy clouds + birds
      for (let i = 0; i < 3; i++) { const cx = ((hash(i * 4.4) * 1400 + t * 18 * (1 + i * .4)) % 1500) - 200, cy = 180 + i * 170; cloudPuff(cx, cy, 240 - i * 40, '#FFFFFF'); }
      for (let i = 0; i < 4; i++) { const bx = ((hash(i * 2.2) * 1200 + t * 60) % 1300) - 100, by = 420 + hash(i) * 200 + Math.sin(t * 2 + i) * 10, f = Math.sin(t * 10 + i * 2) * 8; ln([[bx - 16, by - f], [bx, by], [bx + 16, by - f]], .6, I, 'ink', .3); }
    }
    // hills
    const hc = night ? '#22285A' : dusk ? '#6B4E86' : '#8FB59A';
    F([[-90, 1020], [120, 960], [380, 990], [620, 940], [860, 975], [1170, 935], [1170, 1300], [-90, 1300]], hc, { curv: .5 });
    TX([[-90, 1000], [1170, 950], [1170, 1150], [-90, 1150]], night ? '#33407E' : dusk ? '#8B6B9E' : '#6E9C7E', 90);
    // clock tower
    const tx = N(o.towerX, 700), stone = night ? '#8C93C2' : dusk ? '#F2C3A8' : '#EDE4D3', side = night ? '#5D6499' : dusk ? '#C98C8C' : '#CFC2AA';
    const base = 1180, sTop = 520, hw = 58;
    F([[tx - hw, base], [tx - hw + 4, sTop], [tx + hw - 4, sTop], [tx + hw, base]], stone, { ink: I, sw: 1.1 });
    F([[tx + 10, base], [tx + 12, sTop], [tx + hw - 4, sTop], [tx + hw, base]], side, { op: 200 });
    for (let k = -1; k <= 1; k++) ln([[tx + k * 26, sTop + 120], [tx + k * 27, base - 20]], .4, night ? '#4A5088' : '#A8987E', 'ink', 0);
    // clock face
    Ec(tx, sTop + 62, 34, 34, '#FFF8EA', { ink: I, sw: .8 }); ln([[tx, sTop + 62], [tx, sTop + 40]], .6); ln([[tx, sTop + 62], [tx + 16, sTop + 66]], .6);
    // belfry
    Rc(tx - hw - 8, sTop - 12, hw * 2 + 16, 16, stone, { ink: I, sw: .9 });
    Rc(tx - hw, sTop - 120, hw * 2, 110, stone, { ink: I, sw: 1 });
    const glowB = night || dusk;
    for (let k = 0; k < 2; k++) { const ax = tx - 22 + k * 44; F([[ax - 12, sTop - 22], [ax - 12, sTop - 84], [ax - 6, sTop - 98], [ax, sTop - 102], [ax + 6, sTop - 98], [ax + 12, sTop - 84], [ax + 12, sTop - 22]], glowB ? '#FFD98A' : '#5B5470', { ink: I, sw: .6 }); }
    if (glowB) halo(tx, sTop - 60, 140, '#FFD98A', night ? 70 : 40, 3);
    Rc(tx - hw - 10, sTop - 132, hw * 2 + 20, 16, stone, { ink: I, sw: .9 });
    // steep spire + finial
    F([[tx - hw - 2, sTop - 132], [tx, sTop - 330], [tx + hw + 2, sTop - 132]], night ? '#6F78A8' : dusk ? '#DDA48E' : '#9DB39B', { ink: I, sw: 1 });
    ln([[tx, sTop - 330], [tx, sTop - 370]], .7, I, 'ink', 0);
    // trees left + right
    const tg = night ? ['#1F3550', '#2B4766'] : dusk ? ['#4E5A78', '#6E6A8A'] : ['#5E8E5E', '#86AE7A'];
    treeClump(110, 1020, 250, tg, t, 1); treeClump(990, 1060, 220, tg, t, 2);
    if (!calmTop) treeClump(330, 1160, 150, tg, t, 3);
    // ground / plaza
    F([[-90, 1240], [1170, 1240], [1170, H + 80], [-90, H + 80]], night ? '#3B3E6A' : dusk ? '#C9A2A0' : '#E3D6BE');
    for (let i = -6; i <= 6; i++) ln([[540 + i * 70, 1250], [540 + i * 260, H + 40]], .35, night ? '#2B2E58' : '#BDAA8E', 'ink', 0);
    for (let k = 0; k < 6; k++) { const yy = 1250 + Math.pow(k / 6, 1.6) * 680; ln([[-60, yy], [W + 60, yy]], .35, night ? '#2B2E58' : '#BDAA8E', 'ink', 0); }
    // stone gateway
    if (o.gate !== false) campusGate(540, 1300, night, dusk, t);
    if (night) [[150, 1290], [930, 1290]].forEach(([lx, ly], i) => { Rc(lx - 6, ly - 330, 12, 330, '#1C1F40'); halo(lx, ly - 345, 120, '#FFE0A0', 80, 4); Ec(lx, ly - 345, 22, 26, '#FFF0C0', { ink: I, sw: .6 }); });
    setEnd();
  }
  function cloudPuff(cx, cy, w, col, op = 255) {
    const blobs = [[-.32, .05, .24], [-.1, -.12, .3], [.16, -.06, .26], [.36, .06, .18], [0, .1, .34]];
    blobs.forEach(([dx, dy, r], i) => Ec(cx + dx * w, cy + dy * w, r * w, r * w * .75, col, { op, n: 20 }));
    F([[cx - w * .55, cy + w * .1], [cx + w * .55, cy + w * .1], [cx + w * .5, cy + w * .2], [cx - w * .5, cy + w * .2]], col, { op });
  }
  // palm: trunk from (bx,by) to crown (cx,cy); fronds are tapered drooping leaves
  function palm(bx, by, cx, cy, t, col) {
    F([[bx - 14, by], [lerp(bx, cx, .5) + 12, lerp(by, cy, .5)], [cx + 7, cy], [cx - 7, cy], [lerp(bx, cx, .5) - 2, lerp(by, cy, .5)], [bx + 14, by]], col, { curv: .4 });
    for (let k = 0; k < 9; k++) {
      const side = k % 2 ? 1 : -1, a0 = -Math.PI / 2 + side * (.3 + (k >> 1) * .38) + Math.sin(t * .9 + k) * .04, L = 150 + hash(k * 2.3) * 70;
      const spine = []; for (let i = 0; i <= 6; i++) { const u = i / 6, a = a0 + side * u * u * 1.4; spine.push([cx + Math.cos(a0) * L * u * .9 + side * u * u * 30, cy + Math.sin(a0) * L * u * .9 + u * u * L * .75]); }
      const left = [], right = [];
      spine.forEach(([x, y], i) => { const w = Math.sin(i / 6 * Math.PI) * 18 + 2; right.push([x + w * .5, y + w]); left.unshift([x - w * .5, y - w * .4]); });
      F([...right, ...left], col, { curv: .4 });
    }
    Ec(cx, cy + 4, 16, 12, col);
  }
  function treeClump(cx, cy, r, cols, t, seed) {
    Rc(cx - r * .08, cy, r * .16, r * 1.2, '#5C4033');
    const sway = Math.sin(t * .8 + seed) * r * .02;
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + seed, d = r * (.35 + hash(seed * 9 + i) * .25); Ec(cx + Math.cos(a) * d + sway, cy - r * .2 + Math.sin(a) * d * .7, r * .55, r * .48, cols[i % 2], { n: 20 }); }
    TX(ellPts(cx + sway, cy - r * .2, r * 1.05, r * .85, 22), cols[0], 120, { tex: .75 });
    Ec(cx - r * .2 + sway, cy - r * .5, r * .3, r * .22, mixCol(cols[1], '#FFFFFF', .25), { op: 120 });
  }
  function campusGate(cx, by, night, dusk, t) {
    const stone = night ? '#7F86B8' : dusk ? '#E6B8A2' : '#E8DDC8', bronze = night ? '#2E3E52' : '#3F6B5E';
    const half = 330, ph = 360, pw = 80;
    // low iron railing between the pillars (behind them): pickets with spear tips + two rails
    for (let k = -4; k <= 4; k++) { const x = cx + k * 66, yt = by - ph * .5; ln([[x, yt], [x, by - 6]], .7, bronze, 'ink', 0); F([[x - 6, yt], [x, yt - 18], [x + 6, yt]], bronze); }
    ln([[cx - half + 40, by - ph * .46], [cx + half - 40, by - ph * .46]], .7, bronze, 'ink', 0); ln([[cx - half + 40, by - 40], [cx + half - 40, by - 40]], .7, bronze, 'ink', 0);
    // pillars
    [-1, 1].forEach(d => {
      const px = cx + d * half - pw / 2;
      Rc(px, by - ph, pw, ph, stone, { ink: I, sw: 1.1 });
      Rc(px - 10, by - ph - 20, pw + 20, 26, stone, { ink: I, sw: .9 });
      Rc(px + 12, by - ph * .7, pw - 24, ph * .4, mixCol(stone, '#000000', .08), { ink: I, sw: .4 });
    });
    // flat stone lintel across the pillar tops + cornice
    Rc(cx - half - pw / 2 - 14, by - ph - 70, half * 2 + pw + 28, 54, stone, { ink: I, sw: 1.1 });
    Rc(cx - half - pw / 2 - 24, by - ph - 84, half * 2 + pw + 48, 16, mixCol(stone, '#000000', .06), { ink: I, sw: .8 });
    for (let k = -3; k <= 3; k++) Rc(cx + k * 90 - 20, by - ph - 54, 40, 22, mixCol(stone, '#000000', .08), { ink: I, sw: .3 });
    // lamps on the lintel ends
    [-1, 1].forEach(d => {
      const lx = cx + d * half, ly = by - ph - 134;
      Rc(lx - 4, ly + 20, 8, 30, bronze);
      if (night || dusk) halo(lx, ly, 90, '#FFE3A0', night ? 70 : 35, 3);
      F([[lx - 18, ly + 22], [lx - 24, ly - 20], [lx, ly - 36], [lx + 24, ly - 20], [lx + 18, ly + 22]], night || dusk ? '#FFF0BE' : '#EDE6D2', { ink: I, sw: .7 });
    });
  }

  // ---------- CITY NIGHT (hero) ----------
  function cityNightSet(t, o = {}) {
    setBegin(3, t, o);
    const calmTop = o.calm === 'top', HY = 1045;
    skyBands(-40, HY + 20, ['#10133A', '#171B47', '#222659', '#33306D', '#523F82', '#7B4F8E', '#B06A92', '#D98A97'], 13, 12, 5);
    stars(calmTop ? 26 : 46, 30, 820, t, 7);
    if (o.moon !== false) { const mx = N(o.moonX, 800), my = N(o.moonY, 330); halo(mx, my, 230, '#FFE9C8', 70, 4); Ec(mx, my, 66, 66, '#FFF4DC'); Ec(mx - 18, my - 12, 13, 11, '#EADBC0', { op: 170 }); Ec(mx + 20, my + 18, 9, 8, '#EADBC0', { op: 150 }); Ec(mx + 12, my - 26, 6, 5, '#EADBC0', { op: 140 }); }
    // horizon haze glow
    halo(330, HY, 520, '#F2A0A8', 60, 3);
    // far hills across the water
    F([[300, HY + 4], [520, HY - 30], [760, HY - 18], [900, HY - 40], [1180, HY - 20], [1180, HY + 10], [300, HY + 10]], '#3C356E', { curv: .5 });
    // ---- skyline (left) ----
    const back = '#3E3874', front = '#25234F', win = '#FFD98E';
    const bl = [[-20, 120, 210], [90, 90, 300], [160, 110, 250], [330, 80, 330], [430, 130, 190], [520, 80, 150]];
    bl.forEach(([x, w, h]) => Rc(x, HY - h, w, h + 12, back));
    // a slim slab tower with a rounded top
    F([[462, HY], [466, HY - 320], [480, HY - 344], [497, HY - 350], [514, HY - 344], [528, HY - 320], [532, HY]], '#4B4482', { ink: '#1A1838', sw: .6 });
    // the tallest tower: a tapered top with a beacon
    const sx = 262;
    F([[sx - 60, HY + 10], [sx - 56, HY - 440], [sx - 20, HY - 540], [sx + 20, HY - 540], [sx + 56, HY - 440], [sx + 60, HY + 10]], '#2C2B5E', { ink: '#15143A', sw: .7 });
    Ec(sx, HY - 544, 4, 4, '#FF6B6B', { op: 220, n: 8 });
    const cr = .75 + .25 * tw(77, t, .25);
    halo(sx, HY - 470, 130, '#FFE6C0', 45 * cr, 3);
    F([[sx - 50, HY - 450], [sx + 50, HY - 450], [sx + 50, HY - 462], [sx - 50, HY - 462]], '#F6E2C8', { op: 180 * cr });
    for (let k = 0; k < 9; k++) ln([[sx - 48 + k * 1.2, HY - 420 + k * 46], [sx + 48 - k * 1.2, HY - 420 + k * 46]], .25, '#4A4890', 'ink', 0);
    const fl = [[-30, 100, 160], [60, 70, 230], [120, 80, 140], [335, 70, 210], [400, 60, 130]];
    fl.forEach(([x, w, h], bi) => {
      Rc(x, HY - h, w, h + 12, front);
      for (let r = 0; r < Math.floor(h / 34); r++) for (let c = 0; c < Math.floor(w / 26); c++) {
        const id = bi * 100 + r * 10 + c; if (hash(id * 1.9) < .45) continue;
        const on = hash(id * 3.1 + Math.floor(t * .4 + hash(id) * 5)) > .18;
        if (on) Rc(x + 8 + c * 26, HY - h + 12 + r * 34, 11, 15, win, { op: 150 + 100 * hash(id) });
      }
    });
    // ---- suspension bridge (right, receding left) ----
    const dk = x => lerp(958, HY - 6, (1130 - x) / (1130 - 470)); // deck y at x
    const towers = [[915, 640], [665, 815]];
    const span = (x0, y0, x1, y1, sag) => u => [lerp(x0, x1, u), lerp(y0, y1, u) + sag * 4 * u * (1 - u)];
    const cables = [span(1140, 600, 915, 640, 260), span(915, 640, 665, 815, 150), span(665, 815, 505, dk(505), 40)];
    // soft bridge glow
    halo(800, 870, 330, '#C9C7FF', 34, 3);
    // deck
    F([[1150, 950], [470, HY - 8], [470, HY - 1], [1150, 974]], '#141433');
    // cables + suspenders + light waves travelling along the span
    cables.forEach((cf, ci) => {
      const pts = []; for (let k = 0; k <= 10; k++) pts.push(cf(k / 10));
      ln(pts, ci === 0 ? .9 : .7, '#1A1A40', 'ink', .5);
      const ns = [12, 14, 6][ci];
      for (let k = 1; k < ns; k++) {
        const u = k / ns, [cx, cy] = cf(u), dy = dk(cx);
        ln([[cx, cy], [cx, dy]], .22, '#2A2A5A', 'ink', 0);
        for (let m = 0; m < 3; m++) {
          const yy = lerp(cy, dy, (m + .5) / 3), wave = .5 + .5 * Math.sin(cx * .035 - t * 4.2 + m * .9 + ci);
          const b = clamp(wave * wave * 1.3 + .12 * tw(ci * 50 + k * 3 + m, t, 2));
          if (b > .15) Ec(cx, yy, 2.4 + b * 2.2, 2.4 + b * 2.2, '#F4F2FF', { op: 70 + 185 * b, n: 8 });
        }
      }
    });
    towers.forEach(([x, top], i) => {
      const dy = dk(x), w = i ? 9 : 13;
      F([[x - w, dy + 4], [x - w * .6, top], [x + w * .6, top], [x + w, dy + 4]], '#1D1C45', { ink: '#0F0E2A', sw: .5 });
      for (let k = 1; k < 4; k++) ln([[x - w, top + (dy - top) * k / 4], [x + w, top + (dy - top) * k / 4]], .3, '#2E2D60', 'ink', 0);
      Ec(x, top - 4, 4, 4, '#FF6B6B', { op: 140 + 115 * tw(i + 90, t, 1.2), n: 8 }); // aircraft warning light
    });
    // car lights crawling along the deck
    for (let i = 0; i < 12; i++) { const u = frac(hash(i * 2.9) + t * (.035 + hash(i) * .02) * (i % 2 ? 1 : -1)), x = lerp(1140, 480, u); Ec(x, dk(x) - 3, 3.5 - u * 1.5, 2.5 - u, i % 2 ? '#FFE3A0' : '#FF7A7A', { op: 220, n: 8 }); }
    // ---- water ----
    skyBands(HY, 1560, ['#463A78', '#2E2C64', '#222352', '#1A1B44', '#14163A'], 7, 4, 9);
    halo(330, HY + 30, 320, '#D98A97', 26, 2);
    // reflections: shimmering dashes under lights (bridge cool, skyline warm, moon cream)
    const refl = [[800, '#E6E4FF', 18, 180], [700, '#E6E4FF', 14, 140], [940, '#E6E4FF', 14, 120], [262, '#FFE2B0', 12, 200], [120, '#FFD98E', 10, 140], [380, '#FFD98E', 10, 120]];
    if (o.moon !== false) refl.push([N(o.moonX, 800) + 60, '#FFF4DC', 14, 360]);
    refl.forEach(([rx, col, n, len], ri) => {
      for (let k = 0; k < n; k++) {
        const yy = HY + 14 + Math.pow(k / n, 1.2) * len * 2.2, wv = Math.sin(t * 2.2 + k * 1.3 + ri) * (6 + k * 1.5), wd = (12 + 30 * hash(ri * 20 + k)) * (1 - k / n * .5);
        const b = .4 + .6 * tw(ri * 40 + k, t, 1.6);
        F([[rx + wv - wd, yy], [rx + wv + wd, yy - 2], [rx + wv + wd * .8, yy + 4], [rx + wv - wd * .9, yy + 5]], col, { op: 170 * b * (1 - k / n * .6) });
      }
    });
    // ---- foreground promenade ----
    F([[-90, 1520], [1170, 1505], [1170, H + 80], [-90, H + 80]], '#2B2847');
    TX(rectPts(-90, 1510, W + 180, 420), '#3A3560', 100, { tex: .7 });
    // optional palm silhouette (left, behind railing)
    if (o.palm) palm(70, 1440, 80 + Math.sin(t * .6) * 5, 900, t, '#1A1840');
    // lamp post (right)
    if (o.lamp !== false) {
      const lx = 985, ly = 690, fl = .9 + .1 * tw(31, t, 4);
      halo(lx, ly, 260, '#FFD98E', 85 * fl, 5);
      for (let i = 0; i < 3; i++) Ec(lx - 40, 1600, 300 - i * 80, 60 - i * 15, '#FFD98E', { op: 26 * fl });
      Rc(lx - 9, ly + 30, 18, 1540 - ly, '#14132E', { ink: '#0D0C22', sw: .5 });
      F([[lx - 30, ly + 34], [lx - 38, ly - 26], [lx, ly - 54], [lx + 38, ly - 26], [lx + 30, ly + 34]], '#FFF0C4', { ink: '#14132E', sw: 1 });
      ln([[lx, ly - 54], [lx, ly - 80]], .9, '#14132E', 'ink', 0);
    }
    // railing
    const ry = 1400;
    Rc(-60, ry, W + 120, 22, '#4A4570', { ink: '#141330', sw: .9 });
    ln([[-60, ry + 3], [W + 60, ry + 3]], .4, '#8C86B8', 'ink', 0);
    for (let k = 0; k < 3; k++) ln([[-60, ry + 48 + k * 30], [W + 60, ry + 48 + k * 30]], .5, '#5A5480', 'ink', 0);
    for (let i = 0; i < 8; i++) Rc(-20 + i * 160, ry + 18, 18, 120, '#3A3560', { ink: '#141330', sw: .6 });
    if (o.lights) stringLights(-30, 120, W + 30, 250, t, { sag: 150, n: 16 });
    setEnd();
  }

  // ---------- BEDROOM at night ----------
  function bedroomNightSet(t, o = {}) {
    setBegin(4, t, o);
    const calmTop = o.calm === 'top', lamp = !!o.lamp;
    skyBands(-40, 1200, ['#1F2250', '#262A5E', '#2C3168', '#33386E'], 6, 5, 3);
    TX(rectPts(-60, 0, W + 120, 1200), '#3A3F7E', 80, { tex: .7 });
    // window
    const wx = 110, wy = calmTop ? 640 : 250, ww = 400, wh = calmTop ? 360 : 560;
    Rc(wx - 20, wy - 20, ww + 40, wh + 40, '#4A4C82', { ink: I, sw: 1 });
    skyBands(wy, wy + wh, ['#0F1236', '#1B1F52', '#2E2F6E', '#4D3F7E'], 5, 3, 6, wx, wx + ww);
    stars(10, wy + 10, wy + wh * .6, t, 11, '#FFF6DA', wx + 10, wx + ww - 10);
    const mx = wx + ww * .7, my = wy + wh * .26; halo(mx, my, 110, '#FFF0D0', 60, 3); Ec(mx, my, 38, 38, '#FFF4DC'); Ec(mx + 14, my - 8, 34, 34, '#1B1F52'); // crescent
    for (let i = 0; i < 7; i++) { const bw = 40 + hash(i * 3) * 40, bh = 60 + hash(i * 5) * 140, bx = wx + i * 60 - 10; Rc(bx, wy + wh - bh, bw, bh, '#14163A'); for (let r = 0; r < 3; r++) if (hash(i * 7 + r + Math.floor(t * .3 + i)) > .45) Rc(bx + 10, wy + wh - bh + 14 + r * 30, 8, 10, '#FFD98E', { op: 220 }); }
    Rc(wx + ww / 2 - 6, wy, 12, wh, '#4A4C82'); Rc(wx, wy + wh / 2 - 6, ww, 12, '#4A4C82');
    // curtains (gentle sway)
    [-1, 1].forEach(d => {
      const ex = d < 0 ? wx - 50 : wx + ww + 50, sw = Math.sin(t * .7 + d) * 10, inner = d < 0 ? wx + 70 : wx + ww - 70;
      F([[ex, wy - 50], [inner, wy - 50], [inner + sw - d * 30, wy + wh * .45], [ex + d * -10 + sw, wy + wh + 60], [ex, wy + wh + 60]], '#8C5E9E', { curv: .4 });
      for (let k = 1; k < 4; k++) ln([[lerp(ex, inner, k / 4), wy - 40], [lerp(ex, inner, k / 4) + sw * .5 - d * 12, wy + wh + 50]], .4, '#5E3E78', 'ink', .4);
    });
    Rc(wx - 80, wy - 64, ww + 160, 16, '#C9A44A', { ink: I, sw: .7 });
    // fairy lights along the wall
    stringLights(-20, calmTop ? 560 : 140, W + 20, calmTop ? 600 : 190, t, { sag: 70, n: 13, cols: ['#FFE3A0', '#FFD0E0', '#FFF1C8'] });
    // wall clock
    if (o.clock !== false) clock(860, calmTop ? 760 : 470, .95, { time: o.clock || '3:00', rim: '#E46F8C', t });
    // poster
    if (!calmTop) { Rc(580, 330, 110, 150, '#F3A7B5', { ink: I, sw: .8, j: .6 }); F(heartPts(635, 405, 26), '#FF4FA0', { ink: I, sw: .5 }); Rc(610, 318, 50, 22, '#F7D774', { op: 200 }); }
    // headboard + bed
    RRc(60, 960, 960, 300, 60, '#5A3E5E', { ink: I, sw: 1.1 });
    for (let k = 1; k < 6; k++) ln([[60 + k * 160, 990], [60 + k * 160, 1250]], .4, '#3E2A44', 'ink', 0);
    // pillows
    RRc(110, 1110, 380, 160, 70, '#B9B0D6', { ink: I, sw: 1, j: .8 });
    RRc(560, 1120, 380, 150, 70, '#C9B3D0', { ink: I, sw: 1, j: .8 });
    // blanket covering the bottom
    const bc = o.blanketCol || '#5E5294';
    F([[-90, 1230], [200, 1210], [520, 1250], [820, 1215], [1170, 1240], [1170, H + 90], [-90, H + 90]], bc, { ink: I, sw: 1.1, curv: .4 });
    for (let k = 0; k < 5; k++) { const yy = 1330 + k * 120; ln([[-40 + k * 30, yy], [300, yy + 30 + k * 6], [640, yy - 10], [1100, yy + 24]], .6, '#3E3470', 'ink', .6); }
    // stripes on the blanket edge (cozy)
    F([[-90, 1290], [1170, 1300], [1170, 1336], [-90, 1326]], '#B4709E', { op: 220 });
    // nightstand + lamp
    Rc(930, 1150, 170, 230, '#6B4A5E', { ink: I, sw: 1 });
    Rc(940, 1250, 150, 10, '#4A3242');
    if (lamp) halo(985, 1040, 260, '#FFD98E', 90, 4);
    F([[945, 1060], [1025, 1060], [1045, 1120], [925, 1120]], lamp ? '#FFE9B0' : '#8E7AA8', { ink: I, sw: .9 });
    Rc(978, 1120, 14, 32, '#C9A44A');
    // phone glow pool
    const g = o.glow === undefined ? { x: 540, y: 1380, r: 300 } : o.glow;
    if (g) { const p = .92 + .08 * Math.sin(t * 2.3); halo(g.x, g.y - g.r * .9, g.r * 1.5, '#9FB8FF', 30, 3); for (let i = 0; i < 5; i++) Ec(g.x, g.y, g.r * p * (1 - i * .17), g.r * p * .55 * (1 - i * .17), '#CFE2FF', { op: 34 + i * 8 }); }
    setEnd();
  }

  // ---------- ROAD (traffic jam / dashboard) ----------
  function carRear(cx, by, w, col, t, i, brake = 1) {
    const h = w * .62;
    halo(cx - w * .33, by - h * .45, w * .45 * (.8 + .4 * brake), '#FF4A4A', 55 * brake, 3); halo(cx + w * .33, by - h * .45, w * .45 * (.8 + .4 * brake), '#FF4A4A', 55 * brake, 3);
    Rc(cx - w * .42, by - h * .12, w * .16, h * .14, '#141420'); Rc(cx + w * .26, by - h * .12, w * .16, h * .14, '#141420');
    RRc(cx - w * .5, by - h * .72, w, h * .62, w * .1, col, { ink: I, sw: .7 * w / 200 + .2 });
    F([[cx - w * .36, by - h * .72], [cx - w * .26, by - h], [cx + w * .26, by - h], [cx + w * .36, by - h * .72]], shade(col, -.15), { ink: I, sw: .5 * w / 200 + .2 });
    F([[cx - w * .3, by - h * .74], [cx - w * .22, by - h * .95], [cx + w * .22, by - h * .95], [cx + w * .3, by - h * .74]], '#4A5A8A', { op: 230 });
    Rc(cx - w * .4, by - h * .52, w * .18, h * .1, brake > .5 ? '#FF3B3B' : '#8E2A2A'); Rc(cx + w * .22, by - h * .52, w * .18, h * .1, brake > .5 ? '#FF3B3B' : '#8E2A2A');
    Rc(cx - w * .12, by - h * .4, w * .24, h * .1, '#FFF6E0', { op: 200 });
  }
  function streetScene(t, o, y0, y1) {
    const dusk = o.time !== 'night', VP = [540, y0 + (y1 - y0) * .42];
    skyBands(y0 - 40, VP[1] + 40, dusk ? ['#3E3A7E', '#8C5C9E', '#E07E8E', '#F6A87A', '#F8C98A'] : ['#12153A', '#1E2250', '#33306D', '#4E3F7E'], 8, 8, 8);
    if (!dusk) stars(16, y0 + 20, VP[1] - 200, t, 21);
    // buildings both sides, receding
    for (let s = -1; s <= 1; s += 2) for (let k = 0; k < 6; k++) {
      const u = k / 6, xN = 540 + s * (560 - u * 380), xF = 540 + s * (560 - (u + 1 / 6) * 380), hN = (700 - u * 400), yb = VP[1] + (y1 - VP[1]) * (.5 - u * .42);
      const col = dusk ? ['#6B4E7E', '#7E5A86', '#5E4A78'][k % 3] : ['#262658', '#2E2C64', '#22224E'][k % 3];
      F([[xN, yb + 60], [xN, yb - hN], [xF, yb - hN * .82], [xF, yb + 40]], col, { ink: I, sw: .5 });
      for (let r = 0; r < 4; r++) if (hash(k * 9 + r + s * 3) > .4) { const wx = lerp(xN, xF, .4), wy = yb - hN * (.2 + r * .18); Rc(wx - 10, wy, 20, 22, '#FFD98E', { op: dusk ? 150 : 230 }); }
    }
    // road
    F([[-90, y1 + 60], [VP[0] - 40, VP[1]], [VP[0] + 40, VP[1]], [1170, y1 + 60]], dusk ? '#4E4866' : '#2A2842');
    TX([[-90, y1 + 60], [VP[0] - 40, VP[1]], [VP[0] + 40, VP[1]], [1170, y1 + 60]], dusk ? '#6E6280' : '#3A3660', 90);
    // lane dashes (scroll with speed)
    const sp = N(o.speed, 0);
    for (const lx of [-.33, .33]) for (let k = 0; k < 8; k++) {
      const u = frac(k / 8 + t * sp * .15), z1 = Math.pow(u, 2.2), z2 = Math.pow(Math.min(1, u + .05), 2.2);
      const yA = lerp(VP[1], y1, z1), yB = lerp(VP[1], y1, z2), xA = VP[0] + lx * 1400 * z1, xB = VP[0] + lx * 1400 * z2;
      F([[xA - 2 - z1 * 8, yA], [xA + 2 + z1 * 8, yA], [xB + 2 + z2 * 8, yB], [xB - 2 - z2 * 8, yB]], '#F7E7B8', { op: 220 });
    }
    // traffic light
    const tlx = 900, tly = y0 + (y1 - y0) * .2;
    Rc(tlx - 5, tly, 10, VP[1] - tly + 60, '#1C1B30');
    RRc(tlx - 30, tly - 120, 60, 150, 12, '#22213A', { ink: I, sw: .7 });
    halo(tlx, tly - 85, 70, '#FF4A4A', 70, 3); Ec(tlx, tly - 85, 16, 16, '#FF4A4A'); Ec(tlx, tly - 45, 16, 16, '#4A4A30'); Ec(tlx, tly - 5, 16, 16, '#2E4A3A');
    // jam of cars (far → near)
    const rows = [[.08, [-.25, .25]], [.2, [-.33, .3]], [.4, [-.36, .34]], [.7, [-.34, .32]]];
    rows.forEach(([z, xs], ri) => xs.forEach((lx, ci) => {
      const yb = lerp(VP[1], y1, z) + 10, w = 70 + z * 520, cx = VP[0] + lx * 1400 * z + (ci ? 1 : -1) * w * .1;
      const brake = .55 + .45 * tw(ri * 7 + ci, t, .35);
      carRear(cx, yb, w, ['#E46F8C', '#3E6FA8', '#E9AE3C', '#86AE7A', '#7E62AE', '#F2876A', '#FFF6E6', '#33407E'][(ri * 2 + ci) % 8], t, ri * 2 + ci, brake);
    }));
  }
  function roadSet(t, o = {}) {
    setBegin(5, t, o);
    if (o.view === 'dash') {
      streetScene(t, o, 0, 1300);
      // car interior frame
      F([[-90, -90], [1170, -90], [1170, 120], [-90, 160]], '#1E1C2E');
      F([[-90, -90], [120, -90], [40, 1300], [-90, 1300]], '#26243A', { ink: I, sw: 1 });
      F([[1170, -90], [960, -90], [1040, 1300], [1170, 1300]], '#26243A', { ink: I, sw: 1 });
      // rear-view mirror + swinging air freshener (little tree)
      RRc(410, 120, 260, 70, 30, '#2E2C44', { ink: I, sw: 1 }); RRc(424, 132, 232, 46, 22, '#6E86B8');
      const sw = Math.sin(t * 2.6) * .35 + Math.sin(t * 5.1) * .06, ax = 540, ay = 196, L = 140;
      ln([[ax, ay], [ax + Math.sin(sw) * L, ay + Math.cos(sw) * L]], .4, I, 'ink', 0);
      const tx2 = ax + Math.sin(sw) * L, ty2 = ay + Math.cos(sw) * L;
      F(xform([[0, -6], [24, 34], [12, 34], [30, 66], [-30, 66], [-12, 34], [-24, 34]], tx2, ty2, 1, -sw), '#4FB07A', { ink: I, sw: .7 });
      // dashboard
      F([[-90, 1240], [300, 1200], [780, 1200], [1170, 1240], [1170, H + 90], [-90, H + 90]], '#2A283E', { ink: I, sw: 1.2, curv: .3 });
      TX(rectPts(-90, 1230, W + 180, 700), '#3A3654', 90);
      ln([[-60, 1300], [1140, 1300]], .5, '#4A4670', 'ink', 0);
      // steering wheel (left, LHD)
      const wx = 300, wy = 1660;
      Ec(wx, wy, 300, 280, '#000000', { op: 0, ink: '#121120', sw: 5.5, n: 36 });
      F([[wx - 280, wy + 20], [wx - 60, wy - 30], [wx + 60, wy - 30], [wx + 280, wy + 20], [wx + 60, wy + 40], [wx - 60, wy + 40]], '#1A1928', { ink: I, sw: .8 });
      Ec(wx, wy + 5, 70, 60, '#24233A', { ink: I, sw: 1 });
      // dash phone on a mount, showing the map
      Rc(812, 1240, 26, 70, '#14131F');
      phone(825, 1150, .78, { screen: (o.phone && o.phone.screen) || 'map', rot: .04, notif: o.phone && o.phone.notif, t });
      // vents
      for (let k = 0; k < 2; k++) RRc(560 + k * 120, 1340, 90, 40, 12, '#1A1928', { ink: I, sw: .5 });
    } else {
      streetScene(t, o, 0, H);
    }
    setEnd();
  }

  // ---------- BOWLING (neon alley) ----------
  function bowlingSet(t, o = {}) {
    setBegin(6, t, o);
    const calmTop = o.calm === 'top', VP = [540, 640];
    skyBands(-40, 900, ['#120E2C', '#1B1440', '#251A52', '#2E1F5E'], 6, 6, 4);
    TX(rectPts(-60, 0, W + 120, 900), '#3A2A70', 70, { tex: .7 });
    // masking unit above pins with neon swooshes
    F([[160, 470], [920, 470], [880, 690], [200, 690]], '#2A1B4E', { ink: I, sw: 1 });
    const nOn = o.neon === false ? 0 : (.82 + .18 * tw(5, t, 6)) * (hash(Math.floor(t * 8)) > .05 ? 1 : .35);
    if (nOn) { halo(540, 580, 300, '#FF4FA0', 40 * nOn, 3); ln([[230, 640], [380, 540], [540, 600], [700, 520], [850, 620]], 1.4, '#FF6FB4', 'marker', .6); ln([[260, 660], [420, 590], [600, 640], [820, 560]], 1.1, '#5FE0D8', 'marker', .6); }
    // lanes (3) in perspective
    const yB = H + 60, lanes = [-1, 0, 1];
    F([[-200, yB], [VP[0] - 260, 690], [VP[0] + 260, 690], [1280, yB]], '#2A1E3E'); // floor between
    lanes.forEach(L => {
      const xL0 = VP[0] + (L - .45) * 230, xR0 = VP[0] + (L + .45) * 230, xL1 = 540 + (L - .45) * 900, xR1 = 540 + (L + .45) * 900;
      F([[xL1, yB], [xL0, 700], [xR0, 700], [xR1, yB]], L === 0 ? '#E9C690' : '#C9A26E', { ink: I, sw: .9 });
      TX([[xL1, yB], [xL0, 700], [xR0, 700], [xR1, yB]], '#F2D4A0', 110, { tex: .6 });
      for (let k = 1; k < 7; k++) ln([[lerp(xL1, xR1, k / 7), yB], [lerp(xL0, xR0, k / 7), 700]], .25, '#B98A50', 'ink', 0);
      // gutters
      F([[xR1, yB], [xR0, 700], [xR0 + 12, 700], [xR1 + 70, yB]], '#1A1430');
      if (L === 0) { // arrows + foul line
        for (let k = 0; k < 5; k++) { const z = .55, x = lerp(lerp(xL0, xR0, (k + 1) / 6), lerp(xL1, xR1, (k + 1) / 6), z), y = lerp(700, yB, z); F([[x, y - 26], [x + 10, y + 6], [x - 10, y + 6]], '#7E4E36', { op: 200 }); }
        F([[lerp(xL0, xL1, .82), lerp(700, yB, .82)], [lerp(xR0, xR1, .82), lerp(700, yB, .82)], [lerp(xR0, xR1, .83), lerp(700, yB, .83)], [lerp(xL0, xL1, .83), lerp(700, yB, .83)]], '#E14C5A');
      }
      // lane-end glow + pins
      halo(lerp(xL0, xR0, .5), 700, 120, '#FFF0D0', 60, 3);
      bowlingPins(lerp(xL0, xR0, .5), 704, .32, { fall: L === 0 ? N(o.pinsDown, 0) : 0, t });
    });
    // score monitors
    if (!calmTop) [[300, 250], [780, 250]].forEach(([mx, my], i) => {
      ln([[mx, -10], [mx, my - 90]], .6, I, 'ink', 0);
      RRc(mx - 160, my - 90, 320, 180, 14, '#14122A', { ink: I, sw: 1.1 });
      Rc(mx - 140, my - 70, 280, 140, '#1E4A6A');
      for (let c = 0; c < 4; c++) { Rc(mx - 136 + c * 70, my - 66, 64, 132, '#10324A', { op: 180, ink: '#5FE0D8', sw: .3 }); }
      scribble(i ? 'G' : 'F', mx - 104, my - 40, 30, '#FFFFFF', { sw: .8 });
      scribble('X', mx - 34, my - 40, 34, '#FF6FB4', { sw: 1 });
      scribble(i ? '9' : '7', mx + 36, my - 40, 30, '#FFFFFF', { sw: .8 });
      scribble(i ? '/' : '2', mx + 106, my - 40, 30, '#FFFFFF', { sw: .8 });
      scribble(String((o.scores || ['90', '100'])[i]), mx + 80, my + 30, 34, '#F7D774', { sw: .9 });
    });
    // neon STRIKE sign (left wall)
    if (!calmTop && nOn) {
      halo(540, 120, 260, '#FF4FA0', 55 * nOn, 3);
      scribble('STRIKE!', 540, 120, 92, '#FF6FB4', { br: 'marker', sw: 2.2, track: .26 });
      scribble('STRIKE!', 540, 120, 92, '#FFE6F2', { sw: .55, track: .26, j: 0 });
    }
    // ball return (bottom left) with balls
    F([[30, 1660], [330, 1600], [380, 1700], [380, 1960], [30, 1960]], '#3A2A5E', { ink: I, sw: 1 });
    bowlingBall(120, 1620, .55, { col: '#E14C8C', t }); bowlingBall(220, 1600, .55, { col: '#3E9C97', t }); bowlingBall(310, 1580, .5, { col: '#F7D774', t });
    // lounge glow
    halo(1000, 1700, 300, '#7E62AE', 40, 3);
    setEnd();
  }

  // ---------- SKY ----------
  function skySet(t, o = {}) {
    setBegin(7, t, o);
    const mood = o.mood || 'pink', calm = o.calm;
    const pal = { grey: ['#6E7890', '#8C96A8', '#A9B1BC', '#C4C6C6'], pink: ['#C3B1E1', '#E7B4D2', '#F3C2C9', '#F8DCC2', '#FBE9C8'], sunrise: ['#2E2F6E', '#5A4585', '#A3628E', '#E7868C', '#F6A87A', '#F9CF85', '#FBE6B0'], night: ['#0F1236', '#1A1E50', '#2A2E68', '#3C3A7A'] };
    skyBands(-40, H + 40, pal[mood] || pal.pink, 14, 18, 3);
    TX(rectPts(-60, 0, W + 120, H), mood === 'grey' ? '#9AA2B2' : '#F3C2C9', 50, { tex: .7 });
    if (mood === 'night') stars(70, 40, 1700, t, 13);
    if (mood === 'sunrise') { const sy = lerp(1700, 1150, N(o.sun, .5)); halo(540, sy, 620, '#FFE6A8', 90, 5); Ec(540, sy, 150, 150, '#FFF0C4'); for (let k = 0; k < 12; k++) { const a = k / 12 * TAU + t * .05, r1 = 210, r2 = 300 + 40 * Math.sin(t * 2 + k); F([[540 + Math.cos(a - .04) * r1, sy + Math.sin(a - .04) * r1], [540 + Math.cos(a) * r2, sy + Math.sin(a) * r2], [540 + Math.cos(a + .04) * r1, sy + Math.sin(a + .04) * r1]], '#FFF0C4', { op: 120 }); } }
    const n = N(o.clouds, 6), cc = { grey: '#D6D8DC', pink: '#FFF4F0', sunrise: '#F9C3B0', night: '#3E4280' }[mood] || '#FFFFFF';
    for (let i = 0; i < n; i++) {
      let cy = 160 + hash(i * 3.7 + 1) * 1500;
      if (calm === 'top' && cy < 820) cy += 800; if (calm === 'bottom' && cy > 1250) cy -= 900;
      const w = 260 + hash(i * 5.3) * 260, cx = ((hash(i * 1.9) * 1500 + t * (14 + hash(i) * 24)) % (1500)) - 210;
      cloudPuff(cx, cy, w, shade(cc, -.12), 255); cloudPuff(cx - w * .04, cy - w * .05, w * .94, cc, 255);
    }
    if (mood === 'grey' && o.rain !== false) for (let i = 0; i < 40; i++) { const x = hash(i * 2.3) * W, y = (hash(i * 4.1) * H + t * 900) % H; ln([[x, y], [x - 10, y + 50]], .35, '#E4E8F0', 'ink', 0); }
    setEnd();
  }

  // ---------- PAPER VOID ----------
  function paperVoid(t, o = {}) {
    setBegin(8, t, o);
    if (o.tint) F(rectPts(-80, -80, W + 160, H + 160), o.tint, { op: N(o.tintOp, 40) });
    const corners = { 'tl-br': [[0, 0], [W, H]], 'tr-bl': [[W, 0], [0, H]], all: [[0, 0], [W, H], [W, 0], [0, H]], none: [] }[o.corners || 'tl-br'];
    const step = 40, R = 560, c1 = o.dot || PAL.hot, c2 = o.dot2 || PAL.teal;
    corners.forEach(([cx, cy], ci) => {
      const sx = cx ? -1 : 1, sy = cy ? -1 : 1, dr = Math.sin(t * .6 + ci) * 4;
      for (let i = 0; i * step < R; i++) for (let j = 0; j * step < R; j++) {
        const x = cx + sx * (i * step + 20), y = cy + sy * (j * step + 20) + (i % 2) * step * .5 * sy, d = Math.hypot(x - cx, y - cy), r = 16 * Math.pow(Math.max(0, 1 - d / R), 1.2);
        if (r < 1.6) continue;
        Ec(x, y, r, r, ci % 2 ? c2 : c1, { op: 175, n: 9 });
        if (r > 5) Ec(x + 6 + dr, y + 5, r * .75, r * .75, ci % 2 ? c1 : c2, { op: 95, n: 9 });
      }
    });
    setEnd();
  }

  // ---------- DATE NIGHT patio ----------
  function dateNightSet(t, o = {}) {
    setBegin(9, t, o);
    const calmTop = o.calm === 'top';
    skyBands(-40, 700, ['#151A44', '#1F2552', '#2B2E62', '#3A3570'], 6, 6, 4);
    stars(14, 30, 300, t, 17);
    // brick facade
    const fy = calmTop ? 760 : 330;
    Rc(-60, fy, W + 120, 1300 - fy, '#B5574A');
    TX(rectPts(-60, fy, W + 120, 1300 - fy), '#C96A50', 110, { tex: .7 });
    for (let r = 0; r * 44 < 1300 - fy; r++) { ln([[-40, fy + r * 44], [W + 40, fy + r * 44]], .25, '#7E3A34', 'ink', 0); for (let c = 0; c < 9; c++) if (hash(r * 13 + c) > .55) { const x = c * 130 + (r % 2) * 65; ln([[x, fy + r * 44], [x, fy + r * 44 + 44]], .25, '#7E3A34', 'ink', 0); } }
    Rc(-60, fy - 14, W + 120, 22, '#8E4038', { ink: I, sw: .8 });
    // painted sign on the brick + striped awning
    const awY = fy + (calmTop ? 40 : 150);
    if (!calmTop) {
      RRc(300, fy + 26, 480, 100, 14, '#2A2230', { ink: '#F7D774', sw: 1 });
      halo(540, fy + 76, 200, '#F7D774', 30, 2);
      scribble('PIZZA', 540, fy + 76, 66, '#F7D774', { br: 'marker', sw: 1.7, track: .3 });
    }
    // big glowing arched window (under the awning)
    const ax = 540, aw = 460, ay = awY + 60, ah = 1250 - ay, rA = aw / 2;
    const arch = [[ax - rA, ay + ah]]; for (let i = 0; i <= 12; i++) { const a = Math.PI + i / 12 * Math.PI; arch.push([ax + Math.cos(a) * rA, ay + rA + Math.sin(a) * rA]); } arch.push([ax + rA, ay + ah]);
    halo(ax, ay + ah * .5, 460, '#FFD98E', 70, 4);
    F(arch.map(([x, y]) => [x + (x - ax) * .08, y + (y > ay + rA ? 0 : -(ay + rA - y) * .08)]), '#6B3A2E', { ink: I, sw: 1.1 });
    F(arch, '#FFE6A8', { ink: I, sw: 1 });
    TX(rectPts(ax - rA, ay + rA * .5, aw, ah - rA * .5), '#F6B868', 110);
    // interior: pendant lamp + two diners (heads + shoulders), leaning in
    ln([[ax, ay + 20], [ax, ay + 150]], .5, '#7E4A30', 'ink', 0); F([[ax - 40, ay + 185], [ax - 14, ay + 150], [ax + 14, ay + 150], [ax + 40, ay + 185]], '#7E4A30'); Ec(ax, ay + 188, 22, 8, '#FFF6D0');
    [[-1, '#C27A55'], [1, '#B86E4E']].forEach(([d, c]) => { const hx = ax + d * 120, hy = ay + ah - 230; Ec(hx - d * 6, hy, 44, 50, c, { op: 200 }); F([[hx - 90, ay + ah], [hx - 80, hy + 70], [hx, hy + 44], [hx + 80, hy + 70], [hx + 90, ay + ah]], c, { op: 200, curv: .4 }); });
    Rc(ax - 160, ay + ah - 90, 320, 16, '#8E4A30', { op: 220 });
    ln([[ax, ay + rA * .2], [ax, ay + ah]], 1, '#5C3424', 'ink', 0); ln([[ax - rA, ay + rA + 40], [ax + rA, ay + rA + 40]], 1, '#5C3424', 'ink', 0);
    if (!calmTop) {
      for (let k = 0; k < 9; k++) F([[100 + k * 98, awY], [198 + k * 98, awY], [208 + k * 102, awY + 110], [96 + k * 102, awY + 110]], k % 2 ? '#FFF6E6' : '#D9474E', { ink: I, sw: .6 });
      for (let k = 0; k < 9; k++) Ec(152 + k * 102, awY + 110, 51, 22, k % 2 ? '#FFF6E6' : '#D9474E', { ink: I, sw: .5 });
    }
    // plants either side
    [[90, 1220], [990, 1220]].forEach(([px, py], i) => {
      for (let k = 0; k < 9; k++) { const a = -Math.PI / 2 + (k - 4) * .28 + Math.sin(t * .8 + k + i) * .03, L = 160 + hash(k + i * 9) * 120; F(xform([[0, 0], [14, -L * .5], [0, -L], [-14, -L * .5]], px + (k - 4) * 6, py - 50, 1, a + Math.PI / 2), k % 2 ? '#4E8A5E' : '#6EA872', { ink: I, sw: .4 }); }
      RRc(px - 70, py - 60, 140, 120, 18, '#C9734E', { ink: I, sw: .9 });
    });
    // string lights across the sky
    stringLights(-30, calmTop ? 600 : 80, W + 30, calmTop ? 650 : 190, t, { sag: 140, n: 14 });
    // patio floor
    F([[-90, 1290], [1170, 1290], [1170, H + 90], [-90, H + 90]], '#5A3E48');
    for (let k = 0; k < 6; k++) ln([[-60, 1290 + Math.pow(k / 6, 1.5) * 650], [W + 60, 1290 + Math.pow(k / 6, 1.5) * 650]], .3, '#3E2A34', 'ink', 0);
    // foreground table with checked cloth + candle
    if (o.table !== false) {
      const ty = 1560;
      F([[22, ty + 10], [1058, ty + 10], [1030, H + 90], [50, H + 90]], '#C8414A', { ink: I, sw: 1 });
      for (let k = 0; k < 8; k++) ln([[60 + k * 135, ty + 30], [70 + k * 135, H + 40]], .5, '#9A2E36', 'ink', 0);
      F(ellPts(540, ty, 520, 150, 32), '#FFF6E6');
      for (let k = -4; k <= 4; k++) F([[540 + k * 110 - 26, ty - 150 + Math.abs(k) * 6], [540 + k * 110 + 26, ty - 150 + Math.abs(k) * 6], [540 + k * 130 + 32, ty + 150 - Math.abs(k) * 6], [540 + k * 130 - 32, ty + 150 - Math.abs(k) * 6]], '#D9474E', { op: 110 });
      for (let k = -2; k <= 2; k++) F([[30, ty + k * 56 - 14], [1050, ty + k * 56 - 14], [1050, ty + k * 56 + 14], [30, ty + k * 56 + 14]], '#D9474E', { op: 100 });
      F(ellPts(540, ty, 520, 150, 32), '#FFF6E6', { op: 0, ink: I, sw: 1.2 });
      // candle jar
      const cx = 820, cyy = ty - 40, fl = .85 + .15 * Math.sin(t * 17) * Math.sin(t * 7.3);
      halo(cx, cyy - 70, 160 * fl, '#FFD98E', 90, 4);
      RRc(cx - 34, cyy - 80, 68, 90, 14, '#F3A7B5', { op: 200, ink: I, sw: .8 });
      Rc(cx - 22, cyy - 60, 44, 66, '#FFF6E6');
      F([[cx, cyy - 118 - 10 * fl], [cx + 10, cyy - 86], [cx, cyy - 76], [cx - 10, cyy - 86]], '#FFE07A', { curv: .5 });
      F([[cx, cyy - 104 - 4 * fl], [cx + 5, cyy - 86], [cx - 5, cyy - 86]], '#FFFFFF', { curv: .5 });
      [[300, ty - 60], [390, ty - 20]].forEach(([gx, gy]) => { F([[gx - 26, gy - 90], [gx + 26, gy - 90], [gx + 20, gy], [gx - 20, gy]], '#D9ECEF', { op: 150, ink: I, sw: .7 }); Rc(gx - 20, gy - 50, 40, 46, '#BFE0F0', { op: 120 }); });
    }
    setEnd();
  }

  // ======================================================================================
  //                                         PROPS
  // ======================================================================================
  function phone(x, y, s = 1, o = {}) {
    const t = N(o.t, TT()), w = 150, h = 300, r = 30, scr = o.screen || 'glow';
    const sx = -w / 2 + 9, sy = -h / 2 + 9, sW = w - 18, sH = h - 18;
    xf(x, y, s, o, () => {
      if (N(o.halo, scr === 'glow')) halo(0, 0, h * .85, '#BFD9FF', 60, 4);
      RRc(-w / 2, -h / 2, w, h, r, o.body || '#2B2A3A', { ink: I, sw: 1.1, j: .6 });
      Rc(w / 2 - 2, -h / 2 + 70, 6, 46, '#2B2A3A', { ink: I, sw: .4 });
      if (scr === 'off') { RRc(sx, sy, sW, sH, r - 9, '#15151F'); F([[sx + 30, sy + 6], [sx + 70, sy + 6], [sx + 6, sy + 150], [sx + 6, sy + 90]], '#FFFFFF', { op: 26 }); }
      else {
        const bgc = { chat: '#FFFFFF', map: '#EDE7D6', call: '#2E3150', glow: '#DCEAFF', zoom: '#1E1E26', record: '#2A3A2A', contacts: '#FFFFFF', email: '#FFFFFF', confetti: '#FFFFFF', results: '#FFFFFF', portal: '#FFFFFF' }[scr] || '#DCEAFF';
        RRc(sx, sy, sW, sH, r - 9, bgc);
        if (scr === 'glow') { F([[sx, sy + sH * .3], [sx + sW, sy + sH * .15], [sx + sW, sy + sH * .5], [sx, sy + sH * .65]], '#FFFFFF', { op: 120 }); Rc(sx + 18, sy + 60, sW - 36, 30, '#B8D2FF', { op: 200 }); Rc(sx + 18, sy + 100, sW * .5, 18, '#B8D2FF', { op: 160 }); }
        if (scr === 'chat') {
          Rc(sx, sy, sW, 52, '#F1F1F4'); Ec(0, sy + 24, 12, 12, '#C3B1E1', { ink: I, sw: .3 }); Rc(-14, sy + 40, 28, 5, '#9A9AA0');
          if (o.fakeBubbles) { RRc(sx + 8, sy + 70, 80, 26, 12, PAL.imsgGrey); RRc(sx + sW - 88, sy + 106, 80, 26, 12, PAL.imsgBlue); RRc(sx + 8, sy + 142, 64, 26, 12, PAL.imsgGrey); }
        }
        if (scr === 'map') {
          for (let k = 0; k < 4; k++) { Rc(sx, sy + 30 + k * 64, sW, 10, '#FFFFFF'); Rc(sx + 18 + k * 36, sy, 8, sH, '#FFFFFF'); }
          Rc(sx + 70, sy + 60, 30, 40, '#BFE0C0'); Rc(sx + 10, sy + 180, 40, 50, '#BFE0C0');
          ln([[sx + 22, sy + sH - 30], [sx + 22, sy + 160], [sx + 94, sy + 160], [sx + 94, sy + 40]], .9, PAL.hot, 'ink', 0);
          const u = frac(t * .15), px = u < .5 ? sx + 22 : lerp(sx + 22, sx + 94, clamp((u - .5) * 4)), py = u < .5 ? lerp(sy + sH - 30, sy + 160, u * 2) : sy + 160;
          Ec(px, py, 8, 8, '#2A2230', { ink: '#FFFFFF', sw: .4 });
          Ec(sx + 94, sy + 40, 9, 9, PAL.hot);
        }
        if (scr === 'zoom') zoomGrid(sx + 4, sy + 40, sW - 8, sH - 90, t, { n: N(o.tiles, 4), me: 0 });
        if (scr === 'record') { Rc(sx, sy, sW, sH, '#5E9A5A', { op: 200 }); for (let k = 0; k < 5; k++) ln([[sx, sy + 40 + k * 50], [sx + sW, sy + 30 + k * 50]], .5, '#EAF4E0', 'ink', 0); const b = .5 + .5 * Math.sin(t * 6); Ec(0, sy + sH - 40, 18, 18, '#FFFFFF', { ink: I, sw: .4 }); Ec(0, sy + sH - 40, 12, 12, '#FF3B30'); Ec(sx + 20, sy + 20, 7, 7, '#FF3B30', { op: 120 + 135 * b, n: 8 }); }
        if (scr === 'contacts') { const off = (t * N(o.scroll, 3)) % 1; for (let k = -1; k < 8; k++) { const yy = sy + 30 + (k + 1 - off) * 34; if (yy < sy + 10 || yy > sy + sH - 20) continue; Ec(sx + 22, yy, 11, 11, ['#C3B1E1', '#F3A7B5', '#9CC8E8', '#F7D774', '#86AE7A'][(k + Math.floor(t * N(o.scroll, 3)) + 50) % 5], { n: 10 }); Rc(sx + 42, yy - 5, 50 + hash(k + Math.floor(t * N(o.scroll, 3))) * 40, 9, '#2A2230', { op: 160 }); } }
        if (scr === 'email') { Rc(sx, sy, sW, 40, '#F1F1F4'); Ec(sx + 20, sy + 70, 12, 12, '#9CC8E8', { n: 10 }); Rc(sx + 40, sy + 64, 70, 9, '#2A2230', { op: 200 }); for (let k = 0; k < 7; k++) Rc(sx + 12, sy + 100 + k * 22, sW - 30 - hash(k) * 40, 7, '#9A9AA8', { op: 160 }); }
        if (scr === 'confetti' || scr === 'results' || scr === 'portal') { Rc(sx, sy, sW, 44, '#33407E'); F(starPts(0, sy + sH * .45, 34, .45, 5), '#F7D774', { ink: I, sw: .4 }); if (scr === 'confetti') for (let k = 0; k < 22; k++) { const u = frac(hash(k * 3) + t * .5), px = sx + hash(k * 7) * sW, py = sy + u * sH; F(xform(rectPts(-6, -3, 12, 6), px, py, 1, t * 5 + k), [PAL.hot, PAL.butter, PAL.teal, PAL.coral][k % 4]); } }
        if (scr === 'call') { Ec(0, sy + 90, 38, 38, '#F3A7B5', { ink: '#FFFFFF', sw: .4 }); Ec(-34, sy + sH - 40, 18, 18, '#FF3B30'); Ec(34, sy + sH - 40, 18, 18, '#34C759'); }
      }
      RRc(-24, -h / 2 + 16, 48, 13, 7, '#0B0B12');
      if (o.notif) {
        const n = typeof o.notif === 'number' && o.notif > 99 ? '99+' : String(o.notif), bw = 22 + Math.max(0, n.length - 1) * 11;
        RRc(w / 2 - bw / 2 - 8 - bw / 2, -h / 2 - 16, bw * 1.3, 40, 20, '#FF3B30', { ink: I, sw: .7 });
        scribble(n, w / 2 - 8 - bw / 2 + bw * .15, -h / 2 + 4, 22, '#FFFFFF', { sw: .55, track: .12 });
      }
    });
    const k = s, R0 = { x: x + sx * k, y: y + sy * k, w: sW * k, h: sH * k };
    R0.body = { x: R0.x, y: y + (sy + 56) * k, w: R0.w, h: (sH - 56) * k };
    return R0;
  }

  function laptop(x, y, s = 1, o = {}) {
    const W2 = 460, Hs = 290;
    xf(x, y, s, o, () => {
      if (o.glow !== false) halo(0, -Hs / 2, 330, '#CFE2FF', 45, 3);
      RRc(-W2 / 2, -Hs, W2, Hs, 18, '#C9CCD6', { ink: I, sw: 1.1, j: .6 });
      Rc(-W2 / 2 + 14, -Hs + 14, W2 - 28, Hs - 30, '#F4F6FB');
      if (o.screen) {
        Rc(-W2 / 2 + 14, -Hs + 14, W2 - 28, 26, '#FF6A2A', { op: 230 });
        scribble(o.screen, 0, -Hs + 74, Math.min(38, 560 / Math.max(6, o.screen.length)), '#2A2230', { sw: .8 });
        for (let k = 0; k < 4; k++) { Rc(-W2 / 2 + 40, -Hs + 112 + k * 38, 120, 8, '#9A9AA8', { op: 200 }); RRc(-W2 / 2 + 180, -Hs + 104 + k * 38, 220, 24, 6, '#FFFFFF', { ink: '#B8BCCB', sw: .35 }); }
      } else F([[-W2 / 2 + 14, -Hs + 30], [-60, -Hs + 14], [W2 / 2 - 14, -Hs + 14], [W2 / 2 - 14, -40]], '#DCEAFF', { op: 200 });
      Ec(0, -Hs + 8, 3, 3, '#2A2230', { n: 8 });
      // base (keyboard deck seen from the front, slim wedge)
      F([[-W2 / 2 - 30, 0], [W2 / 2 + 30, 0], [W2 / 2 + 50, 22], [-W2 / 2 - 50, 22]], '#D6D9E2', { ink: I, sw: 1 });
      Rc(-60, 4, 120, 8, '#B5B9C6');
    });
    return { x: x + (-W2 / 2 + 14) * s, y: y + (-Hs + 14) * s, w: (W2 - 28) * s, h: (Hs - 30) * s };
  }

  function flowers(x, y, s = 1, o = {}) {
    const t = N(o.t, TT()), blooms = o.blooms || [PAL.blush, PAL.butter, '#F7B9C8', PAL.rose, '#FFE9A8', PAL.blush, '#F3A7B5', PAL.butter, '#F7B9C8'];
    const wc = o.wrap || '#F7D7E0', wc2 = shade(wc, -.1);
    xf(x, y, s, o, () => {
      const sw = Math.sin(t * 1.6) * .04 * N(o.sway, 1);
      // back sheet of wrapping paper (flared, pleated top)
      F([[-40, 150], [-200, -150], [-120, -210], [-40, -170], [40, -220], [130, -200], [200, -140], [40, 150]], wc2, { ink: I, sw: 1, curv: .25, j: .6 });
      // leaves + baby's breath
      [[-150, -110, -1.0], [150, -100, 1.0], [-100, -190, -.45], [110, -185, .5], [10, -215, .05]].forEach(([lx, ly, a]) => F(xform([[0, 0], [22, -40], [0, -95], [-22, -40]], lx * .9, ly + 40, 1, a + sw), '#6EA872', { ink: I, sw: .6 }));
      for (let k = 0; k < 16; k++) { const a = -Math.PI * .9 + hash(k * 2.7) * Math.PI * .8, r = 150 + hash(k * 5.3) * 60; Ec(Math.cos(a) * r * .85, -40 + Math.sin(a) * r * .9, 6, 6, '#FFFFFF', { op: 230, n: 8, ink: k % 3 ? null : I, sw: .25 }); }
      // blooms (peony-ish swirls)
      const pos = [[-95, -120, 50], [0, -150, 58], [95, -120, 50], [-50, -70, 52], [50, -70, 52], [-130, -55, 40], [130, -55, 40], [0, -30, 46], [-30, -185, 34]];
      pos.forEach(([bx, by, r], i) => {
        push(); translate(bx, by); rotate(sw * (1 + i * .2));
        const c = blooms[i % blooms.length];
        Ec(0, 0, r, r * .92, c, { ink: I, sw: .8, j: .8 });
        Ec(-r * .15, -r * .1, r * .62, r * .55, shade(c, .3), { op: 220 });
        ln([[-r * .5, r * .1], [-r * .2, -r * .4], [r * .3, -r * .3], [r * .4, r * .15], [0, r * .35], [-r * .2, 0], [r * .1, -r * .1]], .55, shade(c, -.35), 'ink', .6);
        pop();
      });
      // front wrap (folded cone with a lip) + ribbon
      F([[-175, -40], [-60, -10], [0, 20], [60, -10], [175, -40], [40, 190], [-40, 190]], wc, { ink: I, sw: 1.1, j: .6, curv: .2 });
      F([[-175, -40], [-60, -10], [-40, 190]], wc2, { op: 200 });
      ln([[-110, 0], [-30, 160]], .4, wc2, 'ink', 0); ln([[100, -8], [30, 160]], .4, wc2, 'ink', 0);
      for (let k = 0; k < 4; k++) ln([[-14 + k * 10, 186], [-12 + k * 8, 240]], .7, '#4E8A5E', 'ink', 0);
      ln([[-38, 92], [38, 92]], 1.8, PAL.hot, 'ink', 0);
      F([[0, 92], [-54, 124], [-40, 92], [-54, 60]], PAL.hot, { ink: I, sw: .5 }); F([[0, 92], [54, 124], [40, 92], [54, 60]], PAL.hot, { ink: I, sw: .5 });
      F([[-6, 96], [-24, 160], [-10, 150]], PAL.hot, { ink: I, sw: .4 }); F([[6, 96], [26, 156], [12, 150]], PAL.hot, { ink: I, sw: .4 });
    });
  }

  function boba(x, y, s = 1, o = {}) {
    const tea = o.tea || '#D9A877';
    xf(x, y, s, o, () => {
      F([[-58, -230], [58, -230], [44, 0], [-44, 0]], '#EFF4F6', { op: 150, ink: I, sw: 1 });
      F([[-55, -200], [55, -200], [44, -2], [-44, -2]], tea);
      F([[-55, -200], [55, -200], [52, -170], [-53, -170]], shade(tea, .35), { op: 200 });
      for (let i = 0; i < 14; i++) Ec(-34 + (i % 5) * 17 + (Math.floor(i / 5) % 2) * 8, -14 - Math.floor(i / 5) * 16, 9, 9, '#2E1E22', { n: 10 });
      F([[-30, -150], [-24, -150], [-20, -10], [-26, -10]], '#FFFFFF', { op: 110 });
      Ec(0, -232, 62, 14, '#F4F7F8', { op: 220, ink: I, sw: .8 });
      F([[-58, -232], [-40, -268], [40, -268], [58, -232]], '#F4F7F8', { op: 200, ink: I, sw: .8, curv: .4 });
      F([[8, -260], [26, -260], [56, -360], [38, -362]], o.straw || PAL.hot, { ink: I, sw: .8 });
    });
  }

  function froyo(x, y, s = 1, o = {}) {
    const sw = o.swirl || '#E8C6E8';
    xf(x, y, s, o, () => {
      F([[-85, -150], [85, -150], [60, 0], [-60, 0]], '#F7B9C8', { ink: I, sw: 1, j: .6 });
      F([[-85, -150], [85, -150], [83, -134], [-83, -134]], '#86AE7A', { ink: I, sw: .6 });
      // smiley face (no logo)
      Ec(0, -70, 26, 26, '#FFFFFF', { ink: I, sw: .5 }); Ec(-9, -76, 3, 4, I, { n: 8 }); Ec(9, -76, 3, 4, I, { n: 8 }); ln([[-12, -64], [0, -58], [12, -64]], .45, I, 'ink', .6);
      // soft-serve swirl
      F([[-88, -150], [-70, -200], [70, -200], [88, -150]], sw, { ink: I, sw: .9, curv: .5 });
      F([[-64, -196], [-48, -238], [48, -238], [64, -196]], shade(sw, .12), { ink: I, sw: .8, curv: .5 });
      F([[-40, -234], [-12, -278], [8, -296], [6, -270], [40, -234]], shade(sw, .22), { ink: I, sw: .8, curv: .5 });
      // toppings
      for (let i = 0; i < 10; i++) { const a = hash(i * 3.3) * TAU, rx = -60 + hash(i * 1.7) * 120, ry = -170 - hash(i * 2.1) * 60; ln([[rx, ry], [rx + Math.cos(a) * 10, ry + Math.sin(a) * 10]], .9, ['#FF4FA0', '#F7D774', '#3E9C97', '#7E62AE'][i % 4], 'ink', 0); }
      F(heartPts(34, -206, 14), '#E14C5A', { ink: I, sw: .4 });
      F([[40, -250], [52, -252], [80, -330], [70, -334]], '#FFFFFF', { ink: I, sw: .6 }); Ec(75, -340, 16, 22, '#FFFFFF', { ink: I, sw: .6, rot: .3 });
    });
  }

  function iceCream(x, y, s = 1, o = {}) {
    const sc = o.scoops || [PAL.blush, '#BFE7D0'], melt = N(o.melt, .2);
    xf(x, y, s, o, () => {
      F([[-66, 20], [66, 20], [0, 230]], '#E9AE3C', { ink: I, sw: 1, j: .6 });
      const Lp = u => [lerp(-66, 0, u), lerp(20, 230, u)], Rp = u => [lerp(66, 0, u), lerp(20, 230, u)];
      for (let k = 0; k < 6; k++) { const u = k / 6; ln([Lp(u), Rp(Math.min(1, u + .35))], .35, '#B7772A', 'ink', 0); ln([Rp(u), Lp(Math.min(1, u + .35))], .35, '#B7772A', 'ink', 0); }
      F([[-66, 20], [66, 20], [0, 230]], '#000000', { op: 0, ink: I, sw: 1 });
      sc.forEach((c, i) => { const yy = -i * 76; Ec(0, yy, 74 - i * 6, 62 - i * 4, c, { ink: I, sw: 1, j: .7 }); Ec(-20, yy - 20, 24, 14, '#FFFFFF', { op: 120 }); });
      // melting rim + drips
      F([[-76, 14], [76, 14], [70, 34], [-70, 34]], sc[0], { ink: I, sw: .8, curv: .3 });
      [[-40, 1], [10, 1.6], [50, .8]].forEach(([dx, k]) => F([[dx - 9, 30], [dx + 9, 30], [dx + 7, 30 + 30 * k * (.4 + melt)], [dx, 38 + 34 * k * (.4 + melt)], [dx - 7, 30 + 30 * k * (.4 + melt)]], sc[0], { ink: I, sw: .5, curv: .5 }));
      const top = -(sc.length - 1) * 76 - 62;
      Ec(8, top - 6, 16, 16, '#E14C5A', { ink: I, sw: .7 }); ln([[10, top - 20], [24, top - 46]], .6, '#4E8A5E', 'ink', .5);
    });
  }

  function pizza(x, y, s = 1, o = {}) {
    xf(x, y, s, o, () => {
      if (o.slice) {
        F([[-80, -120], [80, -120], [0, 150]], '#F7D774', { ink: I, sw: 1, j: .5 });
        F([[-92, -140], [92, -140], [86, -112], [-86, -112]], '#D9893C', { ink: I, sw: 1, curv: .4 });
        [[-30, -70], [24, -60], [-4, 0], [10, 60]].forEach(([px, py]) => Ec(px, py, 15, 14, '#C8414A', { ink: I, sw: .5 }));
        F([[40, -60], [52, -40], [48, 10], [40, 30], [36, -20]], '#F7D774', { ink: I, sw: .5, curv: .5 });
        return;
      }
      const tw2 = 440, th = 300, miss = N(o.missing, 0);
      RRc(-tw2 / 2 - 14, -th / 2 - 14, tw2 + 28, th + 28, 14, '#A9AEB8', { ink: I, sw: 1.1 });
      RRc(-tw2 / 2, -th / 2, tw2, th, 8, '#7E838E');
      let idx = 0;
      for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++, idx++) {
        if (idx >= 6 - miss) continue;
        const sx = -tw2 / 2 + 6 + c * (tw2 - 12) / 3, sy = -th / 2 + 6 + r * (th - 12) / 2, sw = (tw2 - 12) / 3 - 6, sh = (th - 12) / 2 - 6;
        RRc(sx, sy, sw, sh, 10, '#D9893C', { ink: I, sw: .8, j: .5 });
        RRc(sx + 10, sy + 10, sw - 20, sh - 20, 8, '#E2563E');
        F(ellPts(sx + sw / 2, sy + sh / 2, sw * .38, sh * .34, 14, 4), '#F7D774', { curv: .5 });
        for (let k = 0; k < 3; k++) Ec(sx + 24 + hash(idx * 9 + k) * (sw - 48), sy + 24 + hash(idx * 5 + k * 2) * (sh - 48), 11, 10, '#B8323C', { ink: I, sw: .4 });
        F(xform([[0, -8], [6, 0], [0, 8], [-6, 0]], sx + sw * .7, sy + sh * .3, 1.2, .6), '#4E8A5E');
      }
    });
  }

  function golf(x, y, s = 1, o = {}) {
    const ball = o.ball || { dx: 0, dy: 0 };
    xf(x, y, s, o, () => {
      if (o.tee !== false) F([[-4, 0], [4, 0], [12, -48], [-12, -48]], '#E14C5A', { ink: I, sw: .6 });
      Ec(0, 0, 60, 10, '#86AE7A', { op: 120 });
      Ec(ball.dx, -66 + ball.dy, 20, 20, '#FFFFFF', { ink: I, sw: .8 });
      for (let k = 0; k < 4; k++) Ec(ball.dx - 7 + (k % 2) * 12, -72 + ball.dy + Math.floor(k / 2) * 10, 2, 2, '#C8C8D0', { n: 8 });
      if (o.club !== false) {
        const a = N(o.swing, -.35), L = 380;
        push(); translate(-40, -50); rotate(a);
        F([[-3, 0], [3, 0], [5, -L], [-5, -L]], '#B5B9C6', { ink: I, sw: .6 });
        F([[-8, -L + 90], [8, -L + 90], [9, -L - 10], [-9, -L - 10]], '#2A2230', { ink: I, sw: .6 });
        F([[-6, 0], [6, 0], [8, 20], [-46, 26], [-50, 10]], '#9AA0AC', { ink: I, sw: .8, curv: .3 });
        pop();
      }
    });
  }

  function bowlingBall(x, y, s = 1, o = {}) {
    const c = o.col || '#E14C8C', sp = N(o.spin, 0);
    xf(x, y, s, o, () => {
      Ec(0, 0, 80, 80, c, { ink: I, sw: 1.1, j: .5 });
      Ec(-22, -26, 32, 22, '#FFFFFF', { op: 70, rot: -.5 });
      for (let k = 0; k < 3; k++) { const a = sp - .9 + k * .45 - (k === 2 ? .2 : 0), r = k === 2 ? 30 : 42; Ec(Math.cos(a) * r * .5 + 10, Math.sin(a) * r * .5 - 6 + (k === 2 ? 28 : 0), 9, 9, '#1A1530', { n: 10 }); }
    });
  }
  function pinShape(h) {
    const prof = [[0, .2], [.08, .3], [.28, .36], [.45, .3], [.6, .15], [.68, .13], [.78, .17], [.9, .16], [.97, .08], [1, 0]], L = [], R = [];
    prof.forEach(([v, w]) => { R.push([w * h * .5, -v * h]); L.unshift([-w * h * .5, -v * h]); });
    return [...R, ...L];
  }
  function onePin(px, py, h, rot, ink = true) {
    const pts = xform(pinShape(h), px, py, 1, rot);
    F(pts, '#FFFDF6', { ink: ink ? I : null, sw: .8, curv: .45 });
    const band = v => { const a = xform([[-h * .075, -v * h], [h * .075, -v * h], [h * .075, -(v + .035) * h], [-h * .075, -(v + .035) * h]], px, py, 1, rot); F(a, '#E14C5A'); };
    band(.66); band(.72);
  }
  function bowlingPins(x, y, s = 1, o = {}) {
    const fall = N(o.fall, 0), h = 150;
    xf(x, y, s, o, () => {
      const rows = [[3, -60, .82], [2, -40, .88], [1, -20, .94], [0, 0, 1]];
      rows.forEach(([n, yy, k]) => {
        for (let i = 0; i <= n; i++) {
          const id = n * 10 + i, px = (i - n / 2) * 66 * k;
          const f = clamp(fall * (1.2 + hash(id) * .6) - (3 - n) * .05), dir = (px >= 0 ? 1 : -1) * (.6 + hash(id * 3) * .8);
          const fx = px + f * dir * 120, fy = yy - Math.sin(f * Math.PI) * 120 * hash(id * 5) + f * 30;
          onePin(fx, fy, h * k, f * dir * 1.7);
        }
      });
    });
  }

  function car(x, y, s = 1, o = {}) {
    const t = N(o.t, TT()), c = o.col || '#2E3350', sh = N(o.shake, 0), [jx, jy] = sh ? shakeXY(t, 8 * sh) : [0, 0];
    xf(x + jx * s, y + jy * s, s, { ...o, flip: o.facing === -1 }, () => {
      const bob = Math.sin(t * 9) * 2 * (N(o.speed, 0) > 0 ? 1 : 0);
      Ec(0, 0, 270, 16, '#2A2230', { op: 70 });
      // body
      F([[-270, -40], [-262, -110], [-170, -128], [-100, -205], [90, -210], [170, -130], [262, -112], [278, -46], [270, -30], [-270, -30]].map(([a, b]) => [a, b + bob]), c, { ink: I, sw: 1.3, curv: .25, j: .5 });
      // windows
      const wc = o.passengers ? '#BFD9F2' : '#9CC8E8';
      F([[-150, -132 + bob], [-92, -192 + bob], [-10, -194 + bob], [-10, -132 + bob]], wc, { ink: I, sw: .8 });
      F([[8, -132 + bob], [8, -194 + bob], [82, -196 + bob], [146, -132 + bob]], wc, { ink: I, sw: .8 });
      F([[-70, -186 + bob], [-50, -186 + bob], [-110, -136 + bob], [-130, -136 + bob]], '#FFFFFF', { op: 90 });
      ln([[-200, -80 + bob], [240, -80 + bob]], .5, shade(c, .25), 'ink', 0);
      Rc(-60, -110 + bob, 30, 6, shade(c, .4)); Rc(60, -110 + bob, 30, 6, shade(c, .4));
      // lights
      if (o.lights) halo(285, -70 + bob, 120, '#FFF0C0', 60, 3);
      Ec(262, -78 + bob, 14, 12, '#FFF0C0', { ink: I, sw: .5 }); Rc(-272, -92 + bob, 12, 26, '#E14C5A', { ink: I, sw: .4 });
      // wheels
      [-170, 170].forEach((wx, i) => {
        Ec(wx, -30, 56, 56, '#1A1828', { ink: I, sw: 1 }); Ec(wx, -30, 28, 28, '#B5B9C6', { ink: I, sw: .6 });
        const a = -t * N(o.speed, 0) * 8 + i;
        for (let k = 0; k < 3; k++) ln([[wx, -30], [wx + Math.cos(a + k * TAU / 3) * 24, -30 + Math.sin(a + k * TAU / 3) * 24]], .5, '#5A5E6E', 'ink', 0);
      });
      if (N(o.speed, 0) > 0) for (let k = 0; k < 3; k++) ln([[-300 - k * 40, -60 - k * 34], [-380 - k * 60, -60 - k * 34]], .7, I, 'ink', 0);
      if (sh > .2) for (let k = 0; k < 3; k++) { const ag = (t * 3 + k * .33) % 1; Ec(-300 - ag * 120, -40 - ag * 40, 16 + ag * 30, 14 + ag * 26, '#C9C6D6', { op: 200 * (1 - ag), ink: I, sw: .4 }); }
    });
  }

  function blanket(x, y, s = 1, o = {}) {
    const c = o.col || '#C3B1E1', c2 = o.col2 || '#F3A7B5', dk = shade(c, -.28);
    xf(x, y, s, o, () => {
      const plaid = (x0, y0, w, h) => {
        for (let k = 1; k < 5; k++) F([[x0 + k * w / 5 - 12, y0 + 4], [x0 + k * w / 5 + 12, y0 + 4], [x0 + k * w / 5 + 12, y0 + h - 4], [x0 + k * w / 5 - 12, y0 + h - 4]], c2, { op: 120 });
        for (let k = 1; k < 3; k++) F([[x0 + 4, y0 + k * h / 3 - 9], [x0 + w - 4, y0 + k * h / 3 - 9], [x0 + w - 4, y0 + k * h / 3 + 9], [x0 + 4, y0 + k * h / 3 + 9]], c2, { op: 110 });
      };
      if (o.drape === 'flat') {
        F([[-260, -150], [260, -160], [270, 150], [-270, 160]], c, { ink: I, sw: 1.1, curv: .2, j: .6 });
        plaid(-260, -150, 520, 300);
        for (let k = 0; k < 14; k++) ln([[-250 + k * 38, 158], [-252 + k * 38, 186]], .5, c2, 'ink', 0);
        return;
      }
      // folded stack: three soft folds, the top one with a turned-down corner
      [[-240, 40, 480, 120], [-230, -60, 460, 110], [-220, -150, 440, 100]].forEach(([x0, y0, w, h], i) => {
        RRc(x0, y0, w, h, 46, i % 2 ? shade(c, .08) : c, { ink: I, sw: 1.1, j: .6 });
        plaid(x0 + 20, y0 + 6, w - 40, h - 12);
        ln([[x0 + 30, y0 + h - 14], [x0 + w / 2, y0 + h - 6], [x0 + w - 30, y0 + h - 14]], .5, dk, 'ink', .5);
      });
      F([[120, -150], [220, -150], [220, -60], [170, -80]], shade(c, .2), { ink: I, sw: .9, curv: .2 });
      for (let k = 0; k < 12; k++) ln([[-220 + k * 40, 160], [-224 + k * 40, 192]], .55, c2, 'ink', 0);
      TX(rectPts(-240, -150, 480, 310), dk, 60);
    });
  }

  function hoodie(x, y, s = 1, o = {}) {
    const c = o.col || '#9A9CA6', d = shade(c, -.2), wv = N(o.wave, 0), t = N(o.t, TT());
    xf(x, y, s, o, () => {
      const wa = Math.sin(t * 6) * .25 * wv;
      // sleeves
      F(xform([[10, -10], [-60, 0], [-64, 230], [-4, 236]], -140, -120, 1, .35 + wa), c, { ink: I, sw: 1, curv: .25 });
      F(xform([[-10, -10], [60, 0], [64, 230], [4, 236]], 140, -120, 1, -.35 - wa * .4), c, { ink: I, sw: 1, curv: .25 });
      F(xform([[-62, 214], [-2, 220], [-2, 250], [-60, 246]], -140, -120, 1, .35 + wa), d, { ink: I, sw: .7 });
      F(xform([[62, 214], [2, 220], [2, 250], [60, 246]], 140, -120, 1, -.35 - wa * .4), d, { ink: I, sw: .7 });
      // body
      F([[-150, -130], [-60, -170], [60, -170], [150, -130], [140, 200], [-140, 200]], c, { ink: I, sw: 1.2, curv: .15, j: .6 });
      Rc(-140, 180, 280, 26, d, { ink: I, sw: .7 });
      // hood
      F([[-90, -165], [-70, -230], [0, -250], [70, -230], [90, -165], [40, -110], [-40, -110]], d, { ink: I, sw: 1, curv: .5 });
      F([[-50, -170], [0, -200], [50, -170], [20, -128], [-20, -128]], shade(c, -.4), { curv: .5 });
      ln([[-18, -126], [-22, -40]], .6, '#F6EEDB', 'ink', .4); ln([[18, -126], [22, -40]], .6, '#F6EEDB', 'ink', .4);
      // kangaroo pocket
      F([[-90, 60], [90, 60], [110, 150], [-110, 150]], shade(c, -.06), { ink: I, sw: .8 });
      TX(rectPts(-140, -160, 280, 360), shade(c, .2), 60);
    });
  }

  function calendarPages(x, y, s = 1, o = {}) {
    const n = N(o.n, 1), nx = N(o.next, n + 1), tr = N(o.tear, 0), label = N(o.label, 'DAYS');
    xf(x, y, s, o, () => {
      RRc(-160, -200, 320, 400, 16, '#5C4033', { ink: I, sw: 1.1 });
      const page = (num, dx, dy, rot, alpha) => {
        push(); translate(dx, dy - 170); rotate(rot); translate(0, 170);
        Rc(-140, -170, 280, 350, '#FFFDF6', { ink: I, sw: .9, op: alpha });
        Rc(-140, -170, 280, 60, '#E14C5A', { op: alpha });
        scribble(label, 0, -140, 30, '#FFFFFF', { sw: .8 });
        const str = String(num); scribble(str, 0, 20, str.length > 2 ? 110 : 150, I, { sw: 2.2, br: 'ink' });
        pop();
      };
      page(nx, 0, 0, 0, 255);
      const e = easeIn(tr);
      if (tr < .02) page(n, 0, 0, 0, 255);
      for (let k = 0; k < 5; k++) Ec(-100 + k * 50, -176, 9, 14, '#B5B9C6', { ink: I, sw: .6 });
      if (tr >= .02 && tr < 1) { page(n, -e * 260 + Math.sin(tr * 9) * 10, -e * 300 + 20 * Math.sin(tr * Math.PI), -e * 1.3 - .08, 255); for (let k = 0; k < 6; k++) ln([[-120 + k * 48, -168], [-100 + k * 48, -160]], .4, '#FFFDF6', 'ink', 0); }
    });
  }

  function clock(x, y, s = 1, o = {}) {
    let h = o.h, m = o.m;
    if (h === undefined) { const [a, b] = String(o.time || '10:10').split(':').map(Number); h = a; m = b; }
    xf(x, y, s, o, () => {
      Ec(0, 0, 112, 112, o.rim || PAL.rose, { ink: I, sw: 1.2, j: .5 });
      Ec(0, 0, 94, 94, '#FFF8EA', { ink: I, sw: .7 });
      for (let k = 0; k < 12; k++) { const a = k / 12 * TAU, r1 = k % 3 ? 82 : 74; ln([[Math.sin(a) * r1, -Math.cos(a) * r1], [Math.sin(a) * 90, -Math.cos(a) * 90]], k % 3 ? .4 : .8, I, 'ink', 0); }
      scribble('12', 0, -58, 22, I, { sw: .6, track: .1 }); scribble('6', 0, 58, 22, I, { sw: .6 }); scribble('3', 58, 0, 22, I, { sw: .6 }); scribble('9', -58, 0, 22, I, { sw: .6 });
      const am = (m / 60) * TAU, ah = ((h % 12) + m / 60) / 12 * TAU;
      ln([[0, 0], [Math.sin(ah) * 46, -Math.cos(ah) * 46]], 2, I, 'ink', 0);
      ln([[0, 0], [Math.sin(am) * 72, -Math.cos(am) * 72]], 1.3, I, 'ink', 0);
      Ec(0, 0, 8, 8, PAL.hot, { ink: I, sw: .4 });
    });
  }

  function heart(x, y, s = 1, o = {}) {
    const b = N(o.beat, 0), c = o.col || PAL.hot, k = 1 + b * .14, cr = N(o.crack, 0);
    xf(x, y, s * k, o, () => {
      F(heartPts(0, 0, 100), c, { ink: I, sw: 1.3, j: .8 });
      F(heartPts(-4, -6, 82), shade(c, .12), { op: 160 });
      Ec(-46, -42, 22, 14, '#FFFFFF', { op: 170, rot: -.6 });
      if (cr > 0) ln([[6, -60], [-14, -20 * cr - 10], [16, 10 * cr], [-6, 60 * cr + 10]].slice(0, 2 + Math.round(cr * 2)), .9, I, 'ink', 0);
    });
  }

  function stringLights(x1, y1, x2, y2, t, o = {}) {
    const sag = N(o.sag, 120), n = N(o.n, 14), cols = o.cols || ['#FFE3A0', '#FFF1C8', '#FFD0A0', '#FFE3A0'], seed = N(o.seed, 0);
    const P = u => [lerp(x1, x2, u), lerp(y1, y2, u) + sag * 4 * u * (1 - u)];
    const pts = []; for (let k = 0; k <= 12; k++) pts.push(P(k / 12));
    ln(pts, .55, o.wire || '#2A2230', 'ink', .5);
    for (let i = 0; i < n; i++) {
      const u = (i + .5) / n, [bx, by] = P(u), b = .7 + .3 * tw(i + seed * 30, t, 1.4), c = cols[i % cols.length];
      halo(bx, by + 16, 46 * b, c, 60 * b, 3);
      Rc(bx - 4, by, 8, 8, '#2A2230');
      Ec(bx, by + 18, 9, 13, c, { ink: '#2A2230', sw: .35 });
    }
  }

  function meterProp(x, y, s = 1, o = {}) {
    const v = clamp(N(o.v, 50) / 100), g = N(o.glow, 0), cr = N(o.cracked, 0), t = N(o.t, TT());
    xf(x, y, s, o, () => {
      const tubeTop = -940, tubeBot = -200, tw2 = 70;
      if (g > 0) halo(0, lerp(tubeBot, tubeTop, v * .6), 360 * (1 + g * .3), '#FF7FBF', 70 * g, 4);
      // base stand
      F([[-130, 0], [130, 0], [100, -60], [-100, -60]], '#5C4033', { ink: I, sw: 1.1 });
      // board
      RRc(-120, -1000, 240, 950, 24, '#FFF6E6', { ink: I, sw: 1.2, j: .6 });
      // ticks + numbers
      for (let k = 0; k <= 10; k++) { const yy = lerp(tubeBot, tubeTop, k / 10); ln([[tw2 / 2 + 6, yy], [tw2 / 2 + (k % 5 ? 22 : 36), yy]], .6, I, 'ink', 0); if (k % 2 === 0) scribble(String(k * 10), -tw2 / 2 - 34, yy, 22, I, { sw: .55, track: .08 }); }
      // tube
      RRc(-tw2 / 2, tubeTop - 30, tw2, tubeBot - tubeTop + 60, tw2 / 2, '#E8EEF4', { ink: I, sw: 1 });
      const ly = lerp(tubeBot, tubeTop, v), wob2 = Math.sin(t * 6) * 3;
      F([[-tw2 / 2 + 10, tubeBot + 20], [-tw2 / 2 + 10, ly + wob2], [0, ly - wob2], [tw2 / 2 - 10, ly + wob2], [tw2 / 2 - 10, tubeBot + 20]], PAL.hot, { curv: .2 });
      // bulb
      Ec(0, tubeBot + 50, 72, 72, '#E8EEF4', { ink: I, sw: 1.1 });
      Ec(0, tubeBot + 50, 58, 58, PAL.hot);
      Ec(-20, tubeBot + 30, 16, 12, '#FFFFFF', { op: 160 });
      F([[-tw2 / 2 + 14, tubeTop], [-tw2 / 2 + 22, tubeTop], [-tw2 / 2 + 22, tubeBot], [-tw2 / 2 + 14, tubeBot]], '#FFFFFF', { op: 120 });
      if (o.label !== false) {
        const lab = Array.isArray(o.label) ? o.label : ['LOVE', 'METER'];
        Rc(-150, -1100, 300, 110, PAL.ink, { j: .6 });
        scribble(lab[0] || '', 0, -1070, 34, '#FFF6E6', { sw: .9, track: .12 });
        scribble(lab[1] || '', 0, -1022, 34, PAL.hot, { sw: .9, track: .12 });
      }
      if (cr > 0) {
        ln([[-10, tubeTop + 80], [12, tubeTop + 140], [-8, tubeTop + 200], [14, tubeTop + 280]].slice(0, 2 + Math.round(cr * 2)), .8, I, 'ink', 0);
        ln([[12, tubeTop + 140], [30, tubeTop + 160]], .6, I, 'ink', 0);
        for (let k = 0; k < Math.round(cr * 4); k++) { const dy = ((t * 1.2 + k * .25) % 1) * 160; Ec(tw2 / 2 + 8, tubeTop + 140 + dy, 6, 9, PAL.hot, { n: 10 }); }
      }
    });
  }

  function sparkle(x, y, s = 1, t = TT(), o = {}) {
    const b = .55 + .45 * Math.sin(t * 7 + x * .01 + y * .013), c = o.col || '#FFF6C8';
    xf(x, y, s * (.6 + .5 * b), o, () => {
      halo(0, 0, 70, c, 50 * b, 2);
      F(starPts(0, 0, 44, .22, 4, t * .5), c, { ink: o.ink === false ? null : I, sw: .5 });
      F(starPts(0, 0, 18, .3, 4, t * .5 + Math.PI / 4), '#FFFFFF', { op: 220 });
    });
  }

  function cloud(x, y, s = 1, o = {}) {
    const w = N(o.w, 420), h = N(o.h, 260), c = o.col || '#FFFDF6', kind = o.kind || 'speech';
    // tail first (world coords), so it reads as attached
    if (o.tail) {
      const [tx, ty] = o.tail;
      if (kind === 'thought') { for (let k = 1; k <= 3; k++) { const u = k / 4; Ec(lerp(x, tx, u + .1), lerp(y + h * s * .3, ty, u + .1), (26 - k * 6) * s, (22 - k * 5) * s, c, { ink: I, sw: .8 }); } }
      else { const a = Math.atan2(ty - y, tx - x) + Math.PI / 2; F([[x + Math.cos(a) * 40 * s, y + Math.sin(a) * 40 * s], [tx, ty], [x - Math.cos(a) * 40 * s, y - Math.sin(a) * 40 * s]], c, { ink: I, sw: 1.1 }); }
    }
    xf(x, y, s, o, () => {
      if (kind === 'thought') {
        const pts = []; const nb = 11;
        for (let i = 0; i < nb; i++) { const a = i / nb * TAU; for (let k = 0; k <= 3; k++) { const aa = a + k / 3 * TAU / nb, bump = Math.sin(k / 3 * Math.PI) * .16; pts.push([Math.cos(aa) * w / 2 * (1 + bump), Math.sin(aa) * h / 2 * (1 + bump)]); } }
        F(pts, c, { ink: I, sw: 1.2, j: .5 });
      } else F(ellPts(0, 0, w / 2, h / 2, 32, .6), c, { ink: I, sw: 1.2 });
    });
  }

  function chatBubbleShape(x, y, s = 1, o = {}) {
    const me = (o.who || 'me') === 'me', w = N(o.w, 360), h = N(o.h, 130), c = o.col || (me ? PAL.imsgBlue : PAL.imsgGrey), t = N(o.t, TT());
    xf(x, y, s, o, () => {
      const tail = me ? [[w / 2 - 40, h / 2 - 30], [w / 2 + 22, h / 2 + 8], [w / 2 - 70, h / 2]] : [[-w / 2 + 40, h / 2 - 30], [-w / 2 - 22, h / 2 + 8], [-w / 2 + 70, h / 2]];
      F(tail, c, { ink: I, sw: 1, curv: .3 });
      RRc(-w / 2, -h / 2, w, h, Math.min(h / 2, 60), c, { ink: I, sw: 1.1, j: .5 });
      F(tail, c);
      F([[-w / 2 + 30, -h / 2 + 16], [w / 2 - 50, -h / 2 + 16], [w / 2 - 70, -h / 2 + 30], [-w / 2 + 30, -h / 2 + 30]], '#FFFFFF', { op: 70 });
      if (o.typing) for (let k = 0; k < 3; k++) { const bnc = Math.max(0, Math.sin(t * 9 - k * .9)) * 12; Ec(-40 + k * 40, -bnc, 13, 13, me ? '#FFFFFF' : '#8E8E93', { op: 230 }); }
      else if (o.text) scribble(o.text, 0, 0, N(o.size, Math.min(54, (w - 60) / (o.text.length * .78))), me ? '#FFFFFF' : '#1A1A1A', { sw: N(o.sw, .9) });
    });
  }

  function mic(x, y, s = 1, o = {}) {
    xf(x, y, s, o, () => {
      F([[-22, -60], [22, -60], [14, 120], [-14, 120]], '#2A2230', { ink: I, sw: 1 });
      Rc(-26, -70, 52, 18, '#B5B9C6', { ink: I, sw: .7 });
      Ec(0, -120, 50, 54, '#C9CCD6', { ink: I, sw: 1.1 });
      for (let k = -2; k <= 2; k++) { ln([[k * 18, -170 + Math.abs(k) * 6], [k * 18, -70 - Math.abs(k) * 6]], .35, '#7E838E', 'ink', .3); ln([[-46 + Math.abs(k) * 6, -120 + k * 18], [46 - Math.abs(k) * 6, -120 + k * 18]], .35, '#7E838E', 'ink', .3); }
      Ec(-16, -140, 14, 10, '#FFFFFF', { op: 170 });
      Rc(-14, 20, 28, 12, PAL.hot);
    });
  }

  function lehengaSwirl(x, y, s = 1, o = {}) {
    const t = N(o.t, TT()), sp = N(o.spin, 1), c = o.col || '#FBF6EC', flare = .65 + .35 * Math.min(1, sp);
    xf(x, y, s, o, () => {
      const R = 300 * flare, hy = 400 - 40 * Math.min(1, sp), ry = 70 + 40 * Math.min(1, sp), ph = t * 3 * sp;
      const hemPt = a => [Math.cos(a) * R, hy + Math.sin(a) * ry + Math.sin(a * 6 + ph * 2) * 18 * flare];
      // inside of the skirt (back hem) for volume
      const back = []; for (let i = 0; i <= 20; i++) back.push(hemPt(Math.PI + i / 20 * Math.PI));
      F([[-60, 0], [60, 0], ...back.slice().reverse()], shade(c, -.1), { ink: I, sw: .9, curv: .3 });
      const front = []; for (let i = 0; i <= 24; i++) front.push(hemPt(i / 24 * Math.PI));
      F([[-60, 0], [60, 0], ...front], c, { ink: I, sw: 1.1, curv: .25 });
      F([[-60, 0], [-20, 0], [front[17][0] * .9, front[17][1] - 10], ...front.slice(17)], '#E8D8E4', { op: 120, curv: .25 });
      // pleats spiralling with the spin
      for (let k = 0; k < 11; k++) { const a = frac(k / 11 + ph * .06) * Math.PI, [hx, hy2] = hemPt(a); ln([[hx * .16, 6], [hx * .55 + Math.sin(ph + k) * 12 * sp, hy * .5], [hx, hy2 - 6]], .5, '#D8CDB8', 'ink', .5); }
      // gold embroidered hem band + mirror-work sparkles
      F(front.map(([a, b]) => [a, b - 28]).concat(front.slice().reverse()), '#E9C97A', { op: 210, ink: I, sw: .5 });
      for (let k = 0; k < 18; k++) { const [sx, sy] = hemPt((k + .5) / 18 * Math.PI), b = .5 + .5 * Math.sin(t * 9 + k * 1.7); Ec(sx, sy - 14, 3 + b * 4, 3 + b * 4, '#FFFFFF', { op: 150 + 100 * b, n: 8 }); }
      for (let k = 0; k < 16; k++) { const v = hash(k * 7.7), py = 40 + v * (hy - 70), px = (hash(k * 3.1) - .5) * 2 * (60 + (R - 60) * py / hy) * .85, b = .5 + .5 * Math.sin(t * 8 + k * 2.3); F(starPts(px, py, 6 + b * 11, .25, 4), '#FFFFFF', { op: 150 + 105 * b, ink: b > .8 ? '#C9A44A' : null, sw: .3 }); }
      // motion swooshes when spinning
      if (sp > .3) for (let k = 0; k < 3; k++) { const yy = hy - 60 + k * 50, a0 = ph * .5 + k; ln([[-R - 30, yy - 30], [-R - 60, yy + 10 + Math.sin(a0) * 8], [-R - 20, yy + 50]], .6, I, 'ink', .6); ln([[R + 30, yy - 30], [R + 60, yy + 10 + Math.sin(a0) * 8], [R + 20, yy + 50]], .6, I, 'ink', .6); }
      Rc(-64, -18, 128, 30, '#E9C97A', { ink: I, sw: .8 });
    });
  }

  function pirateHat(x, y, s = 1, o = {}) {
    xf(x, y, s, o, () => {
      F([[-150, 0], [-110, -120], [-40, -150], [0, -160], [40, -150], [110, -120], [150, 0], [80, -30], [0, -40], [-80, -30]], '#1F1B28', { ink: I, sw: 1.2, curv: .35 });
      ln([[-150, 0], [-80, -30], [0, -40], [80, -30], [150, 0]], 1, '#C9A44A', 'ink', .4);
      Ec(0, -92, 26, 22, '#FFFDF6', { ink: I, sw: .6 }); Ec(-9, -96, 5, 6, I, { n: 8 }); Ec(9, -96, 5, 6, I, { n: 8 });
      Rc(-12, -74, 24, 10, '#FFFDF6', { ink: I, sw: .4 });
      ln([[-34, -50], [34, -16]], 1.6, '#FFFDF6', 'ink', 0); ln([[34, -50], [-34, -16]], 1.6, '#FFFDF6', 'ink', 0);
    });
  }
  function sailorHat(x, y, s = 1, o = {}) {
    xf(x, y, s, o, () => {
      F([[-100, -20], [-80, -110], [80, -110], [100, -20]], '#FFFFFF', { ink: I, sw: 1.1, curv: .3 });
      Ec(0, -110, 80, 18, '#F2F2F2', { ink: I, sw: .8 });
      F([[-110, 0], [-104, -40], [104, -40], [110, 0]], '#F6F6F6', { ink: I, sw: 1, curv: .3 });
      Rc(-102, -42, 204, 16, PAL.indigo);
      F(xform(starPts(0, 0, 14, .45), 0, -76), '#C9A44A');
    });
  }


  // ======================================================================================
  //                       LIFE SETS — home, school, college, work (re-dress per project)
  // ======================================================================================
  // shared interior helpers
  const LW = (o, k) => N(o[k], undefined);
  function wallFloor(wallCol, floorCol, fy, o = {}) {
    F(rectPts(-80, -80, W + 160, fy + 100), wallCol);
    TX(rectPts(-80, -80, W + 160, fy + 80), o.wallTex || shade(wallCol, .1), N(o.wallTexOp, 70), { tex: .7 });
    F([[-90, fy], [W + 90, fy], [W + 90, H + 90], [-90, H + 90]], floorCol, { ink: I, sw: .9 });
    const k = o.floor || 'wood';
    if (k === 'wood' || k === 'vinyl') for (let i = 0; i < 9; i++) { const y = fy + Math.pow((i + 1) / 9, 1.6) * (H - fy + 40); ln([[-60, y], [W + 60, y]], .3, shade(floorCol, -.22), 'ink', 0); for (let c = 0; c < 4; c++) { const x = hash(i * 11 + c) * W; ln([[x, y], [x + (x - 540) * .12, y + (H - fy) / 9 * (.6 + i * .15)]], .25, shade(floorCol, -.18), 'ink', 0); } }
    if (k === 'tile') for (let i = -8; i <= 8; i++) { ln([[540 + i * 70, fy], [540 + i * 240, H + 60]], .3, shade(floorCol, -.18), 'ink', 0); }
    if (k === 'tile') for (let i = 0; i < 7; i++) { const y = fy + Math.pow((i + 1) / 7, 1.7) * (H - fy + 40); ln([[-60, y], [W + 60, y]], .3, shade(floorCol, -.18), 'ink', 0); }
    if (k === 'carpet') TX(rectPts(-80, fy, W + 160, H - fy + 90), shade(floorCol, -.1), 110, { tex: .9 });
    Rc(-80, fy - 22, W + 160, 24, o.base || shade(wallCol, .35), { ink: I, sw: .6 });
  }
  // window with a view painted by viewFn(x,y,w,h); o.frame col, o.blinds 0..1, o.bars (mullions)
  function windowBox(x, y, w, h, viewFn, o = {}) {
    Rc(x - 18, y - 18, w + 36, h + 36, o.frame || '#F6F1E6', { ink: I, sw: 1 });
    viewFn(x, y, w, h);
    if (o.blinds) { const n = 14, hh = h * o.blinds; for (let i = 0; i < n; i++) { const yy = y + i * hh / n; Rc(x, yy, w, hh / n * .78, o.blindCol || '#F4EFE4', { op: 235 }); } ln([[x + w * .5, y], [x + w * .5, y + hh]], .3, '#B8B0A0', 'ink', 0); }
    if (o.bars !== false) { Rc(x + w / 2 - 5, y, 10, h, o.frame || '#F6F1E6'); if (o.bars === 'cross') Rc(x, y + h / 2 - 5, w, 10, o.frame || '#F6F1E6'); }
    Rc(x - 30, y + h + 12, w + 60, 18, o.frame || '#F6F1E6', { ink: I, sw: .7 });
  }
  function frameArt(x, y, w, h, col, inner, rot = 0) {
    F(xform(rectPts(-w / 2, -h / 2, w, h), x, y, 1, rot), '#3A2E2A', { ink: I, sw: .7 });
    F(xform(rectPts(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16), x, y, 1, rot), col);
    if (inner) inner(x, y, w, h);
  }
  // a counter top: base fill + a faint stone grain (n soft marks a shade off the base; n = 0 = plain)
  function granite(pts, base, n, seed, x0, y0, w, h) {
    F(pts, base, { ink: I, sw: .9 });
    for (let i = 0; i < n; i++) { const x = x0 + hash(seed + i * 1.31) * w, y = y0 + hash(seed + i * 2.17) * h, r = 3 + hash(i * 3.3 + seed) * 6; Ec(x, y, r * 2, r * .6, shade(base, i % 2 ? -.06 : .06), { op: 120, n: 6 }); }
  }
  function cabinet(x, y, w, h, col, o = {}) {
    Rc(x, y, w, h, col, { ink: I, sw: .8 });
    RRc(x + w * .12, y + h * .1, w * .76, h * .8, 10, shade(col, .1), { ink: shade(col, -.4), sw: .5 });
    RRc(x + w * .2, y + h * .2, w * .6, h * .6, 8, shade(col, -.06));
    if (o.knob !== false) Ec(o.knobX != null ? x + o.knobX : x + w * .86, y + h * (o.top ? .85 : .2), 5, 5, '#C9A44A', { n: 8 });
  }
  function steam(x, y, t, n = 3, h = 160, col = '#FFFFFF', op = 120) {
    for (let k = 0; k < n; k++) { const ph = frac(t * .5 + k / n), yy = y - ph * h, a = (1 - ph) * op; ln([[x + (k - 1) * 18, yy + 40], [x + (k - 1) * 18 + Math.sin(t * 3 + k) * 14, yy + 10], [x + (k - 1) * 18 - Math.sin(t * 2 + k) * 10, yy - 30]], .7, mixCol(col, '#888888', 0), 'cpencil', .6); if (a > 10) Ec(x + (k - 1) * 18, yy - 30, 10, 14, col, { op: a * .4, n: 10 }); }
  }
  // tiny parent/crowd blob (for bleachers etc.) – head + shoulders
  function blobPerson(x, y, s, col, skin, t, i) {
    const b = Math.sin(t * 3 + i * 1.7) * 3 * s;
    F([[x - 22 * s, y + 30 * s], [x - 18 * s, y - 4 * s + b], [x + 18 * s, y - 4 * s + b], [x + 22 * s, y + 30 * s]], col, { curv: .4 });
    Ec(x, y - 18 * s + b, 12 * s, 13 * s, skin, { n: 12 });
    F([[x - 12 * s, y - 22 * s + b], [x, y - 33 * s + b], [x + 12 * s, y - 22 * s + b]], '#2B2026', { curv: .5 });
  }
  const SKINS = ['#C98D67', '#B57B56', '#E2B08A', '#8E5A3C', '#D9A07A', '#A86E4A'];

  // ---------- HOME BEDROOM (upstairs) ----------
  // o.level 0..4 (ribbons pile up; o.era is an older alias), o.time 'day'|'night'|'dusk',
  // o.dusk 0..1 (window coral→night), o.lamp (desk lamp on; default on at night), o.suitcase (packed, by the door),
  // o.who 'me'|'sibling' (alternate dressing), o.trophy (shelf trophy text), o.laptop false | 'zoom' | 'glow' | text, o.calm. RETURNS {bed:[x,y] (sit point on the mattress), desk:[x,y] (desktop), chair:[x,y], door:[x,y] (floor)}
  function homeRoomSet(t, o = {}) {
    setBegin(21, t, o);
    const lvl = clamp(Math.round(N(o.level, N(o.era, 1))), 0, 4), tm = o.time || 'day', sib = o.who === 'sibling' || o.who === 'brother';
    const dk = tm === 'night' ? 1 : tm === 'dusk' ? N(o.dusk, .5) : 0, lampOn = N(o.lamp, dk > .6);
    const wall = mixCol(sib ? '#DCE3EE' : '#EFE2C8', '#2E3468', dk * .9), fy = 1330;
    wallFloor(wall, mixCol('#CDB79A', '#4A4466', dk * .85), fy, { floor: 'carpet' });
    // window over a quiet street
    const wx = 80, wy = o.calm === 'top' ? 560 : 250, ww = 420, wh = o.calm === 'top' ? 380 : 470;
    windowBox(wx, wy, ww, wh, (x, y, w, h) => {
      const top = mixCol(mixCol('#9CC8E8', '#F2876A', Math.min(1, dk * 2)), '#151A48', Math.max(0, dk * 2 - 1)), bot = mixCol(mixCol('#E8F2EE', '#F9C98A', Math.min(1, dk * 2)), '#3A3478', Math.max(0, dk * 2 - 1));
      skyBands(y, y + h, [top, mixCol(top, bot, .5), bot], 5, 3, 7, x, x + w);
      if (dk > .7) stars(6, y + 10, y + h * .4, t, 31, '#FFF6DA', x + 10, x + w - 10);
      F([[x, y + h * .78], [x + w * .2, y + h * .62], [x + w * .45, y + h * .7], [x + w * .7, y + h * .58], [x + w, y + h * .66], [x + w, y + h], [x, y + h]], mixCol('#C9B07A', '#2A2C5A', dk), {}); // hills
      for (let i = 0; i < 3; i++) { const hx = x + 30 + i * 140, hy = y + h * .82; F([[hx, hy], [hx + 60, hy - 50], [hx + 120, hy], [hx + 120, hy + 80], [hx, hy + 80]], mixCol(['#E9D8B8', '#D8C8B0', '#E4CFA6'][i], '#2A2A58', dk * .8), { ink: I, sw: .4 }); if (dk > .5) Rc(hx + 46, hy + 20, 22, 22, '#FFD98E', { op: 220 }); }
      ln([[x + w - 60, y + h], [x + w - 60, y + h * .55]], .7, '#3A3A48', 'ink', 0); if (dk > .5) halo(x + w - 60, y + h * .55, 50, '#FFE3A0', 60, 2);
    }, { blinds: o.calm === 'top' ? 0 : .18, bars: 'cross' });
    // corkboard with ribbons (grows with level)
    const cbx = 600, cby = o.calm === 'top' ? 700 : 300, cbw = 400, cbh = 300;
    Rc(cbx, cby, cbw, cbh, '#C49A6C', { ink: I, sw: 1 }); TX(rectPts(cbx + 10, cby + 10, cbw - 20, cbh - 20), '#B5875A', 120, { tex: .9 });
    const pins = [];
    pins.push(['note', '#FFF6A8']); pins.push(['note', '#BFE0F4']);
    if (lvl >= 1) pins.push(['ribbon', '#3E6FA8'], ['ribbon', '#E46F8C'], ['medal', '#C98A4A']); // two ribbons + a medal
    if (lvl >= 2) pins.push(['ribbon', '#E9AE3C'], ['photo', '#9CC8E8']);
    if (lvl >= 3) pins.push(['ribbon', '#86AE7A'], ['ribbon', '#7E62AE'], ['note', '#F3A7B5']);
    if (lvl >= 4) pins.push(['ribbon', '#E46F8C'], ['note', '#FFF6A8']);
    pins.forEach(([k, c], i) => {
      const px = cbx + 50 + (i % 4) * 95 + hash(i * 3.1) * 14, py = cby + 50 + Math.floor(i / 4) * 95 + hash(i * 5.7) * 10, r = (hash(i) - .5) * .3;
      if (k === 'note') F(xform(rectPts(-34, -30, 68, 60), px, py, 1, r), c, { ink: I, sw: .4 });
      if (k === 'photo') F(xform(rectPts(-32, -40, 64, 80), px, py, 1, r), '#FFFFFF', { ink: I, sw: .4 }), F(xform(rectPts(-26, -34, 52, 52), px, py, 1, r), c);
      if (k === 'ribbon') ribbon(px, py + 6, .42, { col: c, rot: r });
      if (k === 'medal') { ln([[px - 14, py - 34], [px, py], [px + 14, py - 34]], .8, PAL.hot, 'ink', 0); Ec(px, py + 16, 22, 22, c, { ink: I, sw: .6 }); F(starPts(px, py + 16, 11, .45, 5), '#FFF6E6', { op: 220 }); }
      Ec(px, py - 30, 5, 5, PAL.hot, { n: 8 });
    });
    // shelf + a small trophy
    if (o.calm !== 'top') { Rc(cbx + 20, cby + cbh + 40, 360, 16, '#9A6E48', { ink: I, sw: .7 }); if (lvl >= 1 && !sib) trophy(cbx + 90, cby + cbh + 40, .32, { kind: 'cup', place: o.trophy, col: '#C9CCD6' }); for (let k = 0; k < 5; k++) Rc(cbx + 200 + k * 26, cby + cbh - 30 + (k % 2) * 8, 22, 70 - (k % 2) * 8, ['#3E6FA8', '#E9AE3C', '#86AE7A', '#E46F8C', '#7E62AE'][k], { ink: I, sw: .4 }); }
    if (sib && o.calm !== 'top') { // plain pennant (no marks) + a small potted plant
      F([[cbx + 20, cby + cbh + 70], [cbx + 260, cby + cbh + 110], [cbx + 20, cby + cbh + 150]], o.pennantCol || '#3E9C97', { ink: I, sw: .7 });
      const px = cbx + 330, py = cby + cbh + 40; F([[px - 26, py], [px + 26, py], [px + 20, py - 44], [px - 20, py - 44]], '#C9734A', { ink: I, sw: .6 });
      for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k - 2) * .45; F(xform(ellPts(0, -26, 12, 28, 10), px + Math.cos(a) * 6, py - 46, 1, a + Math.PI / 2), '#5E9A5A', { ink: I, sw: .4 }); }
    }
    // desk (against the wall, right) + chair + lamp + laptop
    const dx0 = 560, dx1 = 1040, dy = 1170;
    Rc(dx0, dy, dx1 - dx0, 26, '#E9E2D2', { ink: I, sw: .9 }); Rc(dx0 + 14, dy + 26, 16, fy + 40 - dy, '#BDB4A4', { ink: I, sw: .5 }); Rc(dx1 - 30, dy + 26, 16, fy + 40 - dy, '#BDB4A4', { ink: I, sw: .5 });
    Rc(dx1 - 200, dy + 26, 170, 140, '#D9D0BE', { ink: I, sw: .6 }); ln([[dx1 - 190, dy + 96], [dx1 - 40, dy + 96]], .4, I, 'ink', 0);
    // lamp
    const lx = dx1 - 70; ln([[lx, dy], [lx - 20, dy - 130], [lx - 90, dy - 190]], 1.2, '#3A3A48', 'ink', .3);
    F([[lx - 140, dy - 170], [lx - 80, dy - 220], [lx - 50, dy - 180], [lx - 100, dy - 140]], lampOn ? '#FFE9B0' : '#6E86A8', { ink: I, sw: .8 });
    Ec(lx, dy - 4, 34, 8, '#3A3A48');
    if (lampOn) { halo(lx - 110, dy - 60, 360, '#FFD98E', 80 * (.6 + .4 * dk), 4); F([[lx - 130, dy - 150], [lx - 70, dy - 190], [lx + 40, dy], [dx0 + 60, dy]], '#FFE9B0', { op: 60 }); }
    if (o.laptop !== false) { const lt = o.laptop || 'glow'; const r = laptop(760, dy, .62, { glow: true, screen: lt !== 'glow' && lt !== 'zoom' ? lt : undefined }); if (lt === 'zoom') zoomGrid(r.x, r.y, r.w, r.h, t, {}); }
    // chair (mesh back)
    const cx = 760; F([[cx - 110, dy + 120], [cx + 110, dy + 120], [cx + 120, dy + 160], [cx - 120, dy + 160]], '#3A3A48', { ink: I, sw: .7 });
    RRc(cx + 96, dy - 30, 36, 190, 14, '#3A3A48', { ink: I, sw: .8 }); for (let k = 0; k < 5; k++) ln([[cx + 100, dy - 10 + k * 34], [cx + 128, dy - 10 + k * 34]], .3, '#5A5A68', 'ink', 0); ln([[cx, dy + 160], [cx, fy + 140]], 2, '#2A2A34', 'ink', 0); ln([[cx - 90, fy + 160], [cx, fy + 140], [cx + 90, fy + 160]], 1.4, '#2A2A34', 'ink', .2);
    // bed (foreground left) with quilt
    const by = 1300;
    RRc(-60, by - 230, 600, 240, 30, mixCol('#8C6A4E', '#3A3050', dk * .6), { ink: I, sw: 1 }); // headboard
    F([[-90, by], [600, by], [640, by + 210], [-90, by + 210]], mixCol(sib ? '#4B5E9E' : '#3E9C97', '#262A5E', dk * .5), { ink: I, sw: 1.1, curv: .2 });
    for (let k = 0; k < 4; k++) ln([[k * 150 - 40, by + 10], [k * 160 - 30, by + 200]], .5, shade(sib ? '#4B5E9E' : '#3E9C97', -.25), 'ink', .3);
    RRc(20, by - 70, 230, 90, 40, '#F6F1E6', { ink: I, sw: .9, j: .6 }); RRc(280, by - 64, 200, 80, 36, '#EFE6D6', { ink: I, sw: .9, j: .6 });
    F([[-90, by + 210], [640, by + 210], [620, by + 330], [-90, by + 330]], mixCol('#E8DCC4', '#3A3458', dk * .7), { ink: I, sw: 1 });
    // under the bed: a basketball
    basketball(500, by + 395, .55, { t });
    // poster tube leaning, or the packed suitcase by the door
    if (o.suitcase) suitcase(930, fy + 130, .7, {}); else { F(xform(rectPts(-16, -170, 32, 340), 1010, fy + 20, 1, .14), '#E46F8C', { ink: I, sw: .7 }); Ec(1033, fy - 145, 16, 8, '#2A2230'); }
    if (sib) hoodie(820, dy + 150, .32, { col: '#8E8F9A' }); // hoodie over the chair
    setEnd();
    return { bed: [300, by + 20], desk: [760, dy], chair: [cx, dy + 140], door: [950, fy + 60], floor: fy };
  }

  // ---------- STAIRS — vertical set: a bedroom door at the top, a hallway at the bottom ----------
  // o.time 'day'|'night', o.glow 0..1 (lamp light from below, default 1; o.kitchenGlow alias), o.door 0..1 (the door ajar, light spill)
  // RETURNS {step(k) → [x,y] foot point on step k (0 = bottom … n), n, top:[x,y] landing, bottom:[x,y] hallway floor}
  function homeStairsSet(t, o = {}) {
    setBegin(22, t, o);
    const night = o.time === 'night', gl = N(o.glow, N(o.kitchenGlow, 1));
    const wall = night ? '#3A3F72' : '#F1E7D2';
    F(rectPts(-80, -80, W + 160, H + 160), wall); TX(rectPts(-80, -80, W + 160, H + 160), shade(wall, .1), 60, { tex: .7 });
    // upstairs landing + loft railing (top band) and a bedroom door
    const ly = 470;
    F([[-90, ly], [W + 90, ly], [W + 90, ly + 40], [-90, ly + 40]], night ? '#5A4E6E' : '#C9A26E', { ink: I, sw: 1 });
    const dO = N(o.door, .3);
    Rc(640, 40, 260, ly - 40, night ? '#2A2E58' : '#E8DFC8', { ink: I, sw: 1 });
    if (dO > 0) { halo(770, 260, 260 * dO, '#FFE3A0', 50, 3); F([[640, 40], [640 + 260 * (1 - dO * .7), 60], [640 + 260 * (1 - dO * .7), ly - 10], [640, ly]], '#F6F1E6', { ink: I, sw: .9 }); F([[640 + 260 * (1 - dO * .7), 40], [900, 40], [900, ly], [640 + 260 * (1 - dO * .7), ly]], '#FFE9B0', { op: 230 }); }
    else Rc(640, 40, 260, ly - 40, '#F6F1E6', { ink: I, sw: .9 });
    Ec(660 + 260 * (1 - dO * .7) - 40, 280, 8, 8, '#C9A44A', { n: 8 });
    for (let k = 0; k < 14; k++) Rc(-40 + k * 50, 300, 12, ly - 300, '#FFFFFF', { ink: I, sw: .4 }); // loft balusters (left)
    Rc(-60, 284, 740, 22, '#FFFFFF', { ink: I, sw: .8 });
    // stair run: bottom-right → top-left along a diagonal, 12 steps
    const n = 12, x0 = 980, y0 = 1560, x1 = 300, y1 = ly + 30, sw = 330;
    const P = k => [lerp(x0, x1, k / n), lerp(y0, y1, k / n)];
    // stair wall stringer (dark wood) behind
    F([[x0 + sw * .45, y0 + 10], [x1 + sw * .45, y1 + 10], [x1 - sw * .55, y1 + 10], [x1 - sw * .55, y0 + 60], [x0 + sw * .45, y0 + 60]], night ? '#2E3262' : '#E2D6BC'); // under-stair wall
    F([[x0 + sw * .47, y0 + 6], [x1 + sw * .47, y1 - 4], [x1 + sw * .47, y1 + 50], [x0 + sw * .47, y0 + 60]], night ? '#4A3E5E' : '#FFFFFF', { ink: I, sw: .8 }); // stringer
    for (let k = n - 1; k >= 0; k--) {
      const [ax, ay] = P(k), [bx, by] = P(k + 1), dx = (bx - ax), rise = ay - by;
      // tread (top face) then riser (front face)
      const tread = [[ax - sw * .5, ay - rise], [ax - sw * .5 + dx, ay - rise], [ax + sw * .5 + dx, ay - rise], [ax + sw * .5, ay - rise]];
      F([[ax - sw * .55, ay - rise], [ax + sw * .45, ay - rise], [ax + sw * .45 - dx * .0, ay], [ax - sw * .55, ay]], night ? '#E9E2D2' : '#FFFFFF', { ink: I, sw: .7 }); // riser
      F([[ax - sw * .55, ay - rise], [ax + sw * .45, ay - rise], [ax + sw * .45 + dx * .9, ay - rise - 18], [ax - sw * .55 + dx * .9, ay - rise - 18]], night ? '#7A5A6E' : '#C98E5A', { ink: I, sw: .7 }); // tread nose
      if (!night) TX([[ax - sw * .55, ay - rise], [ax + sw * .45, ay - rise], [ax + sw * .45 + dx * .9, ay - rise - 18], [ax - sw * .55 + dx * .9, ay - rise - 18]], '#B5784A', 90);
    }
    // banister (white posts + dark handrail) on the open (front) side
    for (let k = 0; k <= n; k++) { const [ax, ay] = P(k); const bx2 = ax + sw * .42, rise = (y0 - y1) / n; ln([[bx2, ay - rise], [bx2, ay - rise - 230]], 1.4, '#FFFFFF', 'ink', 0); ln([[bx2 + 4, ay - rise], [bx2 + 4, ay - rise - 230]], .3, I, 'ink', 0); }
    const [hA, hAy] = P(0), [hB, hBy] = P(n), rr = (y0 - y1) / n;
    ln([[hA + sw * .42, hAy - rr - 236], [hB + sw * .42, hBy - rr - 236]], 4, night ? '#3A2A34' : '#5A3A2A', 'ink', 0);
    Rc(hA + sw * .42 - 18, hAy - rr - 280, 36, 290, '#FFFFFF', { ink: I, sw: .9 }); Rc(hA + sw * .42 - 24, hAy - rr - 296, 48, 22, '#5A3A2A', { ink: I, sw: .6 }); // newel post
    // photo frames climbing the wall
    [[220, 900, 120, 150, '#9CC8E8'], [380, 760, 100, 130, '#F3A7B5'], [130, 1120, 140, 110, '#F7D774'], [520, 620, 90, 110, '#86AE7A']].forEach(([fx, fy2, fw, fh, c], i) => frameArt(fx, fy2, fw, fh, c, (x, y) => { Ec(x - 14, y + 4, 16, 18, SKINS[i % 6], { n: 10 }); Ec(x + 16, y + 10, 13, 15, SKINS[(i + 2) % 6], { n: 10 }); }, (hash(i) - .5) * .06));
    // the hallway at the bottom: wood floor, a rug, a console table with a lamp
    const ky = 1600;
    F([[-90, ky], [640, ky], [640, H + 90], [-90, H + 90]], night ? '#5A4A5E' : '#C9A26E', { ink: I, sw: .9 }); TX(rectPts(-90, ky, 730, H - ky + 90), night ? '#4A3E52' : '#B58C5A', 80);
    F([[20, ky + 160], [520, ky + 160], [560, ky + 300], [-20, ky + 300]], night ? '#4A3E6E' : '#C3B1E1', { ink: I, sw: .7 }); // rug
    Rc(60, ky - 150, 300, 22, night ? '#3A2E3A' : '#7A5A3E', { ink: I, sw: .8 }); ln([[80, ky - 128], [80, ky]], 1.4, night ? '#3A2E3A' : '#7A5A3E', 'ink', 0); ln([[340, ky - 128], [340, ky]], 1.4, night ? '#3A2E3A' : '#7A5A3E', 'ink', 0);
    ln([[150, ky - 150], [150, ky - 250]], 1, '#3A3A48', 'ink', 0); F([[110, ky - 250], [190, ky - 250], [175, ky - 310], [125, ky - 310]], gl > 0 ? '#FFE9B0' : '#E8DFC8', { ink: I, sw: .7 });
    if (gl > 0) { halo(150, ky - 260, 420, '#FFD98E', 70 * gl, 4); F(rectPts(-90, ky, 730, 400), '#FFD98E', { op: 20 * gl }); }
    setEnd();
    return { step: k => { const [ax, ay] = P(clamp(k / n) * n); return [ax, ay - (y0 - y1) / n]; }, n, top: [470, ly + 20], bottom: [x0 - 60, y0 + 40] };
  }

  // ---------- KITCHEN ----------
  // o.view 'island' (painted cabinets o.cabinets, plain counter o.counter, bar stools o.stools (default 2), window over sink) | 'nook'
  //   (butter walls, round glass table, magnet board, floral-rim plates). o.cooking (pot + pan steam, default true on island),
  //   o.plate (a covered plate; o.note adds a note), o.sofa (charcoal sofa back, foreground), o.time 'day'|'evening'.
  //   RETURNS {counter:[x,y] (where the cook stands), island:[x,y] top-centre, table:[x,y]}
  function kitchenSet(t, o = {}) {
    setBegin(23, t, o);
    const eve = o.time === 'evening';
    if (o.view === 'nook') {
      wallFloor(eve ? '#EFCB6A' : '#F5D97E', '#D6B98E', 1240, { floor: 'tile', base: '#FFFFFF' });
      windowBox(380, 230, 520, 600, (x, y, w, h) => { skyBands(y, y + h, eve ? ['#F6A87A', '#F9CF85', '#FBE6B0'] : ['#BFE0F4', '#DCEFF2', '#EEF6EE'], 4, 3, 2, x, x + w); F([[x, y + h * .7], [x + w * .3, y + h * .6], [x + w, y + h * .68], [x + w, y + h], [x, y + h]], '#86AE7A'); F([[x + w * .1, y + h], [x + w * .14, y + h * .5], [x + w * .2, y + h]], '#4E8A5E'); }, { blinds: .32, frame: '#FFFFFF', bars: 'cross' });
      // magnet board
      Rc(70, 330, 230, 330, '#F6F1E6', { ink: I, sw: .9 });
      for (let i = 0; i < 12; i++) { const mx = 100 + (i % 3) * 70 + hash(i) * 10, my = 360 + Math.floor(i / 3) * 74; F(xform(rectPts(-24, -20, 48, 40), mx, my, 1, (hash(i * 3) - .5) * .4), ['#E46F8C', '#3E6FA8', '#E9AE3C', '#86AE7A', '#F2876A', '#7E62AE'][i % 6], { ink: I, sw: .4 }); }
      // round glass-top table with plates and a lidded canister
      const tx = 540, ty = 1330;
      ln([[tx, ty + 30], [tx, ty + 330]], 4, '#B9B4AC', 'ink', 0); ln([[tx - 120, ty + 340], [tx, ty + 300], [tx + 120, ty + 340]], 2, '#B9B4AC', 'ink', .3);
      [[-1], [1]].forEach(([d]) => { const cx = tx + d * 420; RRc(cx - 70, ty - 200, 140, 200, 30, '#F6F1E6', { ink: I, sw: .8 }); Rc(cx - 80, ty, 160, 30, '#E8DFC8', { ink: I, sw: .7 }); ln([[cx - 60, ty + 30], [cx - 66, ty + 260]], 1, '#8E7A5E', 'ink', 0); ln([[cx + 60, ty + 30], [cx + 66, ty + 260]], 1, '#8E7A5E', 'ink', 0); });
      F(ellPts(tx, ty, 380, 110, 32), '#CFE8EC', { op: 150, ink: I, sw: 1.1 }); F(ellPts(tx - 60, ty - 30, 200, 30, 20), '#FFFFFF', { op: 90 });
      [[-170, 0], [170, 10], [0, 50]].forEach(([px, py], i) => { Ec(tx + px, ty + py, 92, 34, '#FFFFFF', { ink: I, sw: .7 }); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; Ec(tx + px + Math.cos(a) * 80, ty + py + Math.sin(a) * 28, 6, 4, ['#E46F8C', '#86AE7A'][k % 2], { n: 6 }); } Ec(tx + px, ty + py, 58, 20, ['#E9C690', '#E9AE3C', '#C9A26E'][i]); if (i === 0) for (let k = 0; k < 3; k++) Ec(tx + px - 20 + k * 20, ty + py - 4 - k * 3, 40, 14, '#F1D7A6', { ink: I, sw: .3 }); });
      RRc(tx + 230, ty - 80, 90, 70, 16, '#C9CCD6', { ink: I, sw: .8 }); Ec(tx + 275, ty - 80, 45, 12, '#E4E6EC', { ink: I, sw: .6 }); // canister
      Ec(tx - 290, ty - 30, 46, 20, '#E9AE3C', { ink: I, sw: .6, op: 200 }); // soup bowl (glass)
      if (o.plate) savedPlate(tx, ty - 10, .7, { t, note: o.note });
      setEnd(); return { table: [tx, ty], counter: [tx, ty + 300], island: [tx, ty] };
    }
    const wall = eve ? '#E7D3B0' : '#F1E4CC', fy = 1180, kc = o.cabinets || '#9DB4A8', kc2 = shade(kc, -.1), ct = o.counter || '#EDEAE4';
    wallFloor(wall, '#C9A57A', fy + 340, { floor: 'tile' });
    // upper cabinets (raised panels)
    for (let k = 0; k < 6; k++) if (k !== 2 && k !== 3) cabinet(40 + k * 170, 140, 160, 300, kc, { top: true });
    // window over the sink
    windowBox(380, 190, 320, 300, (x, y, w, h) => { skyBands(y, y + h, eve ? ['#3E3A7E', '#E07E8E', '#F6A87A'] : ['#BFE0F4', '#E6F1F2'], 4, 3, 5, x, x + w); F([[x, y + h * .75], [x + w * .5, y + h * .55], [x + w, y + h * .7], [x + w, y + h], [x, y + h]], eve ? '#5A4A7A' : '#B9C98A'); }, { blinds: .22, frame: '#F6F1E6' });
    // tiled backsplash + stone counter + lower cabinets
    F(rectPts(-80, 460, W + 160, 230), '#EEE8DC', { ink: I, sw: .9 }); for (let r = 1; r < 5; r++) ln([[-60, 460 + r * 46], [W + 60, 460 + r * 46]], .25, '#C9C2B0', 'ink', 0); for (let c = 0; c < 14; c++) for (let r = 0; r < 5; r++) ln([[c * 90 + (r % 2) * 45, 460 + r * 46], [c * 90 + (r % 2) * 45, 506 + r * 46]], .25, '#C9C2B0', 'ink', 0);
    granite([[-90, 690], [W + 90, 690], [W + 90, 730], [-90, 730]], ct, 6, 9, -60, 690, W + 120, 40);
    for (let k = 0; k < 6; k++) cabinet(20 + k * 175, 740, 165, 300, kc2);
    Rc(-80, 1040, W + 160, 40, shade(kc, -.45));
    // stove left: pot + pan, steam; microwave; water bottles
    Rc(40, 650, 300, 40, '#2A2A30', { ink: I, sw: .8 });
    if (N(o.cooking, true)) { RRc(80, 560, 120, 100, 16, '#C9CCD6', { ink: I, sw: .9 }); Ec(140, 560, 60, 14, '#E4E6EC', { ink: I, sw: .6 }); steam(140, 540, t, 3, 200); Ec(270, 648, 70, 14, '#1E1E24', { ink: I, sw: .7 }); Ec(270, 642, 46, 10, '#E9C690'); ln([[340, 648], [400, 640]], 1.6, '#1E1E24', 'ink', 0); halo(200, 670, 120, '#FF8A4A', 40, 2); }
    RRc(740, 580, 170, 110, 10, '#E4E6EC', { ink: I, sw: .9 }); Rc(756, 596, 104, 78, '#3A3A44'); for (let k = 0; k < 3; k++) Ec(886, 606 + k * 22, 5, 5, '#8E929E', { n: 6 }); // microwave
    [[930, '#C9CCD6'], [970, '#3E6FA8'], [1010, '#C9CCD6'], [1045, '#33407E']].forEach(([bx, c]) => { RRc(bx - 14, 590, 28, 100, 10, c, { ink: I, sw: .6 }); Rc(bx - 9, 578, 18, 14, '#2A2A30'); });
    // the island (foreground) – stone top + wood front + bar stools
    const iy = fy, ix0 = 90, ix1 = 990;
    granite([[ix0 - 30, iy], [ix1 + 30, iy], [ix1 + 60, iy + 70], [ix0 - 60, iy + 70]], ct, 6, 13, ix0 - 40, iy + 4, ix1 - ix0 + 80, 62);
    F([[ix0 - 60, iy + 70], [ix1 + 60, iy + 70], [ix1 + 60, iy + 340], [ix0 - 60, iy + 340]], kc, { ink: I, sw: 1 });
    for (let k = 0; k < 4; k++) cabinet(ix0 - 40 + k * 240, iy + 90, 220, 230, kc2);
    if (o.plate) savedPlate(700, iy + 20, .75, { t, note: o.note });
    if (o.phone !== false) phone(300, iy + 20, .5, { screen: 'chat', rot: -1.3, halo: false });
    const nst = Math.max(0, Math.round(N(o.stools, 2))), stX = Array.from({ length: nst }, (_, k) => nst > 1 ? lerp(300, 780, k / (nst - 1)) : 540);
    stX.forEach(sx => { const sy = iy + 200; ln([[sx - 46, sy + 20], [sx - 56, sy + 300]], 2.2, '#3A2A20', 'ink', 0); ln([[sx + 46, sy + 20], [sx + 56, sy + 300]], 2.2, '#3A2A20', 'ink', 0); ln([[sx - 50, sy + 200], [sx + 50, sy + 200]], 1.4, '#3A2A20', 'ink', 0); F([[sx - 70, sy - 70], [sx + 70, sy - 70], [sx + 76, sy], [sx - 76, sy]], '#7A5A3E', { ink: I, sw: .9, curv: .3 }); Ec(sx, sy + 6, 92, 28, '#8E6A4A', { ink: I, sw: 1 }); });
    if (o.sofa) { F([[-90, 1640], [W + 90, 1610], [W + 90, H + 90], [-90, H + 90]], '#2E2C32', { ink: I, sw: 1.2, curv: .2 }); TX(rectPts(-90, 1620, W + 180, 400), '#4A4650', 90); ln([[-60, 1700], [W + 60, 1680]], .5, '#5A5660', 'ink', .3); }
    setEnd();
    return { counter: [560, 1040], island: [540, iy], table: [540, iy] };
  }

  // ---------- DINING ROOM (patterned wallpaper, pendant light, long table) ----------
  // o.wall (wallpaper colour), o.plates n (0..6, default 3), o.laptop (a laptop on the table), o.plate (covered plate; o.note),
  // o.cover (a table runner), o.chandelier 0..1 glow. RETURNS {table:[x,y] top centre, seatL:[x,y], seatR:[x,y]}
  function diningRoomSet(t, o = {}) {
    setBegin(24, t, o);
    const wy = 1080;
    const wc = o.wall || '#4E6A5A';
    F(rectPts(-80, -80, W + 160, wy + 90), wc);
    // trellis wallpaper: ogee lattice
    for (let r = 0; r < 9; r++) for (let c = 0; c < 6; c++) {
      const cx = c * 210 + (r % 2) * 105 - 40, cy = r * 130 + 40;
      ln([[cx, cy - 60], [cx + 40, cy - 20], [cx, cy + 20], [cx - 40, cy - 20], [cx, cy - 60]], .45, shade(wc, .3), 'ink', .6);
      F(starPts(cx, cy - 20, 12, .4, 4), shade(wc, .18), { op: 200 });
    }
    // wainscoting
    F(rectPts(-80, wy, W + 160, 300), '#F4ECDD', { ink: I, sw: .9 }); Rc(-80, wy - 6, W + 160, 22, '#FFFFFF', { ink: I, sw: .7 });
    for (let k = 0; k < 5; k++) Rc(30 + k * 215, wy + 50, 180, 200, '#F8F2E6', { ink: '#C9BFA8', sw: .5 });
    F([[-90, wy + 300], [W + 90, wy + 300], [W + 90, H + 90], [-90, H + 90]], '#D9C29A', { ink: I, sw: .9 }); TX(rectPts(-90, wy + 300, W + 180, 600), '#C9A87A', 90);
    for (let i = 0; i < 8; i++) ln([[-60, wy + 330 + i * 70], [W + 60, wy + 330 + i * 70]], .25, '#B8956A', 'ink', 0);
    // three simple pendant lamps
    const chy = o.calm === 'top' ? 640 : 330, sp = N(o.chandelier, 1);
    halo(540, chy + 40, 380, '#FFE9B0', 60 * (.4 + .6 * sp), 4);
    [340, 540, 740].forEach(x => { ln([[x, -10], [x, chy - 40]], .6, '#3A3A48', 'ink', 0); F([[x - 50, chy + 10], [x + 50, chy + 10], [x + 26, chy - 40], [x - 26, chy - 40]], '#2E2C34', { ink: I, sw: .8 }); Ec(x, chy + 12, 22, 8, '#FFF0C4', { op: 160 + 90 * sp }); });
    // wooden chairs with slat backs behind the table
    [190, 540, 890].forEach(cx => { Rc(cx - 80, 1080, 160, 26, '#8A6242', { ink: I, sw: .8 }); for (let k = 0; k < 3; k++) Rc(cx - 50 + k * 40, 1106, 18, 150, '#8A6242', { ink: I, sw: .5 }); ln([[cx - 76, 1106], [cx - 80, 1330]], 1.6, '#6E4A32', 'ink', 0); ln([[cx + 76, 1106], [cx + 80, 1330]], 1.6, '#6E4A32', 'ink', 0); });
    // table with cream body (o.cover: a table runner)
    const ty = 1360;
    F([[40, ty], [1040, ty], [1080, ty + 70], [0, ty + 70]], '#F6EEDD', { ink: I, sw: 1 });
    F([[0, ty + 70], [1080, ty + 70], [1060, ty + 130], [20, ty + 130]], '#EFE3CC', { ink: I, sw: .8 });
    if (o.cover) F([[200, ty + 4], [880, ty + 4], [900, ty + 66], [180, ty + 66]], typeof o.cover === 'string' ? o.cover : '#3E9C97', { ink: I, sw: .6, op: 220 }); // runner
    [[90], [990]].forEach(([lx]) => { F([[lx - 20, ty + 150], [lx + 20, ty + 150], [lx + 30, ty + 420], [lx - 10, ty + 420]], '#EFE3CC', { ink: I, sw: .8, curv: .4 }); });
    const np = N(o.plates, 3);
    for (let k = 0; k < np; k++) { const px = 540 + (k - (np - 1) / 2) * 200; Ec(px, ty + 34, 80, 22, '#E4E6EC', { ink: I, sw: .7 }); Ec(px, ty + 34, 56, 14, '#F6F1E6'); }
    if (o.plate) savedPlate(540, ty + 30, .8, { t, note: o.note });
    if (o.laptop) laptop(900, ty + 40, .45, { glow: true });
    setEnd();
    return { table: [540, ty + 30], seatL: [190, 1330], seatR: [890, 1330] };
  }

  // ---------- DEBATE ROUND: a classroom with a tall lectern ----------
  // o.board (whiteboard word, default 'DEBATE'), o.room (optional plate text on the door), o.podium (true), o.podiumH (px, default 640 — top at y≈860),
  // o.kids (true: backs of other kids at desks, holding printed speeches), o.tab (a taped notice, default false). RETURNS {podium:[x, topY], floor, standX}
  function debateSet(t, o = {}) {
    setBegin(25, t, o);
    const fy = 1500;
    wallFloor('#E9E4D2', '#B9A88A', fy, { floor: 'tile', base: '#3E9C97' });
    Rc(-80, 1040, W + 160, fy - 1040, '#CFE3DE'); ln([[-60, 1040], [W + 60, 1040]], .6, I, 'ink', 0);
    // whiteboard + clock + flag + door w/ room number
    if (o.calm !== 'top') { Rc(160, 230, 640, 330, '#FBFBF8', { ink: I, sw: 1.1 }); Rc(150, 560, 660, 16, '#C9CCD6', { ink: I, sw: .6 }); ln([[200, 300], [420, 290], [620, 310]], .6, '#3E6FA8', 'marker', .4); ln([[200, 360], [520, 360]], .5, '#E14C5A', 'marker', .3); scribble(o.board || 'DEBATE', 470, 440, 50, '#2A3A8A', { sw: 1.8 }); clock(900, 300, .55, { time: '10:10', rim: '#2A2230', t }); }
    Rc(880, 620, 180, fy - 620, '#9A6E48', { ink: I, sw: 1 }); Rc(910, 660, 70, 120, '#CFE3F0', { ink: I, sw: .6 }); Ec(1040, 1100, 9, 9, '#C9A44A', { n: 8 });
    if (o.room) { Rc(905, 820, 90, 60, '#FFFFFF', { ink: I, sw: .5 }); scribble(String(o.room), 950, 850, String(o.room).length > 2 ? 28 : 38, I, { sw: 1 }); }
    if (N(o.tab, false)) { F(xform(rectPts(-60, -80, 120, 160), 760, 760, 1, .05), '#FFFFFF', { ink: I, sw: .6 }); scribble(typeof o.tab === 'string' ? o.tab : 'NOTICE', 762, 706, 18, I, { sw: .6 }); for (let k = 0; k < 6; k++) ln([[712, 736 + k * 18], [800 - hash(k) * 30, 738 + k * 18]], .3, '#9A9AA8', 'ink', 0); Rc(735, 672, 50, 14, '#F7D774', { op: 200 }); }
    // the lectern (wood, tall)
    const px = 470, ph = N(o.podiumH, 640), top = fy - ph;
    if (N(o.podium, true)) {
      F([[px - 150, fy + 10], [px + 150, fy + 10], [px + 120, top + 60], [px - 120, top + 60]], '#B9783E', { ink: I, sw: 1.2 });
      TX([[px - 150, fy + 10], [px + 150, fy + 10], [px + 120, top + 60], [px - 120, top + 60]], '#9A5E2E', 100);
      F([[px - 170, top + 60], [px + 170, top + 60], [px + 150, top], [px - 150, top]], '#C98A4E', { ink: I, sw: 1.1 });
      Rc(px - 70, top + 140, 140, 90, '#9A5E2E', { ink: shade('#9A5E2E', -.3), sw: .5 });
      ln([[px + 60, top], [px + 90, top - 120], [px + 50, top - 160]], 1.4, '#2A2A34', 'ink', .5); Ec(px + 46, top - 166, 12, 18, '#3A3A48', { n: 8 }); // gooseneck mic
    }
    // student desks in the foreground (backs of kids)
    if (N(o.kids, true)) [[150, 1650], [540, 1690], [930, 1650]].forEach(([dx, dy], i) => {
      blobPerson(dx, dy - 120, 3.4, ['#33407E', '#E46F8C', '#86AE7A'][i], SKINS[(i * 2) % 6], t, i);
      F([[dx - 190, dy - 30], [dx + 190, dy - 30], [dx + 210, dy + 20], [dx - 210, dy + 20]], '#D8CCB0', { ink: I, sw: 1 });
      F(xform(rectPts(-60, -40, 120, 80), dx + 110, dy - 50, 1, -.15), '#FFFFFF', { ink: I, sw: .5 }); for (let k = 0; k < 3; k++) ln([[dx + 70, dy - 70 + k * 16], [dx + 140, dy - 76 + k * 16]], .3, '#9A9AA8', 'ink', 0);
    });
    setEnd();
    return { podium: [px, top], floor: fy, standX: px };
  }

  // ---------- SCHOOL GYM: old wood floor, folding bleachers with spectators, wall scoreboard, wall hoop ----------
  // o.arc 0..1 (dotted ball-trajectory arc from o.shooter to the hoop; the ball rides it), o.shooter [x,y] (default [250,1420]), o.score ['',''] lettered
  // on the scoreboard (omit = dashes), o.crowd (true). RETURNS {hoop:[x,y] rim centre, floor, shooter:[x,y]}
  function gymSet(t, o = {}) {
    setBegin(26, t, o);
    const fy = 1180;
    F(rectPts(-80, -80, W + 160, fy + 100), '#E9DFC6'); for (let r = 0; r < 20; r++) { ln([[-60, r * 60], [W + 60, r * 60]], .25, '#CFC2A2', 'ink', 0); for (let c = 0; c < 6; c++) ln([[c * 200 + (r % 2) * 100, r * 60], [c * 200 + (r % 2) * 100, r * 60 + 60]], .25, '#CFC2A2', 'ink', 0); }
    Rc(-80, fy - 300, W + 160, 60, '#33407E');
    // high windows
    for (let k = 0; k < 4; k++) { Rc(60 + k * 260, 60, 200, 120, '#BFE0F4', { ink: I, sw: .8 }); ln([[160 + k * 260, 60], [160 + k * 260, 180]], .5, I, 'ink', 0); }
    // scoreboard
    if (o.calm !== 'top') { RRc(300, 230, 480, 220, 12, '#1E1E26', { ink: I, sw: 1.1 }); scribble('HOME', 410, 280, 34, '#F7D774', { sw: .8 }); scribble('GUEST', 670, 280, 34, '#F7D774', { sw: .8 }); const sc = o.score || ['--', '--']; scribble(String(sc[0]), 410, 370, 70, '#FF5A4A', { sw: 2 }); scribble(String(sc[1]), 670, 370, 70, '#FF5A4A', { sw: 2 }); halo(540, 340, 260, '#FF5A4A', 20, 2); }
    // floor (wood, perspective) + lines
    F([[-90, fy], [W + 90, fy], [W + 90, H + 90], [-90, H + 90]], '#E2B072', { ink: I, sw: 1 }); TX(rectPts(-90, fy, W + 180, H - fy + 90), '#D49A5A', 100);
    for (let k = -10; k <= 10; k++) ln([[540 + k * 60, fy], [540 + k * 190, H + 40]], .25, '#B97E46', 'ink', 0);
    ln([[-60, 1500], [W + 60, 1500]], .9, '#FFFFFF', 'ink', 0); F(ellPts(880, 1390, 340, 120, 30), '#000', { op: 0, ink: '#FFFFFF', sw: 1 }); F([[700, 1270], [1100, 1270], [1100, 1500], [700, 1500]], '#33407E', { op: 90 });
    // folding bleachers (left) with spectators
    for (let r = 0; r < 5; r++) { const y = fy - 40 + r * 70; F([[-90, y], [360 - r * 30, y], [360 - r * 30, y + 22], [-90, y + 22]], '#B8B4A8', { ink: I, sw: .6 }); }
    if (N(o.crowd, true)) for (let i = 0; i < 9; i++) { const r = i % 4, x = 20 + Math.floor(i / 4) * 110 + r * 22, y = fy - 60 + r * 70; blobPerson(x, y, 1.9, ['#E46F8C', '#3E6FA8', '#86AE7A', '#E9AE3C', '#7E62AE'][i % 5], SKINS[i % 6], t, i); }
    // hoop (right, wall-mounted)
    const hx = 880, hy = 760;
    ln([[hx + 160, 420], [hx + 100, hy - 120]], 3, '#3A3A48', 'ink', 0);
    Rc(hx - 130, hy - 200, 260, 170, '#FFFFFF', { ink: I, sw: 1.1, op: 220 }); Rc(hx - 50, hy - 130, 100, 74, '#000', { op: 0, ink: '#E14C5A', sw: 1 });
    Ec(hx, hy, 70, 14, '#000', { op: 0, ink: '#E8742E', sw: 2.4 }); for (let k = 0; k < 7; k++) ln([[hx - 66 + k * 22, hy + 6], [hx - 40 + k * 14, hy + 110]], .4, '#FFFFFF', 'ink', .3);
    // optional shot: dotted arc
    const sh = o.shooter || [250, 1420], a = N(o.arc, 0);
    if (a > 0) {
      const P = u => [lerp(sh[0], hx, u), lerp(sh[1] - 420, hy - 20, u) - Math.sin(u * Math.PI) * 520];
      for (let k = 0; k < 26 * a; k++) { const [x, y] = P(k / 26); Ec(x, y, 7, 7, PAL.hot, { n: 8 }); }
      const [bx, by] = P(Math.min(1, a)); basketball(bx, by, .7, { spin: t * 8 });
      if (a >= 1) { halo(hx, hy + 40, 140, PAL.hot, 60, 3); }
    }
    setEnd();
    return { hoop: [hx, hy], floor: 1500, shooter: sh };
  }

  // ---------- SCIENCE FAIR ----------
  // o.mode 'zoom' (default: a desk at night, a laptop video call with a grid of tiles (o.whiz, see zoomGrid); o.gadget adds a gadget
  //   case beside it, default false) | 'hall' (tri-fold boards on folding tables in a convention hall; o.showcase: the near-right
  //   table gets a glowing display + banner; o.dream adds a scalloped thought-bubble border).
  //   o.open/o.spark pass through to the gadget case; o.banner (hall showcase banner text, default 'BIG IDEA').
  // RETURNS zoom: {screen:{x,y,w,h}, desk:y, briefcase:[x,y]} · hall: {table:[x,y] the empty table, next:[x,y]}
  function scienceFairSet(t, o = {}) {
    setBegin(27, t, o);
    if (o.mode === 'hall') {
      F(rectPts(-80, -80, W + 160, H + 160), '#E9E4D6');
      // convention ceiling: trusses + lights
      F(rectPts(-80, -80, W + 160, 420), '#C9CCD6'); for (let k = 0; k < 8; k++) { ln([[k * 160 - 40, 0], [k * 160 + 40, 380]], .6, '#8E929E', 'ink', 0); }
      ln([[-60, 120], [W + 60, 120]], 1.2, '#6E727E', 'ink', 0); ln([[-60, 260], [W + 60, 260]], 1.2, '#6E727E', 'ink', 0);
      for (let k = 0; k < 6; k++) { halo(90 + k * 180, 300, 120, '#FFF6D0', 40, 2); Ec(90 + k * 180, 300, 30, 12, '#FFF6D0'); }
      F([[-90, 920], [W + 90, 920], [W + 90, H + 90], [-90, H + 90]], '#B9C3C9', { ink: I, sw: .8 }); TX(rectPts(-90, 920, W + 180, 1000), '#A9B3BA', 90); for (let k = -6; k <= 6; k++) ln([[540 + k * 60, 920], [540 + k * 260, H + 40]], .3, '#9EA8B0', 'ink', 0);
      // far wall with hanging pennants
      F(rectPts(-80, 420, W + 160, 500), '#DCD6C8'); for (let k = 0; k < 9; k++) F([[k * 130, 430], [k * 130 + 90, 430], [k * 130 + 45, 540]], [PAL.teal, PAL.butter, PAL.coral, PAL.sky][k % 4], { ink: I, sw: .5 });
      for (let k = 0; k < 7; k++) { const x = 120 + k * 140; Rc(x - 56, 880, 112, 40, '#E4DED0', { ink: I, sw: .4 }); trifold(x, 880, .2, { col: [PAL.sky, PAL.butter, PAL.blush][k % 3], panels: 3 }); blobPerson(x + 60, 860, 1.4, [PAL.teal, PAL.coral, PAL.indigo][k % 3], SKINS[k % 6], t, k); }
      // two rows of folding tables receding to a central aisle
      let mine = null, nextT = null;
      [.32, .48, .68, .95].forEach((z, k) => [-1, 1].forEach(sd => {
        const y = 900 + z * 600, x = 540 + sd * (70 + 260 * z), tw3 = 230 * z;
        if (k === 3 && sd === 1) { nextT = [x, y]; return; }
        F([[x - tw3, y], [x + tw3, y], [x + tw3 * 1.04, y + 26 * z], [x - tw3 * 1.04, y + 26 * z]], '#F6F1E6', { ink: I, sw: .7 });
        F([[x - tw3 * 1.04, y + 26 * z], [x + tw3 * 1.04, y + 26 * z], [x + tw3, y + 190 * z], [x - tw3, y + 190 * z]], k === 3 ? '#3E9C97' : ['#86AE7A', '#9CC8E8', '#F3A7B5'][(k + (sd > 0 ? 1 : 0)) % 3], { op: 235, ink: I, sw: .5 });
        if (k === 3 && sd === -1) { mine = [x, y]; return; }
        trifold(x, y + 4, .5 * z, { col: ['#9CC8E8', '#F7D774', '#F3A7B5'][(k + sd + 3) % 3], panels: 6 });
      }));
      // the near-right table: a plain table with a tri-fold, or (o.showcase) a glowing display + a giant banner
      const [nx, ny] = nextT;
      if (!o.showcase) {
        F([[nx - 220, ny], [nx + 220, ny], [nx + 229, ny + 25], [nx - 229, ny + 25]], '#F6F1E6', { ink: I, sw: .7 }); F([[nx - 229, ny + 25], [nx + 229, ny + 25], [nx + 220, ny + 190], [nx - 220, ny + 190]], '#9CC8E8', { op: 235, ink: I, sw: .5 });
        trifold(nx, ny + 4, .5 * .95, { col: '#F7D774', panels: 6 });
      } else {
      halo(nx, ny - 160, 300, '#7CFFB0', 70, 4);
      F([[nx - 240, ny], [nx + 240, ny], [nx + 252, ny + 26], [nx - 252, ny + 26]], '#F6F1E6', { ink: I, sw: .9 }); F([[nx - 252, ny + 26], [nx + 252, ny + 26], [nx + 240, ny + 200], [nx - 240, ny + 200]], '#2A2E44', { ink: I, sw: .7 });
      const mx = nx - 60; halo(mx, ny - 120, 220, '#7CFFB0', 60, 3); RRc(mx - 60, ny - 230, 120, 230, 30, '#9CFFC8', { ink: I, sw: 1, op: 220 }); Ec(mx, ny - 230, 60, 16, '#E4FFF0', { ink: I, sw: .8 }); for (let k = 0; k < 5; k++) Ec(mx - 30 + hash(k) * 60, ny - 40 - frac(t * .6 + hash(k * 3)) * 170, 8, 8, '#FFFFFF', { op: 200, n: 8 });
      ln([[470, ny], [470, ny - 560]], 1.6, '#8E929E', 'ink', 0); ln([[950, ny], [950, ny - 560]], 1.6, '#8E929E', 'ink', 0);
      F([[440, ny - 600], [970, ny - 610], [970, ny - 440], [440, ny - 430]], '#FFFFFF', { ink: I, sw: 1.1 });
      scribble(o.banner || 'BIG IDEA', 705, ny - 520, 44, '#2A8A5A', { sw: 2.2 });
      }
      if (o.dream) { // thought-bubble border: fill outside an ellipse, then scallops along its edge
        const ER = (a, k = 1) => [540 + Math.cos(a) * 500 * k, 940 + Math.sin(a) * 860 * k];
        const CX = [[540, H + 90, W + 90, H + 90, W + 90, 940], [-90, 940, -90, H + 90, 540, H + 90], [540, -90, -90, -90, -90, 940], [W + 90, 940, W + 90, -90, 540, -90]];
        CX.forEach((c, q) => { const pts = []; for (let k = 0; k <= 10; k++) pts.push(ER((q + k / 10) * Math.PI / 2)); F(pts.concat([[c[0], c[1]], [c[2], c[3]], [c[4], c[5]]]), '#F4ECDD'); });
        F([[-90, -90], [W + 90, -90], [W + 90, 80], [-90, 80]], '#F4ECDD'); F([[-90, H - 80], [W + 90, H - 80], [W + 90, H + 90], [-90, H + 90]], '#F4ECDD');
        for (let k = 0; k < 30; k++) { const [ex, ey] = ER(k / 30 * TAU); Ec(ex, ey, 74, 74, '#F4ECDD', { ink: I, sw: .9 }); }
        [[880, 1840, 40], [960, 1880, 24]].forEach(([x, y, r]) => Ec(x, y - 60, r, r, '#F4ECDD', { ink: I, sw: .9 }));
      }
      setEnd(); return { table: mine, next: [nx, ny] };
    }
    // ZOOM (default)
    const r0 = homeRoomBack(t, 1);
    const dy = 1240;
    Rc(-80, dy, W + 160, 34, '#E9E2D2', { ink: I, sw: 1 }); F([[-90, dy + 34], [W + 90, dy + 34], [W + 90, H + 90], [-90, H + 90]], '#3A3660');
    const scr = laptop(400, dy, 1.55, { glow: true });
    zoomGrid(scr.x, scr.y, scr.w, scr.h, t, { n: 6, me: 0, whiz: !!o.whiz, whizIdx: 1 });
    if (N(o.gadget, false)) briefcaseMachine(915, dy - 20, .5, { open: N(o.open, 1), spark: N(o.spark, 0), t });
    setEnd();
    return { screen: scr, desk: dy, briefcase: [915, dy - 20] };
  }
  // a dark, cosy bedroom wall at night (used behind close-ups at a desk)
  function homeRoomBack(t, night = 1) {
    F(rectPts(-80, -80, W + 160, H + 160), mixCol('#EFE2C8', '#2E3468', night * .9)); TX(rectPts(-80, -80, W + 160, 1300), '#3A4280', 60, { tex: .7 });
    Rc(640, 260, 360, 260, '#C49A6C', { ink: I, sw: 1 }); ribbon(720, 360, .4, { col: '#3E6FA8' }); ribbon(830, 360, .4, { col: '#E46F8C' });
    halo(1000, 900, 420, '#FFD98E', 60, 4);
    return {};
  }

  // ---------- HIGH-SCHOOL CLASSROOMS ----------
  // o.kind 'bio' (black-top lab benches, periodic table, cell-membrane poster, the door, a seat across the room) | 'test' (a test in
  //   progress: rows of desks, wall clock, one backpack buzzing hot bubbles — somebody's phone won't stop).
  // o.buzz 0..1 (test: the backpack's notification bubbles), o.clock ('11:00'). RETURNS {seat:[x,y], door:[x,y] floor at door, backpack:[x,y]}
  function classroomSet(t, o = {}) {
    setBegin(28, t, o);
    const fy = 1250, bio = o.kind !== 'test';
    wallFloor('#EDE8D8', '#C9C2B0', fy, { floor: 'tile', base: '#33407E' });
    if (o.calm !== 'top') {
      if (bio) {
        // periodic table
        Rc(80, 220, 420, 250, '#FFFFFF', { ink: I, sw: 1 }); for (let r = 0; r < 7; r++) for (let c = 0; c < 18; c++) { if (r === 0 && c > 0 && c < 17) continue; if ((r === 1 || r === 2) && c > 1 && c < 12) continue; Rc(92 + c * 22, 236 + r * 30, 20, 26, ['#F3A7B5', '#9CC8E8', '#F7D774', '#86AE7A', '#C3B1E1'][(c < 2 ? 0 : c > 11 ? 3 : 1) + (r > 4 ? 1 : 0)], { op: 220 }); }
        // cell membrane poster: bilayer
        Rc(560, 220, 300, 250, '#E4F0FA', { ink: I, sw: 1 }); for (let k = 0; k < 9; k++) { const x = 590 + k * 30; Ec(x, 300, 11, 11, '#E46F8C', { n: 8 }); ln([[x - 3, 312], [x - 3, 350]], .4, I, 'ink', .4); ln([[x + 3, 312], [x + 3, 350]], .4, I, 'ink', .4); Ec(x, 410, 11, 11, '#E46F8C', { n: 8 }); ln([[x - 3, 398], [x - 3, 360]], .4, I, 'ink', .4); ln([[x + 3, 398], [x + 3, 360]], .4, I, 'ink', .4); } F(ellPts(770, 355, 26, 60, 14), '#86AE7A', { ink: I, sw: .5, op: 220 });
      } else { Rc(120, 240, 640, 300, '#FBFBF8', { ink: I, sw: 1.1 }); scribble('QUIET', 440, 330, 64, '#2A3A8A', { sw: 2.2 }); scribble('TEST IN PROGRESS', 440, 440, 34, '#E14C5A', { sw: 1.3 }); }
      clock(950, 300, .6, { time: o.clock || (bio ? '9:00' : '11:00'), rim: '#33407E', t });
    }
    // door (right)
    Rc(890, 560, 190, fy - 560, '#9A6E48', { ink: I, sw: 1 }); Rc(920, 600, 60, 140, '#CFE3F0', { ink: I, sw: .6 }); Ec(1050, 920, 9, 9, '#C9A44A', { n: 8 });
    const rows = [[1360, .85], [1560, 1]], seats = [];
    if (bio) rows.forEach(([y, sc], r) => { F([[-90, y], [870 * sc + 60, y], [870 * sc + 60, y + 40], [-90, y + 40]], '#1E1E26', { ink: I, sw: 1 }); F([[-90, y + 40], [850 * sc + 60, y + 40], [850 * sc + 60, y + 190], [-90, y + 190]], '#D8CCB0', { ink: I, sw: .9 }); for (let k = 0; k < 3; k++) { Rc(40 + k * 280 * sc, y + 70, 200 * sc, 100, '#C9BB9C', { ink: shade('#C9BB9C', -.3), sw: .5 }); } Rc(700 * sc, y - 60, 20, 60, '#C9CCD6', { ink: I, sw: .5 }); ln([[710 * sc, y - 60], [740 * sc, y - 80]], 1, '#C9CCD6', 'ink', 0); seats.push([200 + r * 120, y]); if (r === 0) [160, 520].forEach(lx => laptop(lx, y, .3, { glow: false })); });
    else for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const y = 1300 + r * 170, x = 160 + c * 330 + r * 10, sc = .8 + r * .12; F([[x - 120 * sc, y], [x + 120 * sc, y], [x + 130 * sc, y + 26], [x - 130 * sc, y + 26]], '#D8CCB0', { ink: I, sw: .8 }); ln([[x - 100 * sc, y + 26], [x - 100 * sc, y + 160 * sc]], 1.2, '#6E727E', 'ink', 0); ln([[x + 100 * sc, y + 26], [x + 100 * sc, y + 160 * sc]], 1.2, '#6E727E', 'ink', 0); seats.push([x, y]); }
    let bp = null;
    if (!bio) {
      bp = [seats[4][0] + 80, seats[4][1] + 120]; backpack(bp[0], bp[1], .32, { col: '#25306A', t, rot: Math.sin(t * 40) * .04 * N(o.buzz, 0) });
      const bz = N(o.buzz, 0); for (let k = 0; k < 8 * bz; k++) { const u = frac(t * .7 + k / 8), a = -Math.PI / 2 + (hash(k) - .5) * 2, d = 40 + u * 340; chatBubbleShape(bp[0] + Math.cos(a) * d, bp[1] - 60 + Math.sin(a) * d, .3 + u * .25, { who: 'me', w: 260, h: 110, col: PAL.hot }); }
    }
    setEnd();
    return { seat: bio ? [180, 1360] : seats[4], door: [985, fy + 40], backpack: bp };
  }

  // ---------- BAND ROOM: horseshoe risers, black stands, percussion corner, instrument lockers, sign-up sheet ----------
  // RETURNS {floor, drums:[x,y]}
  function bandRoomSet(t, o = {}) {
    setBegin(29, t, o);
    const fy = 1050;
    wallFloor('#E4DCCB', '#8E7A62', fy, { floor: 'wood', base: '#33407E' });
    // instrument lockers along the back wall
    for (let k = 0; k < 8; k++) { Rc(20 + k * 130, 520, 120, fy - 520, ['#33407E', '#2A3570'][k % 2], { ink: I, sw: .8 }); Rc(40 + k * 130, 560, 80, 6, '#8E92B8'); Ec(115 + k * 130, 780, 5, 5, '#C9CCD6', { n: 8 }); if (k % 3 === 1) { RRc(36 + k * 130, 600, 88, 160, 30, '#1E1E26', { ink: I, sw: .5 }); } }
    if (o.calm !== 'top') { Rc(120, 200, 260, 230, '#FFFFFF', { ink: I, sw: .9 }); scribble('SIGN UP', 250, 240, 30, I, { sw: .7 }); for (let k = 0; k < 6; k++) { ln([[150, 290 + k * 22], [350, 290 + k * 22]], .3, '#9A9AA8', 'ink', 0); if (k < 4) ln([[160, 284 + k * 22], [220 + hash(k) * 80, 282 + k * 22]], .5, '#2A3A8A', 'pen', .4); } Rc(460, 180, 480, 260, '#F7D774', { ink: I, sw: .9, op: 230 }); for (let k = 0; k < 5; k++) ln([[490, 230 + k * 40], [910, 230 + k * 40]], .5, I, 'ink', 0); for (let k = 0; k < 8; k++) Ec(520 + k * 50, 250 + (k % 5) * 20, 9, 7, I, { n: 8 }); }
    // risers (horseshoe arcs)
    for (let r = 2; r >= 0; r--) { const ry = 1180 + r * 190, rw = 620 - r * 60; F([[540 - rw - 80, ry + 70], ...Array.from({ length: 13 }, (_, k) => { const a = Math.PI + k / 12 * Math.PI; return [540 + Math.cos(a) * rw, ry - 60 + Math.sin(a) * -120 + 120]; }).reverse().map(([x, y]) => [x, y]), [540 + rw + 80, ry + 70]], ['#A8916E', '#B59C78', '#C2A882'][r], { ink: I, sw: .8, curv: .3 }); }
    // music stands
    [[200, 1260], [420, 1210], [660, 1210], [880, 1260], [300, 1470], [780, 1470]].forEach(([sx, sy]) => { ln([[sx, sy], [sx, sy + 200]], 1.2, '#1E1E26', 'ink', 0); ln([[sx - 50, sy + 230], [sx, sy + 200], [sx + 50, sy + 230]], 1, '#1E1E26', 'ink', 0); F([[sx - 80, sy - 90], [sx + 80, sy - 90], [sx + 90, sy], [sx - 90, sy]], '#1E1E26', { ink: I, sw: .6 }); });
    // percussion corner (bottom-right): snare, bass drum, quads
    const dx = 900, dy = 1700;
    Ec(dx, dy - 60, 150, 150, '#FFFFFF', { ink: I, sw: 1.1 }); Ec(dx, dy - 60, 120, 120, '#E14C5A', { op: 60 }); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; ln([[dx + Math.cos(a) * 125, dy - 60 + Math.sin(a) * 125], [dx + Math.cos(a) * 150, dy - 60 + Math.sin(a) * 150]], .8, '#C9CCD6', 'ink', 0); }
    [[-260, -200, 70], [-140, -240, 60], [-30, -260, 50]].forEach(([ox, oy, r]) => { F(ellPts(dx + ox, dy + oy, r, r * .35, 18), '#F6F1E6', { ink: I, sw: .9 }); F([[dx + ox - r, dy + oy], [dx + ox + r, dy + oy], [dx + ox + r, dy + oy + 60], [dx + ox - r, dy + oy + 60]], '#C9CCD6', { ink: I, sw: .8 }); });
    ln([[dx - 340, dy - 330], [dx - 220, dy - 220]], 1.4, '#D9B98A', 'ink', 0); ln([[dx - 320, dy - 340], [dx - 170, dy - 250]], 1.4, '#D9B98A', 'ink', 0);
    setEnd();
    return { floor: fy + 300, drums: [dx - 140, dy - 240] };
  }

  // ---------- NEIGHBOURHOOD COURT at dusk: chain-link, bikes, a paper bag on the bench, golden hills ----------
  // o.time 'dusk'|'day'. RETURNS {hoop:[x,y], floor}
  function courtSet(t, o = {}) {
    setBegin(30, t, o);
    const day = o.time === 'day';
    skyBands(-40, 900, day ? ['#9CC8E8', '#BFE0F4', '#E6F1F2'] : ['#5A4A8E', '#B474A0', '#F2876A', '#F6B07A', '#F9D58A'], 8, 8, 4);
    if (!day) { halo(760, 760, 300, '#FFE6A8', 70, 4); Ec(760, 790, 70, 70, '#FFF0C4'); }
    F([[-90, 820], [200, 700], [420, 760], [700, 660], [1000, 740], [1170, 700], [1170, 1000], [-90, 1000]], day ? '#D9B96A' : '#C98A5A', { ink: I, sw: .7, curv: .4 });
    F([[-90, 900], [300, 840], [600, 880], [900, 820], [1170, 860], [1170, 1050], [-90, 1050]], day ? '#C9A050' : '#A86E4E', { curv: .4 });
    for (let k = 0; k < 5; k++) treeClump(80 + k * 230, 900 - hash(k) * 40, 30 + hash(k * 3) * 20, ['#4E6E4E', '#5E7E52'], t, k);
    // court
    F([[-90, 1000], [W + 90, 1000], [W + 90, H + 90], [-90, H + 90]], '#5E7A78', { ink: I, sw: .9 }); TX(rectPts(-90, 1000, W + 180, 1000), '#4E6A6A', 100);
    ln([[-60, 1260], [W + 60, 1260]], 1, '#F4ECDD', 'ink', 0); F(ellPts(540, 1260, 300, 90, 28), '#000', { op: 0, ink: '#F4ECDD', sw: 1 }); ln([[380, 1000], [200, H + 40]], 1, '#F4ECDD', 'ink', 0); ln([[700, 1000], [880, H + 40]], 1, '#F4ECDD', 'ink', 0);
    // chain-link fence
    const fy0 = 640, fy1 = 1030;
    for (let k = 0; k < 6; k++) ln([[k * 220, fy0], [k * 220, fy1]], 1.6, '#8E929E', 'ink', 0); ln([[-60, fy0], [W + 60, fy0]], 1.4, '#8E929E', 'ink', 0);
    for (let k = -8; k < 22; k++) { ln([[k * 60, fy0], [k * 60 + 390, fy1]], .3, '#9EA2AE', 'ink', 0); ln([[k * 60 + 390, fy0], [k * 60, fy1]], .3, '#9EA2AE', 'ink', 0); }
    // hoop
    const hx = 540, hy = 780; ln([[hx, 1100], [hx, hy - 60]], 3.4, '#3A3A48', 'ink', 0); Rc(hx - 120, hy - 200, 240, 150, '#FFFFFF', { ink: I, sw: 1, op: 230 }); Ec(hx, hy - 40, 60, 12, '#000', { op: 0, ink: '#E8742E', sw: 2.2 }); for (let k = 0; k < 6; k++) ln([[hx - 56 + k * 22, hy - 34], [hx - 34 + k * 14, hy + 40]], .4, '#FFFFFF', 'ink', .3);
    // bikes against the fence + bench with a paper bag
    [[120, 1010], [300, 1020]].forEach(([bx, by], i) => { Ec(bx - 60, by - 40, 46, 46, '#000', { op: 0, ink: I, sw: 1.2 }); Ec(bx + 60, by - 40, 46, 46, '#000', { op: 0, ink: I, sw: 1.2 }); ln([[bx - 60, by - 40], [bx - 10, by - 110], [bx + 50, by - 110], [bx + 60, by - 40], [bx, by - 40], [bx - 10, by - 110]], 1.2, ['#E14C5A', '#3E6FA8'][i], 'ink', 0); });
    Rc(760, 1000, 260, 26, '#9A6E48', { ink: I, sw: .8 }); ln([[780, 1026], [780, 1080]], 1.2, '#6E4A30', 'ink', 0); ln([[1000, 1026], [1000, 1080]], 1.2, '#6E4A30', 'ink', 0);
    takeoutBag(880, 1000, .45, { receipt: false });
    setEnd();
    return { hoop: [hx, hy - 40], floor: 1300 };
  }

  // ---------- FOOTBALL FIELD ----------
  // o.mode 'night' (Friday lights: light towers, aluminium bleachers, a phone filming with a red dot, red track, scoreboard) |
  //   'paper' (a field inked on notebook paper: end zone lettered o.endzone ('GOAL'), a big hot yard line at o.marker yards
  //   (default 5); o.zoom (end zone shows a tiny video call)). RETURNS {yardY(yd) → screen y of that yard line (0 = goal line), goalY, midX}
  function footballFieldSet(t, o = {}) {
    setBegin(31, t, o);
    if (o.mode === 'paper') {
      F(rectPts(-80, -80, W + 160, H + 160), '#FBF8EE'); for (let k = 0; k < 40; k++) ln([[-60, 120 + k * 48], [W + 60, 120 + k * 48]], .35, '#9CC8E8', 'ink', 0); ln([[110, -60], [110, H + 60]], .6, '#E46F8C', 'ink', 0);
      for (let k = 0; k < 4; k++) Ec(50, 300 + k * 460, 18, 18, '#E9E4D6', { ink: '#C9C2B0', sw: .6 });
      const gx0 = 180, gx1 = 1000, gTop = 180, goal = 560, ydPx = 100;
      F([[gx0, gTop], [gx1, gTop], [gx1, H - 120], [gx0, H - 120]], '#86AE7A', { op: 170, ink: '#2E6A3E', sw: 1.4 });
      F([[gx0, gTop], [gx1, gTop], [gx1, goal], [gx0, goal]], PAL.hot, { op: 235 });
      scribble(o.endzone || 'GOAL', 590, (gTop + goal) / 2, 150, '#FFFFFF', { sw: 8, track: .25 });
      if (o.zoom) { RRc(830, gTop + 30, 140, 100, 8, '#1E1E26', { ink: I, sw: .8 }); zoomGrid(838, gTop + 38, 124, 84, t, { n: 2 }); }
      ln([[gx0, goal], [gx1, goal]], 2.6, '#FFFFFF', 'marker', 0);
      for (let yd = 1; yd <= 12; yd++) { const y = goal + yd * ydPx; ln([[gx0, y], [gx1, y]], yd % 5 === 0 ? 1.6 : .5, '#2E6A3E', yd % 5 === 0 ? 'marker' : 'ink', 0); for (const hx of [400, 780]) ln([[hx - 14, y], [hx + 14, y]], .6, '#2E6A3E', 'ink', 0); if (yd === 5 || yd === 10) { scribble(String(yd), gx0 + 70, y, 60, '#2E6A3E', { sw: 2.6 }); scribble(String(yd), gx1 - 70, y, 60, '#2E6A3E', { sw: 2.6 }); } }
      const mk = Math.max(1, Math.min(12, Math.round(N(o.marker, 5)))), y2 = goal + mk * ydPx; halo(gx1 - 60, y2, 140, PAL.hot, 30, 2); scribble(String(mk), gx1 - 80, y2, mk > 9 ? 110 : 150, PAL.hot, { sw: 7 });
      ln([[gx0 + 40, y2], [gx1 - 160, y2]], 2.2, PAL.hot, 'marker', 0);
      setEnd(); return { yardY: yd => goal + yd * ydPx, goalY: goal, midX: 590 };
    }
    skyBands(-40, 900, ['#0F1236', '#1A1E50', '#262A60'], 5, 4, 9); stars(14, 40, 300, t, 41);
    [[120, 160], [960, 160]].forEach(([lx, ly]) => { ln([[lx, ly + 40], [lx, 760]], 2.4, '#4A4870', 'ink', 0); halo(lx, ly, 300, '#FFF0C0', 90, 4); Rc(lx - 80, ly - 40, 160, 80, '#3A3860', { ink: I, sw: .8 }); for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) Ec(lx - 60 + c * 40, ly - 20 + r * 40, 14, 14, '#FFFBE6', { n: 10 }); });
    // scoreboard (generic)
    if (o.calm !== 'top') { RRc(380, 280, 320, 170, 10, '#1E1E26', { ink: I, sw: 1 }); scribble('HOME', 460, 320, 26, '#F7D774', { sw: .7 }); scribble('AWAY', 620, 320, 26, '#F7D774', { sw: .7 }); scribble('--', 460, 390, 50, '#FF5A4A', { sw: 1.6 }); scribble('--', 620, 390, 50, '#FF5A4A', { sw: 1.6 }); }
    // far bleachers + crowd
    F([[-90, 640], [W + 90, 640], [W + 90, 800], [-90, 800]], '#6E7088', { ink: I, sw: .7 }); for (let r = 0; r < 4; r++) ln([[-60, 660 + r * 36], [W + 60, 660 + r * 36]], .4, '#9EA2B8', 'ink', 0);
    for (let i = 0; i < 26; i++) Ec(20 + i * 41 + hash(i) * 12, 670 + (i % 4) * 34, 9, 11, ['#E46F8C', '#F7D774', '#9CC8E8', '#FFFFFF', '#E14C5A'][i % 5], { n: 8, op: 220 });
    // red track + turf with yard lines in perspective
    F([[-90, 800], [W + 90, 800], [W + 90, 880], [-90, 880]], '#B8473A', { ink: I, sw: .7 });
    F([[-90, 880], [W + 90, 880], [W + 90, H + 90], [-90, H + 90]], '#5E9A5A', { ink: I, sw: .9 }); TX(rectPts(-90, 880, W + 180, 1100), '#4E8A4E', 90);
    for (let k = -6; k <= 6; k++) ln([[540 + k * 120, 880], [540 + k * 420, H + 40]], k % 5 === 0 ? 1.1 : .6, '#EAF4E0', 'ink', 0);
    for (let k = 0; k < 6; k++) { const y = 880 + Math.pow(k / 6, 1.5) * 1100; ln([[-60, y], [W + 60, y]], .3, '#4E8A4E', 'ink', 0); }
    // near bleachers foreground + phone filming
    F([[-90, 1640], [W + 90, 1600], [W + 90, H + 90], [-90, H + 90]], '#B8BCC8', { ink: I, sw: 1 }); for (let r = 0; r < 3; r++) ln([[-60, 1680 + r * 70], [W + 60, 1650 + r * 70]], .8, '#8E929E', 'ink', 0);
    if (N(o.filming, true)) { const p = phone(800, 1480, .8, { screen: 'glow', rot: .08, halo: false, t }); Ec(p.x + p.w / 2, p.y + p.h - 40, 16, 16, '#FF3B30', { op: 180 + 75 * Math.sin(t * 6) }); }
    setEnd();
    return { yardY: yd => 880 + yd * 40, goalY: 880, midX: 540 };
  }

  // ---------- CLINIC: generic medical lobby, NO real logo; a waiting line along the wall ----------
  // o.line (people waiting ahead, default 4), o.sign (wayfinding text, default 'CLINIC'), o.ticket (kiosk number, default 'A12'). RETURNS {lineX(i) → [x,y] spot i in the line (0 = front), floor}
  function clinicSet(t, o = {}) {
    setBegin(32, t, o);
    const fy = 1300;
    wallFloor('#EEF2F2', '#C9D3D6', fy, { floor: 'tile', base: '#3E9C97' });
    // fluorescent ceiling
    F(rectPts(-80, -80, W + 160, 200), '#E4E8EA'); for (let k = 0; k < 4; k++) { const fl = hash(Math.floor(t * 9) + k) > .97 ? .5 : 1; Rc(60 + k * 260, 80, 200, 50, '#F8FFFF', { ink: I, sw: .6, op: 255 * fl }); halo(160 + k * 260, 110, 160, '#E8FFFF', 30 * fl, 2); }
    // wayfinding sign (blue/white, generic)
    if (o.calm !== 'top') { RRc(120, 280, 560, 150, 14, '#2E6FB8', { ink: I, sw: 1 }); scribble(o.sign || 'CLINIC', 360, 355, 56, '#FFFFFF', { sw: 1.4 }); F([[590, 320], [650, 355], [590, 390]], '#FFFFFF'); }
    Rc(-80, 560, W + 160, 20, '#3E9C97');
    // take-a-number kiosk + hand sanitizer
    RRc(820, 760, 150, fy - 760 + 30, 20, '#FFFFFF', { ink: I, sw: 1 }); Rc(840, 790, 110, 80, '#1E4A6A', { ink: I, sw: .6 }); scribble(String(o.ticket ?? 'A12'), 895, 830, 32, '#7CFFB0', { sw: 1 }); Rc(860, 900, 70, 10, '#2A2230');
    ln([[720, fy + 40], [720, 1000]], 1.6, '#C9CCD6', 'ink', 0); RRc(696, 940, 48, 70, 10, '#FFFFFF', { ink: I, sw: .7 }); Rc(706, 925, 28, 16, '#9CC8E8');
    // line stanchions with a belt
    for (let k = 0; k < 5; k++) { const x = 60 + k * 170; ln([[x, fy + 230], [x, fy + 80]], 1.6, '#8E929E', 'ink', 0); Ec(x, fy + 76, 12, 10, '#C9CCD6', { n: 8 }); if (k) ln([[x - 170, fy + 90], [x - 85, fy + 104], [x, fy + 90]], 1.4, '#2E6FB8', 'ink', .5); }
    // plastic chairs along the back wall
    for (let k = 0; k < 4; k++) { const x = 90 + k * 150; RRc(x - 56, 960, 112, 140, 20, ['#3E9C97', '#9CC8E8'][k % 2], { ink: I, sw: .8 }); Rc(x - 60, 1100, 120, 24, shade(['#3E9C97', '#9CC8E8'][k % 2], -.15), { ink: I, sw: .6 }); ln([[x - 50, 1124], [x - 50, fy]], 1, '#6E727E', 'ink', 0); ln([[x + 50, 1124], [x + 50, fy]], 1, '#6E727E', 'ink', 0); }
    // people in the line ahead (tiny blobs, backs)
    const nl = N(o.line, 4); for (let i = 0; i < nl; i++) { const x = 160 + i * 150, y = fy + 120; blobPerson(x, y - 60, 3.2, ['#7E62AE', '#E9AE3C', '#5A6A8A', '#E46F8C'][i % 4], SKINS[(i + 1) % 6], t, i); F([[x - 60, y + 40], [x + 60, y + 40], [x + 50, y + 220], [x - 50, y + 220]], ['#3A3A48', '#5A4A3A'][i % 2], { curv: .2 }); }
    setEnd();
    return { lineX: i => [160 + i * 150, fy + 320], floor: fy + 320 };
  }

  // ---------- DORM ROOM ----------
  // o.time 'night' (default; string lights are the main light) | 'day'. o.paper (a form on the desk; pass an object to forward
  //   leasePaper options), o.lights (true), o.bed (quilt colour).
  // Quilted bed (front-left), round rug, closet, desk + mesh chair, mini fridge, pennant (o.pennant, default 'GO!'), sneakers.
  // RETURNS {bedL:[x,y] bed sit point, rug:[x,y] (floor spot, centre), desk:[x,y], window:{x,y,w,h}}
  function dormSet(t, o = {}) {
    setBegin(33, t, o);
    const night = o.time !== 'day', fy = 1240;
    wallFloor(night ? '#33407E' : '#E8E6E0', night ? '#5A5A6E' : '#9E9890', fy, { floor: 'vinyl', base: night ? '#4A5490' : '#FFFFFF' });
    // window: a view over rooftops
    const wx = 330, wy = o.calm === 'top' ? 560 : 260, ww = 420, wh = 440;
    windowBox(wx, wy, ww, wh, (x, y, w, h) => {
      skyBands(y, y + h * .7, night ? ['#0F1236', '#1E2250', '#3E3A7E', '#6E4E8E'] : ['#9CC8E8', '#C9E2EE', '#E6F1F2'], 5, 3, 3, x, x + w);
      if (night) stars(5, y + 10, y + h * .3, t, 51, '#FFF6DA', x + 10, x + w - 10);
      for (let i = 0; i < 9; i++) { const bw = 40 + hash(i * 3) * 50, bh = 30 + hash(i * 5) * 120, bx = x + i * 48 - 10; Rc(bx, y + h - bh, bw, bh, night ? '#141638' : ['#C9BFA8', '#B8B0A0', '#D9CFB8'][i % 3], { ink: I, sw: .3 }); if (night) for (let r = 0; r < 2; r++) if (hash(i * 7 + r) > .4) Rc(bx + 8, y + h - bh + 10 + r * 26, 8, 8, '#FFD98E', { op: 220 }); }
      Rc(x + w * .62, y + h * .35, 80, h * .65, night ? '#20224A' : '#A8A090', { ink: I, sw: .4 }); // a neighbouring tower
    }, { frame: night ? '#5A6098' : '#FFFFFF', bars: false, blinds: .08 });
    // sliding closet (left)
    Rc(-60, 380, 300, fy - 380, '#FFFFFF', { ink: I, sw: 1 }); Rc(-40, 400, 130, fy - 420, night ? '#5A6AA8' : '#CFE3F0', { ink: I, sw: .6 }); Rc(100, 400, 130, fy - 420, night ? '#4A5A98' : '#BFD6E6', { ink: I, sw: .6 }); F([[-30, 420], [20, 420], [-30, 600]], '#FFFFFF', { op: 70 }); F([[110, 450], [170, 450], [110, 640]], '#FFFFFF', { op: 70 });
    // pennant + paper stack + desk + silver mesh chair (right)
    if (o.calm !== 'top') { F([[820, 330], [1040, 380], [820, 430]], '#3E9C97', { ink: I, sw: .8 }); scribble(o.pennant || 'GO!', 890, 380, 40, '#FFF6E6', { sw: 1.1 }); }
    const dx0 = 790, dx1 = 1070, dy = 1000;
    Rc(dx0, dy, dx1 - dx0, 24, '#E9E2D2', { ink: I, sw: .9 }); Rc(dx0 + 10, dy + 24, 14, fy - dy + 20, '#BDB4A4'); Rc(dx1 - 24, dy + 24, 14, fy - dy + 20, '#BDB4A4');
    laptop(900, dy, .42, { glow: night }); for (let k = 0; k < 4; k++) Rc(1000, dy - 10 - k * 8, 60, 8, '#FFFFFF', { ink: I, sw: .3 });
    const pap = o.paper ?? o.lease; if (pap) leasePaper(830, dy - 30, .16, { ...(typeof pap === 'object' ? pap : {}), rot: -.3 });
    F([[850, dy + 60], [990, dy + 60], [1000, dy + 230], [840, dy + 230]], '#C9CCD6', { ink: I, sw: .8 }); for (let k = 0; k < 6; k++) ln([[860, dy + 80 + k * 26], [990, dy + 80 + k * 26]], .3, '#8E929E', 'ink', 0); ln([[920, dy + 230], [920, fy + 120]], 2, '#8E929E', 'ink', 0); ln([[850, fy + 140], [920, fy + 120], [990, fy + 140]], 1.2, '#8E929E', 'ink', .2);
    // mini fridge
    RRc(640, fy - 190, 130, 210, 12, '#F6F6F4', { ink: I, sw: .9 }); ln([[650, fy - 120], [760, fy - 120]], .5, I, 'ink', 0);
    // quilted bed, left-front
    const by = 1430, bq = o.bed || '#E9AE3C';
    F([[-90, by - 120], [520, by - 120], [560, by + 80], [-90, by + 80]], bq, { ink: I, sw: 1.1, curv: .15 }); for (let k = 0; k < 6; k++) for (let r = 0; r < 2; r++) ln([[k * 100 - 40, by - 100 + r * 90], [k * 100 + 10, by - 60 + r * 90], [k * 100 + 60, by - 100 + r * 90]], .4, shade(bq, -.25), 'ink', .3);
    RRc(-20, by - 170, 220, 70, 30, '#F4F4F0', { ink: I, sw: .8 }); F([[-90, by + 80], [560, by + 80], [540, by + 180], [-90, by + 180]], '#4A4A58', { ink: I, sw: .9 });
    // round rug with a border ring
    F(ellPts(640, 1620, 300, 90, 22, 6), '#7E62AE', { ink: I, sw: .6 }); F(ellPts(640, 1620, 230, 64, 22, 6), shade('#7E62AE', .15));
    // sneakers lined by the wall
    for (let k = 0; k < 3; k++) { F([[600 + k * 70, fy + 30], [650 + k * 70, fy + 30], [660 + k * 70, fy + 12], [610 + k * 70, fy + 6]], ['#FFFFFF', '#2A2230', '#E46F8C'][k], { ink: I, sw: .5 }); }
    // string lights (hero)
    if (N(o.lights, true)) { stringLights(-30, 210, W + 30, 250, t, { sag: 120, n: 16, cols: ['#FFE3A0', '#FFF1C8', '#FFD98E'] }); if (night) halo(540, 300, 600, '#FFD98E', 22, 3); }
    setEnd();
    return { bedL: [260, by - 100], rug: [640, 1620], desk: [900, dy], window: { x: wx, y: wy, w: ww, h: wh } };
  }

  // ---------- SHARED APARTMENT (friends' place) ----------
  // o.time 'night'|'day'. o.shake 0..1 (jitters the room), o.hoop (door mini-hoop, true), o.cake (birthday cake
  // on the bar), o.card (birthday card on the counter). RETURNS {couch:[x,y] sit point, bar:[x,y] top, door:[x,y] floor, floor}
  function apartmentSet(t, o = {}) {
    setBegin(34, t, o);
    const night = o.time === 'night', fy = 1180, sh = N(o.shake, 0);
    push(); if (sh) translate(Math.sin(t * 61) * 14 * sh, Math.sin(t * 47) * 8 * sh);
    wallFloor(night ? '#D8D6E4' : '#F4F3EF', '#9E9890', fy, { floor: 'vinyl', base: '#FFFFFF' });
    // ceiling fan with light
    if (o.calm !== 'top') { ln([[540, -10], [540, 110]], 1, '#6E727E', 'ink', 0); const fa = t * 6 * (night ? 1 : .6); for (let k = 0; k < 4; k++) { const a = fa + k * TAU / 4; F([[540, 120], [540 + Math.cos(a) * 260, 120 + Math.sin(a) * 30], [540 + Math.cos(a + .25) * 250, 120 + Math.sin(a + .25) * 30]], '#E4E0D8', { ink: I, sw: .6 }); } Ec(540, 140, 50, 26, '#FFF6D8', { ink: I, sw: .7 }); if (night) halo(540, 150, 300, '#FFF0C0', 50, 3); }
    // group-photo banner + white door with the mini hoop + paper sign
    if (o.calm !== 'top') { Rc(80, 300, 380, 200, '#FFFFFF', { ink: I, sw: .9 }); for (let i = 0; i < 9; i++) { const x = 110 + i * 38, y = 420 - (i % 2) * 20; Ec(x, y, 14, 16, SKINS[i % 6], { n: 10 }); F([[x - 18, 490], [x - 16, y + 20], [x + 16, y + 20], [x + 18, 490]], ['#33407E', '#2A2230', '#F7D774', '#E46F8C'][i % 4]); } Rc(100, 320, 340, 50, '#F7D774', { op: 200 }); }
    const dx = 820;
    Rc(dx - 120, 480, 240, fy - 480, '#F8F8F6', { ink: I, sw: 1 }); Ec(dx + 90, 860, 9, 9, '#3A3A48', { n: 8 });
    if (N(o.hoop, true)) { Rc(dx - 90, 500, 180, 110, '#FFFFFF', { ink: I, sw: .9 }); Ec(dx, 620, 60, 12, '#000', { op: 0, ink: '#E8742E', sw: 2 }); for (let k = 0; k < 6; k++) ln([[dx - 54 + k * 22, 626], [dx - 30 + k * 12, 700]], .35, '#C9CCD6', 'ink', .3); F([[dx - 90, 720], [dx + 90, 716], [dx + 92, 830], [dx - 86, 836]], '#FFFFFF', { ink: '#C9C2B0', sw: .5 }); ln([[dx - 60, 760], [dx + 50, 756]], .5, '#5A5A68', 'pen', .4); ln([[dx - 40, 790], [dx + 30, 792]], .5, '#5A5A68', 'pen', .4); }
    // kitchen bar (right) w/ microwave, blender, paper towels, bar stools (o.stools, default 2)
    const bx0 = 560, by = 1020;
    Rc(bx0 + 340, 640, 200, 140, '#2A2A30', { ink: I, sw: .8 }); Rc(bx0 + 360, 660, 120, 100, '#4A4A58');
    granite([[bx0, by], [W + 90, by], [W + 90, by + 36], [bx0, by + 36]], '#E8E6E0', 0, 1, 0, 0, 0, 0);
    F([[bx0, by + 36], [W + 90, by + 36], [W + 90, fy + 120], [bx0, fy + 120]], '#5A5A68', { ink: I, sw: .9 });
    RRc(bx0 + 40, by - 130, 60, 130, 14, '#C9CCD6', { ink: I, sw: .7 }); Rc(bx0 + 30, by - 20, 80, 20, '#2A2A30'); Ec(bx0 + 70, by - 130, 30, 8, '#2A2A30'); // blender
    RRc(bx0 + 140, by - 110, 50, 110, 10, '#FFFFFF', { ink: I, sw: .6 }); ln([[bx0 + 165, by - 120], [bx0 + 165, by]], .5, '#9A9AA0', 'ink', 0); // paper towels
    if (o.cake) birthdayCake(bx0 + 340, by + 4, .45, { t, candles: 1 });
    if (o.card) birthdayCard(bx0 + 220, by - 40, .2, { rot: -.2 });
    const ns = Math.max(0, Math.round(N(o.stools, 2))), stc = o.stoolCol || '#8E929E';
    for (let k = 0; k < ns; k++) { const sx = ns > 1 ? lerp(bx0 + 120, bx0 + 400, k / (ns - 1)) : bx0 + 260; Ec(sx, by + 140, 60, 18, stc, { ink: I, sw: .8 }); ln([[sx - 40, by + 150], [sx - 46, fy + 180]], 1.2, stc, 'ink', 0); ln([[sx + 40, by + 150], [sx + 46, fy + 180]], 1.2, stc, 'ink', 0); }
    // charcoal sectional (foreground left) + blue bean bag + big plush bear + card table
    F([[-90, 1300], [520, 1300], [540, 1500], [-90, 1500]], '#3A3A44', { ink: I, sw: 1.1, curv: .15 }); RRc(-90, 1180, 620, 150, 40, '#44444E', { ink: I, sw: 1 }); for (let k = 0; k < 3; k++) RRc(-60 + k * 190, 1330, 180, 70, 20, '#4A4A56', { ink: I, sw: .6 });
    Ec(92, 1080, 24, 24, '#C98E58', { n: 10 }); Ec(188, 1080, 24, 24, '#C98E58', { n: 10 }); Ec(92, 1080, 11, 11, '#E8C49A', { n: 8 }); Ec(188, 1080, 11, 11, '#E8C49A', { n: 8 }); F(ellPts(140, 1150, 70, 76, 16), '#C98E58', { ink: I, sw: 1 }); Ec(140, 1172, 30, 22, '#E8C49A', { n: 10 }); Ec(117, 1135, 6, 7, I, { n: 6 }); Ec(163, 1135, 6, 7, I, { n: 6 }); Ec(140, 1162, 7, 5, I, { n: 6 }); // big plush bear (generic)
    F(ellPts(880, 1560, 160, 120, 20, 8), '#2E6FB8', { ink: I, sw: 1 }); F(ellPts(840, 1510, 70, 30, 12), '#5A8FD0', { op: 160 });
    Ec(400, 1700, 250, 70, '#2E6A4A', { ink: I, sw: 1.1 }); Ec(400, 1700, 220, 56, '#3E8A5E'); for (let k = 0; k < 6; k++) { Ec(300 + k * 40, 1690 + (k % 2) * 16, 14, 6, ['#E14C5A', '#FFFFFF', '#2A2230'][k % 3], { ink: I, sw: .3, n: 10 }); } F(xform(rectPts(-24, -16, 48, 32), 480, 1700, 1, .3), '#FFFFFF', { ink: I, sw: .4 });
    pop();
    setEnd();
    return { couch: [240, 1310], bar: [bx0 + 260, by], door: [dx, fy + 40], floor: fy };
  }

  // ---------- VIDEO CALL — a study lounge at night ----------
  // o.call 0..1 (laptop call on; 0 = laptops dark-ish), o.shake (room jitter), o.partners (call tiles, default 2). Two laptops on a long
  // table (the second shows o.notes text), notes, glass wall to a dark street. RETURNS {screen:{x,y,w,h}, seatL:[x,y], seatR:[x,y], table:y}
  function videoCallSet(t, o = {}) {
    setBegin(35, t, o);
    const sh = N(o.shake, 0); push(); if (sh) translate(Math.sin(t * 61) * 14 * sh, Math.sin(t * 47) * 8 * sh);
    F(rectPts(-80, -80, W + 160, H + 160), '#2A2E50');
    // glass wall: dark street, lamps, a passing car's lights
    Rc(-60, 140, W + 120, 860, '#151838', { ink: I, sw: 1 }); skyBands(140, 600, ['#0F1236', '#1A1E50', '#262A60'], 4, 3, 2, -60, W + 60);
    for (let i = 0; i < 6; i++) { const bw = 140 + hash(i) * 60, bh = 200 + hash(i * 3) * 260, bx = i * 190 - 30; Rc(bx, 1000 - bh - 100, bw, bh, '#1E2048', { ink: I, sw: .4 }); for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) if (hash(i * 31 + r * 7 + c) > .55) Rc(bx + 16 + c * 40, 1000 - bh - 80 + r * 46, 20, 24, '#FFD98E', { op: 200 }); }
    [[200], [760]].forEach(([lx]) => { ln([[lx, 1000], [lx, 640]], 1.4, '#4A4870', 'ink', 0); halo(lx, 640, 140, '#FFE3A0', 60, 3); });
    const cx = frac(t * .12) * 1500 - 200; halo(cx, 920, 60, '#FFF0C0', 70, 2);
    for (let k = 0; k < 5; k++) Rc(k * 260 - 40, 140, 12, 860, '#3A3E68');
    // long table + chairs
    const ty = 1300;
    F([[-90, 1000], [W + 90, 1000], [W + 90, H + 90], [-90, H + 90]], '#3A3660'); TX(rectPts(-90, 1000, W + 180, 1000), '#4A4670', 80);
    F([[-40, ty], [1120, ty], [1120, ty + 40], [-40, ty + 40]], '#C9A26E', { ink: I, sw: 1.1 }); ln([[60, ty + 40], [60, ty + 340]], 2, '#6E4A30', 'ink', 0); ln([[1020, ty + 40], [1020, ty + 340]], 2, '#6E4A30', 'ink', 0);
    const call = N(o.call, 1);
    const scr = laptop(330, ty, .95, { glow: call > .3 });
    if (call > .3) zoomGrid(scr.x, scr.y, scr.w, scr.h, t, { n: N(o.partners, 2) + 2, me: 2 }); else Rc(scr.x, scr.y, scr.w, scr.h, '#1E2030', { op: 220 });
    laptop(810, ty, .7, { glow: true, screen: o.notes || 'NOTES' });
    for (let k = 0; k < 3; k++) F(xform(rectPts(-60, -40, 120, 80), 560 + k * 30, ty - 20, 1, -.2 + k * .15), '#FFF6E6', { ink: I, sw: .5 });
    pop();
    setEnd();
    return { screen: scr, seatL: [330, ty + 300], seatR: [810, ty + 300], table: ty };
  }

  // ---------- OCEAN BALCONY — a balcony over the sea ----------
  // o.time 'night' (moon path, shore lights) | 'sunset' (pink coral sky) | 'day' (deep blue, a cloud, shade tree, beach).
  // o.headland (land on the horizon, default false). RETURNS {rail:y (rail top), sea:y}
  function oceanBalconySet(t, o = {}) {
    setBegin(36, t, o);
    const tm = o.time || 'night', night = tm === 'night', sun = tm === 'sunset', hz = 760;
    skyBands(-40, hz + 20, night ? ['#0B0F30', '#141A44', '#1E2456', '#2A2E64'] : sun ? ['#5A4A9E', '#B474A0', '#FF8FB0', '#F6A87A', '#F9D58A'] : ['#2E7AC8', '#5A9AD8', '#9CC8E8', '#CFE6F2'], 8, 6, 2);
    if (night) { stars(40, 30, 560, t, 61); const mx = 760, my = 240; halo(mx, my, 200, '#FFF0D0', 70, 4); Ec(mx, my, 54, 54, '#FFF4DC'); }
    if (sun) { halo(540, hz, 420, '#FFE6A8', 90, 5); Ec(540, hz, 110, 110, '#FFF0C4'); }
    // optional land on the horizon (right) + a cloud
    if (o.headland) F([[520, hz + 20], [680, hz - 20], [860, hz - 46], [1170, hz - 58], [1170, hz + 20]], night ? '#141838' : sun ? '#7E4E8E' : '#4A6A8A', { curv: .4 });
    if (!night) cloudPuff(900, hz - 80, 420, sun ? '#F9C3B0' : '#FFFFFF', 220);
    // sea
    F([[-90, hz + 10], [W + 90, hz + 10], [W + 90, 1330], [-90, 1330]], night ? '#141E4A' : sun ? '#C86E9A' : '#1E5AA8');
    for (let k = 0; k < 14; k++) { const y = hz + 30 + Math.pow(k / 14, 1.4) * 520, ph = t * .8 + k; ln([[-60, y], [300 + Math.sin(ph) * 40, y + 4], [700, y - 2], [W + 60, y + 3]], .4, night ? '#2A3A7A' : sun ? '#F3A7B5' : '#5A9AD8', 'ink', .5); }
    if (night || sun) for (let k = 0; k < 16; k++) { const y = hz + 30 + k * 32, w2 = 20 + k * 8 + Math.sin(t * 2 + k) * 10; Rc((night ? 760 : 540) - w2 / 2 + Math.sin(t * 1.3 + k * 2) * 12, y, w2, 6, night ? '#FFF0C0' : '#FFE6A8', { op: 120 + 80 * tw(k, t, 1.2) }); }
    if (!night) for (let k = 0; k < 6; k++) { const x = 100 + k * 170 + Math.sin(t + k) * 20; ln([[x, 1250 + k * 8], [x + 80, 1246 + k * 8]], .8, '#FFFFFF', 'ink', .3); } // surf
    // beach + a low building + shore lights
    F([[-90, 1300], [400, 1270], [700, 1310], [W + 90, 1290], [W + 90, 1520], [-90, 1520]], night ? '#3A3460' : '#E9C690', { curv: .3 });
    F([[560, 1330], [W + 90, 1310], [W + 90, 1520], [560, 1520]], night ? '#2A2850' : '#D9C29A', { ink: I, sw: .7 }); for (let k = 0; k < 4; k++) F([[590 + k * 120, 1336], [680 + k * 120, 1332], [690 + k * 120, 1370], [600 + k * 120, 1374]], '#2E4A7A', { ink: I, sw: .4 });
    if (night) for (let k = 0; k < 7; k++) { Rc(590 + k * 66, 1420, 22, 26, '#FFD98E', { op: 230 }); halo(600 + k * 66, 1430, 40, '#FFD98E', 30, 2); }
    // a broad shade tree: short trunk, wide canopy
    const tc = night ? '#2A2030' : '#5A3E2E';
    ln([[260, 1520], [250, 1390]], 5, tc, 'ink', .3); ln([[250, 1410], [120, 1340]], 2.6, tc, 'ink', .3); ln([[250, 1400], [400, 1340]], 2.6, tc, 'ink', .3);
    F([[-60, 1350], [10, 1270], [170, 1220], [360, 1225], [520, 1270], [560, 1340], [400, 1360], [100, 1370]], night ? '#16262A' : '#4E8A4E', { ink: I, sw: .8, curv: .5 });
    if (!night) F([[40, 1280], [170, 1240], [340, 1245], [460, 1280], [300, 1270], [120, 1290]], '#6EA872', { op: 200, curv: .5 });
    // balcony: white rail + glass, and the balcony floor
    const ry = 1540;
    F(rectPts(-90, ry - 140, W + 180, 140), '#BFE0F4', { op: 45 });
    Rc(-90, ry - 160, W + 180, 30, '#FFFFFF', { ink: I, sw: 1.1 }); for (let k = 0; k < 9; k++) Rc(-40 + k * 140, ry - 130, 14, 140, '#FFFFFF', { ink: I, sw: .5 });
    F([[-90, ry], [W + 90, ry], [W + 90, H + 90], [-90, H + 90]], night ? '#3A3A5A' : '#D9D6CC', { ink: I, sw: 1 });
    for (let k = 0; k < 5; k++) ln([[-60, ry + 40 + k * 80], [W + 60, ry + 40 + k * 80]], .3, night ? '#4A4A6A' : '#C2BFB4', 'ink', 0);
    setEnd();
    return { rail: ry - 160, sea: hz + 10 };
  }

  // ---------- SMALL OFFICE ----------
  // o.view 'desk' (default: blond-wood slat wall, cobalt accent panel (o.sign optional vertical text), desk w/ monitor (o.monitor) + laptop
  //   terminal, window to a city street with a passing bus — o.bus 0..1 position (o.tram alias), o.time 'day'|'night') | 'stage' (a visual pun: a literal theatre stage inside the office,
  //   "STAGING" footlight sign, a shut "PROD" door; o.prod 0..1 opens the door with light). RETURNS {desk:[x,y], chair:[x,y], stage:[x,y], door:[x,y]}
  function officeSet(t, o = {}) {
    setBegin(37, t, o);
    const night = o.time === 'night', fy = 1250;
    wallFloor('#F6F4EE', '#B9A07E', fy, { floor: 'wood', base: '#E8E2D4' });
    // slat wall (left 2/3)
    Rc(-60, 0, 700, fy, '#E9CFA0'); for (let k = 0; k < 14; k++) { Rc(-50 + k * 52, 0, 34, fy, '#F2DDB4', { ink: shade('#E9CFA0', -.25), sw: .5 }); }
    // cobalt accent panel: abstract cut-out shapes (or o.sign, a short vertical word)
    Rc(420, 60, 150, 820, '#2E7AC8', { ink: I, sw: 1 });
    if (o.sign) { push(); translate(495, 470); rotate(Math.PI / 2); scribble(o.sign, 0, 0, 110, '#FFFFFF', { sw: 3, track: .3 }); pop(); }
    else { Ec(495, 220, 46, 46, '#FFFFFF', { op: 230 }); Rc(455, 330, 80, 230, '#FFFFFF', { op: 200 }); F(starPts(495, 700, 56, .45, 5), '#F7D774', { op: 230 }); }
    if (o.view === 'stage') {
      // stage platform + curtains + footlights + STAGING sign + PROD door
      halo(540, 900, 600, '#FFE3A0', 50, 4);
      F([[-90, 1180], [W + 90, 1180], [W + 90, 1320], [-90, 1320]], '#7A4A2E', { ink: I, sw: 1.1 }); F([[-90, 1140], [W + 90, 1140], [W + 90, 1180], [-90, 1180]], '#9A6A42', { ink: I, sw: .9 });
      [-1, 1].forEach(d => { const ex = d < 0 ? -90 : W + 90, ix = d < 0 ? 160 : 920; F([[ex, -40], [ix, -40], [ix - d * 40 + Math.sin(t) * 6, 600], [ix + d * 20, 1150], [ex, 1150]], '#C8414A', { ink: I, sw: 1, curv: .3 }); for (let k = 1; k < 4; k++) ln([[lerp(ex, ix, k / 4), -30], [lerp(ex, ix, k / 4) + Math.sin(t + k) * 6, 1140]], .5, '#8E2A34', 'ink', .4); });
      F([[-90, -40], [W + 90, -40], [W + 90, 120], [-90, 160]], '#A8323C', { ink: I, sw: 1, curv: .3 });
      for (let k = 0; k < 8; k++) { halo(80 + k * 130, 1170, 60, '#FFE3A0', 50, 2); Ec(80 + k * 130, 1160, 26, 12, '#FFF6D0', { ink: I, sw: .4 }); }
      RRc(220, 1210, 640, 90, 12, '#1E1E26', { ink: '#F7D774', sw: 1 }); scribble('STAGING', 540, 1255, 60, '#F7D774', { br: 'marker', sw: 1.6, track: .3 });
      const dx = 820, dw = 220, dh = 420, dyy = 1140 - dh, pr = clamp(N(o.prod, 0));
      Rc(dx - 14, dyy - 14, dw + 28, dh + 14, '#3A2E2A', { ink: I, sw: 1 });
      if (pr > 0) { halo(dx + dw / 2, dyy + dh / 2, 400 * pr, '#FFF6D0', 120 * pr, 4); Rc(dx, dyy, dw, dh, '#FFFBE8'); }
      F([[dx, dyy], [dx + dw * (1 - pr * .8), dyy + 20 * pr], [dx + dw * (1 - pr * .8), dyy + dh - 20 * pr], [dx, dyy + dh]], PAL.hot, { ink: I, sw: 1.1 });
      if (pr < .3) { scribble('PROD', dx + dw / 2, dyy + 120, 50, '#FFFFFF', { sw: 1.4 }); ln([[dx - 10, dyy + 200], [dx + dw + 10, dyy + 280]], 2, '#8E929E', 'ink', .2); ln([[dx - 10, dyy + 280], [dx + dw + 10, dyy + 200]], 2, '#8E929E', 'ink', .2); RRc(dx + dw / 2 - 30, dyy + 220, 60, 50, 10, '#C9A44A', { ink: I, sw: .8 }); }
      setEnd(); return { desk: [300, 1140], chair: [300, 1140], stage: [380, 1140], door: [dx + dw / 2, 1140] };
    }
    // window (right) onto a city street with a passing bus
    const wx = 690, wy = 200, ww = 360, wh = 640;
    windowBox(wx, wy, ww, wh, (x, y, w, h) => {
      skyBands(y, y + h, night ? ['#141838', '#22265A', '#3A3470'] : ['#BFD6E6', '#DCE8EE', '#EEF2F0'], 4, 3, 5, x, x + w);
      for (let i = 0; i < 4; i++) { const bw = 80 + hash(i) * 30, bx = x + i * 90; Rc(bx, y + 80 + hash(i * 3) * 100, bw, h, night ? '#262A58' : ['#D9C2A0', '#C9B8A8', '#E2D2B8', '#B8A898'][i], { ink: I, sw: .4 }); for (let r = 0; r < 8; r++) Rc(bx + 14, y + 120 + r * 60 + hash(i * 3) * 100, 16, 22, night ? '#FFD98E' : '#8EA8C0', { op: night ? (hash(i * 9 + r) > .4 ? 220 : 0) : 160 }); }
      Rc(x, y + h - 80, w, 80, '#5A5A68'); ln([[x, y + h - 30], [x + w, y + h - 30]], .6, '#C9CCD6', 'ink', 0);
      const cc = N(o.bus ?? o.tram, frac(t * .08)), ccx = lerp(x - 200, x + w + 20, cc);
      RRc(ccx, y + h - 190, 180, 120, 12, PAL.coral, { ink: I, sw: .9 }); Rc(ccx + 10, y + h - 176, 160, 40, '#FFF6E6', { op: 220 }); for (let k = 0; k < 4; k++) ln([[ccx + 10 + k * 40, y + h - 176], [ccx + 10 + k * 40, y + h - 136]], .4, I, 'ink', 0); Rc(ccx - 6, y + h - 200, 192, 14, '#9A2E36'); Ec(ccx + 40, y + h - 70, 14, 14, '#2A2230', { n: 8 }); Ec(ccx + 140, y + h - 70, 14, 14, '#2A2230', { n: 8 });
    }, { frame: '#2A2A30', bars: false });
    // desk + monitor + laptop with terminal
    const dy = 1080;
    F([[-90, dy], [W + 90, dy], [W + 90, dy + 40], [-90, dy + 40]], '#C98E5A', { ink: I, sw: 1 }); TX(rectPts(-90, dy, W + 180, 40), '#B5784A', 100);
    Rc(140, dy + 40, 30, fy - dy, '#2A2A30'); Rc(910, dy + 40, 30, fy - dy, '#2A2A30');
    ln([[330, dy], [330, dy - 70]], 3, '#3A3A48', 'ink', 0); RRc(80, dy - 400, 500, 330, 12, '#1E1E26', { ink: I, sw: 1.1 }); Rc(96, dy - 384, 468, 298, '#FBF8F0');
    scribble(o.monitor || 'DASHBOARD', 330, dy - 340, 30, '#2A2230', { sw: .8 }); ln([[120, dy - 316], [540, dy - 316]], .6, I, 'ink', 0); Rc(130, dy - 296, 180, 120, '#E9E4D6', { ink: I, sw: .4 }); for (let k = 0; k < 7; k++) ln([[330, dy - 290 + k * 26], [540 - hash(k) * 40, dy - 290 + k * 26]], .35, '#9A9AA8', 'ink', 0);
    const lr = laptop(720, dy, .55, { glow: true }); Rc(lr.x, lr.y, lr.w, lr.h, '#14161E'); for (let k = 0; k < 7; k++) ln([[lr.x + 10, lr.y + 14 + k * 18], [lr.x + 10 + 40 + hash(k + Math.floor(t * 3)) * 140, lr.y + 14 + k * 18]], .5, k % 3 ? '#7CFF9C' : '#9CC8E8', 'ink', 0);
    RRc(980, dy - 110, 70, 110, 16, '#FFFFFF', { ink: I, sw: .7, op: 200 }); // iced coffee cup
    // chair
    F([[500, dy + 150], [700, dy + 150], [690, dy + 290], [510, dy + 290]], '#2A2A30', { ink: I, sw: .8 }); ln([[600, dy + 290], [600, fy + 160]], 2, '#2A2A30', 'ink', 0); ln([[520, fy + 180], [600, fy + 160], [680, fy + 180]], 1.2, '#2A2A30', 'ink', .2);
    setEnd();
    return { desk: [600, dy], chair: [600, dy + 200], stage: [380, 1140], door: [930, 1140] };
  }

  // ---------- BRIDGE DRIVE (night or golden hour) ----------
  // o.view 'backseat' (default: car back-seat POV through the side window — suspender cables strobe past, rain on glass, red tail lights,
  //   the city blurred; a phone-glow pool on the seat) | 'wide' (side elevation of a suspension span with light strings + skyline;
  //   place car() on deckY). o.time 'night' (default) | 'golden' (golden hour).
  //   o.speed (1), o.rain (true at night).
  // RETURNS {deckY, window:{x,y,w,h}}
  function bridgeDriveSet(t, o = {}) {
    setBegin(38, t, o);
    const east = o.time === 'golden', sp = N(o.speed, 1);
    const skyC = east ? ['#5A4A9E', '#B474A0', '#F2876A', '#F6B07A', '#F9D58A'] : ['#0B0F30', '#141A44', '#1E2456', '#2A2E64'];
    if (o.view === 'wide') {
      skyBands(-40, 1420, skyC, 9, 6, 3); if (!east) stars(36, 30, 900, t, 71); else { halo(840, 1220, 400, '#FFE6A8', 80, 4); Ec(840, 1240, 90, 90, '#FFF0C4'); }
      push(); translate(0, 230);
      // skyline (lit windows at night, a silhouette at golden hour)
      for (let i = 0; i < 9; i++) { const bw = 50 + hash(i) * 50, bh = 160 + hash(i * 3) * 360, bx = -40 + i * 60; Rc(bx, 1120 - bh, bw, bh, east ? '#7E4E8E' : '#1A1C44', { ink: I, sw: .4 }); if (!east) for (let r = 0; r < 6; r++) if (hash(i * 7 + r) > .5) Rc(bx + 10, 1140 - bh + r * 40, 10, 14, '#FFD98E', { op: 220 }); }
      F([[-90, 1120], [W + 90, 1120], [W + 90, H + 90], [-90, H + 90]], east ? '#B86E8E' : '#101A40');
      for (let k = 0; k < 12; k++) { const y = 1150 + k * 60; ln([[-60, y], [W + 60, y + 4]], .4, east ? '#F3A7B5' : '#2A3A7A', 'ink', .5); }
      // towers + main cable + suspenders + deck
      const deckY = 1000, towers = [300, 900];
      towers.forEach(tx => { Rc(tx - 26, 300, 52, 900, east ? '#E4E0E8' : '#8E92B8', { ink: I, sw: 1 }); Rc(tx - 40, 300, 80, 24, east ? '#F4F0F4' : '#A8ACCE', { ink: I, sw: .7 }); halo(tx, 300, 40, '#FF4A4A', 60, 2); Ec(tx, 296, 7, 7, '#FF4A4A', { n: 8 }); });
      const cab = x => { if (x < towers[0]) return lerp(560, 310, (x + 90) / (towers[0] + 90)); if (x > towers[1]) return lerp(310, 560, (x - towers[1]) / (W + 90 - towers[1])); const u = (x - towers[0]) / (towers[1] - towers[0]); return 310 + Math.sin(u * Math.PI) * 600; };
      const cp = []; for (let k = 0; k <= 30; k++) { const x = -90 + k * (W + 180) / 30; cp.push([x, cab(x)]); } ln(cp, 1.4, east ? '#F4F0F4' : '#B8BCDE', 'ink', .3);
      for (let k = 0; k < 40; k++) { const x = -60 + k * 30; ln([[x, cab(x)], [x, deckY]], .3, east ? '#E4E0E8' : '#6E72A8', 'ink', 0); }
      for (let k = 0; k < 28; k++) { const x = -60 + k * 44, [px, py] = [x, cab(x)], b = tw(k, t, .8); Ec(px, py, 5, 5, '#FFF0C0', { op: 160 + 90 * b, n: 8 }); }
      F([[-90, deckY], [W + 90, deckY], [W + 90, deckY + 50], [-90, deckY + 50]], east ? '#9A8EA8' : '#2A2C50', { ink: I, sw: 1 });
      for (let k = 0; k < 20; k++) { const x = -60 + k * 64; halo(x, deckY - 6, 18, '#FFD98E', 50, 2); }
      for (let k = 0; k < 20; k++) { const x = -60 + k * 64; Rc(x - 3, deckY + 80 + (k % 3) * 30, 6, 60 + (k % 2) * 40, '#FFD98E', { op: 70 }); } // reflections
      pop();
      setEnd(); return { deckY: deckY + 230, window: null };
    }
    // BACKSEAT POV
    F(rectPts(-80, -80, W + 160, H + 160), '#14131F');
    const wx = 60, wy = 200, ww = 960, wh = 1080;
    // view through the window
    skyBands(wy, wy + wh, skyC, 6, 4, 4, wx, wx + ww);
    if (!east) stars(10, wy + 20, wy + 200, t, 81, '#FFF6DA', wx + 20, wx + ww - 20);
    F([[wx, wy + wh * .62], [wx + ww, wy + wh * .58], [wx + ww, wy + wh], [wx, wy + wh]], east ? '#B86E8E' : '#101A40');
    for (let i = 0; i < 10; i++) { const bx = wx + frac(hash(i) - t * .02 * sp) * (ww + 200) - 100, bh = 120 + hash(i * 3) * 220; Rc(bx, wy + wh * .6 - bh, 60, bh, east ? '#8E5A8E' : '#262A5E', { op: 200 }); if (!east) for (let r = 0; r < 4; r++) halo(bx + 30, wy + wh * .6 - bh + 30 + r * 40, 30, '#FFD98E', 45, 2); }
    // suspender cables strobing past + light strings
    for (let k = 0; k < 9; k++) { const x = wx + frac(k / 9 - t * .9 * sp) * (ww + 120) - 60; ln([[x, wy], [x - 60, wy + wh]], 1.4, east ? '#F4F0F4' : '#9EA2C8', 'ink', 0); }
    for (let k = 0; k < 14; k++) { const x = wx + frac(k / 14 - t * .9 * sp) * (ww + 80) - 40, y = wy + 130 + Math.sin((x - wx) / ww * Math.PI) * 60; halo(x, y, 26, '#FFF0C0', 70, 2); Ec(x, y, 6, 6, '#FFF6D8', { n: 8 }); }
    // tail lights ahead (smeared)
    for (let k = 0; k < 3; k++) { const x = wx + ww * (.62 + k * .1), y = wy + wh * .68 + k * 10; halo(x, y, 70, '#FF4A4A', 60, 3); Rc(x - 30, y - 4, 60, 8, '#FF6A6A', { op: 200 }); }
    // rain drops
    if (N(o.rain, !east)) for (let k = 0; k < 26; k++) { const x = wx + hash(k * 3.3) * ww, y = wy + frac(hash(k * 7.1) + t * .15) * wh; Ec(x, y, 6, 8, '#BFD6FF', { op: 110, n: 8 }); ln([[x, y - 30], [x + 2, y - 6]], .4, '#BFD6FF', 'ink', 0); }
    // door frame + window trim + front headrest
    F([[-90, -90], [W + 90, -90], [W + 90, wy], [-90, wy]], '#1E1C2C'); F([[-90, wy + wh], [W + 90, wy + wh], [W + 90, H + 90], [-90, H + 90]], '#22202E');
    RRc(wx - 20, wy - 20, ww + 40, wh + 40, 60, '#000', { op: 0, ink: '#3A3850', sw: 5 });
    F([[-90, wy - 60], [wx - 10, wy - 40], [wx - 10, wy + wh + 40], [-90, wy + wh + 80]], '#26243A', { ink: I, sw: 1 });
    RRc(740, 1240, 300, 300, 60, '#2E2C40', { ink: I, sw: 1 }); // front seat back
    F([[-90, 1560], [W + 90, 1520], [W + 90, H + 90], [-90, H + 90]], '#2A2838', { ink: I, sw: 1, curv: .2 }); for (let k = 0; k < 4; k++) ln([[k * 300, 1540], [k * 300 + 40, H]], .5, '#3A3850', 'ink', 0);
    Rc(-90, 1320, W + 180, 36, '#3A3850', { ink: I, sw: .6 }); // door armrest
    halo(540, 1640, 360, '#BFD6FF', 28, 3);
    setEnd();
    return { deckY: null, window: { x: wx, y: wy, w: ww, h: wh } };
  }

  // ---------- FEATURE WALL: a bright painted wall with an abstract mark (no letters, no real lock-up), a photo backdrop ----------
  // o.col (wall colour, default teal). RETURNS {wall:{x,y,w,h}, floor}
  function featureWallSet(t, o = {}) {
    setBegin(39, t, o);
    const fy = 1480, col = o.col || '#3E9C97';
    wallFloor('#F4F2EE', '#9E9A94', fy, { floor: 'vinyl', base: '#FFFFFF' });
    const x = 360, y = o.calm === 'top' ? 760 : 420, w = 760, h = 640;
    F(rectPts(x, y, w, h), col, { ink: I, sw: 1.1 }); TX(rectPts(x, y, w, h), shade(col, -.12), 70);
    Ec(x + 180, y + h / 2, 100, 100, '#FFFFFF', { ink: I, sw: .7 }); Ec(x + 180, y + h / 2, 46, 46, col);
    for (let k = 0; k < 3; k++) Rc(x + 320, y + h / 2 - 40 + k * 30, 300 - k * 60, 14, '#FFFFFF', { op: 230 });
    setEnd();
    return { wall: { x, y, w, h }, floor: fy };
  }

  // ---------- HACKER HOUSE: a living room turned office ----------
  // o.time 'day' (overcast) | 'night'. Wooden dining table as a desk (laptop + external monitor), a wheeled whiteboard of flows (o.board), mesh
  // chairs, dumbbells, red cups, sliding glass door with sheer curtains, string lights in the window, a violet LED strip.
  // RETURNS {desk:[x,y] laptop spot, chair:[x,y], board:{x,y,w,h}, screen:{x,y,w,h}}
  function hackerHouseSet(t, o = {}) {
    setBegin(40, t, o);
    const night = o.time === 'night', fy = 1250;
    wallFloor(night ? '#5A5480' : '#ECEAE4', '#8E7A62', fy, { floor: 'wood', base: '#FFFFFF' });
    halo(540, 40, 700, '#9E6AE8', night ? 60 : 30, 3); Rc(-80, 20, W + 160, 12, '#B98AF0', { op: 200 }); // violet LED strip
    // sliding glass door + sheer curtains + string lights
    const gx = 520, gy = 220, gw = 520, gh = fy - 240;
    Rc(gx - 10, gy - 10, gw + 20, gh + 20, '#2A2A30', { ink: I, sw: 1 }); skyBands(gy, gy + gh, night ? ['#141838', '#22265A'] : ['#C9D3DA', '#DDE3E6', '#E8ECEC'], 3, 2, 7, gx, gx + gw);
    F([[gx, gy + gh * .55], [gx + gw * .4, gy + gh * .45], [gx + gw, gy + gh * .52], [gx + gw, gy + gh], [gx, gy + gh]], night ? '#20224A' : '#9EA8A0'); for (let i = 0; i < 4; i++) Rc(gx + 40 + i * 120, gy + gh * .4 - hash(i) * 80, 80, 300, night ? '#2A2C58' : '#B8BCC0', { ink: I, sw: .3 });
    ln([[gx + gw / 2, gy], [gx + gw / 2, gy + gh]], 1.2, '#2A2A30', 'ink', 0);
    [[gx - 20, gx + 120], [gx + gw - 120, gx + gw + 20]].forEach(([a, b], i) => { F([[a, gy - 20], [b, gy - 20], [b + Math.sin(t + i) * 8, gy + gh + 10], [a, gy + gh + 10]], '#FFFFFF', { op: 150, curv: .2 }); for (let k = 1; k < 4; k++) ln([[lerp(a, b, k / 4), gy - 10], [lerp(a, b, k / 4) + Math.sin(t + k) * 5, gy + gh]], .3, '#D8D6E0', 'ink', .3); });
    stringLights(gx - 30, gy + 10, gx + gw + 30, gy + 20, t, { sag: 60, n: 12, cols: ['#FFE3A0', '#FFD0E0', '#FFF1C8'] });
    // wheeled whiteboard with flows
    const bx = 40, by = 360, bw = 420, bh = 300;
    Rc(bx, by, bw, bh, '#FBFBF8', { ink: I, sw: 1.1 }); ln([[bx + 30, by + bh], [bx + 20, fy + 60]], 1.2, '#8E929E', 'ink', 0); ln([[bx + bw - 30, by + bh], [bx + bw - 20, fy + 60]], 1.2, '#8E929E', 'ink', 0); Ec(bx + 20, fy + 70, 12, 12, '#2A2230', { n: 8 }); Ec(bx + bw - 20, fy + 70, 12, 12, '#2A2230', { n: 8 });
    [[80, 410], [230, 410], [80, 540], [300, 540]].forEach(([x, y], i) => { Rc(x, y, 110, 60, '#000', { op: 0, ink: ['#2E6FB8', '#E14C5A'][i % 2], sw: .8 }); ln([[x + 10, y + 30], [x + 90, y + 30]], .4, '#5A5A68', 'marker', 0); });
    ln([[190, 440], [230, 440]], .8, '#2E6FB8', 'marker', 0); ln([[285, 470], [190, 540]], .8, '#2E6FB8', 'marker', .3); ln([[190, 570], [300, 570]], .8, '#E14C5A', 'marker', 0); scribble(o.board || 'IDEAS', 250, by + 30, 26, '#2A3A8A', { br: 'marker', sw: .7 });
    // dining table desk + monitor + laptop + red cups + mesh chair + dumbbells
    const dy = 1100;
    F([[-90, dy], [W + 90, dy], [W + 90, dy + 44], [-90, dy + 44]], '#B58A5E', { ink: I, sw: 1 }); TX(rectPts(-90, dy, W + 180, 44), '#94693F', 100);
    ln([[80, dy + 44], [80, fy + 200]], 2.4, '#6E4A30', 'ink', 0); ln([[1000, dy + 44], [1000, fy + 200]], 2.4, '#6E4A30', 'ink', 0);
    ln([[760, dy], [760, dy - 60]], 3, '#3A3A48', 'ink', 0); RRc(560, dy - 330, 400, 270, 10, '#1E1E26', { ink: I, sw: 1 }); Rc(574, dy - 316, 372, 242, night ? '#2A2E50' : '#E8EEF6'); for (let k = 0; k < 6; k++) Rc(590, dy - 300 + k * 36, 160 + hash(k) * 160, 18, k === 0 ? PAL.hot : '#9CC8E8', { op: 200 });
    const scr = laptop(330, dy, .6, { glow: true });
    [[180, '#E14C5A'], [960, '#E14C5A']].forEach(([cx2, c]) => { F([[cx2 - 24, dy - 70], [cx2 + 24, dy - 70], [cx2 + 18, dy], [cx2 - 18, dy]], c, { ink: I, sw: .6 }); Rc(cx2 - 24, dy - 74, 48, 8, '#FFFFFF'); });
    F([[230, dy + 150], [430, dy + 150], [420, dy + 300], [240, dy + 300]], '#2A2A30', { ink: I, sw: .8 }); for (let k = 0; k < 5; k++) ln([[250, dy + 170 + k * 26], [410, dy + 170 + k * 26]], .3, '#5A5A68', 'ink', 0); ln([[330, dy + 300], [330, fy + 200]], 2, '#2A2A30', 'ink', 0);
    [[760, 1640], [880, 1660]].forEach(([x, y]) => { Rc(x - 50, y - 8, 100, 16, '#5A5A68', { ink: I, sw: .6 }); Ec(x - 50, y, 22, 30, '#2A2A30', { ink: I, sw: .6 }); Ec(x + 50, y, 22, 30, '#2A2A30', { ink: I, sw: .6 }); });
    setEnd();
    return { desk: [330, dy], chair: [330, dy + 260], board: { x: bx, y: by, w: bw, h: bh }, screen: scr };
  }

  // ---------- CITY HIGH-RISE: floor-to-ceiling glass over the water ----------
  // o.time 'day'|'dusk'|'night', o.bridge (a bridge span in the view, default false). Bare mattress w/ quilted cover, white walls, takeout container. RETURNS {bed:[x,y], window:{x,y,w,h}, counter:[x,y]}
  function highriseSet(t, o = {}) {
    setBegin(41, t, o);
    const tm = o.time || 'dusk', night = tm === 'night', dusk = tm === 'dusk', fy = 1380;
    wallFloor(night ? '#4A4E78' : '#F2F1EC', '#A8A49C', fy, { floor: 'vinyl', base: '#FFFFFF' });
    const wx = 380, wy = 80, ww = 700, wh = fy - 100;
    Rc(wx - 16, wy - 16, ww + 40, wh + 32, '#1E1E24', { ink: I, sw: 1 });
    skyBands(wy, wy + wh, night ? ['#0B0F30', '#141A44', '#22265A'] : dusk ? ['#4C4B8E', '#B474A0', '#F2A98A', '#F9D58A'] : ['#BFD6E6', '#DCE8EE', '#EEF2F0'], 6, 4, 6, wx, wx + ww);
    if (night) stars(10, wy + 20, wy + 400, t, 91, '#FFF6DA', wx + 10, wx + ww - 10);
    // water (+ optional bridge span)
    F([[wx, wy + wh * .66], [wx + ww, wy + wh * .62], [wx + ww, wy + wh], [wx, wy + wh]], night ? '#101A40' : dusk ? '#7E5A9E' : '#5A8AB0');
    if (o.bridge) {
    const tx2 = wx + 420; Rc(tx2 - 18, wy + 260, 36, wh * .7, night ? '#8E92B8' : '#E8E6EE', { ink: I, sw: .7 });
    const cy = x => wy + 280 + Math.pow((x - tx2) / 500, 2) * 260; const cp = []; for (let k = 0; k <= 16; k++) { const x = wx + k * ww / 16; cp.push([x, Math.min(cy(x), wy + wh * .64)]); } ln(cp, 1.1, night ? '#B8BCDE' : '#F4F2F6', 'ink', .3);
    for (let k = 0; k < 16; k++) { const x = wx + 20 + k * 44; ln([[x, Math.min(cy(x), wy + wh * .64)], [x, wy + wh * .64]], .3, night ? '#6E72A8' : '#E8E6EE', 'ink', 0); }
    Rc(wx, wy + wh * .64 - 10, ww, 22, night ? '#2A2C50' : '#8E8A9E', { ink: I, sw: .7 });
    if (night || dusk) for (let k = 0; k < 16; k++) { const x = wx + 20 + k * 44; Ec(x, Math.min(cy(x), wy + wh * .64), 5, 5, '#FFF0C0', { op: 160 + 90 * tw(k, t, .8), n: 8 }); }
    }
    // neighbouring glass towers
    Rc(wx + ww - 200, wy + 40, 220, wh, night ? '#22264E' : '#B8C8D6', { ink: I, sw: .6 }); for (let r = 0; r < 18; r++) ln([[wx + ww - 200, wy + 60 + r * 64], [wx + ww + 20, wy + 60 + r * 64]], .3, night ? '#3A3E70' : '#9EB0C0', 'ink', 0);
    if (night) for (let r = 0; r < 10; r++) if (hash(r * 3) > .5) Rc(wx + ww - 180, wy + 70 + r * 128, 60, 40, '#FFD98E', { op: 200 });
    ln([[wx + ww * .48, wy], [wx + ww * .48, wy + wh]], 2, '#1E1E24', 'ink', 0);
    // counter w/ takeout + bare mattress
    Rc(-80, 900, 380, 40, '#E8E6E0', { ink: I, sw: .9 }); F([[-80, 940], [300, 940], [300, fy], [-80, fy]], '#FFFFFF', { ink: I, sw: .8 });
    F([[120, 900], [210, 900], [220, 840], [110, 840]], '#FFFFFF', { ink: I, sw: .7 }); F([[110, 840], [165, 810], [220, 840]], '#F4F0E6', { ink: I, sw: .6 }); ln([[200, 830], [230, 780]], .6, '#9A6E48', 'ink', 0);
    const by = 1500;
    F([[-90, by - 90], [700, by - 110], [760, by + 60], [-90, by + 90]], '#F8F6F0', { ink: I, sw: 1.1, curv: .15 }); for (let k = 0; k < 7; k++) for (let r = 0; r < 2; r++) { const x = k * 110 - 30, y = by - 50 + r * 70; ln([[x - 30, y], [x, y - 14], [x + 30, y], [x, y + 14], [x - 30, y]], .35, '#C9C6BC', 'ink', .5); }
    F([[-90, by + 90], [760, by + 60], [760, by + 120], [-90, by + 150]], '#D9D6CC', { ink: I, sw: .8 });
    setEnd();
    return { bed: [330, by - 60], window: { x: wx, y: wy, w: ww, h: wh }, counter: [110, 900] };
  }

  // ---------- AIRPORT GATE before dawn ----------
  // RETURNS {seat(i) → [x,y] sit point, floor}
  function airportGateSet(t, o = {}) {
    setBegin(42, t, o);
    F(rectPts(-80, -80, W + 160, H + 160), '#262A4E');
    const wy = 200, wh = 820;
    skyBands(wy, wy + wh * .6, ['#0B0F30', '#141A44', '#22265A', '#33306D'], 5, 3, 3); stars(16, wy + 20, wy + 300, t, 101);
    F([[-90, wy + wh * .6], [W + 90, wy + wh * .6], [W + 90, wy + wh], [-90, wy + wh]], '#14162E');
    for (let k = 0; k < 18; k++) { const x = k * 70 - 20, y = wy + wh * .66 + (k % 3) * 40; Ec(x, y, 6, 6, '#5FA8FF', { op: 200 + 55 * tw(k, t, 1.5), n: 8 }); halo(x, y, 24, '#5FA8FF', 40, 2); }
    // plane at the gate (nose + wing)
    F([[200, wy + wh * .7], [780, wy + wh * .62], [900, wy + wh * .66], [780, wy + wh * .76], [200, wy + wh * .78]], '#D8DCE6', { ink: I, sw: 1, curv: .3 }); for (let k = 0; k < 9; k++) Ec(300 + k * 50, wy + wh * .7, 8, 9, '#3A3E68', { n: 8 }); F([[400, wy + wh * .76], [640, wy + wh * .76], [520, wy + wh * .9]], '#B8BCC8', { ink: I, sw: .8 });
    for (let k = 0; k < 5; k++) Rc(k * 260 - 40, wy, 16, wh, '#3A3E68');
    Rc(-80, wy - 20, W + 160, 30, '#3A3E68'); Rc(-80, wy + wh, W + 160, 30, '#3A3E68');
    // gate sign
    RRc(640, 80, 360, 90, 10, '#1E1E26', { ink: I, sw: .8 }); scribble('GATE', 760, 125, 44, '#F7D774', { sw: 1.2 }); F([[900, 105], [950, 125], [900, 145]], '#F7D774');
    // carpet + rows of empty seats
    F([[-90, 1050], [W + 90, 1050], [W + 90, H + 90], [-90, H + 90]], '#3A3E6E'); for (let i = 0; i < 60; i++) Ec(hash(i * 3) * W, 1080 + hash(i * 5) * 840, 6, 4, '#4E5288', { n: 6 });
    const seats = [];
    [[1240, .8], [1520, 1]].forEach(([y, sc]) => { for (let k = 0; k < 5; k++) { const x = 100 + k * 220 * sc + (1 - sc) * 200; RRc(x - 90 * sc, y - 180 * sc, 180 * sc, 170 * sc, 20, '#2A2E48', { ink: I, sw: .8 }); Rc(x - 96 * sc, y - 10, 192 * sc, 30 * sc, '#1E2236', { ink: I, sw: .6 }); seats.push([x, y]); } ln([[60, y + 20 * sc], [1040, y + 20 * sc]], 1.4, '#8E92B8', 'ink', 0); });
    setEnd();
    return { seat: i => seats[i % seats.length], floor: 1700 };
  }

  // ---------- TAKEOUT SHOP at night — counter, violet neon, pickup shelf. NO logo. ----------
  // o.bags (on the pickup shelf, default 2). RETURNS {shelf:[x,y], counter:[x,y]}
  function takeoutShopSet(t, o = {}) {
    setBegin(43, t, o);
    F(rectPts(-80, -80, W + 160, H + 160), '#2A1E4A'); TX(rectPts(-80, -80, W + 160, 1200), '#3A2A6A', 70);
    // neon squiggles + menu boards (icons only)
    const nOn = .85 + .15 * tw(3, t, 5);
    halo(540, 200, 420, '#B46AFF', 50 * nOn, 3); ln([[120, 220], [300, 140], [500, 230], [700, 130], [960, 210]], 1.6, '#D9A8FF', 'marker', .6); ln([[160, 260], [420, 200], [680, 260], [920, 190]], 1.2, '#FF6FB4', 'marker', .6);
    for (let k = 0; k < 3; k++) { RRc(100 + k * 310, 330, 270, 200, 10, '#14102A', { ink: '#B46AFF', sw: .8 }); for (let r = 0; r < 3; r++) { Ec(150 + k * 310, 380 + r * 54, 20, 14, ['#F7D774', '#F2876A', '#86AE7A'][r], { n: 10 }); Rc(185 + k * 310, 374 + r * 54, 140, 10, '#C3B1E1', { op: 200 }); } }
    // window to the dark lot
    Rc(-60, 600, 360, 420, '#0F0C24', { ink: I, sw: 1 }); halo(120, 900, 100, '#FFD98E', 50, 2); Rc(40, 940, 160, 50, '#3A3E68');
    // pickup shelf with bags
    const sx = 680, sy = 900;
    Rc(sx - 220, sy, 440, 24, '#C9CCD6', { ink: I, sw: .8 }); Rc(sx - 220, sy - 300, 440, 16, '#C9CCD6', { ink: I, sw: .6 }); halo(sx, sy - 120, 240, '#FFE9B0', 50, 3);
    scribble('PICKUP', sx, sy - 340, 40, '#FF8FC4', { sw: 1.8 });
    for (let k = 0; k < N(o.bags, 2); k++) takeoutBag(sx - 120 + k * 200, sy, .62, { t, receipt: k === 0 });
    // bar-height counter (foreground)
    F([[-90, 1080], [W + 90, 1080], [W + 90, H + 90], [-90, H + 90]], '#3A2A58'); F([[-90, 1420], [W + 90, 1420], [W + 90, 1470], [-90, 1470]], '#E4E0EC', { ink: I, sw: 1 }); F([[-90, 1470], [W + 90, 1470], [W + 90, H + 90], [-90, H + 90]], '#2E3A5C', { ink: I, sw: 1 }); for (let k = 0; k < 9; k++) ln([[k * 130, 1480], [k * 130, H]], .5, '#3A2268', 'ink', 0);
    halo(540, 1440, 500, '#FF4FA0', 22, 2);
    setEnd();
    return { shelf: [sx, sy], counter: [540, 1420] };
  }

  // ---------- CONFERENCE DOORS: generic, no marks; a check-in table with name badges ----------
  // o.banner (optional banner text, default none: abstract shapes). RETURNS {door:[x,y] floor point at the doors, floor}
  function conferenceSet(t, o = {}) {
    setBegin(44, t, o);
    const fy = 1400;
    wallFloor('#EEEAE0', '#C9C2B0', fy, { floor: 'tile', base: '#2A2E44' });
    // banner
    if (o.calm !== 'top') { F([[120, 160], [960, 160], [960, 480], [120, 480]], '#2A2E44', { ink: I, sw: 1 }); if (o.banner) scribble(o.banner, 540, 320, 60, '#F7D774', { sw: 1.6 }); else { Ec(330, 320, 90, 90, PAL.coral, { op: 230 }); Rc(470, 260, 380, 40, '#F7D774', { op: 230 }); Rc(470, 340, 260, 30, '#FFFFFF', { op: 200 }); } }
    // glass doors with light spilling out
    const dx = 540, dw = 560, dh = 760, dyy = fy - dh;
    halo(dx, dyy + dh / 2, 520, '#FFF6D0', 70, 4);
    Rc(dx - dw / 2 - 20, dyy - 20, dw + 40, dh + 20, '#2A2A30', { ink: I, sw: 1.1 }); Rc(dx - dw / 2, dyy, dw, dh, '#FFF6DE');
    for (let i = 0; i < 9; i++) blobPerson(dx - 220 + i * 55, dyy + dh - 160 - (i % 2) * 20, 2.2, ['#2A2E44', '#E46F8C', '#3E9C97', '#E9AE3C'][i % 4], SKINS[i % 6], t, i);
    ln([[dx, dyy], [dx, dyy + dh]], 1.6, '#2A2A30', 'ink', 0); Rc(dx - 40, dyy + dh * .45, 12, 120, '#C9CCD6'); Rc(dx + 28, dyy + dh * .45, 12, 120, '#C9CCD6');
    // check-in table: rows of name badges
    F([[700, 1450], [1080, 1450], [1080, 1490], [700, 1490]], '#F6F1E6', { ink: I, sw: .9 }); F([[700, 1490], [1080, 1490], [1070, 1700], [710, 1700]], '#2A2E44', { op: 230 });
    for (let k = 0; k < 8; k++) { const bx = 730 + (k % 4) * 86, byy = 1452 + Math.floor(k / 4) * 18; Rc(bx, byy, 64, 14, '#FFFFFF', { ink: I, sw: .3 }); Rc(bx, byy, 64, 5, [PAL.coral, PAL.teal, PAL.butter][k % 3]); }
    setEnd();
    return { door: [dx, fy + 40], floor: fy + 40 };
  }

  // ======================================================================================
  //                                LIFE PROPS
  // ======================================================================================
  // video-call grid painted into a screen rect (laptop()/phone() return one). o.n tiles (default 6), o.me (index of your tile, -1 none),
  // o.whiz (true: one tile shows someone in a lab coat holding a glowing vial; o.whizIdx, default 1; off by default), o.hands (all tiles hands up), o.grey (index greyed out)
  function zoomGrid(x, y, w, h, t, o = {}) {
    const n = N(o.n, 6), cols = n <= 4 ? 2 : 3, rows = Math.ceil(n / cols), tw2 = w / cols, th = h / rows;
    Rc(x, y, w, h, '#1E1E26');
    for (let i = 0; i < n; i++) {
      const cx = x + (i % cols) * tw2, cy = y + Math.floor(i / cols) * th, g = 3;
      const grey = o.grey === i, bgc = grey ? '#3A3A44' : ['#5A6A8A', '#7A6A5A', '#5A7A6A', '#6A5A7A', '#7A7A5A', '#5A6A7A'][i % 6];
      Rc(cx + g, cy + g, tw2 - g * 2, th - g * 2, bgc);
      if (!grey) {
        const hx = cx + tw2 / 2, hy = cy + th * .5, s = Math.min(tw2, th) / 120;
        const isWhiz = o.whiz && i === N(o.whizIdx, 1);
        F([[hx - 34 * s, cy + th - g], [hx - 28 * s, hy + 24 * s], [hx + 28 * s, hy + 24 * s], [hx + 34 * s, cy + th - g]], isWhiz ? '#FFFFFF' : ['#2A2230', '#E46F8C', '#3E6FA8', '#86AE7A'][i % 4], { curv: .3 });
        Ec(hx, hy, 20 * s, 23 * s, SKINS[(i * 2 + 1) % 6], { n: 12 });
        F([[hx - 20 * s, hy - 6 * s], [hx - 12 * s, hy - 24 * s], [hx + 14 * s, hy - 24 * s], [hx + 21 * s, hy - 6 * s]], ['#2B2026', '#5A3A2A', '#2B2026', '#8A5A3A'][i % 4], { curv: .5 }); // hair
        if (i % 2 === 0 && !isWhiz) { ln([[hx - 12 * s, hy], [hx - 4 * s, hy]], .5, I, 'ink', 0); ln([[hx + 4 * s, hy], [hx + 12 * s, hy]], .5, I, 'ink', 0); }
        if (isWhiz) { const b = .6 + .4 * Math.sin(t * 6); halo(hx + 32 * s, hy + 6 * s, 70 * s, '#7CFFB0', 90 * b, 3); F(xform(rrPts(-10 * s, -34 * s, 20 * s, 56 * s, 8 * s), hx + 32 * s, hy + 8 * s, 1, .2), '#9CFFC8', { ink: I, sw: .5 }); Ec(hx - 8 * s, hy - 2 * s, 9 * s, 6 * s, '#E4F6FF', { ink: I, sw: .3, n: 8 }); Ec(hx + 8 * s, hy - 2 * s, 9 * s, 6 * s, '#E4F6FF', { ink: I, sw: .3, n: 8 }); }
        if (o.hands) ln([[hx + 26 * s, hy + 26 * s], [hx + 34 * s, hy - 30 * s]], 1.2, SKINS[(i * 2 + 1) % 6], 'ink', .2);
      } else { ln([[cx + tw2 * .4, cy + th * .4], [cx + tw2 * .6, cy + th * .6]], .5, '#6A6A74', 'ink', 0); }
      if (o.me === i) Rc(cx + g, cy + g, tw2 - g * 2, th - g * 2, '#000', { op: 0, ink: '#7CFF7C', sw: 1 });
    }
  }

  // ribbon rosette. anchor = rosette centre, ~120×260 at s=1. o.col, o.place (e.g. '1ST') lettered on the rosette, o.droop 0..1
  function ribbon(x, y, s = 1, o = {}) {
    const c = o.col || PAL.hot, dr = N(o.droop, 0), t = N(o.t, TT());
    xf(x, y, s, o, () => {
      [-1, 1].forEach(d => F([[d * 14, 30], [d * 46 + d * dr * 20, 230 + dr * 30], [d * 26 + d * dr * 10, 200 + dr * 30], [d * 8, 240 + dr * 34], [d * -10, 40]], shade(c, -.12), { ink: I, sw: .8 }));
      for (let k = 0; k < 16; k++) { const a = k / 16 * TAU; F([[0, 0], [Math.cos(a - .2) * 92, Math.sin(a - .2) * 92], [Math.cos(a + .2) * 92, Math.sin(a + .2) * 92]], k % 2 ? c : shade(c, .2), { ink: k % 4 ? null : I, sw: .4 }); }
      Ec(0, 0, 58, 58, '#FFF6E6', { ink: I, sw: .9 });
      if (o.place) scribble(o.place, 0, 0, o.place.length > 3 ? 26 : 32, I, { sw: .9 });
    });
  }
  // trophy. anchor = base bottom-centre. o.kind 'cup' (~300×480) | 'medal' (anchor = medal centre, r≈120, ribbon above) | 'star' (a
  // bigger medal with an embossed star; 'globe' is an older alias). o.place text, o.col metal ('#E9C97A' gold, '#C9CCD6' silver, '#C98A4A' bronze), o.cape (tiny cape)
  function trophy(x, y, s = 1, o = {}) {
    const c = o.col || '#E9C97A', k = o.kind === 'globe' ? 'star' : o.kind || 'cup', t = N(o.t, TT());
    xf(x, y, s, o, () => {
      if (k === 'cup') {
        Rc(-110, -60, 220, 60, '#3A2E2A', { ink: I, sw: 1 }); Rc(-80, -100, 160, 40, '#5A4436', { ink: I, sw: .8 });
        F([[-30, -100], [30, -100], [16, -190], [-16, -190]], c, { ink: I, sw: .9 });
        F([[-130, -420], [130, -420], [110, -300], [50, -210], [-50, -210], [-110, -300]], c, { ink: I, sw: 1.1, curv: .3 });
        [-1, 1].forEach(d => ln([[d * 120, -400], [d * 190, -380], [d * 180, -300], [d * 100, -280]], 2.2, c, 'ink', .6));
        F([[-90, -400], [-60, -400], [-40, -240], [-58, -250]], '#FFFFFF', { op: 110 });
        if (o.place) { Rc(-70, -52, 140, 36, '#E9C97A', { op: 220 }); scribble(o.place, 0, -34, 26, I, { sw: .7 }); }
      } else {
        ln([[-40, -330], [0, -110], [40, -330]], 3, PAL.hot, 'ink', 0); F([[-56, -330], [-24, -330], [8, -110], [-8, -110]], o.ribbon || PAL.hot, { op: 220 }); F([[56, -330], [24, -330], [-8, -110], [8, -110]], shade(o.ribbon || PAL.hot, -.15), { op: 220 });
        const R = k === 'star' ? 150 : 110;
        if (o.cape) { const fl = Math.sin(t * 6) * 16; F([[-70, -60], [70, -60], [130 + fl, 160], [0, 120], [-130 - fl, 160]], '#E14C5A', { ink: I, sw: 1, curv: .3 }); }
        Ec(0, 0, R + 14, R + 14, shade(c, -.25), { ink: I, sw: 1.1 }); Ec(0, 0, R, R, c, { ink: I, sw: .6 });
        if (k === 'star') F(starPts(0, 0, R * .78, .45, 5), shade(c, -.14), { ink: shade(c, -.35), sw: .5 }); // embossed star
        F([[-R * .6, -R * .6], [-R * .2, -R * .8], [-R * .5, -R * .2]], '#FFFFFF', { op: 120, curv: .5 });
        if (o.place) scribble(o.place, 0, 4, k === 'star' ? 70 : 54, I, { sw: 1.6 });
      }
    });
  }

  // GADGET CASE (briefcaseMachine; a hobby electronics kit): hard black case, foam, small screen, breadboard + jumper wires,
  // battery pack, a little motor with a fan, one LED. anchor = hinge centre (case body hangs below), ~560×360 closed.
  // o.open 0..1 (lid swings up), o.spark 0..1 (a wire sparks), o.cape (tiny cape), o.readout (short screen text), o.t
  function briefcaseMachine(x, y, s = 1, o = {}) {
    const op = clamp(N(o.open, 1)), t = N(o.t, TT()), sp = N(o.spark, 0);
    xf(x, y, s, o, () => {
      if (o.cape) { const fl = Math.sin(t * 5) * 20; F([[-200, -20], [200, -20], [300 + fl, 260], [0, 200], [-300 - fl, 260]], '#E14C5A', { ink: I, sw: 1, curv: .3 }); }
      // body
      RRc(-280, 0, 560, 300, 26, '#1E1C24', { ink: I, sw: 1.3 });
      Rc(-280, 140, 560, 10, '#3A3844'); [-200, 200].forEach(px => { RRc(px - 26, -10, 52, 24, 6, '#C9A44A', { ink: I, sw: .6 }); });
      if (op > .02) {
        // inside: foam + parts (visible in the body as a tray)
        Rc(-256, 14, 512, 270, '#3A3644'); for (let k = 0; k < 14; k++) for (let r = 0; r < 6; r++) Ec(-240 + k * 37, 30 + r * 44, 6, 6, '#2A2632', { n: 6 });
        RRc(-230, 40, 170, 110, 8, '#0E2A2A', { ink: I, sw: .8 }); // screen
        if (o.readout) scribble(String(o.readout), -145, 95, 22, '#7CFFB0', { sw: .5 }); else for (let k = 0; k < 3; k++) Rc(-210, 62 + k * 26, 60 + hash(k + 4) * 60, 10, '#5FE0D8', { op: 160 });
        RRc(-20, 40, 240, 120, 6, '#F4F0E6', { ink: I, sw: .7 }); for (let k = 0; k < 12; k++) for (let r = 0; r < 4; r++) Ec(0 + k * 18, 60 + r * 26, 2.5, 2.5, '#9A9AA0', { n: 6 }); // breadboard
        const wc = ['#E14C5A', '#3E6FA8', '#E9AE3C', '#86AE7A', '#FF4FA0'];
        for (let k = 0; k < 5; k++) ln([[20 + k * 40, 70 + (k % 2) * 30], [40 + k * 30, 20 - 30 * (k % 3) - 20 * Math.sin(t * 2 + k) * .2], [-60 + k * 70, 190 + (k % 2) * 30], [-120 + k * 60, 250]], 1.1, wc[k], 'ink', .6);
        // battery pack + a little motor with a spinning fan
        RRc(-210, 190, 160, 70, 8, '#2F55B5', { ink: I, sw: .8 }); for (let k = 0; k < 2; k++) RRc(-198 + k * 74, 202, 66, 46, 10, '#E9AE3C', { ink: I, sw: .5 });
        Rc(140, 200, 70, 50, '#C9CCD6', { ink: I, sw: .7 }); for (let k = 0; k < 3; k++) { const a = t * 9 + k * TAU / 3; F([[230, 225], [230 + Math.cos(a) * 40, 225 + Math.sin(a) * 40], [230 + Math.cos(a + .5) * 36, 225 + Math.sin(a + .5) * 36]], '#F2876A', { ink: I, sw: .4 }); }
        const led = .5 + .5 * Math.sin(t * 8); halo(200, 70, 40, '#7CFF7C', 70 * led, 2); Ec(200, 70, 9, 9, mixCol('#2A7A2A', '#7CFF7C', led), { ink: I, sw: .4, n: 8 });
        if (sp > 0) { const fl = hash(Math.floor(t * 16)); halo(60, 20, 140 * sp, '#FFE07A', 110 * sp, 3); for (let k = 0; k < 7; k++) { const a = k / 7 * TAU + fl * 2; ln([[60, 20], [60 + Math.cos(a) * 50 * sp, 20 + Math.sin(a) * 50 * sp], [60 + Math.cos(a + .3) * 110 * sp, 20 + Math.sin(a + .3) * 110 * sp]], 1.1, k % 2 ? '#FFE07A' : '#FFFFFF', 'ink', 0); } }
      }
      // lid (rotates about the hinge, y=0): closed lid covers the body face
      const ang = -op * 1.9, ly = Math.cos(ang), lh = 300;
      if (op <= .02) { RRc(-280, 0, 560, 300, 26, '#26242E', { ink: I, sw: 1.3 }); RRc(-90, -36, 180, 40, 14, '#000', { op: 0, ink: '#1E1C24', sw: 3 }); ln([[-260, 40], [260, 40]], .4, '#4A4856', 'ink', 0); }
      else { const ty = -lh * Math.abs(ly) * (ang < -Math.PI / 2 ? 1 : 1); F([[-280, 0], [280, 0], [280 - 10, -lh * Math.sin(-ang) * .95], [-280 + 10, -lh * Math.sin(-ang) * .95]], '#2A2832', { ink: I, sw: 1.2 }); if (op > .5) { Rc(-250, -lh * Math.sin(-ang) * .9, 500, lh * Math.sin(-ang) * .85, '#3A3644', { op: 200 }); for (let k = 0; k < 10; k++) for (let r = 0; r < 4; r++) Ec(-230 + k * 50, -lh * Math.sin(-ang) * .85 + 30 + r * 50 * Math.sin(-ang), 7, 7 * Math.sin(-ang), '#2A2632', { n: 6 }); } }
      if (op <= .02) RRc(-60, -30, 120, 34, 14, '#26242E', { ink: I, sw: 1 });
    });
  }

  // WALKING BOOT prop. anchor = sole bottom-centre, ~260×420. o.flip (toe left), o.strap col, o.off (lying on its side)
  function walkingBoot(x, y, s = 1, o = {}) {
    xf(x, y, s, o.off ? { ...o, rot: (o.rot || 0) - 1.45 } : o, () => {
      RRc(-130, -46, 290, 50, 24, '#26242C', { ink: I, sw: 1.2 }); // rocker sole
      for (let k = 0; k < 7; k++) ln([[-110 + k * 38, -4], [-96 + k * 38, -4]], .8, '#4A4856', 'ink', 0);
      // grey shell: calf to toe in one rounded shape
      F([[-100, -40], [150, -40], [160, -80], [110, -120], [40, -150], [30, -420], [-20, -440], [-90, -430], [-100, -150], [-110, -90]], '#5A5866', { ink: I, sw: 1.2, curv: .35 });
      F([[-70, -60], [120, -60], [90, -105], [20, -130], [10, -400], [-60, -410], [-70, -140]], '#C9C6D0', { ink: I, sw: .6, curv: .35 }); // padded liner
      // black velcro straps
      [[-200, 1], [-270, 1], [-340, 1], [-110, .9]].forEach(([yy, k]) => { F([[-108, yy - 18], [42 * k, yy - 24], [46 * k, yy + 18], [-108, yy + 22]], '#1E1C24', { ink: I, sw: .8 }); Rc(10 * k, yy - 16, 28, 32, '#3A3844', { ink: I, sw: .4 }); });
      F([[40, -100], [140, -70], [150, -50], [40, -70]], '#1E1C24', { ink: I, sw: .7 });
      F([[-90, -400], [-70, -400], [-80, -160], [-96, -170]], '#FFFFFF', { op: 70 });
    });
  }

  // TRI-FOLD board on its table edge. anchor = bottom-centre, ~620×440. o.title (scribbled header, short!), o.col (header strip),
  // o.byline (true → a small "BY" strip), o.panels (sheets pinned; default 9), o.angle 0..1 side-panel fold
  function trifold(x, y, s = 1, o = {}) {
    const c = o.col || '#9CC8E8', fold = N(o.angle, .5);
    xf(x, y, s, o, () => {
      const cw = 300, sw2 = 170 * (1 - fold * .35), h = 420;
      F([[-cw / 2 - sw2, -h + 30 * fold], [-cw / 2, -h], [-cw / 2, 0], [-cw / 2 - sw2, -20 * fold]], '#F6F3EC', { ink: I, sw: 1 });
      F([[cw / 2 + sw2, -h + 30 * fold], [cw / 2, -h], [cw / 2, 0], [cw / 2 + sw2, -20 * fold]], '#EFEBE2', { ink: I, sw: 1 });
      Rc(-cw / 2, -h, cw, h, '#FFFFFF', { ink: I, sw: 1.1 });
      Rc(-cw / 2 - sw2 + 10, -h + 10, cw + sw2 * 2 - 20, 60, c, { ink: I, sw: .6 });
      if (o.title) scribble(o.title, 0, -h + 40, Math.min(34, 520 / Math.max(5, o.title.length)), I, { sw: .8 });
      const n = N(o.panels, 9);
      for (let i = 0; i < n; i++) {
        const col = i % 3, row = Math.floor(i / 3), px = col === 0 ? -cw / 2 - sw2 * .55 : col === 1 ? -50 + (i % 2) * 40 : cw / 2 + sw2 * .5, py = -h + 120 + row * 100;
        Rc(px - 50, py - 34, col === 1 ? 110 : 80, 76, ['#F4ECDD', '#DCEAFF', '#FFF6E6'][i % 3], { ink: I, sw: .4 });
        for (let k = 0; k < 3; k++) ln([[px - 40, py - 18 + k * 18], [px + (col === 1 ? 50 : 22), py - 18 + k * 18]], .3, '#9A9AA8', 'ink', 0);
        if (i === 4) { ln([[px - 40, py + 30], [px - 10, py - 10], [px + 20, py + 10], [px + 50, py - 30]], .7, PAL.hot, 'ink', .3); }
      }
      if (o.byline !== false) Rc(-60, -h + 80, 120, 22, '#E4F0FA', { ink: I, sw: .4 });
    });
  }

  // NAME placard. anchor = centre, 360×110. o.title ('REP.'), o.name ('YOU'), o.col
  function placard(x, y, s = 1, o = {}) {
    xf(x, y, s, o, () => {
      F([[-180, 50], [180, 50], [160, -50], [-160, -50]], o.col || '#FFF6E6', { ink: I, sw: 1 });
      scribble(o.title ?? 'REP.', 0, -22, 24, '#5A5A68', { sw: .6 }); scribble(o.name || 'YOU', 0, 16, 40, I, { sw: 1.1 });
    });
  }

  // LAPTOP raining CONFETTI (a celebration screen: banner + gold star). anchor = hinge centre like laptop(). o.burst 0..1 (how far
  // the confetti has flown; drive it with seg()), o.screen (optional text instead of the banner). RETURNS screen rect
  function confettiLaptop(x, y, s = 1, o = {}) {
    const t = N(o.t, TT()), b = clamp(N(o.burst, 1)), r = laptop(x, y, s, { glow: true, screen: o.screen, rot: o.rot });
    if (!o.screen) { Rc(r.x, r.y, r.w, r.h, '#FFFFFF', { op: 200 }); Rc(r.x, r.y, r.w, r.h * .16, '#33407E'); F(starPts(r.x + r.w / 2, r.y + r.h * .58, r.h * .22, .45, 5), '#F7D774', { ink: I, sw: .5 }); }
    const cols = [PAL.hot, PAL.butter, PAL.teal, PAL.coral, PAL.sky, PAL.violet];
    for (let i = 0; i < 46; i++) {
      const a = -Math.PI / 2 + (hash(i * 3.1) - .5) * 2.4, sp2 = 300 + hash(i * 5.7) * 700, u = b * (.6 + hash(i) * .4);
      const px = x + Math.cos(a) * sp2 * u * s, py = y - 150 * s + Math.sin(a) * sp2 * u * s + u * u * 600 * s, rr = t * 6 * (hash(i * 9) - .5) + i;
      if (u < .02) continue;
      F(xform(i % 3 ? rectPts(-10, -5, 20, 10) : starPts(0, 0, 11, .45, 4), px, py, s, rr), cols[i % 6], { op: 235 });
    }
    return r;
  }

  // TAKEOUT BAG (generic kraft paper bag, coral band, NO logo) + stapled receipt (o.items, two short lines). anchor = bottom-centre, ~220×300.
  // o.receipt (true), o.steam, o.crumple 0..1
  function takeoutBag(x, y, s = 1, o = {}) {
    const t = N(o.t, TT());
    xf(x, y, s, o, () => {
      const cr = N(o.crumple, 0);
      F([[-110, 0], [110, 0], [100, -240], [80 - cr * 20, -300], [-80 + cr * 20, -300], [-100, -240]], '#D9B98A', { ink: I, sw: 1.1 });
      for (let k = 0; k < 5; k++) ln([[-90 + k * 45, -290], [-80 + k * 42, -260]], .4, '#B8956A', 'ink', 0);
      ln([[-100, -240], [100, -240]], .6, '#B8956A', 'ink', 0);
      Rc(-104, -170, 208, 56, PAL.coral); Rc(-104, -170, 208, 8, PAL.butter, { op: 200 });
      F(xform(starPts(0, 0, 18, .5, 5), 0, -142), '#F7D774', { op: 220 });
      if (N(o.receipt, true)) { F([[60, -220], [140, -210], [130, -60], [52, -70]], '#FFFFFF', { ink: I, sw: .6 }); const it = o.items || ['COMBO #2', 'XTRA SAUCE']; scribble(it[0] || '', 96, -186, 12, I, { sw: .35 }); scribble(it[1] || '', 94, -160, 10, I, { sw: .3 }); for (let k = 0; k < 3; k++) ln([[66, -130 + k * 18], [124, -128 + k * 18]], .25, '#9A9AA0', 'ink', 0); ln([[80, -216], [100, -214]], 1, '#9A9AA0', 'ink', 0); }
      if (o.steam) steam(0, -300, t, 2, 120);
    });
  }

  // BACKPACK (generic, no logos). anchor = centre, ~300×400. o.col (body), o.col2 (pocket/trim), o.tag (lanyard/
  // tag swinging), o.view 'front'|'back' (straps side), o.patch (small hot patch, default true)
  function backpack(x, y, s = 1, o = {}) {
    const c = o.col || '#2A2E44', c2 = o.col2 || '#3E4466', t = N(o.t, TT());
    xf(x, y, s, o, () => {
      if (o.view === 'back') { [-1, 1].forEach(d => F([[d * 40, -190], [d * 110, -170], [d * 120, 160], [d * 80, 170], [d * 70, -150]], '#1E2030', { ink: I, sw: .9, curv: .3 })); }
      F([[-140, 180], [-150, -100], [-110, -190], [0, -210], [110, -190], [150, -100], [140, 180]], c, { ink: I, sw: 1.2, curv: .35 });
      ln([[-120, -110], [0, -150], [120, -110]], .9, '#C9CCD6', 'ink', .5); Rc(-6, -152, 14, 26, '#C9CCD6', { ink: I, sw: .4 });
      RRc(-100, 10, 200, 150, 30, c2, { ink: I, sw: 1 }); ln([[-90, 30], [90, 30]], .8, '#C9CCD6', 'ink', .2);
      ln([[-30, -210], [-20, -250], [20, -250], [30, -210]], 2, '#1E2030', 'ink', .5);
      if (N(o.patch, true)) RRc(-36, 64, 72, 50, 10, PAL.hot, { ink: I, sw: .6 });
      if (o.tag) { const sw = Math.sin(t * 3) * .4; ln([[110, -150], [110 + Math.sin(sw) * 60, -150 + Math.cos(sw) * 60]], .5, I, 'ink', 0); F(xform(rectPts(-22, 0, 44, 60), 110 + Math.sin(sw) * 60, -150 + Math.cos(sw) * 60, 1, -sw), '#FFF6E6', { ink: I, sw: .6 }); }
    });
  }

  // REJECTION email card. anchor = centre, 520×380. o.word (big stamped word, default 'UNFORTUNATELY'), o.from (header line,
  // short, default 'RE: UPDATE'), o.stamp ('NO' big hot stamp, 0..1 pop), o.count (a "×N" tally sticker)
  function rejectionEmail(x, y, s = 1, o = {}) {
    xf(x, y, s, o, () => {
      F(rectPts(-260, -190, 520, 380), '#FFFFFF', { ink: I, sw: 1.1 }); Rc(-260, -190, 520, 56, '#E4E6EC', { ink: I, sw: .6 });
      Ec(-222, -162, 16, 16, '#9CC8E8', { ink: I, sw: .4, n: 10 }); scribble(o.from || 'RE: UPDATE', -190, -162, 22, '#5A5A68', { sw: .6, align: 'left' });
      scribble(o.word || 'UNFORTUNATELY,', -220, -80, 36, I, { sw: 1, align: 'left' });
      for (let k = 0; k < 6; k++) ln([[-220, -20 + k * 32], [-220 + (k === 5 ? 180 : 420 - hash(k) * 80), -20 + k * 32]], .4, '#9A9AA8', 'ink', 0);
      if (o.stamp) { const k = backOut(clamp(o.stamp)); F(xform(rrPts(-130, -70, 260, 140, 20), 120, 60, k, -.25), '#000', { op: 0, ink: PAL.hot, sw: 3 }); push(); translate(120, 60); rotate(-.25); scale(k); scribble('NO', 0, 0, 100, PAL.hot, { sw: 3, br: 'marker' }); pop(); }
      if (o.count) { Ec(200, -150, 60, 60, PAL.butter, { ink: I, sw: .8 }); scribble('X' + o.count, 200, -150, 34, I, { sw: .9 }); }
    });
  }

  // SIGNATURE PAPER (leasePaper / signaturePaper: a form, lease or permission slip). anchor = centre, 520×700.
  // o.title ('FORM'), o.lines (signature lines, default 4, max 12), o.signed (how many are signed, default 0),
  // o.blank (index of the highlighted unsigned line, default = the first unsigned one), o.ring 0..1 (hot circle draws on around it)
  function leasePaper(x, y, s = 1, o = {}) {
    xf(x, y, s, o, () => {
      F(rectPts(-260, -350, 520, 700), '#FBF8F0', { ink: I, sw: 1.1 }); F([[180, -350], [260, -270], [180, -270]], '#E4DFD2', { ink: I, sw: .6 });
      scribble(o.title ?? 'FORM', 0, -300, 46, I, { sw: 1.2 }); for (let k = 0; k < 4; k++) ln([[-220, -240 + k * 22], [200 - hash(k) * 60, -240 + k * 22]], .3, '#9A9AA8', 'ink', 0);
      const nl = Math.max(1, Math.min(12, Math.round(N(o.lines, 4)))), ns = Math.max(0, Math.min(nl, Math.round(N(o.signed, 0))));
      const bl = N(o.blank, ns < nl ? ns : -1), sp = Math.min(56, 440 / nl);
      // signed lines = the first `ns` lines that are not the highlighted blank one
      let left = ns;
      for (let i = 0; i < nl; i++) {
        const yy = -120 + i * sp; ln([[-200, yy], [140, yy]], .5, '#5A5A68', 'ink', 0); scribble('X', -222, yy - 12, 16, '#9A9AA0', { sw: .4 });
        if (i !== bl && left > 0) { left--; const pts = []; for (let k = 0; k <= 10; k++) pts.push([-180 + k * (20 + hash(i * 3) * 10), yy - 14 - Math.sin(k * 1.7 + i) * 12 * (.6 + hash(i + k) * .6)]); ln(pts, .7, ['#2A3A8A', '#2A2230'][i % 2], 'pen', .5); }
      }
      if (o.ring && bl >= 0 && bl < nl) { const yy = -120 + bl * sp - 12, k = clamp(o.ring), pts = []; for (let i = 0; i <= 30 * k; i++) { const a = -Math.PI * .6 + i / 30 * TAU * 1.05; pts.push([-30 + Math.cos(a) * 220, yy + Math.sin(a) * 40]); } if (pts.length > 2) ln(pts, 2.2, PAL.hot, 'marker', .5); }
    });
  }

  // BIRTHDAY CAKE. anchor = bottom-centre (plate), ~360×300 + candles. o.candles (n, default 1), o.lit (true; flames flicker),
  // o.sparkles (true: sprinkles on top), o.col (frosting, default vanilla cream), o.num (number candles instead, e.g. '21')
  function birthdayCake(x, y, s = 1, o = {}) {
    const t = N(o.t, TT()), fc = o.col || '#FFF3D6';
    xf(x, y, s, o, () => {
      Ec(0, 0, 200, 34, '#E4E6EC', { ink: I, sw: 1 });
      F([[-160, -10], [-160, -170], [160, -170], [160, -10]], fc, { ink: I, sw: 1.1 }); Ec(0, -10, 160, 26, fc); Ec(0, -170, 160, 30, shade(fc, .3), { ink: I, sw: .9 });
      for (let k = 0; k < 9; k++) { const xx = -150 + k * 37; F([[xx - 16, -168], [xx + 16, -168], [xx + 10, -130 - (k % 2) * 16], [xx, -120 - (k % 3) * 10], [xx - 10, -134]], '#F3A7B5', { curv: .5, op: 230 }); }
      Rc(-160, -80, 320, 14, '#F3A7B5', { op: 200 });
      if (N(o.sparkles, true)) for (let k = 0; k < 26; k++) { const a = hash(k * 2.3) * TAU, rr = hash(k * 4.1) * 140; Rc(Math.cos(a) * rr - 4, -170 + Math.sin(a) * rr * .16 - 2, 9, 4, [PAL.hot, PAL.teal, PAL.butter, PAL.violet][k % 4]); }
      const cands = o.num ? [...String(o.num)] : Array.from({ length: N(o.candles, 1) }, () => '|');
      cands.forEach((c, i) => {
        const cx = (i - (cands.length - 1) / 2) * (o.num ? 74 : 46);
        if (o.num) { push(); translate(cx, -230); scribble(c, 2, 2, 80, I, { sw: 4.4 }); scribble(c, 0, 0, 80, PAL.hot, { sw: 3.4 }); pop(); }
        else { Rc(cx - 8, -260, 16, 90, ['#9CC8E8', '#F7D774', '#F3A7B5'][i % 3], { ink: I, sw: .5 }); for (let k = 0; k < 3; k++) ln([[cx - 8, -250 + k * 28], [cx + 8, -240 + k * 28]], .4, '#FFFFFF', 'ink', 0); }
        if (N(o.lit, true)) { const fl = .8 + .2 * Math.sin(t * 17 + i * 2) * Math.sin(t * 7 + i), fy = o.num ? -290 : -262; halo(cx, fy - 20, 70 * fl, '#FFD98E', 70, 3); F([[cx, fy - 52 * fl], [cx + 12, fy - 14], [cx, fy], [cx - 12, fy - 14]], '#FFC94A', { curv: .5 }); F([[cx, fy - 32 * fl], [cx + 5, fy - 10], [cx - 5, fy - 10]], '#FFFFFF', { curv: .5 }); }
      });
    });
  }

  // COVERED PLATE (savedPlate: a plate under a glass cover; o.note adds a sticky note). anchor = plate centre, ~300×200. o.lid 0..1 (lifts off, steam)
  function savedPlate(x, y, s = 1, o = {}) {
    const t = N(o.t, TT()), lid = clamp(N(o.lid, 0));
    xf(x, y, s, o, () => {
      Ec(0, 0, 150, 40, '#F6F1E6', { ink: I, sw: 1 }); Ec(0, -4, 120, 30, '#FFFFFF');
      if (lid > 0) { Ec(-40, -10, 44, 16, '#F1D7A6', { ink: I, sw: .4 }); Ec(30, -6, 40, 14, '#E9AE3C', { ink: I, sw: .4 }); steam(0, -40, t, 3, 140); }
      const ly = -lid * 220, lr = -lid * .5;
      push(); translate(lid * 120, ly); rotate(lr);
      F([[-118, 0], [-100, -70], [-40, -100], [40, -100], [100, -70], [118, 0]], '#CFE8EC', { op: 150, ink: I, sw: 1.1, curv: .4 }); Ec(0, -104, 18, 10, '#E4E6EC', { ink: I, sw: .6 });
      F([[-80, -60], [-50, -84], [-30, -60]], '#FFFFFF', { op: 140, curv: .5 });
      if (o.note) { F([[20, -70], [96, -64], [92, -16], [16, -22]], '#FFF27A', { ink: I, sw: .6 }); scribble(String(o.note), 56, -44, 18, I, { sw: .6 }); }
      pop();
    });
  }

  // BASKETBALL r≈60. o.spin
  function basketball(x, y, s = 1, o = {}) {
    xf(x, y, s, { ...o, rot: (o.rot || 0) + N(o.spin, 0) }, () => {
      Ec(0, 0, 60, 60, '#E8742E', { ink: I, sw: 1.1 }); ln([[-60, 0], [60, 0]], .9, I, 'ink', 0); ln([[0, -60], [0, 60]], .9, I, 'ink', 0);
      ln([[-42, -42], [-22, 0], [-42, 42]], .8, I, 'ink', .6); ln([[42, -42], [22, 0], [42, 42]], .8, I, 'ink', .6); Ec(-22, -26, 12, 8, '#FFFFFF', { op: 70, n: 8 });
    });
  }
  // FOOTBALL ~200×120. o.spin
  function football(x, y, s = 1, o = {}) {
    xf(x, y, s, { ...o, rot: (o.rot || 0) + N(o.spin, 0) }, () => {
      F([[-100, 0], [-60, -50], [0, -62], [60, -50], [100, 0], [60, 50], [0, 62], [-60, 50]], '#8A4A2A', { ink: I, sw: 1.1, curv: .6 });
      ln([[-30, 0], [30, 0]], 1, '#FFFFFF', 'ink', 0); for (let k = -2; k <= 2; k++) ln([[k * 12, -10], [k * 12, 10]], .8, '#FFFFFF', 'ink', 0);
      ln([[-74, -30], [-74, 30]], .9, '#FFFFFF', 'ink', .4); ln([[74, -30], [74, 30]], .9, '#FFFFFF', 'ink', .4);
    });
  }
  // SUITCASE (packed, upright) ~240×340, anchor bottom-centre. o.col, o.tag
  function suitcase(x, y, s = 1, o = {}) {
    xf(x, y, s, o, () => {
      RRc(-120, -320, 240, 300, 26, o.col || '#3E6FA8', { ink: I, sw: 1.1 }); for (let k = 0; k < 3; k++) ln([[-80 + k * 80, -310], [-80 + k * 80, -30]], .5, shade(o.col || '#3E6FA8', -.25), 'ink', 0);
      ln([[-40, -320], [-40, -420], [40, -420], [40, -320]], 1.6, '#2A2A34', 'ink', 0); Ec(-80, -10, 16, 16, '#1E1E24', { n: 8 }); Ec(80, -10, 16, 16, '#1E1E24', { n: 8 });
      F([[60, -300], [110, -290], [100, -230], [50, -240]], '#F7D774', { ink: I, sw: .5 });
    });
  }
  // BIRTHDAY CARD (sage "IT'S YOUR BIRTHDAY!" card with cartoon pandas, signed inside). anchor = centre, 300×420. o.open 0..1
  function birthdayCard(x, y, s = 1, o = {}) {
    xf(x, y, s, o, () => {
      const op = clamp(N(o.open, 0));
      if (op > 0) { F(rectPts(-150 - 300 * op, -210, 300 * op, 420), '#F6F1E6', { ink: I, sw: 1 }); for (let k = 0; k < 9; k++) { const sx = -150 - 300 * op + 30 + hash(k) * 220 * op, sy = -170 + k * 40; ln([[sx, sy], [sx + 30 * op, sy - 8], [sx + 60 * op, sy + 4]], .6, ['#2A3A8A', '#2A2230', '#C8414A'][k % 3], 'pen', .5); } }
      F(rectPts(-150, -210, 300, 420), '#9DB8A6', { ink: I, sw: 1.1 });
      scribble("IT'S YOUR", 0, -170, 24, '#2A2230', { sw: .6 }); scribble('BIRTHDAY!', 0, -138, 30, '#2A2230', { sw: .8 });
      [[-30, -40], [30, 50], [-20, 140]].forEach(([px, py], i) => { Ec(px, py, 40, 28, '#FFFFFF', { ink: I, sw: .7 }); Ec(px - 26, py - 22, 12, 12, I, { n: 8 }); Ec(px + 26, py - 22, 12, 12, I, { n: 8 }); Ec(px - 12, py - 4, 8, 6, I, { n: 6 }); Ec(px + 12, py - 4, 8, 6, I, { n: 6 }); });
      for (let k = 0; k < 14; k++) F(xform([[0, -7], [6, 5], [-6, 5]], hash(k * 3) > .5 ? 110 + hash(k) * 30 : -130 + hash(k) * 30, -100 + hash(k * 7) * 280, 1, k), ['#2A2230', '#F2876A', '#F7D774'][k % 3]);
    });
  }
  // BAND-AID (adhesive bandage) ~120×44. o.col (default hot)
  function bandaid(x, y, s = 1, o = {}) { xf(x, y, s, o, () => { RRc(-60, -22, 120, 44, 20, o.col || PAL.hot, { ink: I, sw: .8 }); Rc(-20, -16, 40, 32, '#FFFFFF', { op: 160 }); for (let k = 0; k < 6; k++) Ec(-44 + (k % 2) * 8 + (k > 2 ? 80 : 0), -8 + (k % 3) * 8, 2, 2, '#FFFFFF', { n: 6, op: 200 }); }); }

  const SETS2_ = { homeRoomSet, homeStairsSet, kitchenSet, diningRoomSet, debateSet, gymSet, scienceFairSet, classroomSet, bandRoomSet, courtSet, footballFieldSet, clinicSet, dormSet, apartmentSet, videoCallSet, oceanBalconySet, officeSet, bridgeDriveSet, featureWallSet, hackerHouseSet, highriseSet, airportGateSet, takeoutShopSet, conferenceSet };
  const PROPS2_ = { ribbon, trophy, briefcaseMachine, gadgetCase: briefcaseMachine, walkingBoot, trifold, placard, confettiLaptop, takeoutBag, backpack, rejectionEmail, leasePaper, signaturePaper: leasePaper, birthdayCake, savedPlate, basketball, football, suitcase, birthdayCard, bandaid, zoomGrid };
  // ---------- exports ----------
  const SETS_ = { cafeSet, campusSet, cityNightSet, bedroomNightSet, roadSet, bowlingSet, skySet, paperVoid, dateNightSet };
  const PROPS_ = { phone, laptop, flowers, boba, froyo, iceCream, pizza, golf, bowlingBall, bowlingPins, car, blanket, hoodie, calendarPages, clock, heart, stringLights, meterProp, sparkle, cloud, chatBubbleShape, mic, lehengaSwirl, pirateHat, sailorHat };
  Object.assign(SETS_, SETS2_); Object.assign(PROPS_, PROPS2_);
  Object.assign(window, SETS_, PROPS_, { SETS: SETS_, PROPS: PROPS_, scribble, halo, skyBands, steam, blobPerson });
})();
