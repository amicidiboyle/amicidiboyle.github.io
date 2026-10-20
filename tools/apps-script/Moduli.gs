/*************************************************
 * MODULI DEL SITO (al posto di Formspree)
 * I moduli di amicidiboyle.it inviano qui i dati con il campo _form.
 * Per ogni invio: filtro antispam, riga nel foglio MODULI, notifica a
 * info@amicidiboyle.it con gli allegati, risposta automatica a chi scrive.
 * Le candidature a Rete e Amici passano anche da receiveCandidate_,
 * come prima faceva il webhook di Formspree.
 *************************************************/

const FORMS_NOTIFY_TO = 'info@amicidiboyle.it';
const FORMS_SHEET     = 'MODULI';
const FORMS_MAX_FILE  = 6 * 1024 * 1024;   // 6 MB per allegato

const FORM_LABELS = {
  contatti:        'Contatto dal sito',
  docenza:         'Richiesta di docenza',
  collabora:       'Candidatura Amici di Boyle (home)',
  rete:            'Candidatura alla Rete di Boyle',
  amici:           'Iscrizione agli Amici di Boyle',
  'evento-rete':   'Proposta di evento (Rete)',
  'evento':        'Proposta di evento (Eventi)',
  podcast:         'Proposta per il podcast',
  diving:          'Richiesta su una scheda Diving-Boyle'
};

function handleFormSubmission_(data) {
  var form = String(data._form || '').trim();
  if (!FORM_LABELS[form]) return { ok: false, error: 'modulo sconosciuto' };

  // antispam: campo nascosto compilato o invio troppo rapido = bot, risposta finta
  if (String(data._gotcha || '').trim()) return { ok: true };
  var t = Number(data._t || 0);
  if (t && (Date.now() - t) < 3000) return { ok: true };

  var nome  = String(valueFromObject_(data, ['nome', 'name', 'NOME']) || '').trim();
  var email = String(valueFromObject_(data, ['email', 'EMAIL']) || '').trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'email non valida' };

  // allegati: arrivano in base64 dal browser
  var files = [];
  (Array.isArray(data._files) ? data._files : []).forEach(function (f) {
    if (!f || !f.data) return;
    var bytes = Utilities.base64Decode(f.data);
    if (bytes.length > FORMS_MAX_FILE) return;
    files.push({ field: f.field, name: String(f.name || 'allegato').slice(0, 120), content: f.data });
  });

  // campi leggibili (senza quelli tecnici)
  var fields = {};
  Object.keys(data).forEach(function (k) {
    if (k.charAt(0) === '_' || k === 'action') return;
    var v = data[k];
    if (v === null || v === undefined || v === '') return;
    fields[k] = String(v);
  });
  files.forEach(function (f) { fields[f.field] = 'allegato: ' + f.name; });

  // 1. foglio MODULI
  try {
    var ss = getSpreadsheet_();
    var sh = ss.getSheetByName(FORMS_SHEET);
    if (!sh) {
      sh = ss.insertSheet(FORMS_SHEET);
      sh.appendRow(['DATA', 'MODULO', 'NOME', 'EMAIL', 'DATI']);
      sh.setFrozenRows(1);
    }
    sh.appendRow([getNowString_(), FORM_LABELS[form], nome, email, JSON.stringify(fields)]);
  } catch (e) {
    Logger.log('MODULI sheet error: ' + e.message);
  }

  // 2. candidature Rete e Amici: stesso flusso di prima (foglio ADMIN_DATA)
  if (form === 'rete' || form === 'amici') {
    try {
      var d = Object.assign({}, data);
      if (form === 'amici' && !d.tipo) d.tipo = 'amico';
      receiveCandidate_(d);
    } catch (e) {
      Logger.log('receiveCandidate_ error: ' + e.message);
    }
  }

  // 3. notifica a info@
  var subject = String(data._subject || FORM_LABELS[form]);
  var rows = Object.keys(fields).map(function (k) {
    return '<tr><td style="padding:6px 10px;border-bottom:1px solid #e3eaf0;color:#4a5b68;vertical-align:top;white-space:nowrap">' +
      esc_(k.replace(/_/g, ' ')) + '</td><td style="padding:6px 10px;border-bottom:1px solid #e3eaf0;white-space:pre-wrap">' +
      esc_(fields[k]) + '</td></tr>';
  }).join('');
  var notifyHtml = '<div style="font-family:Arial,sans-serif;font-size:14px;color:#14222c">' +
    '<p style="margin:0 0 4px;color:#0b6c94;font-weight:bold">' + esc_(FORM_LABELS[form]) + '</p>' +
    '<p style="margin:0 0 14px;color:#5b6b77">' + esc_(getNowString_()) + '</p>' +
    '<table style="border-collapse:collapse;width:100%">' + rows + '</table>' +
    (email ? '<p style="margin-top:16px">Rispondi direttamente a questa mail per scrivere a ' + esc_(nome || email) + '.</p>' : '') +
    '</div>';
  sendBrevoMail_({
    to: FORMS_NOTIFY_TO, toName: 'Gli Amici di Boyle', subject: subject,
    html: notifyHtml, replyTo: email ? { email: email, name: nome } : null,
    attachments: files.map(function (f) { return { name: f.name, content: f.content }; })
  });

  // 4. risposta automatica a chi ha scritto
  if (email) {
    var en = String(data._language || '').toLowerCase().indexOf('en') === 0;
    var reply = autoReply_(form, nome, data, en);
    sendBrevoMail_({ to: email, toName: nome, subject: reply.subject, html: reply.html, replyTo: { email: FORMS_NOTIFY_TO, name: 'Gli Amici di Boyle' } });
  }

  return { ok: true };
}

