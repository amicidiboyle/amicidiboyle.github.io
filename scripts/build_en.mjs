// Genera en.html (versione inglese della home leggibile dai motori di ricerca)
// partendo da index.html e dal dizionario inglese che la pagina usa gia' (var T = { it:..., en:... }).
// Uso: node scripts/build_en.mjs   (da eseguire dopo ogni modifica di index.html;
// lo fa in automatico il workflow .github/workflows/home-inglese.yml)
import { readFileSync, writeFileSync } from 'node:fs';

const SITE = 'https://www.amicidiboyle.it/';
const src = readFileSync('index.html', 'utf8');

// 1. Dizionario inglese
const start = src.indexOf('var T = {');
const end = src.indexOf('/* ── Apply translations ── */', start);
if (start < 0 || end < 0) throw new Error('Dizionario T non trovato in index.html');
const T = new Function(src.slice(start, end) + '\nreturn T;')();
const EN = T.en;

const escText = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// 2. Sostituisce il contenuto degli elementi con data-i18n / data-i18n-html
function replaceInner(html, attr, toHtml) {
  const re = new RegExp(`<([a-zA-Z][a-zA-Z0-9]*)\\b[^>]*\\s${attr}="([^"]+)"[^>]*>`, 'g');
  let out = '', last = 0, m, done = 0;
  while ((m = re.exec(html))) {
    const [open, tag, key] = m;
    if (EN[key] === undefined) continue;
    const innerStart = m.index + open.length;
    // trova la chiusura corrispondente contando gli annidamenti dello stesso tag
    const tagRe = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
    tagRe.lastIndex = innerStart;
    let depth = 1, t, innerEnd = -1;
    while ((t = tagRe.exec(html))) {
      if (t[0].endsWith('/>')) continue;
      depth += t[1] ? -1 : 1;
      if (depth === 0) { innerEnd = t.index; break; }
    }
    if (innerEnd < 0) continue;
    out += html.slice(last, innerStart) + toHtml(EN[key]);
    last = innerEnd;
    re.lastIndex = innerEnd;
    done++;
  }
  return [out + html.slice(last), done];
}

let html = src;
let n1, n2;
[html, n1] = replaceInner(html, 'data-i18n', escText);
[html, n2] = replaceInner(html, 'data-i18n-html', v => v);

// 3. Titolo animato della hero: testo statico inglese
html = html.replace(
  '<h1 id="hero-h1-el" class="hero-title">Medicina degli<br><span class="accent">ambienti estremi</span></h1>',
  '<h1 id="hero-h1-el" class="hero-title">Medicine of<br><span class="accent">Extreme Environments</span></h1>'
);

// 4. Testa della pagina
const TITLE = 'Extreme Environment Medicine, Diving &amp; Hyperbaric · Gli Amici di Boyle';
const DESC = 'Gli Amici di Boyle: extreme environment medicine. Research, education and a professional network in diving and hyperbaric medicine, aerospace and space medicine, emergency medicine and human factors.';
const set = (re, val) => { if (!re.test(html)) throw new Error('Non trovato: ' + re); html = html.replace(re, val); };
set(/<html lang="it">/, '<html lang="en">');
set(/<title>[^<]*<\/title>/, `<title>${TITLE}</title>`);
set(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${DESC}" />`);
set(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${SITE}en.html" />`);
set(/<meta property="og:url"\s+content="[^"]*" \/>/, `<meta property="og:url"         content="${SITE}en.html" />`);
set(/<meta property="og:title"\s+content="[^"]*" \/>/, `<meta property="og:title"       content="${TITLE}" />`);
set(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${DESC}" />`);
set(/<meta property="og:locale"\s+content="it_IT" \/>/, '<meta property="og:locale"      content="en_GB" />');
set(/<meta property="og:locale:alternate" content="en_GB" \/>/, '<meta property="og:locale:alternate" content="it_IT" />');

// la pagina parte in inglese; il pulsante IT porta alla home italiana
const BOOT = `<script>try{sessionStorage.setItem('boyle_lang','en')}catch(e){}
  document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('#langToggle,#langToggleMobileIndex');if(!b)return;e.preventDefault();e.stopImmediatePropagation();try{sessionStorage.setItem('boyle_lang','it')}catch(x){}location.href='./'+location.hash;},true);</script>`;
set(/<meta charset="utf-8" \/>/, `<meta charset="utf-8" />\n  <!-- FILE GENERATO da scripts/build_en.mjs: non modificarlo a mano, modifica index.html -->\n  ${BOOT}`);

writeFileSync('en.html', html);
console.log(`en.html generato: ${n1} testi + ${n2} blocchi tradotti`);
