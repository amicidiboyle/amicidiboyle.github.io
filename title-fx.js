/* Gli Amici di Boyle · title-fx.js
   1) i titoli delle sezioni entrano rapidi da sinistra quando arrivano sullo schermo;
   2) i blocchi che non avevano un'entrata (card di pubblicazioni, stampa, partner,
      archivio eventi, ecc.) compaiono in sequenza.
   Il testo non viene mai modificato, quindi il cambio lingua continua a funzionare. */
(function () {
  'use strict';
  if (!('IntersectionObserver' in window) || !document.querySelectorAll) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var TITLES = [
    '.section-heading > h2', '.section-heading > h3#pub-h2', '.bb-spotlight-body > h2', '.db-body > h2',
    '.evx-head > h2', 'main h1:not(#hero-h1-el)', '.podSection__h2', '.podTitle',
    '.members-title', 'h2[data-i18n="r_why_title"]', '.join-card__title', '.hero__title',
    '#proponi h2', '#esplora > h2', '[data-tfx]'
  ].join(',');
  var SKIP = 'dialog, [role="dialog"], .modal, [class*="modal"], #evidenza, .podPlayer, .member-card, .profile-hero, .ev-wall, .intro-title, #home';

  /* blocchi da far entrare, raggruppati: gli elementi dello stesso gruppo arrivano uno dopo l'altro */
  var BLOCKS = [
    '#contenuti-articoli .articoli-grid > article',
    '#dicono-di-noi .articoli-grid > article',
    '#partner .partner-grid > *',
    '#evxArchive > .evx-mini',
    '#proponi .ev-propose__inner > *:not(h2)',
    '.hero__subtitle', '.hero__cta',
    '.join-grid > .join-card',
    '.bb-hero-sub',
    '#esplora > p', '#esplora > .real-map-wrap'
  ];

  var pending = [];
  function trigger(el) {
    var k = pending.indexOf(el);
    if (k < 0) return;
    pending.splice(k, 1);
    io.unobserve(el);
    if (el.__tfx) playTitle(el); else showBlock(el);
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) trigger(e.target); });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  function watch(el) { pending.push(el); io.observe(el); }

  /* rete di sicurezza: tutto cio' che e' gia' salito sopra il bordo basso dello schermo
     viene mostrato comunque (scorrimenti molto rapidi, pagine che si allungano caricando immagini) */
  var sweeping = false;
  function sweep() {
    sweeping = false;
    pending.slice().forEach(function (el) {
      if (el.getBoundingClientRect().top < innerHeight * 0.92) trigger(el);
    });
  }
  window.addEventListener('scroll', function () {
    if (!sweeping && pending.length) { sweeping = true; requestAnimationFrame(sweep); }
  }, { passive: true });
  window.addEventListener('load', function () { setTimeout(sweep, 300); });

  function playTitle(h) {
    if (h.__tfxKick) h.__tfxKick.classList.add('tfx-kick-on');
    h.classList.remove('tfx-pre');
    h.classList.add('tfx-play');
    /* a fine animazione si tolgono le classi: il titolo torna un elemento normale */
    setTimeout(function () { h.classList.remove('tfx-play'); }, 900);
  }

  /* a entrata finita si tolgono le classi, cosi' gli effetti al passaggio del mouse delle card tornano a funzionare */
  function showBlock(el) {
    el.classList.add('efx-in');
    var delay = 700 + (parseInt(el.style.getPropertyValue('--efx-i'), 10) || 0) * 70;
    setTimeout(function () { el.classList.remove('efx', 'efx-in'); el.style.removeProperty('--efx-i'); }, delay);
  }

  function inView(el) {
    var r = el.getBoundingClientRect();
    return r.top < innerHeight && r.bottom > 0;
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll(TITLES), function (h) {
      if (h.closest(SKIP) || h.textContent.trim().length < 2 || h.__tfx) return;
      h.__tfx = true;
      var prev = h.previousElementSibling;
      if (prev && /kicker|label/.test(prev.className) && !inView(h)) { prev.classList.add('tfx-kick'); h.__tfxKick = prev; }
      if (inView(h)) { playTitle(h); return; }
      h.classList.add('tfx-pre');
      watch(h);
    });

    BLOCKS.forEach(function (sel) {
      var group = Array.prototype.filter.call(document.querySelectorAll(sel), function (el) {
        return !el.closest('.reveal, .reveal-left, .reveal-right') && !el.classList.contains('efx');
      });
      group.forEach(function (el, i) {
        el.style.setProperty('--efx-i', Math.min(i, 6));
        el.classList.add('efx');
        if (inView(el)) { requestAnimationFrame(function () { requestAnimationFrame(function () { showBlock(el); }); }); }
        else watch(el);
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
