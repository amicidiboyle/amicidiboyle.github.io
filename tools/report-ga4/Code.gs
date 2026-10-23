/**
 * Report settimanale Google Analytics 4 · Gli Amici di Boyle
 * Ogni lunedì mattina legge GA4, costruisce i grafici e invia una mail a
 * Silvio e Luigi. Sezioni dedicate a Diving-Boyle e Boyle Bibliography,
 * più un riepilogo del podcast dal feed RSS. Storico su Google Sheets.
 *
 * Uso: eseguire una sola volta la funzione setup() e autorizzare.
 */

const CONFIG = {
  MEASUREMENT_ID: 'G-T39LRQMK7Y',
  PROPERTY_ID: '',            // vuoto: viene trovato da solo tramite il Measurement ID
  RECIPIENTS: ['zerbi.silvio@gmail.com', 'luigi.tarsia@amicidiboyle.it'],
  SENDER_NAME: 'Gli Amici di Boyle',
  REPLY_TO: 'info@amicidiboyle.it',
  HOUR: 9,
  FOCUS_PAGES: [
    { label: 'Diving-Boyle', match: 'diving-boyle', color: '#20a4c3' },
    { label: 'Boyle Bibliography', match: 'boylebibliography', color: '#c9a227' },
    { label: 'Podcast', match: 'podcast', color: '#7a9e7e' }
  ],
  // cartella Drive dove Luigi salva ogni mese il CSV esportato da Spotify for Creators
  SPOTIFY_FOLDER_ID: '1p6bljx7qtKrNTt3Lb1trnoNoD8fBTJ7l',
  PODCAST_RSS: 'https://anchor.fm/s/103fe6a4c/podcast/rss',
  PODCAST_URL: 'https://open.spotify.com/show/2kiLEUpdpn6FIUzTDMx0V7',
  SITE_START: '2026-04-01',      // lancio del sito: il primo report parte da qui
  // newsletter su Brevo: serve la proprieta' di script BREVO_API_KEY
  NEWSLETTER_LISTS: [{ id: 3, label: 'Italiano' }, { id: 4, label: 'English' }]
};

// spiegazione mostrata solo nel primo report
const FIRST_NOTE =
  '<div style="background:#fff8e6;border:1px solid #f0d58a;border-radius:8px;padding:12px 14px;margin:14px 0;font-size:14px;line-height:21px">' +
  '<b>Primo report: come leggere i numeri.</b><br>' +
  'Il grafico qui sotto mostra tutte le settimane dal lancio del sito, ad aprile; dalla prossima settimana mostrerà le ultime otto. ' +
  'Da martedì 20 ottobre il sito rispetta le regole del Garante sui cookie: Google Analytics conta solo chi clicca “Accetta” sul banner, ' +
  'quindi da quella data le visite registrate calano anche se i visitatori reali non diminuiscono. ' +
  'Diving-Boyle è misurata solo dalla sera del 19 ottobre, per questo il suo storico parte quasi da zero.' +
  '</div>';

const PALETTE = ['#0b4f6c', '#20a4c3', '#c9a227', '#7a9e7e', '#b5653b', '#8c7aa9'];

/* ---------- installazione ---------- */

function setup() {
  const propertyId = getPropertyId_();
  getHistorySheet_();
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'sendWeeklyReport')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('sendWeeklyReport')
    .timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(CONFIG.HOUR)
    .inTimezone('Europe/Rome').create();
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'checkNewEpisode')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('checkNewEpisode').timeBased().everyDays(1).atHour(10)
    .inTimezone('Europe/Rome').create();
  checkNewEpisode(); // memorizza l'episodio attuale senza mandare mail
  Logger.log('Proprietà GA4: ' + propertyId + ' · invio ogni lunedì alle ' + CONFIG.HOUR);
  sendWeeklyReport({ first: true }); // primo invio subito, con lo storico completo
}

/* ---------- report ---------- */

