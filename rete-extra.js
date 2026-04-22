/* rete-extra.js — bio troncamento */
(function() {
  var LINE_HEIGHT = 1.8;   /* em — uguale al CSS */
  var MAX_LINES   = 6;

  function initBio(bioBox) {
    if (bioBox.dataset.bioInit) return;
    bioBox.dataset.bioInit = '1';

    var p = bioBox.querySelector('p');
    if (!p) return;

    /* Calcola altezza per MAX_LINES righe */
    var fontSize   = parseFloat(getComputedStyle(p).fontSize);
    var maxHeight  = Math.ceil(fontSize * LINE_HEIGHT * MAX_LINES);

    /* Se il testo è abbastanza corto, non serve il bottone */
    if (p.scrollHeight <= maxHeight + 4) return;

    bioBox.classList.add('bio-collapsible');

    var btn = document.createElement('button');
    btn.className = 'bio-read-more';
    btn.innerHTML = 'Leggi di più <span class="bio-arrow">▼</span>';
    bioBox.appendChild(btn);

    btn.addEventListener('click', function() {
      var expanded = bioBox.classList.toggle('bio-expanded');
      btn.innerHTML = expanded
        ? 'Mostra meno <span class="bio-arrow">▼</span>'
        : 'Leggi di più <span class="bio-arrow">▼</span>';
    });
  }

  /* Osserva l'apertura del profile modal */
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      m.addedNodes.forEach(function(node) {
        if (node.nodeType !== 1) return;
        var boxes = node.classList && node.classList.contains('profile-bio-box')
          ? [node]
          : Array.from(node.querySelectorAll ? node.querySelectorAll('.profile-bio-box') : []);
        boxes.forEach(initBio);
      });
      /* Anche attributi — quando il modal diventa is-open */
      if (m.type === 'attributes' && m.attributeName === 'class') {
        var el = m.target;
        if (el.classList.contains('is-open') || el.classList.contains('profile-modal')) {
          el.querySelectorAll('.profile-bio-box').forEach(initBio);
        }
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree:   true,
    attributes: true,
    attributeFilter: ['class']
  });

  /* Inizializza bio già presenti al caricamento */
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.profile-bio-box').forEach(initBio);
  });
})();
