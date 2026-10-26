/* Gli Amici di Boyle · Rete di Boyle 3D (BETA) · interfaccia
   Elenco, ricerca, filtri e scheda funzionano subito e senza 3D.
   Il motore 3D (rete3d.min.js, con three.js) si carica solo quando la scena entra nello schermo. */
const AREAS = [
  { id: 'A', name: 'Subacquea', color: '#56B4E9', tags: ['diving', 'subacquea', 'esplorazione'] },
  { id: 'B', name: 'Iperbarica', color: '#2fd6b0', tags: ['iperbarica'] },
  { id: 'C', name: 'Emergenza e area critica', color: '#E69F00', tags: ['critical care', 'emergenza', 'trauma', 'ecmo', 'hems', 'chirurgia', 'mass gathering', 'nursing', 'area critica', 'sar', 'soccorso in ambienti estremi', 'medicina umanitaria'] },
  { id: 'D', name: 'Quota, poli e spazio', color: '#e58fd0', tags: ['space', 'spazio', 'aerospaziale', 'astrobiologia', 'montagna', 'medicina polare', 'medicina delle spedizioni', 'ambienti estremi'] },
  { id: 'E', name: 'Medicina operativa e militare', color: '#F0E442', tags: ['medicina militare', 'medical intelligence', 'droni'] },
  { id: 'F', name: 'Ricerca e altre specialità', color: '#b9a6ff', tags: [] },
];
const FOUNDERS = [
  { name: 'Silvio Zerbi', title: 'Dott.', role: 'Fondatore', area: null, thumb: 'founder-silvio-zerbi.webp', img: 'images/silvio.zerbi.jpg' },
  { name: 'Luigi Tarsia', title: 'Ing.', role: 'Direttore Ingegneria', area: 'F', thumb: 'founder-luigi-tarsia.webp', img: 'images/luigi.tarsia.webp' },
  { name: 'Vincenzo Benenati', title: 'Dott.', role: 'Responsabile Area Iperbarica', area: 'B', thumb: 'founder-vincenzo-benenati.webp', img: 'images/vincenzo.benenati.webp' },
  { name: 'Dario Nicosia', title: 'Dott.', role: 'Responsabile Area Diving', area: 'A', thumb: 'founder-dario-nicosia.webp', img: 'images/dario.nicosia.webp' },
  { name: 'Matteo Paganini', title: 'Dott.', role: 'Capo Ricercatore', area: 'F', thumb: 'founder-matteo-paganini.webp', img: 'images/matteo.paganini.webp' },
];
const areaOf = tags => { for (const t of tags || []) { const k = String(t).trim().toLowerCase(); const a = AREAS.find(a => a.tags.includes(k)); if (a) return a.id; } return 'F'; };
const AREA = Object.fromEntries(AREAS.map(a => [a.id, a]));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const key = n => n.toLowerCase().replace(/\s+/g, '-');
const thumbOf = img => 'assets/rete/thumb/' + img.replace(/\.[a-z]+$/i, '') + '.webp';
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOBILE = matchMedia('(max-width: 760px), (pointer: coarse)').matches;

const stage = document.getElementById('r3dStage');
const listEl = document.getElementById('r3dList');
const panel = document.getElementById('r3dPanel');
const label = document.getElementById('r3dLabel');
const searchEl = document.getElementById('r3dSearch');
const chipsEl = document.getElementById('r3dChips');
const hudEl = document.getElementById('r3dHud');
const pressEl = document.getElementById('r3dPress');

let people = [], profiles = {}, net = null, area = null, current = -1;

(async function init() {
  const [members, prof] = await Promise.all([
    fetch('rete-members.json').then(r => r.json()),
    fetch('rete-profiles.json').then(r => r.json()).catch(() => ({})),
  ]);
  profiles = prof || {};
  const ms = members.map(m => ({ ...m, _thumb: thumbOf(m.img), _area: areaOf(m.tags), founder: false }));
  const fs = FOUNDERS.map(f => ({ ...f, _thumb: 'assets/rete/thumb/' + f.thumb, _area: f.area || null, founder: true, tags: [] }));
  people = [...ms, ...fs];      // stesso ordine dei nodi nella scena: prima i membri, poi i fondatori
  renderChips(); renderList(); hud();
  lazy3d(ms, fs);
})();

