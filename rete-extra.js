/* rete-extra.js — bio troncamento robusto */
(function() {
  var MAX_LINES = 6;

  function initBio(bioBox) {
    if (bioBox.dataset.bioInit) return;

    var p = bioBox.querySelector('p');
    if (!p || !p.textContent.trim()) return;

    var style      = getComputedStyle(p);
    var lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.8;
    var maxH       = lineHeight * MAX_LINES;
    var realH      = p.scrollHeight;

    if (realH <= maxH + 4) { bioBox.dataset.bioInit = 'short'; return; }

    bioBox.dataset.bioInit = '1';
    bioBox.classList.add('bio-collapsible');

    var btn = document.createElement('button');
    btn.className = 'bio-read-more';
    btn.innerHTML = 'Leggi di pi\u00f9 <span class="bio-arrow">\u25bc</span>';
    bioBox.appendChild(btn);

    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var exp = bioBox.classList.toggle('bio-expanded');
      btn.innerHTML = exp
        ? 'Mostra meno <span class="bio-arrow">\u25bc</span>'
        : 'Leggi di pi\u00f9 <span class="bio-arrow">\u25bc</span>';
    });
  }

  function scanModal(root) {
    root.querySelectorAll('.profile-bio-box').forEach(function(b) {
      b.classList.remove('bio-collapsible','bio-expanded');
      var old = b.querySelector('.bio-read-more');
      if (old) old.remove();
      delete b.dataset.bioInit;
      initBio(b);
    });
  }

  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      if (m.type === 'attributes' && m.attributeName === 'aria-hidden') {
        if (m.target.getAttribute('aria-hidden') === 'false') {
          var t = m.target;
          setTimeout(function() { scanModal(t); }, 80);
        }
      }
      if (m.type === 'childList') {
        m.addedNodes.forEach(function(n) {
          if (n.nodeType !== 1) return;
          if (n.classList && n.classList.contains('profile-bio-box')) { initBio(n); return; }
          if (n.querySelectorAll) n.querySelectorAll('.profile-bio-box').forEach(initBio);
        });
      }
    });
  });

  function start() {
    observer.observe(document.body, {
      childList: true, subtree: true,
      attributes: true, attributeFilter: ['aria-hidden']
    });
    document.querySelectorAll('.profile-bio-box').forEach(initBio);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
