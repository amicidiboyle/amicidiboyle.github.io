/* Gli Amici di Boyle · motion.js
   Mette in pausa le animazioni delle sezioni che non si vedono e le riprende
   quando tornano sullo schermo: la pagina resta leggera anche da ferma. */
(function () {
  'use strict';
  if (!('IntersectionObserver' in window)) return;
  function init() {
    var els = document.querySelectorAll('main section, body > section, .ticker, footer, .site-footer');
    if (!els.length) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var off = !e.isIntersecting;
        e.target.classList.toggle('is-offscreen', off);
        /* anche le animazioni SVG native */
        Array.prototype.forEach.call(e.target.querySelectorAll('svg'), function (s) {
          if (!s.querySelector('animate, animateTransform, animateMotion')) return;
          try { off ? s.pauseAnimations() : s.unpauseAnimations(); } catch (err) {}
        });
      });
    }, { rootMargin: '150px 0px' });
    Array.prototype.forEach.call(els, function (el) { io.observe(el); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
