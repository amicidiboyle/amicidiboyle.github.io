/* Gli Amici di Boyle · riquadro di iscrizione al Barometro di Boyle (barometro.js)
   Si inserisce da solo: in home dopo gli appuntamenti, nelle altre pagine prima del footer
   (oppure dove c'e' un elemento [data-barometro]). Segue la lingua del sito (IT/EN). */
(function () {
  'use strict';
  /* moduli Brevo, con doppia conferma: IT -> lista "Newsletter", EN -> lista "Newsletter EN" */
  var FORM_URL = {
    it: 'https://133dea7a.sibforms.com/serve/MUIFAC66MqqCfzZlZ4kBgQY-lrGhSuKwS5_uA7VDlZAQAjKqA6rrC-Pk6A6JXiLzaKi4tuW2dE7fZnGphIA7BPX4oX42xlnkhTj8HwKGqbRio_7QWWbgKkk55YFi0E0-A-qHYE9Yk-T3EX8Xefvd86Q3xKLufwy7Iff1ODQKKPsPTckl2ak_hsnuCxIROgTN5YKwi4nY2nZ7dgBDbw==',
    en: 'https://133dea7a.sibforms.com/serve/MUIFABnOhjrS8XQOqYSNEyGL-29OuS04nV6gRPqwLRRjMQdZNOrb8kTj2RJDQINNp3JuC-Ce_BwcfYf8VmJJ-jNc6c7Lrl9lQsM9-anDexNQA1ycc2BX6WCkERVgRlRjWBsC-Y3t-2GBeie2a1vCDf9bBStMBhoTHDhBzO-EZygeAK1knEo2iNp2JiOIZ_r9TeTgZMyL2Lwk3pRXQQ=='
  };

  var T = {
    it: {
      kicker: 'Newsletter bimestrale',
      title: 'Il Barometro di Boyle',
      text: 'Appuntamenti della Rete, congressi internazionali e il meglio della letteratura sugli ambienti estremi, dagli abissi all’orbita. Una mail ogni due mesi, niente di più.',
      ph: 'La tua email', label: 'Indirizzo email', btn: 'Iscriviti',
      note: 'Ti chiederemo di confermare l’iscrizione via email. Puoi cancellarti in ogni momento. <a href="privacy.html">Privacy</a>',
      read: 'Leggi il N. 1 · Ottobre 2026 →', readHref: 'newsletter/2026-10.html',
      ok: 'Quasi fatto: controlla la tua casella e conferma l’iscrizione.',
      bad: 'Controlla l’indirizzo email.', err: 'Non è stato possibile completare l’iscrizione. Riprova tra poco o scrivi a newsletter@amicidiboyle.it.',
      dial: ['TEMPESTA', 'PIOGGIA', 'VARIABILE', 'BELLO']
    },
    en: {
      kicker: 'Bimonthly newsletter',
      title: 'Boyle’s Barometer',
      text: 'Network events, international congresses and the best of the literature on extreme environments, from the deep sea to orbit. One email every two months, nothing more.',
      ph: 'Your email', label: 'Email address', btn: 'Subscribe',
      note: 'We will ask you to confirm by email. You can unsubscribe at any time. <a href="privacy.html">Privacy</a>',
      read: 'Read No. 1 · October 2026 →', readHref: 'newsletter/2026-10-en.html',
      ok: 'Almost done: check your inbox and confirm your subscription.',
      bad: 'Please check your email address.', err: 'We could not complete your subscription. Please try again later or write to newsletter@amicidiboyle.it.',
      dial: ['STORMY', 'RAIN', 'CHANGE', 'FAIR']
    }
  };
  function lang() { return (document.documentElement.lang || 'it').slice(0, 2) === 'en' ? 'en' : 'it'; }

  function dialSVG() {
    var c = 120, ticks = '';
    for (var i = 0; i <= 40; i++) {
      var a = (-120 + i * 6) * Math.PI / 180, big = i % 5 === 0;
      var r1 = big ? 84 : 89, r2 = 97;
      ticks += '<line x1="' + (c + r1 * Math.sin(a)).toFixed(1) + '" y1="' + (c - r1 * Math.cos(a)).toFixed(1) +
        '" x2="' + (c + r2 * Math.sin(a)).toFixed(1) + '" y2="' + (c - r2 * Math.cos(a)).toFixed(1) +
        '" stroke="' + (big ? '#7BE4FF' : 'rgba(185,198,214,.55)') + '" stroke-width="' + (big ? 2 : 1) + '"/>';
    }
    var labels = '', pos = [-96, -36, 24, 84];
    pos.forEach(function (deg, k) {
      var a = deg * Math.PI / 180, r = 62;
      labels += '<text class="bmx__dl" data-k="' + k + '" x="' + (c + r * Math.sin(a)).toFixed(1) + '" y="' + (c - r * Math.cos(a) + 3).toFixed(1) +
        '" text-anchor="middle" font-size="8.5" font-weight="700" letter-spacing=".8" fill="' + (k === 3 ? '#4DFFD6' : '#8A9AAE') + '" font-family="ui-monospace, Menlo, monospace"></text>';
    });
    return '<svg class="bmx__dial" viewBox="0 0 240 240" aria-hidden="true">' +
      '<defs><radialGradient id="bmxFace" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#12304F"/><stop offset="1" stop-color="#06101F"/></radialGradient><linearGradient id="bmxSheen" x1="0" y1="0" x2="1" y2="1"><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".09"/><stop offset=".65" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>' +
      '<circle class="bmx__ring" cx="120" cy="120" r="114" fill="none" stroke="rgba(123,228,255,.35)" stroke-width="2"/>' +
      '<circle cx="120" cy="120" r="106" fill="url(#bmxFace)" stroke="rgba(255,255,255,.08)"/>' +
      '<path d="M ' + (c + 102 * Math.sin(1.4661)).toFixed(1) + ' ' + (c - 102 * Math.cos(1.4661)).toFixed(1) + ' A 102 102 0 0 1 ' + (c + 102 * Math.sin(2.0944)).toFixed(1) + ' ' + (c - 102 * Math.cos(2.0944)).toFixed(1) + '" fill="none" stroke="#4DFFD6" stroke-width="3" stroke-linecap="round" opacity=".8"/>' +
      ticks + labels +
      '<text x="120" y="168" text-anchor="middle" font-size="10" font-weight="700" letter-spacing="2" fill="#7BE4FF" font-family="ui-monospace, Menlo, monospace">BOYLE</text>' +
      '<text x="120" y="182" text-anchor="middle" font-size="8" letter-spacing="1.5" fill="#8A9AAE" font-family="ui-monospace, Menlo, monospace">P·V = k</text>' +
      '<g class="bmx__set"><path d="M120 42 L120 20" stroke="#E7B75A" stroke-width="2" stroke-linecap="round" opacity=".85"/><circle cx="120" cy="30" r="3" fill="#E7B75A"/></g>' +
      '<g class="bmx__needle"><g class="bmx__wob"><path d="M120 120 L117 126 L120 34 L123 126 Z" fill="#E8EEF5"/><path d="M120 120 L118 124 L120 150 L122 124 Z" fill="#7BE4FF"/></g></g>' +
      '<circle class="bmx__sheen" cx="120" cy="120" r="106" fill="url(#bmxSheen)"/>' +
      '<circle cx="120" cy="120" r="7" fill="#0B1A2E" stroke="#7BE4FF" stroke-width="2"/>' +
      '</svg>';
  }

  function build() {
    var s = document.createElement('section');
    s.className = 'bmx'; s.id = 'barometro'; s.setAttribute('aria-labelledby', 'bmx-title');
    s.innerHTML =
      '<div class="bmx__panel">' + dialSVG() +
      '<div><p class="bmx__kicker" data-bmx="kicker"></p>' +
      '<h2 class="bmx__title" id="bmx-title" data-bmx="title" data-tfx></h2>' +
      '<p class="bmx__text" data-bmx="text"></p>' +
      '<form class="bmx__form" novalidate>' +
      '<label class="bmx__label" for="bmx-email" data-bmx="label"></label>' +
      '<input class="bmx__input" id="bmx-email" name="EMAIL" type="email" autocomplete="email" required>' +
      '<input class="bmx__hp" name="email_address_check" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<button class="bmx__btn" type="submit" data-bmx="btn"></button></form>' +
      '<p class="bmx__msg" role="status" aria-live="polite"></p>' +
      '<p class="bmx__note" data-bmx-html="note"></p>' +
      '<a class="bmx__read" data-bmx="read"></a></div></div>';
    return s;
  }

  function paint(s) {
    var t = T[lang()];
    s.querySelectorAll('[data-bmx]').forEach(function (el) { el.textContent = t[el.getAttribute('data-bmx')]; });
    s.querySelectorAll('[data-bmx-html]').forEach(function (el) { el.innerHTML = t[el.getAttribute('data-bmx-html')]; });
    s.querySelector('.bmx__input').placeholder = t.ph;
    s.querySelector('.bmx__read').href = t.readHref;
    s.querySelectorAll('.bmx__dl').forEach(function (el) { el.textContent = t.dial[+el.getAttribute('data-k')]; });
  }

  function place(s) {
    var slot = document.querySelector('[data-barometro]');
    if (slot) { slot.appendChild(s); return; }
    var after = document.getElementById('eventi') && document.getElementById('evidenza') ? document.getElementById('eventi') : null;
    if (after) { after.parentNode.insertBefore(s, after.nextSibling); return; }
    var foot = document.querySelector('footer.site-footer, body > footer');
    if (foot) { foot.parentNode.insertBefore(s, foot); return; }
    var main = document.querySelector('main');
    (main || document.body).appendChild(s);
  }

  /* la lancetta racconta il modulo: variabile all'arrivo, bel tempo con un'email valida,
     oltre il bello a iscrizione fatta, pioggia se qualcosa non va */
  var ANG = { start: -118, idle: 24, fair: 84, done: 112, rain: -36 };
  function needle(s, k) { s.style.setProperty('--bmx-a', ANG[k] + 'deg'); s.setAttribute('data-bmx-state', k); }

  function wire(s) {
    var form = s.querySelector('form'), msg = s.querySelector('.bmx__msg'), btn = s.querySelector('.bmx__btn');
    var valid = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); };
    form.EMAIL.addEventListener('input', function () {
      if (!s.classList.contains('is-on') || s.getAttribute('data-bmx-state') === 'done') return;
      needle(s, valid(form.EMAIL.value.trim()) ? 'fair' : 'idle');
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var t = T[lang()], email = form.EMAIL.value.trim();
      msg.className = 'bmx__msg';
      if (!valid(email)) { msg.textContent = t.bad; msg.classList.add('is-err'); needle(s, 'rain'); form.EMAIL.focus(); return; }
      if (form.email_address_check.value) return;
      var L = lang();
      btn.disabled = true;
      var fd = new FormData();
      fd.append('EMAIL', email); fd.append('email_address_check', ''); fd.append('locale', L); fd.append('isAjax', '1');
      var done = function (ok) { msg.textContent = ok ? t.ok : t.err; msg.classList.add(ok ? 'is-ok' : 'is-err'); needle(s, ok ? 'done' : 'rain'); if (ok) form.reset(); };
      fetch(FORM_URL[L], { method: 'POST', body: fd })
        .then(function (r) { return r.json().then(function (j) { return j; }, function () { return { success: r.ok }; }); })
        .then(function (j) {
          if (j && j.success) done(true);
          else if (j && j.errors && j.errors.EMAIL) { msg.textContent = t.bad; msg.classList.add('is-err'); needle(s, 'rain'); }
          else done(false);
        }, function () {
          /* richiesta semplice: arriva a Brevo anche se il browser non ci lascia leggere la risposta */
          done(navigator.onLine !== false);
        })
        .then(function () { btn.disabled = false; });
    });
  }

  function init() {
    if (document.getElementById('barometro')) return;
    var s = build();
    place(s); paint(s); wire(s);
    new MutationObserver(function () { paint(s); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { s.classList.add('is-on'); needle(s, 'idle'); io.disconnect(); } }, { threshold: 0.35 });
      io.observe(s);
    } else { s.classList.add('is-on'); needle(s, 'idle'); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
