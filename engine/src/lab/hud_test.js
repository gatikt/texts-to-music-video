// lab: HUD odometer + stamp test (never ships). Uses whatever src/msg_data.js the project has.
HUD.birthday = [2000, 1, 1];   // [Y, M (1-12), D] placeholder
STORY_DATES.length = 0;   // replace the project's own keys instead of appending to them
storyKeys([
  [0, '2024-01-01', '3:00 PM'],
  [2, '2024-03-01', '2:05 AM', { label: 'LABEL TEST' }],
  [4, '2024-07-01', null, 'roll'],
  [8, '2024-09-01', null, { label: 'NEW PLACE' }],
  [10, '2025-01-01', null, { roll: true }],
  [12, '2025-03-10', '11:59 PM', { age: 'AGE OVERRIDE' }],
  ['bad', 'nope'], [14, '2025-06-01', '8:30 AM'],
]);
labShot((t) => { bg(PAL.butter); letter('t=' + t.toFixed(2) + '  ' + Math.round(meterAt(t)), W / 2, H / 2, 70, PAL.ink); }, { karaoke: 'none' });
