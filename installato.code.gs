/*************************************************
 * CONFIG
 *************************************************/
const SHEET_ID_PROP       = 'SHEET_ID';
const ADMIN_PASSWORD_PROP = 'ADMIN_PASSWORD';
const GITHUB_TOKEN_PROP   = 'GITHUB_TOKEN';

const SHEET_NAME = 'ADMIN_DATA';
const TRASH_NAME = 'CESTINO_ADMIN';

const GITHUB_REPO          = 'amicidiboyle/amicidiboyle.github.io';
const GITHUB_RETE_PATH     = 'rete-members.json';
const GITHUB_PROFILES_PATH = 'rete-profiles.json';
const GITHUB_RETE_HTML     = 'rete.html';

const REQUIRED_HEADERS = [
  'ID_BOYLE',
  'TIPO',
  'NOME',
  'EMAIL',
  'STATO_BOYLE',
  'CODICE_BOYLE',
  'NOTE_ADMIN',
  'DATA_GESTIONE'
];

/*************************************************
 * LOCK
 *************************************************/
function withLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

/*************************************************
 * SCRIPT PROPERTIES
 *************************************************/
function getSheetId_() {
  const id = PropertiesService.getScriptProperties().getProperty(SHEET_ID_PROP);
  if (!id) throw new Error('SHEET_ID non configurato nelle Script Properties');
  return String(id).trim();
}

function getAdminPassword_() {
  const pass = PropertiesService.getScriptProperties().getProperty(ADMIN_PASSWORD_PROP);
  if (!pass) throw new Error('ADMIN_PASSWORD non configurata nelle Script Properties');
  return String(pass).trim();
}

function getGithubToken_() {
  const token = PropertiesService.getScriptProperties().getProperty(GITHUB_TOKEN_PROP);
  if (!token) throw new Error('GITHUB_TOKEN non configurato nelle Script Properties');
  return String(token).trim();
}

/*************************************************
 * GENERIC HELPERS
 *************************************************/
function slugify_(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function valueFromObject_(obj, keys) {
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    if (obj[k] !== undefined && obj[k] !== null && String(obj[k]).trim() !== '') {
      return String(obj[k]).trim();
    }
  }
  return '';
}

function getNowString_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

function ensureOptionalHeader_(sheet, headerName) {
  const lastCol = Math.max(sheet.getLastColumn(), REQUIRED_HEADERS.length);
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) {
    return String(h || '').trim();
  });
  var idx = headers.indexOf(headerName);
  if (idx !== -1) return idx + 1;
  const newCol = lastCol + 1;
  sheet.getRange(1, newCol).setValue(headerName);
  return newCol;
}

function extractSurnameToken_(name) {
  const parts = slugify_(name).split('-').filter(Boolean);
  if (!parts.length) return 'MEMBER';
  return String(parts[parts.length - 1] || 'MEMBER').toUpperCase();
}

function getExistingCodesSet_() {
  const sheet = getSheet_();
  const meta = getHeaderMap_(sheet);
  const codeCol = meta.map['CODICE_BOYLE'];
  const codes = {};
  if (!codeCol || sheet.getLastRow() < 2) return codes;
  const values = sheet.getRange(2, codeCol, sheet.getLastRow() - 1, 1).getDisplayValues().flat();
  values.forEach(function(v) {
    const clean = String(v || '').trim().toUpperCase();
    if (clean) codes[clean] = true;
  });
  return codes;
}

function generateAccessCode_(tipo, name) {
  const prefix = String(tipo || '').toLowerCase().indexOf('amico') !== -1 ? 'FRIEND' : 'BOYLE';
  const surname = extractSurnameToken_(name);
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const existing = getExistingCodesSet_();

  for (var attempt = 0; attempt < 500; attempt++) {
    var core = '';
    for (var i = 0; i < 4; i++) {
      core += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    var candidate = prefix + '-' + core + '-' + surname;
    if (!existing[candidate]) return candidate;
  }
  throw new Error('Impossibile generare un codice univoco');
}

/*************************************************
 * SHEET HELPERS
 *************************************************/
function getSpreadsheet_() {
  return SpreadsheetApp.openById(getSheetId_());
}

function getSheet_() {
  const ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  ensureHeaders_(sheet);
  return sheet;
}

function getTrashSheet_() {
  const ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(TRASH_NAME);
  if (!sheet) sheet = ss.insertSheet(TRASH_NAME);
  ensureHeaders_(sheet);
  return sheet;
}

function ensureHeaders_(sheet) {
  const requiredLen = REQUIRED_HEADERS.length;
  const currentLen = Math.max(sheet.getLastColumn(), requiredLen);
  const values = sheet.getRange(1, 1, 1, currentLen).getValues()[0];
  const headers = values.slice();
  var changed = false;

  REQUIRED_HEADERS.forEach(function(h, i) {
    const current = String(headers[i] || '').trim();
    if (current !== h) {
      headers[i] = h;
      changed = true;
    }
  });

  if (changed) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
}

function getHeaderMap_(sheet) {
  const minCols = Math.max(sheet.getLastColumn(), REQUIRED_HEADERS.length);
  if (sheet.getLastColumn() === 0) {
    sheet.getRange(1, 1, 1, REQUIRED_HEADERS.length).setValues([REQUIRED_HEADERS]);
  }

  const headers = sheet
    .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), REQUIRED_HEADERS.length))
    .getValues()[0]
    .map(function(h) { return String(h || '').trim(); });

  const map = {};
  headers.forEach(function(h, i) {
    if (h) map[h] = i + 1;
  });

  return { headers: headers, map: map };
}

function rowToObject_(headers, row, rowIndex) {
  const obj = {};
  headers.forEach(function(h, colIndex) {
    obj[h] = row[colIndex];
  });
  obj._rowIndex = rowIndex;
  return obj;
}

/*************************************************
 * DATA
 *************************************************/
function getAdminData() {
  return withLock_(function() {
    const sheet = getSheet_();
    const headers = getHeaderMap_(sheet).headers;
    const lastRow = sheet.getLastRow();

    if (lastRow < 2) {
      return { rows: [], stats: getStatsObject_([]) };
    }

    const values = sheet.getRange(2, 1, lastRow - 1, headers.length).getDisplayValues();
    const rows = values.map(function(row, i) {
      return rowToObject_(headers, row, i + 2);
    });

    return { rows: rows, stats: getStatsObject_(rows) };
  });
}

function getTrashData() {
  return withLock_(function() {
    const sheet = getTrashSheet_();
    const headers = getHeaderMap_(sheet).headers;
    const lastRow = sheet.getLastRow();

    if (lastRow < 2) return { rows: [] };

    const values = sheet.getRange(2, 1, lastRow - 1, headers.length).getDisplayValues();
    const rows = values.map(function(row, i) {
      return rowToObject_(headers, row, i + 2);
    });

    return { rows: rows };
  });
}

function getStatsObject_(rows) {
  const stats = {
    totale: rows.length,
    rete: 0,
    amici: 0,
    nuovo: 0,
    in_attesa: 0,
    accettato_rete: 0,
    passato_amici: 0,
    archiviato: 0,
    rifiutato: 0
  };

  rows.forEach(function(r) {
    const tipo = String(r.TIPO || '').toUpperCase().trim();
    const stato = String(r.STATO_BOYLE || '').toUpperCase().trim();

    if (tipo.indexOf('RETE') !== -1) stats.rete++;
    if (tipo.indexOf('AMICO') !== -1) stats.amici++;

    if (!stato || stato === 'NUOVO') stats.nuovo++;
    else if (stato === 'IN_ATTESA') stats.in_attesa++;
    else if (stato === 'RETE') stats.accettato_rete++;
    else if (stato === 'AMICO') stats.passato_amici++;
    else if (stato === 'ARCHIVIATO') stats.archiviato++;
    else if (stato === 'RIFIUTATO') stats.rifiutato++;
  });

  return stats;
}

