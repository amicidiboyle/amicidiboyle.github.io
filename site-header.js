/* Gli Amici di Boyle · header unico del sito.
   Costruisce lo stesso header su ogni pagina; il vecchio header resta nel documento ma nascosto,
   cosi' gli script di ogni pagina (cambio lingua compreso) continuano a funzionare. */
(function () {
  'use strict';
  var file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (file === '') file = 'index.html';
  var HOME = file === 'index.html';
  var home = function (h) { return HOME ? h : 'index.html' + h; };

  var T = {
    it: { about: 'Chi siamo', tools: 'Strumenti', rete: 'Rete', pod: 'Podcast', ev: 'Eventi', cont: 'Contatti', join: 'Network', menu: 'Menu', more: 'Chi siamo',
      vis: ['Visione', 'Perché esistiamo'], att: ['Attività e ricerca', 'Aree e progetti'], form: ['Formazione', 'Corsi, congressi, lezioni'], pub: ['Pubblicazioni', 'Articoli e capitoli'], fond: ['Fondatori', 'Chi guida il progetto'], part: ['Partner', 'Con chi collaboriamo'],
      lab: ['Boyle Lab', 'Laboratorio virtuale'], bib: ['Boyle Bibliography', 'Bibliografia scientifica'], div: ['Diving-Boyle', 'I diving italiani'] },
    en: { about: 'About', tools: 'Tools', rete: 'Network', pod: 'Podcast', ev: 'Events', cont: 'Contact', join: 'Network', menu: 'Menu', more: 'About',
      vis: ['Vision', 'Why we exist'], att: ['Activities & research', 'Areas and projects'], form: ['Education', 'Courses, congresses, lectures'], pub: ['Publications', 'Papers and chapters'], fond: ['Founders', 'Who leads the project'], part: ['Partners', 'Who we work with'],
      lab: ['Boyle Lab', 'Virtual laboratory'], bib: ['Boyle Bibliography', 'Scientific bibliography'], div: ['Diving-Boyle', 'Italian dive centres'] }
  };
  var ICON = {
    vis: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    att: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3"/></svg>',
    form: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/></svg>',
    pub: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h7"/></svg>',
    fond: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
    part: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 12l3 3 5-6"/><circle cx="12" cy="12" r="9"/></svg>',
    lab: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 12h4l3-7 4 14 3-7h4"/></svg>',
    bib: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5"/></svg>',
    div: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>'
  };
  var ABOUT = [['vis', home('#visione')], ['att', home('#attivita')], ['form', home('#formazione')], ['pub', home('#contenuti-articoli')], ['fond', home('#fondatori')], ['part', home('#partner')]];
  var TOOLS = [['lab', 'boyle-lab.html'], ['bib', 'boylebibliography.html'], ['div', 'diving-boyle.html']];
  var MAIN = [['pod', 'podcast.html'], ['ev', 'eventi.html'], ['cont', home('#contatti')]];
  var toolActive = TOOLS.some(function (t) { return t[1] === file; });
  var CHEV = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 3.5L5 7l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  var ARROW = '<svg class="sh__orb" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5" stroke-width="1.6"/><ellipse cx="12" cy="12" rx="3.6" ry="8.5" stroke-width="1.2" opacity=".75"/><path d="M3.8 9.2h16.4M3.8 14.8h16.4" stroke-width="1.1" opacity=".55"/><path class="sh__orb-arc" d="M12 3.5a8.5 8.5 0 0 1 8.5 8.5" stroke-width="2"/><circle cx="12" cy="12" r="2.1" fill="currentColor" stroke="none"/><circle cx="20.5" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="6" cy="5.9" r="1.2" fill="currentColor" stroke="none"/><circle cx="7.5" cy="19.4" r="1.2" fill="currentColor" stroke="none"/></svg>';

  function lang() { return (document.documentElement.lang || 'it').slice(0, 2) === 'en' ? 'en' : 'it'; }

  function build() {
    var old = document.querySelector('header.site-header, header.header, body > header');
    var h = document.createElement('header');
    h.className = 'sh'; h.setAttribute('role', 'banner');
    var panel = function (list, id) {
      return '<div class="sh__panel" id="' + id + '" role="menu">' + list.map(function (x) {
        return '<a role="menuitem" href="' + x[1] + '" data-k="' + x[0] + '"' + (x[1] === file ? ' class="is-active" aria-current="page"' : '') + '><i>' + ICON[x[0]] + '</i><b></b><small></small></a>';
      }).join('') + '</div>';
    };
    h.innerHTML =
      '<div class="sh__in">' +
        '<a class="sh__brand" href="index.html" aria-label="Gli Amici di Boyle · Home"><img src="assets/logo-boyle-96.png" srcset="assets/logo-boyle-96.png 1x, assets/logo-boyle-192.png 2x" alt="" width="46" height="46"><span><b>Gli Amici di Boyle</b><small><i>Extreme Environments Medicine</i><i><span class="sh__dot"> · </span>Research &amp; Education</i></small></span></a>' +
        '<nav class="sh__nav" aria-label="Navigazione principale">' +
          '<div class="sh__dd" data-dd><button type="button" aria-expanded="false" aria-controls="shAbout"><span data-t="about"></span>' + CHEV + '</button>' + panel(ABOUT, 'shAbout') + '</div>' +
          '<div class="sh__dd' + (toolActive ? ' is-active' : '') + '" data-dd><button type="button" aria-expanded="false" aria-controls="shTools"><span data-t="tools"></span>' + CHEV + '</button>' + panel(TOOLS, 'shTools') + '</div>' +
          MAIN.map(function (m) { return '<a href="' + m[1] + '" data-t="' + m[0] + '"' + (m[1] === file ? ' class="is-active" aria-current="page"' : '') + '></a>'; }).join('') +
        '</nav>' +
        '<button type="button" class="sh__lang" aria-label="Cambia lingua / Switch language"><span data-l="it">IT</span><span data-l="en">EN</span></button>' +
        '<a class="sh__join' + (file === 'rete.html' ? ' is-active" aria-current="page' : '') + '" href="rete.html" data-join>' + ARROW + '<span data-t="join"></span></a>' +
        '<button type="button" class="sh__burger" aria-expanded="false" aria-controls="shSheet"><span></span><span></span><span></span></button>' +
      '</div>' +
      '<div class="sh__sheet" id="shSheet">' +
        '<button type="button" class="sh__grp" data-g="tools" aria-expanded="false"><span data-t="tools"></span>' + CHEV + '</button>' +
        '<div class="sh__sub" hidden>' + TOOLS.map(function (x) { return '<a href="' + x[1] + '" data-kn="' + x[0] + '"' + (x[1] === file ? ' class="is-active"' : '') + '></a>'; }).join('') + '</div>' +
        '<button type="button" class="sh__grp" data-g="about" aria-expanded="false"><span data-t="about"></span>' + CHEV + '</button>' +
        '<div class="sh__sub" hidden>' + ABOUT.map(function (x) { return '<a href="' + x[1] + '" data-kn="' + x[0] + '"></a>'; }).join('') + '</div>' +
        MAIN.map(function (m) { return '<a class="sh__item' + (m[1] === file ? ' is-active' : '') + '" href="' + m[1] + '" data-t="' + m[0] + '"></a>'; }).join('') +
        '<button type="button" class="sh__lang" aria-label="Cambia lingua / Switch language"><span data-l="it">IT</span><span data-l="en">EN</span></button>' +
      '</div>';
    if (old) { old.classList.add('sh-legacy'); old.parentNode.insertBefore(h, old); }
    else document.body.insertBefore(h, document.body.firstChild);
    var sheet = h.querySelector('.sh__sheet'); h.parentNode.insertBefore(sheet, h.nextSibling);
    return h;
  }

  var h = build(), sheet = document.getElementById('shSheet'), all = [h, sheet];
  function texts() {
    var d = T[lang()];
    all.forEach(function (root) {
      root.querySelectorAll('[data-t]').forEach(function (el) { el.textContent = d[el.getAttribute('data-t')]; });
      root.querySelectorAll('[data-kn]').forEach(function (el) { el.textContent = d[el.getAttribute('data-kn')][0]; });
      root.querySelectorAll('[data-k]').forEach(function (el) { var v = d[el.getAttribute('data-k')]; el.querySelector('b').textContent = v[0]; el.querySelector('small').textContent = v[1]; });
      root.querySelectorAll('.sh__lang span').forEach(function (s) { s.classList.toggle('on', s.getAttribute('data-l') === lang()); });
    });
  }
  texts();
  if ('MutationObserver' in window) new MutationObserver(texts).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  /* menu a tendina: clic per aprire, fuori o Esc per chiudere; al passaggio del mouse su desktop */
  var dds = Array.prototype.slice.call(h.querySelectorAll('[data-dd]')), hoverT = 0;
  function setDd(dd, open) { dd.classList.toggle('is-open', open); dd.querySelector('button').setAttribute('aria-expanded', String(open)); }
  dds.forEach(function (dd) {
    var lastPt = '';
    dd.querySelector('button').addEventListener('pointerdown', function (e) { lastPt = e.pointerType; });
    dd.querySelector('button').addEventListener('click', function (e) {
      e.stopPropagation();
      var o = lastPt === 'mouse' ? true : !dd.classList.contains('is-open'); lastPt = '';
      dds.forEach(function (x) { setDd(x, false); }); setDd(dd, o);
    });
    dd.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'mouse') return; clearTimeout(hoverT); dds.forEach(function (x) { setDd(x, x === dd); }); });
    dd.addEventListener('pointerleave', function (e) { if (e.pointerType !== 'mouse') return; hoverT = setTimeout(function () { setDd(dd, false); }, 220); });
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('[data-dd]')) dds.forEach(function (x) { setDd(x, false); }); });

  /* menu del telefono */
  var burger = h.querySelector('.sh__burger');
  function setMenu(open) { h.classList.toggle('menu-open', open); sheet.classList.toggle('is-open', open); burger.setAttribute('aria-expanded', String(open)); }
  burger.addEventListener('click', function (e) { e.stopPropagation(); setMenu(!h.classList.contains('menu-open')); });
  sheet.addEventListener('click', function (e) { e.stopPropagation(); });
  document.addEventListener('click', function () { setMenu(false); });
  sheet.querySelectorAll('.sh__grp').forEach(function (g) {
    g.addEventListener('click', function () { var sub = g.nextElementSibling, o = sub.hidden; sub.hidden = !o; g.setAttribute('aria-expanded', String(o)); });
  });
  if (toolActive) { var tg = sheet.querySelector('[data-g="tools"]'); tg.nextElementSibling.hidden = false; tg.setAttribute('aria-expanded', 'true'); }
  sheet.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); dds.forEach(function (x) { setDd(x, false); }); } });
  matchMedia('(min-width: 1061px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });

  /* lingua: usa il pulsante della pagina, che resta nel vecchio header nascosto */
  if (!document.querySelector('.sh-legacy #langToggle, .sh-legacy #lang-toggle-desktop, .sh-legacy .lang-toggle')) document.querySelectorAll('.sh__lang').forEach(function (b) { b.hidden = true; });
  document.querySelectorAll('.sh__lang').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = document.querySelector('.sh-legacy #langToggle, .sh-legacy #lang-toggle-desktop, .sh-legacy .lang-toggle');
      if (t) t.click();
      setTimeout(texts, 40);
    });
  });

  /* header piu' basso quando si scorre */
  var ticking = false;
  function onScroll() { if (ticking) return; ticking = true; requestAnimationFrame(function () { h.classList.toggle('is-scrolled', window.scrollY > 24); ticking = false; }); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  new ResizeObserver(function () { sheet.style.top = (h.getBoundingClientRect().height + 8) + 'px'; }).observe(h);

})();
