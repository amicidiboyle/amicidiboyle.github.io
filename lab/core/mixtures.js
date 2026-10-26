/* BOYLE LAB · Miscele respiratorie
   Strumenti didattici. NON sono un pianificatore d'immersione.
   Due modi di passare dalla profondita' alla pressione, sempre dichiarati:
   - 'idrostatico': P = P0 + ρ·g·d (fisicamente corretto, dipende dalla densita' dell'acqua)
   - 'convenzione': P (bar) = d/10 + 1, la regola usata nelle tabelle e nei corsi subacquei. */
import { CONST, assertRange } from './units.js';
import { absolutePressureAtDepth, idealGasDensity, mixtureMolarMass } from './physics.js';

export function checkMix({ O2, He = 0 }) {
  assertRange('FO2', O2, 0.05, 1);
  assertRange('FHe', He, 0, 0.95);
  const N2 = 1 - O2 - He;
  if (N2 < -1e-9) throw new RangeError('FO2 + FHe supera il 100%');
  return { O2, He, N2: Math.max(N2, 0) };
}

/* pressione assoluta in bar a una profondita' in metri */
export function ambientBar(depthM, mode = 'convenzione', rho = CONST.RHO_SEAWATER) {
  if (mode === 'convenzione') return depthM / 10 + 1;
  return absolutePressureAtDepth(depthM, { rho }) / CONST.BAR;
}

/* pressioni parziali alla profondita' (bar) */
export function partialPressuresAt(depthM, mix, mode = 'convenzione') {
  const m = checkMix(mix);
  const p = ambientBar(depthM, mode);
  return { P: p, O2: m.O2 * p, N2: m.N2 * p, He: m.He * p };
}

/* MOD: profondita' alla quale PO2 raggiunge il limite scelto dall'utente (convenzione 10 m/bar)
   MOD = 10 · (PO2max / FO2 − 1) */
export function mod(fo2, po2max) {
  assertRange('FO2', fo2, 0.05, 1);
  assertRange('PO2 limite', po2max, 0.16, 3);
  return 10 * (po2max / fo2 - 1);
}

/* EAD (Equivalent Air Depth) per nitrox: EAD = (D + 10) · FN2 / 0,79 − 10 */
export function ead(depthM, fo2) {
  const { N2 } = checkMix({ O2: fo2 });
  return (depthM + 10) * N2 / 0.79 - 10;
}

/* END (Equivalent Narcotic Depth) per trimix, due convenzioni esplicite:
   - O2 considerato narcotico:     END = (D + 10) · (1 − FHe) − 10
   - O2 considerato non narcotico: END = (D + 10) · FN2 / 0,79 − 10 */
export function end(depthM, mix, o2Narcotic = true) {
  const m = checkMix(mix);
  return o2Narcotic ? (depthM + 10) * (1 - m.He) - 10 : (depthM + 10) * m.N2 / 0.79 - 10;
}

/* Densita' del gas respirato (g/L) alla profondita', gas ideale */
export function gasDensityAt(depthM, mix, tempC = 20, mode = 'idrostatico') {
  const m = checkMix(mix);
  const pa = ambientBar(depthM, mode) * CONST.BAR;
  return idealGasDensity(pa, mixtureMolarMass(m), tempC + CONST.T0); // kg/m³ = g/L
}
