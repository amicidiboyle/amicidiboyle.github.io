/* BOYLE LAB · Esperimenti BASE (moduli 5.1–5.5)
   Ogni esperimento dichiara: parametri, calcolo (solo funzioni del core), modelli del registro,
   e la parte didattica (obiettivo, spiegazione, formula, errore comune, quiz, collegamento). */
import { CONST } from '../core/units.js';
import * as F from '../core/physics.js';
import * as P from '../core/physio.js';
import * as M from '../core/mixtures.js';
import * as V from '../ui/instruments.js';

const range = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => a + (b - a) * i / n);
const bar = pa => pa / CONST.BAR;
const mmHg = pa => pa / CONST.MMHG;
const WATER = [{ v: 'mare', label: { it: 'Acqua di mare (1025 kg/m³)', en: 'Seawater (1025 kg/m³)' } }, { v: 'dolce', label: { it: 'Acqua dolce (1000 kg/m³)', en: 'Fresh water (1000 kg/m³)' } }];
const rhoOf = w => w === 'dolce' ? CONST.RHO_FRESHWATER : CONST.RHO_SEAWATER;

/* ── esperimenti ─────────────────────────────────────────────────────────── */
export const BASE = [
  {
    id: 'b-colonna', level: 'base', module: '5.3', area: 'C', models: ['hydrostatic', 'boyle', 'dalton'],
    title: { it: 'La colonna d\'acqua', en: 'The water column' },
    summary: { it: 'Porta un volume di gas in profondità: pressione, volume e pressioni parziali cambiano insieme.', en: 'Take a volume of gas to depth: pressure, volume and partial pressures change together.' },
    tags: 'profondità pressione assoluta relativa boyle volume polmoni apnea ara bar ata',
    params: [
      { id: 'depth', label: { it: 'Profondità', en: 'Depth' }, unit: 'm', min: 0, max: 40, step: 0.5, value: 10 },
      { id: 'v0', label: { it: 'Volume di gas in superficie', en: 'Gas volume at the surface' }, unit: 'L', min: 1, max: 10, step: 0.5, value: 6 },
      { id: 'water', label: { it: 'Acqua', en: 'Water' }, type: 'select', options: WATER, value: 'mare' },
    ],
    compute(p) {
      const rho = rhoOf(p.water);
      const pabs = F.absolutePressureAtDepth(p.depth, { rho });
      const v = F.boyleVolume(p.v0, CONST.P_ATM, pabs);
      const pts = range(0, 40, 80).map(d => [d, F.boyleVolume(p.v0, CONST.P_ATM, F.absolutePressureAtDepth(d, { rho }))]);
      return {
        outputs: [
          { label: 'Pressione assoluta', value: bar(pabs), unit: 'bar', digits: 3, hint: pabs / CONST.P_ATM, hintUnit: 'ATA' },
          { label: 'Pressione relativa (manometro)', value: bar(pabs - CONST.P_ATM), unit: 'bar', digits: 3 },
          { label: 'Volume del gas (Boyle)', value: v, unit: 'L', digits: 2 },
          { label: 'Rapporto V / V₀', value: v / p.v0, unit: '', digits: 3 },
          { label: 'PO₂ respirando aria', value: 0.21 * bar(pabs), unit: 'bar', digits: 3 },
          { label: 'PN₂ respirando aria', value: 0.79 * bar(pabs), unit: 'bar', digits: 3 },
        ],
        chart: { type: 'line', spec: { title: 'Volume di una quantità fissa di gas in funzione della profondità', x: { label: 'Profondità', unit: 'm', min: 0, max: 40 }, y: { label: 'Volume', unit: 'L', min: 0 }, series: [{ name: 'Volume (Boyle)', points: pts }], marker: { x: p.depth, y: v, label: v.toLocaleString('it-IT', { maximumFractionDigits: 2 }) + ' L' } } },
        visual: V.waterColumn({ depth: p.depth, vol: v, v0: p.v0, pBar: bar(pabs), label: 'Colonna d\'acqua: pallone di gas a ' + p.depth + ' metri' }),
      };
    },
    didactic: {
      objective: 'Capire perché la variazione di volume è più grande vicino alla superficie.',
      explain: 'Ogni 10 metri di acqua di mare aggiungono circa 1 bar. Il gas che il subacqueo porta con sé (nei polmoni in apnea, nel GAV, nella maschera) si comprime secondo Boyle: tra 0 e 10 m il volume si dimezza, tra 30 e 40 m cambia solo del 20%. Per questo le variazioni di assetto e i barotraumi sono più frequenti nei primi metri.',
      formula: 'P_abs = P_sup + ρ·g·d     ·     V = V₀ · P₀ / P_abs',
      misconception: 'Usare la pressione relativa (quella del manometro) nella legge di Boyle. A 10 m la pressione relativa è 1 bar, ma il gas risponde alla pressione assoluta, che è 2 bar.',
      quiz: { q: 'Un pallone ha 6 L in superficie. Quanto vale a 10 m in mare, con Boyle?', options: ['Circa 3 L', 'Circa 5,4 L', '6 L, l\'acqua non comprime il gas', 'Circa 1,5 L'], correct: 0, why: 'A 10 m la pressione assoluta è circa 2 bar, il doppio della superficie: il volume si dimezza.' },
      note: 'Modello ideale: il torace reale non è un pallone perfettamente cedevole e in apnea profonda intervengono altri adattamenti (ad esempio lo spostamento di sangue nel torace).',
      next: 'a-miscele',
    },
  },
  {
    id: 'b-boyle', level: 'base', module: '5.1', area: 'A', models: ['boyle'],
    title: { it: 'Legge di Boyle', en: 'Boyle\'s law' },
    summary: { it: 'Pressione e volume di un gas a temperatura costante: l\'iperbole di Boyle.', en: 'Pressure and volume of a gas at constant temperature: Boyle\'s hyperbola.' },
    tags: 'boyle mariotte pressione volume isoterma',
    params: [
      { id: 'v1', label: { it: 'Volume iniziale V₁', en: 'Initial volume V₁' }, unit: 'L', min: 0.5, max: 20, step: 0.5, value: 10 },
      { id: 'p1', label: { it: 'Pressione iniziale P₁ (assoluta)', en: 'Initial pressure P₁ (absolute)' }, unit: 'bar', min: 0.2, max: 6, step: 0.1, value: 1 },
      { id: 'p2', label: { it: 'Pressione finale P₂ (assoluta)', en: 'Final pressure P₂ (absolute)' }, unit: 'bar', min: 0.2, max: 6, step: 0.1, value: 4 },
    ],
    compute(p) {
      const v2 = F.boyleVolume(p.v1, p.p1, p.p2);
      const pts = range(0.2, 6, 116).map(x => [x, F.boyleVolume(p.v1, p.p1, x)]);
      return {
        outputs: [
          { label: 'Volume finale V₂', value: v2, unit: 'L', digits: 3 },
          { label: 'P · V (costante)', value: p.p1 * p.v1, unit: 'bar·L', digits: 2 },
          { label: 'Rapporto V₂ / V₁', value: v2 / p.v1, unit: '', digits: 3 },
        ],
        visual: V.piston({ frac: v2 / (p.v1 * p.p1 / 0.5), pBar: p.p2, pMax: 6, vol: v2, label: 'Cilindro con pistone a ' + p.p2 + ' bar' }),
        chart: { type: 'line', spec: { title: 'P · V = costante', x: { label: 'Pressione assoluta', unit: 'bar', min: 0, max: 6 }, y: { label: 'Volume', unit: 'L', min: 0, max: Math.min(Math.max(p.v1 * p.p1 / 0.2, 1), p.v1 * p.p1 * 2.5) }, series: [{ name: 'Isoterma', points: pts }], marker: { x: p.p2, y: v2, label: v2.toLocaleString('it-IT', { maximumFractionDigits: 2 }) + ' L' } } },
      };
    },
    didactic: {
      objective: 'Vedere che pressione e volume sono inversamente proporzionali.',
      explain: 'Se la quantità di gas e la temperatura non cambiano, raddoppiare la pressione dimezza il volume. Il prodotto P·V resta costante: è un\'iperbole, non una retta.',
      formula: 'P₁ · V₁ = P₂ · V₂',
      misconception: 'Pensare che il volume diminuisca in modo lineare con la pressione. Passare da 1 a 2 bar dimezza il volume; passare da 2 a 3 bar lo riduce solo di un terzo.',
      quiz: { q: 'Da 1 a 4 bar assoluti, 10 L di gas diventano…', options: ['2,5 L', '7,5 L', '4 L', '40 L'], correct: 0, why: '10 · 1 / 4 = 2,5 L.' },
      next: 'b-colonna',
    },
  },
  {
    id: 'b-charles', level: 'base', module: '5.1', area: 'A', models: ['charles'],
    title: { it: 'Legge di Charles', en: 'Charles\'s law' },
    summary: { it: 'Il volume di un gas cresce con la temperatura assoluta.', en: 'Gas volume grows with absolute temperature.' },
    tags: 'charles temperatura volume isobara kelvin',
    params: [
      { id: 'v1', label: { it: 'Volume iniziale', en: 'Initial volume' }, unit: 'L', min: 0.5, max: 10, step: 0.5, value: 1 },
      { id: 't1', label: { it: 'Temperatura iniziale', en: 'Initial temperature' }, unit: '°C', min: -40, max: 100, step: 1, value: 20 },
      { id: 't2', label: { it: 'Temperatura finale', en: 'Final temperature' }, unit: '°C', min: -40, max: 100, step: 1, value: 37 },
    ],
    compute(p) {
      const k1 = p.t1 + CONST.T0, k2 = p.t2 + CONST.T0;
      const v2 = F.charlesVolume(p.v1, k1, k2);
      const pts = range(-40, 100, 70).map(t => [t, F.charlesVolume(p.v1, k1, t + CONST.T0)]);
      return {
        outputs: [
          { label: 'Volume finale', value: v2, unit: 'L', digits: 3 },
          { label: 'T₁ assoluta', value: k1, unit: 'K', digits: 2 },
          { label: 'T₂ assoluta', value: k2, unit: 'K', digits: 2 },
          { label: 'Variazione', value: (v2 / p.v1 - 1) * 100, unit: '%', digits: 1 },
        ],
        visual: V.piston({ frac: v2 / (p.v1 * (100 + CONST.T0) / k1), vol: v2, tC: p.t2, label: 'Cilindro a pressione costante a ' + p.t2 + ' °C' }),
        chart: { type: 'line', spec: { title: 'Volume a pressione costante', x: { label: 'Temperatura', unit: '°C', min: -40, max: 100 }, y: { label: 'Volume', unit: 'L', min: 0 }, series: [{ name: 'Charles', points: pts }], marker: { x: p.t2, y: v2, label: v2.toLocaleString('it-IT', { maximumFractionDigits: 3 }) + ' L' } } },
      };
    },
    didactic: {
      objective: 'Capire perché nelle leggi dei gas la temperatura va in kelvin.',
      explain: 'A pressione costante il volume è proporzionale alla temperatura assoluta. Passare da 20 °C a 37 °C, come succede all\'aria che entra nei polmoni, aumenta il volume di circa il 6%, non dell\'85%.',
      formula: 'V₁ / T₁ = V₂ / T₂   (T in kelvin = °C + 273,15)',
      misconception: 'Fare il rapporto delle temperature in gradi Celsius. 37/20 suggerirebbe +85%, il valore corretto (310,15/293,15) è +5,8%.',
      quiz: { q: 'Perché si usano i kelvin?', options: ['Perché il volume è proporzionale alla temperatura assoluta', 'Per convenzione internazionale, il risultato non cambia', 'Perché i kelvin sono più precisi', 'Solo per le temperature negative'], correct: 0, why: 'Lo zero della scala Celsius è arbitrario; quello dei kelvin no.' },
      next: 'b-gaylussac',
    },
  },
  {
    id: 'b-gaylussac', level: 'base', module: '5.1', area: 'A', models: ['gaylussac'],
    title: { it: 'Legge di Gay-Lussac: la bombola al sole', en: 'Gay-Lussac\'s law: the tank in the sun' },
    summary: { it: 'In un recipiente rigido la pressione sale con la temperatura.', en: 'In a rigid vessel pressure rises with temperature.' },
    tags: 'gay-lussac bombola temperatura pressione isocora',
    params: [
      { id: 'p1', label: { it: 'Pressione di carica (relativa)', en: 'Fill pressure (gauge)' }, unit: 'bar', min: 0, max: 300, step: 5, value: 200 },
      { id: 't1', label: { it: 'Temperatura alla carica', en: 'Temperature at fill' }, unit: '°C', min: -10, max: 60, step: 1, value: 15 },
      { id: 't2', label: { it: 'Temperatura finale', en: 'Final temperature' }, unit: '°C', min: -10, max: 70, step: 1, value: 45 },
    ],
    compute(p) {
      const pAtm = CONST.P_ATM / CONST.BAR;
      const abs1 = p.p1 + pAtm, k1 = p.t1 + CONST.T0, k2 = p.t2 + CONST.T0;
      const abs2 = F.gayLussacPressure(abs1, k1, k2);
      const pts = range(-10, 70, 80).map(t => [t, F.gayLussacPressure(abs1, k1, t + CONST.T0) - pAtm]);
      return {
        outputs: [
          { label: 'Pressione finale (relativa)', value: abs2 - pAtm, unit: 'bar', digits: 1 },
          { label: 'Pressione finale (assoluta)', value: abs2, unit: 'bar', digits: 1 },
          { label: 'Aumento', value: abs2 - abs1, unit: 'bar', digits: 1 },
        ],
        visual: V.tank({ pRel: abs2 - pAtm, tC: p.t2, label: 'Bombola a ' + p.t2 + ' °C' }),
        chart: { type: 'line', spec: { title: 'Pressione in recipiente rigido', x: { label: 'Temperatura', unit: '°C', min: -10, max: 70 }, y: { label: 'Pressione relativa', unit: 'bar', min: 0 }, series: [{ name: 'Gay-Lussac (gas ideale)', points: pts }], marker: { x: p.t2, y: abs2 - pAtm, label: (abs2 - pAtm).toFixed(0) + ' bar' } } },
        warnings: p.p1 > 50 ? ['A queste pressioni l\'aria non si comporta esattamente come un gas ideale: il valore è indicativo.'] : [],
      };
    },
    didactic: {
      objective: 'Capire perché una bombola lasciata al sole aumenta di pressione.',
      explain: 'Il volume della bombola non cambia, quindi la pressione assoluta cresce in proporzione alla temperatura assoluta. Il calcolo si fa sulle pressioni assolute e si riconverte in relativa per confrontarlo con il manometro.',
      formula: 'P₁ / T₁ = P₂ / T₂   (pressioni assolute, temperature in kelvin)',
      misconception: 'Lavorare con la pressione del manometro (relativa) e con i °C: entrambi danno risultati sbagliati.',
      quiz: { q: 'Una bombola caricata a freddo e poi lasciata al sole…', options: ['aumenta di pressione', 'perde gas', 'resta uguale perché è chiusa', 'diminuisce di pressione'], correct: 0, why: 'Volume costante, temperatura più alta: pressione più alta.' },
      next: 'b-dalton',
    },
  },
  {
    id: 'b-dalton', level: 'base', module: '5.1', area: 'A', models: ['dalton', 'hydrostatic'],
    title: { it: 'Legge di Dalton in profondità', en: 'Dalton\'s law at depth' },
    summary: { it: 'Ogni gas della miscela ha la sua pressione parziale, che cresce con la profondità.', en: 'Each gas in a mix has its partial pressure, which grows with depth.' },
    tags: 'dalton pressione parziale ossigeno azoto nitrox profondità po2 pn2',
    params: [
      { id: 'fo2', label: { it: 'Ossigeno nella miscela', en: 'Oxygen in the mix' }, unit: '%', min: 21, max: 100, step: 1, value: 21 },
      { id: 'depth', label: { it: 'Profondità', en: 'Depth' }, unit: 'm', min: 0, max: 60, step: 1, value: 30 },
    ],
    compute(p) {
      const f = p.fo2 / 100;
      const P = d => bar(F.absolutePressureAtDepth(d));
      const pt = P(p.depth);
      const xs = range(0, 60, 60);
      return {
        outputs: [
          { label: 'Pressione assoluta', value: pt, unit: 'bar', digits: 3 },
          { label: 'PO₂', value: f * pt, unit: 'bar', digits: 3 },
          { label: 'PN₂', value: (1 - f) * pt, unit: 'bar', digits: 3 },
          { label: 'Somma delle parziali', value: pt, unit: 'bar', digits: 3 },
        ],
        visual: V.gasStack({ parts: [{ name: 'PN₂', value: (1 - f) * pt, color: '#E69F00' }, { name: 'PO₂', value: f * pt, color: '#56B4E9' }], maxTotal: 7.5, title: 'Pressione totale ' + pt.toFixed(2).replace('.', ',') + ' bar', label: 'Pressioni parziali a ' + p.depth + ' metri' }),
        chart: { type: 'line', spec: { title: 'Pressioni parziali in funzione della profondità', x: { label: 'Profondità', unit: 'm', min: 0, max: 60 }, y: { label: 'Pressione parziale', unit: 'bar', min: 0 }, series: [{ name: 'PO₂', points: xs.map(d => [d, f * P(d)]) }, { name: 'PN₂', points: xs.map(d => [d, (1 - f) * P(d)]) }], marker: { x: p.depth, y: f * pt, label: 'PO₂ ' + (f * pt).toFixed(2) + ' bar' } } },
      };
    },
    didactic: {
      objective: 'Vedere che la frazione di un gas non cambia con la profondità, la sua pressione parziale sì.',
      explain: 'L\'aria resta al 21% di ossigeno a qualunque profondità, ma la pressione parziale dell\'ossigeno è il 21% di una pressione totale più grande. Sono le pressioni parziali, non le percentuali, a determinare gli effetti fisiologici.',
      formula: 'P_i = F_i · P_tot',
      misconception: '«A 30 m respiro più ossigeno perché l\'aria è più ricca». La miscela è la stessa: cambia la pressione a cui viene respirata.',
      quiz: { q: 'Qual è la PO₂ dell\'aria a circa 4 bar assoluti?', options: ['Circa 0,84 bar', '0,21 bar', 'Circa 4 bar', 'Circa 3,16 bar'], correct: 0, why: '0,21 · 4 = 0,84 bar. 3,16 bar è la PN₂.' },
      next: 'a-miscele',
    },
  },
  {
    id: 'b-henry', level: 'base', module: '5.2', area: 'B', models: ['henry', 'odc'],
    title: { it: 'Ossigeno legato e disciolto', en: 'Bound and dissolved oxygen' },
    summary: { it: 'L\'emoglobina si satura presto; l\'ossigeno disciolto cresce in modo lineare con la PO₂ (Henry).', en: 'Haemoglobin saturates early; dissolved oxygen grows linearly with PO₂ (Henry).' },
    tags: 'henry disciolto plasma emoglobina saturazione contenuto ossigeno iperbarica',
    params: [
      { id: 'po2', label: { it: 'PO₂', en: 'PO₂' }, unit: 'mmHg', min: 10, max: 2200, step: 10, value: 100 },
      { id: 'hb', label: { it: 'Emoglobina', en: 'Haemoglobin' }, unit: 'g/dL', min: 6, max: 18, step: 0.5, value: 15 },
    ],
    compute(p) {
      const s = P.severinghausSat(p.po2);
      const c = P.o2Content(p.hb, s, p.po2);
      const xs = range(10, 2200, 120);
      return {
        outputs: [
          { label: 'Saturazione (Severinghaus)', value: s * 100, unit: '%', digits: 1 },
          { label: 'O₂ legato all\'emoglobina', value: c.bound, unit: 'mL/dL', digits: 2 },
          { label: 'O₂ disciolto nel plasma', value: c.dissolved, unit: 'mL/dL', digits: 2 },
          { label: 'Contenuto totale', value: c.total, unit: 'mL/dL', digits: 2 },
        ],
        visual: V.plasma({ dissolved: c.dissolved, sat: s, label: 'Ossigeno disciolto nel plasma e legato all\'emoglobina' }),
        chart: { type: 'line', spec: { title: 'Contenuto di O₂ del sangue in funzione della PO₂', x: { label: 'PO₂', unit: 'mmHg', min: 0, max: 2200 }, y: { label: 'Contenuto', unit: 'mL/dL', min: 0 }, series: [
          { name: 'Legato (Hb)', points: xs.map(x => [x, P.o2Content(p.hb, P.severinghausSat(x), x).bound]) },
          { name: 'Disciolto (Henry)', points: xs.map(x => [x, P.O2_SOLUBILITY * x]) },
          { name: 'Totale', points: xs.map(x => [x, P.o2Content(p.hb, P.severinghausSat(x), x).total]) },
        ], marker: { x: p.po2, y: c.total, label: c.total.toFixed(1) + ' mL/dL' } } },
      };
    },
    didactic: {
      objective: 'Capire da dove arriva l\'ossigeno «in più» in camera iperbarica.',
      explain: 'Oltre i 100 mmHg circa l\'emoglobina è quasi completamente saturata: aumentare la PO₂ aggiunge pochissimo ossigeno legato. Quello disciolto invece cresce in proporzione alla PO₂ (legge di Henry): a 100 mmHg è 0,3 mL/dL, a 2000 mmHg è 6 mL/dL.',
      formula: 'CaO₂ = 1,34 · Hb · SaO₂ + 0,003 · PaO₂',
      misconception: 'Pensare che respirare ossigeno puro in superficie «raddoppi» l\'ossigeno nel sangue di una persona sana. L\'emoglobina era già quasi piena: aumenta soprattutto la piccola quota disciolta.',
      quiz: { q: 'Quanto O₂ disciolto c\'è nel plasma con PO₂ 1500 mmHg?', options: ['4,5 mL/dL', '0,45 mL/dL', '20 mL/dL', '45 mL/dL'], correct: 0, why: '0,003 · 1500 = 4,5 mL/dL.' },
      note: 'In questo esperimento la PO₂ del sangue è un dato in ingresso: non si calcola dalla pressione ambiente.',
      next: 'a-iperbarico',
    },
  },
  {
    id: 'b-curva', level: 'base', module: '5.2', area: 'B', models: ['odc', 'p50shift'],
    title: { it: 'La curva di dissociazione dell\'ossigeno', en: 'The oxygen dissociation curve' },
    summary: { it: 'Saturazione in funzione della PO₂, P50 ed effetto Bohr.', en: 'Saturation vs PO₂, P50 and the Bohr effect.' },
    tags: 'curva dissociazione emoglobina saturazione p50 bohr sigmoide',
    params: [
      { id: 'po2', label: { it: 'PO₂', en: 'PO₂' }, unit: 'mmHg', min: 5, max: 150, step: 1, value: 60 },
      { id: 'p50', label: { it: 'P50 della curva spostata', en: 'P50 of the shifted curve' }, unit: 'mmHg', min: 18, max: 40, step: 0.5, value: 32 },
    ],
    compute(p) {
      const s0 = P.severinghausSat(p.po2), s1 = P.satWithP50(p.po2, p.p50);
      const xs = range(0, 150, 150);
      return {
        outputs: [
          { label: 'Saturazione, curva standard (P50 26,8)', value: s0 * 100, unit: '%', digits: 1 },
          { label: 'Saturazione, curva con P50 scelto', value: s1 * 100, unit: '%', digits: 1 },
          { label: 'PO₂ per il 90% (standard)', value: P.po2ForSat(0.9), unit: 'mmHg', digits: 1 },
          { label: 'PO₂ per il 90% (P50 scelto)', value: P.po2ForSat(0.9, p.p50), unit: 'mmHg', digits: 1 },
        ],
        visual: V.hbCompare({ s1: s0, s2: s1, t1: 'curva standard', t2: 'P50 ' + String(p.p50).replace('.', ','), label: 'Siti dell\'emoglobina occupati alla PO₂ scelta' }),
        chart: { type: 'line', spec: { title: 'Curva di dissociazione dell\'ossiemoglobina', x: { label: 'PO₂', unit: 'mmHg', min: 0, max: 150 }, y: { label: 'Saturazione', unit: '%', min: 0, max: 100 }, series: [
          { name: 'Standard, P50 26,8', points: xs.map(x => [x, P.severinghausSat(x) * 100]) },
          { name: 'P50 ' + String(p.p50).replace('.', ','), points: xs.map(x => [x, P.satWithP50(x, p.p50) * 100]) },
        ], marker: { x: p.po2, y: s0 * 100, label: (s0 * 100).toFixed(1) + '%' } } },
      };
    },
    didactic: {
      objective: 'Riconoscere la forma a S della curva e cosa significa spostarla.',
      explain: 'Nella parte alta, piatta, la saturazione cambia poco anche se la PO₂ scende parecchio: è un margine di sicurezza. Nella parte ripida bastano pochi mmHg per perdere molta saturazione. Acidosi, aumento di CO₂ e temperatura spostano la curva a destra (P50 più alto: l\'emoglobina cede ossigeno più facilmente ai tessuti); il contrario la sposta a sinistra.',
      formula: 'S = 1 / (23400 / (PO₂³ + 150·PO₂) + 1)     (Severinghaus 1979)',
      misconception: 'Leggere la saturazione come se fosse la PO₂. Una saturazione del 90% corrisponde a circa 58 mmHg, non a 90.',
      quiz: { q: 'Uno spostamento a destra della curva (P50 più alto) significa che…', options: ['a parità di PO₂ la saturazione è più bassa e l\'O₂ viene ceduto più facilmente', 'il sangue trasporta più ossigeno', 'la PO₂ arteriosa aumenta', 'l\'emoglobina aumenta'], correct: 0, why: 'P50 più alto = minore affinità.' },
      note: 'La curva spostata è una rappresentazione didattica: si cambia solo P50 e non si calcola P50 da pH e temperatura.',
      next: 'a-alveolare',
    },
  },
  {
    id: 'b-quota', level: 'base', module: '5.2', area: 'E', models: ['isa', 'alveolar', 'dalton'],
    title: { it: 'Ossigeno in quota', en: 'Oxygen at altitude' },
    summary: { it: 'In montagna l\'aria ha sempre il 21% di O₂, ma la pressione cala.', en: 'At altitude air still has 21% O₂, but pressure falls.' },
    tags: 'quota montagna altitudine pressione barometrica fio2 pio2 ipossia isa',
    params: [
      { id: 'alt', label: { it: 'Quota', en: 'Altitude' }, unit: 'm', min: 0, max: 9000, step: 100, value: 3000 },
      { id: 'fio2', label: { it: 'FiO₂ respirata', en: 'Inspired FiO₂' }, unit: '%', min: 21, max: 100, step: 1, value: 21 },
    ],
    compute(p) {
      const pb = mmHg(F.isaPressure(p.alt));
      const f = p.fio2 / 100;
      const pio2 = P.inspiredPO2(pb, f);
      const sea = P.inspiredPO2(760, 0.21);
      const fNeeded = sea / (pb - CONST.PH2O_37_MMHG);
      const xs = range(0, 9000, 90);
      return {
        outputs: [
          { label: 'Pressione barometrica (ISA)', value: pb, unit: 'mmHg', digits: 0, hint: F.isaPressure(p.alt) / 1000, hintUnit: 'kPa' },
          { label: 'PiO₂', value: pio2, unit: 'mmHg', digits: 1 },
          { label: 'PiO₂ in percentuale del livello del mare', value: pio2 / sea * 100, unit: '%', digits: 0 },
          { label: 'FiO₂ per avere la PiO₂ del livello del mare', value: fNeeded > 1 ? NaN : fNeeded * 100, unit: '%', digits: 1, note: fNeeded > 1 ? 'non raggiungibile nemmeno con O₂ al 100%' : '' },
        ],
        visual: V.mountain({ alt: p.alt, pb, label: 'Quota ' + p.alt + ' metri' }),
        chart: { type: 'line', spec: { title: 'PO₂ inspirata in funzione della quota', x: { label: 'Quota', unit: 'm', min: 0, max: 9000 }, y: { label: 'PiO₂', unit: 'mmHg', min: 0 }, series: [
          { name: 'Aria (21%)', points: xs.map(h => [h, P.inspiredPO2(mmHg(F.isaPressure(h)), 0.21)]) },
          ...(p.fio2 !== 21 ? [{ name: 'FiO₂ ' + p.fio2 + '%', points: xs.map(h => [h, P.inspiredPO2(mmHg(F.isaPressure(h)), f)]) }] : []),
        ], marker: { x: p.alt, y: pio2, label: pio2.toFixed(0) + ' mmHg' } } },
      };
    },
    didactic: {
      objective: 'Distinguere la frazione di ossigeno dalla sua pressione parziale.',
      explain: 'Salendo di quota la percentuale di ossigeno nell\'aria resta 21%, ma la pressione totale diminuisce, e con lei la PO₂ inspirata. Arricchire la miscela con più ossigeno compensa la perdita, finché la pressione non è così bassa che nemmeno l\'ossigeno puro basta.',
      formula: 'PiO₂ = FiO₂ · (PB − 47 mmHg)',
      misconception: '«In montagna c\'è meno ossigeno nell\'aria». La percentuale è la stessa: è la pressione a essere più bassa.',
      quiz: { q: 'A 5000 m (ISA, circa 405 mmHg) la PiO₂ respirando aria è circa…', options: ['75 mmHg', '150 mmHg', '21 mmHg', '405 mmHg'], correct: 0, why: '0,21 · (405 − 47) ≈ 75 mmHg, la metà circa del livello del mare.' },
      note: 'L\'atmosfera ISA è un\'atmosfera media: la pressione reale di un giorno e di un luogo può differire.',
      next: 'a-ipobarico',
    },
  },
  {
    id: 'b-densita', level: 'base', module: '5.1', area: 'C', models: ['idealgas', 'hydrostatic'],
    title: { it: 'Densità del gas respirato', en: 'Breathing gas density' },
    summary: { it: 'Più si scende, più il gas è denso e più costa respirarlo.', en: 'The deeper you go, the denser the gas and the harder it is to breathe.' },
    tags: 'densità gas lavoro respiratorio elio trimix aria profondità',
    params: [
      { id: 'depth', label: { it: 'Profondità', en: 'Depth' }, unit: 'm', min: 0, max: 100, step: 1, value: 40 },
      { id: 'temp', label: { it: 'Temperatura del gas', en: 'Gas temperature' }, unit: '°C', min: 0, max: 40, step: 1, value: 20 },
    ],
    compute(p) {
      const mixes = [['Aria', { O2: 0.21 }], ['Nitrox 32', { O2: 0.32 }], ['Trimix 18/45', { O2: 0.18, He: 0.45 }], ['Heliox 10/90', { O2: 0.10, He: 0.90 }]];
      const xs = range(0, 100, 100);
      return {
        outputs: mixes.map(([n, m]) => ({ label: 'Densità ' + n, value: M.gasDensityAt(p.depth, m, p.temp), unit: 'g/L', digits: 2 })),
        visual: V.densityBoxes({ items: [{ name: 'Aria', rho: M.gasDensityAt(p.depth, mixes[0][1], p.temp), color: '#56B4E9' }, { name: 'Trimix 18/45', rho: M.gasDensityAt(p.depth, mixes[2][1], p.temp), color: '#009E73' }], maxRho: 14, label: 'Molecole di gas a ' + p.depth + ' metri' }),
        chart: { type: 'line', spec: { title: 'Densità del gas in funzione della profondità', x: { label: 'Profondità', unit: 'm', min: 0, max: 100 }, y: { label: 'Densità', unit: 'g/L', min: 0 }, series: mixes.map(([n, m]) => ({ name: n, points: xs.map(d => [d, M.gasDensityAt(d, m, p.temp)]) })), marker: { x: p.depth, y: M.gasDensityAt(p.depth, mixes[0][1], p.temp), label: 'Aria' } } },
      };
    },
    didactic: {
      objective: 'Capire perché in profondità si usa l\'elio.',
      explain: 'La densità di un gas è proporzionale alla pressione. A 40 m l\'aria è cinque volte più densa che in superficie, e il lavoro dei muscoli respiratori cresce. L\'elio è molto leggero: sostituire parte dell\'azoto con elio riduce la densità della miscela.',
      formula: 'ρ = P · M / (R · T)',
      misconception: 'Pensare che l\'elio serva solo contro la narcosi. Serve anche a ridurre la densità del gas e quindi il lavoro respiratorio.',
      quiz: { q: 'La densità dell\'aria a 30 m rispetto alla superficie è circa…', options: ['4 volte', 'uguale', '30 volte', 'la metà'], correct: 0, why: 'La pressione assoluta a 30 m è circa 4 bar, e la densità è proporzionale alla pressione.' },
      next: 'a-miscele',
    },
  },
  {
    id: 'b-archimede', level: 'base', module: '5.1', area: 'C', models: ['archimedes', 'boyle', 'hydrostatic'],
    title: { it: 'Archimede e l\'assetto', en: 'Archimedes and buoyancy' },
    summary: { it: 'Un volume d\'aria nel GAV o nella muta si comprime scendendo: l\'assetto cambia con la profondità.', en: 'Air in a BCD or wetsuit compresses on descent: buoyancy changes with depth.' },
    tags: 'archimede spinta assetto gav galleggiamento zavorra',
    params: [
      { id: 'vgas', label: { it: 'Aria nel GAV in superficie', en: 'Air in the BCD at the surface' }, unit: 'L', min: 0, max: 20, step: 0.5, value: 6 },
      { id: 'net0', label: { it: 'Peso netto del subacqueo senza aria nel GAV', en: 'Net weight of diver with empty BCD' }, unit: 'kg', min: -10, max: 10, step: 0.5, value: 4 },
      { id: 'depth', label: { it: 'Profondità', en: 'Depth' }, unit: 'm', min: 0, max: 40, step: 0.5, value: 10 },
    ],
    compute(p) {
      const lift = d => F.boyleVolume(p.vgas, CONST.P_ATM, F.absolutePressureAtDepth(d)) * CONST.RHO_SEAWATER / 1000; // kg di spinta
      const net = d => lift(d) - p.net0;
      const xs = range(0, 40, 80);
      const v = F.boyleVolume(p.vgas, CONST.P_ATM, F.absolutePressureAtDepth(p.depth));
      return {
        outputs: [
          { label: 'Volume d\'aria nel GAV a questa profondità', value: v, unit: 'L', digits: 2 },
          { label: 'Spinta del GAV', value: F.buoyancyForce(v / 1000), unit: 'N', digits: 1, hint: lift(p.depth), hintUnit: 'kg' },
          { label: 'Assetto risultante', value: net(p.depth), unit: 'kg', digits: 2, note: net(p.depth) > 0.05 ? 'positivo: tende a salire' : net(p.depth) < -0.05 ? 'negativo: tende a scendere' : 'neutro' },
        ],
        visual: V.waterColumn({ depth: p.depth, vol: v, v0: p.vgas, ref: 6, pBar: F.absolutePressureAtDepth(p.depth) / CONST.BAR, arrows: { up: lift(p.depth), down: p.net0, max: Math.max(lift(0), Math.abs(p.net0), 1) }, label: 'Subacqueo con il GAV a ' + p.depth + ' metri' }),
        chart: { type: 'line', spec: { title: 'Assetto in funzione della profondità (GAV non regolato)', x: { label: 'Profondità', unit: 'm', min: 0, max: 40 }, y: { label: 'Assetto (positivo = galleggia)', unit: 'kg', min: Math.min(-p.net0, 0) - 1, max: Math.max(net(0), 0) + 1 }, series: [{ name: 'Assetto', points: xs.map(d => [d, net(d)]) }, { name: 'Neutro', points: [[0, 0], [40, 0]], color: 'rgba(237,247,255,.4)', hideLegend: true }], marker: { x: p.depth, y: net(p.depth), label: net(p.depth).toFixed(1) + ' kg' } } },
      };
    },
    didactic: {
      objective: 'Collegare Archimede e Boyle: l\'assetto dipende dalla profondità.',
      explain: 'La spinta di Archimede è pari al peso dell\'acqua spostata. L\'aria nel GAV si comprime scendendo (Boyle), sposta meno acqua e la spinta diminuisce: chi era neutro in superficie diventa negativo e accelera verso il basso; in risalita succede il contrario. Per questo l\'assetto va corretto di continuo.',
      formula: 'F = ρ · g · V     ·     V = V₀ · P₀ / P',
      misconception: 'Pensare che una volta raggiunto l\'assetto neutro il subacqueo resti neutro a qualsiasi profondità.',
      quiz: { q: 'Un subacqueo neutro a 5 m scende a 15 m senza toccare il GAV. Diventa…', options: ['negativo', 'positivo', 'resta neutro', 'dipende solo dalla zavorra'], correct: 0, why: 'L\'aria nel GAV si comprime, la spinta diminuisce.' },
      note: 'Il peso netto senza aria è un dato in ingresso: comprende zavorra, attrezzatura e corpo. La compressione della muta non è modellata.',
      next: 'b-colonna',
    },
  },
  {
    id: 'b-camera', level: 'base', module: '5.4', area: 'D', models: ['alveolar', 'henry', 'dalton'],
    title: { it: 'La camera iperbarica', en: 'The hyperbaric chamber' },
    summary: { it: 'Pressione della camera e gas respirato: quanto ossigeno arriva disciolto nel plasma.', en: 'Chamber pressure and breathing gas: how much oxygen dissolves in plasma.' },
    tags: 'camera iperbarica ossigenoterapia ata ossigeno disciolto plasma',
    params: [
      { id: 'ata', label: { it: 'Pressione della camera', en: 'Chamber pressure' }, unit: 'ATA', min: 1, max: 3, step: 0.1, value: 2.4 },
      { id: 'gas', label: { it: 'Gas respirato', en: 'Breathing gas' }, type: 'select', value: 'o2', options: [{ v: 'o2', label: { it: 'Ossigeno 100% (maschera o casco)', en: '100% oxygen (mask or hood)' } }, { v: 'aria', label: { it: 'Aria', en: 'Air' } }] },
    ],
    compute(p) {
      const f = p.gas === 'o2' ? 1 : 0.21;
      const pb = p.ata * 760;
      const pao2 = d => P.alveolarPO2({ pb: d * 760, fio2: f });
      const xs = range(1, 3, 40);
      const A = pao2(p.ata);
      return {
        outputs: [
          { label: 'Pressione ambiente', value: pb, unit: 'mmHg', digits: 0, hint: p.ata * CONST.P_ATM / 1000, hintUnit: 'kPa' },
          { label: 'PiO₂', value: P.inspiredPO2(pb, f), unit: 'mmHg', digits: 0 },
          { label: 'PAO₂ (equazione dei gas alveolari)', value: A, unit: 'mmHg', digits: 0 },
          { label: 'O₂ disciolto se PaO₂ = PAO₂ (ipotesi)', value: P.O2_SOLUBILITY * A, unit: 'mL/dL', digits: 2 },
        ],
        chart: { type: 'line', spec: { title: 'O₂ disciolto nel plasma in funzione della pressione (ipotesi PaO₂ = PAO₂)', x: { label: 'Pressione della camera', unit: 'ATA', min: 1, max: 3 }, y: { label: 'O₂ disciolto', unit: 'mL/dL', min: 0, max: 7 }, bands: [{ y1: 4.5, y2: 5.5, label: 'differenza artero-venosa tipica a riposo (≈ 5 mL/dL)' }], series: [
          { name: 'Ossigeno 100%', points: xs.map(x => [x, P.O2_SOLUBILITY * P.alveolarPO2({ pb: x * 760, fio2: 1 })]) },
          { name: 'Aria', points: xs.map(x => [x, P.O2_SOLUBILITY * P.alveolarPO2({ pb: x * 760, fio2: 0.21 })]) },
        ], marker: { x: p.ata, y: P.O2_SOLUBILITY * A, label: (P.O2_SOLUBILITY * A).toFixed(1) + ' mL/dL' } } },
        visual: V.chamber({ ata: p.ata, gas: p.gas, label: 'Camera iperbarica a ' + p.ata.toFixed(2) + ' ATA' }),
      };
    },
    didactic: {
      objective: 'Capire perché l\'ossigenoterapia iperbarica combina pressione e ossigeno puro.',
      explain: 'Respirando ossigeno puro a 2,4 ATA la PO₂ alveolare supera i 1700 mmHg. Il plasma scioglie ossigeno in proporzione alla PO₂ (legge di Henry): oltre 5 mL/dL, quanto i tessuti estraggono in media a riposo. Con l\'aria, alla stessa pressione, l\'effetto è molto minore.',
      formula: 'PAO₂ = FiO₂·(PB − 47) − PaCO₂/0,8     ·     O₂ disciolto = 0,003 · PaO₂',
      misconception: 'Pensare che la camera «spinga» più ossigeno sull\'emoglobina. L\'emoglobina era già quasi satura: l\'aumento è quasi tutto ossigeno disciolto nel plasma.',
      quiz: { q: 'Cosa aumenta soprattutto in camera iperbarica con ossigeno puro?', options: ['L\'ossigeno disciolto nel plasma', 'L\'emoglobina', 'La saturazione dal 98% al 200%', 'La CO₂ alveolare'], correct: 0, why: 'L\'emoglobina non può superare il 100%; il disciolto cresce con la PO₂.' },
      note: 'Il valore disciolto usa l\'ipotesi semplificata PaO₂ = PAO₂ (nessun gradiente alveolo-arterioso). Questo laboratorio non è uno strumento di prescrizione dell\'ossigenoterapia iperbarica.',
      next: 'a-iperbarico',
    },
  },
  {
    id: 'b-ambienti', level: 'base', module: '5.5', area: 'E', models: ['environments', 'isa', 'hydrostatic', 'dalton'],
    title: { it: 'Confronto tra ambienti', en: 'Environment comparison' },
    summary: { it: 'Superficie, immersione, montagna, cabina d\'aereo, stazione spaziale, habitat marziano.', en: 'Surface, dive, mountain, aircraft cabin, space station, Mars habitat.' },
    tags: 'ambienti confronto spazio marte cabina aereo montagna immersione habitat',
    params: [
      { id: 'depth', label: { it: 'Profondità dell\'immersione', en: 'Dive depth' }, unit: 'm', min: 5, max: 60, step: 1, value: 20 },
      { id: 'alt', label: { it: 'Quota della montagna', en: 'Mountain altitude' }, unit: 'm', min: 1000, max: 8800, step: 100, value: 4500 },
      { id: 'habP', label: { it: 'Habitat marziano: pressione', en: 'Mars habitat: pressure' }, unit: 'kPa', min: 40, max: 101.3, step: 0.1, value: 56.5 },
      { id: 'habF', label: { it: 'Habitat marziano: ossigeno', en: 'Mars habitat: oxygen' }, unit: '%', min: 21, max: 50, step: 1, value: 34 },
    ],
    compute(p) {
      const envs = [
        ['Livello del mare', CONST.P_ATM, 0.21],
        ['Immersione a ' + p.depth + ' m (aria)', F.absolutePressureAtDepth(p.depth), 0.21],
        ['Montagna a ' + p.alt + ' m (ISA)', F.isaPressure(p.alt), 0.21],
        ['Cabina d\'aereo a 8000 ft', F.isaPressure(2438.4), 0.21],
        ['Stazione spaziale', 101300, 0.21],
        ['Habitat marziano (esempio)', p.habP * 1000, p.habF / 100],
        ['Superficie di Marte (esterno)', 600, 0.0015],
      ];
      const rows = envs.map(([n, pa, f]) => ({ n, kpa: pa / 1000, pio2: P.inspiredPO2(mmHg(pa), f) }));
      return {
        outputs: rows.map(r => ({ label: r.n, value: r.pio2, unit: 'mmHg PiO₂', digits: 0, hint: r.kpa, hintUnit: 'kPa' })),
        chart: { type: 'bar', spec: { title: 'PO₂ inspirata nei diversi ambienti', unit: 'mmHg', groups: rows.map(r => ({ label: r.n.replace(' (aria)', '').replace(' (ISA)', ''), values: [{ name: 'PiO₂', v: r.pio2 }] })) } },
        warnings: ['La superficie di Marte ha circa 0,6 kPa, quasi tutta CO₂ (O₂ ≈ 0,1–0,2%): sotto i 6,3 kPa (47 mmHg) i liquidi corporei bollono a 37 °C. Non è respirabile.'],
      };
    },
    didactic: {
      objective: 'Mettere sulla stessa scala ambienti molto diversi.',
      explain: 'Quello che conta per l\'organismo è la pressione parziale dell\'ossigeno inspirato. Un habitat a bassa pressione può avere una PiO₂ vicina a quella della superficie terrestre se ha più ossigeno; in immersione la PiO₂ cresce molto anche con l\'aria.',
      formula: 'PiO₂ = FiO₂ · (PB − 47 mmHg)',
      misconception: 'Pensare che una cabina pressurizzata sia al livello del mare. Di norma la pressione di cabina equivale a una quota fino a 8000 piedi (circa 2400 m).',
      quiz: { q: 'Un habitat a 56,5 kPa con 34% di O₂ ha una PiO₂…', options: ['simile a quella dell\'aria a circa 1200 m di quota', 'il doppio del livello del mare', 'la stessa di Marte', 'zero'], correct: 0, why: '56,5 kPa ≈ 424 mmHg; 0,34·(424 − 47) ≈ 128 mmHg, come respirare aria a circa 1200 m di quota (ISA).' },
      note: 'Valori tipici o di progetto: la cabina usa il limite regolamentare di 8000 ft, l\'habitat marziano l\'ambiente 8,2 psia / 34% studiato dalla NASA (modificabile).',
      next: 'a-confronto',
    },
  },
];
