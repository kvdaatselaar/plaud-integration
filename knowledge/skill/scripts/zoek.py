#!/usr/bin/env python3
"""Search the conversation knowledge base (Kennisbank) of plaud-integration.

A term resolves to a person, topic, organisation or series page (name, aliases, spelling
variants), and conversations are ranked by where the term occurs: in the metadata first,
then in the text. Reads only the generated files the /kennisbank skill may read (pages and
conversations, never _beheer/). Python 3 standard library only, so it runs wherever the
skill runs: Claude Code, Cowork, a terminal.

    python3 zoek.py --kb <Kennisbank> "Jan de Vries" datamigratie
    python3 zoek.py --kb <Kennisbank> --van=2026-09-01 --tot=2026-09-30 --type=klantgesprek
    python3 zoek.py --kb <Kennisbank> WoonNet migratie --alle --max=0
"""
import argparse
import os
import re
import sys
import unicodedata

KINDS = {'personen': 'persoon', 'onderwerpen': 'onderwerp', 'organisaties': 'organisatie', 'reeksen': 'reeks'}
TEXT_WEIGHT = {'titel': 2, 'Besluiten': 2, 'Actiepunten': 2, 'Open vragen': 1, 'Samenvatting': 1, 'Notities': 1}
GENERATED_MARKER = 'gegenereerd door plaud-integration'


def fold(s):
    """Strip accents: "privé" and "prive" match."""
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')


def normalize_key(s):
    """Case-, accent- and punctuation-insensitive key, as in src/kb/vocabulary.ts."""
    return re.sub(r'[^a-z0-9]+', ' ', fold(s).lower()).strip()


def slugify(s):
    return re.sub(r'^-+|-+$', '', re.sub(r'[^a-z0-9]+', '-', fold(s).lower()))[:80] or 'zonder-naam'


SOUND_RULES = [
    (r'sch', 's'), (r'que', 'k'), (r'qu', 'k'), (r'q', 'k'), (r'ck', 'k'),
    (r'c(?=[eiy])', 's'), (r'c', 'k'), (r'x', 'ks'), (r'ph', 'f'), (r'th', 't'), (r'dt', 't'),
    (r'ij', 'ei'), (r'y', 'i'), (r'ie', 'i'), (r'ee', 'e'), (r'oo', 'o'), (r'aa', 'a'), (r'uu', 'u'),
    (r'ou', 'au'), (r'oe', 'u'), (r'w', 'v'), (r'z', 's'),
]


def sound_key(text):
    """Rough Dutch/English sound key, as in src/kb/soundkey.ts: "Akme", "Ackme" and "Acme" collapse."""
    s = re.sub(r'[^a-z]', '', fold(text).lower())
    if not s:
        return ''
    for pattern, to in SOUND_RULES:
        s = re.sub(pattern, to, s)
    s = s[0] + s[1:].replace('h', '')
    s = re.sub(r'(.)\1+', r'\1', s)
    s = re.sub(r'd$', 't', s)
    return re.sub(r'e$', '', s) if len(s) > 3 else s


def is_acronym(s):
    return bool(re.search(r'[/&]', s)) or (s.upper() == s and bool(re.fullmatch(r'[\w .-]+', s)))


def unquote(v):
    v = v.strip()
    if len(v) >= 2 and v[0] == v[-1] == '"':
        return re.sub(r'\\(.)', r'\1', v[1:-1])
    if len(v) >= 2 and v[0] == v[-1] == "'":
        return v[1:-1].replace("''", "'")
    return v


