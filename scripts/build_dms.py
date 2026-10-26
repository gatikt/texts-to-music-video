"""Build a searchable, read-only-friendly SQLite database of iMessage + Instagram DMs.

usage: python3 -I scripts/build_dms.py --out data/dms.db --me "<your name>" [--ig ig_out/ig_clean.json]
                                       [--me-alias "<IG display name>" ...] [--chat-db ~/Library/Messages/chat.db]
                                       [--no-imessage] [--no-contacts]

--me is the name stored as `sender` (and is_me=1) for messages you sent. Default: $T2MV_ME.
--me-alias: extra Instagram display names that are also you (they are rewritten to --me).
iMessage needs Full Disk Access for your terminal (System Settings > Privacy & Security).
Contact names come from the macOS AddressBook (read-only)."""
import sys, os, re, glob, json, sqlite3, argparse
from datetime import datetime, timezone

ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
ap.add_argument('legacy', nargs='*', help=argparse.SUPPRESS)  # old form: <ig_clean.json> <out.db>
ap.add_argument('--out', help='output database path (overwritten)')
ap.add_argument('--ig', help='ig_clean.json from scripts/ig_clean.py (optional)')
ap.add_argument('--me', default=os.environ.get('T2MV_ME'), help='your sender name (default: $T2MV_ME)')
ap.add_argument('--me-alias', action='append', default=[], help='another name that is you (repeatable)')
ap.add_argument('--chat-db', default=os.path.expanduser('~/Library/Messages/chat.db'), help='iMessage chat.db path')
ap.add_argument('--no-imessage', action='store_true', help='skip iMessage (Instagram only)')
ap.add_argument('--no-contacts', action='store_true', help='do not read AddressBook names (handles stay raw)')
ap.add_argument('--session-gap', type=int, default=120, help='minutes of silence that start a new session')
A = ap.parse_args()
if A.legacy:
    if len(A.legacy) == 2 and not A.ig and not A.out: A.ig, A.out = A.legacy
    else: ap.error('unexpected positional arguments')
if not A.out: ap.error('--out is required')
if not A.me: ap.error('--me is required (or set T2MV_ME)')
IG_JSON, OUT, ME = A.ig, A.out, A.me
ME_NAMES = {ME, *A.me_alias}
SESSION_GAP_MIN = A.session_gap
HOME = os.path.expanduser('~')

# ---------- contacts ----------
def last10(s): d = re.sub(r'\D', '', s or ''); return d[-10:] if len(d) >= 10 else d
names = {}
for f in ([] if A.no_contacts else glob.glob(f'{HOME}/Library/Application Support/AddressBook/Sources/*/AddressBook-v22.abcddb') + \
         glob.glob(f'{HOME}/Library/Application Support/AddressBook/AddressBook-v22.abcddb')):
    try: c = sqlite3.connect(f'file:{f}?mode=ro', uri=True)
    except sqlite3.Error: continue
    q = "select trim(coalesce(r.ZFIRSTNAME,'')||' '||coalesce(r.ZLASTNAME,'')), coalesce(r.ZORGANIZATION,''), {col} from ZABCDRECORD r join {tbl} p on p.ZOWNER=r.Z_PK"
    for tbl, col, norm in (('ZABCDPHONENUMBER', 'p.ZFULLNUMBER', last10), ('ZABCDEMAILADDRESS', 'p.ZADDRESS', lambda s: (s or '').lower())):
        try:
            for nm, org, v in c.execute(q.format(tbl=tbl, col=col)):
                nm = nm.strip() or org.strip()
                k = norm(v)
                if nm and k and k not in names: names[k] = nm
        except sqlite3.Error: pass
def who(handle):
    if not handle: return None
    return names.get(last10(handle)) if '@' not in handle else names.get(handle.lower())

# ---------- attributedBody decoder ----------
def dec(b):
    if not b: return ''
    try:
        i = b.find(b'NSString'); j = b.find(b'+', i); n = b[j+1]
        if n == 0x81: L = int.from_bytes(b[j+2:j+4], 'little'); s = j+4
        elif n == 0x82: L = int.from_bytes(b[j+2:j+6], 'little'); s = j+6
        else: L = n; s = j+2
        return b[s:s+L].decode('utf-8', 'replace')
    except Exception: return ''