function sendWeeklyReport(opts) {
  const first = !!(opts && opts.first === true);
  const prop = 'properties/' + getPropertyId_();
  // il primo report mostra tutto lo storico dal lancio del sito, poi le ultime 8 settimane
  const trendStart = first ? CONFIG.SITE_START : '56daysAgo';
  const metrics = ['activeUsers', 'newUsers', 'sessions', 'screenPageViews',
                   'averageSessionDuration', 'engagementRate'];

  const kpi = compare_(prop, metrics);

  // trend sito: 8 settimane ISO complete (lunedì-domenica)
  const weekly = run_(prop, {
    dateRanges: [{ startDate: trendStart, endDate: 'yesterday' }],
    dimensions: [{ name: 'isoYearIsoWeek' }],
    metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }],
    orderBys: [{ dimension: { dimensionName: 'isoYearIsoWeek' } }]
  });
  const weeks = weekly.map(r => r.dims[0]);

  // pagine in evidenza
  const focus = CONFIG.FOCUS_PAGES.map(fp => {
    const filter = { filter: { fieldName: 'pagePath',
      stringFilter: { matchType: 'CONTAINS', value: fp.match, caseSensitive: false } } };
    const trendRows = run_(prop, {
      dateRanges: [{ startDate: trendStart, endDate: 'yesterday' }],
      dimensions: [{ name: 'isoYearIsoWeek' }],
      metrics: [{ name: 'screenPageViews' }],
      dimensionFilter: filter
    });
    const byWeek = {};
    trendRows.forEach(r => byWeek[r.dims[0]] = r.vals[0]);
    return Object.assign({}, fp, {
      kpi: compare_(prop, ['screenPageViews', 'activeUsers', 'userEngagementDuration'], filter),
      trend: weeks.map(w => byWeek[w] || 0)
    });
  });

  const pages = topList_(prop, 'pagePath', 'screenPageViews', 8);
  const channels = topList_(prop, 'sessionDefaultChannelGroup', 'sessions', 6);
  const countries = topList_(prop, 'country', 'activeUsers', 6);
  const podcast = podcastInfo_();
  if (podcast) {
    podcast.site = podcastSiteEvents_(prop);
    podcast.spotify = spotifyInfo_();
  }
  const newsletter = newsletterInfo_();

  const images = {
    trend: lineChart_(first ? 'Sito: tutte le settimane dal lancio' : 'Sito: ultime 8 settimane', weeks,
      [['Utenti', weekly.map(r => r.vals[0])],
       ['Sessioni', weekly.map(r => r.vals[1])],
       ['Pagine viste', weekly.map(r => r.vals[2])]], PALETTE.slice(0, 3)),
    focus: lineChart_('Pagine viste per settimana', weeks,
      focus.map(f => [f.label, f.trend]), focus.map(f => f.color)),
    channels: pieChart_('Da dove arrivano le visite', channels),
    countries: barChart_('Utenti per paese', countries)
  };

  const range = weekLabel_();
  if (!(opts && opts.test)) saveHistory_(range, kpi.cur, focus);   // le prove non finiscono nello storico

  MailApp.sendEmail({
    to: CONFIG.RECIPIENTS.join(','),
    subject: 'amicidiboyle.it · visite della settimana ' + range,
    htmlBody: buildHtml_(range, kpi, focus, pages, podcast, first, newsletter),
    name: CONFIG.SENDER_NAME,
    replyTo: CONFIG.REPLY_TO,
    inlineImages: images
  });
}

/* ---------- helper GA4 ---------- */

function getPropertyId_() {
  if (CONFIG.PROPERTY_ID) return CONFIG.PROPERTY_ID;
  const sp = PropertiesService.getScriptProperties();
  const cached = sp.getProperty('PROPERTY_ID');
  if (cached) return cached;
  const summaries = AnalyticsAdmin.AccountSummaries.list().accountSummaries || [];
  for (const acc of summaries) {
    for (const p of (acc.propertySummaries || [])) {
      const streams = AnalyticsAdmin.Properties.DataStreams.list(p.property).dataStreams || [];
      if (streams.some(s => s.webStreamData && s.webStreamData.measurementId === CONFIG.MEASUREMENT_ID)) {
        const id = p.property.split('/')[1];
        sp.setProperty('PROPERTY_ID', id);
        return id;
      }
    }
  }
  throw new Error('Nessuna proprietà GA4 con ' + CONFIG.MEASUREMENT_ID +
                  ' accessibile da questo account Google.');
}

