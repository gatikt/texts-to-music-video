#!/usr/bin/env python3
"""Search an iMessage + Instagram DM database built by build_dms.py (opened read-only).

  python3 dmsearch.py --db data/dms.db search "pizza night"        keyword search, results grouped by session
  python3 dmsearch.py search pizza -p sam                           only conversations/senders matching "sam"
  python3 dmsearch.py search '"see you tomorrow"'                   exact phrase
  python3 dmsearch.py search 'bowling OR arcade' --from 2024-01-01 --to 2024-12-31
  python3 dmsearch.py search birthday -p sam --full                 print whole sessions, not just a window
  python3 dmsearch.py people sam                                    conversations whose name/people match
  python3 dmsearch.py sessions sam --from 2024-01-01                list a conversation's sessions
  python3 dmsearch.py session 12345                                 print one session in full
  python3 dmsearch.py stats

Database: --db PATH, else $T2MV_DB, else ./dms.db.

Search words match variants (date/dates/dating). Use quotes for phrases, OR / NOT between terms.
A "session" is a stretch of one conversation with no gap longer than 2 hours.
"""
import argparse, os, sqlite3, sys

def connect(path):
    db = os.path.abspath(os.path.expanduser(path or os.environ.get('T2MV_DB') or 'dms.db'))
    if not os.path.exists(db):
        sys.exit(f'database not found: {db} (pass --db or set T2MV_DB)')
    return sqlite3.connect(f'file:{db}?mode=ro', uri=True)


def date_filters(a, col='m.ts'):
    sql, args = [], []
    if a.since: sql.append(f'{col} >= ?'); args.append(a.since)
    if a.until: sql.append(f'{col} < ?'); args.append(a.until + ' 99')
    if getattr(a, 'source', None): sql.append('m.source = ?'); args.append(a.source)
    return sql, args


def person_filter(p):
    like = f'%{p}%'
    return ('(c.title LIKE ? OR c.people LIKE ? OR m.sender LIKE ?)', [like, like, like])


def header(db, sid):
    s, c = db.execute('''SELECT s.id, s.start, s.end, s.n, s.senders, c.title, c.source
                         FROM sessions s JOIN conversations c ON c.id=s.conv_id WHERE s.id=?''', (sid,)).fetchone(), None
    return f'── session {s[0]} · {s[6]} · {s[5]} · {s[1][:16]} → {s[2][11:16] if s[1][:10]==s[2][:10] else s[2][:16]} · {s[3]} msgs'


def line(r, hit=False):
    ts, sender, kind, text = r
    if kind != 'text': text = f'[{kind}] {text}'.strip()
    return f"{'>>' if hit else '  '} {ts[:16]} | {sender} | {text}"


def cmd_search(db, a):
    where, args = ['messages_fts MATCH ?'], [a.query]
    w, x = date_filters(a); where += w; args += x
    if a.person:
        w, x = person_filter(a.person); where.append(w); args += x
    sql = f'''SELECT m.id, m.session_id FROM messages_fts f JOIN messages m ON m.id=f.rowid
              JOIN conversations c ON c.id=m.conv_id WHERE {' AND '.join(where)} ORDER BY m.ts'''
    try:
        hits = db.execute(sql, args).fetchall()
    except sqlite3.OperationalError:
        args[0] = '"' + a.query.replace('"', '') + '"'
        hits = db.execute(sql, args).fetchall()
    if not hits:
        print('No matches.'); return
    by_sess = {}
    for mid, sid in hits: by_sess.setdefault(sid, []).append(mid)
    sids = list(by_sess)
    print(f'{len(hits)} matching messages in {len(sids)} sessions'
          + (f' (showing last {a.limit}; use -n to see more)' if len(sids) > a.limit else ''))
    for sid in sids[-a.limit:]:
        print('\n' + header(db, sid))
        rows = db.execute('SELECT id, ts, sender, kind, text FROM messages WHERE session_id=? ORDER BY ts, id', (sid,)).fetchall()
        hitset = set(by_sess[sid])
        if a.full:
            keep = range(len(rows))
        else:
            idx = [i for i, r in enumerate(rows) if r[0] in hitset]
            keep = sorted({j for i in idx for j in range(max(0, i - a.context), min(len(rows), i + a.context + 1))})
        last = None
        for i in keep:
            if last is not None and i != last + 1: print('   …')
            print(line(rows[i][1:], rows[i][0] in hitset)); last = i


def cmd_people(db, a):
    like = f'%{a.name or ""}%'
    for r in db.execute('''SELECT id, source, title, n, first, last FROM conversations
                           WHERE title LIKE ? OR people LIKE ? ORDER BY n DESC LIMIT ?''', (like, like, a.limit)):
        print(f'conv {r[0]:>5} · {r[1]:9} · {r[3]:>6} msgs · {r[4][:10]} → {r[5][:10]} · {r[2]}')


def cmd_sessions(db, a):
    like = f'%{a.name}%'
    w, x = date_filters(a, 's.start')
    w = [c.replace('m.source', 'c.source') for c in w]
    sql = f'''SELECT s.id, c.source, c.title, s.start, s.end, s.n FROM sessions s JOIN conversations c ON c.id=s.conv_id
              WHERE (c.title LIKE ? OR c.people LIKE ?) {''.join(' AND ' + c for c in w)} ORDER BY s.start DESC LIMIT ?'''
    for r in db.execute(sql, [like, like] + x + [a.limit]):
        print(f'session {r[0]:>6} · {r[1]:9} · {r[3][:16]} → {r[4][11:16]} · {r[5]:>5} msgs · {r[2]}')


def cmd_session(db, a):
    print(header(db, a.id))
    for r in db.execute('SELECT ts, sender, kind, text FROM messages WHERE session_id=? ORDER BY ts, id', (a.id,)):
        print(line(r))


def cmd_stats(db, a):
    for k, v in db.execute('SELECT k, v FROM meta'): print(f'{k}: {v}')
    for r in db.execute('SELECT source, count(*), min(ts), max(ts) FROM messages GROUP BY source'):
        print(f'{r[0]}: {r[1]} messages, {r[2][:10]} → {r[3][:10]}')
    print('conversations:', db.execute('SELECT count(*) FROM conversations').fetchone()[0],
          '· sessions:', db.execute('SELECT count(*) FROM sessions').fetchone()[0])


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--db', help='path to dms.db (default: $T2MV_DB or ./dms.db)')
    sub = ap.add_subparsers(dest='cmd', required=True)
    def dates(p):
        p.add_argument('--from', dest='since'); p.add_argument('--to', dest='until')
    s = sub.add_parser('search'); s.add_argument('query'); s.add_argument('-p', '--person')
    s.add_argument('-s', '--source', choices=['imessage', 'instagram']); dates(s)
    s.add_argument('-n', '--limit', type=int, default=15); s.add_argument('-c', '--context', type=int, default=4)
    s.add_argument('--full', action='store_true')
    p = sub.add_parser('people'); p.add_argument('name', nargs='?'); p.add_argument('-n', '--limit', type=int, default=30)
    q = sub.add_parser('sessions'); q.add_argument('name'); dates(q); q.add_argument('-n', '--limit', type=int, default=30)
    q.set_defaults(source=None)
    o = sub.add_parser('session'); o.add_argument('id', type=int)
    sub.add_parser('stats')
    a = ap.parse_args()
    db = connect(a.db)
    {'search': cmd_search, 'people': cmd_people, 'sessions': cmd_sessions,
     'session': cmd_session, 'stats': cmd_stats}[a.cmd](db, a)


if __name__ == '__main__':
    main()