/*************************************************
 * UPDATE / DELETE
 *************************************************/
function updateAdminRow(payload) {
  return withLock_(function() {
    const data = payload || {};
    const rowIndex = Number(data.rowIndex);
    const stato = data.stato;
    const codice = data.codice;
    const note = data.note;

    const sheet = getSheet_();
    const map = getHeaderMap_(sheet).map;

    const statoCol  = map['STATO_BOYLE'];
    const codiceCol = map['CODICE_BOYLE'];
    const dataCol   = map['DATA_GESTIONE'];
    const noteCol   = map['NOTE_ADMIN'];

    [statoCol, codiceCol, dataCol, noteCol].forEach(function(v) {
      if (v === undefined) throw new Error('Colonne richieste mancanti');
    });

    if (!Number.isInteger(rowIndex) || rowIndex < 2 || rowIndex > sheet.getLastRow()) {
      throw new Error('Indice riga non valido');
    }

    const rowValues = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];

    const nomeCol = map['NOME'];
    var nomeCandidato = nomeCol ? String(rowValues[nomeCol - 1] || '').trim() : '';
    var statoUp = String(stato || '').toUpperCase();

    if (stato !== undefined && stato !== null && stato !== '') rowValues[statoCol - 1] = stato;
    if (note !== undefined) rowValues[noteCol - 1] = note;
    rowValues[dataCol - 1] = getNowString_();

    // Genera codice se stiamo accettando come RETE o AMICO e non c'è già
    var finalCodice = String(codice !== undefined ? codice : rowValues[codiceCol - 1] || '').trim();
    if (!finalCodice && (statoUp === 'RETE' || statoUp === 'AMICO') && nomeCandidato) {
      try {
        finalCodice = generateAccessCode_(statoUp, nomeCandidato);
        Logger.log('updateAdminRow: generated ' + finalCodice);
      } catch(e) { Logger.log('generateAccessCode_ error: ' + e.message); }
    }

    if (finalCodice) rowValues[codiceCol - 1] = finalCodice;
    sheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);

    // Scrivi il codice in CODE_TO_KEY di rete.html E in boyle-access-codes.json
    var codeAdded = false;
    if (finalCodice && (statoUp === 'RETE' || statoUp === 'AMICO') && nomeCandidato) {
      var memberKey = slugify_(nomeCandidato);
      try {
        addCodeToKey_(finalCodice, memberKey);
        codeAdded = true;
        Logger.log('updateAdminRow: code added to CODE_TO_KEY: ' + finalCodice);
      } catch(e) { Logger.log('addCodeToKey_ error: ' + e.message); }
      try {
        saveAccessCode_(finalCodice, memberKey);
        Logger.log('updateAdminRow: code saved to boyle-access-codes.json: ' + finalCodice);
      } catch(e) { Logger.log('saveAccessCode_ error: ' + e.message); }
    }

    return { ok: true, rowIndex: rowIndex, codice: finalCodice, codeAdded: codeAdded };
  });
}

function deleteAdminRow(rowIndex) {
  return withLock_(function() {
    const sheet = getSheet_();
    const trash = getTrashSheet_();
    const headers = getHeaderMap_(sheet).headers;

    const idx = Number(rowIndex);
    if (!Number.isInteger(idx) || idx < 2 || idx > sheet.getLastRow()) {
      throw new Error('Indice riga non valido');
    }

    const row = sheet.getRange(idx, 1, 1, headers.length).getValues()[0];
    trash.appendRow(row);
    sheet.deleteRow(idx);

    return { ok: true, rowIndex: idx };
  });
}

function deleteFilteredRows(indexes) {
  return withLock_(function() {
    const sheet = getSheet_();
    const trash = getTrashSheet_();
    const headers = getHeaderMap_(sheet).headers;

    const cleanIndexes = Array.from(new Set((indexes || []).map(function(x){ return Number(x); }).filter(function(x){
      return Number.isInteger(x) && x >= 2;
    }))).sort(function(a,b){ return b-a; });

    var count = 0;
    cleanIndexes.forEach(function(idx) {
      if (idx <= sheet.getLastRow()) {
        const row = sheet.getRange(idx, 1, 1, headers.length).getValues()[0];
        trash.appendRow(row);
        sheet.deleteRow(idx);
        count++;
      }
    });

    return { ok: true, count: count };
  });
}

function restoreFromTrash(indexes) {
  return withLock_(function() {
    const sheet = getSheet_();
    const trash = getTrashSheet_();
    const headers = getHeaderMap_(trash).headers;

    const cleanIndexes = Array.from(new Set((indexes || []).map(function(x){ return Number(x); }).filter(function(x){
      return Number.isInteger(x) && x >= 2;
    }))).sort(function(a,b){ return b-a; });

    var count = 0;
    cleanIndexes.forEach(function(idx) {
      if (idx <= trash.getLastRow()) {
        const row = trash.getRange(idx, 1, 1, headers.length).getValues()[0];
        sheet.appendRow(row);
        trash.deleteRow(idx);
        count++;
      }
    });

    return { ok: true, count: count };
  });
}

function deleteFromTrash(indexes) {
  return withLock_(function() {
    const trash = getTrashSheet_();
    const cleanIndexes = Array.from(new Set((indexes || []).map(function(x){ return Number(x); }).filter(function(x){
      return Number.isInteger(x) && x >= 2;
    }))).sort(function(a,b){ return b-a; });

    var count = 0;
    cleanIndexes.forEach(function(idx) {
      if (idx <= trash.getLastRow()) {
        trash.deleteRow(idx);
        count++;
      }
    });

    return { ok: true, count: count };
  });
}

function deleteEmptyRows() {
  return withLock_(function() {
    const sheet = getSheet_();
    const headers = getHeaderMap_(sheet).headers;
    const lastRow = sheet.getLastRow();

    if (lastRow < 2) return { ok: true, count: 0 };

    var count = 0;
    for (var i = lastRow; i >= 2; i--) {
      const row = sheet.getRange(i, 1, 1, headers.length).getValues()[0];
      const empty = row.every(function(v) { return String(v || '').trim() === ''; });
      if (empty) {
        sheet.deleteRow(i);
        count++;
      }
    }

    return { ok: true, count: count };
  });
}

function emptyTrash() {
  return withLock_(function() {
    const trash = getTrashSheet_();
    const lastRow = trash.getLastRow();
    if (lastRow > 1) trash.deleteRows(2, lastRow - 1);
    return { ok: true };
  });
}

/*************************************************
 * EXPORT JSON
 *************************************************/
function exportAdminJson() {
  const data = getAdminData();
  return JSON.stringify(data.rows || [], null, 2);
}

/*************************************************
 * LOGIN
 *************************************************/
function checkAdminPassword(pass) {
  return String(pass || '').trim() === String(getAdminPassword_() || '').trim();
}

/*************************************************
 * GITHUB
 *************************************************/
function githubRequest_(method, url, payloadObj) {
  const token = getGithubToken_();
  const options = {
    method: method,
    muteHttpExceptions: true,
    headers: {
      Authorization: 'token ' + token,
      Accept: 'application/vnd.github+json'
    }
  };

  if (payloadObj) {
    options.contentType = 'application/json';
    options.payload = JSON.stringify(payloadObj);
  }

  const resp = UrlFetchApp.fetch(url, options);
  const code = resp.getResponseCode();
  const body = resp.getContentText();

  if (code < 200 || code >= 300) {
    throw new Error('GitHub API error ' + code + ': ' + body);
  }

  return JSON.parse(body);
}