function run_(prop, request) {
  const res = AnalyticsData.Properties.runReport(request, prop);
  return (res.rows || []).map(r => ({
    dims: (r.dimensionValues || []).map(d => d.value),
    vals: (r.metricValues || []).map(m => Number(m.value))
  }));
}

// settimana appena chiusa vs precedente
function compare_(prop, metrics, dimensionFilter) {
  const req = {
    dateRanges: [
      { startDate: '7daysAgo', endDate: 'yesterday', name: 'cur' },
      { startDate: '14daysAgo', endDate: '8daysAgo', name: 'prev' }
    ],
    metrics: metrics.map(name => ({ name }))
  };
  if (dimensionFilter) req.dimensionFilter = dimensionFilter;
  const out = { cur: {}, prev: {} };
  run_(prop, req).forEach(r => {
    const t = r.dims[r.dims.length - 1] === 'cur' ? out.cur : out.prev;
    metrics.forEach((m, i) => t[m] = r.vals[i]);
  });
  return out;
}

function topList_(prop, dim, metric, limit) {
  return run_(prop, {
    dateRanges: [{ startDate: '7daysAgo', endDate: 'yesterday' }],
    dimensions: [{ name: dim }],
    metrics: [{ name: metric }],
    orderBys: [{ metric: { metricName: metric }, desc: true }],
    limit: limit
  }).map(r => [r.dims[0], r.vals[0]]);
}

/* ---------- podcast (feed RSS pubblico) ---------- */

function podcastInfo_() {
  try {
    const xml = XmlService.parse(UrlFetchApp.fetch(CONFIG.PODCAST_RSS).getContentText());
    const items = xml.getRootElement().getChild('channel').getChildren('item');
    const last = items[0];
    const date = new Date(last.getChildText('pubDate'));
    return { count: items.length, title: last.getChildText('title'),
             date: Utilities.formatDate(date, 'Europe/Rome', 'd/M/yyyy'),
             days: Math.floor((new Date() - date) / 86400000) };
  } catch (e) {
    return null;
  }
}

// controllo giornaliero: avvisa Silvio quando Luigi pubblica un episodio nuovo
function checkNewEpisode() {
  const info = podcastInfo_();
  if (!info) return;
  const sp = PropertiesService.getScriptProperties();
  const last = sp.getProperty('LAST_EPISODE');
  sp.setProperty('LAST_EPISODE', info.title);
  if (!last || last === info.title) return;
  MailApp.sendEmail({
    to: CONFIG.RECIPIENTS[0],
    subject: 'Sotto Pressione · nuovo episodio: ' + info.title,
    htmlBody: '<div style="font-family:Arial,sans-serif;font-size:14px;line-height:21px">' +
      '<p>Luigi ha pubblicato <b>' + info.title + '</b> (' + info.date + ').</p>' +
      '<p>Entro un giorno compare da solo su ' +
      '<a href="https://www.amicidiboyle.it/podcast.html">amicidiboyle.it/podcast</a>, nel blocco "Nuovi episodi". ' +
      'Per usare il player Spotify dell\'episodio, incolla il suo ID nel campo spotify_id di assets/podcast/feed.json.</p></div>',
    name: CONFIG.SENDER_NAME
  });
}

/* ---------- grafici ---------- */

function weekName_(w) { return 'sett. ' + String(w).slice(4); }

function lineChart_(title, weeks, series, colors) {
  const dt = Charts.newDataTable().addColumn(Charts.ColumnType.STRING, 'Settimana');
  series.forEach(s => dt.addColumn(Charts.ColumnType.NUMBER, s[0]));
  weeks.forEach((w, i) => dt.addRow([weekName_(w)].concat(series.map(s => s[1][i] || 0))));
  return Charts.newLineChart().setDataTable(dt.build()).setTitle(title)
    .setColors(colors).setDimensions(640, 300)
    .setLegendPosition(Charts.Position.BOTTOM)
    .setPointStyle(Charts.PointStyle.MEDIUM)
    .build().getAs('image/png');
}

