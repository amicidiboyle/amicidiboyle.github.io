/* BOYLE LAB · Esperimenti ADVANCED (moduli 6.1–6.10) */
import { CONST } from '../core/units.js';
import * as F from '../core/physics.js';
import * as P from '../core/physio.js';
import * as M from '../core/mixtures.js';
import * as K from '../core/kinetics.js';
import * as V from '../ui/instruments.js';

const range = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => a + (b - a) * i / n);
const mmHg = pa => pa / CONST.MMHG;
const fx = (v, d = 1) => Number.isFinite(v) ? v.toLocaleString('it-IT', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—';

export const ADVANCED = [
  {
    id: 'a-miscele', level: 'advanced', module: '6.1', area: 'C', models: ['mixconv', 'dalton', 'idealgas', 'hydrostatic'],
    title: { it: 'Analizzatore di miscele', en: 'Gas mixture analyser' },
    summary: { it: 'Pressioni parziali, MOD con limite esplicito, EAD/END con la convenzione dichiarata, densità.', en: 'Partial pressures, MOD with an explicit limit, EAD/END with stated convention, density.' },
    tags: 'nitrox trimix heliox mod ead end po2 densità miscela analizzatore',
    params: [
      { id: 'fo2', label: { it: 'O₂', en: 'O₂' }, unit: '%', min: 8, max: 100, step: 1, value: 32 },
      { id: 'fhe', label: { it: 'He', en: 'He' }, unit: '%', min: 0, max: 90, step: 1, value: 0 },
      { id: 'depth', label: { it: 'Profondità', en: 'Depth' }, unit: 'm', min: 0, max: 120, step: 1, value: 30 },
      { id: 'po2max', label: { it: 'Limite di PO₂ scelto per la MOD', en: 'PO₂ limit chosen for MOD' }, unit: 'bar', min: 1, max: 1.6, step: 0.05, value: 1.4 },
      { id: 'narc', label: { it: 'Convenzione END', en: 'END convention' }, type: 'select', value: 'si', options: [{ v: 'si', label: { it: 'O₂ considerato narcotico', en: 'O₂ counted as narcotic' } }, { v: 'no', label: { it: 'O₂ non narcotico', en: 'O₂ not narcotic' } }] },
    ],
    validate(p) { return p.fo2 + p.fhe > 100 ? 'O₂ + He superano il 100%: riduci uno dei due.' : null; },
    compute(p) {
      const mix = { O2: p.fo2 / 100, He: p.fhe / 100 };
      const m = M.checkMix(mix);
      const pc = M.partialPressuresAt(p.depth, mix, 'convenzione');
      const ph = M.ambientBar(p.depth, 'idrostatico');
      const xs = range(0, 120, 120);
      const out = [
        { label: 'Miscela', text: Math.round(m.O2 * 100) + '/' + Math.round(m.He * 100) + ' (N₂ ' + Math.round(m.N2 * 100) + '%)' },
        { label: 'Pressione assoluta (convenzione 10 m/bar)', value: pc.P, unit: 'bar', digits: 2, hint: ph, hintUnit: 'bar idrostatica, mare' },
        { label: 'PO₂', value: pc.O2, unit: 'bar', digits: 2 },
        { label: 'PN₂', value: pc.N2, unit: 'bar', digits: 2 },
        { label: 'PHe', value: pc.He, unit: 'bar', digits: 2 },
        { label: 'MOD al limite di ' + fx(p.po2max, 2) + ' bar', value: M.mod(m.O2, p.po2max), unit: 'm', digits: 1 },
        m.He === 0
          ? { label: 'EAD', value: Math.max(M.ead(p.depth, m.O2), 0), unit: 'm', digits: 1 }
          : { label: 'END (' + (p.narc === 'si' ? 'O₂ narcotico' : 'O₂ non narcotico') + ')', value: Math.max(M.end(p.depth, mix, p.narc === 'si'), 0), unit: 'm', digits: 1 },
        { label: 'Densità del gas (20 °C)', value: M.gasDensityAt(p.depth, mix), unit: 'g/L', digits: 2 },
      ];
      const warnings = [];
      if (pc.O2 > p.po2max) warnings.push('Alla profondità scelta la PO₂ supera il limite che hai impostato.');
      if (pc.O2 < 0.16) warnings.push('PO₂ inferiore a 0,16 bar: miscela ipossica a questa profondità.');
      return {
        outputs: out, warnings,
        visual: V.mixCylinder({ fo2: m.O2, fhe: m.He, po2: pc.O2, limit: p.po2max, label: 'Miscela ' + Math.round(m.O2 * 100) + '/' + Math.round(m.He * 100) }),
        chart: { type: 'line', spec: { title: 'PO₂ della miscela in funzione della profondità', x: { label: 'Profondità', unit: 'm', min: 0, max: 120 }, y: { label: 'PO₂', unit: 'bar', min: 0, max: Math.max(2, Math.min(pc.O2 * 1.3, 6)) },
          bands: [{ y1: p.po2max, y2: 99, label: 'oltre il limite scelto', color: 'rgba(213,94,0,.14)' }],
          series: [{ name: 'PO₂', points: xs.map(d => [d, m.O2 * M.ambientBar(d)]) }, { name: 'PN₂', points: xs.map(d => [d, m.N2 * M.ambientBar(d)]) }, ...(m.He ? [{ name: 'PHe', points: xs.map(d => [d, m.He * M.ambientBar(d)]) }] : [])],
          marker: { x: p.depth, y: pc.O2, label: 'PO₂ ' + fx(pc.O2, 2) } } },
      };
    },
  },
  {
    id: 'a-cinetica', level: 'advanced', module: '6.2', area: 'C', models: ['haldane', 'hydrostatic'],
    title: { it: 'Cinetica dei gas inerti', en: 'Inert gas kinetics' },
    summary: { it: 'Tensione di azoto in compartimenti teorici durante un profilo quadro. Solo tensioni, nessuna tappa.', en: 'Nitrogen tension in theoretical compartments during a square profile. Tensions only, no stops.' },
    tags: 'haldane schreiner buhlmann zh-l16 compartimenti azoto saturazione desaturazione emitempo',
    params: [
      { id: 'depth', label: { it: 'Profondità', en: 'Depth' }, unit: 'm', min: 5, max: 60, step: 1, value: 30 },
      { id: 'time', label: { it: 'Tempo sul fondo', en: 'Bottom time' }, unit: 'min', min: 1, max: 180, step: 1, value: 25 },
      { id: 'fo2', label: { it: 'O₂ nella miscela', en: 'O₂ in the mix' }, unit: '%', min: 21, max: 40, step: 1, value: 21 },
      { id: 'after', label: { it: 'Minuti osservati in superficie', en: 'Minutes observed at the surface' }, unit: 'min', min: 0, max: 360, step: 10, value: 120 },
    ],
    compute(p) {
      const fN2 = 1 - p.fo2 / 100;
      const samples = K.simulateProfile([{ depth: p.depth, time: p.time, fN2 }, { depth: 0, time: p.after, fN2: 0.79 }], { dt: 0.5 }); // in superficie si respira aria
      const show = [0, 3, 7, 11, 15];
      const surf = samples.findIndex((s, i) => i > 0 && s.depth === 0);
      const bottomEnd = samples.reduce((acc, s, i) => (s.depth === p.depth ? i : acc), 0);
      const out = show.map(c => ({ label: 'T½ ' + String(K.ZHL16_N2_HALFTIMES[c]).replace('.', ',') + ' min: a fine fondo / all\'emersione', text: fx(samples[bottomEnd].tensions[c], 2) + ' / ' + fx(samples[surf].tensions[c], 2) + ' bar' }));
      out.unshift({ label: 'Tensione di partenza (superficie, aria)', value: K.surfaceSaturation(), unit: 'bar', digits: 3 });
      const be = samples[bottomEnd];
      return {
        outputs: out,
        visual: V.compartments({ tensions: be.tensions, pamb: be.pamb, maxP: Math.ceil(be.pamb + 0.5), halfTimes: K.ZHL16_N2_HALFTIMES, title: 'Fine del tempo sul fondo', label: 'Tensioni dei 16 compartimenti a fine fondo' }),
        chart: { type: 'line', spec: { title: 'Tensione di N₂ nei compartimenti e pressione ambiente', x: { label: 'Tempo', unit: 'min', min: 0 }, y: { label: 'Pressione', unit: 'bar', min: 0 }, series: [
          { name: 'P ambiente', points: samples.map(s => [s.t, s.pamb]), color: 'rgba(237,247,255,.55)', colorIndex: 7 },
          ...show.map((c, i) => ({ name: 'T½ ' + String(K.ZHL16_N2_HALFTIMES[c]).replace('.', ',') + ' min', colorIndex: i, points: samples.map(s => [s.t, s.tensions[c]]) })),
        ] } },
        warnings: ['Solo tensioni teoriche: questo modulo non calcola tappe di decompressione, limiti di non decompressione o margini di sicurezza.'],
      };
    },
  },
  {
    id: 'a-alveolare', level: 'advanced', module: '6.3', area: 'B', models: ['alveolar', 'odc'],
    title: { it: 'Equazione dei gas alveolari e gradiente A-a', en: 'Alveolar gas equation and A–a gradient' },
    summary: { it: 'PiO₂, PAO₂ (forma semplificata e completa), gradiente A-a, rapporto P/F.', en: 'PiO₂, PAO₂ (simplified and full), A–a gradient, P/F ratio.' },
    tags: 'alveolare pao2 gradiente a-a p/f fio2 paco2 ipoventilazione quoziente respiratorio',
    params: [
      { id: 'pb', label: { it: 'Pressione barometrica', en: 'Barometric pressure' }, unit: 'mmHg', min: 200, max: 2300, step: 5, value: 760 },
      { id: 'fio2', label: { it: 'FiO₂', en: 'FiO₂' }, unit: '%', min: 15, max: 100, step: 1, value: 21 },
      { id: 'paco2', label: { it: 'PaCO₂', en: 'PaCO₂' }, unit: 'mmHg', min: 15, max: 90, step: 1, value: 40 },
      { id: 'rq', label: { it: 'Quoziente respiratorio R', en: 'Respiratory quotient R' }, unit: '', min: 0.7, max: 1, step: 0.01, value: 0.8 },
      { id: 'pao2', label: { it: 'PaO₂ misurata (esempio)', en: 'Measured PaO₂ (example)' }, unit: 'mmHg', min: 30, max: 600, step: 1, value: 90 },
    ],
    compute(p) {
      const f = p.fio2 / 100;
      const A = P.alveolarPO2({ pb: p.pb, fio2: f, paco2: p.paco2, rq: p.rq });
      const Af = P.alveolarPO2({ pb: p.pb, fio2: f, paco2: p.paco2, rq: p.rq, full: true });
      const xs = range(15, 90, 75);
      return {
        outputs: [
          { label: 'PiO₂', value: P.inspiredPO2(p.pb, f), unit: 'mmHg', digits: 1 },
          { label: 'PAO₂, forma semplificata', value: A, unit: 'mmHg', digits: 1 },
          { label: 'PAO₂, forma completa', value: Af, unit: 'mmHg', digits: 1 },
          { label: 'Gradiente A-a (forma semplificata)', value: P.aaGradient(A, p.pao2), unit: 'mmHg', digits: 1 },
          { label: 'Rapporto P/F', value: P.pfRatio(p.pao2, f), unit: 'mmHg', digits: 0 },
          { label: 'Saturazione stimata dalla PaO₂ (curva standard)', value: P.severinghausSat(p.pao2) * 100, unit: '%', digits: 1 },
        ],
        warnings: P.aaGradient(A, p.pao2) < 0 ? ['La PaO₂ inserita è più alta della PAO₂ calcolata: i dati non sono coerenti tra loro.'] : [],
        chart: { type: 'line', spec: { title: 'PAO₂ in funzione della PaCO₂ (ventilazione)', x: { label: 'PaCO₂', unit: 'mmHg', min: 15, max: 90 }, y: { label: 'PAO₂', unit: 'mmHg', min: 0 }, series: [
          { name: 'Semplificata', points: xs.map(c => [c, P.alveolarPO2({ pb: p.pb, fio2: f, paco2: c, rq: p.rq })]) },
          { name: 'Completa', points: xs.map(c => [c, P.alveolarPO2({ pb: p.pb, fio2: f, paco2: c, rq: p.rq, full: true })]) },
        ], marker: { x: p.paco2, y: A, label: fx(A, 0) + ' mmHg' } } },
      };
    },
  },
  {
    id: 'a-trasporto', level: 'advanced', module: '6.9', area: 'F', models: ['o2content', 'fick', 'odc'],
    title: { it: 'Trasporto di ossigeno (critical care)', en: 'Oxygen transport (critical care)' },
    summary: { it: 'CaO₂, CvO₂, DO₂, VO₂ ed estrazione: come Hb, saturazione e portata cardiaca si combinano.', en: 'CaO₂, CvO₂, DO₂, VO₂ and extraction: how Hb, saturation and cardiac output combine.' },
    tags: 'cao2 do2 vo2 estrazione fick portata cardiaca emoglobina terapia intensiva svo2',
    params: [
      { id: 'hb', label: { it: 'Emoglobina', en: 'Haemoglobin' }, unit: 'g/dL', min: 5, max: 18, step: 0.1, value: 14 },
      { id: 'sao2', label: { it: 'SaO₂', en: 'SaO₂' }, unit: '%', min: 50, max: 100, step: 0.5, value: 97 },
      { id: 'pao2', label: { it: 'PaO₂', en: 'PaO₂' }, unit: 'mmHg', min: 30, max: 600, step: 1, value: 95 },
      { id: 'svo2', label: { it: 'SvO₂ (venosa mista)', en: 'SvO₂ (mixed venous)' }, unit: '%', min: 20, max: 95, step: 0.5, value: 72 },
      { id: 'pvo2', label: { it: 'PvO₂', en: 'PvO₂' }, unit: 'mmHg', min: 15, max: 60, step: 1, value: 40 },
      { id: 'q', label: { it: 'Portata cardiaca', en: 'Cardiac output' }, unit: 'L/min', min: 1, max: 15, step: 0.1, value: 5 },
    ],
    compute(p) {
      const ca = P.o2Content(p.hb, p.sao2 / 100, p.pao2);
      const cv = P.o2Content(p.hb, p.svo2 / 100, p.pvo2);
      const xs = range(1, 15, 56);
      return {
        outputs: [
          { label: 'CaO₂', value: ca.total, unit: 'mL/dL', digits: 2, hint: ca.dissolved, hintUnit: 'mL/dL disciolti' },
          { label: 'CvO₂', value: cv.total, unit: 'mL/dL', digits: 2 },
          { label: 'Differenza a-v', value: ca.total - cv.total, unit: 'mL/dL', digits: 2 },
          { label: 'DO₂', value: P.o2Delivery(ca.total, p.q), unit: 'mL/min', digits: 0 },
          { label: 'VO₂', value: P.o2Consumption(p.q, ca.total, cv.total), unit: 'mL/min', digits: 0 },
          { label: 'Estrazione O₂ER', value: P.o2Extraction(ca.total, cv.total) * 100, unit: '%', digits: 1 },
        ],
        warnings: p.svo2 > p.sao2 ? ['La SvO₂ è più alta della SaO₂: valori non fisiologici.'] : [],
        chart: { type: 'line', spec: { title: 'DO₂ in funzione della portata cardiaca', x: { label: 'Portata cardiaca', unit: 'L/min', min: 1, max: 15 }, y: { label: 'DO₂', unit: 'mL/min', min: 0 }, series: [
          { name: 'Hb ' + fx(p.hb, 1) + ' g/dL', points: xs.map(q => [q, P.o2Delivery(ca.total, q)]) },
        ], marker: { x: p.q, y: P.o2Delivery(ca.total, p.q), label: fx(P.o2Delivery(ca.total, p.q), 0) + ' mL/min' } } },
      };
    },
  },
  {
    id: 'a-iperbarico', level: 'advanced', module: '6.4', area: 'D', models: ['alveolar', 'o2content', 'odc', 'henry'],
    title: { it: 'Simulatore iperbarico', en: 'Hyperbaric simulator' },
    summary: { it: 'PAO₂, PaO₂ con gradiente A-a scelto, ossigeno legato e disciolto fino a 3 ATA.', en: 'PAO₂, PaO₂ with a chosen A–a gradient, bound and dissolved oxygen up to 3 ATA.' },
    tags: 'iperbarica ossigenoterapia ata pao2 disciolto contenuto gradiente',
    params: [
      { id: 'ata', label: { it: 'Pressione', en: 'Pressure' }, unit: 'ATA', min: 1, max: 3, step: 0.05, value: 2.4 },
      { id: 'fio2', label: { it: 'FiO₂', en: 'FiO₂' }, unit: '%', min: 21, max: 100, step: 1, value: 100 },
      { id: 'paco2', label: { it: 'PaCO₂', en: 'PaCO₂' }, unit: 'mmHg', min: 25, max: 60, step: 1, value: 40 },
      { id: 'aa', label: { it: 'Gradiente A-a ipotizzato', en: 'Assumed A–a gradient' }, unit: 'mmHg', min: 0, max: 400, step: 5, value: 0 },
      { id: 'hb', label: { it: 'Emoglobina', en: 'Haemoglobin' }, unit: 'g/dL', min: 5, max: 18, step: 0.5, value: 14 },
    ],
    compute(p) {
      const f = p.fio2 / 100;
      const calc = ata => {
        const A = P.alveolarPO2({ pb: ata * 760, fio2: f, paco2: p.paco2 , full: true });
        const a = Math.max(A - p.aa, 0);
        const c = P.o2Content(p.hb, P.severinghausSat(a), a);
        return { A, a, ...c, s: P.severinghausSat(a) };
      };
      const r = calc(p.ata);
      const xs = range(1, 3, 40);
      return {
        outputs: [
          { label: 'PAO₂', value: r.A, unit: 'mmHg', digits: 0 },
          { label: 'PaO₂ (PAO₂ − gradiente)', value: r.a, unit: 'mmHg', digits: 0 },
          { label: 'SaO₂ stimata', value: r.s * 100, unit: '%', digits: 1 },
          { label: 'O₂ legato', value: r.bound, unit: 'mL/dL', digits: 2 },
          { label: 'O₂ disciolto', value: r.dissolved, unit: 'mL/dL', digits: 2 },
          { label: 'CaO₂ totale', value: r.total, unit: 'mL/dL', digits: 2, hint: r.dissolved / r.total * 100, hintUnit: '% disciolto' },
        ],
        visual: V.chamber({ ata: p.ata, gas: f >= 0.99 ? 'o2' : 'aria', gasText: 'FiO₂ ' + p.fio2 + '%', label: 'Camera a ' + p.ata + ' ATA' }),
        chart: { type: 'line', spec: { title: 'Contenuto arterioso di O₂ in funzione della pressione', x: { label: 'Pressione', unit: 'ATA', min: 1, max: 3 }, y: { label: 'Contenuto', unit: 'mL/dL', min: 0 }, series: [
          { name: 'Legato', points: xs.map(x => [x, calc(x).bound]) },
          { name: 'Disciolto', points: xs.map(x => [x, calc(x).dissolved]) },
          { name: 'Totale', points: xs.map(x => [x, calc(x).total]) },
        ], marker: { x: p.ata, y: r.total, label: fx(r.total, 1) + ' mL/dL' } } },
        warnings: ['Strumento didattico: non è uno strumento di prescrizione dell\'ossigenoterapia iperbarica. Il gradiente A-a è un\'ipotesi inserita dall\'utente.'],
      };
    },
  },
  {
    id: 'a-ipobarico', level: 'advanced', module: '6.6', area: 'E', models: ['isa', 'alveolar', 'odc'],
    title: { it: 'Ambiente ipobarico e aerospaziale', en: 'Hypobaric and aerospace environment' },
    summary: { it: 'Quota, FiO₂ e ventilazione: PAO₂ e saturazione stimata con la curva standard.', en: 'Altitude, FiO₂ and ventilation: PAO₂ and saturation estimated with the standard curve.' },
    tags: 'quota ipobarico aerospaziale cabina ipossia iperventilazione pao2 saturazione',
    params: [
      { id: 'alt', label: { it: 'Quota (o quota di cabina)', en: 'Altitude (or cabin altitude)' }, unit: 'm', min: 0, max: 11000, step: 100, value: 2438 },
      { id: 'fio2', label: { it: 'FiO₂', en: 'FiO₂' }, unit: '%', min: 21, max: 100, step: 1, value: 21 },
      { id: 'paco2', label: { it: 'PaCO₂ (iperventilazione = valori bassi)', en: 'PaCO₂ (hyperventilation = low values)' }, unit: 'mmHg', min: 15, max: 45, step: 1, value: 40 },
      { id: 'aa', label: { it: 'Gradiente A-a ipotizzato', en: 'Assumed A–a gradient' }, unit: 'mmHg', min: 0, max: 30, step: 1, value: 5 },
    ],
    compute(p) {
      const f = p.fio2 / 100;
      const pb = h => mmHg(F.isaPressure(h));
      const A = h => P.alveolarPO2({ pb: pb(h), fio2: f, paco2: p.paco2 , full: true });
      const a = Math.max(A(p.alt) - p.aa, 0);
      const xs = range(0, 11000, 110);
      return {
        outputs: [
          { label: 'Pressione barometrica (ISA)', value: pb(p.alt), unit: 'mmHg', digits: 0, hint: F.isaPressure(p.alt) / 1000, hintUnit: 'kPa' },
          { label: 'PiO₂', value: P.inspiredPO2(pb(p.alt), f), unit: 'mmHg', digits: 1 },
          { label: 'PAO₂', value: A(p.alt), unit: 'mmHg', digits: 1 },
          { label: 'PaO₂ (ipotesi)', value: a, unit: 'mmHg', digits: 1 },
          { label: 'Saturazione stimata (curva standard)', value: P.severinghausSat(a) * 100, unit: '%', digits: 1 },
        ],
        visual: V.mountain({ alt: p.alt, maxAlt: 11000, pb: pb(p.alt), label: 'Quota ' + p.alt + ' metri' }),
        chart: { type: 'line', spec: { title: 'PAO₂ in funzione della quota', x: { label: 'Quota', unit: 'm', min: 0, max: 11000 }, y: { label: 'PAO₂', unit: 'mmHg', min: 0 }, series: [
          { name: 'PaCO₂ 40 mmHg', points: xs.map(h => [h, P.alveolarPO2({ pb: pb(h), fio2: f, paco2: 40 , full: true })]) },
          ...(p.paco2 !== 40 ? [{ name: 'PaCO₂ ' + p.paco2 + ' mmHg', points: xs.map(h => [h, A(h)]) }] : []),
        ], marker: { x: p.alt, y: A(p.alt), label: fx(A(p.alt), 0) + ' mmHg' } } },
        warnings: ['La saturazione è stimata con la curva standard: in quota l\'alcalosi da iperventilazione sposta la curva, e la risposta individuale varia molto.'],
      };
    },
  },
  {
    id: 'a-confronto', level: 'advanced', module: '6.10', area: 'E', models: ['environments', 'isa', 'hydrostatic', 'alveolar', 'odc'],
    title: { it: 'Simulatore comparativo di ambienti', en: 'Comparative environment simulator' },
    summary: { it: 'Tre scenari affiancati: profondità, quota o pressione libera, con la FiO₂ che vuoi.', en: 'Three scenarios side by side: depth, altitude or free pressure, with any FiO₂.' },
    tags: 'confronto scenari ambienti profondità quota pressione fio2 affiancati',
    params: ['A', 'B', 'C'].flatMap((k, i) => [
      { id: 't' + k, label: 'Scenario ' + k + ': tipo', type: 'select', value: ['prof', 'quota', 'kpa'][i], options: [{ v: 'prof', label: { it: 'Profondità in mare (m)', en: 'Sea depth (m)' } }, { v: 'quota', label: { it: 'Quota ISA (m)', en: 'ISA altitude (m)' } }, { v: 'kpa', label: { it: 'Pressione libera (kPa)', en: 'Free pressure (kPa)' } }] },
      { id: 'v' + k, label: 'Scenario ' + k + ': valore', unit: '', min: 0, max: 9000, step: 1, value: [30, 4500, 56.5][i] },
      { id: 'f' + k, label: 'Scenario ' + k + ': FiO₂', unit: '%', min: 5, max: 100, step: 1, value: [21, 21, 34][i] },
    ]),
    compute(p) {
      const sc = ['A', 'B', 'C'].map(k => {
        const t = p['t' + k], v = p['v' + k], f = p['f' + k] / 100;
        let pa, name;
        if (t === 'prof') { const d = Math.min(v, 300); pa = F.absolutePressureAtDepth(d); name = d + ' m in mare'; }
        else if (t === 'quota') { const h = Math.min(v, 11000); pa = F.isaPressure(h); name = h + ' m di quota'; }
        else { const k2 = Math.min(Math.max(v, 1), 1000); pa = k2 * 1000; name = k2 + ' kPa'; }
        const pb = mmHg(pa);
        const A = P.alveolarPO2({ pb, fio2: f , full: true });
        return { k, name: k + ' · ' + name + ', ' + Math.round(f * 100) + '% O₂', short: k, pa, pio2: P.inspiredPO2(pb, f), A, s: P.severinghausSat(A), d: P.O2_SOLUBILITY * A };
      });
      return {
        table: { cols: ['', ...sc.map(s => s.name)], rows: [
          ['Pressione (kPa)', ...sc.map(s => fx(s.pa / 1000, 1))],
          ['PiO₂ (mmHg)', ...sc.map(s => fx(s.pio2, 0))],
          ['PAO₂ (mmHg, PaCO₂ 40, R 0,8)', ...sc.map(s => fx(s.A, 0))],
          ['Saturazione se PaO₂ = PAO₂ (%)', ...sc.map(s => fx(s.s * 100, 1))],
          ['O₂ disciolto se PaO₂ = PAO₂ (mL/dL)', ...sc.map(s => fx(s.d, 2))],
        ] },
        outputs: sc.map(s => ({ label: s.name, value: s.A, unit: 'mmHg PAO₂', digits: 0 })),
        chart: { type: 'bar', spec: { title: 'PiO₂ e PAO₂ nei tre scenari', unit: 'mmHg', groups: sc.map(s => ({ label: 'Scenario ' + s.k, values: [{ name: 'PiO₂', v: s.pio2 }, { name: 'PAO₂', v: s.A }] })) } },
        warnings: ['La PAO₂ assume PaCO₂ 40 mmHg e nessun gradiente in tutti gli scenari: è un confronto tra ambienti, non una previsione su una persona. In quota l\'iperventilazione abbassa la PaCO₂ e alza la PAO₂ (vedi il modulo 6.6).'],
      };
    },
  },
  /* moduli progettati, non ancora pubblicati */
  { id: 'a-co', level: 'advanced', module: '6.5', area: 'F', models: ['co'], pending: true,
    title: { it: 'Monossido di carbonio', en: 'Carbon monoxide' },
    summary: { it: 'Formazione ed eliminazione di COHb (modello di Coburn-Forster-Kane). In attesa di validazione.', en: 'COHb uptake and elimination (Coburn–Forster–Kane). Pending validation.' },
    tags: 'monossido carbonio co cohb intossicazione cfk' },
  { id: 'a-termico', level: 'advanced', module: '6.7', area: 'E', models: ['thermal'], pending: true,
    title: { it: 'Ambiente termico', en: 'Thermal environment' },
    summary: { it: 'Dispersione di calore in acqua e in aria. In attesa di validazione.', en: 'Heat loss in water and air. Pending validation.' },
    tags: 'termico ipotermia freddo calore acqua' },
  { id: 'a-apnea', level: 'advanced', module: '6.8', area: 'C', models: ['apnea'], pending: true,
    title: { it: 'Apnea', en: 'Breath-hold diving' },
    summary: { it: 'Volumi polmonari e PO₂ alveolare in apnea profonda. In attesa di validazione.', en: 'Lung volumes and alveolar PO₂ in deep breath-hold. Pending validation.' },
    tags: 'apnea freediving volume polmonare ipossia risalita' },
];
