/* BOYLE LAB · applicazione (routing, catalogo, banco di lavoro, registro, validazione)
   ES module puro, nessuna dipendenza. Tutti i calcoli arrivano da lab/core. */
import { BASE } from './experiments/base.js?v=20261026f';
import { ADVANCED } from './experiments/advanced.js?v=20261026f';
import { MODELS, CATEGORY } from './core/registry.js?v=20261026f';
import { REFS, refLink } from './core/refs.js';
import { lineChart, barChart } from './ui/chart.js?v=20261026f';
import { runAll } from './tests/cases.js?v=20261026f';
import { patch } from './ui/instruments.js';

const VERSION = '1.0.0';
const EXPS = [...BASE, ...ADVANCED];
const byId = Object.fromEntries(EXPS.map(e => [e.id, e]));
const app = document.getElementById('lab-app');

/* ── lingua ─────────────────────────────────────────────────────────────── */
const getLang = () => { try { return sessionStorage.getItem('boyle_lang') || 'it'; } catch (e) { return 'it'; } };
let LANG = getLang();
const t = v => v == null ? '' : typeof v === 'string' ? v : (v[LANG] ?? v.it ?? '');
const UI = {
  it: {
    home: 'Laboratorio', catalog: 'Esperimenti', models: 'Modelli e validazione', biblio: 'Bibliografia',
    lead: 'Il laboratorio virtuale di fisiologia degli ambienti estremi. Pressione, gas, ossigeno: muovi i parametri e guarda cosa succede, con le equazioni e le fonti sempre in vista.',
    baseT: 'Percorso BASE', baseD: 'Per studenti, subacquei, curiosi. Ogni esperimento ha obiettivo, spiegazione, formula, errore comune e quiz.',
    advT: 'Percorso ADVANCED', advD: 'Per medici, specializzandi, istruttori e ricercatori. Modelli completi, confronto di scenari, esportazione dei dati.',
    enter: 'Entra', areas: 'Le sei aree', search: 'Cerca un esperimento…', all: 'Tutti', level: 'Livello', area: 'Area', status: 'Modello',
    results: n => n + (n === 1 ? ' esperimento' : ' esperimenti'), none: 'Nessun esperimento con questi filtri.',
    params: 'Parametri', results2: 'Risultati', reset: 'Ripristina', save: 'Salva', pinB: 'Fissa come B', unpinB: 'Togli B', share: 'Copia link', copied: 'Link copiato',
    exportT: 'Esporta', present: 'Modalità presentazione', exitPresent: 'Esci dalla presentazione', saved: 'Esperimenti salvati in questo browser', noSaved: 'Nessun salvataggio per ora.',
    open: 'Apri', del: 'Elimina', learn: 'Didattica', objective: 'Obiettivo', explain: 'Cosa succede', formula: 'Formula', misconception: 'Errore comune', quiz: 'Mettiti alla prova', check: 'Verifica',
    right: 'Esatto.', wrong: 'Non proprio.', next: 'Approfondisci nel percorso ADVANCED', science: 'Scheda scientifica', equations: 'Equazioni', variables: 'Variabili e unità', assumptions: 'Ipotesi',
    validity: 'Intervallo di validità', limits: 'Limiti', sources: 'Fonti', reviewed: 'Revisione', vstatus: 'Stato di validazione', tests: 'Casi di prova',
    pending: 'In attesa di validazione', pendingD: 'Questo modulo è progettato ma non ancora pubblicato: mancano dati o una revisione scientifica. Preferiamo un modulo in meno a un numero sbagliato.',
    disclaimer: 'Strumento educativo e di ricerca. Non è un dispositivo medico, non è un pianificatore d\'immersione e non serve a prescrivere l\'ossigenoterapia iperbarica. Non inserire dati sanitari reali: il laboratorio non li registra.',
    valT: 'Banco di prova', valD: 'Ogni calcolo è confrontato con valori ricavati a mano o da tabelle pubblicate, indipendentemente dal codice. Il banco gira adesso, nel tuo browser.',
    passed: (a, b) => a + ' casi superati su ' + b, expected: 'Atteso', got: 'Ottenuto', source: 'Origine del valore atteso', regT: 'Registro dei modelli',
    back: '← Tutti gli esperimenti', B: 'B (fissato)', A: 'A (attuale)', delta: 'Δ', note: 'Nota del modello', warn: 'Attenzione', namePrompt: 'Nome del salvataggio',
    savedOk: 'Salvato in questo browser', module: 'Modulo', unimplemented: 'Moduli in preparazione',
    pick: 'Scegli un esperimento', pickHint: 'Area per area, tutti gli esperimenti del laboratorio', switchExp: 'Cambia esperimento', go: 'Vai direttamente a un esperimento',
    simOn: 'Simulazione attiva', bench: 'Banco di prova', motto: 'Dagli abissi a Marte', verified: 'modelli verificati', verifiedT: (a, b) => a + ' casi di prova su ' + b + ' superati: apri la validazione', close: 'Chiudi', readouts: 'Letture', instrument: 'Strumento', chartT: 'Grafico', ready: 'Pronto', soon: 'in arrivo',
  },
  en: {
    home: 'Lab', catalog: 'Experiments', models: 'Models & validation', biblio: 'References',
    lead: 'The virtual laboratory of extreme-environment physiology. Pressure, gases, oxygen: move the parameters and watch what happens, with equations and sources always in view.',
    baseT: 'BASE path', baseD: 'For students, divers and the curious. Every experiment has an objective, an explanation, the formula, a common misconception and a quiz.',
    advT: 'ADVANCED path', advD: 'For physicians, trainees, instructors and researchers. Full models, scenario comparison, data export.',
    enter: 'Enter', areas: 'The six areas', search: 'Search an experiment…', all: 'All', level: 'Level', area: 'Area', status: 'Model',
    results: n => n + (n === 1 ? ' experiment' : ' experiments'), none: 'No experiment matches these filters.',
    params: 'Parameters', results2: 'Results', reset: 'Reset', save: 'Save', pinB: 'Pin as B', unpinB: 'Remove B', share: 'Copy link', copied: 'Link copied',
    exportT: 'Export', present: 'Presentation mode', exitPresent: 'Exit presentation', saved: 'Experiments saved in this browser', noSaved: 'Nothing saved yet.',
    open: 'Open', del: 'Delete', learn: 'Learning', objective: 'Objective', explain: 'What happens', formula: 'Formula', misconception: 'Common misconception', quiz: 'Test yourself', check: 'Check',
    right: 'Correct.', wrong: 'Not quite.', next: 'Go deeper in the ADVANCED path', science: 'Science card', equations: 'Equations', variables: 'Variables and units', assumptions: 'Assumptions',
    validity: 'Validity range', limits: 'Limits', sources: 'Sources', reviewed: 'Reviewed', vstatus: 'Validation status', tests: 'Test cases',
    pending: 'Pending validation', pendingD: 'This module is designed but not yet released: data or scientific review are missing. One module less is better than one wrong number.',
    disclaimer: 'Educational and research tool. It is not a medical device, not a dive planner and not a tool to prescribe hyperbaric oxygen therapy. Do not enter real health data: the lab does not store it.',
    valT: 'Test bench', valD: 'Every calculation is checked against values worked out by hand or taken from published tables, independently of the code. The bench runs now, in your browser.',
    passed: (a, b) => a + ' of ' + b + ' cases passed', expected: 'Expected', got: 'Got', source: 'Origin of expected value', regT: 'Model registry',
    back: '← All experiments', B: 'B (pinned)', A: 'A (current)', delta: 'Δ', note: 'Model note', warn: 'Warning', namePrompt: 'Name for this save',
    savedOk: 'Saved in this browser', module: 'Module', unimplemented: 'Modules in preparation',
    pick: 'Choose an experiment', pickHint: 'Area by area, every experiment in the lab', switchExp: 'Switch experiment', go: 'Jump straight to an experiment',
    simOn: 'Simulation running', bench: 'Test bench', motto: 'From the deep sea to Mars', verified: 'verified models', verifiedT: (a, b) => a + ' of ' + b + ' test cases passed: open the validation page', close: 'Close', readouts: 'Readouts', instrument: 'Instrument', chartT: 'Chart', ready: 'Ready', soon: 'coming',
  },
};
const u = k => (UI[LANG] || UI.it)[k] ?? UI.it[k];
const AREAS = {
  A: { it: 'Fisica sotto pressione', en: 'Physics under pressure' },
  B: { it: 'Fisiologia respiratoria', en: 'Respiratory physiology' },
  C: { it: 'Immersione', en: 'Diving' },
  D: { it: 'Iperbarica', en: 'Hyperbaric' },
  E: { it: 'Ambienti estremi', en: 'Extreme environments' },
  F: { it: 'Prestazione umana e terapia intensiva', en: 'Human performance & critical care' },
};
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (v, d = 2) => Number.isFinite(v) ? v.toLocaleString(LANG === 'en' ? 'en-GB' : 'it-IT', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—';

/* ── icone (linee, 24×24) ──────────────────────────────────────────────── */
const ic = d => `<svg viewBox="0 0 24 24" class="lab-ic" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const ICON = {
  A: ic('<circle cx="12" cy="13" r="8"/><path d="M12 13l4-4M6.5 13H8M12 7.5V9M17.5 13H16"/><path d="M9 3h6"/>'),
  B: ic('<path d="M12 3v7M12 10c-1.5 0-2 1-3 1M12 10c1.5 0 2 1 3 1"/><path d="M9 7.5C6 7 4 10 4 14c0 3 1 6 3 6s3-2 3-5V9"/><path d="M15 7.5c3-.5 5 2.5 5 6.5 0 3-1 6-3 6s-3-2-3-5V9"/>'),
  C: ic('<path d="M2 7c2-1.5 3-1.5 5 0s3 1.5 5 0 3-1.5 5 0 3 1.5 5 0"/><circle cx="8" cy="13" r="1.6"/><circle cx="13" cy="16.5" r="2.2"/><circle cx="9.5" cy="20" r="1.2"/><circle cx="17" cy="12" r="1"/>'),
  D: ic('<rect x="2.5" y="7" width="16" height="10" rx="5"/><circle cx="7.5" cy="12" r="2"/><path d="M18.5 12h3M21.5 9v6"/>'),
  E: ic('<path d="M2 20l6-9 3 4 3-6 8 11z"/><circle cx="18" cy="5" r="2.2"/><path d="M14.5 5.5c1.5.8 5.5.2 7-1"/>'),
  F: ic('<path d="M2 12h4l2-5 3 10 3-8 2 3h6"/>'),
  flask: ic('<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/><path d="M7.5 15h9"/>'),
  scope: ic('<rect x="2.5" y="4" width="19" height="14" rx="2"/><path d="M5 13c2 0 2-5 4-5s2 7 4 7 2-4 4-4 1.5 2 2 2M8 21h8"/>'),
  chev: ic('<path d="M9 6l6 6-6 6"/>'),
  search: ic('<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/>'),
  down: ic('<path d="M6 9l6 6 6-6"/>'),
};

/* ── menu a cascata: area → esperimenti ─────────────────────────────────── */
let CX = 0;
function cascade(label, current = null, cls = '') {
  const id = 'cx' + (++CX);
  const curArea = current && byId[current] ? byId[current].area : 'A';
  const areas = Object.entries(AREAS).map(([k, a]) => {
    const list = EXPS.filter(e => e.area === k).sort((x, y) => (x.pending - y.pending) || x.module.localeCompare(y.module, 'it', { numeric: true }));
    return { k, a, list };
  });
  return `<div class="lab-cx ${cls}" data-cx>
    <button type="button" class="lab-cx__btn" aria-expanded="false" aria-controls="${id}">
      <span class="lab-cx__led"></span><span class="lab-cx__lab">${esc(label)}</span>${current && byId[current] ? `<span class="lab-cx__cur">${esc(t(byId[current].title))}</span>` : ''}${ICON.down}
    </button>
    <div class="lab-cx__veil" data-cx-close hidden></div>
    <div class="lab-cx__panel" id="${id}" role="dialog" aria-label="${esc(label)}" hidden>
      <div class="lab-cx__sheet"><span>${esc(label)}</span><button type="button" class="lab-cx__x" data-cx-close aria-label="${esc(u('close'))}">×</button></div>
      <ul class="lab-cx__areas">${areas.map(({ k, a, list }) => `<li><button type="button" class="lab-cx__area${k === curArea ? ' is-on' : ''}" data-area="${k}">
        <span class="lab-cx__ic">${ICON[k]}</span><span><b>${k}</b> ${esc(t(a))}</span><em>${list.length}</em>${ICON.chev}</button></li>`).join('')}</ul>
      <div class="lab-cx__items">${areas.map(({ k, a, list }) => `<ul data-for="${k}"${k === curArea ? '' : ' hidden'}>
        <li class="lab-cx__h">${k} · ${esc(t(a))}</li>
        ${list.map(e => `<li><a href="#/exp/${e.id}" class="lab-cx__it${e.id === current ? ' is-cur' : ''}${e.pending ? ' is-pending' : ''}"><code>${e.module}</code><span>${esc(t(e.title))}</span><em class="lab-cx__lv lab-cx__lv--${e.level}">${e.pending ? esc(u('soon')) : e.level === 'base' ? 'BASE' : 'ADV'}</em></a></li>`).join('')}
      </ul>`).join('')}</div>
    </div>
  </div>`;
}
function bindCascades(root = app) {
  root.querySelectorAll('[data-cx]').forEach(cx => {
    const btn = cx.querySelector('.lab-cx__btn'), panel = cx.querySelector('.lab-cx__panel');
    const veil = cx.querySelector('.lab-cx__veil');
    const setOpen = on => { btn.setAttribute('aria-expanded', String(on)); panel.hidden = !on; if (veil) veil.hidden = !on; cx.classList.toggle('is-open', on); document.documentElement.classList.toggle('lab-cx-lock', on && matchMedia('(max-width: 900px)').matches); };
    cx.querySelectorAll('[data-cx-close]').forEach(x => x.addEventListener('click', ev => { ev.stopPropagation(); setOpen(false); btn.focus(); }));
    const show = k => {
      cx.querySelectorAll('.lab-cx__area').forEach(b => b.classList.toggle('is-on', b.dataset.area === k));
      cx.querySelectorAll('.lab-cx__items ul').forEach(l => { l.hidden = l.dataset.for !== k; });
    };
    btn.addEventListener('click', () => setOpen(panel.hidden));
    cx.querySelectorAll('.lab-cx__area').forEach(b => {
      b.addEventListener('click', () => show(b.dataset.area));
      b.addEventListener('mouseenter', () => { if (matchMedia('(hover: hover) and (min-width: 701px)').matches) show(b.dataset.area); });
      b.addEventListener('focus', () => show(b.dataset.area));
    });
    cx.addEventListener('keydown', ev => { if (ev.key === 'Escape' && !panel.hidden) { setOpen(false); btn.focus(); } });
    cx.querySelectorAll('.lab-cx__it').forEach(a => a.addEventListener('click', () => setOpen(false)));
  });
}
document.addEventListener('click', ev => {
  document.querySelectorAll('[data-cx].is-open').forEach(cx => {
    if (!cx.contains(ev.target)) { cx.classList.remove('is-open'); cx.querySelector('.lab-cx__panel').hidden = true; const v = cx.querySelector('.lab-cx__veil'); if (v) v.hidden = true; cx.querySelector('.lab-cx__btn').setAttribute('aria-expanded', 'false'); document.documentElement.classList.remove('lab-cx-lock'); }
  });
});
const REDUCED = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
let BENCH = null;
const benchScore = () => { if (!BENCH) { const r = runAll(); BENCH = { ok: r.filter(x => x.ok).length, n: r.length }; } return BENCH; };

/* ── badge ──────────────────────────────────────────────────────────────── */
function catsOf(e) { return [...new Set(e.models.map(m => MODELS[m]?.cat).filter(Boolean))]; }
function badges(e) {
  let h = `<span class="lb lb--${e.level}">${e.level === 'base' ? 'BASE' : 'ADVANCED'}</span>`;
  if (e.pending) return h + `<span class="lb lb--val">${esc(CATEGORY.VAL[LANG] || CATEGORY.VAL.it).toUpperCase()}</span>`;
  for (const c of catsOf(e)) h += `<span class="lb lb--${CATEGORY[c].id}">${esc(CATEGORY[c][LANG] || CATEGORY[c].it).toUpperCase()}</span>`;
  return h;
}

/* ── archivio locale (solo parametri degli esperimenti, mai dati personali) ─ */
const STORE = 'boylelab_saved_v1';
const loadSaved = () => { try { return JSON.parse(localStorage.getItem(STORE) || '[]'); } catch (e) { return []; } };
const writeSaved = list => { try { localStorage.setItem(STORE, JSON.stringify(list)); return true; } catch (e) { return false; } };

/* ── routing ────────────────────────────────────────────────────────────── */
function parseHash() {
  const h = location.hash.replace(/^#\/?/, '');
  const [path, qs] = h.split('?');
  const q = Object.fromEntries(new URLSearchParams(qs || ''));
  return { parts: path.split('/').filter(Boolean), q };
}
function setTitle(s) { document.title = (s ? s + ' · ' : '') + 'Boyle Lab · Gli Amici di Boyle'; }
function route() {
  document.body.classList.remove('lab-present');
  app.onclick = null;
  const { parts, q } = parseHash();
  app.classList.toggle('is-wide', parts[0] === 'exp');
  const navKey = parts[0] === 'exp' && byId[parts[1]] ? byId[parts[1]].level : (parts[0] || 'home');
  document.querySelectorAll('[data-lab-nav]').forEach(a => a.classList.toggle('is-on', a.dataset.labNav === navKey));
  if (!parts.length) return viewHome();
  if (parts[0] === 'base' || parts[0] === 'advanced') return viewCatalog({ level: parts[0], ...q });
  if (parts[0] === 'catalogo') return viewCatalog(q);
  if (parts[0] === 'exp' && byId[parts[1]]) return viewExp(byId[parts[1]], q);
  if (parts[0] === 'modelli') return viewModels();
  if (parts[0] === 'bibliografia') return viewBiblio();
  return viewHome();
}
let lastRoute = '';
window.addEventListener('hashchange', () => {
  const key = location.hash.split('?')[0];
  if (key === lastRoute && key.startsWith('#/exp/')) return; // cambia solo la query dei parametri
  lastRoute = key; route(); window.scrollTo(0, 0);
});

/* ── viste ──────────────────────────────────────────────────────────────── */
function hero(title, sub) {
  return `<section class="lab-hero"><h1 class="lab-title">${title}</h1>${sub ? `<p class="lab-lead">${sub}</p>` : ''}</section>`;
}
function disclaimer() { return `<p class="lab-disclaimer" role="note"><strong>⚠</strong> ${esc(u('disclaimer'))}</p>`; }

function viewHome() {
  setTitle('');
  const count = (lvl) => EXPS.filter(e => e.level === lvl && !e.pending).length;
  const saved = loadSaved();
  const bs = benchScore();
  const trace = 'M20 30 C 60 150, 110 175, 330 186';
  app.innerHTML = `
    <section class="lab-hero lab-hero--home">
      <div class="lab-bubbles" aria-hidden="true">${Array.from({ length: 14 }, (_, i) => `<i style="--x:${(i * 7.3) % 100}%;--d:${(i * 1.7) % 9}s;--s:${6 + (i * 5) % 9}px;--t:${9 + (i * 3) % 7}s"></i>`).join('')}</div>
      <div class="lab-hero__copy">
        <p class="lab-kicker"><span class="lab-led"></span> ${esc(u('ready'))} · ${bs.ok}/${bs.n} ${LANG === 'en' ? 'tests passed' : 'test superati'}</p>
        <h1 class="lab-title lab-title--fx" aria-label="Boyle Lab"><span class="lt-w" aria-hidden="true">${[...'Boyle'].map((c, i) => `<span class="lt-c" style="--i:${i}">${c}</span>`).join('')}</span> <span class="lt-lab lab-grad" aria-hidden="true">Lab</span><span class="lt-line" aria-hidden="true"></span></h1>
        <p class="lab-lead">${esc(u('lead'))}</p>
        <div class="lab-hero__pick">${cascade(u('go'))}</div>
      </div>
      <div class="lab-hero__scope" aria-hidden="true">
        <div class="lab-scope-mini">
          <div class="lab-scope-mini__bar"><span class="lab-led"></span>CH1 · P·V = k<span>BOYLE</span></div>
          <svg viewBox="0 0 360 220">
            <defs><pattern id="hg" width="30" height="22" patternUnits="userSpaceOnUse"><path d="M30 0H0V22" fill="none" stroke="rgba(123,228,255,.12)"/></pattern></defs>
            <rect width="360" height="220" fill="url(#hg)"/>
            <path d="M20 200H350M20 10V200" stroke="rgba(237,247,255,.35)"/>
            <path class="home-trace" d="${trace}" fill="none" stroke="#7be4ff" stroke-width="2.5"/>
            <circle class="home-dot" r="5" fill="#fff" style="offset-path: path('${trace}')"/>
            <text x="350" y="214" text-anchor="end" font-size="10" fill="rgba(237,247,255,.6)">P (bar)</text>
            <text x="26" y="20" font-size="10" fill="rgba(237,247,255,.6)">V (L)</text>
          </svg>
          <div class="lab-scope-mini__lcd"><span>P <b>2,02</b> bar</span><span>V <b>3,01</b> L</span><span>V₀ <b>6,00</b> L</span></div>
        </div>
      </div>
    </section>
    <div class="lab-paths">
      <a class="lab-path lab-path--base" href="#/base">
        <span class="lab-path__ic">${ICON.flask}</span>
        <span class="lab-path__k"><span class="lab-led"></span>01 · ${count('base')} ${LANG === 'en' ? 'experiments' : 'esperimenti'}</span>
        <h2>${esc(u('baseT'))}</h2><p>${esc(u('baseD'))}</p><span class="lab-path__go">${esc(u('enter'))} →</span>
      </a>
      <a class="lab-path lab-path--adv" href="#/advanced">
        <span class="lab-path__ic">${ICON.scope}</span>
        <span class="lab-path__k"><span class="lab-led lab-led--v"></span>02 · ${count('advanced')} ${LANG === 'en' ? 'modules' : 'moduli'}</span>
        <h2>${esc(u('advT'))}</h2><p>${esc(u('advD'))}</p><span class="lab-path__go">${esc(u('enter'))} →</span>
      </a>
    </div>
    ${disclaimer()}
    <h2 class="lab-h2">${esc(u('areas'))}</h2>
    <div class="lab-areas">${Object.entries(AREAS).map(([k, a]) => {
      const n = EXPS.filter(e => e.area === k).length;
      return `<a class="lab-area" href="#/catalogo?area=${k}"><b>${ICON[k]}</b><span><small>${k}</small>${esc(t(a))}</span><em>${n}</em></a>`;
    }).join('')}</div>
    ${saved.length ? `<h2 class="lab-h2">${esc(u('saved'))}</h2>${savedList(saved)}` : ''}
    <div class="lab-foot-links"><a href="#/modelli">${esc(u('models'))} →</a><a href="#/bibliografia">${esc(u('biblio'))} →</a></div>`;
  bindSaved();
  bindCascades();
}

function card(e) {
  return `<a class="lab-card${e.pending ? ' is-pending' : ''}" href="#/exp/${e.id}">
    <div class="lab-card__top"><span class="lab-card__ic">${ICON[e.area]}</span><code class="lab-card__code">MOD ${e.module}</code></div>
    <div class="lab-card__badges">${badges(e)}</div>
    <h3>${esc(t(e.title))}</h3><p>${esc(t(e.summary))}</p>
    <span class="lab-card__meta">${e.area} · ${esc(t(AREAS[e.area]))}<span class="lab-card__go">${ICON.chev}</span></span>
  </a>`;
}

function viewCatalog(q) {
  setTitle(u('catalog'));
  const st = { level: q.level || '', area: q.area || '', cat: q.cat || '', s: q.s || '' };
  const title = st.level === 'base' ? u('baseT') : st.level === 'advanced' ? u('advT') : u('catalog');
  app.innerHTML = `${hero(esc(title), '')}
    <div class="lab-filters" role="search">
      <label class="lab-search"><span class="sr-only">${esc(u('search'))}</span>${ICON.search.replace('lab-ic', 'lab-ic lab-search__ic')}<input type="search" id="lf-s" placeholder="${esc(u('search'))}" value="${esc(st.s)}" /></label>
      <div class="lab-filters__pick">${cascade(u('pick'))}<span class="lab-filters__hint">${esc(u('pickHint'))}</span></div>
      ${select('lf-level', u('level'), [['', u('all')], ['base', 'BASE'], ['advanced', 'ADVANCED']], st.level)}
      ${select('lf-area', u('area'), [['', u('all')], ...Object.entries(AREAS).map(([k, a]) => [k, k + ' · ' + t(a)])], st.area)}
      ${select('lf-cat', u('status'), [['', u('all')], ...Object.entries(CATEGORY).map(([k, c]) => [k, t(c)])], st.cat)}
    </div>
    <p class="lab-count" id="lf-count" aria-live="polite"></p>
    <div class="lab-grid" id="lf-grid"></div>
    ${disclaimer()}`;
  const apply = () => {
    const s = document.getElementById('lf-s').value.trim().toLowerCase();
    st.level = document.getElementById('lf-level').value; st.area = document.getElementById('lf-area').value; st.cat = document.getElementById('lf-cat').value;
    const list = EXPS.filter(e => (!st.level || e.level === st.level) && (!st.area || e.area === st.area)
      && (!st.cat || (st.cat === 'VAL' ? e.pending : catsOf(e).includes(st.cat) && !e.pending))
      && (!s || [t(e.title), t(e.summary), e.tags, e.module].join(' ').toLowerCase().includes(s)));
    document.getElementById('lf-grid').innerHTML = list.map(card).join('') || `<p class="lab-empty">${esc(u('none'))}</p>`;
    document.getElementById('lf-count').textContent = u('results')(list.length);
  };
  app.querySelectorAll('.lab-filters > .lab-sel select, #lf-s').forEach(el => el.addEventListener('input', apply));
  bindCascades();
  apply();
}
function select(id, label, opts, val) {
  return `<label class="lab-sel"><span>${esc(label)}</span><select id="${id}">${opts.map(([v, l]) => `<option value="${esc(v)}"${v === val ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select></label>`;
}

/* ── banco di lavoro ────────────────────────────────────────────────────── */
let B = null; // esperimento fissato per il confronto { id, params }
function defaults(e) { return Object.fromEntries((e.params || []).map(p => [p.id, p.value])); }
function readParams(e, q) {
  const p = defaults(e);
  for (const d of e.params || []) {
    if (q[d.id] === undefined) continue;
    if (d.type === 'select') { if (d.options.some(o => o.v === q[d.id])) p[d.id] = q[d.id]; }
    else { const v = parseFloat(q[d.id]); if (Number.isFinite(v)) p[d.id] = Math.min(Math.max(v, d.min), d.max); }
  }
  return p;
}

function viewExp(e, q) {
  setTitle(t(e.title));
  if (B && B.id !== e.id) B = null;
  const bs = benchScore();
  const head = `<div class="lab-exp-top"><a class="lab-back" href="#/${e.level}">← ${esc(u(e.level === 'base' ? 'baseT' : 'advT'))}</a>${cascade(u('switchExp'), e.id, 'lab-cx--right')}</div>
    <div class="lab-exp-head"><div class="lab-card__badges">${badges(e)}</div>
    <h1 class="lab-exp-title">${esc(t(e.title))}</h1><p class="lab-lead">${esc(t(e.summary))}</p></div>
    <div class="lab-bench" role="status">
      <span class="lab-bench__on"><span class="lab-led${e.pending ? ' lab-led--off' : ''}"></span>${esc(e.pending ? u('pending') : u('simOn'))}</span>
      <span><small>MOD</small> ${e.module}</span><span class="lab-bench__area">${ICON[e.area]} ${e.area} · ${esc(t(AREAS[e.area]))}</span>
      <a class="lab-bench__motto" href="#/modelli" title="${esc(u('verifiedT')(bs.ok, bs.n))}"><b>${esc(u('motto'))}</b><span class="lab-bench__ok${bs.ok === bs.n ? '' : ' is-ko'}">${bs.ok === bs.n ? '✓' : '✗'} ${esc(u('verified'))}</span></a>
    </div>`;
  if (e.pending) {
    app.innerHTML = head + `<div class="lab-pending"><h2>${esc(u('pending'))}</h2><p>${esc(u('pendingD'))}</p></div>` + scienceCards(e) + disclaimer();
    bindCascades();
    return;
  }
  let p = readParams(e, q);
  app.innerHTML = head + `
    <div class="lab-work" id="lab-work">
      <form class="lab-panel lab-controls" id="lab-controls" aria-label="${esc(u('params'))}" onsubmit="return false">
        <h2 class="lab-ph"><span class="lab-led lab-led--s"></span>${esc(u('params'))}</h2>
        ${(e.params || []).map(control).join('')}
        <div class="lab-toolbar">
          <button type="button" class="lab-btn" data-act="reset">${esc(u('reset'))}</button>
          <button type="button" class="lab-btn" data-act="save">${esc(u('save'))}</button>
          <button type="button" class="lab-btn" data-act="pin" aria-pressed="false">${esc(u('pinB'))}</button>
          <button type="button" class="lab-btn" data-act="share">${esc(u('share'))}</button>
          <button type="button" class="lab-btn" data-act="present">${esc(u('present'))}</button>
        </div>
        <div class="lab-export"><span>${esc(u('exportT'))}</span>
          <button type="button" class="lab-chip" data-exp="csv">CSV</button><button type="button" class="lab-chip" data-exp="json">JSON</button>
          <button type="button" class="lab-chip" data-exp="svg">SVG</button><button type="button" class="lab-chip" data-exp="png">PNG</button>
        </div>
        <p class="lab-toast" id="lab-toast" role="status" aria-live="polite"></p>
      </form>
      <div class="lab-readouts" id="lab-readouts" aria-label="${esc(u('readouts'))}"></div>
      <div class="lab-panel lab-scope"><h2 class="lab-ph"><span class="lab-led lab-led--s"></span>${esc(u('chartT'))}<span class="lab-ph__r">CH1${B ? ' · CH2 (B)' : ''}</span></h2><div id="lab-chart"></div></div>
      <div class="lab-panel lab-instr" id="lab-instr" hidden><h2 class="lab-ph"><span class="lab-led lab-led--s"></span>${esc(u('instrument'))}</h2><div id="lab-visual"></div></div>
      <div class="lab-panel lab-results"><h2 class="lab-ph"><span class="lab-led lab-led--s"></span>${esc(u('results2'))}</h2><div id="lab-out" aria-live="polite"></div><div id="lab-warn"></div></div>
    </div>
    ${disclaimer()}
    <button type="button" class="lab-btn lab-exit" data-act="present" hidden>${esc(u('exitPresent'))}</button>
    ${e.didactic ? didactic(e) : ''}
    ${scienceCards(e)}
    <section class="lab-section"><h2 class="lab-h2">${esc(u('saved'))}</h2><div id="lab-saved"></div></section>`;

  const form = document.getElementById('lab-controls');
  let last = null, timer = 0;
  const render = () => {
    const err = e.validate ? e.validate(p) : null;
    let r;
    try { r = err ? null : e.compute(p); } catch (x) { r = null; }
    const out = document.getElementById('lab-out'), warn = document.getElementById('lab-warn');
    if (!r) { out.innerHTML = `<p class="lab-warn">${esc(err || 'Parametri fuori intervallo.')}</p>`; warn.innerHTML = ''; return; }
    let rb = null;
    if (B) { try { rb = e.compute(B.params); } catch (x) { rb = null; } }
    last = { r, rb };
    /* grafico */
    const ch = document.getElementById('lab-chart');
    if (r.chart.type === 'line') {
      const spec = { ...r.chart.spec, series: [...r.chart.spec.series] };
      if (rb && rb.chart.type === 'line') rb.chart.spec.series.forEach((s2, i) => spec.series.push({ ...s2, name: 'B · ' + s2.name, ghost: true, colorIndex: s2.colorIndex ?? i }));
      patch(ch, lineChart(spec));
    } else patch(ch, barChart(r.chart.spec, { width: Math.round(Math.min(Math.max(ch.clientWidth || 720, 340), 720)) }));
    const ins = document.getElementById('lab-instr');
    ins.hidden = !r.visual; if (r.visual) patch(document.getElementById('lab-visual'), r.visual);
    document.getElementById('lab-work').classList.toggle('no-vis', !r.visual);
    readouts(r);
    /* risultati */
    out.innerHTML = outputsTable(r, rb) + (r.table ? compareTable(r.table) : '');
    const ws = [...(r.warnings || [])];
    warn.innerHTML = ws.map(w => `<p class="lab-warn"><strong>${esc(u('warn'))}:</strong> ${esc(w)}</p>`).join('')
      + (e.didactic?.note ? `<p class="lab-note"><strong>${esc(u('note'))}:</strong> ${esc(e.didactic.note)}</p>` : '');
    /* parametri nell'indirizzo, per condividere e tornare indietro */
    clearTimeout(timer);
    timer = setTimeout(() => {
      const qs = new URLSearchParams(Object.entries(p).map(([k, v]) => [k, String(v)])).toString();
      history.replaceState(null, '', '#/exp/' + e.id + '?' + qs);
      lastRoute = '#/exp/' + e.id;
    }, 250);
  };
  const sync = () => {
    for (const d of e.params) {
      const el = form.querySelector('[name="' + d.id + '"]');
      if (!el) continue;
      if (d.type === 'select') el.value = p[d.id];
      else { el.value = p[d.id]; form.querySelector('[data-num="' + d.id + '"]').value = p[d.id]; }
    }
  };
  form.addEventListener('input', ev => {
    const el = ev.target, id = el.name || el.dataset.num;
    const d = e.params.find(x => x.id === id);
    if (!d) return;
    if (d.type === 'select') p[id] = el.value;
    else {
      const v = parseFloat(el.value);
      if (!Number.isFinite(v)) return;
      p[id] = Math.min(Math.max(v, d.min), d.max);
      if (el.dataset.num) form.querySelector('[name="' + id + '"]').value = p[id];
      else form.querySelector('[data-num="' + id + '"]').value = p[id];
    }
    render();
  });
  form.querySelectorAll('[data-num]').forEach(n => n.addEventListener('change', () => sync()));
  const toast = msg => { const el = document.getElementById('lab-toast'); el.textContent = msg; setTimeout(() => { if (el.textContent === msg) el.textContent = ''; }, 2600); };
  app.onclick = ev => {
    const b = ev.target.closest('[data-act],[data-exp]');
    if (!b || !app.contains(b)) return;
    const act = b.dataset.act;
    if (act === 'reset') { p = defaults(e); sync(); render(); }
    else if (act === 'save') {
      const list = loadSaved();
      const name = (t(e.title) + ' · ' + new Date().toLocaleString(LANG === 'en' ? 'en-GB' : 'it-IT', { dateStyle: 'short', timeStyle: 'short' }));
      list.unshift({ id: e.id, name, params: { ...p }, at: Date.now() });
      writeSaved(list.slice(0, 60)) ? toast(u('savedOk')) : toast('Archivio del browser non disponibile');
      renderSaved(e);
    } else if (act === 'pin') {
      B = B ? null : { id: e.id, params: { ...p } };
      b.textContent = B ? u('unpinB') : u('pinB'); b.setAttribute('aria-pressed', B ? 'true' : 'false');
      document.querySelector('.lab-scope .lab-ph__r').textContent = B ? 'CH1 · CH2 (B)' : 'CH1'; render();
    } else if (act === 'share') {
      const url = location.href;
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => toast(u('copied')), () => toast(url));
    } else if (act === 'present') {
      const on = document.body.classList.toggle('lab-present');
      document.querySelector('.lab-exit').hidden = !on; window.scrollTo(0, 0);
      if (on && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
      if (!on && document.fullscreenElement) document.exitFullscreen().catch(() => {});
    } else if (b.dataset.exp && last) doExport(b.dataset.exp, e, p, last);
  };
  bindQuiz();
  bindCascades();
  render();
  renderSaved(e);
}

/* ── letture digitali: i valori principali, con un breve conteggio ─────── */
const PREV = new Map();
function readouts(r) {
  const box = document.getElementById('lab-readouts'); if (!box) return;
  const list = r.outputs.filter(o => !o.text && Number.isFinite(o.value)).slice(0, 4);
  const sig = list.map(o => o.label + o.unit).join('|');
  if (box.dataset.sig !== sig) {
    box.dataset.sig = sig; PREV.clear();
    box.innerHTML = list.map((o, i) => `<div class="lab-lcd"><span class="lab-lcd__k">${esc(o.label)}</span><b class="lab-lcd__v" data-i="${i}">${fmt(o.value, o.digits)}</b><span class="lab-lcd__u">${esc(o.unit || '')}</span></div>`).join('');
  }
  list.forEach((o, i) => {
    const el = box.querySelector(`[data-i="${i}"]`); if (!el) return;
    const from = PREV.has(i) ? PREV.get(i) : o.value, to = o.value; PREV.set(i, to);
    if (REDUCED() || from === to) { el.textContent = fmt(to, o.digits); return; }
    const t0 = performance.now(), D = 260;
    const step = now => { const k = Math.min((now - t0) / D, 1), e2 = 1 - Math.pow(1 - k, 3); el.textContent = fmt(from + (to - from) * e2, o.digits); if (k < 1 && PREV.get(i) === to) requestAnimationFrame(step); };
    requestAnimationFrame(step);
    el.parentElement.classList.remove('is-tick'); void el.offsetWidth; el.parentElement.classList.add('is-tick');
  });
}

function control(d) {
  const id = 'lc-' + d.id, lab = esc(t(d.label));
  if (d.type === 'select') return `<div class="lab-ctl"><label for="${id}">${lab}</label><select id="${id}" name="${d.id}">${d.options.map(o => `<option value="${esc(o.v)}"${o.v === d.value ? ' selected' : ''}>${esc(t(o.label))}</option>`).join('')}</select></div>`;
  return `<div class="lab-ctl"><div class="lab-ctl__row"><label for="${id}">${lab}${d.unit ? ` <span class="lab-unit">(${esc(d.unit)})</span>` : ''}</label>
    <input class="lab-num" type="number" inputmode="decimal" data-num="${d.id}" min="${d.min}" max="${d.max}" step="${d.step}" value="${d.value}" aria-label="${lab}" /></div>
    <input type="range" id="${id}" name="${d.id}" min="${d.min}" max="${d.max}" step="${d.step}" value="${d.value}" /></div>`;
}

function outputsTable(r, rb) {
  const rows = r.outputs.map((o, i) => {
    const ob = rb?.outputs?.[i];
    const val = o.text ? esc(o.text) : `${fmt(o.value, o.digits)} <span class="lab-unit">${esc(o.unit || '')}</span>`;
    const hint = o.hint !== undefined ? `<small>${fmt(o.hint, 2)} ${esc(o.hintUnit || '')}</small>` : '';
    const note = o.note ? `<small>${esc(o.note)}</small>` : '';
    let bcol = '';
    if (rb) {
      const vb = ob ? (ob.text ? esc(ob.text) : `${fmt(ob.value, ob.digits)} <span class="lab-unit">${esc(ob.unit || '')}</span>`) : '—';
      const dl = ob && !o.text && Number.isFinite(o.value - ob.value) ? (o.value - ob.value >= 0 ? '+' : '') + fmt(o.value - ob.value, o.digits) : '';
      bcol = `<td class="lab-b">${vb}</td><td class="lab-d">${dl}</td>`;
    }
    return `<tr><th scope="row">${esc(o.label)}</th><td>${val}${hint}${note}</td>${bcol}</tr>`;
  }).join('');
  return `<table class="lab-out">${rb ? `<thead><tr><th></th><th>${esc(u('A'))}</th><th>${esc(u('B'))}</th><th>${esc(u('delta'))}</th></tr></thead>` : ''}<tbody>${rows}</tbody></table>`;
}
function compareTable(tb) {
  return `<div class="lab-scroll"><table class="lab-out lab-cmp"><thead><tr>${tb.cols.map(c => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${tb.rows.map(r => `<tr><th scope="row">${esc(r[0])}</th>${r.slice(1).map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function didactic(e) {
  const d = e.didactic, qz = d.quiz;
  return `<section class="lab-section lab-learn"><h2 class="lab-h2">${esc(u('learn'))}</h2>
    <div class="lab-learn__grid">
      <div class="lab-panel"><h3>${esc(u('objective'))}</h3><p>${esc(d.objective)}</p></div>
      <div class="lab-panel"><h3>${esc(u('formula'))}</h3><p class="lab-formula">${esc(d.formula)}</p></div>
      <div class="lab-panel lab-wide"><h3>${esc(u('explain'))}</h3><p>${esc(d.explain)}</p></div>
      <div class="lab-panel lab-wide lab-miscon"><h3>${esc(u('misconception'))}</h3><p>${esc(d.misconception)}</p></div>
      ${qz ? `<form class="lab-panel lab-wide lab-quiz" data-correct="${qz.correct}" onsubmit="return false"><h3>${esc(u('quiz'))}</h3><fieldset><legend>${esc(qz.q)}</legend>
        ${qz.options.map((o, i) => `<label class="lab-opt"><input type="radio" name="qz" value="${i}" /> <span>${esc(o)}</span></label>`).join('')}</fieldset>
        <button type="submit" class="lab-btn">${esc(u('check'))}</button><p class="lab-quiz__fb" role="status" aria-live="polite" data-why="${esc(qz.why)}"></p></form>` : ''}
    </div>
    ${d.next && byId[d.next] ? `<a class="lab-next" href="#/exp/${d.next}">${esc(u('next'))}: ${esc(t(byId[d.next].title))} →</a>` : ''}
  </section>`;
}
function bindQuiz() {
  app.querySelectorAll('.lab-quiz').forEach(f => f.addEventListener('submit', () => {
    const v = f.querySelector('input:checked'); const fb = f.querySelector('.lab-quiz__fb');
    if (!v) return;
    const ok = +v.value === +f.dataset.correct;
    fb.className = 'lab-quiz__fb ' + (ok ? 'is-ok' : 'is-ko');
    fb.textContent = (ok ? u('right') : u('wrong')) + ' ' + fb.dataset.why;
  }));
}

function scienceCards(e) {
  return `<section class="lab-section"><h2 class="lab-h2">${esc(u('science'))}</h2><div class="lab-sci">${e.models.map(id => modelCard(id)).join('')}</div></section>`;
}
function modelCard(id, open = false) {
  const m = MODELS[id]; if (!m) return '';
  const c = CATEGORY[m.cat];
  const li = a => a.length ? `<ul>${a.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '<p>—</p>';
  return `<details class="lab-panel lab-model" id="m-${id}"${open ? ' open' : ''}><summary><span class="lb lb--${c.id}">${esc(t(c)).toUpperCase()}</span> <b>${esc(t(m.name))}</b></summary>
    <dl>
      <dt>${esc(u('objective'))}</dt><dd>${esc(m.objective)}</dd>
      <dt>${esc(u('equations'))}</dt><dd>${m.equations.map(q => `<code>${esc(q)}</code>`).join('<br>')}</dd>
      <dt>${esc(u('variables'))}</dt><dd>${m.variables.length ? `<table class="lab-vars">${m.variables.map(v => `<tr><td><code>${esc(v[0])}</code></td><td>${esc(v[1])}</td><td>${esc(v[2])}</td></tr>`).join('')}</table>` : '—'}</dd>
      <dt>${esc(u('assumptions'))}</dt><dd>${li(m.assumptions)}</dd>
      <dt>${esc(u('validity'))}</dt><dd>${esc(m.range)}</dd>
      <dt>${esc(u('limits'))}</dt><dd>${li(m.limits)}</dd>
      <dt>${esc(u('sources'))}</dt><dd>${m.refs.length ? `<ol class="lab-refs">${m.refs.map(r => refItem(r)).join('')}</ol>` : '—'}</dd>
      <dt>${esc(u('reviewed'))}</dt><dd>${esc(m.reviewed)}</dd>
      <dt>${esc(u('vstatus'))}</dt><dd>${esc(m.status)}${m.tests.length ? ` · ${esc(u('tests'))}: ${m.tests.map(x => `<a href="#/modelli" data-t="${x}"><code>${x}</code></a>`).join(', ')}` : ''}</dd>
    </dl></details>`;
}
function refItem(id) {
  const r = REFS[id]; if (!r) return '';
  const link = refLink(r);
  const ids = [r.pmid ? 'PMID ' + r.pmid : '', r.doi ? 'DOI ' + r.doi : '', r.isbn ? 'ISBN ' + r.isbn : ''].filter(Boolean).join(' · ');
  return `<li>${esc(r.text)}${ids ? ` <span class="lab-refid">${esc(ids)}</span>` : ''}${link ? ` <a href="${esc(link)}" target="_blank" rel="noopener">↗</a>` : ''}</li>`;
}

/* ── salvataggi ─────────────────────────────────────────────────────────── */
function savedList(list) {
  return `<ul class="lab-saved">${list.map((s, i) => byId[s.id] ? `<li><a href="#/exp/${s.id}?${new URLSearchParams(s.params)}">${esc(s.name)}</a> <button type="button" class="lab-chip" data-del="${i}">${esc(u('del'))}</button></li>` : '').join('')}</ul>`;
}
function bindSaved(e) {
  app.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', ev => {
    ev.stopPropagation();
    const list = loadSaved(); list.splice(+b.dataset.del, 1); writeSaved(list);
    e ? renderSaved(e) : viewHome();
  }));
}
function renderSaved(e) {
  const box = document.getElementById('lab-saved'); if (!box) return;
  const list = loadSaved();
  const mine = list.map((s, i) => ({ ...s, i })).filter(s => s.id === e.id);
  box.innerHTML = mine.length ? `<ul class="lab-saved">${mine.map(s => `<li><a href="#/exp/${s.id}?${new URLSearchParams(s.params)}" data-load="${s.i}">${esc(s.name)}</a> <button type="button" class="lab-chip" data-del="${s.i}">${esc(u('del'))}</button></li>`).join('')}</ul>` : `<p class="lab-empty">${esc(u('noSaved'))}</p>`;
  box.querySelectorAll('[data-load]').forEach(a => a.addEventListener('click', () => { lastRoute = ''; }));
  bindSaved(e);
}

/* ── esportazione ───────────────────────────────────────────────────────── */
function download(name, blob) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function doExport(kind, e, p, { r, rb }) {
  const base = 'boyle-lab_' + e.id + '_' + new Date().toISOString().slice(0, 10);
  const svg = document.querySelector('#lab-chart svg');
  if (kind === 'json') {
    const data = { lab: 'Boyle Lab · Gli Amici di Boyle', version: VERSION, url: location.href, exported: new Date().toISOString(), experiment: { id: e.id, title: t(e.title), module: e.module },
      params: p, outputs: r.outputs.map(o => ({ label: o.label, value: o.text ?? o.value, unit: o.unit || '' })), table: r.table || null,
      models: e.models.map(id => ({ id, name: MODELS[id].name.it, category: MODELS[id].cat, status: MODELS[id].status, reviewed: MODELS[id].reviewed })),
      compareB: rb && B ? { params: B.params, outputs: rb.outputs.map(o => ({ label: o.label, value: o.text ?? o.value, unit: o.unit || '' })) } : null,
      disclaimer: UI.it.disclaimer };
    download(base + '.json', new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  } else if (kind === 'csv') {
    const q = v => '"' + String(v).replace(/"/g, '""') + '"';
    const lines = ['# Boyle Lab ' + VERSION + ' · ' + t(e.title), '# ' + UI.it.disclaimer, '', 'parametro;valore'];
    for (const [k, v] of Object.entries(p)) lines.push(q(k) + ';' + q(v));
    lines.push('', 'risultato;valore;unita' + (rb ? ';B' : ''));
    r.outputs.forEach((o, i) => lines.push([q(o.label), q(o.text ?? o.value), q(o.unit || ''), ...(rb ? [q(rb.outputs[i]?.text ?? rb.outputs[i]?.value ?? '')] : [])].join(';')));
    if (r.chart.type === 'line') {
      lines.push('', 'serie;x (' + r.chart.spec.x.unit + ');y (' + r.chart.spec.y.unit + ')');
      for (const s of r.chart.spec.series) for (const pt of s.points) lines.push(q(s.name) + ';' + pt[0] + ';' + pt[1]);
      if (rb && rb.chart.type === 'line') for (const s of rb.chart.spec.series) for (const pt of s.points) lines.push(q('B · ' + s.name) + ';' + pt[0] + ';' + pt[1]);
    } else for (const g of r.chart.spec.groups) for (const v of g.values) lines.push(q(g.label) + ';' + q(v.name) + ';' + v.v);
    download(base + '.csv', new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' }));
  } else if (kind === 'svg' && svg) {
    download(base + '.svg', new Blob([svg.outerHTML], { type: 'image/svg+xml' }));
  } else if (kind === 'png' && svg) {
    const vb = svg.viewBox.baseVal, scale = 2;
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = vb.width * scale; c.height = vb.height * scale;
      const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0, c.width, c.height);
      c.toBlob(b => b && download(base + '.png', b), 'image/png');
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.outerHTML);
  }
}

/* ── registro e validazione ─────────────────────────────────────────────── */
function viewModels() {
  setTitle(u('models'));
  const res = runAll(), ok = res.filter(r => r.ok).length;
  const pending = EXPS.filter(e => e.pending);
  app.innerHTML = hero(esc(u('models')), '') + `
    <section class="lab-section"><h2 class="lab-h2">${esc(u('valT'))}</h2><p>${esc(u('valD'))}</p>
      <p class="lab-score ${ok === res.length ? 'is-ok' : 'is-ko'}">${esc(u('passed')(ok, res.length))}</p>
      <div class="lab-scroll"><table class="lab-out lab-val"><thead><tr><th>ID</th><th>${LANG === 'en' ? 'Case' : 'Caso'}</th><th>${esc(u('expected'))}</th><th>${esc(u('got'))}</th><th>${esc(u('source'))}</th><th></th></tr></thead><tbody>
      ${res.map(r => `<tr id="t-${r.id}"><td><code>${r.id}</code></td><td>${esc(r.what)}</td><td>${fmtNum(r.expected)} ${r.tol < 1e-6 ? (LANG === 'en' ? '(exact)' : '(esatto)') : '± ' + fmtNum(r.tol)} ${esc(r.unit)}</td><td>${r.err ? esc(r.err) : fmtNum(r.got)}</td><td>${esc(r.source)}</td><td>${r.ok ? '<span class="lab-ok">✓</span>' : '<span class="lab-ko">✗</span>'}</td></tr>`).join('')}
      </tbody></table></div></section>
    <section class="lab-section"><h2 class="lab-h2">${esc(u('regT'))}</h2>
      <div class="lab-cats">${Object.values(CATEGORY).map(c => `<p><span class="lb lb--${c.id}">${esc(t(c)).toUpperCase()}</span> ${esc(t(c.desc))}</p>`).join('')}</div>
      <div class="lab-sci">${Object.keys(MODELS).map(id => modelCard(id)).join('')}</div></section>
    <section class="lab-section"><h2 class="lab-h2">${esc(u('unimplemented'))}</h2>
      <ul class="lab-plain">${pending.map(e => `<li><b>${e.module}</b> ${esc(t(e.title))}: ${esc(t(e.summary))}</li>`).join('')}
      <li>${LANG === 'en' ? 'Inert gas kinetics with helium (trimix): planned.' : 'Cinetica dei gas inerti con elio (trimix): prevista.'}</li></ul></section>
    ${disclaimer()}`;
  const hash = parseHash().q.t; if (hash) document.getElementById('t-' + hash)?.scrollIntoView();
}
const fmtNum = v => Number.isFinite(v) ? (Math.abs(v) >= 1000 ? v.toFixed(2) : +v.toPrecision(6)).toLocaleString(LANG === 'en' ? 'en-GB' : 'it-IT', { maximumFractionDigits: 6 }) : '—';

function viewBiblio() {
  setTitle(u('biblio'));
  app.innerHTML = hero(esc(u('biblio')), LANG === 'en' ? 'Every source used by the lab. Articles were checked on PubMed (PMID and DOI).' : 'Tutte le fonti usate dal laboratorio. Gli articoli sono stati controllati su PubMed (PMID e DOI).')
    + `<ol class="lab-refs lab-panel">${Object.keys(REFS).map(refItem).join('')}</ol>` + disclaimer();
}

/* ── cambio lingua dal menu del sito ─────────────────────────────────────── */
window.boyleLabLang = l => { LANG = l; route(); };
route();
lastRoute = location.hash.split('?')[0];
