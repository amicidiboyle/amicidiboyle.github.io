"""Gli Amici di Boyle · archivio automatico degli eventi

Ogni giorno (GitHub Actions, vedi .github/workflows/eventi-archivio.yml) controlla data e ora
di fine degli eventi e, se sono passate:
  - eventi.html: sposta la card da «Prossimi appuntamenti» in cima all'archivio «Eventi conclusi»,
    come scheda compatta con locandina e programma;
  - index.html: toglie l'evento da «Dove ci troverete»; se tra i relatori c'era uno dei fondatori
    (attributo data-founder="Nome Cognome, ...") e la locandina non c'e' gia', la aggiunge in testa
    a «Corsi, congressi e docenze». Gli eventi con relatori della Rete che non sono fondatori
    restano solo nell'archivio della pagina Eventi.
Cosi' le pagine sono corrette anche per chi le legge senza JavaScript (motori di ricerca, AI).
Il JavaScript delle pagine fa la stessa cosa nel browser, nel frattempo.
"""
import html
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NOW = datetime.now(timezone.utc)


def parse(ts):
    try:
        return datetime.fromisoformat(ts)
    except ValueError:
        return None


def attr(tag, name):
    m = re.search(r'\b' + name + r'="([^"]*)"', tag)
    return html.unescape(m.group(1)) if m else None


def ended(tag):
    end = parse(attr(tag, 'data-end') or attr(tag, 'data-start') or '')
    return end is not None and NOW > end


def esc(s):
    return html.escape(s or '', quote=True)


# ── eventi.html ────────────────────────────────────────────────────────────
def eventi():
    p = ROOT / 'eventi.html'
    s = p.read_text(encoding='utf-8')
    moved = []
    for m in list(re.finditer(r'[ \t]*<article class="evx-card"[^>]*>.*?</article>\n?', s, re.S)):
        open_tag = re.match(r'\s*(<article[^>]*>)', m.group(0)).group(1)
        if ended(open_tag):
            moved.append((m.group(0), open_tag))
    if not moved:
        return []
    for block, tag in moved:
        s = s.replace(block, '', 1)
        title = attr(tag, 'data-title') or ''
        poster = attr(tag, 'data-poster')
        pdf = attr(tag, 'data-pdf')
        city = attr(tag, 'data-city') or ''
        place = (attr(tag, 'data-place') or '').split(',')[0].strip()
        where = city + (' · ' + place if place and place != city else '')
        start = (attr(tag, 'data-start') or '')[:10]
        media = (f'<button class="evx-mini__media" type="button" onclick="openLightbox(\'{esc(poster)}\',\'{esc(title)}\')" aria-label="Ingrandisci la locandina">'
                 f'<img src="{esc(poster)}" alt="Locandina {esc(title)}" loading="lazy" decoding="async" /></button>') if poster else \
                f'<div class="evx-mini__media evx-mini__media--ph" aria-hidden="true"><span>{esc(city[:6].upper())}</span></div>'
        links = f'<div class="evx-mini__links"><a href="{esc(pdf)}" target="_blank" rel="noopener" data-i18n="evx_program">Programma</a></div>' if pdf else ''
        mini = (f'          <article class="evx-mini" data-date="{start}">\n'
                f'            {media}\n'
                f'            <div class="evx-mini__body"><span class="evx-mini__date">{esc(attr(tag, "data-when") or "")}</span><h3>{esc(title)}</h3><p>{esc(where)}</p>{links}</div>\n'
                f'          </article>\n')
        # inserisce in ordine di data (piu' recente in alto)
        grid = re.search(r'<div class="evx-grid" id="evxArchive">\n', s)
        if not grid:
            continue
        pos = None
        for a in re.finditer(r'[ \t]*<article class="evx-mini" data-date="([0-9-]+)">', s[grid.end():]):
            if a.group(1) <= start:
                pos = grid.end() + a.start()
                break
        if pos is None:  # piu' vecchio di tutti: in fondo all'archivio
            pos = s.index('\n        </div>', grid.end()) + 1
        s = s[:pos] + mini + s[pos:]
    p.write_text(s, encoding='utf-8')
    return ['eventi: ' + attr(t, 'data-title') for _, t in moved]


# ── index.html ─────────────────────────────────────────────────────────────
def home():
    p = ROOT / 'index.html'
    s = p.read_text(encoding='utf-8')
    done = []
    for m in list(re.finditer(r'[ \t]*<article class="glass-card appt-card[^"]*"[^>]*>.*?</article>\n\n?', s, re.S)):
        block = m.group(0)
        tag = re.match(r'\s*(<article[^>]*>)', block).group(1)
        if not ended(tag):
            continue
        s = s.replace(block, '', 1)
        title = re.search(r'<h3>(.*?)</h3>', block, re.S)
        title = html.unescape(re.sub(r'<[^>]+>', '', title.group(1))).strip() if title else ''
        done.append('home: ' + title)
        if 'data-founder' not in tag:
            continue
        media = re.search(r'<a class="appt-media" href="([^"]+)"', block)
        img = re.search(r'<img src="([^"]+)" alt="([^"]*)"', block)
        pdf = media.group(1) if media else None
        if not pdf or f'href="{pdf}"' in s[s.find('course-poster-grid'):]:
            continue
        meta = re.search(r'<p class="appt-meta">.*?<span>([^<]*)</span></p>', block, re.S)
        where = meta.group(1).split('·')[0].strip() if meta else ''
        year = (attr(tag, 'data-start') or '')[:4]
        card = (f'            <article class="glass-card course-poster-card">\n'
                f'              <img src="{img.group(1) if img else ""}" alt="{img.group(2) if img else ""}" loading="lazy" decoding="async" onerror="this.style.display=\'none\'" />\n'
                f'              <h4>{esc(title)} · {esc(where)} {year}</h4>\n'
                f'              <a class="btn btn-secondary btn-block" href="{pdf}" target="_blank" rel="noopener" data-i18n="form_download">Download programma completo</a>\n'
                f'            </article>\n')
        s = s.replace('<div class="course-poster-grid">\n', '<div class="course-poster-grid">\n' + card, 1)
    if done:
        n = len(re.findall(r'<article class="glass-card appt-card', s))
        dots = '<div class="appt-dots" aria-hidden="true">' + ''.join('<span class="is-on"></span>' if i == 0 else '<span></span>' for i in range(max(n, 1))) + '</div>'
        s = re.sub(r'<div class="appt-dots" aria-hidden="true">.*?</div>', dots, s, count=1)
        p.write_text(s, encoding='utf-8')
    return done


if __name__ == '__main__':
    if len(sys.argv) > 1:  # data di prova: python scripts/eventi_archivio.py 2026-10-26T12:00:00+01:00
        NOW = datetime.fromisoformat(sys.argv[1])
    changes = eventi() + home()
    print('\n'.join(changes) if changes else 'Nessun evento concluso da archiviare.')