/* ── 3D su richiesta ── */
function lazy3d(ms, fs) {
  const ok = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } })();
  if (!ok) { stage.classList.add('is-fallback'); return; }
  const go = async () => {
    try {
      const mod = await import('./rete3d.min.js?v=20261026b');
      net = mod.createNetwork(stage, {
        members: ms, founders: fs, reduced: REDUCED, mobile: MOBILE,
        onSelect: i => open(i), onHover: i => hoverLabel(i),
        onCoreState: (p, v, on) => { pressEl.hidden = !on; if (on) pressEl.innerHTML = `P <b>${p.toFixed(2).replace('.', ',')}</b> bar · V <b>${v.toFixed(2).replace('.', ',')}</b> L <small>P·V = 6 bar·L</small>`; },
      });
      stage.classList.add('is-live');
      hud();
      tickLabel();
    } catch (e) { console.error(e); stage.classList.add('is-fallback'); }
  };
  const io = new IntersectionObserver(en => { if (en[0].isIntersecting) { io.disconnect(); go(); } }, { rootMargin: '200px' });
  io.observe(stage);
}

function hud() {
  const n = people.length;
  const edges = net ? net.edgesCount() : 0;
  hudEl.innerHTML = `<span><i class="r3d-led"></i>RETE DI BOYLE · BETA</span><span>NODI <b>${n}</b></span><span>CONNESSIONI <b>${edges || '—'}</b></span><span>AREE <b>${AREAS.length}</b></span>`;
}

/* ── etichetta che segue il nodo sotto il puntatore ── */
let hoverI = -1;
function hoverLabel(i) { hoverI = i; if (net) net.hoverEdges(i); if (i < 0) label.hidden = true; }
function tickLabel() {
  requestAnimationFrame(tickLabel);
  const i = hoverI >= 0 ? hoverI : -1;
  if (i < 0 || !net || i === current) { label.hidden = true; return; }
  const p = net.project(i), m = people[i];
  label.hidden = false;
  label.style.transform = `translate(${Math.round(p.x)}px, ${Math.round(p.y)}px)`;
  const a = m.founder ? null : AREA[m._area];
  const txt = `${m.founder ? m.title + ' ' : ''}${m.name}|${m.founder ? m.role : a.name}`;
  if (label.dataset.t !== txt) { label.dataset.t = txt; label.innerHTML = `<b>${esc((m.founder ? m.title + ' ' : '') + m.name)}</b><span style="--c:${m.founder ? '#fff' : a.color}">${esc(m.founder ? 'Fondatore · ' + m.role : a.name)}</span>`; }
}

/* ── filtri ── */
function renderChips() {
  chipsEl.innerHTML = `<button type="button" class="r3d-chip is-on" data-a="">Tutte le aree</button>` +
    AREAS.map(a => `<button type="button" class="r3d-chip" data-a="${a.id}" style="--c:${a.color}"><i></i>${esc(a.name)} <em>${people.filter(p => !p.founder && p._area === a.id).length}</em></button>`).join('');
  chipsEl.addEventListener('click', e => {
    const b = e.target.closest('.r3d-chip'); if (!b) return;
    area = b.dataset.a || null;
    chipsEl.querySelectorAll('.r3d-chip').forEach(x => x.classList.toggle('is-on', x === b));
    if (net) net.setArea(area);
    renderList();
  });
  searchEl.addEventListener('input', () => {
    const q = searchEl.value.trim().toLowerCase();
    const set = q ? new Set(people.map((p, i) => (p.name + ' ' + (p.role || '') + ' ' + (p.tags || []).join(' ') + ' ' + (p.city || '')).toLowerCase().includes(q) ? i : -1).filter(i => i >= 0)) : null;
    if (net) net.setMatch(set);
    renderList(set);
  });
  searchEl.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const first = listEl.querySelector('[data-i]'); if (first) open(+first.dataset.i);
  });
}

/* ── elenco (sempre disponibile: tastiera, lettori di schermo, motori di ricerca) ── */
function renderList(set) {
  const q = set || null;
  const rows = people.map((p, i) => ({ p, i })).filter(({ p, i }) => (!area || p._area === area || (p.founder && p._area === area)) && (!q || q.has(i)));
  listEl.innerHTML = rows.map(({ p, i }) => {
    const a = p._area ? AREA[p._area] : null;
    return `<li><button type="button" class="r3d-item${p.founder ? ' is-founder' : ''}" data-i="${i}" style="--c:${a ? a.color : '#fff'}">
      <img src="${esc(p._thumb)}" alt="" width="48" height="48" loading="lazy" />
      <span><b>${esc((p.founder ? p.title + ' ' : '') + p.name)}</b><small>${esc(p.founder ? 'Fondatore · ' + p.role : (a ? a.name : ''))}${p.city ? ' · ' + esc(p.city) : ''}</small></span></button></li>`;
  }).join('') || '<li class="r3d-empty">Nessun membro con questi criteri.</li>';
  document.getElementById('r3dCount').textContent = rows.length + (rows.length === 1 ? ' persona' : ' persone');
}
listEl.addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (b) open(+b.dataset.i, true); });

