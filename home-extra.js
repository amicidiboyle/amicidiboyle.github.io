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
    if (!v.getAttribute('src')) v.src = src; /* di solito gia' avviato dallo script in linea */
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

/* Tre porte sotto la hero: leggera inclinazione 3D che segue il puntatore */
(function () {
  if (!window.matchMedia || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.gx').forEach(function (c) {
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      c.style.setProperty('--ry', (x * 7).toFixed(2) + 'deg');
      c.style.setProperty('--rx', (-y * 6).toFixed(2) + 'deg');
      c.classList.add('is-tilting');
    });
    c.addEventListener('pointerleave', function () { c.classList.remove('is-tilting'); });
  });
})();

/* Aree di attivita': schede accessibili, avanzamento automatico finche' nessuno interagisce */
(function () {
  var wrap = document.getElementById('axWrap');
  if (!wrap) return;
  var tabs = Array.prototype.slice.call(wrap.querySelectorAll('.ax-tab'));
  var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
  var cur = 0, timer = null, DUR = 8000, user = false, visible = false;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* numeri presi dalla pagina, cosi' restano veri */
  var nc = document.querySelectorAll('#formazione .course-poster-card').length;
  var np = document.querySelectorAll('#contenuti-articoli article').length;
  if (nc) document.getElementById('axCourses').textContent = nc;
  if (np) document.getElementById('axPubs').textContent = np;

  function show(i, focus) {
    cur = (i + tabs.length) % tabs.length;
    tabs.forEach(function (t, k) {
      var on = k === cur;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      panels[k].hidden = !on;
      panels[k].classList.toggle('is-on', on);
    });
    if (focus) tabs[cur].focus();
    schedule();
  }
  function schedule() {
    clearTimeout(timer);
    var auto = !user && visible && !reduce;
    wrap.classList.toggle('is-auto', auto);
    if (auto) {
      /* riavvia la barra di avanzamento */
      var bar = tabs[cur].querySelector('.ax-bar');
      bar.style.display = 'none'; void bar.offsetWidth; bar.style.display = '';
      timer = setTimeout(function () { show(cur + 1); }, DUR);
    }
  }
  function stop() { user = true; schedule(); }
  tabs.forEach(function (t, k) {
    t.addEventListener('click', function () { stop(); show(k); });
    t.addEventListener('keydown', function (e) {
      var d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (e.key === 'Home') d = -cur; if (e.key === 'End') d = tabs.length - 1 - cur;
      if (d === undefined) return;
      e.preventDefault(); stop(); show(cur + d, true);
    });
  });
  wrap.addEventListener('pointerenter', function () { if (!user) { clearTimeout(timer); wrap.classList.remove('is-auto'); } });
  wrap.addEventListener('pointerleave', function () { if (!user) schedule(); });
  wrap.addEventListener('focusin', stop);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; schedule(); }, { threshold: .45 }).observe(wrap);
  }
})();

