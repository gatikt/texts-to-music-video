"""Build the demo's tiny FAKE message database: projects/demo/data/dms.db.

Everything here is invented: fictional people (Alex = the protagonist, Priya, Marco, Jules, Sam, Dee, Mom), fictional chats,
fictional times. Same schema as scripts/build_dms.py output, so every engine/script tool works on it:
  conversations(id, source, key, title, is_group, people, n, first, last)
  messages(id, conv_id, source, ts, sender, is_me, kind, text, session_id)
  sessions(id, conv_id, start, end, n, senders)        -- a new session starts after a 120-min gap
  meta(k, v)  + the messages_fts full-text index
usage: python3 make_demo_db.py            (overwrites data/dms.db next to this script)
"""
import os, sqlite3
from datetime import datetime

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'data', 'dms.db')
ME, GAP_MIN = 'Alex', 120

# (ts, sender, kind, text) — kind: text | media | reaction
GROUP = [
    ('2024-03-14 19:12:05', 'Priya', 'text', "who's coming to the thing saturday"),
    ('2024-03-14 19:15:40', 'Sam', 'text', 'me'),
    ('2024-03-14 19:15:52', 'Marco', 'text', 'maybe'),
    ('2024-03-14 19:40:11', 'Alex', 'text', 'depends on the pizza situation'),
    ('2024-03-15 02:04:09', 'Alex', 'text', 'anyone up??'),
    ('2024-03-15 02:04:31', 'Marco', 'text', 'no'),
    ('2024-03-15 02:05:02', 'Alex', 'text', 'u literally just replied'),
    ('2024-03-15 02:06:15', 'Priya', 'text', 'why is everyone awake'),
    ('2024-03-15 02:06:40', 'Jules', 'text', 'i have a test at 8'),
    ('2024-03-15 02:07:03', 'Sam', 'text', 'same'),
    ('2024-03-15 02:07:09', 'Dee', 'text', 'same'),
    ('2024-03-15 02:08:27', 'Alex', 'text', 'GROUP CHAT NEVER SLEEPS'),
    ('2024-03-15 02:10:44', 'Marco', 'text', 'ok but who ate the last slice'),
    ('2024-03-15 02:11:20', 'Alex', 'text', 'it was cold anyway'),
    ('2024-03-15 02:13:02', 'Jules', 'text', "that's not a defense"),
    ('2024-03-15 02:20:33', 'Marco', 'media', ''),
    ('2024-03-15 02:20:41', 'Marco', 'text', 'LMAOOO'),
    ('2024-03-15 02:21:05', 'Priya', 'text', "i'm crying"),
    ('2024-03-15 02:22:18', 'Dee', 'text', "this is the best thing you've ever sent"),
    ('2024-03-15 03:30:00', 'Sam', 'text', 'ok real question'),
    ('2024-03-15 03:30:12', 'Sam', 'text', 'is a hot dog a sandwich'),
    ('2024-03-15 03:31:01', 'Alex', 'text', 'absolutely not'),
    ('2024-03-15 03:31:09', 'Jules', 'text', 'absolutely yes'),
    ('2024-03-15 06:51:30', 'Priya', 'text', 'the sun is literally coming up'),
    ('2024-03-15 06:52:02', 'Alex', 'text', 'ok goodnight for real'),
    ('2024-03-15 06:52:10', 'Priya', 'text', 'goodnight'),
    ('2024-03-15 06:52:14', 'Marco', 'text', 'goodnight'),
    ('2024-03-15 06:52:40', 'Jules', 'text', 'goodnight'),
    ('2024-03-15 06:53:01', 'Dee', 'text', 'gn'),
    ('2024-03-15 06:54:12', 'Alex', 'text', 'wait one more thing'),
    ('2024-03-15 06:54:15', 'Sam', 'text', 'NO'),
    ('2024-03-15 06:54:20', 'Priya', 'reaction', 'Laughed at “NO”'),
    ('2024-03-16 01:58:00', 'Alex', 'text', 'anyone up??'),
    ('2024-03-16 01:58:21', 'Marco', 'text', 'here we go again'),
]
MOM = [
    ('2024-03-15 07:05:44', 'Mom', 'text', 'Why is your light still on'),
    ('2024-03-15 07:06:02', 'Alex', 'text', 'studying'),
    ('2024-03-15 07:06:30', 'Mom', 'text', 'Go to sleep'),
    ('2024-03-15 19:02:10', 'Mom', 'text', 'Dinner is ready'),
    ('2024-03-15 19:03:00', 'Alex', 'text', 'coming down'),
]
JULES_IG = [
    ('2024-03-15 14:00:05', 'Jules', 'text', 'did you sleep'),
    ('2024-03-15 14:02:30', 'Alex', 'text', 'define sleep'),
    ('2024-03-15 14:02:51', 'Jules', 'text', 'so no'),
]
CONVS = [
    ('imessage', 'chat-demo-0001', '2 AM Club', ['Alex', 'Priya', 'Marco', 'Jules', 'Sam', 'Dee'], GROUP),
    ('imessage', 'demo-mom', 'Mom', ['Alex', 'Mom'], MOM),
    ('instagram', 'ig-demo-jules', 'Jules', ['Alex', 'Jules'], JULES_IG),
]

