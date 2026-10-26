#!/bin/sh
# make_song.sh — synthesize the demo's 30 s placeholder "song" with ffmpeg only (no samples, no network).
# 120 BPM (a beat every 0.5 s, a bar every 2 s), chords C – Am – F – G per bar:
#   kick on every beat · clap on beats 2 and 4 · bass on eighth notes (chord root) · synth chord stabs on the off-beats.
# The first bar is just kick + synth (intro). 1.5 s fade at the end. Output: song_cut.wav (44.1 kHz stereo) next to this script.
set -e
cd "$(dirname "$0")"
BAR='mod(floor(t/2),4)'
ROOT="if(eq($BAR,0),130.81,if(eq($BAR,1),110,if(eq($BAR,2),87.31,98)))"
F1="if(eq($BAR,0),261.63,if(eq($BAR,1),220,if(eq($BAR,2),174.61,196)))"
F2="if(eq($BAR,0),329.63,if(eq($BAR,1),261.63,if(eq($BAR,2),220,246.94)))"
F3="if(eq($BAR,0),392,if(eq($BAR,1),329.63,if(eq($BAR,2),261.63,293.66)))"
ON='gte(t,2)'
KICK='sin(2*PI*(50*mod(t,0.5)+4*(1-exp(-25*mod(t,0.5)))))*exp(-7*mod(t,0.5))*0.9'
CLAP="$ON*(2*random(4)-1)*(exp(-28*mod(t+0.5,1))+0.5*exp(-28*abs(mod(t+0.5,1)-0.012)))*0.32"
BASS="$ON*((2*mod(t*$ROOT,1)-1)*0.16+sin(2*PI*t*$ROOT/2)*0.22)*exp(-5*mod(t,0.25))"
SYN="(sin(2*PI*t*$F1)+sin(2*PI*t*$F2)+sin(2*PI*t*$F3)+0.4*sin(4*PI*t*$F3))*exp(-6*mod(t+0.25,0.5))*0.07"
EXPR="$KICK+$CLAP+$BASS+$SYN"
ffmpeg -y -loglevel error -f lavfi -i "aevalsrc=exprs='$EXPR':s=44100:d=30" \
  -af "highpass=f=30,alimiter=limit=0.9,afade=t=out:st=28.5:d=1.5" -ac 2 -c:a pcm_s16le song_cut.wav
echo "wrote $(pwd)/song_cut.wav"
