/* Gli Amici di Boyle · rete-layout.js
   Disposizione della griglia dei membri senza toccare renderCard():
   1) le card gia' disegnate vengono spostate in gruppi per ambiente,
      con in testa i nuovi arrivati e, dentro ogni gruppo, prima i profili completi;
   2) sopra la griglia, una mappa della Rete: cliccando una citta' si vedono
      solo i membri di li'.
   Per tornare indietro basta togliere questo file e rete-layout.css dalla pagina. */
(function () {
  'use strict';
  document.documentElement.classList.add('rl-js');

  var NEW_COUNT = 3;

  /* ---------- gruppi per ambiente ---------- */
  var GROUPS = [
    { id: 'nuovi',   it: 'Nuovi nella Rete',     en: 'New to the Network',
      subIt: 'Gli ultimi professionisti entrati.', subEn: 'The latest professionals to join.' },
    { id: 'spazio',  it: 'Oltre l’atmosfera',    en: 'Beyond the atmosphere',
      subIt: 'Medicina aerospaziale, microgravità, astrobiologia.', subEn: 'Aerospace medicine, microgravity, astrobiology.' },
    { id: 'quota',   it: 'In quota e ai poli',   en: 'At altitude and the poles',
      subIt: 'Montagna, spedizioni, ambienti polari.', subEn: 'Mountains, expeditions, polar environments.' },
    { id: 'campo',   it: 'Sul campo',            en: 'In the field',
      subIt: 'Area critica, emergenza, soccorso e medicina militare.', subEn: 'Critical care, emergency, rescue and military medicine.' },
    { id: 'mare',    it: 'Sotto il mare',        en: 'Beneath the sea',
      subIt: 'Medicina subacquea e iperbarica, sicurezza in immersione.', subEn: 'Diving and hyperbaric medicine, dive safety.' },
    { id: 'ricerca', it: 'Ricerca e tecnologia', en: 'Research and technology',
      subIt: 'Neuroscienze, ingegneria, intelligenza artificiale.', subEn: 'Neuroscience, engineering, artificial intelligence.' }
  ];
  /* a parita' di tag vince l'ambiente piu' raro: chi fa iperbarica e spazio va in "spazio" */
  var PRIORITY = ['spazio', 'quota', 'campo', 'mare'];
  var TAG_GROUP = {
    spazio: ['spazio', 'space', 'aerospaziale', 'aerospazio', 'astrobiologia', 'medicina spaziale', 'microgravita'],
    quota: ['montagna', 'medicina polare', 'medicina delle spedizioni', 'alta quota', 'medicina di montagna'],
    campo: ['critical care', 'area critica', 'emergenza', 'hems', 'trauma', 'ecmo', 'medicina militare', 'sar',
            'mass gathering', 'soccorso in ambienti estremi', 'medical intelligence', 'medicina umanitaria',
            'chirurgia', 'tccc', 'medicina tattica', 'anestesia'],
    mare: ['diving', 'subacquea', 'iperbarica', 'medicina subacquea', 'medicina iperbarica', 'apnea', 'safety']
  };

  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  }
  function groupOf(m) {
    var tags = (m.tags || []).map(norm);
    for (var i = 0; i < PRIORITY.length; i++) {
      var g = PRIORITY[i];
      if (tags.some(function (t) { return TAG_GROUP[g].indexOf(t) >= 0; })) return g;
    }
    return 'ricerca';
  }
  function keyOf(m) { return m.name.toLowerCase().replace(/\s+/g, '-'); }

  /* stesso criterio dei badge della card */
  function levelOf(p) {
    if (!p) return 0;
    var link = p.linkedin || p.researchgate || p.scholar || p.orcid || p.website;
    if (p.bio && p.bio.trim().length > 10 && link) return 2;
    if ((p.bio && p.bio.trim().length > 5) || link || p.courses) return 1;
    return 0;
  }

  function lang() {
    try { return sessionStorage.getItem('boyle_lang') === 'en' ? 'en' : 'it'; } catch (e) { return 'it'; }
  }

  var members = null, profiles = null, byKey = {};
  var grid = document.getElementById('membersGrid');
  if (!grid) return;

  function load() {
    var opt = { cache: 'no-cache' };
    return Promise.all([
      fetch('rete-members.json', opt).then(function (r) { return r.json(); }),
      fetch('rete-profiles.json', opt).then(function (r) { return r.json(); }).catch(function () { return {}; })
    ]).then(function (d) {
      members = d[0] || []; profiles = d[1] || {};
      members.forEach(function (m, i) { m._i = i; byKey[keyOf(m)] = m; });
    });
  }

  var arranging = false;
  function arrange() {
    if (!members || arranging) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll(':scope > .member-card'));
    if (!cards.length) return;
    arranging = true;

    var newest = members.slice(-NEW_COUNT).map(keyOf);
    var buckets = {};
    GROUPS.forEach(function (g) { buckets[g.id] = []; });
    cards.forEach(function (c) {
      var m = byKey[c.getAttribute('data-key')];
      var k = c.getAttribute('data-key');
      var g = !m ? 'ricerca' : (newest.indexOf(k) >= 0 ? 'nuovi' : groupOf(m));
      buckets[g].push({ el: c, m: m, lvl: m ? levelOf(profiles[k]) : 0 });
    });

    var frag = document.createDocumentFragment();
    GROUPS.forEach(function (g) {
      var list = buckets[g.id];
      if (!list.length) return;
      list.sort(function (a, b) {
        if (g.id === 'nuovi') return (b.m ? b.m._i : 0) - (a.m ? a.m._i : 0);
        return (b.lvl - a.lvl) || ((a.m ? a.m._i : 0) - (b.m ? b.m._i : 0));
      });
      var sec = document.createElement('section');
      sec.className = 'rl-group rl-group--' + g.id;
      sec.setAttribute('data-group', g.id);
      sec.innerHTML =
        '<header class="rl-head"><div class="rl-head__txt">' +
        '<h3 class="rl-title" data-rl-it="' + g.it + '" data-rl-en="' + g.en + '"></h3>' +
        '<p class="rl-sub" data-rl-it="' + g.subIt + '" data-rl-en="' + g.subEn + '"></p></div>' +
        '<span class="rl-count"></span></header>';
      var inner = document.createElement('div');
      inner.className = 'members-grid rl-grid';
      inner.setAttribute('role', 'list');
      list.forEach(function (x) { inner.appendChild(x.el); });
      sec.appendChild(inner);
      frag.appendChild(sec);
    });
    grid.appendChild(frag);
    grid.classList.add('rl-arranged');
    applyText();
    updateGroups();
    arranging = false;
  }

  function applyText() {
    var l = lang();
    document.querySelectorAll('[data-rl-it]').forEach(function (el) {
      var t = el.getAttribute(l === 'en' ? 'data-rl-en' : 'data-rl-it');
      if (el.textContent !== t) el.textContent = t;
    });
  }

  function updateGroups() {
    var l = lang();
    grid.querySelectorAll('.rl-group').forEach(function (sec) {
      var n = 0;
      sec.querySelectorAll('.member-card').forEach(function (c) { if (c.style.display !== 'none') n++; });
      if (sec.hidden !== (n === 0)) sec.hidden = n === 0;
      var cnt = sec.querySelector('.rl-count');
      var txt = n + (l === 'en' ? (n === 1 ? ' member' : ' members') : (n === 1 ? ' membro' : ' membri'));
      if (cnt && cnt.textContent !== txt) cnt.textContent = txt;
    });
  }

  /* la griglia viene ridisegnata (cambio lingua, ricarica): si riordina;
     i filtri esistenti nascondono le card: si aggiornano i gruppi */
  new MutationObserver(function (muts) {
    if (arranging) return;
    var re = muts.some(function (m) { return m.type === 'childList' && m.target === grid; });
    if (re) { arrange(); return; }
    /* solo i cambi di visibilita' delle card contano (non i testi dei titoli) */
    if (muts.some(function (m) { return m.type === 'attributes' && m.target.classList && m.target.classList.contains('member-card'); })) updateGroups();
  }).observe(grid, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });

  document.addEventListener('click', function (e) {
    if (e.target.closest('[id^="langToggle"], .lang-toggle, [id*="lang"]')) {
      setTimeout(function () { applyText(); updateGroups(); updateMapText(); }, 60);
    }
  });

  /* ---------- mappa della Rete ---------- */
  var CITIES = {
    'varese': [45.82, 8.83, 'IT'], 'ginevra': [46.20, 6.14, 'CH'], 'san marino': [43.94, 12.45, 'SM'],
    'monza': [45.58, 9.27, 'IT'], 'monaco, de': [48.14, 11.58, 'DE'], 'monaco di baviera': [48.14, 11.58, 'DE'],
    'auckland': [-36.85, 174.76, 'NZ'], 'porto': [41.15, -8.61, 'PT'], 'treviso': [45.67, 12.24, 'IT'],
    'milano': [45.46, 9.19, 'IT'], 'gravedona': [46.14, 9.31, 'IT'], 'la spezia': [44.10, 9.82, 'IT'],
    'pavia': [45.19, 9.16, 'IT'], 'lugano': [46.00, 8.95, 'CH'], 'hong kong': [22.32, 114.17, 'HK'],
    'sao jose dos campos': [-23.18, -45.88, 'BR'], 'sassari': [40.73, 8.56, 'IT'], 'como': [45.81, 9.09, 'IT'],
    'palermo': [38.12, 13.36, 'IT'], 'roma': [41.90, 12.50, 'IT'], 'lodi': [45.31, 9.50, 'IT'],
    'padova': [45.41, 11.88, 'IT'], 'torino': [45.07, 7.69, 'IT'], 'taranto': [40.46, 17.25, 'IT'],
    'venezia': [45.44, 12.32, 'IT'], 'sesto calende': [45.73, 8.63, 'IT'], 'bologna': [44.49, 11.34, 'IT'],
    'perugia': [43.11, 12.39, 'IT'], 'genova': [44.41, 8.93, 'IT'], 'napoli': [40.85, 14.27, 'IT'],
    'firenze': [43.77, 11.26, 'IT'], 'bari': [41.12, 16.87, 'IT'], 'catania': [37.50, 15.09, 'IT'],
    'cagliari': [39.22, 9.12, 'IT'], 'verona': [45.44, 10.99, 'IT'], 'trieste': [45.65, 13.78, 'IT'],
    'trento': [46.07, 11.12, 'IT'], 'bolzano': [46.50, 11.35, 'IT'], 'brescia': [45.54, 10.21, 'IT'],
    'bergamo': [45.70, 9.67, 'IT'], 'parma': [44.80, 10.33, 'IT'], 'modena': [44.65, 10.93, 'IT'],
    'pisa': [43.72, 10.40, 'IT'], 'livorno': [43.55, 10.31, 'IT'], 'ancona': [43.62, 13.52, 'IT'],
    'pescara': [42.46, 14.21, 'IT'], 'messina': [38.19, 15.55, 'IT'], 'reggio calabria': [38.11, 15.65, 'IT'],
    'lecce': [40.35, 18.17, 'IT'], 'udine': [46.06, 13.24, 'IT'], 'vicenza': [45.55, 11.55, 'IT'],
    'novara': [45.45, 8.62, 'IT'], 'aosta': [45.74, 7.32, 'IT'], 'rimini': [44.06, 12.57, 'IT'],
    'siena': [43.32, 11.33, 'IT'], 'ferrara': [44.84, 11.62, 'IT'], 'cremona': [45.13, 10.02, 'IT'],
    'lecco': [45.86, 9.40, 'IT'], 'busto arsizio': [45.61, 8.85, 'IT'], 'gallarate': [45.66, 8.79, 'IT'],
    'zurigo': [47.37, 8.54, 'CH'], 'zurich': [47.37, 8.54, 'CH'], 'berna': [46.95, 7.45, 'CH'],
    'basilea': [47.56, 7.59, 'CH'], 'bellinzona': [46.19, 9.02, 'CH'], 'losanna': [46.52, 6.63, 'CH'],
    'londra': [51.51, -0.13, 'GB'], 'london': [51.51, -0.13, 'GB'], 'parigi': [48.86, 2.35, 'FR'],
    'paris': [48.86, 2.35, 'FR'], 'berlino': [52.52, 13.40, 'DE'], 'colonia': [50.94, 6.96, 'DE'],
    'madrid': [40.42, -3.70, 'ES'], 'barcellona': [41.39, 2.17, 'ES'], 'lisbona': [38.72, -9.14, 'PT'],
    'vienna': [48.21, 16.37, 'AT'], 'marsiglia': [43.30, 5.37, 'FR'], 'nizza': [43.70, 7.27, 'FR'],
    'bruxelles': [50.85, 4.35, 'BE'], 'amsterdam': [52.37, 4.90, 'NL'], 'la valletta': [35.90, 14.51, 'MT'],
    'malta': [35.90, 14.51, 'MT'], 'houston': [29.76, -95.37, 'US'], 'new york': [40.71, -74.01, 'US']
  };
  function cityOf(m) {
    var raw = norm(m.city).replace(/\./g, ',');
    if (CITIES[raw.replace(/\s*,\s*/, ', ')]) return raw.replace(/\s*,\s*/, ', ');
    var first = raw.split(',')[0].trim();
    return CITIES[first] ? first : null;
  }
  function label(m) { return String(m.city || '').split(/[,.]/)[0].trim(); }

  var AMICI_COUNT = '100+'; /* numero degli Amici di Boyle mostrato sopra la mappa */
  var MAP = null, AMICI = [], view = 'europa', activeCity = null, mapEl = null;

  function project(lat, lon) {
    var l = lon * Math.PI / 180, f = lat * Math.PI / 180, f2 = f * f, f4 = f2 * f2;
    var x = l * (0.8707 - 0.131979 * f2 + f4 * (-0.013791 + f4 * (0.003971 * f2 - 0.001529 * f4)));
    var y = f * (1.007226 + f2 * (0.015085 + f4 * (-0.044475 + 0.028874 * f2 - 0.005916 * f4)));
    return [MAP.tx + MAP.scale * x, MAP.ty - MAP.scale * y];
  }

  function buildMap() {
    var section = document.querySelector('#members .container');
    var anchor = section && section.querySelector('.skill-filter-wrap');
    if (!section || !anchor || document.getElementById('rlMap')) return;
    mapEl = document.createElement('div');
    mapEl.id = 'rlMap';
    mapEl.className = 'rl-map';
    mapEl.innerHTML =
      '<div class="rl-map__bar">' +
        '<p class="rl-map__stats" id="rlMapStats"></p>' +
        '<div class="rl-map__views" role="group">' +
          '<button type="button" data-view="europa" data-rl-it="Europa" data-rl-en="Europe"></button>' +
          '<button type="button" data-view="mondo" data-rl-it="Mondo" data-rl-en="World"></button>' +
        '</div>' +
      '</div>' +
      '<div class="rl-map__frame"><svg class="rl-map__svg" id="rlMapSvg" role="img" aria-label="Mappa della Rete di Boyle"></svg>' +
      '<div class="rl-map__tip" id="rlMapTip" hidden></div></div>' +
      '<div class="rl-map__legend"><span class="rl-map__lg rl-map__lg--rete" data-rl-it="Rete di Boyle" data-rl-en="Boyle Network"></span>' +
      '<span class="rl-map__lg rl-map__lg--amici" data-rl-it="Amici di Boyle" data-rl-en="Friends of Boyle"></span></div>' +
      '<div class="rl-map__chip" id="rlMapChip" hidden></div>';
    anchor.parentNode.insertBefore(mapEl, anchor);
    mapEl.querySelectorAll('[data-view]').forEach(function (b) {
      b.addEventListener('click', function () { view = b.getAttribute('data-view'); drawMap(); });
    });
    applyText();
    Promise.all([
      fetch('assets/rete/mappa.json').then(function (r) { return r.json(); }),
      fetch('assets/rete/amici-mappa.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).catch(function () { return { punti: [] }; })
    ]).then(function (d) { MAP = d[0]; AMICI = d[1].punti || []; drawMap(); });
  }

  function cityGroups() {
    var g = {};
    members.forEach(function (m) {
      var c = cityOf(m);
      if (!c) return;
      if (!g[c]) g[c] = { key: c, name: label(m), cc: CITIES[c][2], list: [] };
      g[c].list.push(m);
    });
    return g;
  }

  function drawMap() {
    if (!MAP || !members) return;
    var svg = document.getElementById('rlMapSvg');
    var groups = cityGroups();
    var box;
    if (view === 'mondo') {
      box = MAP.worldBox.slice();
    } else {
      /* Europa centrata sulla Rete, con le proporzioni del riquadro */
      var frame = svg.parentNode.getBoundingClientRect();
      var ratio = frame.width > 0 && frame.height > 0 ? frame.width / frame.height : 2.3;
      var mob = window.innerWidth < 700;
      var c = mob ? project(42.3, 11.8) : project(44.2, 9.5), h = mob ? 40 : 54, w = h * ratio;
      box = [c[0] - w / 2, c[1] - h / 2, w, h];
    }
    /* raggio dei punti in pixel reali, qualunque sia lo zoom */
    var fw = svg.parentNode.getBoundingClientRect().width || 1000;
    var fh = svg.parentNode.getBoundingClientRect().height || 430;
    var pxu = Math.max(box[2] / fw, box[3] / fh); /* unita' per pixel con "slice" */
    if (view !== 'mondo') pxu = Math.min(box[2] / fw, box[3] / fh);
    var unit = box[2] / 1000;
    svg.setAttribute('viewBox', box.join(' '));
    svg.setAttribute('preserveAspectRatio', view === 'mondo' ? 'xMidYMid meet' : 'xMidYMid slice');
    var world = view === 'mondo';
    var dotStep = (world ? 4.2 : 5) * pxu, dotR = dotStep * 0.3;
    var html =
      '<defs>' +
        '<pattern id="rlDots" patternUnits="userSpaceOnUse" width="' + dotStep.toFixed(3) + '" height="' + dotStep.toFixed(3) + '">' +
          '<circle cx="' + (dotStep / 2).toFixed(3) + '" cy="' + (dotStep / 2).toFixed(3) + '" r="' + dotR.toFixed(3) + '" fill="rgba(140,225,255,.55)"/>' +
        '</pattern>' +
        '<radialGradient id="rlGlow"><stop offset="0" stop-color="#7be4ff" stop-opacity=".55"/><stop offset="1" stop-color="#7be4ff" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="rlArc" x1="0" x2="1"><stop offset="0" stop-color="#39ff8f" stop-opacity=".9"/><stop offset="1" stop-color="#7be4ff" stop-opacity=".35"/></linearGradient>' +
      '</defs>' +
      '<path class="rl-map__grat" d="' + (world ? MAP.gratWorld : MAP.gratEurope) + '"/>' +
      (world ? '<path class="rl-map__sphere" d="' + MAP.sphere + '"/>' : '') +
      '<path class="rl-map__landbg" d="' + (world ? MAP.world : MAP.europe) + '"/>' +
      '<path class="rl-map__land" d="' + (world ? MAP.world : MAP.europe) + '"/>';
    var arr = Object.keys(groups).map(function (k) { return groups[k]; })
      .sort(function (a, b) { return b.list.length - a.list.length; });
    /* Amici di Boyle: punti piccoli, non cliccabili */
    AMICI.forEach(function (a, i) {
      var p = project(a[0], a[1]);
      html += '<circle class="rl-map__amico" style="animation-delay:' + ((i * 0.37) % 4).toFixed(2) + 's" cx="' + p[0].toFixed(2) + '" cy="' + p[1].toFixed(2) + '" r="' + ((world ? 2.4 : 3.3) * pxu).toFixed(3) + '"/>';
    });
    /* archi della Rete: da Varese, dove e' nata, verso ogni citta' */
    var hub = project(45.82, 8.83);
    arr.forEach(function (g, i) {
      if (g.key === 'varese') return;
      var p = project(CITIES[g.key][0], CITIES[g.key][1]);
      var dx = p[0] - hub[0], dy = p[1] - hub[1], len = Math.sqrt(dx * dx + dy * dy);
      if (len < 2 * pxu) return;
      var bend = Math.min(len * 0.28, (world ? 60 : 9));
      var cx = (hub[0] + p[0]) / 2 - dy / len * bend, cy = (hub[1] + p[1]) / 2 + dx / len * bend;
      html += '<path class="rl-map__arc" style="animation-delay:' + (i * 0.18).toFixed(2) + 's" d="M' + hub[0].toFixed(2) + ',' + hub[1].toFixed(2) +
        ' Q' + cx.toFixed(2) + ',' + cy.toFixed(2) + ' ' + p[0].toFixed(2) + ',' + p[1].toFixed(2) + '"/>';
    });
    arr.forEach(function (g) {
      var p = project(CITIES[g.key][0], CITIES[g.key][1]);
      var r = (view === 'mondo' ? 3.5 : 4.5) * (1 + 0.45 * Math.sqrt(g.list.length - 1)) * pxu;
      var on = activeCity === g.key ? ' is-on' : '';
      html += '<g class="rl-map__pt' + on + '" data-city="' + g.key + '" tabindex="0" role="button" aria-label="' + g.name + '">' +
        '<circle class="rl-map__halo" fill="url(#rlGlow)" cx="' + p[0].toFixed(2) + '" cy="' + p[1].toFixed(2) + '" r="' + (r * 3.2).toFixed(2) + '"/>' +
        '<circle class="rl-map__dot" cx="' + p[0].toFixed(2) + '" cy="' + p[1].toFixed(2) + '" r="' + r.toFixed(2) + '"/></g>';
    });
    svg.innerHTML = html;
    svg.style.setProperty('--rl-stroke', (unit * (view === 'mondo' ? 0.6 : 0.9)).toFixed(3));
    mapEl.querySelectorAll('[data-view]').forEach(function (b) {
      b.classList.toggle('is-on', b.getAttribute('data-view') === view);
    });
    var vw = mapEl.querySelector('.rl-map__views');
    if (vw) vw.classList.toggle('is-mondo', view === 'mondo');

    var tip = document.getElementById('rlMapTip');
    svg.querySelectorAll('.rl-map__pt').forEach(function (pt) {
      var g = groups[pt.getAttribute('data-city')];
      function show(ev) {
        var fr = svg.parentNode.getBoundingClientRect(), rc = pt.getBoundingClientRect();
        tip.textContent = g.name + ' · ' + g.list.length;
        tip.hidden = false;
        tip.style.left = (rc.left + rc.width / 2 - fr.left) + 'px';
        tip.style.top = (rc.top - fr.top) + 'px';
      }
      pt.addEventListener('mouseenter', show);
      pt.addEventListener('focus', show);
      pt.addEventListener('mouseleave', function () { tip.hidden = true; });
      pt.addEventListener('blur', function () { tip.hidden = true; });
      pt.addEventListener('click', function () { filterCity(activeCity === g.key ? null : g.key, groups); });
      pt.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pt.click(); } });
    });
    updateMapText(groups);
  }

  function updateMapText(groups) {
    if (!members || !MAP) return;
    groups = groups || cityGroups();
    var l = lang(), ks = Object.keys(groups), cc = {};
    ks.forEach(function (k) { cc[groups[k].cc] = 1; });
    var nc = Object.keys(cc).length;
    var st = document.getElementById('rlMapStats');
    if (st) st.innerHTML = l === 'en'
      ? '<span><b>' + members.length + '</b>members</span><span class="rl-map__amici-n"><b>' + AMICI_COUNT + '</b>Friends of Boyle</span><span><b>' + ks.length + '</b>cities</span><span><b>' + nc + '</b>countries</span>'
      : '<span><b>' + members.length + '</b>membri</span><span class="rl-map__amici-n"><b>' + AMICI_COUNT + '</b>amici di Boyle</span><span><b>' + ks.length + '</b>città</span><span><b>' + nc + '</b>paesi</span>';
    var chip = document.getElementById('rlMapChip');
    if (chip && activeCity && groups[activeCity]) {
      chip.hidden = false;
      chip.innerHTML = (l === 'en' ? 'Showing members in ' : 'Membri a ') + '<b>' + groups[activeCity].name +
        '</b> <button type="button" aria-label="' + (l === 'en' ? 'Show all' : 'Mostra tutti') + '">✕ ' +
        (l === 'en' ? 'show all' : 'mostra tutti') + '</button>';
      chip.querySelector('button').onclick = function () { filterCity(null, groups); };
    } else if (chip) chip.hidden = true;
    applyText();
  }

  function filterCity(key, groups) {
    activeCity = key;
    var keep = {};
    if (key) groups[key].list.forEach(function (m) { keep[keyOf(m)] = 1; });
    grid.querySelectorAll('.member-card').forEach(function (c) {
      c.style.display = !key || keep[c.getAttribute('data-key')] ? '' : 'none';
      if (key && keep[c.getAttribute('data-key')]) c.classList.add('is-visible');
    });
    /* il filtro per specialita' torna su "Tutti" */
    var all = document.querySelector('.skill-tag-btn--all');
    if (all) document.querySelectorAll('.skill-tag-btn').forEach(function (b) { b.classList.toggle('skill-tag-btn--active', b === all); });
    drawMap();
    if (key) {
      var first = grid.querySelector('.rl-group:not([hidden])');
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  var resizeT;
  window.addEventListener('resize', function () { clearTimeout(resizeT); resizeT = setTimeout(drawMap, 200); });

  /* "Perche' entrare": tabella che si compone quando entra nello schermo, luce che segue il mouse */
  (function () {
    var mx = document.querySelector('.rw-matrix');
    if (mx) {
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (e.isIntersecting) { mx.classList.add('is-in'); io.disconnect(); } });
        }, { threshold: 0.15 });
        io.observe(mx);
      } else mx.classList.add('is-in');
    }
    document.querySelectorAll('.rw-path, .rw-row').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  })();

  load().then(function () {
    arrange();
    buildMap();
  }).catch(function (e) { console.warn('rete-layout:', e); });
})();
