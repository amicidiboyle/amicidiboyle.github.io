/* Gli Amici di Boyle · title-fx.js
   Anima i titoli delle sezioni quando entrano nello schermo. Non cambia il testo:
   lo divide in lettere solo durante l'animazione e poi rimette il contenuto originale,
   cosi' il cambio lingua continua a funzionare. */
(function () {
  'use strict';
  if (!('IntersectionObserver' in window) || !document.querySelectorAll) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var SEL = [
    '.section-heading > h2', '.section-heading > h3#pub-h2', '.bb-spotlight-body > h2', '.db-body > h2',
    '.evx-head > h2', '.ev-hero h1', 'main h1:not(#hero-h1-el)', '.podSection__h2', '.podTitle',
    '.members-title', 'h2[data-i18n="r_why_title"]', '.join-card__title', '.hero__title', '[data-tfx]'
  ].join(',');
  var SKIP = 'dialog, [role="dialog"], .modal, [class*="modal"], #evidenza, .podPlayer, .member-card, .profile-hero, .ev-wall, #map-heading, .intro-title';

  function isClipText(el) {
    var c = getComputedStyle(el);
    return (c.webkitBackgroundClip || c.backgroundClip) === 'text' || c.backgroundClip === 'text';
  }

  function split(h) {
    var i = 0;
    function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          if (!n.nodeValue.trim()) return;
          var frag = document.createDocumentFragment();
          n.nodeValue.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); i++; return; }
            var w = document.createElement('span'); w.className = 'tfx-w';
            part.split('').forEach(function (ch) {
              var s = document.createElement('span'); s.className = 'tfx-ch'; s.textContent = ch;
              s.style.setProperty('--i', i++); w.appendChild(s);
            });
            frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR' && n.tagName !== 'SVG' && n.tagName !== 'IMG') {
          /* testo con sfumatura "ritagliata": si rivela in blocco, senza spezzarlo */
          if (isClipText(n) || n.querySelector('svg,img')) {
            n.classList.add('tfx-atom'); n.style.setProperty('--tfx-atom-delay', (0.08 + i * 0.026).toFixed(2) + 's'); i += 4;
          } else walk(n);
        }
      });
    }
    walk(h);
    return i;
  }

  function play(h) {
    if (h.__tfxDone) return;
    h.__tfxDone = true;
    var kick = h.__tfxKick;
    if (kick) kick.classList.add('tfx-kick-on');
    var original = Array.prototype.map.call(h.childNodes, function (n) { return n.cloneNode(true); });
    var lang = document.documentElement.lang;
    if (isClipText(h)) {
      h.classList.add('tfx-atom');
    } else {
      var n = split(h);
      /* titoli lunghi: passo piu' breve, cosi' la durata resta simile */
      h.style.setProperty('--tfx-step', Math.max(10, Math.min(26, 900 / Math.max(n, 1))).toFixed(0) + 'ms');
    }
    h.classList.remove('tfx-pre');
    h.classList.add('tfx-play');
    setTimeout(function () {
      h.classList.remove('tfx-play');
      if (h.classList.contains('tfx-atom') && !h.querySelector('.tfx-ch')) { h.classList.remove('tfx-atom'); return; }
      /* se nel frattempo e' cambiata la lingua, il testo nuovo e' gia' al suo posto */
      if (!h.querySelector('.tfx-ch') || document.documentElement.lang !== lang) return;
      h.textContent = '';
      original.forEach(function (n) { h.appendChild(n); });
    }, 2600);
  }

  function init() {
    var els = Array.prototype.filter.call(document.querySelectorAll(SEL), function (h) {
      return !h.closest(SKIP) && h.textContent.trim().length > 1;
    });
    if (!els.length) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { io.unobserve(e.target); play(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.2 });
    els.forEach(function (h) {
      var r = h.getBoundingClientRect();
      var prev = h.previousElementSibling;
      if (prev && /kicker/.test(prev.className) && !prev.classList.contains('tfx-kick') && r.top > innerHeight) {
        prev.classList.add('tfx-kick'); h.__tfxKick = prev;
      }
      /* i titoli gia' visibili all'apertura partono subito, gli altri quando arrivano */
      if (r.top < innerHeight && r.bottom > 0) { play(h); return; }
      h.classList.add('tfx-pre');
      io.observe(h);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
