/* BOYLE LAB · Strumenti disegnati (SVG)
   Manometri, cilindri con pistone, termometri, colonna d'acqua, camera iperbarica, provette.
   Ogni strumento mostra soltanto valori gia' calcolati dal core: il disegno non calcola nulla.
   Le parti che si muovono usano transform o opacita', cosi' l'aggiornamento (patch) le fa
   scorrere in modo continuo; con "riduci movimento" del sistema restano ferme. */

const clamp = (x, a, b) => Math.min(Math.max(x, a), b);
const f = (v, d = 1) => Number.isFinite(v) ? v.toLocaleString('it-IT', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function rng(seed) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function niceStep(range, target = 6) {
  const raw = range / target, mag = Math.pow(10, Math.floor(Math.log10(raw))), n = raw / mag;
  return (n >= 5 ? 10 : n >= 2 ? 5 : n >= 1 ? 2 : 1) * mag;
}
const TXT = '#edf7ff', MUTED = 'rgba(237,247,255,.62)', CYAN = '#7be4ff', AMBER = '#ffb020';
const svg = (w, h, label, body, cls = '') => `<svg viewBox="0 0 ${w} ${h}" class="lab-visual ${cls}" role="img" aria-label="${esc(label)}" font-family="DM Sans, system-ui, sans-serif">${body}</svg>`;
/* righe di lettura aggiuntive (variabili che il disegno non rappresenta con una forma) */
const info = (lines, x, y, anchor = 'start') => (lines || []).map((t, i) => `<text x="${x}" y="${y + i * 15}" text-anchor="${anchor}" class="iv-lcd" font-size="11" font-weight="700" fill="${i ? '#ffd27a' : '#c9f6ff'}">${esc(t)}</text>`).join('');
const mv = (tf, origin) => `style="transform:${tf}${origin ? ';transform-origin:' + origin : ''}"`;

/* ── manometro analogico ─────────────────────────────────────────────────── */
export function gauge(cx, cy, r, value, max, { unit = '', label = '', digits = 1, red = null, min = 0 } = {}) {
  const span = 270, a0 = -135;
  const frac = clamp((value - min) / (max - min), 0, 1);
  const ang = a0 + span * frac;
  const pt = (deg, rr) => { const t = (deg - 90) * Math.PI / 180; return [cx + rr * Math.cos(t), cy + rr * Math.sin(t)]; };
  const arc = (d1, d2, rr) => { const [x1, y1] = pt(d1, rr), [x2, y2] = pt(d2, rr); return `M${x1.toFixed(1)} ${y1.toFixed(1)}A${rr} ${rr} 0 ${d2 - d1 > 180 ? 1 : 0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`; };
  const step = niceStep(max - min, 5);
  let ticks = '';
  for (let v = min; v <= max + 1e-9; v += step / 2) {
    const major = Math.abs((v - min) / step - Math.round((v - min) / step)) < 1e-6;
    const d = a0 + span * (v - min) / (max - min);
    const [x1, y1] = pt(d, r - 3), [x2, y2] = pt(d, r - (major ? 11 : 7));
    ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${major ? TXT : MUTED}" stroke-width="${major ? 1.6 : 1}"/>`;
    if (major && r >= 40) { const [tx, ty] = pt(d, r - 21); ticks += `<text x="${tx.toFixed(1)}" y="${(ty + 3).toFixed(1)}" text-anchor="middle" font-size="${r > 45 ? 9 : 8}" fill="${MUTED}">${(+v.toPrecision(4)).toLocaleString('it-IT')}</text>`; }
  }
  const redArc = red !== null && red < max ? `<path d="${arc(a0 + span * clamp((red - min) / (max - min), 0, 1), a0 + span, r - 5)}" stroke="#D55E00" stroke-width="5" fill="none" opacity=".85"/>` : '';
  return `<g class="iv-gauge">
    <circle cx="${cx}" cy="${cy}" r="${r + 5}" fill="#020b18" stroke="rgba(123,228,255,.35)" stroke-width="2"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#iv-face)"/>
    <path d="${arc(a0, a0 + span, r - 5)}" stroke="rgba(123,228,255,.18)" stroke-width="5" fill="none"/>
    <path d="${arc(a0, a0 + span * Math.max(frac, 0.0001), r - 5)}" stroke="${CYAN}" stroke-width="5" fill="none" class="iv-arc"/>
    ${redArc}${ticks}
    <g class="iv-mv" ${mv(`rotate(${ang.toFixed(2)}deg)`, `${cx}px ${cy}px`)}><path d="M${cx - 2.6} ${cy + 9}L${cx} ${cy - r + 9}L${cx + 2.6} ${cy + 9}Z" fill="${AMBER}"/></g>
    <circle cx="${cx}" cy="${cy}" r="4.5" fill="${AMBER}"/>
    <rect x="${cx - 40}" y="${cy + r + 9}" width="80" height="20" rx="6" fill="#020b18" stroke="rgba(123,228,255,.3)"/>
    <text x="${cx}" y="${cy + r + 23}" text-anchor="middle" class="iv-lcd" font-size="12" font-weight="700" fill="#c9f6ff">${f(value, digits)} ${esc(unit)}</text>
    ${label ? `<text x="${cx}" y="${cy + r + 42}" text-anchor="middle" font-size="9" letter-spacing="1.2" fill="${MUTED}">${esc(label.toUpperCase())}</text>` : ''}
  </g>`;
}
const DEFS = `<defs>
  <radialGradient id="iv-face" cx="50%" cy="40%" r="65%"><stop offset="0" stop-color="#0d2a4c"/><stop offset="1" stop-color="#03101f"/></radialGradient>
  <linearGradient id="iv-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c7fc0"/><stop offset=".55" stop-color="#0a3a6a"/><stop offset="1" stop-color="#03142c"/></linearGradient>
  <linearGradient id="iv-steel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1b3554"/><stop offset=".45" stop-color="#3b6488"/><stop offset="1" stop-color="#132a45"/></linearGradient>
  <linearGradient id="iv-glass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="rgba(168,238,255,.16)"/><stop offset=".3" stop-color="rgba(168,238,255,.05)"/><stop offset="1" stop-color="rgba(168,238,255,.12)"/></linearGradient>
  <linearGradient id="iv-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#020a1c"/><stop offset="1" stop-color="#0d3157"/></linearGradient>
</defs>`;

/* ── termometro ──────────────────────────────────────────────────────────── */
export function thermometer(x, y, h, tC, min, max) {
  const fr = clamp((tC - min) / (max - min), 0, 1);
  return `<g class="iv-thermo">
    <rect x="${x - 6}" y="${y}" width="12" height="${h}" rx="6" fill="#020b18" stroke="rgba(123,228,255,.4)"/>
    <rect x="${x - 3}" y="${y + 4}" width="6" height="${h - 4}" rx="3" fill="#D55E00" class="iv-mv" ${mv(`scaleY(${fr.toFixed(3)})`, `${x}px ${y + h}px`)}/>
    <circle cx="${x}" cy="${y + h + 8}" r="10" fill="#D55E00" stroke="rgba(123,228,255,.4)"/>
    <text x="${x}" y="${y - 8}" text-anchor="middle" class="iv-lcd" font-size="11" fill="${TXT}">${f(tC, 0)} °C</text>
  </g>`;
}

/* ── colonna d'acqua con subacqueo e pallone ─────────────────────────────── */
export function waterColumn({ depth, maxDepth = 40, vol, v0, ref = null, pBar, arrows = null, label }) {
  const top = 34, H = 300, yOf = d => top + d / maxDepth * H;
  const y = yOf(depth), s = vol > 0.001 ? Math.cbrt(vol / (ref || v0)) : 0;
  let ticks = '';
  const st = maxDepth > 30 ? 10 : 5;
  for (let d = 0; d <= maxDepth; d += st) ticks += `<line x1="40" x2="50" y1="${yOf(d)}" y2="${yOf(d)}" stroke="${MUTED}"/><text x="36" y="${yOf(d) + 4}" text-anchor="end" font-size="10" fill="${MUTED}">${d} m</text>`;
  const r = rng(7); let bub = '';
  for (let i = 0; i < 9; i++) bub += `<circle class="iv-bub" cx="${(70 + r() * 210).toFixed(0)}" cy="${top + H - 6}" r="${(1.5 + r() * 2.5).toFixed(1)}" style="--d:${(i * 0.9).toFixed(1)}s;--t:${(5 + r() * 4).toFixed(1)}s"/>`;
  let arr = '';
  if (arrows) {
    const k = 60 / Math.max(arrows.max, 0.1);
    const up = clamp(arrows.up * k, 0, 70), dn = clamp(arrows.down * k, 0, 70);
    arr = `<g class="iv-mv" ${mv(`scaleY(${(up / 60).toFixed(3)})`, '0px -10px')}><line x1="-48" y1="-10" x2="-48" y2="-70" stroke="#009E73" stroke-width="4"/><path d="M-55 -64L-48 -76L-41 -64Z" fill="#009E73"/></g>
      <g class="iv-mv" ${mv(`scaleY(${(dn / 60).toFixed(3)})`, '0px 10px')}><line x1="-48" y1="10" x2="-48" y2="70" stroke="#D55E00" stroke-width="4"/><path d="M-55 64L-48 76L-41 64Z" fill="#D55E00"/></g>
      <text x="-60" y="-30" text-anchor="end" font-size="9" fill="#6fe0bd">spinta</text><text x="-60" y="38" text-anchor="end" font-size="9" fill="#ff9f80">peso</text>`;
  }
  return svg(300, 350, label, `${DEFS}
    <rect x="50" y="${top}" width="242" height="${H + 6}" rx="6" fill="url(#iv-water)"/>
    <g opacity=".5"><path class="iv-ray" d="M90 ${top}L120 ${top}L70 ${top + 220}L40 ${top + 220}Z" fill="rgba(168,238,255,.10)"/>
    <path class="iv-ray iv-ray--b" d="M180 ${top}L215 ${top}L190 ${top + 260}L150 ${top + 260}Z" fill="rgba(168,238,255,.08)"/></g>
    <path class="iv-wave" d="M50 ${top}q15 -5 30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0" stroke="#a8eeff" stroke-width="2" fill="none"/>
    <path d="M50 ${top + H + 6}V${top + H - 8}q40 -10 80 -2t80 -4t82 2V${top + H + 6}Z" fill="#0c2236"/>
    ${bub}${ticks}
    <g class="iv-mv" style="transform:translateY(${y.toFixed(1)}px)"><line x1="50" x2="292" y1="0" y2="0" stroke="rgba(255,255,255,.28)" stroke-dasharray="3 4"/></g>
    <g class="iv-mv" ${mv(`translate(185px, ${y.toFixed(1)}px)`)}>
      <line x1="0" y1="-8" x2="0" y2="-36" stroke="rgba(237,247,255,.6)"/>
      <g class="iv-mv" ${mv(`translate(0px,-58px) scale(${s.toFixed(3)})`, '0px 0px')}><circle r="22" fill="rgba(168,238,255,.22)" stroke="#a8eeff" stroke-width="2"/><ellipse cx="-7" cy="-8" rx="5" ry="3" fill="rgba(255,255,255,.35)"/></g>
      <text x="34" y="-54" font-size="12" font-weight="700" fill="${TXT}" class="iv-lcd">${f(vol, 2)} L</text>
      <g fill="#0b2340" stroke="${CYAN}" stroke-width="1.4">
        <rect x="-16" y="-15" width="30" height="8" rx="4" fill="#3b6488"/>
        <ellipse cx="0" cy="0" rx="24" ry="7.5"/><circle cx="29" cy="-3" r="6.5"/>
        <path d="M-24 -2L-44 -9L-42 7Z"/>
      </g>
      <text x="0" y="24" text-anchor="middle" font-size="11" fill="#a8eeff" class="iv-lcd">${f(pBar, 2)} bar</text>
      ${arr}
    </g>`);
}

/* ── camera iperbarica con manometro ─────────────────────────────────────── */
export function chamber({ ata, gas, gasText = null, max = 3, lines = null, label }) {
  const tint = 0.05 + clamp((ata - 1) / (max - 1), 0, 1) * 0.32;
  const r = rng(3); let part = '';
  for (let i = 0; i < 10; i++) part += `<circle class="iv-drift" cx="${(46 + r() * 150).toFixed(0)}" cy="${(108 + r() * 70).toFixed(0)}" r="${(1.2 + r() * 1.6).toFixed(1)}" style="--d:${(i * 0.7).toFixed(1)}s" fill="${gas === 'o2' ? '#a8eeff' : 'rgba(237,247,255,.6)'}"/>`;
  return svg(300, 250, label, `${DEFS}
    <rect x="16" y="88" width="214" height="112" rx="56" fill="url(#iv-steel)" stroke="rgba(123,228,255,.5)" stroke-width="2"/>
    <rect x="26" y="98" width="194" height="92" rx="46" fill="#04162c"/>
    <rect x="26" y="98" width="194" height="92" rx="46" fill="#7be4ff" style="fill-opacity:${tint.toFixed(3)}" class="iv-fade"/>
    <rect x="70" y="150" width="110" height="18" rx="9" fill="rgba(237,247,255,.16)"/><circle cx="64" cy="152" r="9" fill="rgba(237,247,255,.2)"/>
    ${part}
    <circle cx="214" cy="144" r="18" fill="#020b18" stroke="rgba(123,228,255,.6)" stroke-width="3"/><circle cx="214" cy="144" r="11" fill="rgba(123,228,255,.15)"/>
    <rect x="40" y="200" width="12" height="20" fill="#1b3554"/><rect x="190" y="200" width="12" height="20" fill="#1b3554"/>
    ${gauge(252, 50, 38, ata, max, { unit: 'ATA', digits: 2, min: 1 })}
    ${info(lines, 16, 24)}
    <text x="122" y="238" text-anchor="middle" font-size="11" fill="${MUTED}">${gasText || (gas === 'o2' ? 'O₂ 100%' : 'Aria')} · ≈ ${f((ata - 1) * 10, 1)} m equivalenti</text>`);
}

/* ── cilindro con pistone (Boyle, Charles) ───────────────────────────────── */
export function piston({ frac, pBar = null, pMax = 6, vol, unitV = 'L', tC = null, tMin = -40, tMax = 100, label }) {
  const x0 = 46, w = 118, bot = 280, Hmax = 220;
  const h = 12 + clamp(frac, 0, 1) * (Hmax - 12);
  const r = rng(11); let dots = '';
  for (let i = 0; i < 28; i++) {
    const dx = x0 + 10 + r() * (w - 20), fy = r();
    dots += `<g class="iv-mv" style="transform:translate(${dx.toFixed(1)}px, ${(bot - 6 - fy * (h - 14)).toFixed(1)}px)"><circle class="iv-jit" r="2.2" fill="#a8eeff" style="--d:${(r() * 2).toFixed(2)}s"/></g>`;
  }
  return svg(300, 300, label, `${DEFS}
    <rect x="${x0 - 6}" y="${bot - Hmax - 20}" width="${w + 12}" height="${Hmax + 26}" rx="10" fill="url(#iv-glass)" stroke="rgba(123,228,255,.45)" stroke-width="2"/>
    <rect x="${x0}" y="${bot - Hmax}" width="${w}" height="${Hmax}" fill="#7be4ff" fill-opacity=".16" class="iv-mv" ${mv(`scaleY(${(h / Hmax).toFixed(4)})`, `0px ${bot}px`)}/>
    ${dots}
    <g class="iv-mv" ${mv(`translateY(${(bot - h).toFixed(1)}px)`)}>
      <rect x="${x0 + w / 2 - 6}" y="-320" width="12" height="320" fill="url(#iv-steel)"/>
      <rect x="${x0 - 2}" y="-14" width="${w + 4}" height="14" rx="3" fill="url(#iv-steel)" stroke="rgba(123,228,255,.5)"/>
    </g>
    <text x="${x0 + w / 2}" y="${bot + 16}" text-anchor="middle" class="iv-lcd" font-size="13" font-weight="700" fill="${TXT}">${f(vol, 2)} ${unitV}</text>
    ${pBar !== null ? gauge(238, 92, 44, pBar, pMax, { unit: 'bar', digits: 2, label: 'pressione' }) : ''}
    ${tC !== null ? thermometer(238, 70, 150, tC, tMin, tMax) : ''}`);
}

/* ── bombola al sole (Gay-Lussac) ────────────────────────────────────────── */
export function tank({ pRel, pMax = 330, tC, tMin = -10, tMax = 70, label }) {
  const sun = clamp((tC - tMin) / (tMax - tMin), 0, 1);
  return svg(300, 300, label, `${DEFS}
    <g class="iv-fade" style="opacity:${(0.15 + sun * 0.85).toFixed(2)}"><circle cx="46" cy="44" r="18" fill="#F0E442"/>
    ${Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4; return `<line x1="${46 + Math.cos(a) * 24}" y1="${44 + Math.sin(a) * 24}" x2="${46 + Math.cos(a) * 32}" y2="${44 + Math.sin(a) * 32}" stroke="#F0E442" stroke-width="2.5"/>`; }).join('')}</g>
    <rect x="96" y="58" width="16" height="16" fill="#3b6488"/><rect x="88" y="50" width="32" height="10" rx="3" fill="url(#iv-steel)"/>
    <path d="M70 110a34 34 0 0 1 68 0V268a12 12 0 0 1 -12 12H82a12 12 0 0 1 -12 -12Z" fill="url(#iv-steel)" stroke="rgba(123,228,255,.5)" stroke-width="2"/>
    <rect x="70" y="120" width="68" height="18" fill="#E69F00" opacity=".55"/>
    ${thermometer(166, 120, 130, tC, tMin, tMax)}
    ${gauge(238, 92, 46, pRel, pMax, { unit: 'bar', digits: 0, label: 'manometro' })}`);
}

/* ── colonna delle pressioni parziali (Dalton) ───────────────────────────── */
export function gasStack({ parts, maxTotal, title, label }) {
  const x = 96, w = 84, bot = 282, H = 236;
  let acc = 0, segs = '', labs = '';
  parts.forEach((p, i) => {
    const h = p.value / maxTotal * H, y = bot - acc - h;
    segs += `<rect x="${x}" y="${(bot - H).toFixed(1)}" width="${w}" height="${H}" fill="${p.color}" class="iv-mv" style="transform:translateY(${(y - (bot - H)).toFixed(1)}px) scaleY(${(h / H).toFixed(4)});transform-origin:0 ${bot - H}px" opacity=".85"/>`;
    labs += `<g class="iv-mv" style="transform:translateY(${(y + h / 2).toFixed(1)}px)"><line x1="${x + w}" x2="${x + w + 14}" y1="0" y2="0" stroke="${p.color}"/><text x="${x + w + 18}" y="4" font-size="12" fill="${TXT}" class="iv-lcd">${esc(p.name)} ${f(p.value, 2)}</text></g>`;
    acc += h;
  });
  let ticks = '';
  const step = niceStep(maxTotal, 6);
  for (let v = 0; v <= maxTotal + 1e-9; v += step) { const yy = bot - v / maxTotal * H; ticks += `<line x1="${x - 8}" x2="${x}" y1="${yy}" y2="${yy}" stroke="${MUTED}"/><text x="${x - 12}" y="${yy + 4}" text-anchor="end" font-size="10" fill="${MUTED}">${+v.toPrecision(3)}</text>`; }
  return svg(300, 300, label, `${DEFS}
    <text x="${x + w / 2}" y="22" text-anchor="middle" font-size="10" letter-spacing="1.2" fill="${MUTED}">${esc(title.toUpperCase())}</text>
    <rect x="${x - 3}" y="${bot - H - 3}" width="${w + 6}" height="${H + 6}" rx="6" fill="#020b18" stroke="rgba(123,228,255,.35)"/>
    ${segs}${ticks}${labs}`);
}

/* ── emoglobina: 5 molecole × 4 siti ─────────────────────────────────────── */
function hbRow(x, y, sat, title, cols = 5) {
  const n = Math.round(clamp(sat, 0, 1) * 20);
  let s = `<text x="${x}" y="${y - 10}" font-size="10" letter-spacing="1" fill="${MUTED}">${esc(title.toUpperCase())}</text>`;
  for (let m = 0; m < 5; m++) {
    const mx = x + (m % cols) * 50, my = y + Math.floor(m / cols) * 50;
    s += `<rect x="${mx}" y="${my}" width="42" height="42" rx="12" fill="#3a0d1a" stroke="rgba(255,140,160,.45)"/>`;
    for (let k = 0; k < 4; k++) {
      const on = m * 4 + k < n;
      s += `<circle cx="${mx + 12 + (k % 2) * 18}" cy="${my + 12 + Math.floor(k / 2) * 18}" r="6" fill="#56B4E9" class="iv-fade" style="opacity:${on ? 1 : 0.12}"/>`;
    }
  }
  return s;
}

/* ── provetta di plasma + emoglobina (Henry) ─────────────────────────────── */
export function plasma({ dissolved, maxDissolved = 6.6, sat, hb = null, bound = null, label }) {
  const N = 66, k = Math.round(clamp(dissolved / maxDissolved, 0, 1) * N);
  const r = rng(5); let dots = '';
  for (let i = 0; i < N; i++) dots += `<circle cx="${(36 + r() * 56).toFixed(1)}" cy="${(70 + r() * 196).toFixed(1)}" r="2.3" fill="#a8eeff" class="iv-fade" style="opacity:${i < k ? 0.95 : 0.06}"/>`;
  return svg(300, 300, label, `${DEFS}
    <text x="64" y="40" text-anchor="middle" font-size="10" letter-spacing="1" fill="${MUTED}">PLASMA</text>
    <path d="M28 52H100V250a36 36 0 0 1 -72 0Z" fill="rgba(240,228,66,.10)" stroke="rgba(123,228,255,.5)" stroke-width="2"/>
    ${dots}
    <text x="64" y="296" text-anchor="middle" class="iv-lcd" font-size="12" fill="${TXT}">${f(dissolved, 2)} mL/dL</text>
    ${hbRow(160, 78, sat, 'emoglobina', 2)}
    <text x="206" y="262" text-anchor="middle" class="iv-lcd" font-size="12" font-weight="700" fill="${TXT}">${f(sat * 100, 1)} %</text>
    <text x="206" y="280" text-anchor="middle" font-size="10" fill="${MUTED}">siti dell'Hb occupati</text>
    ${hb !== null ? info(['Hb ' + f(hb, 1) + ' g/dL', 'legato ' + f(bound, 2) + ' mL/dL'], 292, 18, 'end') : ''}`);
}

export function hbCompare({ s1, s2, t1, t2, label }) {
  return svg(300, 230, label, `
    ${hbRow(26, 56, s1, t1)}<text x="268" y="46" text-anchor="end" class="iv-lcd" font-size="13" font-weight="700" fill="#c9f6ff">${f(s1 * 100, 1)}%</text>
    ${hbRow(26, 160, s2, t2)}<text x="268" y="150" text-anchor="end" class="iv-lcd" font-size="13" font-weight="700" fill="#c9f6ff">${f(s2 * 100, 1)}%</text>`);
}

/* ── montagna con altimetro e barometro ──────────────────────────────────── */
export function mountain({ alt, maxAlt = 9000, pb, lines = null, label }) {
  const base = [30, 270], peak = [196, 70];
  const fr = clamp(alt / 8849, 0, 1);
  const above = alt > 8849;
  const x = base[0] + (peak[0] - base[0]) * fr, y = above ? peak[1] - (alt - 8849) / (maxAlt - 8849 || 1) * 50 : base[1] + (peak[1] - base[1]) * fr;
  return svg(300, 300, label, `${DEFS}
    <rect x="0" y="0" width="300" height="300" rx="10" fill="url(#iv-sky)"/>
    ${Array.from({ length: 14 }, (_, i) => `<circle cx="${(i * 37) % 290 + 6}" cy="${(i * 53) % 120 + 12}" r="1" fill="rgba(255,255,255,.5)"/>`).join('')}
    <path d="M0 282L30 270L120 150L150 176L196 70L238 140L262 120L300 190V300H0Z" fill="#0b2a47" stroke="rgba(123,228,255,.35)"/>
    <path d="M196 70L180 100L190 96L198 108L206 96L214 102Z" fill="rgba(237,247,255,.8)"/>
    <g class="iv-mv" ${mv(`translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`)}>
      <circle r="11" fill="rgba(255,176,32,.18)" class="iv-pulse"/><circle r="5" fill="${AMBER}"/>
      <text x="${x > 150 ? -12 : 12}" y="-10" text-anchor="${x > 150 ? 'end' : 'start'}" class="iv-lcd" font-size="12" font-weight="700" fill="${TXT}">${Math.round(alt).toLocaleString('it-IT')} m</text>
    </g>
    ${gauge(64, 62, 36, pb, 800, { unit: "mmHg", digits: 0 })}
    ${info(lines, 290, 22, 'end')}
    <text x="12" y="294" font-size="9" fill="${MUTED}">Atmosfera standard ISA · vetta 8849 m</text>`);
}

/* ── scatole di molecole (densita') ──────────────────────────────────────── */
export function densityBoxes({ items, maxRho, label }) {
  const N = 90;
  const box = (x, it, seed) => {
    const r = rng(seed), k = Math.round(clamp(it.rho / maxRho, 0, 1) * N);
    let d = '';
    for (let i = 0; i < N; i++) d += `<circle cx="${(x + 8 + r() * 104).toFixed(1)}" cy="${(52 + r() * 184).toFixed(1)}" r="2.4" fill="${it.color}" class="iv-fade iv-jit" style="opacity:${i < k ? 0.95 : 0.04};--d:${(r() * 2).toFixed(2)}s"/>`;
    return `<rect x="${x}" y="44" width="120" height="200" rx="8" fill="#020b18" stroke="rgba(123,228,255,.35)"/>${d}
      <text x="${x + 60}" y="32" text-anchor="middle" font-size="11" letter-spacing="1" fill="${MUTED}">${esc(it.name.toUpperCase())}</text>
      <text x="${x + 60}" y="266" text-anchor="middle" class="iv-lcd" font-size="13" font-weight="700" fill="${TXT}">${f(it.rho, 2)} g/L</text>`;
  };
  return svg(300, 290, label, items.map((it, i) => box(20 + i * 140, it, 21 + i)).join(''));
}

/* ── compartimenti (cinetica) ────────────────────────────────────────────── */
export function compartments({ tensions, pamb, maxP, halfTimes, title, label }) {
  const x0 = 40, bot = 250, H = 200, bw = 13;
  let bars = '';
  tensions.forEach((t, i) => {
    const h = clamp(t / maxP, 0, 1) * H;
    bars += `<rect x="${x0 + i * 15.5}" y="${bot - H}" width="${bw}" height="${H}" fill="${CYAN}" opacity="${(0.45 + 0.55 * (1 - i / 16)).toFixed(2)}" class="iv-mv" style="transform:scaleY(${(h / H).toFixed(4)});transform-origin:0 ${bot}px"/>`;
    if (i % 3 === 0 || i === 15) bars += `<text x="${x0 + i * 15.5 + bw / 2}" y="${bot + 14}" text-anchor="middle" font-size="8" fill="${MUTED}">${String(halfTimes[i]).replace('.', ',')}</text>`;
  });
  const ya = bot - clamp(pamb / maxP, 0, 1) * H;
  let ticks = '';
  const step = niceStep(maxP, 5);
  for (let v = 0; v <= maxP + 1e-9; v += step) { const yy = bot - v / maxP * H; ticks += `<line x1="${x0 - 6}" x2="${x0 - 2}" y1="${yy}" y2="${yy}" stroke="${MUTED}"/><text x="${x0 - 9}" y="${yy + 3}" text-anchor="end" font-size="9" fill="${MUTED}">${+v.toPrecision(3)}</text>`; }
  return svg(300, 290, label, `
    <text x="150" y="22" text-anchor="middle" font-size="10" letter-spacing="1" fill="${MUTED}">${esc(title.toUpperCase())}</text>
    <rect x="${x0 - 4}" y="${bot - H - 4}" width="${16 * 15.5 + 4}" height="${H + 8}" rx="6" fill="#020b18" stroke="rgba(123,228,255,.3)"/>
    ${bars}${ticks}
    <g class="iv-mv" style="transform:translateY(${ya.toFixed(1)}px)"><line x1="${x0 - 4}" x2="${x0 + 16 * 15.5}" y1="0" y2="0" stroke="${AMBER}" stroke-width="2" stroke-dasharray="5 4"/><text x="${x0 + 16 * 15.5}" y="-5" text-anchor="end" font-size="10" fill="${AMBER}">P ambiente ${f(pamb, 2)} bar</text></g>
    <text x="150" y="282" text-anchor="middle" font-size="9" fill="${MUTED}">emitempo dei compartimenti (min) · tensione N₂ in bar</text>`);
}

/* ── bombola con le fasce della miscela e manometro di PO2 ──────────────── */
export function mixCylinder({ fo2, fhe, po2, limit, label }) {
  const top = 70, H = 200, x = 40, w = 76;
  const seg = [['O₂', fo2, '#56B4E9'], ['He', fhe, '#009E73'], ['N₂', 1 - fo2 - fhe, '#E69F00']];
  let y = top, s = '', labs = '';
  for (const [n, fr, c] of seg) {
    const h = fr * H;
    s += `<rect x="${x}" y="${top}" width="${w}" height="${H}" fill="${c}" opacity=".8" class="iv-mv" style="transform:translateY(${(y - top).toFixed(1)}px) scaleY(${Math.max(fr, 0).toFixed(4)});transform-origin:0 ${top}px"/>`;
    labs += `<text x="${x + w + 10}" y="${(y + h / 2 + 4).toFixed(1)}" font-size="11" fill="${fr > 0.005 ? TXT : 'transparent'}" class="iv-lcd">${n} ${Math.round(fr * 100)}%</text>`;
    y += h;
  }
  return svg(300, 300, label, `${DEFS}
    <rect x="${x + w / 2 - 10}" y="${top - 34}" width="20" height="16" fill="#3b6488"/><rect x="${x + w / 2 - 18}" y="${top - 42}" width="36" height="10" rx="3" fill="url(#iv-steel)"/>
    <clipPath id="iv-cyl"><path d="M${x} ${top + 30}a${w / 2} 30 0 0 1 ${w} 0V${top + H - 10}a10 10 0 0 1 -10 10H${x + 10}a10 10 0 0 1 -10 -10Z"/></clipPath>
    <path d="M${x} ${top + 30}a${w / 2} 30 0 0 1 ${w} 0V${top + H - 10}a10 10 0 0 1 -10 10H${x + 10}a10 10 0 0 1 -10 -10Z" fill="#020b18" stroke="rgba(123,228,255,.5)" stroke-width="2"/>
    <g clip-path="url(#iv-cyl)">${s}</g>${labs}
    ${gauge(232, 104, 48, po2, Math.max(2, Math.ceil(limit + 0.4)), { unit: 'bar', digits: 2, red: limit, label: 'PO₂' })}`);
}

/* ── aggiornamento senza ridisegnare: le parti mobili scorrono ───────────── */
export function patch(container, markup) {
  const tpl = document.createElement('template');
  tpl.innerHTML = markup.trim();
  const next = tpl.content.firstElementChild;
  const cur = container.firstElementChild;
  if (!next) { container.innerHTML = ''; return; }
  if (!cur || !same(cur, next)) { container.replaceChildren(next); return; }
  sync(cur, next);
}
function same(a, b) {
  if (a.tagName !== b.tagName || a.children.length !== b.children.length) return false;
  for (let i = 0; i < a.children.length; i++) if (!same(a.children[i], b.children[i])) return false;
  return true;
}
function sync(a, b) {
  for (const at of b.attributes) if (a.getAttribute(at.name) !== at.value) a.setAttribute(at.name, at.value);
  for (const at of [...a.attributes]) if (!b.hasAttribute(at.name)) a.removeAttribute(at.name);
  if (!b.children.length) { if (a.textContent !== b.textContent) a.textContent = b.textContent; return; }
  for (let i = 0; i < b.children.length; i++) sync(a.children[i], b.children[i]);
}
