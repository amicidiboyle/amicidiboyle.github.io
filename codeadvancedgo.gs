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

    if (stato !== undefined && stato !== null && stato !== '') rowValues[statoCol - 1] = stato;
    if (codice !== undefined) rowValues[codiceCol - 1] = codice;
    if (note !== undefined) rowValues[noteCol - 1] = note;
    rowValues[dataCol - 1] = getNowString_();

    sheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
    return { ok: true, rowIndex: rowIndex };
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



function publishCandidate(rowIndex) {
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

    const name  = valueFromObject_(obj, ['NOME', 'NAME', 'Nome']);
    const email = valueFromObject_(obj, ['EMAIL', 'Email', 'MAIL']);
    const tipo  = valueFromObject_(obj, ['TIPO']);
    const city  = valueFromObject_(obj, ['CITTA', 'CITTÀ', 'CITY', 'citta', 'city']);
    const ruolo = valueFromObject_(obj, ['RUOLO', 'ROLE', 'ruolo', 'role']);
    const focus = valueFromObject_(obj, ['FOCUS', 'INTERESSE', 'INTEREST', 'focus']);
    const linkedin = valueFromObject_(obj, ['LINKEDIN', 'linkedin']);
    const fotoUrl  = valueFromObject_(obj, ['FOTO', 'IMG', 'foto', 'img']);
    const bio      = valueFromObject_(obj, ['BIO', 'bio']);

    if (!name || !email) {
      throw new Error('Per pubblicare servono almeno NOME ed EMAIL');
    }

    const codiceCol = map['CODICE_BOYLE'];
    const statoCol  = map['STATO_BOYLE'];
    const noteCol   = map['NOTE_ADMIN'];
    const dataCol   = map['DATA_GESTIONE'];

    if (!codiceCol || !statoCol || !noteCol || !dataCol) {
      throw new Error('Mancano colonne obbligatorie nel foglio');
    }

    var codice = String(row[codiceCol - 1] || '').trim();
    if (!codice) {
      codice = generateAccessCode_(tipo, name);
      row[codiceCol - 1] = codice;
    }

    const isAmico = String(tipo || '').toLowerCase().indexOf('amico') !== -1;
    row[statoCol - 1] = isAmico ? 'AMICO' : 'RETE';
    row[dataCol - 1] = getNowString_();

    var note = String(row[noteCol - 1] || '').trim();
    const stamp = isAmico ? 'Codice AMICO assegnato' : 'Pubblicato su rete-members.json';
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

    var roleText = ruolo || '';
    if (focus) roleText = roleText ? (roleText + '. Focus: ' + focus) : ('Focus: ' + focus);

    const tags = [];
    if (tipo && String(tipo).toLowerCase().indexOf('rete') !== -1) tags.push('Rete');
    if (tipo && String(tipo).toLowerCase().indexOf('amico') !== -1) tags.push('Amico');
    if (focus) tags.push(focus);

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

    if (isAmico) {
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
 * WEB APP
 *************************************************/
function doGet() {
  return HtmlService.createTemplateFromFile('Admin')
    .evaluate()
    .setTitle('Boyle - Admin Rete & Amici')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