function pieChart_(title, rows) {
  const dt = Charts.newDataTable()
    .addColumn(Charts.ColumnType.STRING, 'Canale')
    .addColumn(Charts.ColumnType.NUMBER, 'Sessioni');
  (rows.length ? rows : [['Nessun dato', 1]]).forEach(r => dt.addRow([r[0], r[1]]));
  return Charts.newPieChart().setDataTable(dt.build()).setTitle(title)
    .setColors(PALETTE).setDimensions(640, 300)
    .setLegendPosition(Charts.Position.RIGHT)
    .build().getAs('image/png');
}

function barChart_(title, rows) {
  const dt = Charts.newDataTable()
    .addColumn(Charts.ColumnType.STRING, 'Paese')
    .addColumn(Charts.ColumnType.NUMBER, 'Utenti');
  (rows.length ? rows : [['Nessun dato', 0]]).forEach(r => dt.addRow([r[0], r[1]]));
  return Charts.newBarChart().setDataTable(dt.build()).setTitle(title)
    .setColors([PALETTE[0]]).setDimensions(640, 280)
    .setLegendPosition(Charts.Position.NONE)
    .build().getAs('image/png');
}

/* ---------- storico su Google Sheets ---------- */

function getHistorySheet_() {
  const sp = PropertiesService.getScriptProperties();
  const id = sp.getProperty('HISTORY_SHEET_ID');
  if (id) return SpreadsheetApp.openById(id).getSheets()[0];
  const ss = SpreadsheetApp.create('Boyle · Analytics settimanali');
  const sh = ss.getSheets()[0];
  sh.appendRow(['Settimana', 'Utenti attivi', 'Nuovi utenti', 'Sessioni', 'Pagine viste',
                'Durata media sessione (s)', 'Tasso di engagement']
    .concat(CONFIG.FOCUS_PAGES.map(f => 'Viste ' + f.label)));
  sh.setFrozenRows(1);
  sp.setProperty('HISTORY_SHEET_ID', ss.getId());
  return sh;
}

function saveHistory_(range, cur, focus) {
  const sh = getHistorySheet_();
  focus.forEach((f, i) => { const c = sh.getRange(1, 8 + i); if (!c.getValue()) c.setValue('Viste ' + f.label); });
  sh.appendRow([range, cur.activeUsers || 0, cur.newUsers || 0,
    cur.sessions || 0, cur.screenPageViews || 0,
    Math.round(cur.averageSessionDuration || 0), cur.engagementRate || 0]
    .concat(focus.map(f => f.kpi.cur.screenPageViews || 0)));
}

/* ---------- mail ---------- */

const n_ = v => Math.round(v || 0).toLocaleString('it-IT');
const sec_ = v => Math.floor((v || 0) / 60) + ' min ' + Math.round((v || 0) % 60) + ' s';
const pct_ = v => ((v || 0) * 100).toFixed(0) + '%';

function delta_(c, p) {
  if (!p) return '<span style="color:#888">·</span>';
  const d = (c - p) / p * 100;
  return '<span style="color:' + (d >= 0 ? '#1a7f37' : '#b42318') + '">' +
         (d >= 0 ? '▲ +' : '▼ ') + d.toFixed(0) + '%</span>';
}

function kpiTable_(rows) {
  const td = 'padding:6px 10px;border-bottom:1px solid #eef2f4;';
  return '<table style="border-collapse:collapse;width:100%;font-size:14px">' +
    '<tr style="background:#f1f6f8"><th style="' + td + 'text-align:left"></th>' +
    '<th style="' + td + 'text-align:right">Questa sett.</th>' +
    '<th style="' + td + 'text-align:right">Precedente</th>' +
    '<th style="' + td + 'text-align:right">Var.</th></tr>' +
    rows.map(r => '<tr><td style="' + td + '">' + r[0] + '</td>' +
      '<td style="' + td + 'text-align:right;font-weight:600">' + r[3](r[1]) + '</td>' +
      '<td style="' + td + 'text-align:right;color:#666">' + r[3](r[2]) + '</td>' +
      '<td style="' + td + 'text-align:right">' + delta_(r[1], r[2]) + '</td></tr>').join('') +
    '</table>';
}

