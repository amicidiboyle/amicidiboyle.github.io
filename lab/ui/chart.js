/* BOYLE LAB · Grafici SVG senza librerie
   Linee con titolo, assi con unita', legenda, punto evidenziato e sovrapposizione A/B.
   Palette Okabe-Ito (leggibile anche con deficit del colore) e tratteggi diversi per serie,
   cosi' il colore non e' mai l'unica informazione. */

export const PALETTE = ['#56B4E9', '#E69F00', '#009E73', '#F0E442', '#CC79A7', '#D55E00', '#0072B2', '#999999'];
export const DASHES = ['', '7 4', '2 3', '10 3 2 3', '4 4', '1 4', '12 4', '3 2'];

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function niceStep(range, target = 5) {
  const raw = range / target;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / mag;
  return (n >= 5 ? 10 : n >= 2 ? 5 : n >= 1 ? 2 : 1) * mag;
}
function ticks(min, max, target) {
  const step = niceStep(max - min || 1, target);
  const out = [];
  for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-9; v += step) out.push(+v.toPrecision(12));
  return out;
}
const fmtTick = v => Math.abs(v) >= 1000 ? v.toLocaleString('it-IT', { maximumFractionDigits: 0 }) : v.toLocaleString('it-IT', { maximumFractionDigits: 3 });

/* spec: { title, x:{label,unit,min,max,reverse}, y:{label,unit,min,max},
           series:[{name, points:[[x,y]...], ghost?:bool}], marker?:{x,y,label}, bands?:[{y1,y2,label}] } */
