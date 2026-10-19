/* Sotto Pressione · episodi automatici dal feed RSS
   Legge assets/podcast/feed.json (aggiornato ogni giorno da GitHub Actions):
   - aggiorna titolo e descrizione del riquadro "Ultimo episodio";
   - mostra in cima all'elenco gli episodi non ancora inseriti a mano. */
(function () {
  var SHOW = 'https://open.spotify.com/show/2kiLEUpdpn6FIUzTDMx0V7';
  var en = false;
  try { en = (sessionStorage.getItem('boyle_lang') || 'it') === 'en'; } catch (e) {}

  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtDate(iso) {
    if (!iso) return '';
    var d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString(en ? 'en-GB' : 'it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  function spotifyLink(ep) {
    return ep.spotify_id ? 'https://open.spotify.com/episode/' + ep.spotify_id : SHOW;
  }

  function updateLatest(ep) {
    var t = document.querySelector('.podPlayer__title');
    var d = document.querySelector('.podPlayer__desc');
    var a = document.querySelector('.podPlayer__link');
    if (!t || !ep) return;
    t.textContent = ep.title;
    if (d && ep.desc) d.textContent = ep.desc;
    if (a) a.href = spotifyLink(ep);
  }

  function card(ep) {
    var id = 'nep-' + Math.random().toString(36).slice(2, 8);
    var play = ep.spotify_id
      ? '<button class="epPlayBtn" data-id="' + esc(ep.spotify_id) + '" data-feed="1">' +
        '<svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13"><path d="M3 3.5A1.5 1.5 0 0 1 5.121 2.19l7 4.5a1.5 1.5 0 0 1 0 2.62l-7 4.5A1.5 1.5 0 0 1 3 12.5v-9Z"/></svg>' +
        (en ? 'Listen' : 'Ascolta') + '</button>'
      : (ep.audio ? '<button class="epPlayBtn" data-audio="' + id + '">' +
        '<svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13"><path d="M3 3.5A1.5 1.5 0 0 1 5.121 2.19l7 4.5a1.5 1.5 0 0 1 0 2.62l-7 4.5A1.5 1.5 0 0 1 3 12.5v-9Z"/></svg>' +
        (en ? 'Listen' : 'Ascolta') + '</button>' : '');
    var audio = (!ep.spotify_id && ep.audio)
      ? '<audio id="' + id + '" controls preload="none" src="' + esc(ep.audio) + '" style="width:100%;margin-top:10px;display:none"></audio>' : '';
    return '<article class="epCard" data-title="' + esc(ep.title.toLowerCase()) + '">' +
      '<div class="epLeft" style="flex:1"><span class="epBadge epBadge--s3">' + (en ? 'NEW' : 'NUOVO') + '</span>' +
      '<div class="epInfo" style="flex:1"><h3 class="epTitle">' + esc(ep.title) + '</h3>' +
      '<p class="epDesc">' + esc(fmtDate(ep.date)) + (ep.desc ? ' · ' + esc(ep.desc) : '') + '</p>' + audio + '</div></div>' +
      '<div class="epActions">' + play +
      '<a class="epBtn" href="' + spotifyLink(ep) + '" target="_blank" rel="noopener">Spotify</a></div></article>';
  }

  function renderNew(list) {
    var wrap = document.getElementById('seasonsWrap');
    if (!wrap || !list.length) return;
    var box = document.createElement('details');
    box.className = 'season season--s3 is-visible';
    box.open = true;
    box.innerHTML =
      '<summary class="season__summary"><div class="season__left"><span class="season__tag">★</span><div>' +
      '<span class="season__k">' + (en ? 'New episodes' : 'Nuovi episodi') + '</span>' +
      '<span class="season__d">' + (en ? 'Just published, straight from the feed.' : 'Appena pubblicati, direttamente dal feed.') + '</span>' +
      '</div></div><div class="season__right"><span class="season__count">' + list.length + ' ep.</span>' +
      '<span class="season__chev"></span></div></summary>' +
      '<div class="season__body">' + list.map(card).join('') + '</div>';
    wrap.insertBefore(box, wrap.firstChild);

    box.querySelectorAll('[data-audio]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var a = document.getElementById(btn.dataset.audio);
        a.style.display = 'block';
        a.play();
      });
    });
    // episodi con ID Spotify: usano il player in linea della pagina
    box.querySelectorAll('[data-feed]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var player = document.getElementById('podInlinePlayer');
        var embed = document.getElementById('podInlineEmbed');
        var label = document.getElementById('podInlineLabel');
        if (!player || !embed) { window.open(spotifyLink({ spotify_id: btn.dataset.id }), '_blank'); return; }
        label.textContent = '▶  ' + btn.closest('.epCard').querySelector('.epTitle').textContent;
        embed.innerHTML = '<iframe src="https://open.spotify.com/embed/episode/' + btn.dataset.id +
          '?utm_source=generator&theme=0" width="100%" height="152" frameborder="0" ' +
          'allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>';
        player.hidden = false;
      });
    });
  }

  fetch('assets/podcast/feed.json?t=' + Date.now())
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!data) return;
      updateLatest(data.latest);
      renderNew(data.new || []);
    })
    .catch(function () {});
})();
