"""Parse an Instagram HTML message export into clean, chronological JSON + text.

usage: python3 -I scripts/ig_clean.py <export_root> <out_dir> [--tz America/New_York] [--export-utc-offset 0]

Get the export from Instagram: Settings > Accounts Center > Download your information > Messages, HTML format.
Writes <out_dir>/ig_clean.json, <out_dir>/index.tsv and <out_dir>/threads/<thread>.txt.
--tz: your local timezone (IANA name); timestamps are converted into it. Default: $T2MV_TZ or UTC.
--export-utc-offset: the fixed UTC offset (hours) the HTML export prints its times in. Default 0. Exports may print
  a fixed regional *standard* time all year regardless of DST; check a message you remember and adjust if needed."""
import sys, os, re, json, glob, html, argparse
from html.parser import HTMLParser
from datetime import datetime

ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
ap.add_argument('export_root'); ap.add_argument('out_dir')
ap.add_argument('--tz', default=os.environ.get('T2MV_TZ', 'UTC'))
ap.add_argument('--export-utc-offset', type=float, default=0.0)
A = ap.parse_args()
root, out = os.path.expanduser(A.export_root), A.out_dir
MSG = next((d for d in (os.path.join(root, 'your_instagram_activity', 'messages'), os.path.join(root, 'messages'))
            if os.path.isdir(d)), None)
if not MSG: sys.exit(f'no messages/ folder found under {root} (expected your_instagram_activity/messages)')
os.makedirs(os.path.join(out, 'threads'), exist_ok=True)

