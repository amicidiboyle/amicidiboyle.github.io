/* Esegue il banco di prova da riga di comando: node lab/tests/run.mjs */
import { runAll } from './cases.js';
import { MODELS } from '../core/registry.js';
import { REFS } from '../core/refs.js';

const res = runAll();
let fail = 0;
for (const r of res) {
  if (!r.ok) fail++;
  console.log((r.ok ? 'OK   ' : 'FAIL ') + r.id.padEnd(16) + ' atteso ' + r.expected + ' ± ' + r.tol + '  ottenuto ' + (r.err || r.got));
}
/* coerenza del registro: ogni test citato esiste, ogni fonte citata esiste */
const ids = new Set(res.map(r => r.id));
for (const [k, m] of Object.entries(MODELS)) {
  for (const t of m.tests) if (!ids.has(t)) { fail++; console.log('FAIL registro: ' + k + ' cita il test inesistente ' + t); }
  for (const r of m.refs) if (!REFS[r]) { fail++; console.log('FAIL registro: ' + k + ' cita la fonte inesistente ' + r); }
}
console.log('\n' + (res.length - res.filter(r => !r.ok).length) + '/' + res.length + ' casi superati' + (fail ? ', ' + fail + ' errori' : ''));
process.exit(fail ? 1 : 0);