APPLE_EPOCH = 978307200
def apple_ts(d):
    if not d: return None
    sec = d / 1e9 if d > 1e12 else d
    return datetime.fromtimestamp(sec + APPLE_EPOCH, timezone.utc).astimezone().strftime('%Y-%m-%d %H:%M:%S')

n_dupes = 0
# ---------- output db ----------
if os.path.exists(OUT): os.remove(OUT)
db = sqlite3.connect(OUT)
db.executescript('''
PRAGMA journal_mode=OFF; PRAGMA synchronous=OFF;
CREATE TABLE conversations(id INTEGER PRIMARY KEY, source TEXT, key TEXT, title TEXT, is_group INT,
  people TEXT, n INT, first TEXT, last TEXT);
CREATE TABLE messages(id INTEGER PRIMARY KEY, conv_id INT, source TEXT, ts TEXT, sender TEXT, is_me INT,
  kind TEXT, text TEXT, session_id INT);
CREATE TABLE sessions(id INTEGER PRIMARY KEY, conv_id INT, start TEXT, end TEXT, n INT, senders TEXT);
''')

def add_conv(source, key, title, people, msgs):
    """msgs: list of (ts, sender, is_me, kind, text) in time order"""
    if not msgs: return
    people = sorted(set(p for p in people if p))
    is_group = 1 if len(set(people) - {ME}) > 1 else 0
    cur = db.execute('INSERT INTO conversations(source,key,title,is_group,people,n,first,last) VALUES(?,?,?,?,?,?,?,?)',
                     (source, key, title, is_group, ', '.join(people), len(msgs), msgs[0][0], msgs[-1][0]))
    cid = cur.lastrowid
    sid = None; prev = None; sess = []
    def close():
        if sid is not None:
            db.execute('UPDATE sessions SET end=?, n=?, senders=? WHERE id=?',
                       (sess[-1][0], len(sess), ', '.join(sorted({m[1] for m in sess})), sid))
    for m in msgs:
        t = datetime.strptime(m[0][:16], '%Y-%m-%d %H:%M')
        if prev is None or (t - prev).total_seconds() > SESSION_GAP_MIN * 60:
            close()
            sid = db.execute('INSERT INTO sessions(conv_id,start) VALUES(?,?)', (cid, m[0])).lastrowid
            sess = []
        sess.append(m); prev = t
        db.execute('INSERT INTO messages(conv_id,source,ts,sender,is_me,kind,text,session_id) VALUES(?,?,?,?,?,?,?,?)',
                   (cid, source, m[0], m[1], m[2], m[3], m[4], sid))
    close()

