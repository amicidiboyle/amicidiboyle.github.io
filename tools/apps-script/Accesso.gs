/*************************************************
 * ACCESSO MEMBRI E DATI RISERVATI
 * Codici d'accesso ed email dei membri non stanno piu' nei file pubblici
 * del sito: vivono nelle Proprieta' script (ACCESS_CODES, MEMBER_EMAILS,
 * PROFILE_PRIVATE) e il sito li verifica chiedendo a questo script.
 *************************************************/

const EMAIL_PLACEHOLDER = 'riservata';

function readJsonProp_(name, fallback) {
  try {
    var v = PropertiesService.getScriptProperties().getProperty(name);
    return v ? JSON.parse(v) : fallback;
  } catch (e) { return fallback; }
}
function writeJsonProp_(name, value) {
  PropertiesService.getScriptProperties().setProperty(name, JSON.stringify(value));
}

function getAccessCodes_() { return readJsonProp_('ACCESS_CODES', {}); }
function setAccessCode_(code, key) {
  code = String(code || '').trim().toUpperCase();
  if (!code) return;
  var codes = getAccessCodes_();
  codes[code] = String(key || '').trim();
  writeJsonProp_('ACCESS_CODES', codes);
}
function deleteAccessCode_(code) {
  var codes = getAccessCodes_();
  delete codes[String(code || '').trim().toUpperCase()];
  writeJsonProp_('ACCESS_CODES', codes);
}
function looksLikeCode_(s) { return /^(BOYLE|FRIEND)-/i.test(String(s || '').trim()); }

/* ---- rete-members.json: email tolte prima di scrivere, rimesse dopo aver letto ---- */
function stripMemberEmails_(items) {
  var emails = readJsonProp_('MEMBER_EMAILS', {});
  var out = (items || []).map(function (m) {
    var c = Object.assign({}, m);
    var k = slugify_(c.name || '');
    var e = String(c.email || '').trim();
    if (e && e !== EMAIL_PLACEHOLDER) emails[k] = e;
    c.email = (e || emails[k]) ? EMAIL_PLACEHOLDER : '';
    return c;
  });
  writeJsonProp_('MEMBER_EMAILS', emails);
  return out;
}
function mergeMemberEmails_(file) {
  var emails = readJsonProp_('MEMBER_EMAILS', {});
  (file.items || []).forEach(function (m) {
    var k = slugify_(m.name || '');
    if (!m.email || m.email === EMAIL_PLACEHOLDER) m.email = emails[k] || '';
  });
  return file;
}

/* ---- rete-profiles.json: email e codici tolti prima di scrivere ---- */
var PRIVATE_PROFILE_FIELDS = ['email', 'code', 'accessCode'];
function stripProfiles_(profiles) {
  var priv = readJsonProp_('PROFILE_PRIVATE', {});
  var out = {};
  Object.keys(profiles || {}).forEach(function (k) {
    var p = Object.assign({}, profiles[k]);
    PRIVATE_PROFILE_FIELDS.forEach(function (f) {
      if (p[f]) { priv[k] = priv[k] || {}; priv[k][f] = p[f]; }
      delete p[f];
    });
    out[k] = p;
  });
  writeJsonProp_('PROFILE_PRIVATE', priv);
  return out;
}
function mergeProfiles_(file) {
  var priv = readJsonProp_('PROFILE_PRIVATE', {});
  Object.keys(file.items || {}).forEach(function (k) {
    var extra = priv[k] || {};
    PRIVATE_PROFILE_FIELDS.forEach(function (f) { if (extra[f] && !file.items[k][f]) file.items[k][f] = extra[f]; });
  });
  return file;
}

/* ---- verifica del codice dal sito ---- */
function handleAccess_(data) {
  var cache = CacheService.getScriptCache();
  var fails = Number(cache.get('ACCESS_FAILS') || 0);
  if (fails > 60) return { ok: false, error: 'troppi tentativi, riprova tra un’ora' };

  var code = String(data.code || '').trim().toUpperCase();
  var codes = getAccessCodes_();
  var valid = code === 'BOYLE-FONDATORI' || Object.prototype.hasOwnProperty.call(codes, code);
  if (!valid) {
    cache.put('ACCESS_FAILS', String(fails + 1), 3600);
    return { ok: false };
  }
  var members = mergeMemberEmails_(getReteMembers_RAW_()).items || [];
  return {
    ok: true,
    key: codes[code] || '',
    friend: code.indexOf('FRIEND-') === 0,
    emails: members.filter(function (m) { return m.email; })
                   .map(function (m) { return { name: m.name, email: m.email }; })
  };
}

