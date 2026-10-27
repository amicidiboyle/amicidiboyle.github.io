/* Gli Amici di Boyle · Rete di Boyle 3D (BETA, v3) · collegamento con la pagina della Rete
   La pagina e' la Rete vera (candidature, Amici, codice membro, card, matita, eventi):
   qui si aggiunge la scena 3D al posto della hero. Cliccando una persona si apre a destra
   la sua card vera, la stessa della griglia, con tutti i pulsanti funzionanti. */
const AREAS = [
  { id: 'A', name: 'Subacquea', color: '#56B4E9', tags: ['diving', 'subacquea', 'esplorazione'] },
  { id: 'B', name: 'Iperbarica', color: '#2fd6b0', tags: ['iperbarica'] },
  { id: 'C', name: 'Emergenza e area critica', color: '#E69F00', tags: ['critical care', 'emergenza', 'trauma', 'ecmo', 'hems', 'chirurgia', 'mass gathering', 'nursing', 'area critica', 'sar', 'soccorso in ambienti estremi', 'medicina umanitaria'] },
  { id: 'D', name: 'Quota, poli e spazio', color: '#e58fd0', tags: ['space', 'spazio', 'aerospaziale', 'astrobiologia', 'montagna', 'medicina polare', 'medicina delle spedizioni', 'ambienti estremi'] },
  { id: 'E', name: 'Medicina operativa e militare', color: '#F0E442', tags: ['medicina militare', 'medical intelligence', 'droni'] },
  { id: 'F', name: 'Ricerca e altre specialità', color: '#b9a6ff', tags: [] },
];
const FOUNDERS = [
  { name: 'Silvio Zerbi', title: 'Dott.', badge: 'Fondatore', role: 'Fondatore', area: null, thumb: 'founder-silvio-zerbi.webp', img: 'images/silvio.zerbi.jpg' },
  { name: 'Luigi Tarsia', title: 'Ing.', badge: 'Co-fondatore', role: 'Direttore Ingegneria', area: 'F', thumb: 'founder-luigi-tarsia.webp', img: 'images/luigi.tarsia.webp' },
  { name: 'Vincenzo Benenati', title: 'Dott.', badge: 'Co-fondatore', role: 'Responsabile Area Iperbarica', area: 'B', thumb: 'founder-vincenzo-benenati.webp', img: 'images/vincenzo.benenati.webp' },
  { name: 'Dario Nicosia', title: 'Dott.', badge: 'Co-fondatore', role: 'Responsabile Area Diving', area: 'A', thumb: 'founder-dario-nicosia.webp', img: 'images/dario.nicosia.webp' },
  { name: 'Matteo Paganini', title: 'Dott.', badge: 'Co-fondatore', role: 'Capo Ricercatore', area: 'F', thumb: 'founder-matteo-paganini.webp', img: 'images/matteo.paganini.webp' },
];
const areaOf = tags => { for (const t of tags || []) { const k = String(t).trim().toLowerCase(); const a = AREAS.find(a => a.tags.includes(k)); if (a) return a.id; } return 'F'; };
const AREA = Object.fromEntries(AREAS.map(a => [a.id, a]));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const key = n => n.toLowerCase().replace(/\s+/g, '-');
const thumbOf = img => 'assets/rete/thumb/' + img.replace(/\.[a-z]+$/i, '') + '.webp';
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOBILE = matchMedia('(max-width: 760px), (pointer: coarse)').matches;

const stage = document.getElementById('r3dStage');
const panel = document.getElementById('r3dPanel');
const label = document.getElementById('r3dLabel');
const chipsEl = document.getElementById('r3dChips');
const searchEl = document.getElementById('r3dSearch');
const fLabel = p => p.badge === 'Fondatore' ? 'Fondatore' : p.badge + ' · ' + p.role;
const pressEl = document.getElementById('r3dPress');
const zoomBox = document.getElementById('r3dZoom');

let people = [], profiles = {}, net = null, area = null, current = -1, lastProj = null, hoverI = -1;
const cardEls = new Map(); const shownCards = new Set();

(async function init() {
  const [members, prof] = await Promise.all([
    fetch('rete-members.json').then(r => r.json()),
    fetch('rete-profiles.json').then(r => r.json()).catch(() => ({})),
  ]);
  profiles = prof || {};
  const ms = members.map(m => ({ ...m, _thumb: thumbOf(m.img), _area: areaOf(m.tags), founder: false }));
  const fs = FOUNDERS.map(f => ({ ...f, _thumb: 'assets/rete/thumb/' + f.thumb, _area: f.area || null, founder: true, tags: [] }));
  people = [...ms, ...fs];
  renderChips(); initSearch(); initWhy();
  lazy3d(ms, fs);
})();

