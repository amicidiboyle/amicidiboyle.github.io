(function () {
  "use strict";

  var svg = document.getElementById("real-map-svg");
  var regionsG = document.getElementById("real-map-regions");
  var pinsG = document.getElementById("real-map-pins");
  var backBtn = document.getElementById("real-map-back");
  var hint = document.getElementById("real-map-hint");
  var heading = document.getElementById("map-heading");

  var modal = document.getElementById("dive-modal");
  var modalClose = document.getElementById("dive-modal-close");
  var modalBackdrop = document.getElementById("dive-modal-backdrop");
  var modalAvatar = document.getElementById("dive-modal-avatar");
  var modalNome = document.getElementById("dive-modal-nome");
  var modalLoc = document.getElementById("dive-modal-loc");
  var modalDesc = document.getElementById("dive-modal-desc");
  var modalTags = document.getElementById("dive-modal-tags");
  var modalMeta = document.getElementById("dive-modal-meta");
  var modalActions = document.getElementById("dive-modal-actions");
  var ownerToggle = document.getElementById("dive-owner-toggle");
  var ownerForm = document.getElementById("dive-owner-form");
  var ownerConfirm = document.getElementById("dive-owner-confirm");
  var ownerError = document.getElementById("dive-owner-error");
  var ownerSubmit = document.getElementById("dive-owner-submit");
  var ownerEmail = document.getElementById("dive-owner-email");
  var ownerMsg = document.getElementById("dive-owner-msg");
  var ownerDivingNome = document.getElementById("dive-owner-diving-nome");
  var ownerDivingRegione = document.getElementById("dive-owner-diving-regione");
  var ownerDivingIndirizzo = document.getElementById("dive-owner-diving-indirizzo");
  var ownerSubject = document.getElementById("dive-owner-subject");

  var hasGsap = typeof window.gsap !== "undefined";
  var NATIONAL_VB = null;
  var currentVB = null;
  var mapData = null;
  var divingData = null;
  var searchIndex = [];

  if (!svg) return; // pagina senza mappa (safety, non dovrebbe succedere)

  function parseViewBox(str) {
    var p = str.trim().split(/\s+/).map(Number);
    return { x: p[0], y: p[1], w: p[2], h: p[3] };
  }
  function setViewBox(vb) {
    svg.setAttribute("viewBox", vb.x + " " + vb.y + " " + vb.w + " " + vb.h);
  }
  function projectPoint(lon, lat, p) {
    var px = lon * p.cosLat;
    var py = -lat;
    return [(px - p.pxMin) * p.scale + p.pad, (py - p.pyMin) * p.scale + p.pad];
  }

  Promise.all([
    fetch("assets/it-regioni-svg.json").then(function (r) { return r.json(); }),
    fetch("assets/diving-reali.json").then(function (r) { return r.json(); }),
  ])
    .then(function (results) {
      mapData = results[0];
      divingData = results[1];
      init();
    })
    .catch(function (err) {
      if (hint) hint.textContent = "Mappa non disponibile al momento (serve un server, non apre da file locale).";
      console.error("Errore caricamento dati mappa:", err);
    });

  function init() {
    svg.setAttribute("viewBox", mapData.viewBox);
    NATIONAL_VB = parseViewBox(mapData.viewBox);
    currentVB = { x: NATIONAL_VB.x, y: NATIONAL_VB.y, w: NATIONAL_VB.w, h: NATIONAL_VB.h };

    var counts = {};
    var maxCount = 0;
    Object.keys(divingData).forEach(function (regione) {
      counts[regione] = divingData[regione].length;
      if (counts[regione] > maxCount) maxCount = counts[regione];
    });

    Object.keys(mapData.regioni).forEach(function (nome) {
      var r = mapData.regioni[nome];
      var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", r.d);
      path.setAttribute("class", "real-map-region");
      path.dataset.regione = nome;
      var intensity = maxCount ? (counts[nome] || 0) / maxCount : 0;
      path.style.setProperty("--intensity", intensity.toFixed(2));
      path.addEventListener("click", function () { selectRegion(nome); });
      var title = document.createElementNS("http://www.w3.org/2000/svg", "title");
      title.textContent = nome + ": " + (counts[nome] || 0) + " diving individuati";
      path.appendChild(title);
      regionsG.appendChild(path);
    });

    backBtn.addEventListener("click", zoomToNational);

    searchIndex = [];
    Object.keys(divingData).forEach(function (regione) {
      divingData[regione].forEach(function (item) { searchIndex.push(item); });
    });
  }

  function selectRegion(nome) {
    var r = mapData.regioni[nome];
    if (!r) return;

    regionsG.querySelectorAll(".real-map-region").forEach(function (el) {
      el.classList.toggle("is-active", el.dataset.regione === nome);
      el.classList.toggle("is-dimmed", el.dataset.regione !== nome);
    });

    var bbox = r.bbox;
    var padX = (bbox[2] - bbox[0]) * 0.18;
    var padY = (bbox[3] - bbox[1]) * 0.18;
    var target = {
      x: bbox[0] - padX, y: bbox[1] - padY,
      w: (bbox[2] - bbox[0]) + padX * 2, h: (bbox[3] - bbox[1]) + padY * 2,
    };

    pinsG.innerHTML = "";
    animateViewBox(target, function () { renderPins(nome); });

    var n = divingData[nome] ? divingData[nome].length : 0;
    backBtn.style.display = "";
    hint.textContent = nome + " — " + n + " diving individuati. Clicca un pin per aprire la scheda.";
    heading.textContent = nome + ": " + n + " diving individuati.";
  }

  function zoomToNational() {
    regionsG.querySelectorAll(".real-map-region").forEach(function (el) {
      el.classList.remove("is-active", "is-dimmed");
    });
    pinsG.innerHTML = "";
    animateViewBox(NATIONAL_VB);
    backBtn.style.display = "none";
    hint.textContent = "Clicca una regione per esplorarla";
    heading.textContent = "Ecco i diving italiani. Qui si impara ad esplorare la parte nascosta del mondo.";
  }

  function animateViewBox(target, onDone) {
    if (hasGsap) {
      gsap.to(currentVB, {
        x: target.x, y: target.y, w: target.w, h: target.h,
        duration: 0.7, ease: "power2.inOut",
        onUpdate: function () { setViewBox(currentVB); },
        onComplete: function () { if (onDone) onDone(); },
      });
    } else {
      currentVB.x = target.x; currentVB.y = target.y; currentVB.w = target.w; currentVB.h = target.h;
      setViewBox(currentVB);
      if (onDone) onDone();
    }
  }

  var SVGNS = "http://www.w3.org/2000/svg";

  /* ── raggruppa i diving troppo vicini in pixel-mappa: a livello di
     singola regione, due centri nella stessa cittadina/porto restano
     quasi sovrapposti anche zoomando sull'intera regione (lo zoom
     mostra tutta la regione, non arriva mai "dentro" una citta').
     Raggruppamento greedy per prossimita', soglia proporzionale alla
     larghezza della vista corrente cosi' si adatta ad ogni regione. ── */
  function clusterPoints(pts, threshold) {
    var used = new Array(pts.length).fill(false);
    var clusters = [];
    for (var i = 0; i < pts.length; i++) {
      if (used[i]) continue;
      var group = [pts[i]];
      used[i] = true;
      for (var j = i + 1; j < pts.length; j++) {
        if (used[j]) continue;
        var dx = pts[j].x - pts[i].x, dy = pts[j].y - pts[i].y;
        if (Math.sqrt(dx * dx + dy * dy) < threshold) {
          group.push(pts[j]);
          used[j] = true;
        }
      }
      clusters.push(group);
    }
    return clusters;
  }

  function renderPins(regione) {
    pinsG.innerHTML = "";
    var items = (divingData[regione] || []).filter(function (it) {
      return it.lat != null && it.lon != null;
    });
    var p = mapData.proiezione;
    var pts = items.map(function (item) {
      var xy = projectPoint(item.lon, item.lat, p);
      return { item: item, x: xy[0], y: xy[1] };
    });

    var threshold = currentVB.w * 0.025;
    var clusters = clusterPoints(pts, threshold);

    clusters.forEach(function (group) {
      var cx = group.reduce(function (s, pt) { return s + pt.x; }, 0) / group.length;
      var cy = group.reduce(function (s, pt) { return s + pt.y; }, 0) / group.length;
      var g = document.createElementNS(SVGNS, "g");

      /* area di tap invisibile, piu' grande del pallino/cluster visibile:
         su mobile un target di 2-3px reali e' troppo piccolo per un dito. */
      var hit = document.createElementNS(SVGNS, "circle");
      hit.setAttribute("cx", cx);
      hit.setAttribute("cy", cy);
      hit.setAttribute("class", "real-map-pin__hit");

      if (group.length > 1) {
        g.setAttribute("class", "real-map-pin real-map-pin--cluster");
        hit.setAttribute("r", "9");
        g.appendChild(hit);
        var cc = document.createElementNS(SVGNS, "circle");
        cc.setAttribute("cx", cx);
        cc.setAttribute("cy", cy);
        cc.setAttribute("r", "4.6");
        cc.setAttribute("class", "real-map-pin__cluster-circle");
        g.appendChild(cc);
        var txt = document.createElementNS(SVGNS, "text");
        txt.setAttribute("x", cx);
        txt.setAttribute("y", cy);
        txt.setAttribute("class", "real-map-pin__cluster-count");
        txt.setAttribute("font-size", group.length > 9 ? "4.4" : "5.2");
        txt.textContent = group.length;
        g.appendChild(txt);
        var clusterItems = group.map(function (pt) { return pt.item; });
        g.addEventListener("click", function (e) {
          e.stopPropagation();
          openCluster(clusterItems);
        });
      } else {
        g.setAttribute("class", "real-map-pin");
        hit.setAttribute("r", "6.5");
        g.appendChild(hit);
        var c = document.createElementNS(SVGNS, "circle");
        c.setAttribute("cx", cx);
        c.setAttribute("cy", cy);
        c.setAttribute("r", "2.2");
        c.setAttribute("class", "real-map-pin__dot");
        g.appendChild(c);
        var soloItem = group[0].item;
        g.addEventListener("click", function (e) {
          e.stopPropagation();
          openCard(soloItem);
        });
      }
      pinsG.appendChild(g);
    });

    if (hasGsap && pinsG.children.length) {
      gsap.fromTo(pinsG.children, { opacity: 0, scale: 0, transformOrigin: "center" }, {
        opacity: 1, scale: 1, duration: 0.35, stagger: 0.012, ease: "back.out(2)",
      });
    }
  }

  /* ── SCHEDA / MODAL ── */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function withProtocol(url) { return /^https?:\/\//i.test(url) ? url : "https://" + url; }
  function metaRow(label, value) {
    return '<div class="dive-modal__meta-row"><b>' + label + "</b><span>" + escapeHtml(value) + "</span></div>";
  }
  function initials(nome) {
    var words = String(nome).trim().split(/\s+/).filter(Boolean);
    var chars = words.slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); });
    return chars.join("") || "?";
  }
  var TAG_GROUPS = {
    PADI: "certificazione", SSI: "certificazione", CMAS: "certificazione",
    GUE: "certificazione", SNSI: "certificazione",
    "Barca propria": "servizio", "Noleggio attrezzatura": "servizio",
    "Assistenza medica": "servizio", "Watersport": "servizio",
  };

  function openCard(item) {
    modalAvatar.textContent = initials(item.nome);
    modalNome.textContent = item.nome;
    modalLoc.textContent = (item.indirizzo ? item.indirizzo + " · " : "") + item.regione;

    if (item.descrizione) {
      modalDesc.textContent = item.descrizione;
      modalDesc.hidden = false;
    } else {
      modalDesc.textContent = "";
      modalDesc.hidden = true;
    }
    modalTags.innerHTML = (item.tags || [])
      .map(function (t) {
        var group = TAG_GROUPS[t];
        return '<span class="dive-modal__tag"' + (group ? ' data-group="' + group + '"' : "") + ">" + escapeHtml(t) + "</span>";
      })
      .join("");

    var rows = [];
    if (item.categoria) rows.push(metaRow("Tipo", item.categoria));
    if (item.rating) {
      rows.push(metaRow("Valutazione", item.rating.toFixed(1) + " ★" + (item.recensioni ? " (" + item.recensioni + " recensioni Google)" : "")));
    }
    if (item.telefono) rows.push(metaRow("Telefono", item.telefono));
    if (item.sito) rows.push(metaRow("Sito", item.sito));
    modalMeta.innerHTML = rows.join("");

    var actions = [];
    if (item.sito) {
      actions.push('<a class="db-btn db-btn-secondary" href="' + escapeHtml(withProtocol(item.sito)) + '" target="_blank" rel="noopener">Vai al sito →</a>');
    }
    if (item.maps_url) {
      actions.push('<a class="db-btn db-btn-secondary" href="' + escapeHtml(item.maps_url) + '" target="_blank" rel="noopener">Vedi su Google Maps →</a>');
    }
    modalActions.innerHTML = actions.join("");

    ownerForm.hidden = true;
    ownerForm.reset();
    ownerConfirm.hidden = true;
    ownerError.hidden = true;
    ownerToggle.style.display = "";
    ownerEmail.value = "";
    ownerMsg.value = "";
    ownerDivingNome.value = item.nome;
    ownerDivingRegione.value = item.regione || "";
    ownerDivingIndirizzo.value = item.indirizzo || "";
    ownerSubject.value = "Diving-Boyle · segnalazione su \"" + item.nome + "\" (" + item.regione + ")";
    resetOwnerTypeSelect();

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeCard() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }

  modalClose.addEventListener("click", closeCard);
  modalBackdrop.addEventListener("click", closeCard);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeCard();
  });

  ownerToggle.addEventListener("click", function () {
    ownerForm.hidden = false;
    ownerToggle.style.display = "none";
  });

  ownerForm.addEventListener("submit", function (e) {
    e.preventDefault();
    ownerError.hidden = true;
    ownerSubmit.disabled = true;
    ownerSubmit.textContent = "Invio in corso…";

    fetch(ownerForm.action, {
      method: "POST",
      body: new FormData(ownerForm),
      headers: { Accept: "application/json" },
    })
      .then(function (res) {
        if (res.ok) {
          ownerForm.hidden = true;
          ownerConfirm.hidden = false;
        } else {
          ownerError.hidden = false;
        }
      })
      .catch(function () {
        ownerError.hidden = false;
      })
      .then(function () {
        ownerSubmit.disabled = false;
        ownerSubmit.textContent = "Invia richiesta";
      });
  });

  /* ── menu a tendina custom "Cosa vuoi fare?" — sostituisce il
     <select> nativo (popup non restilizzabile su mobile) con un
     controllo nostro; il <select> reale resta sincronizzato e
     nascosto, per quando ci sara' un submit vero. ── */
  var ownerTypeWrap = document.getElementById("dive-owner-type-select");
  var ownerTypeSelect = document.getElementById("dive-owner-type");
  var ownerTypeBtn = ownerTypeWrap.querySelector(".db-select__btn");
  var ownerTypeValue = ownerTypeWrap.querySelector(".db-select__value");
  var ownerTypePanel = ownerTypeWrap.querySelector(".db-select__panel");
  var ownerTypeOptions = ownerTypeWrap.querySelectorAll(".db-select__panel li");

  function resetOwnerTypeSelect() {
    ownerTypeOptions.forEach(function (li, i) {
      li.setAttribute("aria-selected", i === 0 ? "true" : "false");
    });
    ownerTypeValue.textContent = ownerTypeOptions[0].textContent;
    ownerTypeSelect.value = ownerTypeOptions[0].dataset.value;
    closeOwnerTypeSelect();
  }
  function closeOwnerTypeSelect() {
    ownerTypeWrap.classList.remove("is-open");
    ownerTypePanel.hidden = true;
    ownerTypeBtn.setAttribute("aria-expanded", "false");
  }

  ownerTypeBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    var open = ownerTypeWrap.classList.contains("is-open");
    if (open) { closeOwnerTypeSelect(); return; }
    ownerTypeWrap.classList.add("is-open");
    ownerTypePanel.hidden = false;
    ownerTypeBtn.setAttribute("aria-expanded", "true");
  });
  ownerTypeOptions.forEach(function (li) {
    li.addEventListener("click", function () {
      ownerTypeOptions.forEach(function (o) { o.setAttribute("aria-selected", "false"); });
      li.setAttribute("aria-selected", "true");
      ownerTypeValue.textContent = li.textContent;
      ownerTypeSelect.value = li.dataset.value;
      closeOwnerTypeSelect();
    });
  });
  document.addEventListener("click", function () { closeOwnerTypeSelect(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeOwnerTypeSelect();
  });

  /* ── RICERCA per nome/citta': apre la scheda diving direttamente,
     senza passare dalla mappa (bottone "Trova il tuo diving") ── */
  var searchOpenBtn = document.getElementById("search-open-btn");
  var searchModal = document.getElementById("search-modal");
  var searchModalClose = document.getElementById("search-modal-close");
  var searchModalBackdrop = document.getElementById("search-modal-backdrop");
  var searchInput = document.getElementById("search-input");
  var searchResults = document.getElementById("search-results");

  function openSearch() {
    searchModal.classList.add("is-open");
    searchModal.setAttribute("aria-hidden", "false");
    searchInput.value = "";
    renderSearchResults("");
    setTimeout(function () { searchInput.focus(); }, 60);
  }
  function closeSearch() {
    searchModal.classList.remove("is-open");
    searchModal.setAttribute("aria-hidden", "true");
  }
  function renderSearchResults(query) {
    var q = query.trim().toLowerCase();
    if (q.length < 2) {
      searchResults.innerHTML = '<p class="search-results__hint">Scrivi almeno 2 lettere per iniziare.</p>';
      return;
    }
    var matches = searchIndex.filter(function (item) {
      return (item.nome && item.nome.toLowerCase().indexOf(q) !== -1) ||
             (item.indirizzo && item.indirizzo.toLowerCase().indexOf(q) !== -1) ||
             (item.regione && item.regione.toLowerCase().indexOf(q) !== -1);
    }).slice(0, 30);

    if (!matches.length) {
      searchResults.innerHTML = '<p class="search-results__empty">Nessun diving trovato per "' + escapeHtml(query.trim()) + '".</p>';
      return;
    }
    searchResults.innerHTML = matches.map(function (item, i) {
      return '<button type="button" class="search-result" data-idx="' + i + '">' +
        '<div class="search-result__nome">' + escapeHtml(item.nome) + '</div>' +
        '<div class="search-result__loc">' + escapeHtml((item.indirizzo ? item.indirizzo + " · " : "") + item.regione) + '</div>' +
        '</button>';
    }).join("");
    searchResults.querySelectorAll(".search-result").forEach(function (btn, i) {
      btn.addEventListener("click", function () {
        closeSearch();
        openCard(matches[i]);
      });
    });
  }

  if (searchOpenBtn) {
    searchOpenBtn.addEventListener("click", openSearch);
    searchModalClose.addEventListener("click", closeSearch);
    searchModalBackdrop.addEventListener("click", closeSearch);
    searchInput.addEventListener("input", function () { renderSearchResults(searchInput.value); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && searchModal.classList.contains("is-open")) closeSearch();
    });
  }

  /* ── CLUSTER: lista di scelta quando piu' pin sono raggruppati ── */
  var clusterModal = document.getElementById("cluster-modal");
  var clusterModalClose = document.getElementById("cluster-modal-close");
  var clusterModalBackdrop = document.getElementById("cluster-modal-backdrop");
  var clusterModalTitle = document.getElementById("cluster-modal-title");
  var clusterResults = document.getElementById("cluster-results");

  function openCluster(items) {
    clusterModalTitle.textContent = items.length + " diving in quest'area";
    clusterResults.innerHTML = items.map(function (item, i) {
      return '<button type="button" class="search-result" data-idx="' + i + '">' +
        '<div class="search-result__nome">' + escapeHtml(item.nome) + '</div>' +
        '<div class="search-result__loc">' + escapeHtml((item.indirizzo ? item.indirizzo + " · " : "") + item.regione) + '</div>' +
        '</button>';
    }).join("");
    clusterResults.querySelectorAll(".search-result").forEach(function (btn, i) {
      btn.addEventListener("click", function () {
        closeClusterModal();
        openCard(items[i]);
      });
    });
    clusterModal.classList.add("is-open");
    clusterModal.setAttribute("aria-hidden", "false");
  }
  function closeClusterModal() {
    clusterModal.classList.remove("is-open");
    clusterModal.setAttribute("aria-hidden", "true");
  }
  clusterModalClose.addEventListener("click", closeClusterModal);
  clusterModalBackdrop.addEventListener("click", closeClusterModal);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && clusterModal.classList.contains("is-open")) closeClusterModal();
  });
})();