function h3_(t) { return '<h3 style="font-size:16px;margin:28px 0 8px;color:#0b4f6c">' + t + '</h3>'; }
function img_(cid) { return '<p style="margin:10px 0"><img src="cid:' + cid + '" style="max-width:100%;border:1px solid #eef2f4;border-radius:6px"></p>'; }

function buildHtml_(range, kpi, focus, pages, podcast, first, newsletter) {
  const c = kpi.cur, p = kpi.prev;
  let html = '<div style="font-family:Arial,sans-serif;max-width:660px;color:#1d2a33">' +
    '<h2 style="font-family:Georgia,serif;color:#0b4f6c;margin-bottom:4px">amicidiboyle.it</h2>' +
    '<p style="margin-top:0;color:#555">Settimana ' + range + ', confronto con la settimana precedente</p>' +
    (first ? FIRST_NOTE : '') +
    kpiTable_([
      ['Utenti attivi', c.activeUsers, p.activeUsers, n_],
      ['Nuovi utenti', c.newUsers, p.newUsers, n_],
      ['Sessioni', c.sessions, p.sessions, n_],
      ['Pagine viste', c.screenPageViews, p.screenPageViews, n_],
      ['Durata media sessione', c.averageSessionDuration, p.averageSessionDuration, sec_],
      ['Tasso di engagement', c.engagementRate, p.engagementRate, pct_]
    ]) + img_('trend');

  html += h3_('Diving-Boyle, Boyle Bibliography e Podcast') +
    kpiTable_([].concat.apply([], focus.map(f => {
      const tc = (f.kpi.cur.userEngagementDuration || 0) / Math.max(f.kpi.cur.activeUsers || 0, 1);
      const tp = (f.kpi.prev.userEngagementDuration || 0) / Math.max(f.kpi.prev.activeUsers || 0, 1);
      return [
        ['<b>' + f.label + '</b> · pagine viste', f.kpi.cur.screenPageViews, f.kpi.prev.screenPageViews, n_],
        [f.label + ' · utenti', f.kpi.cur.activeUsers, f.kpi.prev.activeUsers, n_],
        [f.label + ' · tempo medio per utente', tc, tp, sec_]
      ];
    }))) + img_('focus');

  html += h3_('Pagine più viste') +
    '<table style="border-collapse:collapse;width:100%;font-size:14px">' +
    (pages.length ? pages.map(r => '<tr><td style="padding:5px 10px;border-bottom:1px solid #eef2f4">' + r[0] +
      '</td><td style="padding:5px 10px;border-bottom:1px solid #eef2f4;text-align:right">' + n_(r[1]) + '</td></tr>').join('')
      : '<tr><td style="color:#666">Nessun dato.</td></tr>') + '</table>';

  html += h3_('Provenienza e paesi') + img_('channels') + img_('countries');

  if (podcast) {
    html += h3_('Sotto Pressione · podcast') +
      '<p style="font-size:14px;line-height:21px">' + podcast.count + ' episodi pubblicati. ' +
      'Ultimo: <a href="' + CONFIG.PODCAST_URL + '" style="color:#0b4f6c">' + podcast.title + '</a> (' +
      podcast.date + ', ' + podcast.days + ' giorni fa). ' +
      '</p>';
    html += podcastExtraHtml_(podcast);
  }

  html += newsletterHtml_(newsletter);

  return html + '<p style="font-size:12px;color:#888;margin-top:30px">Report automatico da Google Apps Script sui dati di Google Analytics 4 e Brevo.</p></div>';
}

function weekLabel_() {
  const tz = 'Europe/Rome';
  const end = new Date(); end.setDate(end.getDate() - 1);
  const start = new Date(); start.setDate(start.getDate() - 7);
  return Utilities.formatDate(start, tz, 'd/M') + '–' + Utilities.formatDate(end, tz, 'd/M/yyyy');
}

/* ---------- newsletter (Brevo) ---------- */

