// lab bench: everyday props. t ∈ [i, i+1) shows page i; frac(t) drives animation params.
labShot((t) => {
  const u = frac(t), pg = Math.floor(t);
  paperVoid(t, { corners: 'none' });
  if (pg === 0) {
    briefcaseMachine(300, 380, .8, { open: 0, t });
    briefcaseMachine(780, 420, .8, { open: 1, spark: u, t });
    briefcaseMachine(540, 1050, .85, { open: 1, cape: true, t });
    walkingBoot(250, 1700, .9, { t }); walkingBoot(700, 1650, .8, { off: true, t });
  } else if (pg === 1) {
    trifold(540, 700, 1.4, { title: 'MY PROJECT', t });
    trophy(220, 1150, .7, { kind: 'cup', place: '1ST', col: '#E9C97A' });
    trophy(560, 1000, .9, { kind: 'star', place: 'TOP', col: '#C9CCD6', cape: true, t });
    trophy(880, 1050, .7, { kind: 'medal', place: 'MVP', col: '#C98A4A' });
    ribbon(250, 1550, 1, { col: PAL.hot, place: 'BEST', droop: 1 }); ribbon(560, 1550, 1, { col: '#C98A4A', place: 'A+' }); ribbon(860, 1550, 1, { col: '#3E6FA8', place: '1ST' });
    placard(540, 1850, .9, {});
  } else if (pg === 2) {
    confettiLaptop(540, 600, 1.2, { burst: u, t });
    takeoutBag(250, 1250, 1.1, { t, steam: true }); backpack(780, 1050, 1, { t, tag: true });
    backpack(560, 1640, .7, { t, col: '#3E9C97', col2: '#2E6A6A', view: 'back' }); backpack(880, 1640, .7, { t, col: '#E9E2D2', col2: '#C9C2B0' });
    savedPlate(220, 1650, .9, { lid: u, t });
  } else if (pg === 3) {
    rejectionEmail(540, 330, 1.2, { stamp: u, count: 3 });
    leasePaper(300, 1150, 1, { signed: 2, ring: u });
    birthdayCake(780, 1000, 1, { num: '10', t }); birthdayCake(780, 1500, .8, { candles: 1, t });
    birthdayCard(300, 1700, .7, { open: u }); bandaid(780, 1780, 1.2, {});
  } else {
    const S = ['chat', 'zoom', 'record', 'contacts', 'email', 'confetti', 'results', 'glow', 'map'];
    S.forEach((s, i) => phone(160 + (i % 4) * 255, 300 + Math.floor(i / 4) * 420, 1.05, { screen: s, t, halo: false, notif: i === 3 ? 12 : 0 }));
    basketball(200, 1550, 1.4, { spin: t }); football(540, 1560, 1.2, { spin: t * .5 }); suitcase(860, 1720, 1, {});
    zoomGrid(120, 1680, 520, 200, t, { n: 6, whiz: true, hands: true, grey: 3 });
  }
}, { karaoke: 'none', meter: false, stamp: false });
