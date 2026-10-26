/* BOYLE LAB · Libreria delle unità di misura
   Internamente tutto e' in unita' SI: pressione in Pa, lunghezze in m, volumi in m³,
   temperature in K, frazioni adimensionali (0-1). Le conversioni servono solo per mostrare
   e inserire i valori. Le costanti sono valori convenzionali/definiti (vedi registro modelli). */

export const CONST = Object.freeze({
  P_ATM: 101325,            // Pa, atmosfera standard (valore definito)
  G: 9.80665,               // m/s², accelerazione di gravita' standard (valore definito)
  R: 8.314462618,           // J/(mol·K), costante universale dei gas (CODATA 2018, esatta)
  T0: 273.15,               // K, zero della scala Celsius
  MMHG: 133.322387415,      // Pa per mmHg (valore convenzionale; 1 Torr = 101325/760 = 133,3224 Pa, differenza trascurabile)
  BAR: 100000,              // Pa per bar
  RHO_SEAWATER: 1025,       // kg/m³, densita' convenzionale dell'acqua di mare (ipotesi dichiarata)
  RHO_FRESHWATER: 1000,     // kg/m³, acqua dolce (ipotesi dichiarata)
  PH2O_37_MMHG: 47,         // mmHg, tensione di vapore acqueo a 37 °C (valore di riferimento in fisiologia)
});

/* Masse molari in kg/mol */
export const MOLAR_MASS = Object.freeze({
  O2: 0.031998,
  N2: 0.028014,
  He: 0.0040026,
  CO2: 0.044009,
  AIR: 0.0289644,         // valore ISO 2533
});

export const pressure = {
  toPa: {
    Pa: v => v, kPa: v => v * 1000, bar: v => v * CONST.BAR,
    ATA: v => v * CONST.P_ATM, atm: v => v * CONST.P_ATM, mmHg: v => v * CONST.MMHG,
  },
  fromPa: {
    Pa: v => v, kPa: v => v / 1000, bar: v => v / CONST.BAR,
    ATA: v => v / CONST.P_ATM, atm: v => v / CONST.P_ATM, mmHg: v => v / CONST.MMHG,
  },
  convert(v, from, to) {
    if (!this.toPa[from] || !this.fromPa[to]) throw new Error('Unita\' di pressione sconosciuta: ' + from + ' → ' + to);
    return this.fromPa[to](this.toPa[from](v));
  },
};

export const temperature = {
  CtoK: c => c + CONST.T0,
  KtoC: k => k - CONST.T0,
};

export const volume = {
  LtoM3: l => l / 1000,
  M3toL: m => m * 1000,
};

/* frazione ⇄ percentuale */
export const frac = { fromPct: p => p / 100, toPct: f => f * 100 };

/* formattazione numerica coerente (locale italiano) */
export function fmt(v, digits = 2, locale = 'it-IT') {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  if (!Number.isFinite(v)) return '∞';
  return v.toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/* controllo degli input: numero finito entro un intervallo fisicamente sensato */
export function assertRange(name, v, min, max) {
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new RangeError(name + ': valore non numerico');
  if (v < min || v > max) throw new RangeError(name + ': ' + v + ' fuori dall\'intervallo ammesso [' + min + ', ' + max + ']');
  return v;
}