class P(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title = None; self.msgs = []; self.cur = None
        self.depth = 0; self.mdepth = None; self.mode = None; self.buf = []
        self.in_h1 = False; self.in_li = False
    def handle_starttag(self, tag, a):
        a = dict(a); cls = a.get('class', '') or ''
        if tag == 'div': self.depth += 1
        if tag == 'h1': self.in_h1 = True; self.buf = []
        if tag == 'div' and 'pam' in cls and '_a6-g' in cls:
            self.cur = {'who': '', 'parts': [], 'react': [], 'links': [], 'media': [], 't': ''}
            self.mdepth = self.depth
        if self.cur is None: return
        if tag == 'h2': self.mode = 'who'; self.buf = []
        elif tag == 'div' and '_a6-o' in cls: self.mode = 't'; self.buf = []
        elif tag == 'li': self.in_li = True; self.buf = []
        elif tag == 'a' and a.get('href'): self.cur['links'].append(a['href'])
        elif tag in ('img', 'video', 'audio', 'source') and a.get('src'):
            src = a['src']
            if not src.startswith('files/'): self.cur['media'].append(src)
    def handle_endtag(self, tag):
        if tag == 'h1' and self.in_h1:
            self.in_h1 = False; self.title = ''.join(self.buf).strip()
        if self.cur is not None:
            if tag == 'h2' and self.mode == 'who':
                self.cur['who'] = ''.join(self.buf).strip(); self.mode = None
            elif tag == 'div' and self.mode == 't':
                self.cur['t'] = ''.join(self.buf).strip(); self.mode = None
            elif tag == 'li' and self.in_li:
                self.cur['react'].append(''.join(self.buf).strip()); self.in_li = False
        if tag == 'div':
            if self.cur is not None and self.depth == self.mdepth:
                self.msgs.append(self.cur); self.cur = None; self.mdepth = None
            self.depth -= 1
    def handle_data(self, d):
        if self.in_h1 or self.mode in ('who', 't') or self.in_li:
            self.buf.append(d)
        elif self.cur is not None and self.mode is None:
            if d.strip(): self.cur['parts'].append(d.strip())

from datetime import timezone, timedelta
from zoneinfo import ZoneInfo
EXPORT_TZ = timezone(timedelta(hours=A.export_utc_offset))
LOCAL_TZ = ZoneInfo(A.tz)
def parse_time(t):
    for f in ('%b %d, %Y %I:%M %p', '%b %d, %Y, %I:%M %p'):
        try:
            d = datetime.strptime(t.replace('\u202f', ' '), f)
            return d.replace(tzinfo=EXPORT_TZ).astimezone(LOCAL_TZ).replace(tzinfo=None)
        except ValueError: pass
    return None

def kind_of(text, media, links):
    if re.match(r'^(Liked a message|Reacted .+ to your message ?)$', text): return 'reaction'
    if text.endswith(' sent an attachment.') or text == 'You sent an attachment.': return 'attachment'
    if 'unsent a message' in text: return 'unsent'
    if media and not text: return 'media'
    if links and not text: return 'link'
    if not text: return 'empty'  # content Instagram left out of the export (stickers, deleted shares, voice notes)
    return 'text'

threads = []; seen_total = dupes_total = 0
for box in ('inbox', 'message_requests'):
    for d in sorted(glob.glob(os.path.join(MSG, box, '*'))):
        files = sorted(glob.glob(os.path.join(d, 'message_*.html')),
                       key=lambda f: int(re.search(r'message_(\d+)', f).group(1)))
        if not files: continue
        title = None; rows = []
        # message_1 is newest; each file lists newest first -> walk files high->low and reverse rows
        for f in reversed(files):
            p = P(); p.feed(open(f, encoding='utf-8').read())
            title = title or p.title
            rows.extend(reversed(p.msgs))
        msgs = []; participants = []
        for m in rows:
            if not m['t'] and m['who'].startswith('Participants:'):
                participants = [x.strip() for x in re.split(r',| and ', m['who'][len('Participants:'):]) if x.strip()]
                continue
            dt = parse_time(m['t'])
            if dt is None and not m['t']: continue  # header rows (group invite links) with no timestamp
            text = ' '.join(x for x in m['parts'] if x not in (m['who'],)).strip()
            text = re.sub(r'\s+', ' ', text)
            links = [l for l in m['links'] if not l.startswith('files/')]
            media = [os.path.basename(x) for x in m['media']]
            seen_total += 1
            msgs.append({'t': dt.strftime('%Y-%m-%d %H:%M') if dt else m['t'],
                         'who': m['who'], 'kind': kind_of(text, media, links),
                         'text': text, 'react': [r for r in m['react'] if r],
                         'links': links, 'media': media})
        slug = os.path.basename(d)
        people = sorted({m['who'] for m in msgs if m['who']})
        threads.append({'id': slug, 'box': box, 'title': title or slug, 'people': people, 'participants': participants,
                        'n': len(msgs), 'first': msgs[0]['t'] if msgs else '',
                        'last': msgs[-1]['t'] if msgs else '', 'msgs': msgs})
        with open(os.path.join(out, 'threads', slug + '.txt'), 'w', encoding='utf-8') as fh:
            fh.write(f'# {title} ({box}) — {len(msgs)} messages\n')
            for m in msgs:
                extra = ''
                if m['media']: extra += f" [{len(m['media'])} media]"
                if m['links'] and m['kind'] != 'text': extra += ' ' + ' '.join(m['links'][:2])
                if m['react']: extra += ' {' + ', '.join(m['react']) + '}'
                tag = '' if m['kind'] == 'text' else f"({m['kind']}) "
                fh.write(f"{m['t']} {m['who']}: {tag}{m['text']}{extra}\n")

json.dump(threads, open(os.path.join(out, 'ig_clean.json'), 'w', encoding='utf-8'), ensure_ascii=False)
with open(os.path.join(out, 'index.tsv'), 'w', encoding='utf-8') as fh:
    fh.write('id\tbox\ttitle\tmessages\tfirst\tlast\tpeople\n')
    for t in sorted(threads, key=lambda t: -t['n']):
        fh.write(f"{t['id']}\t{t['box']}\t{t['title']}\t{t['n']}\t{t['first']}\t{t['last']}\t{'; '.join(t['people'])}\n")
print('threads', len(threads), 'messages', sum(t['n'] for t in threads))
