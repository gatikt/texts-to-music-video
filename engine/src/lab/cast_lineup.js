// lab: cast_lineup — pages by time: 0.5 scale lineup · 1.5 ME by age · 2.5/3.5/4.5 ME outfit catalogue · 5.5 MOM · 6.5 DAD + SIBLING
//      7.5 the crew · 8.5 head close-ups · 9.5 props & accessories · 10.5 poses · 11.5 tiny + kids
labShot((t) => {
  bg(PAL.paper);
  const page = Math.floor(t), lt = t;
  const lab = (s, x, y, sz = 26, c = PAL.ink) => letter(s, x, y, sz, c, { font: 'marker', shadow: false, align: 'center' });
  const grid = (items, cols, top = 110, H = 1760) => { const rows = Math.ceil(items.length / cols), rowH = H / rows, u = Math.min(rowH / 14.5, 1080 / cols / 6.2);
    items.forEach((it, i) => { const cx = 1080 / cols * (i % cols + .5), gy = top + rowH * (Math.floor(i / cols) + 1) - 44;
      castMember(it.n, cx, gy, u, { t: lt, ...it.o }); lab(it.l, cx, gy + 30, 22); }); };
  if (page === 0) {
    lab('SCALE LINEUP (same u)', 540, 70, 40);
    const r1 = [['sibling', { age: 8 }, 'S8'], ['me', { age: 12 }, 'ME12'], ['me', { age: 13 }, 'ME13'], ['sibling', { age: 14 }, 'S14'], ['mom', {}, 'MOM'], ['me', { age: 14 }, 'ME14'], ['me', { age: 15 }, 'ME15'], ['me', { age: 16 }, 'ME16'], ['me', { age: 17 }, 'ME17'], ['me', { age: 18 }, 'ME18'], ['me', { age: 19 }, 'ME19'], ['dad', {}, 'DAD']];
    const r2 = [['friendG', {}, 'G'], ['friendC', {}, 'C'], ['friendF', {}, 'F'], ['friendH', {}, 'H'], ['friendE', {}, 'E'], ['friendB', {}, 'B'], ['cofounder', {}, 'COF'], ['friendD', {}, 'D'], ['friendA', {}, 'A'], ['coworker', {}, 'COW'], ['grandpa', {}, 'GPA']];
    r1.forEach(([n, o, l], i) => { const x = 50 + i * 89; castMember(n, x, 860, 17.5, { t: lt, ...o }); lab(l, x, 890, 18); });
    r2.forEach(([n, o, l], i) => { const x = 60 + i * 96; castMember(n, x, 1640, 17.5, { t: lt, ...o }); lab(l, x, 1670, 16); });
    for (const yy of [860, 1640]) for (const k of [1, .8]) inkLine([[10, yy - 12.5 * 17.5 * k], [1070, yy - 12.5 * 17.5 * k]], .6, '#C9B9A0', 'pen');
  } else if (page === 1) {
    lab('ME BY AGE (default outfit)', 540, 70, 40);
    grid([12, 13, 14, 15, 16, 17, 18, 19].map(a => ({ n: 'me', o: { age: a }, l: 'AGE ' + a })), 4);
  } else if (page >= 2 && page <= 4) {
    // the wardrobe catalogue (any outfit works at any age; shown at a neutral age so the bench reads as a catalogue)
    const kidLooks = new Set(['kidhoodie', 'bball', 'debate', 'fair']);
    const all = ['tee', 'hoodie', 'kidhoodie', 'orangehoodie', 'bluehoodie', 'tealtee', 'cargo', 'zipcargo', 'pinktee', 'knit', 'launch', 'college',
      'chore', 'overshirt', 'puffer', 'bandaid', 'bomber', 'airport', 'aloha', 'pj', 'lounge', 'nighthoodie', 'naptee', 'debate',
      'fair', 'greysuit', 'greensuit', 'purplesuit', 'navyblazer', 'grad', 'bball', 'qb', 'drumline', 'boot', 'sprint', 'kurta', 'festive'].map(of => [of, kidLooks.has(of) ? 13 : null]);
    const sl = all.slice((page - 2) * 13, (page - 1) * 13);
    lab('ME OUTFITS ' + (page - 1) + '/3', 540, 60, 38);
    grid(sl.map(([of, a]) => ({ n: 'me', o: a ? { age: a, outfit: of } : { outfit: of }, l: of + (a ? ' @' + a : '') })), 4);
  } else if (page === 5) {
    lab('MOM', 540, 60, 40);
    grid(['home', 'apron', 'tunic', 'tealdress', 'pinksweater', 'dotdress', 'yellow', 'gown', 'salwar', 'zip'].map(of => ({ n: 'mom', o: { outfit: of }, l: of })), 4);
  } else if (page === 6) {
    lab('DAD + SIBLING', 540, 60, 40);
    grid([...['dadtee', 'polo', 'lavpolo', 'blazer', 'brownblazer', 'olive', 'floral'].map(of => ({ n: 'dad', o: { outfit: of }, l: 'dad ' + of })), { n: 'dad', o: { shades: true }, l: 'dad shades' },
      ...[[8], [10], [12], [14], [14, 'cape'], [14, 'zip'], [14, 'concert'], [14, 'formal']].map(([a, of]) => ({ n: 'sibling', o: { age: a, outfit: of }, l: 'S@' + a + (of ? ' ' + of : '') }))], 4);
  } else if (page === 7) {
    lab('THE CREW', 540, 60, 40);
    crew(540, 900, 17, { t: lt, gap: 8.4, me: { eyes: 'happy', mouth: 'grin' } });
    lab('crew() default line-up', 540, 940, 24);
    grid([['friendC', 'bowtie'], ['friendC', 'grad'], ['friendA', 'jumpsuit'], ['friendB', 'night'], ['cofounder', 'hoodie'], ['cofounder', 'tan'], ['cofounder', 'black'], ['coworker', 'black']].map(([n, of]) => ({ n, o: { outfit: of }, l: n + ' ' + of })), 4, 980, 900);
  } else if (page === 8) {
    lab('HEADS', 540, 60, 40);
    const Hd = [['me', { age: 12 }], ['me', { age: 14 }], ['me', { age: 16 }], ['me', { age: 17 }], ['me', { age: 19 }], ['mom', {}], ['dad', {}], ['sibling', { age: 14 }], ['sibling', { age: 8 }],
      ['friendC', {}], ['friendA', {}], ['friendB', {}], ['friendD', {}], ['friendF', {}], ['friendE', {}], ['cofounder', {}], ['coworker', {}], ['grandpa', {}], ['kid', { seed: 3 }], ['partner', {}]];
    Hd.forEach(([n, o], i) => { const cx = 1080 / 4 * (i % 4 + .5), gy = 400 + Math.floor(i / 4) * 330; castMember(n, cx, gy, 20, { t: lt, headOnly: true, ...o }); lab(n + (o.age ? ' ' + o.age : ''), cx, gy - 30, 20); });
  } else if (page === 9) {
    lab('PROPS & POSES', 540, 60, 40);
    const P = [['me', { outfit: 'navyblazer', holdBoth: 'briefcaseOpen', handL: [-1.0, -5.2], handR: [1.0, -5.2] }, 'briefcase (open)'], ['me', { holdBoth: 'plaque', handL: [-.7, -6.2], handR: [.7, -6.2], eyes: 'happy', mouth: 'grin' }, 'plaque'],
      ['friendC', { holdBoth: 'cake', handL: [-1.75, -5.3], handR: [1.75, -5.3] }, 'HBD cake'], ['sibling', { age: 14, ...move('hype', 1.2) }, 'hype'],
      ['dad', { holdR: 'takeout', shades: true, aR: -1.2 }, 'takeout bag'], ['friendE', { holdR: 'form', handR: [1.4, -6.4], strike: .8 }, 'form'], ['cofounder', { outfit: 'tan', holdR: 'toycar', handR: [1.6, -6.8] }, 'toy car'],
      ['me', { outfit: 'qb', hat: 'helmet', jerseyNum: '00', holdR: 'football', handR: [1.5, -7.6] }, 'qb + jerseyNum'], ['me', { backpack: '#5C5862', back: true }, 'backpack (back)'], ['mom', { outfit: 'apron', holdR: 'ladle', handR: [1.3, -7.2] }, 'ladle'],
      ['sibling', { outfit: 'grey', holdR: 'sign', handR: [1.6, -8.6], signText: 'GO\nTEAM', eyes: 'happy', mouth: 'grin' }, 'sign'], ['friendF', { hat: 'party', holdR: 'partyhorn', handR: [.7, -7.7], shirtText: 'HI' }, 'party + shirtText']];
    grid(P.map(([n, o, l]) => ({ n, o, l })), 4);
  } else if (page === 10) {
    lab('POSES / REGRESSION', 540, 60, 40);
    grid([{ n: 'me', o: { age: 13, outfit: 'debate', ...move('point', lt) }, l: 'point @13' }, { n: 'mom', o: { flip: true, ...move('wave', lt) }, l: 'mom flip wave' }, { n: 'dad', o: { back: true }, l: 'dad back' }, { n: 'sibling', o: { age: 14, run: lt * 2 }, l: 'sibling run' },
      { n: 'friendA', o: { sit: true, legL: .3 }, l: 'friendA sit' }, { n: 'friendB', o: { handRw: null, ...move('cheer', lt) }, l: 'friendB cheer' }, { n: 'friendD', o: { back: true }, l: 'friendD back' }, { n: 'cofounder', o: { turn: .6, look: .8 }, l: 'cofounder turn' },
      { n: 'mom', o: { back: true }, l: 'mom back' }, { n: 'me', o: { age: 17, outfit: 'pj', sit: true, ...move('text', lt) }, l: 'ME17 text sit' }, { n: 'me', o: {}, l: 'adult me' }, { n: 'partner', o: { outfit: 'sailor' }, l: 'partner' }], 4);
  } else if (page === 11) {
    lab('TINY + KIDS', 540, 60, 40);
    ['sibling', 'me', 'mom', 'dad', 'friendC', 'friendA', 'friendB', 'friendD', 'friendF', 'friendE', 'cofounder', 'coworker'].forEach((n, i) => { tiny(n, 60 + i * 88, 420, 10, { t: lt, age: n === 'me' ? 16 : undefined }); tiny(n, 60 + i * 88, 640, 10, { back: true }); });
    for (let i = 0; i < 12; i++) tiny('kid', 60 + i * 88, 860, 10, { seed: i, arms: i % 3 ? null : 'up', t: lt });
    for (let i = 0; i < 8; i++) castMember('kid', 80 + i * 132, 1350, 13, { seed: i, outfit: ['blazer', 'suit', 'tee', 'hoodie', 'jersey', 'blazer', 'suit', 'tee'][i], t: lt });
    for (let i = 0; i < 6; i++) castMember('kid', 110 + i * 172, 1800, 15, { seed: i + 20, age: 12 + (i % 4), t: lt });
  }
}, { karaoke: 'none', meter: false, stamp: false });