def parse_frontmatter(text):
    """The subset of YAML the generator writes: scalars, lists of scalars, folded long lines."""
    m = re.match(r'^---\r?\n(.*?)\r?\n---\r?\n?(.*)$', text, re.S)
    if not m:
        return None, text
    meta, key = {}, None
    for line in m.group(1).split('\n'):
        if not line.strip():
            continue
        km = re.match(r'^([A-Za-z_][\w-]*):(?:\s+(.*))?$', line)
        if km:
            key, value = km.group(1), (km.group(2) or '').strip()
            meta[key] = [] if value in ('', '[]') else '' if value[0] in '>|' else value
            continue
        item = re.match(r'^\s*-\s+(.*)$', line)
        if item and key and isinstance(meta[key], list):
            meta[key].append(item.group(1))
        elif key and isinstance(meta[key], list) and meta[key]:
            meta[key][-1] += ' ' + line.strip()
        elif key and isinstance(meta[key], str):
            meta[key] = (meta[key] + ' ' + line.strip()).strip()
    clean = {k: [unquote(x) for x in v] if isinstance(v, list) else unquote(v) for k, v in meta.items()}
    return clean, m.group(2)


def sections(body):
    """Title plus body sections by heading, accent-folded for matching."""
    out = {'titel': fold((re.search(r'^# (.+)$', body, re.M) or [None, ''])[1])}
    for part in re.split(r'^## ', body, flags=re.M)[1:]:
        head, _, rest = part.partition('\n')
        out[head.strip()] = fold(rest)
    return out


def read(path):
    with open(path, encoding='utf-8') as f:
        return f.read()


def load_conversations(kb):
    out = []
    root = os.path.join(kb, 'gesprekken')
    for dirpath, _, files in os.walk(root):
        for name in files:
            if not name.endswith('.md'):
                continue
            path = os.path.join(dirpath, name)
            text = read(path)
            meta, body = parse_frontmatter(text)
            if meta is None or GENERATED_MARKER not in text:
                continue
            lst = lambda k: meta.get(k) if isinstance(meta.get(k), list) else []
            out.append({
                'rel': os.path.relpath(path, kb).replace(os.sep, '/'),
                'titel': meta.get('titel') or name[:-3],
                'datum': str(meta.get('datum', '')), 'tijd': str(meta.get('tijd', '')),
                'type': meta.get('type') or 'overig', 'reeks': meta.get('reeks') or None, 'over': meta.get('over') or None,
                'personen': lst('personen'), 'hoofdonderwerpen': lst('hoofdonderwerpen'),
                'onderwerpen': lst('onderwerpen'), 'organisaties': lst('organisaties'),
                'body': body,
            })
    return sorted(out, key=lambda c: f"{c['datum']} {c['tijd']}", reverse=True)


def load_entities(kb):
    """Every person, topic, organisation and series page, with the aliases listed on it."""
    out = []
    for folder, kind in KINDS.items():
        d = os.path.join(kb, folder)
        if not os.path.isdir(d):
            continue
        for name in sorted(os.listdir(d)):
            if not name.endswith('.md'):
                continue
            text = read(os.path.join(d, name))
            title = re.search(r'^# (?:Reeks: )?(.+)$', text, re.M)
            if not title:
                continue
            aliases = re.search(r'\*\*Ook bekend als:\*\* (.+?)(?: · \*\*|\s*$)', text, re.M)
            parent = re.search(r'\*\*Onderdeel van:\*\* \[([^\]]+)\]', text)
            naam = title.group(1).strip()
            out.append({
                'kind': kind, 'naam': naam, 'page': f'{folder}/{name}', 'parent': parent.group(1) if parent else None,
                'variants': [naam] + ([a.strip() for a in aliases.group(1).split(',') if a.strip()] if aliases else []),
            })
    return out


def padded(s):
    return f' {normalize_key(s)} '


def match_kind(term, variant):
    """exact: name or alias; part: whole words of one inside the other; sound: misheard spelling."""
    t, v = normalize_key(term), normalize_key(variant)
    if not t or not v:
        return None
    if t == v:
        return 'exact'
    if (len(t) >= 3 and f' {t} ' in padded(v)) or (len(v) >= 3 and f' {v} ' in padded(t)):
        return 'part'
    if len(t) >= 4 and not is_acronym(term) and not is_acronym(variant) and sound_key(term) == sound_key(variant):
        return 'sound'
    return None