function brevo_(path) {
  const key = PropertiesService.getScriptProperties().getProperty('BREVO_API_KEY');
  if (!key) throw new Error('manca la proprieta\' di script BREVO_API_KEY');
  const r = UrlFetchApp.fetch('https://api.brevo.com/v3' + path, {
    headers: { 'api-key': String(key).trim(), accept: 'application/json' }, muteHttpExceptions: true });
  if (r.getResponseCode() >= 300) throw new Error('Brevo ' + r.getResponseCode() + ': ' + r.getContentText().slice(0, 200));
  return JSON.parse(r.getContentText());
}

function newsletterInfo_() {
  try {
    const now = Date.now(), day = 86400000;
    const lists = CONFIG.NEWSLETTER_LISTS.map(l => {
      const info = brevo_('/contacts/lists/' + l.id);
      let contacts = [], off = 0;
      while (true) {
        const page = brevo_('/contacts/lists/' + l.id + '/contacts?limit=500&offset=' + off);
        contacts = contacts.concat(page.contacts || []);
        if (!page.contacts || page.contacts.length < 500) break;
        off += 500;
      }
      const created = c => new Date(c.createdAt).getTime();
      return {
        label: l.label,
        total: info.uniqueSubscribers || contacts.length,
        week: contacts.filter(c => now - created(c) <= 7 * day).length,
        prevWeek: contacts.filter(c => now - created(c) > 7 * day && now - created(c) <= 14 * day).length
      };
    });
    // ultimo numero inviato (una campagna per lingua)
    const camps = (brevo_('/emailCampaigns?status=sent&limit=10&sort=desc&statistics=globalStats&excludeHtmlContent=true').campaigns || []);
    const last = [];
    CONFIG.NEWSLETTER_LISTS.forEach(l => {
      const c = camps.find(x => x.recipients && (x.recipients.lists || []).indexOf(l.id) >= 0);
      if (!c) return;
      const g = (c.statistics && c.statistics.globalStats) || {};
      const cs = ((c.statistics && c.statistics.campaignStats) || [])[0] || {};
      last.push({
        label: l.label, name: c.subject, date: Utilities.formatDate(new Date(c.sentDate), 'Europe/Rome', 'd/M/yyyy'),
        days: Math.round((now - new Date(c.sentDate).getTime()) / day),
        sent: g.sent || 0, delivered: g.delivered || 0, opens: g.uniqueViews || 0, mpp: g.appleMppOpens || 0,
        clicks: cs.uniqueClicks != null ? cs.uniqueClicks : (g.uniqueClicks || 0),
        unsub: g.unsubscriptions || 0, bounces: (g.hardBounces || 0) + (g.softBounces || 0)
      });
    });
    return { lists: lists, last: last };
  } catch (e) {
    Logger.log('newsletterInfo_: ' + e.message);
    return { error: e.message };
  }
}

function newsletterHtml_(nl) {
  if (!nl) return '';
  let html = h3_('Il Barometro di Boyle · newsletter');
  if (nl.error) return html + '<p style="font-size:14px;color:#a33">Dati della newsletter non disponibili: ' + nl.error + '.</p>';
  const tot = nl.lists.reduce((a, l) => a + l.total, 0);
  html += kpiTable_(
    [['Iscritti totali', tot, tot - nl.lists.reduce((a, l) => a + l.week, 0), n_]].concat(
      nl.lists.map(l => ['Nuovi iscritti questa settimana · ' + l.label, l.week, l.prevWeek, n_])));
  nl.last.forEach(c => {
    const rate = c.delivered ? c.opens / c.delivered : 0;
    html += '<p style="font-size:14px;line-height:21px;margin:12px 0 4px"><b>Ultimo numero (' + c.label + ')</b>: ' + c.name +
      ' · inviato il ' + c.date + ' (' + c.days + ' giorni fa)</p>' +
      '<table style="border-collapse:collapse;width:100%;font-size:14px">' +
      [['Consegnate', n_(c.delivered) + ' su ' + n_(c.sent)],
       ['Aperture uniche', n_(c.opens) + ' (' + pct_(rate) + ')' + (c.mpp ? ' · di cui ' + n_(c.mpp) + ' automatiche di Apple Mail' : '')],
       ['Persone che hanno cliccato', n_(c.clicks)],
       ['Disiscrizioni', n_(c.unsub)],
       ['Indirizzi non raggiungibili', n_(c.bounces)]
      ].map(r => '<tr><td style="padding:5px 10px;border-bottom:1px solid #eef2f4">' + r[0] +
        '</td><td style="padding:5px 10px;border-bottom:1px solid #eef2f4;text-align:right">' + r[1] + '</td></tr>').join('') +
      '</table>';
  });
  return html + '<p style="font-size:12px;color:#888;margin-top:6px">Apple Mail apre in automatico le mail per proteggere la privacy: le aperture reali sono un po\' meno di quelle indicate.</p>';
}

