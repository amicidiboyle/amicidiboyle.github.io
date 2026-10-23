/* Gli Amici di Boyle · podcast-track.js
   Conta in Google Analytics (solo se il visitatore ha accettato i cookie)
   gli ascolti avviati dal sito, i clic verso Spotify e i messaggi vocali.
   Il titolo dell'episodio va nel parametro link_text, che GA4 mostra gia'
   come dimensione standard "Testo del link": niente configurazioni in piu'. */
(function () {
  'use strict';
  function track(name, title) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', name, { link_text: String(title || '').trim().slice(0, 100) || '(senza titolo)' });
  }
  function episodeOf(el) {
    var card = el.closest('.epCard');
    var t = card && card.querySelector('.epTitle');
    if (t) return t.textContent;
    var pl = el.closest('.podPlayer');
    var pt = pl && pl.querySelector('.podPlayer__title, h3, h2');
    return pt ? pt.textContent : 'Sotto Pressione (show)';
  }
  document.addEventListener('click', function (e) {
    var play = e.target.closest('.epPlayBtn');
    if (play) { track('podcast_play', episodeOf(play)); return; }
    var sp = e.target.closest('a[href*="open.spotify.com"]');
    if (sp) { track('podcast_spotify', /\/show\//.test(sp.href) ? 'Sotto Pressione (show)' : episodeOf(sp)); return; }
    if (e.target.closest('#recBtnSend')) track('podcast_voice', 'Messaggio vocale');
  }, true);
})();
