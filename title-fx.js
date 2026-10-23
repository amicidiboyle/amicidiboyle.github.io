/* Gli Amici di Boyle · sistema di movimento (title-fx.js)
   Vedi title-fx.css per i principi. Qui:
   - i titoli vengono divisi in parole (solo i nodi di testo: link, corsivi e colori restano);
   - le card che arrivano sullo schermo insieme entrano in cascata, da sinistra a destra;
   - le immagini dentro le card si svelano solo quando sono davvero caricate;
   - i numeri chiave contano fino al loro valore. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* le vecchie entrate sono spente in CSS: segno tutto come gia' visibile, cosi' anche gli
     effetti al passaggio del mouse tornano a funzionare, e tolgo i ritardi a cascata
     rimasti attaccati agli elementi (rallentavano anche l'hover) */
  var LEGACY = '.reveal, .reveal-left, .reveal-right, .reveal-scale, .info-card, .activity-card, .founder-card, .glass-card, .section-heading, .member-card, .content-card, .research-showcase-grid > *, .contact-grid-visible > *';
  function legacyOff(root) {
    (root || d).querySelectorAll(LEGACY).forEach(function (el) {
      el.classList.add('is-visible');
      if (el.style.transitionDelay) el.style.transitionDelay = '';
    });
  }
  legacyOff();

  var bar = d.createElement('div'); bar.className = 'ms-progress'; bar.setAttribute('aria-hidden', 'true');
  d.body.appendChild(bar);

  if (reduce || !('IntersectionObserver' in window)) return;

  var mobile = innerWidth < 700;
  var STEP = mobile ? 0.06 : 0.09;

  var TITLES = [
    '.section-heading > h2', '.section-heading > h3#pub-h2', '.bb-spotlight-body > h2', '.db-body > h2',
    '.evx-head > h2', 'main h1:not(#hero-h1-el)', '.podSection__h2', '.podTitle',
    '.members-title', 'h2[data-i18n="r_why_title"]', '.join-card__title', '.hero__title',
    '#proponi h2', '#esplora > h2', '[data-tfx]', '.bb-hero h1', '.db-hero h1'
  ].join(',');
  var SKIP_T = 'dialog, [role="dialog"], .modal, [class*="modal"], #evidenza, .podPlayer, .member-card, .profile-hero, .ev-wall, .intro-title, #home, .gx';
  var SKIP_C = 'dialog, [role="dialog"], [class*="modal"], header, footer, nav, #home, #ricerca, #attivita, .ticker' + (innerWidth >= 769 ? ', .founders-grid' : '');

  /* ── osservatore unico ── */
  var queue = [], qTimer = 0;
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      queue.push(e.target);
    });
    if (queue.length && !qTimer) qTimer = requestAnimationFrame(flush);
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });

  function flush() {
    qTimer = 0;
    var batch = queue.splice(0);
    /* ordine di lettura: dall'alto in basso, da sinistra a destra */
    batch.sort(function (a, b) {
      var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      return Math.abs(ra.top - rb.top) > 40 ? ra.top - rb.top : ra.left - rb.left;
    });
    var n = 0;
    batch.forEach(function (el) {
      var f = el.__ms; if (!f) return;
      el.__ms = null;
      f(el.__msTitle ? 0 : Math.min(n++, 6) * STEP);
    });
  }
  function watch(el, fn, isTitle) { el.__ms = fn; el.__msTitle = !!isTitle; io.observe(el); }

  /* rete di sicurezza: scorrimenti velocissimi o pagine che si allungano mentre caricano */
  var sweeping = false;
  function sweep() {
    sweeping = false;
    d.querySelectorAll('.ms-t-pre, .ms-c-pre').forEach(function (el) {
      if (el.__ms && el.getBoundingClientRect().top < innerHeight * 0.9) { io.unobserve(el); queue.push(el); }
    });
    if (queue.length) flush();
  }
  addEventListener('scroll', function () { if (!sweeping) { sweeping = true; setTimeout(sweep, 160); } }, { passive: true });

  /* ── titoli ── */
  function isClipText(el) {
    var cs = getComputedStyle(el);
    return (cs.backgroundClip || cs.webkitBackgroundClip || '').indexOf('text') > -1 || (cs.webkitBackgroundClip || '').indexOf('text') > -1;
  }
  function wrapUnit(node, i) {
    var w = d.createElement('span'); w.className = 'msw';
    var inner = d.createElement('span'); inner.className = 'msi'; inner.style.setProperty('--i', i);
    w.appendChild(inner);
    node.parentNode.insertBefore(w, node);
    inner.appendChild(node);
  }
  function splitWords(h) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var parts = c.nodeValue.split(/(\s+)/);
          if (parts.length === 1 && !parts[0].trim()) return;
          var frag = d.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (!p.trim()) { frag.appendChild(d.createTextNode(p)); return; }
            var w = d.createElement('span'); w.className = 'msw';
            var inner = d.createElement('span'); inner.className = 'msi'; inner.style.setProperty('--i', i++);
            inner.textContent = p; w.appendChild(inner); frag.appendChild(w);
          });
          node.replaceChild(frag, c);
        } else if (c.nodeType === 1 && c.tagName !== 'BR') {
          if (isClipText(c) || /^(IMG|SVG|svg|I)$/.test(c.tagName)) wrapUnit(c, i++);
          else walk(c);
        }
      });
    })(h);
    return i;
  }
  function companions(h) {
    var out = [];
    var prev = h.previousElementSibling;
    if (prev && /^(P|SPAN|DIV|SMALL)$/.test(prev.tagName) && prev.textContent.trim().length < 60 && !prev.querySelector('img,svg,canvas')) out.push([prev, 0]);
    var next = h.nextElementSibling, k = 0, max = h.tagName === 'H1' ? 3 : 1;
    while (next && k < max) {
      if (next.matches(SKIP_C) || next.querySelector('canvas, video, iframe')) break;
      if (next.tagName === 'P' || h.tagName === 'H1') out.push([next, 0.28 + k * 0.12]);
      else break;
      next = next.nextElementSibling; k++;
    }
    return out;
  }
  function prepTitle(h, now) {
    if (h.__msDone || h.closest(SKIP_T)) return;
    h.__msDone = true;
    var whole = isClipText(h);
    var words = whole ? 0 : splitWords(h);
    var mode = words ? 't' : 'whole';
    h.classList.add(mode === 't' ? 'ms-t-pre' : 'ms-whole-pre');
    var comp = companions(h);
    comp.forEach(function (c) { c[0].classList.add('ms-f-pre'); });
    var head = h.parentElement && h.parentElement.classList.contains('section-heading') ? h.parentElement : null;
    if (head) head.classList.add('ms-bar-pre');
    function play() {
      if (head) { head.classList.add('ms-bar-on'); }
      if (mode === 't') {
        h.classList.add('ms-t-on');
        setTimeout(function () { h.classList.add('ms-t-done'); }, 1100 + words * 45);
      } else h.classList.add('ms-whole-on');
      comp.forEach(function (c) {
        c[0].style.setProperty('--ms-d', (c[1] + Math.min(words, 10) * 0.025).toFixed(2) + 's');
        c[0].classList.add('ms-f-on');
        setTimeout(function () { c[0].classList.remove('ms-f-pre', 'ms-f-on'); c[0].style.removeProperty('--ms-d'); }, 1800);
      });
    }
    if (now) requestAnimationFrame(function () { requestAnimationFrame(play); });
    else watch(h, play, true);
  }

  /* ── card ── */
  function findCards(root) {
    var sel = '[class*="card"], article, .evx-mini, [class*="glass-chip"]';
    var c = Array.prototype.filter.call(root.querySelectorAll(sel), function (el) {
      if (el.__msCard || el.closest(SKIP_C)) return false;
      var p = el.parentElement; if (!p) return false;
      var cls = el.classList[0];
      var sib = 0;
      for (var x = p.firstElementChild; x; x = x.nextElementSibling) if (x !== el && x.tagName === el.tagName && x.classList[0] === cls) sib++;
      if (!sib) return false;
      var r = el.getBoundingClientRect();
      return r.height > 60 && r.width > 110;
    });
    return c.filter(function (el) { return !c.some(function (o) { return o !== el && o.contains(el); }); });
  }
  function imagesIn(card) {
    return Array.prototype.filter.call(card.querySelectorAll('img'), function (im) {
      var r = im.getBoundingClientRect();
      return r.width > 56 && r.height > 56 && !im.closest('.partner-logo, [class*="logo"]');
    });
  }
  function revealImg(im, delay) {
    var round = parseFloat(getComputedStyle(im).borderTopLeftRadius) >= im.getBoundingClientRect().width * 0.4;
    if (round) im.classList.add('ms-i-round');
    im.classList.add('ms-i-pre');
    var go = function () {
      if (im.__msGo) return; im.__msGo = true;
      im.style.setProperty('--ms-d', delay.toFixed(2) + 's');
      requestAnimationFrame(function () {
        im.classList.add('ms-i-on');
        setTimeout(function () { im.classList.remove('ms-i-pre', 'ms-i-on', 'ms-i-round'); im.style.removeProperty('--ms-d'); }, 1700 + delay * 1000);
      });
    };
    if (im.complete && im.naturalWidth) go();
    else {
      if (im.loading === 'lazy') im.loading = 'eager';
      im.addEventListener('load', go, { once: true });
      im.addEventListener('error', go, { once: true });
      setTimeout(go, 1600);
    }
  }
  function prepCards(root, allowInView) {
    findCards(root).forEach(function (el) {
      var top = el.getBoundingClientRect().top;
      if (!allowInView && top < innerHeight) { el.__msCard = true; return; }
      el.__msCard = true;
      el.classList.add('ms-c-pre');
      watch(el, function (delay) {
        el.style.setProperty('--ms-d', delay.toFixed(2) + 's');
        imagesIn(el).forEach(function (im) { revealImg(im, delay + 0.12); });
        el.classList.add('ms-c-on');
        setTimeout(function () { el.classList.remove('ms-c-pre', 'ms-c-on'); el.style.removeProperty('--ms-d'); }, 1300 + delay * 1000);
      });
    });
  }

  /* ── numeri ── */
  function countUp(el, delay) {
    var raw = el.textContent.trim();
    var m = raw.match(/^(\D*)([\d.]+)(\D*)$/);
    if (!m) return;
    var target = parseInt(m[2].replace(/\./g, ''), 10);
    if (!target || (target > 1900 && target < 2100 && !m[3])) return;
    var dots = m[2].indexOf('.') > -1;
    el.classList.add('ms-count');
    var fmt = function (v) { var s = String(v); return dots ? s.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : s; };
    el.textContent = m[1] + fmt(0) + m[3];
    setTimeout(function () {
      var t0 = performance.now(), dur = 1700;
      (function tick(t) {
        var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(2, -10 * p);
        el.textContent = m[1] + fmt(p >= 1 ? target : Math.round(target * e)) + m[3];
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }, delay * 1000);
  }
  function prepCounts() {
    d.querySelectorAll('.hero-stats .stat-num, .db-stats b, #diving-boyle-home b').forEach(function (el) {
      if (el.__msN || !/\d/.test(el.textContent) || el.textContent.trim().length > 10) return;
      el.__msN = true;
      var hero = !!el.closest('#home');
      var cio = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return;
        cio.disconnect();
        countUp(el, hero ? 0.9 : 0.25);
      }, { threshold: 0.6 });
      cio.observe(el);
    });
  }

  function init() {
    d.querySelectorAll(TITLES).forEach(function (h) {
      var r = h.getBoundingClientRect();
      if (!r.height) return;
      prepTitle(h, r.top < innerHeight * 0.95);
    });
    prepCards(d, true);
    prepCounts();
    /* contenuti caricati dopo (membri della Rete, episodi, archivio): solo quelli ancora sotto lo schermo */
    var later = function () { legacyOff(); prepCards(d, false); };
    addEventListener('load', function () { setTimeout(later, 200); });
    setTimeout(later, 2500);
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init); else init();
})();