// prova dall'editor: manda il report solo a Silvio
function testReport() {
  const r = CONFIG.RECIPIENTS; CONFIG.RECIPIENTS = [r[0]];
  try { sendWeeklyReport({ test: true }); } finally { CONFIG.RECIPIENTS = r; }
}

/* ---------- podcast: ascolti dal sito (GA4) e da Spotify (CSV) ---------- */

function podcastSiteEvents_(prop) {
  try {
    const names = ['podcast_play', 'podcast_spotify', 'podcast_voice'];
    const filter = { filter: { fieldName: 'eventName', inListFilter: { values: names } } };
    const tot = {};
    names.forEach(n => tot[n] = { cur: 0, prev: 0 });
    ['7daysAgo|yesterday|cur', '14daysAgo|8daysAgo|prev'].forEach(r => {
      const [a, b, k] = r.split('|');
      run_(prop, { dateRanges: [{ startDate: a, endDate: b }], dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }], dimensionFilter: filter })
        .forEach(x => { if (tot[x.dims[0]]) tot[x.dims[0]][k] = x.vals[0]; });
    });
    const top = run_(prop, { dateRanges: [{ startDate: '7daysAgo', endDate: 'yesterday' }],
      dimensions: [{ name: 'linkText' }], metrics: [{ name: 'eventCount' }],
      dimensionFilter: { filter: { fieldName: 'eventName', inListFilter: { values: ['podcast_play', 'podcast_spotify'] } } },
      orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }], limit: 5 })
      .filter(x => x.dims[0] && x.dims[0] !== '(not set)').map(x => [x.dims[0], x.vals[0]]);
    return { tot: tot, top: top };
  } catch (e) { Logger.log('podcastSiteEvents_: ' + e.message); return null; }
}

// legge il CSV piu' recente nella cartella Drive, qualunque grafico Luigi abbia esportato
function spotifyInfo_() {
  try {
    if (!CONFIG.SPOTIFY_FOLDER_ID) return null;
    const it = DriveApp.getFolderById(CONFIG.SPOTIFY_FOLDER_ID).getFiles();
    const files = [];
    while (it.hasNext()) {
      const f = it.next();
      if (/\.csv$/i.test(f.getName()) || f.getMimeType() === 'text/csv') files.push(f);
    }
    if (!files.length) return { empty: true };
    files.sort((a, b) => b.getLastUpdated() - a.getLastUpdated());
    const f = files[0];
    const rows = Utilities.parseCsv(f.getBlob().getDataAsString('utf-8').replace(/^\uFEFF/, ''));
    if (rows.length < 2) return { empty: true };
    const head = rows[0].map(h => String(h).trim()), body = rows.slice(1).filter(r => r.some(c => String(c).trim()));
    const num = v => { const x = parseFloat(String(v).replace(/\./g, '').replace(',', '.').replace(/[^0-9.\-]/g, '')); return isNaN(x) ? null : x; };
    const isNumCol = i => body.filter(r => num(r[i]) !== null).length >= body.length * .8;
    const isDateCol = i => body.filter(r => !isNaN(Date.parse(r[i]))).length >= body.length * .8 && !isNumCol(i);
    const dateCol = head.findIndex((h, i) => isDateCol(i));
    const numCols = head.map((h, i) => i).filter(i => i !== dateCol && isNumCol(i));
    const textCol = head.findIndex((h, i) => i !== dateCol && !isNumCol(i));
    const out = { file: f.getName(), updated: Utilities.formatDate(f.getLastUpdated(), 'Europe/Rome', 'd/M/yyyy') };
    if (dateCol >= 0) {
      // serie giornaliera: ultimi 30 giorni contro i 30 precedenti
      const last = Math.max.apply(null, body.map(r => Date.parse(r[dateCol])));
      const day = 86400000;
      out.series = numCols.map(i => {
        let cur = 0, prev = 0;
        body.forEach(r => { const d = last - Date.parse(r[dateCol]); const v = num(r[i]) || 0;
          if (d < 30 * day) cur += v; else if (d < 60 * day) prev += v; });
        return [head[i], cur, prev];
      });
      out.until = Utilities.formatDate(new Date(last), 'Europe/Rome', 'd/M/yyyy');
    } else if (textCol >= 0 && numCols.length) {
      // tabella per episodio: i primi 5 secondo la prima colonna numerica
      const i = numCols[0];
      out.metric = head[i];
      out.top = body.map(r => [r[textCol], num(r[i]) || 0]).sort((a, b) => b[1] - a[1]).slice(0, 5);
      out.total = body.reduce((a, r) => a + (num(r[i]) || 0), 0);
    }
    return out;
  } catch (e) { Logger.log('spotifyInfo_: ' + e.message); return { error: e.message }; }
}