def text_pattern(phrase):
    """Dutch compounds ("datamigratieplan"): long phrases match inside words, short ones ("AI") only whole."""
    p = re.escape(fold(phrase).strip())
    return re.compile(p if len(phrase.strip()) >= 5 else rf'(?<!\w){p}(?!\w)', re.I)


def resolve(term, entities):
    scored = [(e, [k for k in (match_kind(term, v) for v in e['variants']) if k]) for e in entities]
    scored = [(e, kinds) for e, kinds in scored if kinds]
    exact = [e for e, kinds in scored if 'exact' in kinds]
    partial = [e for e, kinds in scored if 'exact' not in kinds]
    chosen = exact or partial
    phrases = list(dict.fromkeys(p for p in [term] + [v for e in chosen for v in e['variants']] if len(p.strip()) >= 2))
    return {'term': term, 'entities': chosen, 'maybe': partial if exact else [], 'patterns': [text_pattern(p) for p in phrases]}


def meta_reasons(c, e):
    n = e['naam']
    if e['kind'] == 'persoon':
        if c['over'] == n:
            return [(5, f'over {n}')]
        return [(2, f'met {n}')] if n in c['personen'] else []
    if e['kind'] == 'onderwerp':
        if n in c['onderwerpen']:
            return [(4, f'onderwerp {n}')]
        return [(3, f'onder {n}')] if n in c['hoofdonderwerpen'] else []
    if e['kind'] == 'organisatie':
        return [(3, f'organisatie {n}')] if n in c['organisaties'] else []
    return [(4, f'reeks {n}')] if c['reeks'] == n else []


def search(convs, resolved, all_terms):
    hits = []
    for c in convs:
        score, reasons, terms, in_meta = 0, [], set(), False
        secs = sections(c['body']) if resolved else {}
        for r in resolved:
            meta = [m for e in r['entities'] for m in meta_reasons(c, e)]
            in_text = [name for name, text in secs.items() if any(p.search(text) for p in r['patterns'])]
            if not meta and not in_text:
                continue
            terms.add(r['term'])
            in_meta = in_meta or bool(meta)
            score += sum(s for s, _ in meta) + min(4, sum(TEXT_WEIGHT.get(s, 1) for s in in_text))
            reasons += [why for _, why in meta]
            if in_text:
                reasons.append(f'tekst "{r["term"]}": {", ".join(in_text)}')
        if not resolved or (len(terms) == len(resolved) if all_terms else terms):
            hits.append({'conv': c, 'score': score, 'reasons': reasons, 'in_meta': in_meta})
    # Stable sort: equal scores keep the newest-first order of the conversations.
    return sorted(hits, key=lambda h: -h['score'])


def cell(s):
    return s.replace('|', '\\|')


def describe(e):
    also = e['variants'][1:]
    parts = [f"{e['kind']} **{e['naam']}**", f"(onder {e['parent']})" if e['parent'] else None, f"· {e['page']}",
             f"· ook: {', '.join(also[:8])}{', …' if len(also) > 8 else ''}" if also else None]
    return ' '.join(p for p in parts if p)


def find_kb(given):
    """--kb, else $KB_DIR, else the current folder or a parent that looks like the Kennisbank."""
    candidates = [given, os.environ.get('KB_DIR')] if given or os.environ.get('KB_DIR') else []
    if not candidates:
        here = os.path.abspath(os.getcwd())
        while True:
            candidates.append(here)
            parent = os.path.dirname(here)
            if parent == here:
                break
            here = parent
    for c in candidates:
        if c and os.path.isfile(os.path.join(c, 'INDEX.md')) and os.path.isdir(os.path.join(c, 'gesprekken')):
            return os.path.abspath(c)
    return None


