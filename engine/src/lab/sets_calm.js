// lab bench: every set with o.calm:'top' (room for big lyric type) + returned anchors marked as hot dots.
labShot((t) => {
  const L = [homeRoomSet, homeStairsSet, kitchenSet, diningRoomSet, debateSet, gymSet, scienceFairSet, classroomSet, bandRoomSet, courtSet,
    footballFieldSet, clinicSet, dormSet, apartmentSet, videoCallSet, oceanBalconySet, officeSet, bridgeDriveSet, featureWallSet, hackerHouseSet, highriseSet, airportGateSet, takeoutShopSet, conferenceSet];
  const i = Math.min(L.length - 1, Math.floor(t));
  bg(PAL.paper); const r = L[i](t, { calm: 'top' }) || {};
  for (const k in r) { const v = r[k]; if (Array.isArray(v) && typeof v[0] === 'number') { paint(ellPts(v[0], v[1], 14, 14, 12), { wash: PAL.hot, ink: PAL.ink, sw: .6 }); letter(k, v[0], v[1] - 30, 30, PAL.hot, {}); } }
}, { karaoke: 'none', meter: false, stamp: false });
