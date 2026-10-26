// lab bench: every place set. t ∈ [i, i+1) shows variant i (see list).
labShot((t) => {
  const V = [
    () => debateSet(t, {}),
    () => gymSet(t, { arc: frac(t) * 1.2 }),
    () => scienceFairSet(t, { gadget: true, spark: .6 }),
    () => scienceFairSet(t, { mode: 'hall', showcase: true, dream: true }),
    () => classroomSet(t, { kind: 'bio' }),
    () => classroomSet(t, { kind: 'test', buzz: 1 }),
    () => bandRoomSet(t, {}),
    () => courtSet(t, {}),
    () => footballFieldSet(t, {}),
    () => footballFieldSet(t, { mode: 'paper', zoom: true }),
    () => clinicSet(t, {}),
    () => dormSet(t, { paper: true }),
    () => dormSet(t, { time: 'day' }),
    () => apartmentSet(t, { cake: true, card: true }),
    () => videoCallSet(t, {}),
    () => oceanBalconySet(t, {}),
    () => oceanBalconySet(t, { time: 'day' }),
    () => officeSet(t, {}),
    () => officeSet(t, { view: 'stage', prod: frac(t) }),
    () => bridgeDriveSet(t, {}),
    () => bridgeDriveSet(t, { view: 'wide' }),
    () => bridgeDriveSet(t, { view: 'wide', time: 'golden' }),
    () => featureWallSet(t, {}),
    () => hackerHouseSet(t, {}),
    () => highriseSet(t, {}),
    () => highriseSet(t, { time: 'night' }),
    () => airportGateSet(t, {}),
    () => takeoutShopSet(t, {}),
    () => conferenceSet(t, {}),
    () => cafeSet(t, {}),
    () => campusSet(t, { time: 'dusk' }),
    () => cityNightSet(t, {}),
  ];
  const i = Math.min(V.length - 1, Math.floor(t));
  bg(PAL.paper); V[i]();
}, { karaoke: 'none', meter: false, stamp: false });
