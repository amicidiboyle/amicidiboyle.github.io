/* Gli Amici di Boyle · indice della pagina.
   Telefono: bussola in basso a destra con anello di avanzamento, nome della sezione al cambio, elenco delle sezioni.
   Computer: puntini sul bordo destro con il nome della sezione corrente.
   Le sezioni di ogni pagina sono elencate qui sotto (id, italiano, inglese). */
(function () {
  'use strict';
  var file = (location.pathname.split('/').pop() || 'index.html').toLowerCase() || 'index.html';
  var MAP = {
    'index.html': [
      ['home', 'Inizio', 'Top'], ['evidenza', 'In evidenza', 'Highlights'], ['eventi', 'Appuntamenti', 'Events'], ['barometro', 'Il Barometro', 'The Barometer'],
      ['visione', 'Visione', 'Vision'], ['attivita', 'Aree', 'Areas'], ['fondatori', 'Fondatori', 'Founders'], ['rete-home', 'La Rete', 'The Network'],
      ['polo-droni', 'Polo Droni', 'Drone Hub'], ['boyle-lab-home', 'Boyle Lab', 'Boyle Lab'], ['boyle-bibliography', 'Bibliography', 'Bibliography'],
      ['diving-boyle-home', 'Diving-Boyle', 'Diving-Boyle'], ['ricerca', 'Ricerca', 'Research'], ['formazione', 'Formazione', 'Education'],
      ['contenuti-articoli', 'Pubblicazioni', 'Publications'], ['dicono-di-noi', 'Dicono di noi', 'Testimonials'], ['partner', 'Partner', 'Partners'], ['contatti', 'Contatti', 'Contact']],
    'rete.html': [['top', 'La sfera', 'The sphere'], ['members', 'Nuovi nella Rete', 'New in the Network'], ['amici', 'Perché entrare', 'Why join'], ['prossimo-evento', 'Eventi', 'Events'], ['barometro', 'Il Barometro', 'The Barometer']],
    'podcast.html': [['top', 'Il podcast', 'The podcast'], ['episodi', 'Episodi', 'Episodes']],
    'eventi.html': [['in-arrivo', 'Prossimi appuntamenti', 'Upcoming'], ['archivio', 'Eventi conclusi', 'Past events'], ['proponi', 'Proponi un evento', 'Propose an event'], ['barometro', 'Il Barometro', 'The Barometer']]
  };
  var list = MAP[file]; if (!list) return;
  var T = { it: { title: 'In questa pagina', top: 'Torna su', open: 'Indice della pagina' }, en: { title: 'On this page', top: 'Back to top', open: 'Page index' } };
  var en = function () { return (document.documentElement.lang || 'it').slice(0, 2) === 'en'; };
  var REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init() {
    var secs = list.map(function (x) { return { el: document.getElementById(x[0]), it: x[1], en: x[2] }; })
      .filter(function (s) { return s.el && s.el.offsetParent !== null && s.el.getBoundingClientRect().height > 60; });
    if (secs.length < 2 || document.documentElement.scrollHeight < innerHeight * 2.2) return;
    var name = function (s) { return en() ? s.en : s.it; };

    /* telefono: bussola */
    var w = document.createElement('div'); w.className = 'si'; w.setAttribute('data-si', '');
    w.innerHTML =
      '<div class="si__toast" aria-hidden="true"><b></b><small></small></div>' +
      '<div class="si__panel" role="dialog" aria-modal="false"><p class="si__h"></p><button type="button" class="si__top"><span aria-hidden="true">↑</span> <span data-sit="top"></span></button><ol class="si__list"></ol></div>' +
      '<button type="button" class="si__btn" aria-expanded="false">' +
        '<svg class="si__ring" viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="25" class="si__track"/><circle cx="28" cy="28" r="25" class="si__prog"/></svg>' +
        '<svg class="si__compass" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".55"/><path d="M12 4.5l2.6 7.5L12 19.5 9.4 12z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M12 4.5l2.6 7.5H9.4z" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="#02101f"/></svg>' +
      '</button>';
    document.body.appendChild(w);
    var btn = w.querySelector('.si__btn'), panel = w.querySelector('.si__panel'), ol = w.querySelector('.si__list'), toast = w.querySelector('.si__toast'), prog = w.querySelector('.si__prog');
    var C = 2 * Math.PI * 25; prog.style.strokeDasharray = C; prog.style.strokeDashoffset = C;
    ol.innerHTML = secs.map(function (s, i) { return '<li><a href="#' + s.el.id + '" data-i="' + i + '"><i></i><span></span></a></li>'; }).join('');

    /* computer: puntini */
    var rail = document.createElement('nav'); rail.className = 'si-rail'; rail.setAttribute('aria-label', 'Indice della pagina');
    rail.innerHTML = '<ol>' + secs.map(function (s, i) { return '<li><a href="#' + s.el.id + '" data-i="' + i + '"><span></span></a></li>'; }).join('') + '</ol><div class="si-rail__now" aria-hidden="true"></div>';
    document.body.appendChild(rail);
    var railNow = rail.querySelector('.si-rail__now');

    function texts() {
      var d = T[en() ? 'en' : 'it'];
      w.querySelector('.si__h').textContent = d.title;
      w.querySelector('[data-sit="top"]').textContent = d.top;
      btn.setAttribute('aria-label', d.open); rail.setAttribute('aria-label', d.open);
      ol.querySelectorAll('a').forEach(function (a) { a.querySelector('span').textContent = name(secs[+a.dataset.i]); });
      rail.querySelectorAll('a').forEach(function (a) { var t = name(secs[+a.dataset.i]); a.querySelector('span').textContent = t; a.setAttribute('aria-label', t); });
      if (cur >= 0) railNow.textContent = name(secs[cur]);
    }

    function headerH() { var h = document.querySelector('.sh'); return h ? h.getBoundingClientRect().height : 0; }
    function go(i) {
      var y = i < 0 ? 0 : Math.max(0, secs[i].el.getBoundingClientRect().top + scrollY - headerH() - 10);
      scrollTo({ top: y, behavior: REDUCED ? 'auto' : 'smooth' });
    }

    var cur = -1, toastT = 0, railT = 0, open = false;
    function setOpen(o) {
      open = o; w.classList.toggle('is-open', o); btn.setAttribute('aria-expanded', String(o));
      if (o) { toast.classList.remove('on'); var a = ol.querySelector('[data-i="' + Math.max(cur, 0) + '"]'); if (a) a.scrollIntoView({ block: 'nearest' }); }
    }
    btn.addEventListener('click', function (e) { e.stopPropagation(); setOpen(!open); });
    panel.addEventListener('click', function (e) { e.stopPropagation(); });
    document.addEventListener('click', function () { if (open) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) setOpen(false); });
    w.querySelector('.si__top').addEventListener('click', function () { setOpen(false); go(-1); });
    [ol, rail].forEach(function (box) {
      box.addEventListener('click', function (e) { var a = e.target.closest('a[data-i]'); if (!a) return; e.preventDefault(); setOpen(false); go(+a.dataset.i); });
    });

    function update() {
      var y = scrollY, H = document.documentElement.scrollHeight - innerHeight, p = H > 0 ? Math.min(1, y / H) : 0;
      prog.style.strokeDashoffset = C * (1 - p);
      var mark = y + headerH() + innerHeight * 0.3, i = 0;
      secs.forEach(function (s, k) { if (s.el.getBoundingClientRect().top + y <= mark) i = k; });
      if (p > 0.995) i = secs.length - 1;
      var show = y > innerHeight * 0.6;
      w.classList.toggle('is-on', show); rail.classList.toggle('is-on', show);
      if (!show && open) setOpen(false);
      if (i !== cur) {
        cur = i;
        ol.querySelectorAll('a').forEach(function (a) { var k = +a.dataset.i; a.classList.toggle('is-cur', k === i); a.classList.toggle('is-done', k < i); });
        rail.querySelectorAll('a').forEach(function (a) { var k = +a.dataset.i; a.classList.toggle('is-cur', k === i); a.classList.toggle('is-done', k < i); });
        railNow.textContent = name(secs[i]);
        if (show && !open) {
          toast.querySelector('b').textContent = name(secs[i]);
          toast.querySelector('small').textContent = (i + 1) + '/' + secs.length;
          toast.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { toast.classList.remove('on'); }, 1800);
          rail.classList.add('show-now'); clearTimeout(railT); railT = setTimeout(function () { rail.classList.remove('show-now'); }, 1800);
        }
      }
    }
    var ticking = false;
    addEventListener('scroll', function () { if (ticking) return; ticking = true; requestAnimationFrame(function () { ticking = false; update(); }); }, { passive: true });
    addEventListener('resize', update);
    /* il menu del telefono in alto copre la bussola: la nascondo mentre e' aperto */
    var sh = document.querySelector('.sh');
    if (sh && 'MutationObserver' in window) new MutationObserver(function () { w.classList.toggle('is-hidden', sh.classList.contains('menu-open')); if (sh.classList.contains('menu-open')) setOpen(false); }).observe(sh, { attributes: true, attributeFilter: ['class'] });
    if ('MutationObserver' in window) new MutationObserver(texts).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    texts(); update();
  }
  /* lo script e' defer: la pagina e' gia' costruita; un attimo di attesa per le sezioni riempite dagli script */
  setTimeout(init, 400);
})();
