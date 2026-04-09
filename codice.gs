/*************************************************
 * CONFIG
 *************************************************/
const SHEET_ID_PROP       = 'SHEET_ID';
const ADMIN_PASSWORD_PROP = 'ADMIN_PASSWORD';
const GITHUB_TOKEN_PROP   = 'GITHUB_TOKEN';

const SHEET_NAME = 'ADMIN_DATA';
const TRASH_NAME = 'CESTINO_ADMIN';

const GITHUB_REPO      = 'amicidiboyle/amicidiboyle.github.io';
const GITHUB_RETE_PATH = 'rete-members.json';

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
  if (!id) {
    throw new Error('SHEET_ID non configurato nelle Script Properties');
  }
  return id;
}

function getAdminPassword_() {
  const pass = PropertiesService.getScriptProperties().getProperty(ADMIN_PASSWORD_PROP);
  if (!pass) {
    throw new Error('ADMIN_PASSWORD non configurata nelle Script Properties');
  }
  return pass;
}

function getGithubToken_() {
  const token = PropertiesService.getScriptProperties().getProperty(GITHUB_TOKEN_PROP);
  if (!token) {
    throw new Error('GITHUB_TOKEN non configurato nelle Script Properties');
  }
  return token;
}

/*************************************************
 * SHEET HELPERS
 *************************************************/
function getSpreadsheet_() {
  return SpreadsheetApp.openById(getSheetId_());
}

function getSheet_() {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  ensureHeaders_(sheet);
  return sheet;
}

function getTrashSheet_() {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(TRASH_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(TRASH_NAME);
  }
  ensureHeaders_(sheet);
  return sheet;
}

function ensureHeaders_(sheet) {
  const requiredLen = REQUIRED_HEADERS.length;
  const currentLen = Math.max(sheet.getLastColumn(), requiredLen);

  const values = sheet.getRange(1, 1, 1, currentLen).getValues()[0];
  const headers = values.slice();

  let changed = false;

  REQUIRED_HEADERS.forEach((h, i) => {
    const current = String(headers[i] || '').trim();
    if (current !== h) {
      headers[i] = h;
      changed = true;
    }
  });

  if (changed) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

function getHeaderMap_(sheet) {
  const lastCol = Math.max(sheet.getLastColumn(), REQUIRED_HEADERS.length);

  if (sheet.getLastColumn() === 0) {
    sheet.getRange(1, 1, 1, REQUIRED_HEADERS.length).setValues([REQUIRED_HEADERS]);
  }

  const headers = sheet
    .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), REQUIRED_HEADERS.length))
    .getValues()[0]
    .map(h => String(h || '').trim());

  const map = {};
  headers.forEach((h, i) => {
    if (h) map[h] = i + 1; // 1-based per SpreadsheetApp
  });

  return { headers, map };
}

/*************************************************
 * ADMIN DATA
 *************************************************/
