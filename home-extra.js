/* Gli Amici di Boyle · home-extra.js
   1) titolo hero animato ("risalita" lettera per lettera + rivelazione dell'accento)
   2) countdown e stato automatico delle card "Prossimi appuntamenti" */
(function () {
  'use strict';

  var TITLES = {
    it: ['Medicina degli', 'ambienti estremi'],
    en: ['Medicine of', 'Extreme Environments']
  };

  function esc(c) {
    return c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c;
  }

  function buildLine(text, startIndex) {
    var i = startIndex;
    var words = text.split(' ').map(function (w) {
      var chars = w.split('').map(function (c) {
        return '<span class="ht-ch" style="--i:' + (i++) + '">' + esc(c) + '</span>';
      }).join('');
      i++; /* piccola pausa tra le parole */
      return '<span class="ht-word">' + chars + '</span>';
    });
    return { html: words.join(' '), next: i };
  }

  function heroTitle(lang) {
    var h1 = document.getElementById('hero-h1-el');
    if (!h1) return;
    lang = TITLES[lang] ? lang : 'it';
    if (h1.getAttribute('data-ht-lang') === lang) { updateCountdowns(lang); return; }
    h1.setAttribute('data-ht-lang', lang);
    var t = TITLES[lang];
    var l1 = buildLine(t[0], 0);
    h1.setAttribute('aria-label', t[0] + ' ' + t[1]);
    h1.style.setProperty('--ht-accent-delay', (0.25 + l1.next * 0.034).toFixed(2) + 's');
    h1.innerHTML =
      '<span class="ht-line" aria-hidden="true">' + l1.html + '</span><br>' +
      '<span class="accent ht-accent" aria-hidden="true"><span class="ht-accent-in">' + esc(t[1]) + '</span></span>';
    h1.classList.remove('ht-play');
    void h1.offsetWidth; /* riavvia l'animazione al cambio lingua */
    h1.classList.add('ht-ready', 'ht-play');
    updateCountdowns(lang);
  }

  /* ---------- countdown appuntamenti ---------- */
  var L = {
    it: { today: 'Oggi', tomorrow: 'Domani', live: 'In corso', past: 'Concluso', days: function (n) { return 'Tra ' + n + ' giorni'; } },
    en: { today: 'Today', tomorrow: 'Tomorrow', live: 'Happening now', past: 'Ended', days: function (n) { return 'In ' + n + ' days'; } }
  };

  function updateCountdowns(lang) {
    var cards = document.querySelectorAll('.appt-card[data-start]');
    if (!cards.length) return;
    var txt = L[lang] || L.it;
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var grid = cards[0].parentNode;
    var past = [];
    Array.prototype.forEach.call(cards, function (card) {
      var start = new Date(card.getAttribute('data-start'));
      var end = new Date(card.getAttribute('data-end') || card.getAttribute('data-start'));
      var label = card.querySelector('.appt-countdown');
      if (isNaN(start.getTime())) return;
      var startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      var diff = Math.round((startDay - today) / 86400000);
      var state, text;
      if (now > end) { state = 'past'; text = txt.past; }
      else if (now >= start) { state = 'live'; text = txt.live; }
      else if (diff <= 0) { state = 'soon'; text = txt.today; }
      else if (diff === 1) { state = 'soon'; text = txt.tomorrow; }
      else { state = diff <= 14 ? 'soon' : 'future'; text = txt.days(diff); }
      card.setAttribute('data-state', state);
      card.classList.toggle('appt-card--past', state === 'past');
      if (label) label.textContent = text;
      if (state === 'past') past.push(card);
    });
    /* gli eventi conclusi scivolano in fondo */
    past.forEach(function (c) { grid.appendChild(c); });
  }

  /* ---------- pallini del carosello mobile ---------- */
  function initDots() {
    var grid = document.querySelector('.appt-grid');
    var dots = document.querySelectorAll('.appt-dots span');
    if (!grid || !dots.length) return;
    var ticking = false;
    grid.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var cards = grid.querySelectorAll('.appt-card');
        var left = grid.getBoundingClientRect().left;
        var best = 0, bestDist = Infinity;
        Array.prototype.forEach.call(cards, function (c, i) {
          var d = Math.abs(c.getBoundingClientRect().left - left - parseFloat(getComputedStyle(grid).paddingLeft || 0));
          if (d < bestDist) { bestDist = d; best = i; }
        });
        Array.prototype.forEach.call(dots, function (d, i) { d.classList.toggle('is-on', i === best); });
      });
    }, { passive: true });
  }

  window.boyleHeroTitle = heroTitle;

  function currentLang() {
    try { return sessionStorage.getItem('boyle_lang') || 'it'; } catch (e) { return 'it'; }
  }

  function init() {
    var h1 = document.getElementById('hero-h1-el');
    /* se lo script lingue non ha ancora disegnato il titolo, lo facciamo noi */
    if (h1 && !h1.classList.contains('ht-ready')) heroTitle(currentLang());
    else updateCountdowns(currentLang());
    initDots();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

/* Video di sfondo della hero: caricato solo se ha senso farlo */
(function () {
  'use strict';
  function start() {
    var v = document.getElementById('heroVideo');
    if (!v) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var conn = navigator.connection || {};
    if (reduce || conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '')) return; /* resta l'immagine fissa */
    var mobile = window.matchMedia('(max-width: 768px)').matches;
    var webm = !!v.canPlayType('video/webm; codecs="vp9"');
    var src = mobile ? v.getAttribute(webm ? 'data-mobile-webm' : 'data-mobile')
                     : v.getAttribute(webm ? 'data-webm' : 'data-mp4');
    v.src = src;
    v.muted = true;
    v.addEventListener('playing', function () {
      v.classList.add('is-on');
      var hero = v.closest('.hero'); if (hero) hero.classList.add('has-video');
      document.documentElement.classList.add('hero-video-on');
    }, { once: true });
    var p = v.play();
    if (p && p.catch) p.catch(function () { /* autoplay bloccato: resta il poster */ });
    /* fuori schermo il video si ferma, per non consumare batteria */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { v.play().catch(function () {}); } else { v.pause(); } });
      }, { threshold: 0.05 }).observe(v);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
