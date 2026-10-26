// story.js — project-owned HUD config + story dates (the director's file). Loaded after the engine, before the chapters.
// Every date/time below is the real timestamp of the message on screen in data/dms.db (here: the fake demo DB).
HUD.birthday = [2006, 1, 1];        // [YYYY, M, D] the (made-up) protagonist's birthday → auto 'AGE n' line on the stamp
HUD.label = 'MSGS SENT';
storyKeys([
  // c01 verse 1 — 2:04 AM, the first text
  [0, '2024-03-15', '2:04 AM', { label: 'GROUP CHAT' }],
  [7.0, '2024-03-15', '2:04 AM', { label: '2 AM CLUB' }],
  [8.0, '2024-03-15', '2:05 AM', { label: '2 AM CLUB' }],
  // c02 chorus — everyone is awake
  [10.0, '2024-03-15', '2:06 AM', { label: '2 AM CLUB' }],
  [14.0, '2024-03-15', '2:08 AM', { label: '2 AM CLUB' }],
  // c03 verse 2 — the slice, the meme, the sunrise, Mom
  [18.0, '2024-03-15', '2:10 AM', { label: 'KITCHEN' }],
  [20.0, '2024-03-15', '2:20 AM', { label: 'THE MEME' }],
  [22.0, '2024-03-15', '6:52 AM', { label: 'SUNRISE' }],
  [24.0, '2024-03-15', '7:05 AM', { label: 'MOM' }],
  [26.0, '2024-03-15', '6:52 AM', { label: 'GOODNIGHTS' }],
  [28.0, '2024-03-16', '1:58 AM', { label: 'NEXT NIGHT' }],
]);
