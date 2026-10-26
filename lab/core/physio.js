/* BOYLE LAB · Modelli fisiologici
   Equazioni consolidate della fisiologia respiratoria. Le pressioni parziali sono in mmHg
   (convenzione clinica); le conversioni da/verso Pa passano da units.js.
   Attenzione alle sigle, che qui non vengono mai confuse:
   FiO2 = frazione inspirata (0-1) · PiO2 = pressione inspirata umidificata · PAO2 = alveolare
   PaO2 = arteriosa · SaO2 = saturazione (0-1) · CaO2 = contenuto (mL O2 / dL di sangue). */
import { CONST, assertRange } from './units.js';

/* Curva di dissociazione dell'ossiemoglobina, Severinghaus 1979 (eq. 1):
   S = 1 / ( 23400 / (PO2³ + 150·PO2) + 1 ), PO2 in mmHg.
   Curva standard: pH 7,40, 37 °C, PCO2 40 mmHg, P50 ≈ 26,8 mmHg. */
export function severinghausSat(po2) {
  if (po2 <= 0) return 0;
  return 1 / (23400 / (po2 * po2 * po2 + 150 * po2) + 1);
}

/* Spostamento della curva (effetto Bohr, temperatura, 2,3-DPG) rappresentato come
   cambio di P50: si scala la PO2 di 26,8/P50 prima di applicare Severinghaus.
   E' una semplificazione didattica (stessa forma della curva, solo traslata). */
export const P50_STANDARD = 26.8;
export function satWithP50(po2, p50 = P50_STANDARD) {
  assertRange('P50', p50, 10, 60);
  return severinghausSat(po2 * P50_STANDARD / p50);
}

/* PO2 corrispondente a una saturazione (inversione numerica per bisezione) */
export function po2ForSat(sat, p50 = P50_STANDARD) {
  assertRange('saturazione', sat, 0.0001, 0.9999);
  let lo = 0.01, hi = 2000;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (satWithP50(mid, p50) < sat) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

/* Pressione inspirata di O2 umidificata a 37 °C: PiO2 = FiO2 · (PB − PH2O) */
export function inspiredPO2(pbMmHg, fio2, ph2o = CONST.PH2O_37_MMHG) {
  assertRange('FiO2', fio2, 0, 1);
  return fio2 * Math.max(pbMmHg - ph2o, 0);
}

/* Equazione dei gas alveolari (Fenn, Rahn, Otis 1946).
   forma semplificata:  PAO2 = PiO2 − PaCO2 / R
   forma completa:      PAO2 = PiO2 − PaCO2 · [FiO2 + (1 − FiO2) / R]
   ipotesi: PACO2 = PaCO2, stato stazionario, gas secco nella miscela inspirata. */
export function alveolarPO2({ pb, fio2, paco2 = 40, rq = 0.8, ph2o = CONST.PH2O_37_MMHG, full = false }) {
  assertRange('quoziente respiratorio', rq, 0.6, 1.2);
  const pio2 = inspiredPO2(pb, fio2, ph2o);
  const pao2 = full ? pio2 - paco2 * (fio2 + (1 - fio2) / rq) : pio2 - paco2 / rq;
  return Math.max(pao2, 0);
}

/* Gradiente alveolo-arterioso e rapporto P/F */
export const aaGradient = (pAO2, paO2) => pAO2 - paO2;
export const pfRatio = (paO2, fio2) => paO2 / fio2;

/* Contenuto arterioso di O2 (mL/dL):
   CaO2 = 1,34 · Hb · SaO2 + 0,003 · PaO2
   1,34 mL O2/g Hb (costante di Hüfner nella forma clinica; in letteratura 1,34–1,39)
   0,003 mL O2 / dL / mmHg (solubilita' dell'O2 nel plasma a 37 °C) */
export const HUFNER = 1.34;
export const O2_SOLUBILITY = 0.003;
export function o2Content(hb, sat, po2, huefner = HUFNER) {
  assertRange('Hb', hb, 0, 25);
  assertRange('saturazione', sat, 0, 1);
  const bound = huefner * hb * sat;
  const dissolved = O2_SOLUBILITY * po2;
  return { total: bound + dissolved, bound, dissolved };
}

/* Trasporto e consumo (principio di Fick)
   DO2 (mL/min) = CaO2 (mL/dL) · Q (L/min) · 10
   VO2 (mL/min) = Q · (CaO2 − CvO2) · 10
   O2ER = (CaO2 − CvO2) / CaO2 */
export const o2Delivery = (caO2, qLmin) => caO2 * qLmin * 10;
export const o2Consumption = (qLmin, caO2, cvO2) => qLmin * (caO2 - cvO2) * 10;
export const o2Extraction = (caO2, cvO2) => (caO2 - cvO2) / caO2;