/* fasce dove la rete non deve passare: titolo in alto, aree in basso */
function safeBands() {
  const S = stage.getBoundingClientRect();
  const hud = document.getElementById('r3dHud').getBoundingClientRect(), ch = chipsEl.getBoundingClientRect();
  const top = Math.max(0, hud.bottom - S.top + 8), bottom = Math.max(0, S.bottom - ch.top + 8);
  stage.style.setProperty('--st', top + 'px'); stage.style.setProperty('--sb', bottom + 'px');
  return { top, bottom };
}
function lazy3d(ms, fs) {
  const ok = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } })();
  if (!ok) { stage.classList.add('is-fallback'); return; }
  const go = async () => {
    try {
      const mod = await import('./rete3d.min.js?v=20261027c');
      net = mod.createNetwork(stage, {
        members: ms, founders: fs, reduced: REDUCED, mobile: MOBILE,
        safe: safeBands,
        onSelect: i => open(i), onHover: i => { hoverI = i; if (net) net.hoverEdges(i); }, onEmpty: () => close(), onFrame: zoomCards,
        onCoreState: (p, v, on) => { pressEl.hidden = !on; if (on) pressEl.innerHTML = `P <b>${p.toFixed(2).replace('.', ',')}</b> bar · V <b>${v.toFixed(2).replace('.', ',')}</b> L <small>P·V = 6 bar·L</small>`; },
      });
      stage.classList.add('is-live');
      tickLabel();
    } catch (e) { console.error(e); stage.classList.add('is-fallback'); }
  };
  const io = new IntersectionObserver(en => { if (en[0].isIntersecting) { io.disconnect(); go(); } }, { rootMargin: '200px' });
  io.observe(stage);
}

/* ── etichetta al passaggio ── */
function tickLabel() {
  requestAnimationFrame(tickLabel);
  const i = hoverI;
  if (i < 0 || !net || i === current || shownCards.has(i)) { label.hidden = true; return; }
  const p = lastProj && lastProj[i], m = people[i];
  if (!p || !p.front) { label.hidden = true; return; }
  label.hidden = false;
  label.style.transform = `translate(${Math.round(p.x)}px, ${Math.round(p.y)}px)`;
  const a = m._area ? AREA[m._area] : null;
  const t = (m.founder ? m.title + ' ' : '') + m.name;
  if (label.dataset.t !== t) { label.dataset.t = t; label.innerHTML = `<b>${esc(t)}</b><span style="--c:${a ? a.color : '#fff'}">${esc(m.founder ? fLabel(m) : a.name)}</span>`; }
}

/* ── aree: i filamenti si colorano solo quando ne scegli una ── */
function renderChips() {
  chipsEl.innerHTML = `<button type="button" class="r3d-chip is-on" data-a="">Tutte</button>` +
    AREAS.map(a => `<button type="button" class="r3d-chip" data-a="${a.id}" style="--c:${a.color}"><i></i>${esc(a.name)}</button>`).join('');
  chipsEl.addEventListener('click', e => {
    const b = e.target.closest('.r3d-chip'); if (!b) return;
    area = b.dataset.a || null;
    chipsEl.querySelectorAll('.r3d-chip').forEach(x => x.classList.toggle('is-on', x === b));
    if (net) { close(true); net.setArea(area); }
    renderList();
  });
}