function getRepoJsonFile_(path) {
  const url = 'https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + path;
  const data = githubRequest_('get', url);
  const content = Utilities.newBlob(Utilities.base64Decode(data.content)).getDataAsString('utf-8');
  return { items: JSON.parse(content || '[]'), sha: data.sha };
}

function getRepoObjectFile_(path) {
  const url = 'https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + path;
  const data = githubRequest_('get', url);
  const content = Utilities.newBlob(Utilities.base64Decode(data.content)).getDataAsString('utf-8');
  return { items: JSON.parse(content || '{}'), sha: data.sha };
}

/*************************************************
 * rete.html — lettura e aggiornamento CODE_TO_KEY
 *************************************************/
function getReteHtml_() {
  var url = 'https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + GITHUB_RETE_HTML;
  var resp = githubRequest_('get', url, null);
  var content = Utilities.newBlob(Utilities.base64Decode(resp.content)).getDataAsString();
  return { content: content, sha: resp.sha };
}

function saveReteHtml_(content, sha, message) {
  var url = 'https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + GITHUB_RETE_HTML;
  var contentB64 = Utilities.base64Encode(content, Utilities.Charset.UTF_8);
  return githubRequest_('put', url, {
    message: message || 'Update rete.html CODE_TO_KEY via Admin',
    content: contentB64,
    sha: sha
  });
}

function saveAccessCode_(codice, memberKey) {
  var url = 'https://api.github.com/repos/' + GITHUB_REPO + '/contents/boyle-access-codes.json';
  var sha = null;
  var existing = { codes: {}, updated: '' };
  try {
    var resp = githubRequest_('get', url, null);
    sha = resp.sha;
    existing = JSON.parse(Utilities.newBlob(Utilities.base64Decode(resp.content)).getDataAsString());
    if (!existing.codes) existing.codes = {};
  } catch(e) { /* file non esiste ancora */ }
  existing.codes[String(codice).trim().toUpperCase()] = String(memberKey).trim();
  existing.updated = getNowString_();
  var content = Utilities.base64Encode(JSON.stringify(existing, null, 2), Utilities.Charset.UTF_8);
  var payload = { message: 'Add access code ' + codice, content: content };
  if (sha) payload.sha = sha;
  githubRequest_('put', url, payload);
}


function addCodeToKey_(memberKey, memberCode) {
  // Adds a new entry to CODE_TO_KEY in rete.html
  // memberKey: 'alessandro-balzani', memberCode: 'BOYLE-ZPK5-BALZANI'
  try {
    var file = getReteHtml_();
    var html = file.content;

    // Check if already present
    if (html.indexOf("'" + memberCode + "'") !== -1) {
      Logger.log('Code already in CODE_TO_KEY: ' + memberCode);
      return true;
    }

    // Find the closing }; of CODE_TO_KEY block
    var dictStart = html.indexOf('CODE_TO_KEY = {');
    if (dictStart === -1) throw new Error('CODE_TO_KEY not found in rete.html');

    var dictEnd = html.indexOf('};', dictStart);
    if (dictEnd === -1) throw new Error('CODE_TO_KEY closing }; not found');

    // Build the new entry line (aligned style)
    var entry = "    '" + memberCode + "': '" + memberKey + "',\n  ";

    // Insert before the closing };
    var newHtml = html.substring(0, dictEnd) + entry + html.substring(dictEnd);

    saveReteHtml_(newHtml, file.sha, 'Add ' + memberCode + ' to CODE_TO_KEY');
    Logger.log('Added to CODE_TO_KEY: ' + memberCode + ' -> ' + memberKey);
    return true;
  } catch(e) {
    Logger.log('addCodeToKey_ error: ' + e.message);
    throw e;
  }
}


function saveRepoFile_(path, value, sha, message) {
  const url = 'https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + path;
  const json = JSON.stringify(value, null, 2);
  const contentB64 = Utilities.base64Encode(json, Utilities.Charset.UTF_8);
  return githubRequest_('put', url, {
    message: message || ('Update ' + path + ' via Admin'),
    content: contentB64,
    sha: sha
  });
}

function getReteMembers_() {
  return getRepoJsonFile_(GITHUB_RETE_PATH);
}

function saveReteMembers_(items, sha) {
  return saveRepoFile_(GITHUB_RETE_PATH, items, sha, 'Update rete-members via Admin');
}

function getReteProfiles_() {
  return getRepoObjectFile_(GITHUB_PROFILES_PATH);
}

function saveReteProfiles_(items, sha) {
  return saveRepoFile_(GITHUB_PROFILES_PATH, items, sha, 'Update rete-profiles via Admin');
}

/*************************************************
 * PUBLISHED MEMBERS
 *************************************************/

function getPublishedMembers() {
  return withLock_(function() {
    const rete = getReteMembers_();
    const profiles = getReteProfiles_().items || {};
    const items = Array.isArray(rete.items) ? rete.items : [];

    return items.map(function(item) {
      const key = slugify_(item.name || '');
      const prof = profiles[key] || {};
      const sheetInfo = findMemberSheetInfo_(item.name || '', item.email || '') || {};

      const profileStatus =
        (prof.bio || prof.researchgate || prof.scholar || prof.orcid || prof.website || prof.courses || prof.twitter || prof.instagram)
          ? ((prof.bio && (prof.linkedin || prof.website || prof.courses || prof.researchgate || prof.scholar || prof.orcid)) ? 'complete' : 'partial')
          : 'base';

      return {
        nome: item.name || '',
        ruolo: item.role || '',
        foto: item.img || '',
        citta: item.city || '',
        linkedin: item.linkedin || '',
        email: item.email || '',
        tags: Array.isArray(item.tags) ? item.tags : [],
        key: key,
        codice: sheetInfo.codice || '',
        stato: sheetInfo.stato || '',
        tipo: sheetInfo.tipo || '',
        bio: prof.bio || '',
        website: prof.website || '',
        profileStatus: profileStatus
      };
    });
  });
}

function updatePublishedMember(payload) {
  return withLock_(function() {
    payload = payload || {};
    const oldEmail = String(payload.oldEmail || '').trim().toLowerCase();
    const oldKey = String(payload.oldKey || '').trim();
    const name = String(payload.nome || '').trim();
    const role = String(payload.ruolo || '').trim();
    const city = String(payload.citta || '').trim();
    const email = String(payload.email || '').trim();
    const linkedin = String(payload.linkedin || '').trim();
    const foto = String(payload.foto || '').trim();
    const bio = String(payload.bio || '').trim();
    const tags = Array.isArray(payload.tags) ? payload.tags : String(payload.tags || '').split(',').map(function(t) { return String(t).trim(); }).filter(Boolean);

    if (!name || !email) throw new Error('Per aggiornare servono almeno nome ed email');

    const rete = getReteMembers_();
    const items = Array.isArray(rete.items) ? rete.items : [];
    const idx = items.findIndex(function(m) {
      const mEmail = String(m.email || '').trim().toLowerCase();
      const mKey = slugify_(m.name || '');
      return (oldEmail && mEmail === oldEmail) || (oldKey && mKey === oldKey);
    });

    if (idx === -1) throw new Error('Scheda pubblicata non trovata');

    const member = {
      name: name,
      role: role,
      img: foto || (slugify_(name) + '.jpg'),
      city: city || 'Italia',
      linkedin: linkedin,
      email: email,
      tags: tags
    };

    items[idx] = member;
    saveReteMembers_(items, rete.sha);

    try {
      const profilesFile = getReteProfiles_();
      const profiles = profilesFile.items || {};
      const newKey = slugify_(name);
      const prevProfile = profiles[oldKey] || profiles[newKey] || {};
      const mergedProfile = {
        name: name,
        bio: bio || prevProfile.bio || '',
        linkedin: linkedin || prevProfile.linkedin || '',
        researchgate: prevProfile.researchgate || '',
        scholar: prevProfile.scholar || '',
        orcid: prevProfile.orcid || '',
        twitter: prevProfile.twitter || '',
        instagram: prevProfile.instagram || '',
        website: prevProfile.website || '',
        courses: prevProfile.courses || '',
        speaker: !!prevProfile.speaker,
        podcast: !!prevProfile.podcast,
        research: !!prevProfile.research,
        updated: getNowString_()
      };

      if (oldKey && oldKey !== newKey) delete profiles[oldKey];
      profiles[newKey] = mergedProfile;
      saveReteProfiles_(profiles, profilesFile.sha);
    } catch (profileErr) {
      Logger.log('Errore update rete-profiles: ' + profileErr.message);
    }

    return { ok: true, member: member, key: slugify_(name) };
  });
}

