#!/usr/bin/env bash
# Download a Suno song from its share link and extract the audio.
# SUPERSEDED by `node suno/suno.mjs fetch` (used by `bin/t2mv suno <name> fetch`); kept as a dependency-free fallback.
# usage: scripts/suno_fetch.sh https://suno.com/s/XXXXXXXX  <out_dir>
# Writes <out_dir>/suno-share.mp4, song.m4a (original audio), song.wav (44.1 kHz for analysis).
# Note: the cdn mp4 can return 403 for a few minutes after a song is shared/created — this polls until it's ready.
set -euo pipefail
if [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ] || [ $# -lt 1 ]; then sed -n 2,6p "$0"; exit 0; fi
SHARE="$1"; OUT="${2:-.}"; UA="Mozilla/5.0"
mkdir -p "$OUT"; cd "$OUT"
# 1) share link -> song UUID (redirect target, or the first UUID in the page)
ID=$(curl -sIL -A "$UA" "$SHARE" | grep -io 'location: .*/song/[0-9a-f-]\{36\}' | grep -o '[0-9a-f-]\{36\}' | tail -1 || true)
[ -z "$ID" ] && ID=$(curl -sL -A "$UA" "$SHARE" | grep -o '[0-9a-f]\{8\}-[0-9a-f]\{4\}-[0-9a-f]\{4\}-[0-9a-f]\{4\}-[0-9a-f]\{12\}' | head -1)
[ -z "$ID" ] && { echo "could not resolve song id from $SHARE" >&2; exit 1; }
echo "song id: $ID"
U="https://cdn1.suno.ai/$ID.mp4"
# 2) poll until the share video exists (up to 10 min)
for i in $(seq 1 40); do c=$(curl -s -o /dev/null -w "%{http_code}" -A "$UA" "$U"); [ "$c" = 200 ] && break; echo "not ready ($c), retry $i"; sleep 15; done
curl -sL --max-time 300 -A "$UA" -o suno-share.mp4 "$U"
ffprobe -v error -show_entries format=duration -of csv=p=0 suno-share.mp4
ffmpeg -v error -y -i suno-share.mp4 -vn -c:a copy song.m4a
ffmpeg -v error -y -i suno-share.mp4 -vn -ar 44100 song.wav
echo "ok: $OUT/song.m4a, $OUT/song.wav"
