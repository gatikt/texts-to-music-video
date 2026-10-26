// lab bench: home sets. t ∈ [i, i+1) shows variant i.
labShot((t) => {
  const V = [
    () => homeRoomSet(t, { level: 0, time: 'night', suitcase: true }),
    () => homeRoomSet(t, { level: 1, time: 'day', laptop: 'zoom' }),
    () => homeRoomSet(t, { level: 3, time: 'dusk', dusk: .5 }),
    () => homeRoomSet(t, { level: 4, time: 'night', who: 'sibling' }),
    () => homeStairsSet(t, {}),
    () => homeStairsSet(t, { time: 'night', door: .8 }),
    () => kitchenSet(t, { plate: true, sofa: true }),
    () => kitchenSet(t, { view: 'nook', plate: true }),
    () => diningRoomSet(t, { plate: true, laptop: true }),
  ];
  const i = Math.min(V.length - 1, Math.floor(t));
  bg(PAL.paper); V[i]();
}, { karaoke: 'none', meter: false, stamp: false });
