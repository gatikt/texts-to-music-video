# Export photos from Messages (read-only) for look/setting research.
# usage: python3 tools/chat_photos.py --chat "Family group" [--from 2024-11-01] [--to 2024-12-01] [--limit 200]
#   --chat matches chat display name OR handle (substring, case-insensitive). Use --list to list chats.
# Writes photos/orig/<tag>_NNN.jpg (1600px), photos/thumbs/, photos/index.txt (file|date|from_me|chat) and a labelled
# contact sheet photos/sheet_<tag>_K.jpg (48 per sheet). Then Read the sheet; print riso versions with tools/print_photo.py.
import argparse, os, re, sqlite3, subprocess, sys
p = argparse.ArgumentParser(); p.add_argument('--chat'); p.add_argument('--from', dest='f'); p.add_argument('--to'); p.add_argument('--limit', type=int, default=300); p.add_argument('--list', action='store_true')
a = p.parse_args()
db = sqlite3.connect(f"file:{os.path.expanduser('~/Library/Messages/chat.db')}?mode=ro", uri=True)
if a.list:
    for r in db.execute("select c.display_name, c.chat_identifier, count(*) from chat c join chat_message_join j on j.chat_id=c.ROWID join message_attachment_join maj on maj.message_id=j.message_id group by c.ROWID order by 3 desc limit 80"): print(r)
    sys.exit()
q = """select datetime(m.date/1000000000+978307200,'unixepoch','localtime'), m.is_from_me, a.filename, coalesce(c.display_name,c.chat_identifier)
from message m join chat_message_join cmj on cmj.message_id=m.ROWID join chat c on c.ROWID=cmj.chat_id
join message_attachment_join maj on maj.message_id=m.ROWID join attachment a on a.ROWID=maj.attachment_id
where (lower(c.display_name) like ? or lower(c.chat_identifier) like ?) and a.mime_type like 'image/%'"""
args = [f"%{a.chat.lower()}%"] * 2
if a.f: q += " and datetime(m.date/1000000000+978307200,'unixepoch','localtime') >= ?"; args.append(a.f)
if a.to: q += " and datetime(m.date/1000000000+978307200,'unixepoch','localtime') < ?"; args.append(a.to)
rows = db.execute(q + f" order by m.date limit {a.limit}", args).fetchall()
tag = re.sub(r'[^a-z0-9]+', '', a.chat.lower())[:12] + (('_' + a.f[:7].replace('-', '')) if a.f else '')
os.makedirs('photos/orig', exist_ok=True); os.makedirs('photos/thumbs', exist_ok=True)
done = []
for i, (d, me, f, chat) in enumerate(rows):
    src = os.path.expanduser(f or '')
    if not os.path.exists(src): continue
    n = f"{tag}_{i:03d}"; o = f"photos/orig/{n}.jpg"
    if subprocess.run(['sips', '-s', 'format', 'jpeg', '-Z', '1600', src, '--out', o], capture_output=True).returncode: continue
    subprocess.run(['sips', '-Z', '360', o, '--out', f"photos/thumbs/{n}.jpg"], capture_output=True)
    done.append((n, d, me, chat)); open('photos/index.txt', 'a').write(f"{n}|{d}|{me}|{chat}\n")
from PIL import Image, ImageDraw
for si in range(0, len(done), 48):
    ch = done[si:si + 48]; S = Image.new('RGB', (6 * 300, 8 * 330), 'white'); dr = ImageDraw.Draw(S)
    for k, (n, d, me, chat) in enumerate(ch):
        im = Image.open(f"photos/thumbs/{n}.jpg"); im.thumbnail((290, 290)); x, y = (k % 6) * 300, (k // 6) * 330
        S.paste(im, (x + 5, y + 5)); dr.text((x + 6, y + 300), f"{n} {d[:16]} {'ME' if me else 'THEM'}", fill='black')
    S.save(f"photos/sheet_{tag}_{si // 48 + 1}.jpg", quality=85)
print(f"{len(done)} photos → photos/orig/{tag}_*.jpg, sheets photos/sheet_{tag}_*.jpg")
