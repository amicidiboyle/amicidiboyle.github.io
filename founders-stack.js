/* Gli Amici di Boyle · fondatori in pila (founders-stack.js)
   Le carte sono sovrapposte in fila. Passando con il dito (o con il mouse)
   sulla pila, la carta sotto il dito sale in primo piano e si legge tutta;
   le vicine si scostano. Tocco o clic aprono la carta, frecce sinistra/destra
   passano alla carta accanto. */
(function () {
  'use strict';
  var grid = document.querySelector('#fondatori .founders-grid');
  if (!grid) return;
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.founder-card'));
  var n = cards.length;
  if (n < 2) return;

  var en = false;
  try { en = (sessionStorage.getItem('boyle_lang') || 'it') === 'en'; } catch (e) {}
  var hintText = en ? 'Slide your finger across the cards' : 'Scorri il dito sulle carte';
  var hintDesk = en ? 'Move across the cards' : 'Passa sulle carte';

  grid.classList.add('is-stack');
  var dots = document.createElement('div');
  dots.className = 'stack-dots'; dots.setAttribute('aria-hidden', 'true');
  cards.forEach(function () { dots.appendChild(document.createElement('span')); });
  var hint = document.createElement('p');
  hint.className = 'stack-hint';
  grid.parentNode.insertBefore(dots, grid.nextSibling);
  grid.parentNode.insertBefore(hint, dots.nextSibling);

  var open = 0, geo = null;

  cards.forEach(function (c, i) {
    c.classList.add('is-visible');
    c.setAttribute('tabindex', '0');
    c.addEventListener('click', function (e) { if (!e.target.closest('a')) set(i); });
    c.addEventListener('focus', function () { set(i); });
    c.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        cards[(i + (e.key === 'ArrowRight' ? 1 : -1) + n) % n].focus();
      }
    });
  });

  /* indice della carta sotto il dito: si guarda la "costola" visibile */
  function indexAt(clientX) {
    var r = grid.getBoundingClientRect();
    var x = clientX - r.left - geo.offset;
    var k = Math.floor(x / geo.step);
    return Math.max(0, Math.min(n - 1, k));
  }

  /* mouse: basta passare sopra */
  grid.addEventListener('mousemove', function (e) { if (geo) set(indexAt(e.clientX)); });

  /* dito: trascinando in orizzontale si sfogliano; in verticale la pagina scorre */
  var tx = null, ty = null, scrubbing = false;
  grid.addEventListener('touchstart', function (e) {
    tx = e.touches[0].clientX; ty = e.touches[0].clientY; scrubbing = false;
  }, { passive: true });
  grid.addEventListener('touchmove', function (e) {
    if (tx === null) return;
    var t = e.touches[0], dx = t.clientX - tx, dy = t.clientY - ty;
    if (!scrubbing && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) scrubbing = true;
    if (scrubbing) { e.preventDefault(); set(indexAt(t.clientX)); }
  }, { passive: false });
  grid.addEventListener('touchend', function () { tx = null; scrubbing = false; }, { passive: true });

  function set(i) {
    if (i === open && geo) return;
    open = i;
    place();
  }

  function measure() {
    var w = grid.clientWidth, mobile = w < 560;
    var cardW = mobile ? Math.min(Math.round(w * 0.66), 250) : 270;
    var cardH = mobile ? 400 : 390;
    var step = Math.min(mobile ? 999 : 128, (w - cardW) / (n - 1));
    var total = cardW + step * (n - 1);
    geo = {
      mobile: mobile, cardW: cardW, cardH: cardH, step: step,
      offset: Math.max(0, (w - total) / 2),     // pila centrata
      push: Math.min(mobile ? 26 : 70, step * 0.9)
    };
    grid.style.setProperty('--card-w', cardW + 'px');
    grid.style.setProperty('--card-h', cardH + 'px');
    grid.style.setProperty('--stack-h', (cardH + 56) + 'px');
    hint.textContent = mobile ? hintText : hintDesk;
  }

  function place() {
    cards.forEach(function (c, k) {
      var d = k - open;
      // le carte dopo quella aperta si scostano a destra, quelle prima a sinistra
      var shift = d === 0 ? 0 : (d > 0 ? geo.push : -geo.push * 0.35);
      var x = geo.offset + k * geo.step + shift;
      x = Math.max(0, Math.min(grid.clientWidth - geo.cardW, x));
      c.style.setProperty('--x', x.toFixed(1) + 'px');
      c.style.setProperty('--y', (d === 0 ? -22 : Math.min(Math.abs(d) * 4, 12)) + 'px');
      c.style.setProperty('--s', d === 0 ? '1.03' : '1');
      c.style.setProperty('--z', String(d === 0 ? 50 : 20 - Math.abs(d)));
      c.style.setProperty('--b', d === 0 ? '1' : String(Math.max(.45, .78 - Math.abs(d) * .1)));
      c.classList.toggle('is-open', d === 0);
      c.setAttribute('aria-current', d === 0 ? 'true' : 'false');
    });
    Array.prototype.forEach.call(dots.children, function (s, k) { s.classList.toggle('on', k === open); });
  }

  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { measure(); place(); }, 120); });
  measure(); place();
})();
