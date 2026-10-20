/* Gli Amici di Boyle · consenso cookie (consent.js)
   - Banner con "Rifiuta" e "Accetta" di pari peso; un clic su Accetta vale per tutto.
   - Google Analytics 4 si carica solo dopo "Accetta".
   - La scelta vale 6 mesi, poi il banner ricompare.
   - Link "Preferenze cookie" aggiunto accanto a ogni link alla Cookie Policy. */
(function () {
  'use strict';
  var GA_ID = 'G-T39LRQMK7Y';
  var KEY = 'boyle_consent';
  var MAX_AGE = 182 * 24 * 3600 * 1000;           // 6 mesi

  var en = false;
  try { en = (sessionStorage.getItem('boyle_lang') || document.documentElement.lang || 'it').slice(0, 2) === 'en'; } catch (e) {}
  var T = en ? {
    text: 'We use technical cookies and, only if you accept, Google Analytics to count visits anonymously. The Spotify players may set their own cookies.',
    cookie: 'Cookie Policy', privacy: 'Privacy', no: 'Reject', yes: 'Accept', prefs: 'Cookie preferences', label: 'Cookie consent'
  } : {
    text: 'Usiamo cookie tecnici e, solo se accetti, Google Analytics per contare le visite in forma anonima. I player di Spotify possono impostare cookie propri.',
    cookie: 'Cookie Policy', privacy: 'Privacy', no: 'Rifiuta', yes: 'Accetta', prefs: 'Preferenze cookie', label: 'Consenso cookie'
  };

  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (v && (Date.now() - v.t) < MAX_AGE) return v.c;
    } catch (e) {}
    return null;
  }
  function save(c) {
    try { localStorage.setItem(KEY, JSON.stringify({ c: c, t: Date.now() })); } catch (e) {}
    try { localStorage.removeItem('boyle_cookie_ok'); } catch (e) {}
  }

  var gaLoaded = false;
  function loadGA() {
    if (gaLoaded) return; gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    var s = document.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }
  function clearGA() {
    document.cookie.split(';').forEach(function (c) {
      var n = c.split('=')[0].trim();
      if (n === '_ga' || n.indexOf('_ga_') === 0 || n === '_gid') {
        var host = location.hostname.replace(/^www\./, '');
        ['', '; domain=' + host, '; domain=.' + host].forEach(function (d) {
          document.cookie = n + '=; Max-Age=0; path=/' + d;
        });
      }
    });
  }

  var css = '#boyle-consent{position:fixed;left:0;right:0;bottom:0;z-index:9999;' +
    'background:rgba(4,16,38,.95);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);' +
    'border-top:1px solid rgba(120,210,255,.18);' +
    'padding:14px max(16px,env(safe-area-inset-right,0px)) calc(14px + env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px));' +
    'display:flex;align-items:center;justify-content:center;gap:14px 18px;flex-wrap:wrap;' +
    'transform:translateY(110%);transition:transform .35s cubic-bezier(.22,.68,0,1.1);font-family:inherit}' +
    '#boyle-consent.on{transform:none}' +
    '#boyle-consent p{margin:0;flex:1 1 320px;max-width:720px;font-size:.8rem;line-height:1.5;color:rgba(237,247,255,.78)}' +
    '#boyle-consent a{color:#a8eeff;text-decoration:none;white-space:nowrap}#boyle-consent a:hover{text-decoration:underline}' +
    '#boyle-consent .bc-btns{display:flex;gap:10px}' +
    '#boyle-consent button{min-width:104px;padding:8px 18px;border-radius:999px;font:600 .82rem/1 inherit;cursor:pointer;' +
    'background:rgba(123,228,255,.12);border:1px solid rgba(123,228,255,.32);color:#cff4ff;transition:background .2s}' +
    '#boyle-consent button:hover{background:rgba(123,228,255,.24)}' +
    '#boyle-consent button:focus-visible{outline:2px solid #7be4ff;outline-offset:2px}' +
    '@media (max-width:520px){#boyle-consent .bc-btns{width:100%}#boyle-consent button{flex:1}}' +
    '@media (prefers-reduced-motion:reduce){#boyle-consent{transition:none}}';

  var bar = null;
  function show() {
    if (!bar) {
      var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
      bar = document.createElement('div');
      bar.id = 'boyle-consent'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', T.label);
      bar.innerHTML = '<p>' + T.text + ' <a href="cookie.html">' + T.cookie + '</a> · <a href="privacy.html">' + T.privacy + '</a></p>' +
        '<div class="bc-btns"><button type="button" data-c="none">' + T.no + '</button>' +
        '<button type="button" data-c="all">' + T.yes + '</button></div>';
      document.body.appendChild(bar);
      bar.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-c]'); if (!b) return;
        var c = b.getAttribute('data-c');
        save(c);
        if (c === 'all') loadGA(); else clearGA();
        bar.classList.remove('on');
      });
    }
    requestAnimationFrame(function () { requestAnimationFrame(function () { bar.classList.add('on'); }); });
  }
  window.boyleCookiePrefs = show;

  function addPrefsLinks() {
    document.querySelectorAll('footer a[href$="cookie.html"], .footer-links a[href$="cookie.html"], .db-preview-note a[href$="cookie.html"], .bb-footer a[href$="cookie.html"]').forEach(function (a) {
      if (a.nextElementSibling && a.nextElementSibling.classList.contains('bc-prefs')) return;
      var l = document.createElement('a');
      l.href = '#'; l.className = 'bc-prefs ' + (a.className || ''); l.textContent = T.prefs;
      l.addEventListener('click', function (e) { e.preventDefault(); show(); });
      a.parentNode.insertBefore(l, a.nextSibling);
      if (a.parentNode.tagName === 'P') a.parentNode.insertBefore(document.createTextNode(' · '), l);
      if (a.parentNode.tagName === 'LI') {
        // footer a elenco: il link va in una voce sua
        var li = document.createElement('li'); li.appendChild(l);
        a.parentNode.parentNode.insertBefore(li, a.parentNode.nextSibling);
      }
    });
  }

  function init() {
    var c = read();
    if (c === 'all') loadGA();
    else if (c === null) setTimeout(show, 600);
    addPrefsLinks();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