/*************************************************
 * PUBLISH CANDIDATE
 *************************************************/



function publishCandidate(rowIndex, overrides) {
  return withLock_(function() {
    const sheet = getSheet_();
    const meta = getHeaderMap_(sheet);
    const headers = meta.headers;
    const map = meta.map;

    const idx = Number(rowIndex);
    if (!Number.isInteger(idx) || idx < 2 || idx > sheet.getLastRow()) {
      throw new Error('Indice riga non valido');
    }

    const row = sheet.getRange(idx, 1, 1, headers.length).getValues()[0];
    const obj = {};
    headers.forEach(function(h, i) { obj[h] = row[i]; });

    // Dichiara colonne subito — servono per leggere le note nel blocco override
    var codiceCol = map['CODICE_BOYLE'];
    var statoCol  = map['STATO_BOYLE'];
    var noteCol   = map['NOTE_ADMIN'];
    var dataCol   = map['DATA_GESTIONE'];

    if (!codiceCol || !statoCol || !noteCol || !dataCol) {
      throw new Error('Mancano colonne obbligatorie nel foglio');
    }

    const name  = valueFromObject_(obj, ['NOME', 'NAME', 'Nome']);
    const email = valueFromObject_(obj, ['EMAIL', 'Email', 'MAIL']);
    const tipoOriginale = valueFromObject_(obj, ['TIPO']);
    const fotoUrl  = valueFromObject_(obj, ['FOTO', 'IMG', 'foto', 'img']);
    const bio      = valueFromObject_(obj, ['BIO', 'bio']);

    // Leggi dati base dal foglio
    var _citySheet   = valueFromObject_(obj, ['CITTA', 'CITTÀ', 'CITY', 'citta', 'city']) || '';
    var _ruoloSheet  = valueFromObject_(obj, ['RUOLO', 'ROLE', 'ruolo', 'role']) || '';
    var _focusSheet  = valueFromObject_(obj, ['FOCUS', 'INTERESSE', 'INTEREST', 'focus']) || '';
    var _liSheet     = valueFromObject_(obj, ['LINKEDIN', 'linkedin']) || '';

    // Fallback: leggi dalle NOTE_ADMIN se le colonne sono vuote
    var noteText = String(row[noteCol - 1] || '');
    function getNoteField(label) {
      var m = noteText.match(new RegExp(label + ':\\s*(.+?)(?:\\n|$)', 'i'));
      return m ? m[1].trim() : '';
    }
    if (!_ruoloSheet)  _ruoloSheet  = getNoteField('Ruolo');
    if (!_citySheet)   _citySheet   = getNoteField('Citt[àa]') || getNoteField('Citta');
    if (!_focusSheet)  _focusSheet  = getNoteField('Focus');
    if (!_liSheet)     _liSheet     = getNoteField('LinkedIn') || getNoteField('Linkedin');

    // Overrides dalla preview (priorità massima — sono i dati modificati dall'admin)
    var ov = (overrides && typeof overrides === 'object') ? overrides : {};
    var city    = (ov.citta    && String(ov.citta).trim())    ? String(ov.citta).trim()    : _citySheet;
    var ruolo   = (ov.ruolo    && String(ov.ruolo).trim())    ? String(ov.ruolo).trim()    : _ruoloSheet;
    var focus   = _focusSheet;  // focus viene dal foglio, non dall'override (è già incluso nel ruolo)
    var linkedin = (ov.linkedin && String(ov.linkedin).trim()) ? String(ov.linkedin).trim() : _liSheet;

    if (!name || !email) {
      throw new Error('Per pubblicare servono almeno NOME ed EMAIL');
    }

    // codiceCol/statoCol/noteCol/dataCol già dichiarate sopra

    var statoAttuale = String(row[statoCol - 1] || '').trim().toUpperCase();
    var statoFinale = (statoAttuale === 'AMICO' || statoAttuale === 'RETE')
      ? statoAttuale
      : (String(tipoOriginale || '').toLowerCase().indexOf('amico') !== -1 ? 'AMICO' : 'RETE');

    var codice = String(row[codiceCol - 1] || '').trim();
    if (!codice) {
      codice = generateAccessCode_(statoFinale, name);
      row[codiceCol - 1] = codice;
    }

    row[statoCol - 1] = statoFinale;
    row[dataCol - 1] = getNowString_();

    var note = String(row[noteCol - 1] || '').trim();
    const stamp = statoFinale === 'AMICO' ? 'Codice AMICO assegnato' : 'Pubblicato su rete-members.json';
    if (note.indexOf(stamp) === -1) {
      row[noteCol - 1] = note ? (note + ' | ' + stamp) : stamp;
    }

    sheet.getRange(idx, 1, 1, row.length).setValues([row]);

    var img = '';
    if (fotoUrl) {
      try {
        img = String(fotoUrl).split('/').pop().split('?')[0].split('#')[0].trim();
      } catch (e) {
        img = '';
      }
    }
    if (!img) img = slugify_(name) + '.jpg';

    // roleText: se ov.ruolo è già il testo completo della card (include Focus), usalo direttamente
    // Se invece ruolo viene dal foglio (campo RUOLO separato, senza Focus), aggiungi focus
    var roleText = ruolo || '';
    if (focus && roleText && roleText.toLowerCase().indexOf('focus') === -1) {
      roleText = roleText + '. Focus: ' + focus;
    } else if (focus && !roleText) {
      roleText = 'Focus: ' + focus;
    }

    // Tags: se l'admin li ha impostati nella preview usali (split per virgola se unica stringa)
    // altrimenti ricava dal focus dividendo per virgola
    var tags = [];
    if (ov.tags && Array.isArray(ov.tags) && ov.tags.length > 0) {
      // Ogni elemento dell'array va splittato per virgola (il campo pTags può essere una stringa)
      ov.tags.forEach(function(t) {
        String(t).split(',').forEach(function(piece) {
          var p = piece.trim();
          if (p && p.length < 30) tags.push(p); // ignora tag troppo lunghi
        });
      });
    }
    if (tags.length === 0 && focus) {
      // Nessun tag dall'admin: ricava dal focus (splitti per virgola, max 3 tag)
      focus.split(',').slice(0, 3).forEach(function(t) {
        var p = t.trim();
        if (p && p.length < 30) tags.push(p);
      });
    }

    const member = {
      name: name,
      role: roleText,
      img: img,
      city: city || 'Italia',
      linkedin: linkedin || '',
      email: email,
      tags: tags.filter(Boolean)
    };

    const key = slugify_(name);

    // profilo esteso sempre pronto, anche se non pubblico subito la card
    try {
      const profFile = getReteProfiles_();
      const profiles = profFile.items || {};
      const existing = profiles[key] || {};
      profiles[key] = {
        name: name,
        bio: bio || existing.bio || '',
        linkedin: linkedin || existing.linkedin || '',
        researchgate: existing.researchgate || '',
        scholar: existing.scholar || '',
        orcid: existing.orcid || '',
        twitter: existing.twitter || '',
        instagram: existing.instagram || '',
        website: existing.website || '',
        courses: existing.courses || '',
        speaker: !!existing.speaker,
        podcast: !!existing.podcast,
        research: !!existing.research,
        updated: getNowString_()
      };
      saveReteProfiles_(profiles, profFile.sha);
    } catch (profileErr) {
      Logger.log('rete-profiles update failed: ' + profileErr.message);
    }

    if (statoFinale === 'AMICO') {
      // ⚠️ NON inviare mail automaticamente — l'admin la invia manualmente dopo aver verificato la card
      return { ok: true, published: false, member: member, codice: codice, key: key, tipo: 'AMICO' };
    }

    const rete = getReteMembers_();
    const items = Array.isArray(rete.items) ? rete.items : [];
    const existingIndex = items.findIndex(function(m) {
      return (m.email && String(m.email).toLowerCase() === email.toLowerCase()) ||
             (m.name && String(m.name).toLowerCase() === name.toLowerCase());
    });

    if (existingIndex >= 0) items[existingIndex] = member;
    else items.push(member);

    saveReteMembers_(items, rete.sha);

    // Aggiorna CODE_TO_KEY in rete.html con il nuovo codice
    try {
      addCodeToKey_(key, codice);
    } catch(htmlErr) {
      Logger.log('rete.html CODE_TO_KEY update failed: ' + htmlErr.message);
      // Non bloccare la pubblicazione se l'aggiornamento HTML fallisce
    }

    // ⚠️ NON inviare mail automaticamente — l'admin la invia manualmente dopo aver verificato la card

    return { ok: true, published: true, member: member, codice: codice, key: key, tipo: 'RETE' };
  });
}