function autoReply_(form, nome, data, en) {
  var hi = en ? ('Dear ' + (nome || 'friend') + ',') : ('Gentile ' + (nome || '') + ',').replace(' ,', ',');
  var body, subject;
  var titolo = String(data.titolo_evento || '').trim();
  var diving = String(data['Diving segnalato'] || '').trim();
  if (en) {
    subject = 'We have received your message · Gli Amici di Boyle';
    body = form === 'rete'
      ? 'thank you for applying to join the Boyle Network. We review every application personally and will get back to you within a few days. If it is accepted, you will receive your access code to complete your profile on the website.'
      : form === 'amici'
      ? 'thank you for joining the Friends of Boyle. We will get back to you shortly with your access code.'
      : 'thank you for writing to us. We have received your message and will reply as soon as possible.';
  } else {
    subject = 'Abbiamo ricevuto il tuo messaggio · Gli Amici di Boyle';
    switch (form) {
      case 'rete':
        subject = 'Abbiamo ricevuto la tua candidatura · Rete di Boyle';
        body = 'grazie per la tua candidatura alla Rete di Boyle. Valutiamo personalmente ogni richiesta e ti scriveremo entro pochi giorni. Se la candidatura viene accolta, riceverai il tuo codice d’accesso per completare il profilo sul sito.';
        break;
      case 'amici':
        subject = 'Benvenuto tra gli Amici di Boyle';
        body = 'grazie per esserti unito agli Amici di Boyle. A breve riceverai una mail con il tuo codice d’accesso.';
        break;
      case 'collabora':
        body = 'grazie per il tuo interesse a collaborare con gli Amici di Boyle. Leggiamo con attenzione ogni candidatura e ti risponderemo il prima possibile.';
        break;
      case 'evento-rete':
      case 'evento':
        subject = 'Abbiamo ricevuto la tua proposta di evento · Gli Amici di Boyle';
        body = 'grazie per averci proposto ' + (titolo ? '«' + esc_(titolo) + '»' : 'il tuo evento') + '. Lo valutiamo e ti rispondiamo entro 48 ore; se è in linea con i temi del sito, lo pubblichiamo e lo segnaliamo nella newsletter.';
        break;
      case 'podcast':
        body = 'grazie per la tua proposta per Sotto Pressione. L’abbiamo girata a Luigi Tarsia, che cura il podcast, e ti risponderemo il prima possibile.';
        break;
      case 'diving':
        subject = 'Abbiamo ricevuto la tua richiesta · Diving-Boyle';
        body = 'grazie per la segnalazione' + (diving ? ' sulla scheda di «' + esc_(diving) + '»' : '') + '. La verifichiamo e aggiorniamo la mappa entro 30 giorni.';
        break;
      case 'docenza':
        body = 'grazie per la tua richiesta di docenza. La valutiamo e ti contatteremo il prima possibile per definire i dettagli.';
        break;
      default:
        body = 'grazie per averci scritto. Abbiamo ricevuto il tuo messaggio e ti risponderemo il prima possibile.';
    }
  }
  var sign = en ? 'Gli Amici di Boyle · Research &amp; Education' : 'Gli Amici di Boyle · Research &amp; Education';
  var note = en ? 'This is an automatic confirmation. You can reply to this email to write to us.'
                : 'Questa è una conferma automatica. Puoi rispondere a questa mail per scriverci.';
  var html = '<div style="font-family:Arial,sans-serif;font-size:15px;line-height:23px;color:#14222c;max-width:560px">' +
    '<div style="background:#062a4d;border-radius:12px 12px 0 0;padding:18px 22px">' +
    '<img src="https://www.amicidiboyle.it/assets/logo-112.png" width="44" height="44" alt="Gli Amici di Boyle" style="vertical-align:middle;border-radius:50%">' +
    '<span style="color:#ffffff;font-weight:bold;font-size:17px;margin-left:10px;vertical-align:middle">Gli Amici di Boyle</span></div>' +
    '<div style="border:1px solid #d9e3ea;border-top:0;border-radius:0 0 12px 12px;padding:22px">' +
    '<p style="margin:0 0 12px">' + esc_(hi) + '</p><p style="margin:0 0 16px">' + body + '</p>' +
    '<p style="margin:0 0 18px">' + sign + '<br><a href="https://www.amicidiboyle.it" style="color:#0b6c94">www.amicidiboyle.it</a></p>' +
    '<p style="margin:0;font-size:12px;color:#7a8a96">' + note + '</p></div></div>';
  return { subject: subject, html: html };
}