def main():
    ap = argparse.ArgumentParser(description='Doorzoek de kennisbank van plaud-integration.', allow_abbrev=False)
    ap.add_argument('termen', nargs='*', help='zoektermen; meerdere woorden tussen aanhalingstekens')
    ap.add_argument('--kb', help='map van de kennisbank (met INDEX.md en gesprekken/)')
    ap.add_argument('--van', help='vanaf datum JJJJ-MM-DD')
    ap.add_argument('--tot', help='tot en met datum JJJJ-MM-DD')
    ap.add_argument('--type', help='gesprekstype, bv. 1-op-1 of klantgesprek')
    ap.add_argument('--alle', action='store_true', help='alle termen in hetzelfde gesprek')
    ap.add_argument('--max', type=int, default=60, help='maximaal aantal rijen; 0 = alles')
    if len(sys.argv) <= 1:
        ap.print_usage(sys.stderr)
        sys.exit(1)
    args = ap.parse_args()
    terms = [t.strip() for t in args.termen if t.strip()]

    kb = find_kb(args.kb)
    if not kb:
        sys.exit('Geen kennisbank gevonden: geef de map met INDEX.md en gesprekken/ op met --kb.')

    every = load_conversations(kb)
    convs = [c for c in every
             if (not args.van or c['datum'] >= args.van) and (not args.tot or c['datum'] <= args.tot)
             and (not args.type or normalize_key(c['type']) == normalize_key(args.type))]
    entities = load_entities(kb)
    resolved = [resolve(t, entities) for t in terms]
    hits = search(convs, resolved, args.alle)
    shown = hits[:args.max] if args.max > 0 else hits
    span = f"{every[-1]['datum']} – {every[0]['datum']}" if every else '—'
    filters = [f for f in [args.van and f'van {args.van}', args.tot and f'tot en met {args.tot}',
                           args.type and f'type {args.type}', args.alle and 'alle termen'] if f]

    out = ['# Zoekresultaat kennisbank', '', f'Kennisbank: {kb}  ',
           f"Bijgewerkt tot: {every[0]['datum'] if every else '—'} · {len(every)} gesprekken ({span})"
           + (f" · filter: {', '.join(filters)}" if filters else ''), '']
    if resolved:
        out += ['## Zoektermen', '']
        for r in resolved:
            if not r['entities']:
                out.append(f'- "{r["term"]}" → geen persoon, onderwerp, organisatie of reeks; alleen in de tekst gezocht')
            else:
                more = f"\n  - … en {len(r['entities']) - 6} meer: maak de term specifieker" if len(r['entities']) > 6 else ''
                out.append(f'- "{r["term"]}" → ' + '\n  - '.join(describe(e) for e in r['entities'][:6]) + more)
            if r['maybe']:
                out.append('  - ook mogelijk: ' + ', '.join(f"{e['naam']} ({e['kind']})" for e in r['maybe'][:6]))
        pages = list(dict.fromkeys(e['page'] for r in resolved for e in r['entities'][:6]))
        if pages:
            out += ['', '## Eerst lezen', ''] + [f'- {p}' for p in pages]
        out.append('')

    in_meta = sum(1 for h in hits if h['in_meta'])
    out += [f'## Gesprekken: {len(hits)}' + (f' ({in_meta} op metadata, {len(hits) - in_meta} alleen in de tekst)' if resolved else ''), '']
    if not hits:
        out.append('_Geen treffers._ Probeer een andere schrijfwijze, een breder (hoofd)onderwerp of minder filters; '
                   'de namen en hun varianten staan in INDEX.md.')
    else:
        out += ['| Score | Datum | Type | Gesprek | Waarom |', '|---:|---|---|---|---|']
        out += [f"| {h['score']} | {h['conv']['datum']} | {h['conv']['type']} | {cell(h['conv']['rel'])} | "
                f"{cell('; '.join(h['reasons']) or '—')} |" for h in shown]
        if len(shown) < len(hits):
            out += ['', f'_… en {len(hits) - len(shown)} meer met een lagere score: --max=0 toont alles._']
    print('\n'.join(out))


if __name__ == '__main__':
    main()