/*************************************************
 * DEBUG
 *************************************************/


function debugConfigStatus() {
  const props = PropertiesService.getScriptProperties();
  const out = {
    sheetIdConfigured: !!props.getProperty(SHEET_ID_PROP),
    adminPasswordConfigured: !!props.getProperty(ADMIN_PASSWORD_PROP),
    githubTokenConfigured: !!props.getProperty(GITHUB_TOKEN_PROP)
  };
  try {
    const ss = SpreadsheetApp.openById(getSheetId_());
    out.spreadsheetName = ss.getName();
    out.adminSheetExists = !!ss.getSheetByName(SHEET_NAME);
    out.trashSheetExists = !!ss.getSheetByName(TRASH_NAME);
  } catch (e) {
    out.sheetError = e.message;
  }
  return out;
}

/*************************************************
 * FIND MEMBER SHEET INFO (chiamato da getPublishedMembers)
 *************************************************/
function findMemberSheetInfo_(name, email) {
  try {
    const sheet = getSheet_();
    const meta = getHeaderMap_(sheet);
    const headers = meta.headers;
    const map = meta.map;
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return null;

    const nomeCol   = map['NOME']         || 0;
    const emailCol  = map['EMAIL']        || 0;
    const codiceCol = map['CODICE_BOYLE'] || 0;
    const statoCol  = map['STATO_BOYLE']  || 0;
    const tipoCol   = map['TIPO']         || 0;

    const values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    const nameLower  = String(name  || '').trim().toLowerCase();
    const emailLower = String(email || '').trim().toLowerCase();

    for (var i = 0; i < values.length; i++) {
      const row = values[i];
      const rNome  = String(row[(nomeCol  || 1) - 1] || '').trim().toLowerCase();
      const rEmail = String(row[(emailCol || 1) - 1] || '').trim().toLowerCase();
      if ((nameLower  && rNome  === nameLower)  ||
          (emailLower && rEmail === emailLower)) {
        return {
          codice: codiceCol ? String(row[codiceCol - 1] || '') : '',
          stato:  statoCol  ? String(row[statoCol  - 1] || '') : '',
          tipo:   tipoCol   ? String(row[tipoCol   - 1] || '') : ''
        };
      }
    }
    return null;
  } catch(e) {
    Logger.log('findMemberSheetInfo_ error: ' + e.message);
    return null;
  }
}

/*************************************************
 * RECEIVE CANDIDATE (chiamato da doPost — rete.html)
 *************************************************/
function receiveCandidate_(data) {
  return withLock_(function() {
    const sheet = getSheet_();
    const meta  = getHeaderMap_(sheet);
    const map   = meta.map;

    // Normalizza TIPO
    var subj = String(data._subject || data.tipo || '').toLowerCase();
    // Rileva amico da: _subject/tipo field, OPPURE campo 'tipo' esplicito,
    // OPPURE presenza di 'presentazione' senza 'ruolo' (form Amici vs form Rete)
    var tipoEsplicito = String(data.tipo || data.TIPO || '').toLowerCase();
    var hasPresentazione = !!(data.presentazione || data.bio || data.background || data.motivazione);
    var hasRuolo = !!(data.ruolo || data.role);
    var isAmico = subj.indexOf('amico') !== -1 || 
                  subj.indexOf('friend') !== -1 ||
                  tipoEsplicito.indexOf('amico') !== -1 ||
                  tipoEsplicito.indexOf('friend') !== -1 ||
                  (hasPresentazione && !hasRuolo);
    var tipo  = isAmico ? 'AMICO' : 'RETE';
    var stato = isAmico ? 'NUOVO'    : 'IN_ATTESA';

    var nome  = valueFromObject_(data, ['nome', 'name', 'NOME']);
    var email = valueFromObject_(data, ['email', 'EMAIL']);

    if (!nome || !email) return { ok: false, error: 'nome o email mancanti' };

    // Evita duplicati per email
    const lastRow = sheet.getLastRow();
    if (lastRow >= 2) {
      const emailCol = map['EMAIL'];
      if (emailCol) {
        const existing = sheet.getRange(2, emailCol, lastRow - 1, 1).getDisplayValues().flat();
        for (var i = 0; i < existing.length; i++) {
          if (String(existing[i] || '').trim().toLowerCase() === email.trim().toLowerCase()) {
            return { ok: true, duplicate: true };
          }
        }
      }
    }

    // Estrai campi extra
    var ruolo       = valueFromObject_(data, ['ruolo','role']);
    var affiliazione= valueFromObject_(data, ['affiliazione','affiliation']);
    var focus       = valueFromObject_(data, ['focus']);
    var citta       = valueFromObject_(data, ['citta','city']);
    var linkedin    = valueFromObject_(data, ['linkedin']);
    var presentazione = valueFromObject_(data, ['presentazione','bio','background','motivazione']);
    var fonte       = valueFromObject_(data, ['come_ci_hai_conosciuto','source']);
    var codiceGen   = valueFromObject_(data, ['codice_generato']);

    // Costruisce NOTE_ADMIN leggibile
    var noteLines = [];
    if (ruolo)        noteLines.push('Ruolo: '        + ruolo);
    if (affiliazione) noteLines.push('Affiliazione: ' + affiliazione);
    if (focus)        noteLines.push('Focus: '        + focus);
    if (citta)        noteLines.push('Città: '        + citta);
    if (linkedin)     noteLines.push('LinkedIn: '     + linkedin);
    if (presentazione)noteLines.push('Presentazione: '+ presentazione);
    if (fonte)        noteLines.push('Fonte: '        + fonte);
    if (codiceGen)    noteLines.push('Codice: '       + codiceGen);
    noteLines.push('Source: webhook-formspree');
    var note = noteLines.join('\n');

    // Riga principale
    const row = new Array(REQUIRED_HEADERS.length).fill('');
    row[0] = getNowString_();                          // ID_BOYLE
    row[1] = tipo;                                     // TIPO
    row[2] = nome;                                     // NOME
    row[3] = email;                                    // EMAIL
    row[4] = stato;                                    // STATO_BOYLE
    row[5] = isAmico ? (codiceGen || '') : '';         // CODICE_BOYLE (pre-compilato per Amici)
    row[6] = note;                                     // NOTE_ADMIN

    // Colonna DATA_ARRIVO
    const arrivoCol = ensureOptionalHeader_(sheet, 'DATA_ARRIVO');
    const totalCols = Math.max(REQUIRED_HEADERS.length, arrivoCol);
    const fullRow   = new Array(totalCols).fill('');
    row.forEach(function(v, i) { fullRow[i] = v; });
    fullRow[arrivoCol - 1] = getNowString_();

    sheet.appendRow(fullRow);
    return { ok: true, duplicate: false };
  });
}

