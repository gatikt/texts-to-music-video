// c03_verse2 — 18 → 30 s. Verse 2 (lines 8–11) + chorus tag (12–13): the cold pizza, the meme, sunrise, Mom, the goodnights.
// Receipts (data/dms.db): 'ok but who ate the last slice' (Marco), 'it was cold anyway' (Alex), 'LMAOOO' (Marco),
// 'ok goodnight for real' (Alex), 'Why is your light still on' (Mom), 'goodnight' (Priya/Marco/Jules), 'wait one more thing' (Alex), 'NO' (Sam).
(() => {
  const U = 40;
  // A · 18–22: the kitchen at 2:10 AM, one slice left
  function shotKitchen(t, lt) {
    camBegin(540, 1000, kf(lt, [[0, 1.0], [4, 1.1]]), 0);
    const k = kitchenSet(t, { time: 'evening', phone: false, cooking: false });
    pizza(560, k.island[1] - 30, .8, { missing: 5 });
    me(860, 1560, U, { age: 17, outfit: 'pj', t, holdR: 'phone', handR: [1.2, -7.4], eyes: t > 19.0 ? 'side' : 'normal', look: -.8, mouth: t > 19 ? 'smirk' : 'smile' });
    camEnd();
    receipt('ok but who ate the last slice', 'her', 40, 300, { pop: seg(t, 18.5, 18.75), size: 42, maxW: 760 });   // Marco
    receipt('it was cold anyway', 'me', 1040, 460, { pop: seg(t, 19.5, 19.75), size: 42 });
    receipt('LMAOOO', 'her', 60, 640, { pop: seg(t, 20.3, 20.5), size: 64, rot: -.06 });                          // Marco, after the meme
    sfx('MEME', 760, 760, 110, PAL.hot, t - 20.0, { life: 1.6, rot: .1 });
  }
  // B · 22–26: sunrise; the "goodnight for real"; Mom at 7:05
  function shotSunrise(t, lt) {
    skySet(t, { mood: 'sunrise', sun: ease(seg(lt, 0, 4)) * .9, clouds: 4, calm: 'top' });
    me(540, 1560, 46, { age: 17, outfit: 'pj', t, ...move('text', t), eyes: 'sleepy' });
    receipt('ok goodnight for real', 'me', 1040, 380, { pop: seg(t, 22.5, 22.75), size: 46 });
    if (t >= 24) {
      mom(170, 1500 + 120 * (1 - ease(seg(t, 24, 24.5))), 40, { t, bust: true, eyes: 'wide', brows: 'angry', mouth: 'O', emote: '!', emoteK: seg(t, 24.4, 24.7) });
      receipt('Why is your light still on', 'her', 40, 600, { pop: seg(t, 24.5, 24.75), size: 46 });             // Mom, 7:05 AM
      sfx('BUSTED', 760, 1000, 90, PAL.hot, t - 25.0, { life: 1 });
    }
  }
  // C · 26–30: tag — goodnight × 3, then it starts again
  function shotTag(t, lt) {
    bedroomNightSet(t, { clock: '6:52', glow: { x: 540, y: 1330, r: 320 }, lamp: true });
    me(540, 1260, 42, { age: 17, outfit: 'pj', sit: true, t, ...move('text', t), eyes: t > 29 ? 'wide' : 'down' });
    bigLyric(t, lt < 2 ? 12 : 13, { x: 60, y: 260, size: 120, color: PAL.cream, shadow: PAL.hot, maxW: 960 });
    [[26.5, 40, 640], [26.9, 120, 760], [27.3, 60, 880]].forEach(([at, x, y]) => receipt('goodnight', 'her', x, y, { pop: seg(t, at, at + .2), size: 40, alpha: 1 - seg(t, 28.6, 28.9) }));   // Priya, Marco, Jules
    receipt('wait one more thing', 'me', 1040, 1000, { pop: seg(t, 28.5, 28.75), size: 48 });
    receipt('NO', 'her', 60, 1080, { pop: seg(t, 29.0, 29.2), size: 70 });                                         // Sam
  }
  chapter('c03_verse2', 18, 30, [[18, shotKitchen], [22, shotSunrise], [26, shotTag, { karaoke: 'none' }]]);
})();