function podcastExtraHtml_(p) {
  let html = '';
  const td = 'padding:5px 10px;border-bottom:1px solid #eef2f4;';
  if (p.site) {
    const t = p.site.tot;
    html += '<p style="font-size:14px;margin:14px 0 4px"><b>Dal sito</b> (solo visitatori che hanno accettato i cookie)</p>' +
      kpiTable_([
        ['Ascolti avviati dal player del sito', t.podcast_play.cur, t.podcast_play.prev, n_],
        ['Clic verso Spotify', t.podcast_spotify.cur, t.podcast_spotify.prev, n_],
        ['Messaggi vocali inviati a Luigi', t.podcast_voice.cur, t.podcast_voice.prev, n_]
      ]);
    if (p.site.top.length) html += '<table style="border-collapse:collapse;width:100%;font-size:14px;margin-top:6px">' +
      p.site.top.map(r => '<tr><td style="' + td + '">' + r[0] + '</td><td style="' + td + 'text-align:right">' + n_(r[1]) + '</td></tr>').join('') + '</table>';
  }
  const s = p.spotify;
  if (s) {
    html += '<p style="font-size:14px;margin:16px 0 4px"><b>Su Spotify</b></p>';
    if (s.error) html += '<p style="font-size:13px;color:#a33">Non riesco a leggere il file di Spotify: ' + s.error + '.</p>';
    else if (s.empty) html += '<p style="font-size:13px;color:#888">Nessun dato: Luigi non ha ancora caricato l\'esportazione CSV di Spotify for Creators nella cartella Drive "Sotto Pressione · statistiche Spotify".</p>';
    else {
      if (s.series) html += kpiTable_(s.series.map(r => [r[0] + ' (ultimi 30 giorni)', r[1], r[2], n_]))
        .replace('Questa sett.', 'Ultimi 30 gg').replace('Precedente', '30 gg prima');
      if (s.top) html += '<table style="border-collapse:collapse;width:100%;font-size:14px">' +
        '<tr><td style="' + td + 'color:#666">Totale · ' + s.metric + '</td><td style="' + td + 'text-align:right;font-weight:600">' + n_(s.total) + '</td></tr>' +
        s.top.map(r => '<tr><td style="' + td + '">' + r[0] + '</td><td style="' + td + 'text-align:right">' + n_(r[1]) + '</td></tr>').join('') + '</table>';
      html += '<p style="font-size:12px;color:#888;margin-top:4px">Dal file ' + s.file + ', caricato il ' + s.updated + (s.until ? ', dati fino al ' + s.until : '') + '.</p>';
    }
  }
  return html;
}
