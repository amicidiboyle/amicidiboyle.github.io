/* Gli Amici di Boyle · menu «Strumenti»: apertura al clic, chiusura fuori o con Esc, testi IT/EN */
(function () {
  'use strict';
  var T = {
    it: { tools: 'Strumenti', lab: 'Laboratorio virtuale', bib: 'Bibliografia scientifica', div: 'I diving italiani' },
    en: { tools: 'Tools', lab: 'Virtual laboratory', bib: 'Scientific bibliography', div: 'Italian dive centres' }
  };
  /* ogni pagina aggiorna l'attributo lang di <html> quando cambia lingua */
  function lang() { return (document.documentElement.lang || 'it').slice(0, 2) === 'en' ? 'en' : 'it'; }
  function texts() {
    var d = T[lang()];
    document.querySelectorAll('[data-nt]').forEach(function (el) { var k = el.getAttribute('data-nt'); if (d[k]) el.textContent = d[k]; });
  }
  var all = Array.prototype.slice.call(document.querySelectorAll('[data-nav-tools]'));
  function set(box, open) {
    box.classList.toggle('is-open', open);
    box.querySelector('.nav-tools__btn').setAttribute('aria-expanded', String(open));
    box.querySelector('.nav-tools__panel').hidden = !open;
  }
  all.forEach(function (box) {
    var btn = box.querySelector('.nav-tools__btn');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !box.classList.contains('is-open');
      all.forEach(function (b) { if (b !== box) set(b, false); });
      set(box, open);
    });
    box.addEventListener('keydown', function (e) { if (e.key === 'Escape') { set(box, false); btn.focus(); } });
    box.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function (e) { e.stopPropagation(); set(box, false); }); });
  });
  document.addEventListener('click', function (e) { all.forEach(function (b) { if (!b.contains(e.target)) set(b, false); }); });
  /* il cambio lingua di ogni pagina passa da un pulsante .lang-toggle */
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('.lang-toggle')) setTimeout(texts, 30); }, true);
  if ('MutationObserver' in window) new MutationObserver(texts).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  texts();
})();