# ---------- iMessage ----------
n_im = n_merged = 0
def load_imessage():
    global n_im, n_merged, n_dupes
    try:
        mdb = sqlite3.connect(f'file:{A.chat_db}?mode=ro', uri=True); mdb.execute('select 1 from message limit 1')
    except sqlite3.Error as e:
        db.close(); os.remove(OUT)
        sys.exit(f'cannot read {A.chat_db} ({e}). Grant Full Disk Access to your terminal, or pass --no-imessage.')
    handles = {r: h for r, h in mdb.execute('SELECT ROWID, id FROM handle')}
    chat_people = {}
    for cid, hid in mdb.execute('SELECT chat_id, handle_id FROM chat_handle_join'):
        chat_people.setdefault(cid, []).append(handles.get(hid))
    chats = {r[0]: r for r in mdb.execute('SELECT ROWID, chat_identifier, display_name FROM chat')}
    rows = {}
    seen_msg = set(); exact = set()
    for mid, cid, date, fm, hid, ty, txt, ab, att in mdb.execute('''
        SELECT m.ROWID, j.chat_id, m.date, m.is_from_me, m.handle_id, m.associated_message_type, m.text, m.attributedBody,
               m.cache_has_attachments
        FROM message m JOIN chat_message_join j ON j.message_id=m.ROWID ORDER BY m.date, m.ROWID'''):
        if mid in seen_msg: continue
        seen_msg.add(mid)
        ts = apple_ts(date)
        if not ts: continue
        text = (txt or dec(ab) or '').replace('￼', '').strip()
        if ty and ty != 0: kind = 'reaction'
        elif not text and att: kind = 'media'
        elif not text: kind = 'empty'
        else: kind = 'text'
        if fm: sender = ME
        else:
            h = handles.get(hid); sender = who(h) or h or 'Unknown'
        rows.setdefault(cid, []).append((date, hid, ts, sender, 1 if fm else 0, kind, text))
    # Apple sometimes splits one chat into several (SMS vs iMessage, a re-created group). Merge chats with the
    # same name AND the same members; drop only exact copies (same nanosecond, sender and text).
    merged = {}
    for cid, msgs in rows.items():
        _, ident, disp = chats.get(cid, (cid, str(cid), ''))
        ppl = sorted({who(h) or h for h in chat_people.get(cid, []) if h})
        title = disp or ', '.join(ppl) or ident
        g = merged.setdefault((title, tuple(ppl)), {'idents': [], 'msgs': []})
        g['idents'].append(ident); g['msgs'].extend(msgs)
    for (title, ppl), g in merged.items():
        g['msgs'].sort(key=lambda m: m[0])
        out = []
        for date, hid, ts, sender, fm, kind, text in g['msgs']:
            k = (date, fm, hid, kind, text)
            if text and k in exact: n_dupes += 1; continue
            exact.add(k); out.append((ts, sender, fm, kind, text))
        if len(g['idents']) > 1: n_merged += len(g['idents']) - 1
        add_conv('imessage', ';'.join(g['idents']), title, list(ppl) + [ME], out); n_im += len(out)

if not A.no_imessage: load_imessage()

# ---------- Instagram ----------
n_ig = 0
ig_last = ''
for t in (json.load(open(IG_JSON, encoding='utf-8')) if IG_JSON else []):
    msgs = []
    for m in t['msgs']:
        text = m['text']
        if m['kind'] == 'attachment' and m['links']: text = (text + ' ' + m['links'][0]).strip()
        if m['kind'] == 'link': text = ' '.join(m['links'][:2])
        mine = m['who'] in ME_NAMES
        msgs.append((m['t'] + ':00', ME if mine else m['who'], 1 if mine else 0, m['kind'], text))
        ig_last = max(ig_last, m['t'])
    add_conv('instagram', t['id'], t['title'], [ME if p in ME_NAMES else p for p in (t.get('participants') or []) + t['people']], msgs); n_ig += len(msgs)

# ---------- indexes + full-text search ----------
db.executescript('''
CREATE INDEX m_conv ON messages(conv_id, ts);
CREATE INDEX m_ts ON messages(ts);
CREATE INDEX m_sender ON messages(sender);
CREATE INDEX m_sess ON messages(session_id);
CREATE INDEX s_conv ON sessions(conv_id, start);
CREATE VIRTUAL TABLE messages_fts USING fts5(text, content='messages', content_rowid='id',
  tokenize='porter unicode61 remove_diacritics 2');
INSERT INTO messages_fts(rowid, text) SELECT id, text FROM messages WHERE text <> '' AND kind <> 'reaction';
CREATE TABLE meta(k TEXT PRIMARY KEY, v TEXT);
''')
db.executemany('INSERT INTO meta VALUES(?,?)', [
    ('built', datetime.now().strftime('%Y-%m-%d %H:%M')), ('me', ME), ('session_gap_minutes', str(SESSION_GAP_MIN)),
    ('imessage_messages', str(n_im)), ('imessage_exact_duplicates_removed', str(n_dupes)),
    ('imessage_split_chats_merged', str(n_merged)), ('instagram_messages', str(n_ig)),
    ('instagram_export_through', ig_last[:10])])
db.commit()
db.execute('VACUUM')
print('dupes removed', n_dupes, 'chats merged', n_merged, 'imessage', n_im, 'instagram', n_ig,
      'conversations', db.execute('select count(*) from conversations').fetchone()[0],
      'sessions', db.execute('select count(*) from sessions').fetchone()[0])