/*************************************************
 * BREVO — INVIO MAIL AUTOMATICO
 *************************************************/
function getBrevoApiKey_() {
  var key = PropertiesService.getScriptProperties().getProperty('BREVO_API_KEY');
  if (!key) throw new Error('BREVO_API_KEY non configurata nelle Script Properties');
  return String(key).trim();
}

function sendBrevoEmail_(toEmail, toName, subject, htmlContent) {
  try {
    var apiKey = getBrevoApiKey_();
    
    if (!apiKey) {
      Logger.log('Brevo: BREVO_API_KEY non configurata');
      return false;
    }
    if (!toEmail || !htmlContent) {
      Logger.log('Brevo: email o htmlContent mancanti. toEmail=' + toEmail + ' htmlLen=' + (htmlContent||'').length);
      return false;
    }

    Logger.log('Brevo: invio a ' + toEmail + ' | soggetto: ' + subject + ' | html size: ' + htmlContent.length + ' chars');

    var payload = {
      sender: { name: 'Gli Amici di Boyle', email: 'info@amicidiboyle.it' },
      to: [{ email: toEmail, name: toName || '' }],
      subject: subject,
      htmlContent: htmlContent,
      textContent: 'Benvenuto/a negli Amici di Boyle. Apri questa email in un client che supporta HTML per visualizzarla correttamente.'
    };

    var payloadStr = JSON.stringify(payload);
    Logger.log('Brevo: payload size ' + payloadStr.length + ' bytes');

    var resp = UrlFetchApp.fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'post',
      contentType: 'application/json',
      headers: { 'api-key': apiKey },
      payload: payloadStr,
      muteHttpExceptions: true
    });

    var respCode = resp.getResponseCode();
    var respBody = resp.getContentText();
    Logger.log('Brevo response: ' + respCode + ' | ' + respBody);

    if (respCode < 200 || respCode >= 300) {
      Logger.log('Brevo ERRORE ' + respCode + ': ' + respBody);
      return false;
    }

    Logger.log('Brevo: mail inviata con successo a ' + toEmail);
    return true;

  } catch(e) {
    Logger.log('sendBrevoEmail_ exception: ' + e.message + ' | stack: ' + e.stack);
    return false;
  }
}

/*************************************************
 * TEST BREVO — esegui manualmente da Apps Script
 * per verificare che la chiave API funzioni
 *************************************************/
function testBrevoConnection() {
  try {
    var apiKey = getBrevoApiKey_();
    Logger.log('BREVO_API_KEY configurata: ' + (apiKey ? 'SÌ (length=' + apiKey.length + ')' : 'NO'));
    
    // Test connessione — GET account info
    var resp = UrlFetchApp.fetch('https://api.brevo.com/v3/account', {
      method: 'get',
      headers: { 'api-key': apiKey },
      muteHttpExceptions: true
    });
    Logger.log('Brevo account check: ' + resp.getResponseCode() + ' | ' + resp.getContentText().substring(0, 200));
  } catch(e) {
    Logger.log('testBrevoConnection error: ' + e.message);
  }
}

function testSendMail() {
  // Invia una mail di test a te stesso
  var result = sendBrevoEmail_(
    'zerbi.silvio@gmail.com',
    'Silvio Zerbi',
    'TEST — Boyle mail system',
    '<h1>Test funzionante</h1><p>Se vedi questo, Brevo funziona correttamente.</p>'
  );
  Logger.log('testSendMail result: ' + result);
}

function testSendMailCompleta() {
  // Test con template completo — verifica che buildWelcomeEmail_ funzioni
  Logger.log('testSendMailCompleta: start');
  try {
    var html = buildWelcomeEmail_('RETE', 'Silvio Zerbi', 'BOYLE-TEST-ZERBI', null, 'IT');
    Logger.log('testSendMailCompleta: template built, size=' + html.length);
    var result = sendBrevoEmail_(
      'zerbi.silvio@gmail.com',
      'Silvio Zerbi', 
      'TEST COMPLETO — Mail Rete di Boyle',
      html
    );
    Logger.log('testSendMailCompleta: send result=' + result);
    return result;
  } catch(e) {
    Logger.log('testSendMailCompleta ERROR: ' + e.message);
    return false;
  }
}


/*************************************************
 * RIMUOVI MEMBRO PUBBLICATO da rete-members.json
 * e da CODE_TO_KEY in rete.html
 *************************************************/


function deleteFriendByCode(codice) {
  return withLock_(function() {
    var code = String(codice || '').trim().toUpperCase();
    if (!code) throw new Error('Codice mancante');

    var sheet = getSheet_();
    var meta = getHeaderMap_(sheet);
    var map = meta.map;
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return { ok: true, removed: '', count: 0 };

    var codiceCol = map['CODICE_BOYLE'] || 0;
    if (!codiceCol) throw new Error('Colonna CODICE_BOYLE non trovata');

    var removedName = '';
    for (var i = lastRow; i >= 2; i--) {
      var rowCode = String(sheet.getRange(i, codiceCol, 1, 1).getDisplayValue() || '').trim().toUpperCase();
      if (rowCode === code) {
        var nomeCol = map['NOME'] || 0;
        if (nomeCol) removedName = String(sheet.getRange(i, nomeCol, 1, 1).getDisplayValue() || '').trim();
        sheet.deleteRow(i);
        return { ok: true, removed: removedName || code, count: 1 };
      }
    }

    return { ok: true, removed: '', count: 0 };
  });
}