// invio tramite Brevo con risposta e allegati
function sendBrevoMail_(o) {
  try {
    var apiKey = getBrevoApiKey_();
    var payload = {
      sender: { name: 'Gli Amici di Boyle', email: 'info@amicidiboyle.it' },
      to: [{ email: o.to, name: o.toName || '' }],
      subject: o.subject,
      htmlContent: o.html
    };
    if (o.replyTo && o.replyTo.email) payload.replyTo = o.replyTo;
    if (o.attachments && o.attachments.length) payload.attachment = o.attachments;
    var resp = UrlFetchApp.fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'post', contentType: 'application/json',
      headers: { 'api-key': apiKey },
      payload: JSON.stringify(payload), muteHttpExceptions: true
    });
    var code = resp.getResponseCode();
    if (code < 200 || code >= 300) Logger.log('Brevo modulo ERRORE ' + code + ': ' + resp.getContentText());
    return code >= 200 && code < 300;
  } catch (e) {
    Logger.log('sendBrevoMail_ exception: ' + e.message);
    return false;
  }
}

function esc_(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  });
}

// prova manuale dall'editor: simula un contatto e manda notifica e risposta a info@
function testModuli() {
  return handleFormSubmission_({
    _form: 'contatti', _subject: 'Prova modulo contatti',
    nome: 'Prova Sistema', email: 'info@amicidiboyle.it',
    subject: 'Prova', message: 'Messaggio di prova del nuovo sistema dei moduli.'
  });
}
