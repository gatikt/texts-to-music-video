// c01_verse1 — 0 → 10 s. Intro bar + verse 1 (lines 0–3). Alex (17, PJs) in bed at 2:04 AM, texts the group chat.
// Receipts (all in data/dms.db): 'anyone up??' (Alex), 'no' (Marco), 'u literally just replied' (Alex).
(() => {
  const U = 44;
  // A · 0–2: the bedroom, the clock, the phone glow
  function shotRoom(t, lt) {
    const z = kf(lt, [[0, 1.0], [2, 1.08]]);
    camBegin(540, 1000, z, 0);
    bedroomNightSet(t, { clock: '2:04', glow: { x: 560, y: 1330, r: 300 } });
    me(560, 1250, U, { age: 17, outfit: 'pj', sit: true, t, ...move('text', t), legL: .2 });
    camEnd();
    const k = seg(lt, .5, .8);
    letter('2:04 AM', 540, 470, 150, PAL.butter, { font: 'slab', weight: 900, stretch: 'condensed', shadow: PAL.hot, pop: k, rot: -.05, screen: true });
  }
  // B · 2–6: close-up, the thumbs, the first text
  function shotText(t, lt) {
    const [sx, sy] = shakeXY(t, 6 * pulse(t, 10) * seg(t, 4, 4.1));
    camBegin(540 + sx, 860 + sy, kf(lt, [[0, 1.55], [4, 1.75]]), -.02);
    bedroomNightSet(t, { clock: '2:04', glow: { x: 560, y: 1330, r: 300 } });
    me(560, 1250, U, { age: 17, outfit: 'pj', sit: true, t, ...move('text', t), eyes: lt > 1.9 ? 'wide' : 'down', glowFace: 1 });
    camEnd();
    bigLyric(t, 0, { x: 70, y: 330, size: 120, color: PAL.cream, shadow: PAL.hot, maxW: 940 });
    receipt('anyone up??', 'me', 1030, 1480, { pop: seg(t, 4.0, 4.3), size: 56, rot: -.03 });
    sfx('SEND', 820, 1640, 60, PAL.hot, t - 4.05, { life: 1.1 });
  }
  // C · 6–10: the chat itself, filling the frame
  function shotChat(t, lt) {
    paperVoid(t, { tint: PAL.night, tintOp: 255, corners: 'tr-bl', dot: PAL.indigo, dot2: PAL.violet });
    const r = phone(540, 900, 3.0, { screen: 'chat', t, halo: false, rot: kf(lt, [[0, .04], [4, -.02]]) });
    tsLabel('2 AM Club', 540, r.y + 128, { size: 34, color: PAL.ink });
    const L = r.x + 30, R = r.x + r.w - 30;
    receipt('anyone up??', 'me', R, r.y + 180, { size: 42 });
    receipt('no', 'her', L, r.y + 290, { pop: seg(t, 7.0, 7.25), size: 42 });            // Marco
    receipt('u literally just replied', 'me', R, r.y + 400, { pop: seg(t, 8.0, 8.25), size: 42, maxW: r.w - 80 });
    letter('Read by 7', R - 10, r.y + 540, 34, '#8A8A8E', { font: 'sys', weight: 600, shadow: false, align: 'right', pop: seg(t, 9.0, 9.2) });
    // Alex peeking up from the bottom edge
    me(170, 1600 + 160 * (1 - ease(seg(lt, 0, .6))), 34, { age: 17, outfit: 'pj', t, bust: true, eyes: t > 8.2 ? 'side' : 'normal', look: .8, mouth: t > 8.2 ? 'flat' : 'smile' });
    sfx('?!', 250, 1150, 90, PAL.hot, t - 7.05, { life: .9 });
  }
  chapter('c01_verse1', 0, 10, [[0, shotRoom, { karaoke: 'none' }], [2, shotText, { karaoke: 'none' }], [6, shotChat]]);
})();
