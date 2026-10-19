/* Gli Amici di Boyle · fondatori a ventaglio (founders-deck.js)
   Trasforma la griglia dei fondatori in un mazzo di carte tenuto in mano.
   Clic o Invio su una carta: esce dal mazzo e va in primo piano.
   Secondo clic, ✕, Esc o clic fuori: torna al suo posto.
   Frecce sinistra/destra: passa alla carta accanto. */
(function () {
  'use strict';
  var grid = document.querySelector('#fondatori .founders-grid');
  if (!grid) return;
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.founder-card'));
  var n = cards.length;
  if (n < 2) return;

  var en = false;
  try { en = (sessionStorage.getItem('boyle_lang') || 'it') === 'en'; } catch (e) {}
  var T = en
    ? { hint: 'Tap a card to draw it from the deck', close: 'Put the card back', open: 'Show card: ' }
    : { hint: 'Tocca una carta per estrarla dal mazzo', close: 'Rimetti la carta nel mazzo', open: 'Mostra la carta di ' };

  grid.classList.add('is-deck');
  var hint = document.createElement('p');
  hint.className = 'deck-hint';
  hint.textContent = T.hint;
  grid.parentNode.insertBefore(hint, grid.nextSibling);

  var picked = -1;

  cards.forEach(function (c, i) {
    c.classList.add('is-visible');
    c.setAttribute('tabindex', '0');
    c.setAttribute('role', 'button');
    c.setAttribute('aria-expanded', 'false');
    var name = (c.querySelector('h3') || {}).textContent || '';
    c.setAttribute('aria-label', T.open + name.trim());
    var x = document.createElement('button');
    x.type = 'button'; x.className = 'deck-close';
    x.setAttribute('aria-label', T.close); x.textContent = '✕';
    x.addEventListener('click', function (e) { e.stopPropagation(); pick(-1); c.focus(); });
    c.appendChild(x);

    c.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;              // il link LinkedIn resta un link
      pick(picked === i ? -1 : i);
    });
    c.addEventListener('keydown', function (e) {
      if (e.target !== c) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(picked === i ? -1 : i); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        var j = (i + (e.key === 'ArrowRight' ? 1 : -1) + n) % n;
        cards[j].focus();
        if (picked !== -1) pick(j);
      }
    });
  });

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && picked !== -1) pick(-1); });
  document.addEventListener('click', function (e) { if (picked !== -1 && !grid.contains(e.target)) pick(-1); });
  grid.addEventListener('click', function (e) { if (e.target === grid && picked !== -1) pick(-1); });

  /* scorrimento orizzontale su telefono: passa alla carta accanto */
  var sx = null, sy = null;
  grid.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  grid.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    sx = null;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
    var base = picked === -1 ? Math.floor(n / 2) : picked;
    pick((base + (dx < 0 ? 1 : -1) + n) % n);
  }, { passive: true });

  function pick(i) {
    picked = i;
    grid.classList.toggle('has-pick', i !== -1);
    cards.forEach(function (c, k) {
      c.classList.toggle('is-picked', k === i);
      c.setAttribute('aria-expanded', String(k === i));
    });
    layout();
  }

  function layout() {
    var w = grid.clientWidth;
    var mobile = w < 560;
    var cardW = mobile ? Math.min(Math.round(w * 0.56), 230) : 250;
    var cardH = mobile ? Math.round(cardW * 1.5) : 350;
    var spread = mobile ? 9 : 11;                     // gradi tra una carta e l'altra
    var step = mobile ? Math.min(34, (w - cardW) / (n - 1)) : 64;
    var pickS = mobile ? Math.min(1.28, (w - 24) / cardW) : 1.18;
    grid.style.setProperty('--card-w', cardW + 'px');
    grid.style.setProperty('--card-h', cardH + 'px');
    grid.style.setProperty('--pick-s', pickS.toFixed(3));
    grid.style.setProperty('--pick-y', -Math.round(cardH * (pickS - 1) / 2 + 24) + 'px');
    grid.style.setProperty('--deck-h', Math.round(cardH * pickS + 120) + 'px');

    var mid = (n - 1) / 2;
    cards.forEach(function (c, k) {
      var d = k - mid;
      // con una carta estratta le altre si aprono un po' per farle spazio
      var open = picked !== -1 ? 1.25 : 1;
      c.style.setProperty('--r', (d * spread * open).toFixed(2) + 'deg');
      c.style.setProperty('--x', (d * step * open).toFixed(1) + 'px');
      c.style.setProperty('--y', (Math.abs(d) * Math.abs(d) * (mobile ? 5 : 7)).toFixed(1) + 'px');
      c.style.setProperty('--s', '1');
      c.style.setProperty('--z', String(10 - Math.round(Math.abs(d) * 2)));
    });
  }

  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(layout, 120); });
  layout();
})();