/* ── scheda: la card vera della griglia, con i suoi pulsanti ── */
function realCard(p) {
  const src = document.querySelector('#membersGrid .member-card[data-key="' + key(p.name) + '"]');
  if (!src) return null;
  const c = src.cloneNode(true);
  [...c.classList].forEach(k => { if (k === 'reveal' || k.startsWith('ms-') || k === 'is-visible') c.classList.remove(k); });
  c.removeAttribute('style'); c.removeAttribute('role');
  c.querySelectorAll('*').forEach(el => { [...el.classList].forEach(k => { if (k.startsWith('ms-')) el.classList.remove(k); }); });
  c.classList.add('r3d-membercard');
  return c;
}
function founderCard(p) {
  const d = document.createElement('article');
  d.className = 'r3d-founder';
  d.innerHTML = `<div class="r3d-founder__photo"><img src="${esc(p.img)}" alt="${esc(p.name)}" /></div>
    <h2>${esc((p.title ? p.title + ' ' : '') + p.name)}</h2><p class="r3d-founder__role">${esc(p.founder ? fLabel(p) : (p.role || ''))}</p>
    ${p.founder ? '<a class="r3d-btn" href="index.html#fondatori">I fondatori →</a>' : ''}`;
  return d;
}
function open(i) {
  const p = people[i]; if (!p) return;
  current = i; label.hidden = true;
  const a = p._area ? AREA[p._area] : null;
  panel.innerHTML = `<button type="button" class="r3d-close" aria-label="Chiudi la scheda">✕</button>
    <p class="r3d-panel__area" style="--c:${a ? a.color : '#fff'}"><i></i>${esc(p.founder ? p.badge + (a ? ' · ' + a.name : '') : a.name)}</p>`;
  const card = p.founder ? founderCard(p) : (realCard(p) || founderCard({ ...p, img: 'assets/rete/' + p.img }));
  panel.appendChild(card);
  const nb = net ? net.neighbors(i) : [];
  if (nb.length) {
    const box = document.createElement('div'); box.className = 'r3d-net';
    box.innerHTML = `<p>Collegati nella rete</p><div>${nb.map(j => { const q = people[j]; return `<button type="button" data-goto="${j}" title="${esc(q.name)}"><img src="${esc(q._thumb)}" alt="" width="40" height="40" /><span>${esc(q.name.split(' ')[0])}</span></button>`; }).join('')}</div>`;
    panel.appendChild(box);
  }
  panel.hidden = false; panel.scrollTop = 0;
  requestAnimationFrame(() => panel.classList.add('is-open'));
  if (net) net.select(i);
}
function close(silent) {
  if (current < 0) return;
  current = -1; panel.classList.remove('is-open');
  setTimeout(() => { if (current < 0) panel.hidden = true; }, 300);
  if (net && silent !== true) net.clear();
}
let panelT = 0, panelIn = false;
panel.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { panelIn = true; clearTimeout(panelT); } });
panel.addEventListener('pointerleave', e => {
  if (e.pointerType !== 'mouse' || !panelIn) return;
  if (document.querySelector('.modal.is-open, .profile-modal.is-open, .edit-modal.is-open, .access-modal.is-open, .email-wall.is-open')) return;
  panelT = setTimeout(() => { panelIn = false; close(); }, 450);
});
panel.addEventListener('click', e => {
  if (e.target.closest('.r3d-close')) return close();
  const nb = e.target.closest('[data-goto]'); if (nb) open(+nb.dataset.goto);
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (document.querySelector('.modal.is-open, .profile-modal.is-open, .edit-modal.is-open, .access-modal.is-open, .email-wall.is-open')) return;
  close();
});