/* ── scheda ── */
const LI = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5zM3 9.75h4V21H3zM9.5 9.75h3.8v1.54h.05c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.78 2.65 4.78 6.1V21h-4v-4.93c0-1.18-.02-2.69-1.64-2.69-1.64 0-1.9 1.28-1.9 2.6V21h-4z"/></svg>';
function open(i, fromList) {
  const p = people[i]; if (!p) return;
  current = i; label.hidden = true;
  const a = p._area ? AREA[p._area] : null;
  const pr = profiles[key(p.name)] || {};
  const bio = pr.bio && pr.bio.trim().length > 5 ? pr.bio.trim() : '';
  const img = p.founder ? p.img : 'assets/rete/' + p.img;
  panel.innerHTML = `
    <button type="button" class="r3d-close" aria-label="Chiudi la scheda">✕</button>
    <div class="r3d-card" style="--c:${a ? a.color : '#ffffff'}">
      <div class="r3d-card__photo"><img src="${esc(img)}" alt="${esc(p.name)}" /></div>
      <p class="r3d-card__area"><i></i>${esc(p.founder ? 'Fondatore' + (a ? ' · ' + a.name : '') : a.name)}</p>
      <h2>${esc((p.founder ? p.title + ' ' : '') + p.name)}</h2>
      ${p.founder ? `<p class="r3d-card__role">${esc(p.role)}</p>` : `<p class="r3d-card__tags">${(p.tags || []).map(t => `<span>${esc(t)}</span>`).join('')}</p><p class="r3d-card__role">${esc(p.role)}</p>`}
      ${bio ? `<p class="r3d-card__bio">${esc(bio.length > 360 ? bio.slice(0, 357) + '…' : bio)}</p>` : ''}
      ${p.city ? `<p class="r3d-card__city">${esc(p.city)}</p>` : ''}
      <div class="r3d-card__links">
        ${p.linkedin && p.linkedin !== 'https://www.linkedin.com/' ? `<a class="r3d-ic" href="${esc(p.linkedin)}" target="_blank" rel="noopener" aria-label="LinkedIn di ${esc(p.name)}">${LI}</a>` : ''}
        <a class="r3d-btn" href="${p.founder ? 'index.html#fondatori' : 'rete.html'}">${p.founder ? 'I fondatori nella home' : 'Scheda completa nella Rete'} →</a>
      </div>
    </div>`;
  panel.hidden = false;
  requestAnimationFrame(() => panel.classList.add('is-open'));
  panel.querySelector('.r3d-close').focus({ preventScroll: true });
  if (net) net.select(i);
  if (fromList) stage.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'center' });
}
function close() {
  if (current < 0) return;
  current = -1; panel.classList.remove('is-open');
  setTimeout(() => { if (current < 0) panel.hidden = true; }, 300);
  if (net) net.clear();
}
panel.addEventListener('click', e => { if (e.target.closest('.r3d-close')) close(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

/* ── comandi della scena ── */
document.getElementById('r3dTools').addEventListener('click', e => {
  const b = e.target.closest('[data-cmd]'); if (!b || !net) return;
  const c = b.dataset.cmd;
  if (c === 'in') net.zoom(0.85);
  else if (c === 'out') net.zoom(1.18);
  else if (c === 'home') { close(); net.home(); }
  else if (c === 'wave') net.wave();
  else if (c === 'rotate') { const on = !net.rotateMode(); net.setRotateMode(on); b.setAttribute('aria-pressed', String(on)); b.textContent = on ? 'Ruota: attivo' : 'Ruota'; }
});
document.getElementById('r3dFounders').addEventListener('change', e => { if (net) net.setFoundersInner(e.target.checked); setTimeout(hud, 50); });
let hintT = 0;
stage.addEventListener('r3d-wheelhint', () => {
  const h = document.getElementById('r3dHint'); h.hidden = false; clearTimeout(hintT); hintT = setTimeout(() => { h.hidden = true; }, 1600);
});
if (MOBILE) {
  document.querySelector('[data-cmd="rotate"]').hidden = false;
  document.querySelector('.r3d-help').textContent = 'Tocca una persona · tocca il nucleo · tienilo premuto · «Ruota» per girare la rete';
}