os.makedirs(os.path.dirname(OUT), exist_ok=True)
if os.path.exists(OUT): os.remove(OUT)
db = sqlite3.connect(OUT)
db.executescript('''
CREATE TABLE conversations(id INTEGER PRIMARY KEY, source TEXT, key TEXT, title TEXT, is_group INT,
  people TEXT, n INT, first TEXT, last TEXT);
CREATE TABLE messages(id INTEGER PRIMARY KEY, conv_id INT, source TEXT, ts TEXT, sender TEXT, is_me INT,
  kind TEXT, text TEXT, session_id INT);
CREATE TABLE sessions(id INTEGER PRIMARY KEY, conv_id INT, start TEXT, end TEXT, n INT, senders TEXT);
''')
for source, key, title, people, msgs in CONVS:
    people = sorted(set(people)); is_group = 1 if len(set(people) - {ME}) > 1 else 0
    cid = db.execute('INSERT INTO conversations(source,key,title,is_group,people,n,first,last) VALUES(?,?,?,?,?,?,?,?)',
                     (source, key, title, is_group, ', '.join(people), len(msgs), msgs[0][0], msgs[-1][0])).lastrowid
    sid, prev, sess = None, None, []
    def close():
        if sid is not None:
            db.execute('UPDATE sessions SET end=?, n=?, senders=? WHERE id=?', (sess[-1][0], len(sess), ', '.join(sorted({m[1] for m in sess})), sid))
    for m in msgs:
        t = datetime.strptime(m[0][:16], '%Y-%m-%d %H:%M')
        if prev is None or (t - prev).total_seconds() > GAP_MIN * 60:
            close(); sid = db.execute('INSERT INTO sessions(conv_id,start) VALUES(?,?)', (cid, m[0])).lastrowid; sess = []
        sess.append(m); prev = t
        db.execute('INSERT INTO messages(conv_id,source,ts,sender,is_me,kind,text,session_id) VALUES(?,?,?,?,?,?,?,?)',
                   (cid, source, m[0], m[1], 1 if m[1] == ME else 0, m[2], m[3], sid))
    close()
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
n = db.execute('select count(*) from messages').fetchone()[0]
db.executemany('INSERT INTO meta VALUES(?,?)', [('built', 'demo (synthetic data)'), ('me', ME), ('session_gap_minutes', str(GAP_MIN)),
    ('imessage_messages', str(len(GROUP) + len(MOM))), ('instagram_messages', str(len(JULES_IG))), ('note', 'fictional demo data — no real people')])
db.commit(); db.execute('VACUUM'); db.close()
print(f'{OUT}: {n} messages, {len(CONVS)} conversations')