/* ── schede che compaiono avvicinandosi ── */
function zoomCard(i) {
  let el = cardEls.get(i); if (el) return el;
  const p = people[i], a = p._area ? AREA[p._area] : null;
  const pr = profiles[key(p.name)] || {};
  const bio = pr.bio && pr.bio.trim().length > 5 ? pr.bio.trim() : '';
  el = document.createElement('div'); el.className = 'r3d-zc'; el.style.setProperty('--c', a ? a.color : '#fff');
  el.innerHTML = `<b>${esc((p.founder ? p.title + ' ' : '') + p.name)}</b>
    <span class="r3d-zc__a"><i></i>${esc(p.founder ? fLabel(p) : a.name)}</span>
    ${p.founder ? '' : `<span class="r3d-zc__r">${esc(p.role)}</span>`}
    ${p.founder ? '' : `<span class="r3d-zc__t">${(p.tags || []).map(t => `<em>${esc(t)}</em>`).join('')}</span>`}
    ${bio ? `<span class="r3d-zc__b">${esc(bio.length > 220 ? bio.slice(0, 217) + '…' : bio)}</span>` : ''}
    ${p.city ? `<span class="r3d-zc__c">${esc(p.city)}</span>` : ''}
    <button type="button" class="r3d-zc__go">Apri la scheda</button>`;
  el.addEventListener('click', () => open(i));
  zoomBox.appendChild(el); cardEls.set(i, el); return el;
}
function zoomCards(proj) {
  lastProj = proj;
  const W = stage.clientWidth, H = stage.clientHeight;
  const cand = proj.map((p, i) => ({ ...p, i })).filter(p => p.front && p.op > 0.55 && p.px > 30 && p.i !== current && p.x > -50 && p.x < W + 50 && p.y > -50 && p.y < H + 50)
    .sort((a, b) => b.px - a.px).slice(0, MOBILE ? 2 : 3);
  const now = new Set(cand.map(c => c.i));
  for (const i of shownCards) if (!now.has(i)) { const el = cardEls.get(i); if (el) el.classList.remove('is-on'); shownCards.delete(i); }
  cand.forEach(c => {
    const el = zoomCard(c.i);
    const lvl = c.px < 62 ? 's' : c.px < 120 ? 'm' : 'l';
    if (el.dataset.l !== lvl) el.dataset.l = lvl;
    const right = c.x + c.px * 1.1 + 280 < W || c.x < W / 2;
    const x = right ? c.x + c.px * 1.1 : c.x - c.px * 1.1;
    const y = Math.min(Math.max(c.y - 24, 8), H - 40);
    el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px) translateX(${right ? 0 : -100}%)`;
    if (!shownCards.has(c.i)) { el.classList.add('is-on'); shownCards.add(c.i); }
  });
}

/* ── comandi ── */
document.getElementById('r3dTools').addEventListener('click', e => {
  const b = e.target.closest('[data-cmd]'); if (!b || !net) return;
  const c = b.dataset.cmd;
  if (c === 'in') net.zoom(0.8);
  else if (c === 'out') net.zoom(1.25);
  else if (c === 'home') { close(); net.home(); }
  else if (c === 'wave') net.wave();
});
let hintT = 0;
stage.addEventListener('r3d-wheelhint', () => { const h = document.getElementById('r3dHint'); h.hidden = false; clearTimeout(hintT); hintT = setTimeout(() => { h.hidden = true; }, 1600); });
if (/[?&]debug\b/.test(location.search)) window.__r3d = { get proj() { return lastProj; }, people: () => people };

/* ── ESPLORA LA RETE: diagramma a cascata (rete → aree → persone) con linee di energia ── */
const flowEl = document.getElementById('r3dFlow'), flowSvg = document.getElementById('r3dFlowSvg');
const flowAreas = document.getElementById('r3dFlowAreas'), flowCards = document.getElementById('r3dFlowCards');
const flowRoot = document.getElementById('r3dFlowRoot');
const FND = { id: 'FND', name: 'Fondatore e co-fondatori', color: '#ffffff' };
const ALL = { id: 'ALL', name: 'Tutti', color: '#7be4ff' };
let match = null, flowSel = null, lens = null, lensI = -1, lensT = 0;
const inGroup = (p, g) => g === 'ALL' ? true : g === 'FND' ? p.founder : (!p.founder && p._area === g);
function renderAreas() {
  const groups = [ALL, FND, ...AREAS];
  flowAreas.innerHTML = groups.map(g => `<button type="button" class="r3d-fa" data-g="${g.id}" style="--c:${g.color}" aria-pressed="false"><i></i><span>${esc(g.name)}</span></button>`).join('');
}
function cardsFor() {
  if (match) return people.map((p, i) => ({ p, i })).filter(({ i }) => match.has(i));
  if (!flowSel) return [];
  return people.map((p, i) => ({ p, i })).filter(({ p }) => inGroup(p, flowSel))
    .sort((x, y) => (y.p.founder - x.p.founder) || (x.p.founder ? (y.p.badge === 'Fondatore') - (x.p.badge === 'Fondatore') : x.p.name.localeCompare(y.p.name, 'it')));
}
function renderList() {
  closeLens(true);
  flowAreas.querySelectorAll('.r3d-fa').forEach(b => { const on = !match && b.dataset.g === flowSel; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); });
  flowEl.classList.toggle('has-search', !!match); flowEl.classList.toggle('has-sel', !!(flowSel || match));
  const rows = cardsFor();
  flowCards.innerHTML = rows.map(({ p, i }, n) => {
    const a = p._area ? AREA[p._area] : null;
    const col = p.founder ? '#ffffff' : (a ? a.color : '#7be4ff');
    return `<button type="button" class="r3d-mc${p.founder ? ' is-founder' : ''}" data-i="${i}" style="--c:${col};--n:${n}">
      <img src="${esc(p._thumb)}" alt="" width="46" height="46" loading="lazy" />
      <span class="r3d-mc__txt"><b>${esc((p.founder ? p.title + ' ' : '') + p.name)}</b><small>${esc(p.founder ? fLabel(p) : (p.role || (a ? a.name : '')))}</small></span></button>`;
  }).join('') || (match ? '<p class="r3d-empty">Nessuno con questi criteri.</p>' : '');
  requestAnimationFrame(drawFlow);
}
/* linee: dal genitore scende un tronco, corre su un bus sopra ogni riga e cade su ogni figlio */
function rel(el) { const r = el.getBoundingClientRect(), f = flowEl.getBoundingClientRect(); return { x: r.left - f.left, y: r.top - f.top, w: r.width, h: r.height, cx: r.left - f.left + r.width / 2 }; }
function routes(parent, kids, color) {
  if (!kids.length) return '';
  const P = rel(parent), K = kids.map(rel);
  const rows = []; K.forEach((k, j) => { let r = rows.find(r => Math.abs(r.y - k.y) < 6); if (!r) rows.push(r = { y: k.y, items: [] }); r.items.push([k, j]); });
  rows.sort((a, b) => a.y - b.y);
  const gutter = Math.min(...K.map(k => k.x)) - 16;
  let out = '';
  rows.forEach((r, ri) => {
    const busY = r.y - 14;
    r.items.forEach(([k, j]) => {
      const c = kids[j].style.getPropertyValue('--c') || color;
      let d;
      if (ri === 0) { const midY = Math.max(P.y + P.h + 6, busY); d = `M${P.cx},${P.y + P.h} V${midY} H${k.cx} V${k.y}`; }
      else { const y0 = rows[0].y - 14; d = `M${P.cx},${P.y + P.h} V${y0} H${gutter} V${busY} H${k.cx} V${k.y}`; }
      out += `<path class="r3d-fl__base" d="${d}" style="--c:${c}"/><path class="r3d-fl__pulse" d="${d}" pathLength="100" style="--c:${c};--d:${(j * 0.17 % 2.2).toFixed(2)}s"/>`;
    });
  });
  return out;
}
function drawFlow() {
  if (!flowEl || flowEl.closest('[hidden]')) return;
  const f = flowEl.getBoundingClientRect();
  flowSvg.setAttribute('viewBox', `0 0 ${Math.round(f.width)} ${Math.round(f.height)}`);
  flowSvg.setAttribute('width', Math.round(f.width)); flowSvg.setAttribute('height', Math.round(f.height));
  const areaBtns = [...flowAreas.querySelectorAll('.r3d-fa')];
  const cards = [...flowCards.querySelectorAll('.r3d-mc')];
  let html = routes(flowRoot, areaBtns, '#7be4ff');
  if (cards.length) {
    const from = match ? flowRoot : flowAreas.querySelector('.r3d-fa.is-on');
    if (from) html += routes(from, cards, '#7be4ff');
  }
  flowSvg.innerHTML = html;
}
new ResizeObserver(() => requestAnimationFrame(drawFlow)).observe(flowEl);
flowAreas.addEventListener('click', e => {
  const b = e.target.closest('.r3d-fa'); if (!b) return;
  if (match) { searchEl.value = ''; match = null; if (net && net.setMatch) net.setMatch(null); }
  flowSel = flowSel === b.dataset.g ? null : b.dataset.g;
  renderList();
  if (flowSel) setTimeout(() => { const c = flowCards.firstElementChild; if (c && c.getBoundingClientRect().top > innerHeight - 80) c.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'center' }); }, 120);
});

/* lente: la microcard si ingrandisce nella card completa e torna piccola quando ti allontani */
function openLens(mc) {
  const i = +mc.dataset.i; if (lensI === i) return;
  closeLens(true);
  const p = people[i];
  lens = document.createElement('div'); lens.className = 'r3d-lens'; lens.style.setProperty('--c', mc.style.getPropertyValue('--c'));
  lens.innerHTML = '<button type="button" class="r3d-lens__x" aria-label="Chiudi">✕</button>';
  lens.appendChild(p.founder ? founderCard(p) : (realCard(p) || founderCard({ ...p, img: 'assets/rete/' + p.img })));
  const go = document.createElement('button'); go.type = 'button'; go.className = 'r3d-mc__go'; go.textContent = 'Mostra nella sfera'; go.dataset.i = i;
  lens.appendChild(go);
  flowEl.appendChild(lens);
  const M = rel(mc), F = flowEl.getBoundingClientRect(), W = lens.offsetWidth;
  const x = Math.min(Math.max(M.cx - W / 2, 0), F.width - W);
  lens.style.left = x + 'px'; lens.style.top = Math.max(M.y - 24, 0) + 'px';
  lens.style.transformOrigin = `${M.cx - x}px ${M.h / 2 + 24}px`;
  lensI = i; mc.classList.add('is-lensed');
  requestAnimationFrame(() => lens && lens.classList.add('is-on'));
  lens.addEventListener('pointerenter', () => clearTimeout(lensT));
  lens.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { clearTimeout(lensT); lensT = setTimeout(() => closeLens(), 220); } });
}
function closeLens(now) {
  clearTimeout(lensT);
  if (!lens) return;
  const l = lens; lens = null;
  flowCards.querySelectorAll('.is-lensed').forEach(x => x.classList.remove('is-lensed'));
  lensI = -1;
  if (now === true) { l.remove(); return; }
  l.classList.remove('is-on'); setTimeout(() => l.remove(), 260);
}
let hoverT = 0;
flowCards.addEventListener('pointerover', e => {
  if (e.pointerType !== 'mouse') return;
  const mc = e.target.closest('.r3d-mc'); if (!mc) return;
  clearTimeout(hoverT); clearTimeout(lensT);
  hoverT = setTimeout(() => openLens(mc), 260);
});
flowCards.addEventListener('pointerout', e => {
  if (e.pointerType !== 'mouse') return;
  const mc = e.target.closest('.r3d-mc'); if (!mc || mc.contains(e.relatedTarget)) return;
  clearTimeout(hoverT);
  if (lens && !lens.contains(e.relatedTarget)) { clearTimeout(lensT); lensT = setTimeout(() => closeLens(), 220); }
});
flowCards.addEventListener('click', e => { const mc = e.target.closest('.r3d-mc'); if (!mc) return; if (lensI === +mc.dataset.i) closeLens(); else openLens(mc); });
flowEl.addEventListener('click', e => {
  if (!lens) return;
  if (e.target.closest('.r3d-lens__x')) return closeLens();
  const go = e.target.closest('.r3d-mc__go');
  if (go) { const i = +go.dataset.i; closeLens(true); stage.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' }); setTimeout(() => open(i), REDUCED ? 0 : 450); }
});
document.addEventListener('pointerdown', e => { if (lens && !lens.contains(e.target) && !e.target.closest('.r3d-mc') && !e.target.closest('.modal, .profile-modal, .edit-modal, .access-modal, .email-wall')) closeLens(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && lens) closeLens(); });

function initSearch() {
  renderAreas();
  searchEl.addEventListener('input', () => {
    const q = searchEl.value.trim().toLowerCase();
    match = q ? new Set(people.map((p, i) => ((p.name + ' ' + (p.role || '') + ' ' + (p.tags || []).join(' ') + ' ' + (p.city || '') + ' ' + (p._area ? AREA[p._area].name : '') + ' ' + (p.badge || '')).toLowerCase().includes(q) ? i : -1)).filter(i => i >= 0)) : null;
    if (net && net.setMatch) net.setMatch(match);
    renderList();
  });
  /* il pannello si apre a richiesta: la sfera resta protagonista */
  const btn = document.getElementById('r3dExploreBtn'), sec = document.getElementById('members'), body = document.getElementById('r3dExplore');
  const set = o => { sec.classList.toggle('is-closed', !o); body.hidden = !o; btn.setAttribute('aria-expanded', String(o)); if (o) { renderList(); setTimeout(() => searchEl.focus({ preventScroll: true }), 50); } else closeLens(true); };
  btn.addEventListener('click', () => set(body.hidden));
}
/* ── "Cosa significa far parte della Rete": si apre a richiesta ── */
function initWhy() {
  const sec = document.getElementById('amici'), btn = document.getElementById('r3dWhyBtn');
  if (!sec || !btn) return;
  const set = o => { sec.classList.toggle('is-closed', !o); btn.setAttribute('aria-expanded', String(o)); btn.querySelector('b').textContent = o ? 'Chiudi' : 'Scopri cosa offre'; };
  btn.addEventListener('click', () => set(sec.classList.contains('is-closed')));
  if (location.hash === '#amici' || location.hash === '#rete-why') set(true);
  document.addEventListener('click', e => { const a = e.target.closest('a[href="#amici"], a[href="#rete-why"]'); if (a) set(true); });
}