function codeMatchesKey_(code, key) {
  var codes = getAccessCodes_();
  var owner = codes[String(code || '').trim().toUpperCase()];
  return !!owner && slugify_(owner) === slugify_(key);
}

function getReteMembers_RAW_() { return getRepoJsonFile_(GITHUB_RETE_PATH); }
function getReteProfiles_RAW_() { return getRepoObjectFile_(GITHUB_PROFILES_PATH); }

/* ---- migrazione una tantum: eseguire una volta dall'editor ---- */
function migraAccessi() {
  var props = PropertiesService.getScriptProperties();
  // 1. codici dal vecchio file pubblico
  var codes = getAccessCodes_();
  try {
    var f = getRepoObjectFile_('boyle-access-codes.json').items || {};
    Object.keys(f.codes || {}).forEach(function (c) { codes[c.trim().toUpperCase()] = String(f.codes[c]).trim(); });
  } catch (e) { Logger.log('boyle-access-codes.json: ' + e.message); }
  // 2. codici scritti dentro rete.html (alcuni salvati al contrario: chiave e codice invertiti)
  try {
    var html = getReteHtml_().content;
    var start = html.indexOf('CODE_TO_KEY = {'), end = html.indexOf('};', start);
    var block = html.substring(start, end);
    var re = /'([^']+)'\s*:\s*'([^']+)'/g, m;
    while ((m = re.exec(block))) {
      var a = m[1].trim(), b = m[2].trim();
      if (looksLikeCode_(a)) codes[a.toUpperCase()] = codes[a.toUpperCase()] || b;
      else if (looksLikeCode_(b)) codes[b.toUpperCase()] = codes[b.toUpperCase()] || a;
    }
  } catch (e) { Logger.log('rete.html: ' + e.message); }
  // 3. codici scritti dentro eventi.html
  [['BOYLE-V666-ZERBI','silvio-zerbi'],['BOYLE-HM6Q-ZERBI','silvio-zerbi'],['BOYLE-WY8W-VINCIGUERRA','felicia-vinciguerra'],
   ['BOYLE-5ZS4-ZANON','vincenzo-zanon'],['BOYLE-ZXTB-LANCIO','pre-lancio'],['BOYLE-XSYN-TEST','last-test'],
   ['BOYLE-RDBF-49','prova-testh-9-49'],['BOYLE-4CJ2-PIPPA','pippo-pippa'],['BOYLE-ADMIN-2026','admin']
  ].forEach(function (p) { if (!codes[p[0]]) codes[p[0]] = p[1]; });
  writeJsonProp_('ACCESS_CODES', codes);

  // 4. email e dati privati: letti dai file attuali, poi i file vengono riscritti senza
  var rete = getReteMembers_RAW_();
  saveRepoFile_(GITHUB_RETE_PATH, stripMemberEmails_(rete.items || []), rete.sha, 'Rete: email dei membri spostate in area riservata');
  var prof = getReteProfiles_RAW_();
  saveRepoFile_(GITHUB_PROFILES_PATH, stripProfiles_(prof.items || {}), prof.sha, 'Rete: dati privati dei profili spostati in area riservata');

  var out = { codici: Object.keys(codes).length,
              email: Object.keys(readJsonProp_('MEMBER_EMAILS', {})).length,
              profiliPrivati: Object.keys(readJsonProp_('PROFILE_PRIVATE', {})).length };
  Logger.log(JSON.stringify(out));
  return out;
}

/* ---- ripristino: rimette email e dati privati nei file pubblici come prima ---- */
function ripristinaFilePubblici() {
  var rete = getReteMembers_RAW_();
  saveRepoFile_(GITHUB_RETE_PATH, mergeMemberEmails_(rete).items, rete.sha, 'Rete: ripristino email nei file pubblici');
  var prof = getReteProfiles_RAW_();
  saveRepoFile_(GITHUB_PROFILES_PATH, mergeProfiles_(prof).items, prof.sha, 'Rete: ripristino dati profili nei file pubblici');
}