function getAdminData() {
  return withLock_(() => {
    const sheet = getSheet_();
    const { headers } = getHeaderMap_(sheet);
    const lastRow = sheet.getLastRow();

    if (lastRow < 2) {
      return {
        rows: [],
        stats: getStatsObject_([])
      };
    }

    const values = sheet.getRange(2, 1, lastRow - 1, headers.length).getDisplayValues();

    const rows = values.map((row, i) => {
      const obj = {};
      headers.forEach((h, colIndex) => {
        obj[h] = row[colIndex];
      });
      obj._rowIndex = i + 2;
      return obj;
    });

    return {
      rows,
      stats: getStatsObject_(rows)
    };
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

  rows.forEach(r => {
    const tipo = String(r.TIPO || '').toUpperCase().trim();
    const stato = String(r.STATO_BOYLE || '').toUpperCase().trim();

    if (tipo.includes('RETE')) stats.rete++;
    if (tipo.includes('AMICO')) stats.amici++;

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
  return withLock_(() => {
    const { rowIndex, stato, codice, note } = payload || {};
    const sheet = getSheet_();
    const { map } = getHeaderMap_(sheet);

    const statoCol  = map['STATO_BOYLE'];
    const codiceCol = map['CODICE_BOYLE'];
    const dataCol   = map['DATA_GESTIONE'];
    const noteCol   = map['NOTE_ADMIN'];

    [statoCol, codiceCol, dataCol, noteCol].forEach(v => {
      if (v === undefined) {
        throw new Error('Colonne richieste mancanti');
      }
    });

    const idx = Number(rowIndex);
    if (!Number.isInteger(idx) || idx < 2 || idx > sheet.getLastRow()) {
      throw new Error('Indice riga non valido');
    }

    const now = Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyy-MM-dd HH:mm:ss'
    );

    const rowValues = sheet.getRange(idx, 1, 1, sheet.getLastColumn()).getValues()[0];

    if (stato !== undefined && stato !== null && stato !== '') {
      rowValues[statoCol - 1] = stato;
    }
    if (codice !== undefined) {
      rowValues[codiceCol - 1] = codice;
    }
    if (note !== undefined) {
      rowValues[noteCol - 1] = note;
    }

    rowValues[dataCol - 1] = now;

    sheet.getRange(idx, 1, 1, rowValues.length).setValues([rowValues]);

    return { ok: true, rowIndex: idx };
  });
}

function deleteAdminRow(rowIndex) {
  return withLock_(() => {
    const sheet = getSheet_();
    const trash = getTrashSheet_();
    const { headers } = getHeaderMap_(sheet);

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
  return withLock_(() => {
    const sheet = getSheet_();
    const trash = getTrashSheet_();
    const { headers } = getHeaderMap_(sheet);

    const cleanIndexes = [...new Set((indexes || [])
      .map(x => Number(x))
      .filter(x => Number.isInteger(x) && x >= 2)
    )].sort((a, b) => b - a);

    let count = 0;

    cleanIndexes.forEach(idx => {
      if (idx <= sheet.getLastRow()) {
        const row = sheet.getRange(idx, 1, 1, headers.length).getValues()[0];
        trash.appendRow(row);
        sheet.deleteRow(idx);
        count++;
      }
    });

    return { ok: true, count };
  });
}

function restoreFromTrash(indexes) {
  return withLock_(() => {
    const sheet = getSheet_();
    const trash = getTrashSheet_();
    const { headers } = getHeaderMap_(trash);

    const cleanIndexes = [...new Set((indexes || [])
      .map(x => Number(x))
      .filter(x => Number.isInteger(x) && x >= 2)
    )].sort((a, b) => b - a);

    let count = 0;

    cleanIndexes.forEach(idx => {
      if (idx <= trash.getLastRow()) {
        const row = trash.getRange(idx, 1, 1, headers.length).getValues()[0];
        sheet.appendRow(row);
        trash.deleteRow(idx);
        count++;
      }
    });

    return { ok: true, count };
  });
}

function deleteEmptyRows() {
  return withLock_(() => {
    const sheet = getSheet_();
    const { headers } = getHeaderMap_(sheet);
    const lastRow = sheet.getLastRow();

    if (lastRow < 2) {
      return { ok: true, count: 0 };
    }

    let count = 0;

    for (let i = lastRow; i >= 2; i--) {
      const row = sheet.getRange(i, 1, 1, headers.length).getValues()[0];
      const empty = row.every(v => String(v || '').trim() === '');
      if (empty) {
        sheet.deleteRow(i);
        count++;
      }
    }

    return { ok: true, count };
  });
}

function emptyTrash() {
  return withLock_(() => {
    const trash = getTrashSheet_();
    const lastRow = trash.getLastRow();

    if (lastRow > 1) {
      trash.deleteRows(2, lastRow - 1);
    }

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
  const real = getAdminPassword_();
  return Boolean(pass && real && pass === real);
}

/*************************************************
 * INCLUDE
 *************************************************/
function include(filename) {
  const allowed = ['TrashView'];
  if (!allowed.includes(filename)) {
    throw new Error('File non consentito');
  }
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/*************************************************
 * GITHUB HELPERS
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

function getReteMembers_() {
  const url = 'https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + GITHUB_RETE_PATH;
  const data = githubRequest_('get', url);
  const content = Utilities.newBlob(
    Utilities.base64Decode(data.content)
  ).getDataAsString('utf-8');

  const arr = JSON.parse(content || '[]');
  return { items: arr, sha: data.sha };
}

function saveReteMembers_(items, sha) {
  const url = 'https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + GITHUB_RETE_PATH;
  const json = JSON.stringify(items, null, 2);
  const contentB64 = Utilities.base64Encode(json, Utilities.Charset.UTF_8);

  const payload = {
    message: 'Update rete-members via Admin',
    content: contentB64,
    sha: sha
  };

  return githubRequest_('put', url, payload);
}

/*************************************************
 * PUBLISH CANDIDATE
 *************************************************/
function publishCandidate(rowIndex) {
  return withLock_(() => {
    try {
      const sheet = getSheet_();
      const { headers } = getHeaderMap_(sheet);

      const idx = Number(rowIndex);
      if (!Number.isInteger(idx) || idx < 2 || idx > sheet.getLastRow()) {
        throw new Error('Indice riga non valido');
      }

      const row = sheet.getRange(idx, 1, 1, headers.length).getValues()[0];
      const obj = {};

      headers.forEach((h, i) => {
        obj[h] = row[i];
      });

      const name     = String(obj.NOME || '').trim();
      const email    = String(obj.EMAIL || '').trim();
      const city     = String(obj.citta || obj.CITTA || '').trim();
      const ruolo    = String(obj.ruolo || obj.RUOLO || '').trim();
      const focus    = String(obj.focus || obj.FOCUS || '').trim();
      const linkedin = String(obj.linkedin || obj.LINKEDIN || '').trim();
      const fotoUrl  = String(obj.foto || obj.FOTO || '').trim();

      if (!name || !email) {
        throw new Error('Per pubblicare servono almeno NOME ed EMAIL');
      }

      let img = '';
      if (fotoUrl) {
        try {
          img = String(fotoUrl)
            .split('/')
            .pop()
            .split('?')[0]
            .split('#')[0]
            .trim();
        } catch (e) {
          img = '';
        }
      }

      const roleText = ruolo
        ? (focus ? (ruolo + '. Focus: ' + focus) : ruolo)
        : (focus ? ('Focus: ' + focus) : '');

      const tags = [];
      if (focus) tags.push(focus);
      if (obj.TIPO) tags.push(String(obj.TIPO).trim());

      const member = {
        name: name,
        role: roleText,
        img: img || '',
        city: city || '',
        linkedin: linkedin || '',
        email: email,
        tags: tags.filter(Boolean)
      };

      const rete = getReteMembers_();
      const items = rete.items || [];

      const existingIndex = items.findIndex(m =>
        (m.email && String(m.email).toLowerCase() === email.toLowerCase()) ||
        (m.name && String(m.name).toLowerCase() === name.toLowerCase())
      );

      if (existingIndex >= 0) {
        items[existingIndex] = member;
      } else {
        items.push(member);
      }

      saveReteMembers_(items, rete.sha);

      return { ok: true, member: member };
    } catch (err) {
      Logger.log('publishCandidate error: ' + err.message);
      throw err;
    }
  });
}

/*************************************************
 * WEB APP
 *************************************************/
function doGet() {
  return HtmlService.createTemplateFromFile('Admin')
    .evaluate()
    .setTitle('Boyle – Admin Rete & Amici')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