function removePublishedMember(email) {
  return withLock_(function() {
    if (!email) throw new Error('Email mancante');
    var emailLow = String(email).trim().toLowerCase();

    // 1. Rimuovi da rete-members.json
    var reteFile = getReteMembers_();
    var items = Array.isArray(reteFile.items) ? reteFile.items : [];
    var memberToRemove = null;
    var newItems = items.filter(function(m) {
      if (String(m.email || '').trim().toLowerCase() === emailLow) {
        memberToRemove = m;
        return false;
      }
      return true;
    });

    if (!memberToRemove) {
      throw new Error('Membro non trovato in rete-members.json: ' + email);
    }

    saveReteMembers_(newItems, reteFile.sha);
    Logger.log('removePublishedMember: rimosso ' + memberToRemove.name + ' da rete-members.json');

    // 2. Rimuovi il codice da CODE_TO_KEY in rete.html
    // Prima cerca il codice del membro nel foglio
    try {
      var sheet = getSheet_();
      var meta = getHeaderMap_(sheet);
      var emailCol = meta.map['EMAIL'];
      var codiceCol = meta.map['CODICE_BOYLE'];
      if (emailCol && codiceCol && sheet.getLastRow() >= 2) {
        var emails = sheet.getRange(2, emailCol, sheet.getLastRow()-1, 1).getDisplayValues().flat();
        for (var i = 0; i < emails.length; i++) {
          if (String(emails[i] || '').trim().toLowerCase() === emailLow) {
            var codice = String(sheet.getRange(i+2, codiceCol, 1, 1).getDisplayValue() || '').trim();
            if (codice) {
              removeCodeFromHtml_(codice);
              Logger.log('removePublishedMember: rimosso codice ' + codice + ' da rete.html');
            }
            break;
          }
        }
      }
    } catch(htmlErr) {
      Logger.log('removePublishedMember: errore rimozione da rete.html: ' + htmlErr.message);
      // Non bloccare — il JSON è già aggiornato
    }

    // 3. Rimuovi anche da rete-profiles.json
    try {
      var key = slugify_(memberToRemove.name || '');
      var profFile = getReteProfiles_();
      var profiles = profFile.items || {};
      if (profiles[key]) {
        delete profiles[key];
        saveReteProfiles_(profiles, profFile.sha);
        Logger.log('removePublishedMember: rimosso profilo ' + key);
      }
    } catch(profErr) {
      Logger.log('removePublishedMember: errore rimozione profilo: ' + profErr.message);
    }

    return { ok: true, removed: memberToRemove.name };
  });
}

function removeCodeFromHtml_(codice) {
  var file = getReteHtml_();
  var html = file.content;
  var lineStart = "    '" + codice + "':";
  var lines = html.split('\n');
  var filtered = [];
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].indexOf(lineStart) === -1) {
      filtered.push(lines[i]);
    }
  }
  if (filtered.length < lines.length) {
    saveReteHtml_(filtered.join('\n'), file.sha, 'Remove code from CODE_TO_KEY');
    Logger.log('removeCodeFromHtml_: removed ' + codice);
  }
}

function sendWelcomeMail(nome, email, codice, tipo, subjectCustom, testoHeroCustom, lang) {
  return sendWelcomeEmail_(nome, email, codice, tipo, subjectCustom, testoHeroCustom, lang);
}


function getAmiciMembers() {
  return withLock_(function() {
    var sheet = getSheet_();
    var meta = getHeaderMap_(sheet);
    var headers = meta.headers;
    var map = meta.map;
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];

    var nomeCol   = map['NOME']         || 0;
    var emailCol  = map['EMAIL']        || 0;
    var statoCol  = map['STATO_BOYLE']  || 0;
    var codiceCol = map['CODICE_BOYLE'] || 0;
    var noteCol   = map['NOTE_ADMIN']   || 0;
    var dataCol   = map['DATA_GESTIONE']|| 0;

    var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getDisplayValues();
    var amici = [];

    values.forEach(function(row) {
      var stato = String(row[statoCol - 1] || '').toUpperCase();
      if (stato !== 'AMICO') return;

      var nome  = String(row[nomeCol  - 1] || '');
      var email = String(row[emailCol - 1] || '');
      var codice= String(row[codiceCol- 1] || '');
      var note  = String(row[noteCol  - 1] || '');
      var data  = String(row[dataCol  - 1] || '');

      function getNote(label) {
        var m = note.match(new RegExp(label + ':\s*(.+?)(?:\n|$)', 'i'));
        return m ? m[1].trim() : '';
      }

      amici.push({
        nome:   nome,
        email:  email,
        codice: codice,
        stato:  stato,
        data:   data,
        ruolo:  getNote('Ruolo'),
        affil:  getNote('Affiliazione'),
        focus:  getNote('Focus'),
        citta:  getNote('Citt[àa]') || getNote('Citta'),
        linkedin: getNote('LinkedIn'),
        presentazione: getNote('Presentazione')
      });
    });

    return amici;
  });
}



function getPublishedFriends() {
  return withLock_(function() {
    var sheet = getSheet_();
    var meta = getHeaderMap_(sheet);
    var headers = meta.headers;
    var map = meta.map;
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];

    var nomeCol   = map['NOME']         || 0;
    var emailCol  = map['EMAIL']        || 0;
    var statoCol  = map['STATO_BOYLE']  || 0;
    var codiceCol = map['CODICE_BOYLE'] || 0;
    var noteCol   = map['NOTE_ADMIN']   || 0;
    var dataCol   = map['DATA_GESTIONE']|| 0;
    var tipoCol   = map['TIPO']         || 0;

    if (!nomeCol || !emailCol || !codiceCol) return [];

    var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getDisplayValues();
    var amici = [];

    values.forEach(function(row) {
      var nome   = String(row[nomeCol - 1] || '').trim();
      var email  = String(row[emailCol - 1] || '').trim();
      var stato  = statoCol ? String(row[statoCol - 1] || '').trim().toUpperCase() : '';
      var codice = String(row[codiceCol - 1] || '').trim().toUpperCase();
      var note   = noteCol ? String(row[noteCol - 1] || '') : '';
      var data   = dataCol ? String(row[dataCol - 1] || '') : '';
      var tipo   = tipoCol ? String(row[tipoCol - 1] || '').trim().toUpperCase() : '';

      if (!codice || codice.indexOf('FRIEND-') !== 0) return;

      function getNote(label) {
        var m = note.match(new RegExp(label + ':\\s*(.+?)(?:\\n|$)', 'i'));
        return m ? m[1].trim() : '';
      }

      amici.push({
        nome: nome,
        email: email,
        codice: codice,
        stato: stato || 'ARCHIVIATO',
        tipo: tipo || 'AMICO',
        data: data || '',
        ruolo: getNote('Ruolo') || 'Amico di Boyle',
        affil: getNote('Affiliazione') || '',
        focus: getNote('Focus') || '',
        citta: getNote('Citt[àa]') || getNote('Citta') || '',
        linkedin: getNote('LinkedIn') || '',
        presentazione: getNote('Presentazione') || '',
        key: slugify_(nome)
      });
    });

    amici.sort(function(a, b) {
      return String(b.data || '').localeCompare(String(a.data || ''));
    });

    return amici;
  });
}

function getMailingList() {
  return withLock_(function() {
    var emailSeen = {};
    var rete = [], amici = [];

    function addUnique(bucket, nome, email, stato) {
      var cleanEmail = String(email || '').trim();
      if (!cleanEmail) return;
      var key = cleanEmail.toLowerCase();
      if (emailSeen[key]) return;
      emailSeen[key] = true;
      bucket.push({ nome: String(nome || '').trim(), email: cleanEmail, stato: String(stato || '').trim() });
    }

    // 1. Rete pubblicata dal JSON
    try {
      var reteFile = getReteMembers_();
      var members = Array.isArray(reteFile.items) ? reteFile.items : [];
      members.forEach(function(m) {
        addUnique(rete, m.name || '', m.email || '', 'RETE');
      });
    } catch(e) { Logger.log('getMailingList rete-members error: ' + e.message); }

    // 2. Foglio admin: include anche archiviati, classificando dal codice
    try {
      var sheet = getSheet_();
      var meta = getHeaderMap_(sheet);
      var map = meta.map;
      var lastRow = sheet.getLastRow();
      if (lastRow >= 2) {
        var nomeCol   = map['NOME']         || 0;
        var emailCol  = map['EMAIL']        || 0;
        var statoCol  = map['STATO_BOYLE']  || 0;
        var codiceCol = map['CODICE_BOYLE'] || 0;
        var cols = Math.max(nomeCol, emailCol, statoCol, codiceCol);
        var values = sheet.getRange(2, 1, lastRow - 1, cols).getDisplayValues();

        values.forEach(function(row) {
          var nome   = nomeCol ? String(row[nomeCol - 1] || '').trim() : '';
          var email  = emailCol ? String(row[emailCol - 1] || '').trim() : '';
          var stato  = statoCol ? String(row[statoCol - 1] || '').trim().toUpperCase() : '';
          var codice = codiceCol ? String(row[codiceCol - 1] || '').trim().toUpperCase() : '';
          if (!email) return;

          if (codice.indexOf('FRIEND-') === 0 || stato === 'AMICO') {
            addUnique(amici, nome, email, stato || 'AMICO');
          } else if (codice.indexOf('BOYLE-') === 0 || stato === 'RETE' || stato === 'ARCHIVIATO') {
            addUnique(rete, nome, email, stato || 'RETE');
          }
        });
      }
    } catch(e) { Logger.log('getMailingList sheet error: ' + e.message); }

    var tutti = rete.concat(amici).sort(function(a, b) {
      return String(a.email || '').localeCompare(String(b.email || ''));
    });

    return {
      rete: rete.sort(function(a, b) { return String(a.email || '').localeCompare(String(b.email || '')); }),
      amici: amici.sort(function(a, b) { return String(a.email || '').localeCompare(String(b.email || '')); }),
      tutti: tutti
    };
  });
}