/* Ricerca: risalita dall'abisso a Marte guidata dallo scorrimento */
(function () {
  var sec = document.getElementById('ricerca');
  var track = document.getElementById('rxTrack');
  if (!sec || !track) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clipOk = window.CSS && CSS.supports && CSS.supports('overflow', 'clip');
  if (reduce || !clipOk || window.innerHeight < 480) return; /* resta la versione a schede impilate */
  sec.classList.add('rx2-on');

  var stage = document.getElementById('rxStage');
  var sea = document.getElementById('rxSea'), sky = document.getElementById('rxSky');
  var ridge = document.getElementById('rxRidge'), mars = document.getElementById('rxMars');
  var val = document.getElementById('rxVal'), unit = document.getElementById('rxUnit'), env = document.getElementById('rxEnv');
  var mark = document.getElementById('rxMark');
  var panels = sec.querySelectorAll('.rx2-panel'), dots = sec.querySelectorAll('.rx2-dots button');
  var cv = document.getElementById('rxCanvas'), ctx = cv.getContext('2d');
  var W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  var p = 0, active = -1, inView = false, raf = 0, seaTop = 0;

  var TXT = {
    it: { under: 'Sotto la superficie', surf: 'In superficie', alt: 'In quota', orbit: 'Verso l’orbita', iss: 'Orbita bassa · ISS', mars: 'Superficie di Marte', marsV: 'Marte' },
    en: { under: 'Below the surface', surf: 'At the surface', alt: 'At altitude', orbit: 'Towards orbit', iss: 'Low Earth orbit · ISS', mars: 'Surface of Mars', marsV: 'Mars' }
  };
  function lang() { try { return sessionStorage.getItem('boyle_lang') === 'en' ? 'en' : 'it'; } catch (e) { return 'it'; } }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function seg(x, a, b) { return clamp((x - a) / (b - a), 0, 1); }
  function fmt(n, d) { var s = n.toFixed(d); return lang() === 'it' ? s.replace('.', ',') : s; }
  function thou(n) { var s = String(Math.round(n)); return s.replace(/\B(?=(\d{3})+(?!\d))/g, lang() === 'it' ? '.' : ','); }

  /* particelle: bolle sott'acqua, stelle in alto */
  var bubbles = [], stars = [];
  function seed() {
    bubbles = []; stars = [];
    var nb = W < 700 ? 34 : 60, ns = W < 700 ? 90 : 170;
    for (var i = 0; i < nb; i++) bubbles.push({ x: Math.random() * W, y: Math.random() * H, r: 1.5 + Math.random() * 4.5, v: .3 + Math.random() * .9, w: Math.random() * 6.28 });
    for (var j = 0; j < ns; j++) stars.push({ x: Math.random() * W, y: Math.random() * H * 1.6, r: Math.random() * 1.3 + .3, t: Math.random() * 6.28 });
  }
  function size() {
    W = stage.clientWidth; H = stage.clientHeight;
    cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    seed();
  }

  function readout() {
    var t = TXT[lang()], v, u, e, y;
    if (p < .42) { var d = 40 * (1 - p / .42); v = (d < .5 ? '0' : '−' + Math.round(d)) + ' m'; u = fmt(1 + d / 10, 1) + ' ATA'; e = d < .5 ? t.surf : t.under; y = 100 - 28 * (p / .42); }
    else if (p < .7) { var h = 8848 * seg(p, .44, .7); v = thou(h) + ' m'; u = fmt(Math.exp(-h / 7900), 2) + ' ATA'; e = h < 30 ? t.surf : t.alt; y = 72 - 12 * seg(p, .42, .7); }
    else if (p < .92) { var k = 8.8 + (408 - 8.8) * seg(p, .7, .9); v = thou(k) + ' km'; u = k > 40 ? '≈ 0 ATA' : fmt(Math.exp(-k * 1000 / 7900), 3) + ' ATA'; e = k > 400 ? t.iss : t.orbit; y = 60 - 30 * seg(p, .7, .92); }
    else { v = t.marsV; u = fmt(.006, 3) + ' atm'; e = t.mars; y = 30 - 30 * seg(p, .92, 1); }
    if (val.textContent !== v) val.textContent = v;
    if (unit.textContent !== u) unit.textContent = u;
    if (env.textContent !== e) env.textContent = e;
    mark.style.top = y.toFixed(2) + '%';
  }

  function layout() {
    /* la superficie del mare scende attraverso lo schermo mentre si risale */
    seaTop = (p - .42) * 2.6 * H + H * .5;
    sea.style.transform = 'translate3d(0,' + seaTop.toFixed(1) + 'px,0)';
    sky.style.opacity = (1 - seg(p, .64, .84)).toFixed(3);
    ridge.style.opacity = seg(p, .4, .5).toFixed(3);
    ridge.style.transform = 'translate3d(0,' + (seg(p, .58, .8) * H * .5).toFixed(1) + 'px,0)';
    mars.style.transform = 'translate3d(0,' + ((1 - seg(p, .8, 1)) * H * .8).toFixed(1) + 'px,0)';
    var i = p < .36 ? 0 : p < .68 ? 1 : 2;
    if (i !== active) {
      active = i;
      panels.forEach(function (el, k) { el.classList.toggle('is-on', k === i); el.inert = k !== i; });
      dots.forEach(function (d, k) { d.classList.toggle('is-on', k === i); });
    }
    readout();
  }

  function draw(ts) {
    ctx.clearRect(0, 0, W, H);
    var sa = seg(p, .6, .82);
    if (sa > 0) {
      var shift = (p - .6) * H * .9;
      for (var j = 0; j < stars.length; j++) {
        var s = stars[j], yy = s.y - H * .6 + shift;
        if (yy < -2 || yy > H) continue;
        ctx.globalAlpha = sa * (.55 + .45 * Math.sin(ts / 700 + s.t));
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s.x, yy, s.r, 0, 6.283); ctx.fill();
      }
    }
    var top = Math.max(0, seaTop + 40);
    if (top < H) {
      ctx.strokeStyle = 'rgba(190,240,255,.7)'; ctx.lineWidth = 1.2;
      for (var i = 0; i < bubbles.length; i++) {
        var b = bubbles[i];
        b.y -= b.v * (1 + b.r * .15); b.w += .03;
        if (b.y < top - 10) { b.y = H + 10; b.x = Math.random() * W; }
        if (b.y < top) continue;
        ctx.globalAlpha = .25 + b.r * .08;
        ctx.beginPath(); ctx.arc(b.x + Math.sin(b.w) * 3, b.y, b.r, 0, 6.283); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  function measure() {
    var r = track.getBoundingClientRect();
    var span = r.height - H;
    p = clamp(-r.top / (span || 1), 0, 1);
  }
  function loop(ts) {
    raf = 0;
    if (!inView) return;
    measure(); layout(); draw(ts || 0);
    raf = requestAnimationFrame(loop);
  }
  function kick() { if (!raf && inView) raf = requestAnimationFrame(loop); }

  size(); measure(); layout();
  window.addEventListener('resize', function () { size(); measure(); layout(); });
  new IntersectionObserver(function (es) { inView = es[0].isIntersecting; kick(); }, { rootMargin: '100px 0px' }).observe(track);

  /* pallini: salta al fronte scelto */
  dots.forEach(function (d) {
    d.addEventListener('click', function () {
      var k = +d.getAttribute('data-go');
      var target = [.12, .54, .88][k];
      var r = track.getBoundingClientRect();
      window.scrollTo({ top: window.scrollY + r.top + target * (r.height - H), behavior: 'smooth' });
    });
  });
  /* al cambio lingua aggiorna subito il quadrante */
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('#langToggle')) setTimeout(readout, 50); });
})();