const clip = (t, n = 24) => t.length > n ? t.slice(0, n - 1) + '…' : t;
export function lineChart(spec, { width = 720, height = 420 } = {}) {
  /* etichette a fine curva: ogni serie porta il proprio nome, nel proprio colore, accanto alla linea */
  const maxR = Math.min(190, Math.round(width * 0.3)), nameMax = Math.max(8, Math.floor((maxR - 22) / 6.3));
  const endNames = spec.series.filter(x => !x.hideLegend && x.points.some(p => Number.isFinite(p[1]))).map(x => clip(x.name, nameMax));
  const endW = endNames.length ? Math.max(...endNames.map(n => n.length * 6.3)) + 22 : 0;
  const tLines = spec.title.length * 8.4 > width - 80 ? wrap2(spec.title) : [spec.title];
  const m = { l: width < 500 ? 52 : 64, r: Math.min(Math.max(18, endW), maxR), t: 40 + (tLines.length - 1) * 19, b: 56 };
  const W = width - m.l - m.r, H = height - m.t - m.b;
  const all = spec.series.flatMap(s => s.points).filter(p => Number.isFinite(p[0]) && Number.isFinite(p[1]));
  let xmin = spec.x.min ?? Math.min(...all.map(p => p[0])), xmax = spec.x.max ?? Math.max(...all.map(p => p[0]));
  let ymin = spec.y.min ?? Math.min(0, ...all.map(p => p[1])), ymax = spec.y.max ?? Math.max(...all.map(p => p[1]));
  if (spec.marker && spec.y.max === undefined) ymax = Math.max(ymax, spec.marker.y);
  if (ymax === ymin) ymax = ymin + 1;
  if (xmax === xmin) xmax = xmin + 1;
  if (spec.y.max === undefined) { const st = niceStep(ymax - ymin); ymax = Math.ceil(ymax / st) * st; }
  const sx = v => m.l + (spec.x.reverse ? (xmax - v) : (v - xmin)) / (xmax - xmin) * W;
  const sy = v => m.t + H - (v - ymin) / (ymax - ymin) * H;
  const xt = ticks(xmin, xmax, 6), yt = ticks(ymin, ymax, 5);
  const axisLabel = a => esc(a.label) + (a.unit ? ' (' + esc(a.unit) + ')' : '');
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="ct-t ct-d" class="lab-chart" font-family="DM Sans, system-ui, sans-serif">`;
  s += `<title id="ct-t">${esc(spec.title)}</title><desc id="ct-d">${axisLabel(spec.y)} in funzione di ${axisLabel(spec.x)}. Serie: ${spec.series.map(x => esc(x.name)).join(', ')}.</desc>`;
  s += `<rect width="${width}" height="${height}" fill="#03101f"/>`;
  s += `<text x="${Math.min(m.l, 16 + (width < 500 ? 0 : 48))}" y="22" fill="#edf7ff" font-size="15" font-weight="700">${tLines.map((t, j) => `<tspan x="${Math.min(m.l, 16 + (width < 500 ? 0 : 48))}" dy="${j ? 19 : 0}">${esc(t)}</tspan>`).join('')}</text>`;
  for (const b of spec.bands || []) {
    const y1 = sy(Math.min(Math.max(b.y2, ymin), ymax)), y2 = sy(Math.max(Math.min(b.y1, ymax), ymin));
    s += `<rect x="${m.l}" y="${y1}" width="${W}" height="${Math.max(y2 - y1, 0)}" fill="${b.color || 'rgba(123,228,255,.07)'}"/>`;
    if (b.label) s += `<text x="${m.l + W - 6}" y="${y1 + 14}" text-anchor="end" fill="rgba(237,247,255,.6)" font-size="11">${esc(b.label)}</text>`;
  }
  for (const v of yt) s += `<line x1="${m.l}" x2="${m.l + W}" y1="${sy(v)}" y2="${sy(v)}" stroke="rgba(123,228,255,.13)" stroke-dasharray="2 4"/><text x="${m.l - 8}" y="${sy(v) + 4}" text-anchor="end" fill="rgba(237,247,255,.7)" font-size="11">${fmtTick(v)}</text>`;
  for (const v of xt) s += `<line x1="${sx(v)}" x2="${sx(v)}" y1="${m.t}" y2="${m.t + H}" stroke="rgba(123,228,255,.09)" stroke-dasharray="2 4"/><text x="${sx(v)}" y="${m.t + H + 18}" text-anchor="middle" fill="rgba(237,247,255,.7)" font-size="11">${fmtTick(v)}</text>`;
  s += `<line x1="${m.l}" x2="${m.l + W}" y1="${m.t + H}" y2="${m.t + H}" stroke="rgba(237,247,255,.45)"/><line x1="${m.l}" x2="${m.l}" y1="${m.t}" y2="${m.t + H}" stroke="rgba(237,247,255,.45)"/>`;
  s += `<text x="${m.l + W / 2}" y="${height - 12}" text-anchor="middle" fill="#a8eeff" font-size="12">${axisLabel(spec.x)}</text>`;
  s += `<text transform="translate(16 ${m.t + H / 2}) rotate(-90)" text-anchor="middle" fill="#a8eeff" font-size="12">${axisLabel(spec.y)}</text>`;
  s += `<clipPath id="ct-clip"><rect x="${m.l}" y="${m.t}" width="${W}" height="${H}"/></clipPath><g clip-path="url(#ct-clip)">`;
  spec.series.forEach((ser, i) => {
    const pts = ser.points.filter(p => Number.isFinite(p[1]));
    if (!pts.length) return;
    const d = pts.map((p, j) => (j ? 'L' : 'M') + sx(p[0]).toFixed(1) + ' ' + sy(p[1]).toFixed(1)).join('');
    const ci = ser.colorIndex ?? i;
    s += `<path class="ct-line" d="${d}" fill="none" stroke="${ser.color || PALETTE[ci % PALETTE.length]}" stroke-width="${ser.ghost ? 1.8 : 3}" stroke-dasharray="${ser.ghost ? '6 5' : DASHES[ci % DASHES.length]}" opacity="${ser.ghost ? .7 : 1}" stroke-linejoin="round" stroke-linecap="round"/>`;
  });
  s += '</g>';
  if (spec.marker && Number.isFinite(spec.marker.y)) {
    const mx = sx(spec.marker.x), my = sy(spec.marker.y);
    const right = mx + 10 > m.l + W - 120;
    s += `<g class="ct-mk" style="transform:translateX(${mx.toFixed(1)}px)"><line x1="0" x2="0" y1="${m.t}" y2="${m.t + H}" stroke="rgba(255,255,255,.35)" stroke-dasharray="3 3"/></g>`;
    s += `<g class="ct-mk" style="transform:translate(${mx.toFixed(1)}px, ${my.toFixed(1)}px)"><circle r="12" fill="rgba(255,255,255,.10)" class="ct-halo"/><circle r="6" fill="#061a33" stroke="#ffffff" stroke-width="2.5"/>`;
    s += `<text x="${right ? -12 : 12}" y="${my - 10 < m.t + 12 ? 18 : -10}" text-anchor="${right ? 'end' : 'start'}" fill="#ffffff" font-size="12" font-weight="700">${esc(spec.marker.label || '')}</text></g>`;
  }
  /* etichette a fine curva, distanziate per non sovrapporsi */
  const tags = [];
  spec.series.forEach((ser, i) => {
    if (ser.hideLegend) return;
    const pts = ser.points.filter(p => Number.isFinite(p[1]) && p[0] >= Math.min(xmin, xmax) && p[0] <= Math.max(xmin, xmax));
    if (!pts.length) return;
    const last = spec.x.reverse ? pts[0] : pts[pts.length - 1];
    const ci = ser.colorIndex ?? i;
    const y0 = Math.min(Math.max(sy(Math.min(Math.max(last[1], ymin), ymax)), m.t + 6), m.t + H);
    tags.push({ y0, y: y0, name: clip(ser.name, nameMax), color: ser.color || PALETTE[ci % PALETTE.length], ghost: ser.ghost, dash: ser.ghost ? '6 5' : DASHES[ci % DASHES.length] });
  });
  tags.sort((a, b) => a.y - b.y);
  const GAP = 15;
  for (let k = 1; k < tags.length; k++) if (tags[k].y < tags[k - 1].y + GAP) tags[k].y = tags[k - 1].y + GAP;
  const over = tags.length ? tags[tags.length - 1].y - (m.t + H) : 0;
  if (over > 0) { tags.forEach(t => { t.y -= over; }); for (let k = tags.length - 2; k >= 0; k--) if (tags[k].y > tags[k + 1].y - GAP) tags[k].y = tags[k + 1].y - GAP; }
  const xe = m.l + W;
  for (const t of tags) {
    s += `<path d="M${xe + 2} ${t.y0.toFixed(1)}L${xe + 8} ${t.y0.toFixed(1)}L${xe + 12} ${t.y.toFixed(1)}" fill="none" stroke="${t.color}" stroke-width="1.2" opacity=".7"/>`;
    s += `<text x="${xe + 15}" y="${(t.y + 4).toFixed(1)}" fill="${t.color}" font-size="11.5" font-weight="${t.ghost ? 500 : 700}" opacity="${t.ghost ? .8 : 1}">${esc(t.name)}</text>`;
  }
  return s + '</svg>';
}

/* larghezza stimata di un testo DM Sans (px): media prudente per carattere */
const textW = (t, size) => String(t).length * size * 0.56;

/* spezza un'etichetta lunga in due righe sullo spazio piu' vicino al centro */
function wrap2(t) {
  const sp = [...t.matchAll(/ /g)].map(m => m.index);
  if (!sp.length) return [t];
  const mid = t.length / 2, k = sp.reduce((a, b) => Math.abs(b - mid) < Math.abs(a - mid) ? b : a);
  return [t.slice(0, k), t.slice(k + 1)];
}

/* barre orizzontali raggruppate: spec { title, unit, groups:[{label, values:[{name, v}]}] }
   I margini si adattano alle etichette e ai valori: nessun testo esce dal riquadro. */
export function barChart(spec, { width = 720 } = {}) {
  const names = [...new Set(spec.groups.flatMap(g => g.values.map(v => v.name)))];
  const fmtV = v => v.toLocaleString('it-IT', { maximumFractionDigits: 1 }) + ' ' + spec.unit;
  const LS = 12, VS = 11, maxL = Math.round(width * 0.38);
  const labels = spec.groups.map(g => textW(g.label, LS) + 24 <= maxL ? [g.label] : wrap2(g.label));
  const lw = Math.max(...labels.flat().map(t => textW(t, LS)));
  const vw = Math.max(...spec.groups.flatMap(g => g.values.map(v => textW(v.text ?? fmtV(v.v), VS))));
  const rowH = 18, gap = 14;
  const m = { l: Math.min(Math.max(Math.ceil(lw) + 26, 90), maxL), r: Math.ceil(vw) + 16, t: 46 + (names.length > 1 ? 18 : 0), b: 34 };
  const groupH = g => Math.max(g.values.length * rowH, labels[spec.groups.indexOf(g)].length * 15);
  const height = m.t + spec.groups.reduce((a, g) => a + groupH(g) + gap, 0) + m.b;
  const W = width - m.l - m.r;
  const max = spec.max ?? Math.max(...spec.groups.flatMap(g => g.values.map(v => v.v)), 1);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(spec.title)}" class="lab-chart" font-family="DM Sans, system-ui, sans-serif">`;
  s += `<rect width="${width}" height="${height}" fill="#03101f"/><text x="16" y="24" fill="#edf7ff" font-size="15" font-weight="700">${esc(spec.title)}</text>`;
  if (names.length > 1) names.forEach((n, i) => { s += `<rect x="${16 + i * 150}" y="34" width="12" height="10" fill="${PALETTE[i]}"/><text x="${32 + i * 150}" y="43" fill="#edf7ff" font-size="11">${esc(n)}</text>`; });
  let y = m.t;
  spec.groups.forEach((g, gi) => {
    const gh = groupH(g), lines = labels[gi], cy = y + gh / 2;
    s += `<text x="${m.l - 10}" y="${cy + 4 - (lines.length - 1) * 7.5}" text-anchor="end" fill="#edf7ff" font-size="${LS}">`;
    lines.forEach((t, j) => { s += `<tspan x="${m.l - 10}" dy="${j ? 15 : 0}">${esc(t)}</tspan>`; });
    s += `</text>`;
    let ry = y + (gh - g.values.length * rowH) / 2;
    g.values.forEach(v => {
      const i = names.indexOf(v.name), w = Math.max(v.v / max * W, 0);
      s += `<rect x="${m.l}" y="${ry + 2}" width="${w}" height="${rowH - 4}" rx="3" fill="${PALETTE[i]}" opacity=".9"/>`;
      s += `<text x="${m.l + w + 6}" y="${ry + rowH - 5}" fill="rgba(237,247,255,.85)" font-size="${VS}">${esc(v.text ?? fmtV(v.v))}</text>`;
      ry += rowH;
    });
    y += gh + gap;
  });
  return s + `<line x1="${m.l}" x2="${m.l}" y1="${m.t - 4}" y2="${y - gap + 4}" stroke="rgba(237,247,255,.45)"/></svg>`;
}