function archiviaRiga(rowIndex) {
  return withLock_(function() {
    var sheet = getSheet_();
    var meta = getHeaderMap_(sheet);
    var statoCol = meta.map['STATO_BOYLE'];
    var dataCol  = meta.map['DATA_GESTIONE'];
    if (!statoCol) throw new Error('Colonna STATO_BOYLE non trovata');
    sheet.getRange(rowIndex, statoCol, 1, 1).setValue('ARCHIVIATO');
    if (dataCol) sheet.getRange(rowIndex, dataCol, 1, 1).setValue(getNowString_());
    return { ok: true };
  });
}


function buildWelcomeEmail_(tipo, nome, codice, testoHeroCustom, lang) {
  // Estrai nome breve (primo nome)
  // Capitalizza ogni parola del nome (es. "Simona damiano" → "Simona Damiano")
  nome = String(nome || '').trim().replace(/\b\w/g, function(c) { return c.toUpperCase(); });
  var nomeBreve = nome.split(/\s+/)[0];
  var isAmico = String(tipo || '').toLowerCase().indexOf('amico') !== -1 ||
                String(tipo || '').toLowerCase().indexOf('friend') !== -1;

  // Testo hero — usa custom se fornito dall'admin, altrimenti default ricco
  var isEN = String(lang || '').toUpperCase() === 'EN';
  var testoHeroDefault = isEN
    ? (isAmico
        ? 'We are genuinely glad to have you among the Amici di Boyle. This is not a mailing list \u2014 it is an open community for anyone who shares the same passion for medicine in extreme environments, whether your professional path is well established or just beginning. You are in the right place.'
        : 'It is truly a pleasure to have your expertise within the Boyle Network. What you are receiving is not a service notification \u2014 it is a welcome from a group of people who chose to work together with dedication, method, and the same passion for a field of medicine that few know and even fewer truly practice.')
    : (isAmico
        ? 'Siamo davvero felici di averti tra gli Amici di Boyle. Non si tratta di una lista \u2014 \u00e8 una community aperta a chi condivide la stessa passione per la medicina degli ambienti estremi, che si tratti di un percorso professionale gi\u00e0 consolidato o ancora in costruzione. Sei nel posto giusto.'
        : '\u00c8 davvero un piacere avere la tua professionalit\u00e0 all\u2019interno della Rete di Boyle. Quella che stai ricevendo non \u00e8 una comunicazione di servizio: \u00e8 il benvenuto di un gruppo di persone che ha scelto di lavorare insieme con seriet\u00e0, con metodo e con la stessa passione per una medicina che pochi conoscono e ancora meno praticano davvero.');

  var testoHero = (testoHeroCustom && String(testoHeroCustom).trim())
    ? String(testoHeroCustom).trim()
    : testoHeroDefault;

  var templateName = isEN
    ? (isAmico ? 'template_amici_en' : 'template_rete_en')
    : (isAmico ? 'template_amici'    : 'template_rete');
  var template = HtmlService.createHtmlOutputFromFile(templateName).getContent();

  template = template
    .replace(/__NOME__/g, nome)
    .replace(/__NOME_BREVE__/g, nomeBreve)
    .replace(/__CODICE__/g, codice)
    .replace(/__TESTO_HERO__/g, testoHero);

  return template;
}

function sendWelcomeEmail_(nome, email, codice, tipo, subjectCustom, testoHeroCustom, lang) {
  try {
    var isAmico = String(tipo || '').toLowerCase().indexOf('amico') !== -1 ||
                  String(tipo || '').toLowerCase().indexOf('friend') !== -1;
    nome = String(nome || '').trim().replace(/\b\w/g, function(c) { return c.toUpperCase(); });
    var nomeBreve = nome.split(/\s+/)[0];

    var isEN = String(lang || '').toUpperCase() === 'EN';
    var subjectDefault = isEN
      ? (isAmico
          ? 'Welcome to Gli Amici di Boyle, ' + nomeBreve + ' \u2014 your personal access code'
          : 'Welcome to the Boyle Network, ' + nomeBreve + ' \u2014 your personal access code')
      : (isAmico
          ? 'Benvenuto/a tra gli Amici di Boyle, ' + nomeBreve + ' \u2014 ecco il tuo codice'
          : 'Benvenuto nella Rete di Boyle, ' + nomeBreve + ' \u2014 ecco il tuo codice personale');

    var subject = (subjectCustom && String(subjectCustom).trim())
      ? String(subjectCustom).trim()
      : subjectDefault;

    var html = buildWelcomeEmail_(tipo, nome, codice, testoHeroCustom, lang);
    return sendBrevoEmail_(email, nome, subject, html);
  } catch(e) {
    Logger.log('sendWelcomeEmail_ error: ' + e.message);
    return false;
  }
}

function getMailPreview(nome, codice, tipo, testoHeroCustom, lang) {
  return buildWelcomeEmail_(tipo, nome, codice, testoHeroCustom, lang);
}

/*************************************************
 * WEB APP
 *************************************************/
function doGet() {
  return HtmlService.createTemplateFromFile('Admin')
    .evaluate()
    .setTitle('Boyle - Admin Rete & Amici')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    var data = {};

    if (e && e.postData && e.postData.contents) {
      var raw = e.postData.contents;

      // Tenta JSON
      try {
        var parsed = JSON.parse(raw);
        // Struttura Formspree webhook: { submission: { nome, email, ... } }
        if (parsed.submission && typeof parsed.submission === 'object') {
          data = parsed.submission;
          // Aggiungi tipo dal _subject di Formspree se presente
          if (!data.tipo && parsed.submission._subject) {
            data.tipo = parsed.submission._subject;
          }
        } else {
          data = parsed;
        }
      } catch(err) {
        // Fallback: query string (application/x-www-form-urlencoded)
        raw.split('&').forEach(function(pair) {
          var idx = pair.indexOf('=');
          if (idx > 0) {
            var k = decodeURIComponent(pair.substring(0, idx).replace(/\+/g,' '));
            var v = decodeURIComponent(pair.substring(idx+1).replace(/\+/g,' '));
            if (k && !data[k]) data[k] = v;
          }
        });
      }
    }

    // e.parameter come ulteriore fallback
    if (e && e.parameter) {
      Object.keys(e.parameter).forEach(function(k) {
        if (!data[k]) data[k] = e.parameter[k];
      });
    }

    var result = receiveCandidate_(data);
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

