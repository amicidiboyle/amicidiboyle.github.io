/* BOYLE LAB · Cinetica dei gas inerti (solo tensioni tissutali)
   Compartimenti paralleli a mono-esponenziale (Haldane), equazione di Schreiner per le
   variazioni lineari di pressione. Emitempi N2 del modello ZH-L16 (Bühlmann).
   Questo modulo NON calcola tappe, limiti o tempi di non decompressione: mostra soltanto
   come i compartimenti teorici caricano e scaricano azoto. */
import { CONST } from './units.js';

export const ZHL16_N2_HALFTIMES = Object.freeze([4, 8, 12.5, 18.5, 27, 38.3, 54.3, 77, 109, 146, 187, 239, 305, 390, 498, 635]);
export const PH2O_BAR = CONST.PH2O_37_MMHG * CONST.MMHG / CONST.BAR; // ≈ 0,0627 bar

/* pressione alveolare del gas inerte: (Pamb − PH2O) · F */
export const alveolarInert = (pambBar, f) => Math.max(pambBar - PH2O_BAR, 0) * f;

/* Haldane (pressione costante): P(t) = Palv + (P0 − Palv) · e^(−k t), k = ln2 / T½ */
export function haldane(p0, palv, tMin, halfTime) {
  const k = Math.LN2 / halfTime;
  return palv + (p0 - palv) * Math.exp(-k * tMin);
}

/* Schreiner (pressione alveolare che varia linearmente con velocita' R bar/min):
   P(t) = Palv0 + R·(t − 1/k) − (Palv0 − P0 − R/k) · e^(−k t) */
export function schreiner(p0, palv0, rate, tMin, halfTime) {
  const k = Math.LN2 / halfTime;
  return palv0 + rate * (tMin - 1 / k) - (palv0 - p0 - rate / k) * Math.exp(-k * tMin);
}

/* Tensioni di equilibrio in superficie (respirando aria al livello del mare) */
export function surfaceSaturation(fN2 = 0.79, pSurf = CONST.P_ATM / CONST.BAR) {
  return alveolarInert(pSurf, fN2);
}

/* Simula un profilo a segmenti [{depth, time, fN2?}] con velocita' di discesa/risalita in m/min.
   Restituisce i campioni nel tempo per tutti i compartimenti. Pressione: convenzione 10 m/bar
   sopra una superficie a 1,01325 bar (dichiarata nella scheda scientifica). */
export function simulateProfile(segments, { fN2 = 0.79, descent = 18, ascent = 9, dt = 0.5, halfTimes = ZHL16_N2_HALFTIMES, pSurf = CONST.P_ATM / CONST.BAR } = {}) {
  const pAt = d => pSurf + d / 10;
  let tension = halfTimes.map(() => surfaceSaturation(fN2, pSurf));
  let depth = 0, t = 0;
  const samples = [{ t, depth, pamb: pAt(0), tensions: tension.slice() }];
  const legs = [];
  let gas = segments.length && segments[0].fN2 !== undefined ? segments[0].fN2 : fN2;
  for (const s of segments) {
    const g = s.fN2 !== undefined ? s.fN2 : fN2;
    if (s.depth !== depth) {
      const speed = s.depth > depth ? descent : ascent;
      // durante gli spostamenti si respira il gas del tratto precedente (in discesa quello del primo tratto)
      legs.push({ from: depth, to: s.depth, dur: Math.abs(s.depth - depth) / speed, f: depth === 0 && legs.length === 0 ? g : gas });
    }
    if (s.time > 0) legs.push({ from: s.depth, to: s.depth, dur: s.time, f: g });
    depth = s.depth; gas = g;
  }
  if (depth !== 0) legs.push({ from: depth, to: 0, dur: depth / ascent, f: gas });
  for (const leg of legs) {
    const n = Math.max(1, Math.ceil(leg.dur / dt));
    const h = leg.dur / n;
    const ratePerMin = (pAt(leg.to) - pAt(leg.from)) / leg.dur * leg.f; // bar/min di gas inerte alveolare
    for (let i = 1; i <= n; i++) {
      const dStart = leg.from + (leg.to - leg.from) * (i - 1) / n;
      const palv0 = alveolarInert(pAt(dStart), leg.f);
      tension = tension.map((p0, c) => leg.from === leg.to
        ? haldane(p0, palv0, h, halfTimes[c])
        : schreiner(p0, palv0, ratePerMin, h, halfTimes[c]));
      t += h;
      const d = leg.from + (leg.to - leg.from) * i / n;
      samples.push({ t, depth: d, pamb: pAt(d), tensions: tension.slice() });
    }
  }
  return samples;
}
