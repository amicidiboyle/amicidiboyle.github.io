/* Gli Amici di Boyle · eventi-extra.js
   Prossimi appuntamenti: countdown, passaggio automatico all'archivio,
   contatori e radar del hero, file calendario (.ics). */
(function () {
  'use strict';

  var MONTHS = {
    it: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  };
  var TXT = {
    it: { today: 'Oggi', tomorrow: 'Domani', live: 'In corso', next: 'Il prossimo', days: function (n) { return 'Tra ' + n + ' giorni'; } },
    en: { today: 'Today', tomorrow: 'Tomorrow', live: 'Happening now', next: 'Next up', days: function (n) { return 'In ' + n + ' days'; } }
  };

  function lang() {
    try { return sessionStorage.getItem('boyle_lang') || 'it'; } catch (e) { return 'it'; }
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }

  /* evento concluso -> card compatta in cima all'archivio */
  function toArchive(card) {
    var arch = document.getElementById('evxArchive');
    if (!arch) { card.remove(); return; }
    var title = card.getAttribute('data-title') || '';
    var poster = card.getAttribute('data-poster');
    var pdf = card.getAttribute('data-pdf');
    var el = document.createElement('article');
    el.className = 'evx-mini';
    el.innerHTML =
      (poster ? '<div class="evx-mini__media"><img src="' + esc(poster) + '" alt="' + esc(title) + '" loading="lazy" /></div>' : '') +
      '<div class="evx-mini__body"><span class="evx-mini__date">' + esc(card.getAttribute('data-when') || '') + '</span>' +
      '<h3>' + esc(title) + '</h3><p>' + esc(card.getAttribute('data-city') || '') + '</p>' +
      (pdf ? '<div class="evx-mini__links"><a href="' + esc(pdf) + '" target="_blank" rel="noopener">' + (document.documentElement.getAttribute('data-ev-lang') === 'en' ? 'Programme' : 'Programma') + '</a></div>' : '') +
      '</div>';
    arch.insertBefore(el, arch.firstChild);
    card.remove();
  }

  function update(forced) {
    var l = (forced || lang()) === 'en' ? 'en' : 'it';
    var t = TXT[l];
    document.documentElement.setAttribute('data-ev-lang', l);
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var cards = Array.prototype.slice.call(document.querySelectorAll('.evx-card[data-start]'));

    cards.forEach(function (c) {
      var end = new Date(c.getAttribute('data-end') || c.getAttribute('data-start'));
      if (!isNaN(end.getTime()) && now > end) toArchive(c);
    });
    cards = Array.prototype.slice.call(document.querySelectorAll('.evx-card[data-start]'));

    var cities = {};
    cards.forEach(function (c, i) {
      var start = new Date(c.getAttribute('data-start'));
      var sd = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      var diff = Math.round((sd - today) / 86400000);
      var label = c.querySelector('.evx-countdown');
      var txt, state;
      if (now >= start) { txt = t.live; state = 'live'; }
      else if (diff <= 0) { txt = t.today; state = 'soon'; }
      else if (diff === 1) { txt = t.tomorrow; state = 'soon'; }
      else { txt = t.days(diff); state = diff <= 14 ? 'soon' : 'future'; }
      if (label) label.textContent = txt;
      c.setAttribute('data-state', state);
      c.classList.toggle('evx-card--next', i === 0);
      c.setAttribute('data-next-label', t.next);
      cities[c.getAttribute('data-city')] = 1;
    });

    var nCount = document.getElementById('counterActive');
    var nCities = document.getElementById('counterCities');
    var nNext = document.getElementById('counterNext');
    if (nCount) nCount.textContent = cards.length;
    if (nCities) nCities.textContent = Object.keys(cities).length;
    if (nNext) nNext.textContent = cards.length ? MONTHS[l][new Date(cards[0].getAttribute('data-start')).getMonth()] : '–';

    /* radar del hero: i primi tre eventi in arrivo */
    for (var i = 0; i < 3; i++) {
      var lbl = document.getElementById('evLbl' + i);
      if (!lbl) continue;
      var c = cards[i];
      if (!c) { lbl.style.display = 'none'; continue; }
      var d = new Date(c.getAttribute('data-start'));
      lbl.style.display = '';
      lbl.textContent = c.getAttribute('data-city') + ' · ' + d.getDate() + ' ' + MONTHS[l][d.getMonth()];
    }

    var empty = document.getElementById('evxEmpty');
    if (empty) empty.hidden = cards.length > 0;
  }

  /* ---------- file calendario ---------- */
  function icsDate(d) {
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }
  function icsText(s) {
    return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  }
  function downloadIcs(card) {
    var start = new Date(card.getAttribute('data-start'));
    var end = new Date(card.getAttribute('data-end') || card.getAttribute('data-start'));
    var title = card.getAttribute('data-title') || 'Evento';
    var url = 'https://www.amicidiboyle.it/eventi.html';
    var lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Gli Amici di Boyle//Eventi//IT', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:' + icsDate(start) + '-' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '@amicidiboyle.it',
      'DTSTAMP:' + icsDate(new Date()),
      'DTSTART:' + icsDate(start),
      'DTEND:' + icsDate(end),
      'SUMMARY:' + icsText(title),
      'LOCATION:' + icsText(card.getAttribute('data-place') || ''),
      'DESCRIPTION:' + icsText('Gli Amici di Boyle · ' + url),
      'URL:' + url,
      'END:VEVENT', 'END:VCALENDAR'
    ];
    var blob = new Blob([lines.join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = title.replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').toLowerCase() + '.ics';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  function init() {
    update();
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('.evx-ics');
      if (!b) return;
      var card = b.closest('.evx-card');
      if (card) downloadIcs(card);
    });
  }

  window.boyleEventsLang = function (l) { update(l); };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
