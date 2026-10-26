// c02_chorus — 10 → 18 s. Chorus (lines 4–7): the whole crew is awake, dancing on a sunburst, phones out.
// Receipts (data/dms.db): 'why is everyone awake' (Priya), 'i have a test at 8' (Jules), 'same' (Sam), 'GROUP CHAT NEVER SLEEPS' (Alex).
(() => {
  function sunburst(t, c1, c2) {
    bg(c1);
    const n = 18, a0 = t * .15;
    for (let i = 0; i < n; i += 2) { const a = a0 + i / n * TAU, b = a0 + (i + 1) / n * TAU; paint([[540, 900], [540 + Math.cos(a) * 2200, 900 + Math.sin(a) * 2200], [540 + Math.cos(b) * 2200, 900 + Math.sin(b) * 2200]], { wash: c2, ink: null }); }
  }
  // A · 10–14: hook — the crew on a sunburst, the keyword slams in
  function shotCrew(t, lt) {
    const p = pulse(t, 8);
    camBegin(540, 960, 1 + .03 * p, 0);
    sunburst(t, PAL.butter, '#F9E39A');
    paint(rectPts(-80, 1570, 1240, 500), { wash: PAL.coral, ink: null });
    crew(540, 1580, 33, { t, style: 'dance', gap: 4.5, props: false, me: { eyes: 'happy', mouth: 'sing', age: 17, outfit: 'pj' },
      each: { friendA: { holdR: 'phone', handR: [1.6, -7] }, friendE: { holdR: 'phone', handR: [1.6, -7] } } });
    camEnd();
    bigLyric(t, 4, { x: 60, y: 300, size: 150, color: PAL.night, shadow: PAL.hot, maxW: 960, colors: { 2: PAL.hot, 3: PAL.hot } });
    receipt('why is everyone awake', 'her', 40, 700, { pop: seg(t, 12.0, 12.25), size: 40, rot: -.04 });   // Priya
    receipt('i have a test at 8', 'her', 80, 820, { pop: seg(t, 12.6, 12.85), size: 40, rot: .03 });      // Jules
    receipt('same', 'her', 700, 760, { pop: seg(t, 13.0, 13.2), size: 40, rot: .05 });                    // Sam
    receipt('same', 'her', 760, 860, { pop: seg(t, 13.5, 13.7), size: 40, rot: -.04 });                   // Dee
  }
  // B · 14–18: four phones, four faces, one message
  function shotPhones(t, lt) {
    sunburst(t, PAL.night, PAL.indigo);
    const who = ['friendA', 'friendC', 'friendD', 'friendE'];
    who.forEach((n, i) => {
      const x = 270 + (i % 2) * 540, y = 560 + Math.floor(i / 2) * 640, d = beatT(28 + i), pop = backOut(seg(t, d, d + .3));
      if (pop < .02) return;
      phone(x, y + 40, 1.6 * pop, { screen: 'glow', t, rot: (i % 2 ? .06 : -.06), halo: true });
      castMember(n, x, y + 40 + 9.3 * 22 * pop, 22 * pop, { headOnly: true, t, eyes: i % 2 ? 'sleepy' : 'wide', mouth: i === 1 ? 'O' : 'smile', glowFace: 1 });
    });
    const k = seg(t, 16.0, 16.3);
    receipt('GROUP CHAT NEVER SLEEPS', 'me', 1040, 860, { pop: k, size: 58, maxW: 1000 });
    if (k > 0) { const [sx, sy] = shakeXY(t, 10 * (1 - seg(t, 16, 16.6))); letter('!!', 120 + sx, 1500 + sy, 160, PAL.hot, { font: 'marker', pop: k, rot: -.15, screen: true }); }
  }
  chapter('c02_chorus', 10, 18, [[10, shotCrew, { karaoke: 'none' }], [14, shotPhones]]);
})();
