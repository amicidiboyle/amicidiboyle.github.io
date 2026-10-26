/* BOYLE LAB · Modelli fisici
   Relazioni fisiche esatte entro le ipotesi dichiarate (categoria 1 del registro) e
   modelli consolidati (categoria 2). Tutte le grandezze in SI. */
import { CONST, MOLAR_MASS, assertRange } from './units.js';

/* Pressione idrostatica: P_abs = P_superficie + ρ·g·d
   ipotesi: fluido incomprimibile a densita' costante, g costante */
export function absolutePressureAtDepth(depthM, { surfacePa = CONST.P_ATM, rho = CONST.RHO_SEAWATER } = {}) {
  assertRange('profondità', depthM, 0, 1000);
  return surfacePa + rho * CONST.G * depthM;
}
export function depthForAbsolutePressure(pa, { surfacePa = CONST.P_ATM, rho = CONST.RHO_SEAWATER } = {}) {
  return (pa - surfacePa) / (rho * CONST.G);
}

/* Legge di Boyle-Mariotte (isoterma, quantita' di gas costante): P1·V1 = P2·V2 */
export function boyleVolume(v1, p1, p2) {
  if (p1 <= 0 || p2 <= 0) throw new RangeError('pressioni assolute positive richieste');
  return v1 * p1 / p2;
}

/* Legge di Charles (isobara): V1/T1 = V2/T2, temperature assolute */
export function charlesVolume(v1, t1K, t2K) {
  if (t1K <= 0 || t2K <= 0) throw new RangeError('temperature assolute positive richieste');
  return v1 * t2K / t1K;
}

/* Legge di Gay-Lussac (isocora): P1/T1 = P2/T2 */
export function gayLussacPressure(p1, t1K, t2K) {
  if (t1K <= 0 || t2K <= 0) throw new RangeError('temperature assolute positive richieste');
  return p1 * t2K / t1K;
}

/* Legge combinata dei gas: P1V1/T1 = P2V2/T2 */
export function combinedVolume(v1, p1, t1K, p2, t2K) {
  return v1 * (p1 / p2) * (t2K / t1K);
}

/* Gas ideale: n = PV/RT */
export function moles(pa, vM3, tK) { return pa * vM3 / (CONST.R * tK); }

/* Legge di Dalton: P_i = F_i · P_tot */
export function partialPressure(fraction, totalPa) {
  assertRange('frazione', fraction, 0, 1);
  return fraction * totalPa;
}

/* Densita' di un gas ideale: ρ = P·M / (R·T) */
export function idealGasDensity(pa, molarMassKg, tK) {
  return pa * molarMassKg / (CONST.R * tK);
}

/* Massa molare media di una miscela (frazioni molari) */
export function mixtureMolarMass({ O2 = 0, N2 = 0, He = 0 }) {
  return O2 * MOLAR_MASS.O2 + N2 * MOLAR_MASS.N2 + He * MOLAR_MASS.He;
}

/* Spinta di Archimede: F = ρ_fluido · g · V_spostato (N) */
export function buoyancyForce(volumeM3, rho = CONST.RHO_SEAWATER) {
  return rho * CONST.G * volumeM3;
}

/* Atmosfera standard internazionale (ISA, ISO 2533:1975), troposfera 0–11 000 m:
   P = P0 · (1 − L·h/T0)^(g·M/(R·L)), con L = 0,0065 K/m, T0 = 288,15 K.
   L'esponente g·M/(R·L) vale ≈ 5,2559. Modello dell'atmosfera media, non del giorno reale. */
export const ISA = Object.freeze({ T0: 288.15, L: 0.0065, P0: CONST.P_ATM });
export function isaPressure(altitudeM) {
  assertRange('quota', altitudeM, -500, 11000);
  const expo = CONST.G * MOLAR_MASS.AIR / (CONST.R * ISA.L);
  return ISA.P0 * Math.pow(1 - ISA.L * altitudeM / ISA.T0, expo);
}
export function isaTemperature(altitudeM) {
  assertRange('quota', altitudeM, -500, 11000);
  return ISA.T0 - ISA.L * altitudeM;
}
/* quota ISA equivalente a una pressione (inversa, utile per "quota di cabina") */
export function isaAltitudeForPressure(pa) {
  const expo = CONST.G * MOLAR_MASS.AIR / (CONST.R * ISA.L);
  return ISA.T0 / ISA.L * (1 - Math.pow(pa / ISA.P0, 1 / expo));
}
