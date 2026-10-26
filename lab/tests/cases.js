/* BOYLE LAB · Banco di prova
   Ogni caso confronta il codice con un valore atteso ricavato a mano o da tabelle pubblicate,
   indipendentemente dal codice. Lo stesso elenco gira in Node (tests/run.mjs) e nel browser
   (pagina Validazione del laboratorio). */
import { CONST, pressure } from '../core/units.js';
import * as F from '../core/physics.js';
import * as P from '../core/physio.js';
import * as M from '../core/mixtures.js';
import * as K from '../core/kinetics.js';

export const CASES = [
  { id: 'units-mmhg', what: '760 mmHg ≈ 101 325 Pa', source: 'atmosfera standard (mmHg convenzionale vs Torr: differenza 0,014 Pa)',
    expected: 101325, tol: 0.02, run: () => pressure.convert(760, 'mmHg', 'Pa') },
  { id: 'hydro-10m', what: 'Pressione assoluta a 10 m in mare (ρ 1025)', source: '101 325 + 1025·9,806 65·10 = 201 843 Pa',
    expected: 2.01843, tol: 0.0001, unit: 'bar', run: () => F.absolutePressureAtDepth(10) / CONST.BAR },
  { id: 'boyle-4ata', what: '10 L da 1 a 4 ATA', source: '10·1/4', expected: 2.5, tol: 1e-9, unit: 'L',
    run: () => F.boyleVolume(10, 1, 4) },
  { id: 'charles', what: '1 L da 20 °C a 37 °C', source: '310,15/293,15', expected: 1.05799, tol: 0.00001, unit: 'L',
    run: () => F.charlesVolume(1, 293.15, 310.15) },
  { id: 'gaylussac', what: '2 bar da 273,15 K a 546,3 K', source: 'raddoppio della temperatura assoluta', expected: 4, tol: 1e-9, unit: 'bar',
    run: () => F.gayLussacPressure(2, 273.15, 546.3) },
  { id: 'dalton', what: 'PO₂ dell\'aria a 2 bar', source: '0,21·2', expected: 0.42, tol: 1e-9, unit: 'bar',
    run: () => F.partialPressure(0.21, 2) },
  { id: 'henry', what: 'O₂ disciolto a PO₂ 600 mmHg', source: '0,003·600', expected: 1.8, tol: 1e-9, unit: 'mL/dL',
    run: () => P.o2Content(15, 1, 600).dissolved },
  { id: 'density-air', what: 'Densità dell\'aria secca a 0 °C e 1 atm', source: 'valore di tabella 1,2922 kg/m³', expected: 1.2922, tol: 0.0005, unit: 'kg/m³',
    run: () => F.idealGasDensity(CONST.P_ATM, 0.0289644, 273.15) },
  { id: 'archimedes', what: 'Spinta su 1 L in mare', source: '1025·9,806 65·0,001', expected: 10.0518, tol: 0.0001, unit: 'N',
    run: () => F.buoyancyForce(0.001) },
  { id: 'isa-5000', what: 'Pressione ISA a 5000 m', source: 'formula ISO 2533 a mano, quota geopotenziale: 54,02 kPa (le tabelle a quota geometrica danno 54,05)', expected: 54.02, tol: 0.05, unit: 'kPa',
    run: () => F.isaPressure(5000) / 1000 },
  { id: 'isa-8000ft', what: 'Pressione ISA a 8000 ft (2438,4 m)', source: 'tabelle ISA: 75,26–75,27 kPa', expected: 75.26, tol: 0.05, unit: 'kPa',
    run: () => F.isaPressure(2438.4) / 1000 },
  { id: 'sev-p50', what: 'Saturazione a PO₂ 26,8 mmHg', source: 'calcolo a mano dell\'eq. 1 di Severinghaus: 0,4986', expected: 0.4986, tol: 0.0005,
    run: () => P.severinghausSat(26.8) },
  { id: 'sev-100', what: 'Saturazione a PO₂ 100 mmHg', source: 'calcolo a mano: 1/(23400/1 015 000 + 1) = 0,9775', expected: 0.9775, tol: 0.0005,
    run: () => P.severinghausSat(100) },
  { id: 'p50-shift', what: 'Con P50 = 30 mmHg, saturazione a 30 mmHg ≈ 0,4986', source: 'definizione della traslazione', expected: 0.4986, tol: 0.0005,
    run: () => P.satWithP50(30, 30) },
  { id: 'sat-inverse', what: 'Inversione: S(PO₂(0,90)) = 0,90', source: 'coerenza interna', expected: 0.9, tol: 1e-6,
    run: () => P.severinghausSat(P.po2ForSat(0.9)) },
  { id: 'pao2-sea', what: 'PAO₂ a livello del mare in aria (forma semplificata)', source: '0,21·(760−47) − 40/0,8 = 99,73', expected: 99.73, tol: 0.01, unit: 'mmHg',
    run: () => P.alveolarPO2({ pb: 760, fio2: 0.21 }) },
  { id: 'pao2-full', what: 'PAO₂ a livello del mare in aria (forma completa)', source: '149,73 − 40·(0,21 + 0,79/0,8) = 101,83', expected: 101.83, tol: 0.01, unit: 'mmHg',
    run: () => P.alveolarPO2({ pb: 760, fio2: 0.21, full: true }) },
  { id: 'pao2-hbo', what: 'PAO₂ in O₂ 100% a 2,4 ATA (forma completa: con FiO₂ = 1 il fattore vale 1)', source: '1·(1824−47) − 40·(1 + 0/0,8) = 1737', expected: 1737, tol: 0.01, unit: 'mmHg',
    run: () => P.alveolarPO2({ pb: 2.4 * 760, fio2: 1, full: true }) },
  { id: 'cao2', what: 'CaO₂ con Hb 15, SaO₂ 0,98, PaO₂ 100', source: '1,34·15·0,98 + 0,3 = 20,0', expected: 19.998, tol: 0.001, unit: 'mL/dL',
    run: () => P.o2Content(15, 0.98, 100).total },
  { id: 'do2', what: 'DO₂ con CaO₂ 20 e Q 5', source: '20·5·10', expected: 1000, tol: 1e-9, unit: 'mL/min',
    run: () => P.o2Delivery(20, 5) },
  { id: 'o2er', what: 'Estrazione con CaO₂ 20 e CvO₂ 15', source: '5/20', expected: 0.25, tol: 1e-9,
    run: () => P.o2Extraction(20, 15) },
  { id: 'mod-ean32', what: 'MOD di EAN32 con limite 1,4 bar', source: '10·(1,4/0,32 − 1) = 33,75', expected: 33.75, tol: 1e-9, unit: 'm',
    run: () => M.mod(0.32, 1.4) },
  { id: 'ead-ean32', what: 'EAD di EAN32 a 30 m', source: '40·0,68/0,79 − 10 = 24,43', expected: 24.4304, tol: 0.0001, unit: 'm',
    run: () => M.ead(30, 0.32) },
  { id: 'end-tx', what: 'END di trimix 18/45 a 60 m, O₂ narcotico', source: '70·0,55 − 10 = 28,5', expected: 28.5, tol: 1e-9, unit: 'm',
    run: () => M.end(60, { O2: 0.18, He: 0.45 }, true) },
  { id: 'haldane-half', what: 'Dopo un emitempo il compartimento è a metà strada', source: 'definizione di emitempo', expected: 0.5, tol: 1e-12,
    run: () => K.haldane(0, 1, 27, 27) },
  { id: 'schreiner-const', what: 'Schreiner con velocità zero = Haldane', source: 'coerenza tra le due equazioni', expected: K.haldane(0.75, 3, 10, 12.5), tol: 1e-12,
    run: () => K.schreiner(0.75, 3, 0, 10, 12.5) },
  { id: 'surface-n2', what: 'Tensione di N₂ in superficie respirando aria', source: '0,79·(1,01325 − 0,06266) = 0,7510', expected: 0.7510, tol: 0.0001, unit: 'bar',
    run: () => K.surfaceSaturation() },
  { id: 'kin-sat', what: 'Dopo 200 min a 30 m in aria il compartimento da 4 min è saturo', source: '(1,01325 + 3 − 0,06266) · 0,79 = 3,1210', expected: 3.1210, tol: 0.0001, unit: 'bar',
    run: () => K.simulateProfile([{ depth: 30, time: 200 }]).filter(x => x.depth === 30).pop().tensions[0] },
  { id: 'env-cabin', what: 'PiO₂ in cabina a 8000 ft, aria', source: '0,21·(564,5 − 47) = 108,7', expected: 108.7, tol: 0.3, unit: 'mmHg',
    run: () => P.inspiredPO2(F.isaPressure(2438.4) / CONST.MMHG, 0.21) },
];

export function runAll() {
  return CASES.map(c => {
    let got, ok, err;
    try { got = c.run(); ok = Math.abs(got - c.expected) <= c.tol; }
    catch (e) { ok = false; err = e.message; }
    return { id: c.id, what: c.what, source: c.source, unit: c.unit || '', expected: c.expected, tol: c.tol, got, ok, err };
  });
}
