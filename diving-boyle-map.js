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
  var modalNome = document.getElementById("dive-modal-nome");
  var modalLoc = document.getElementById("dive-modal-loc");
  var modalDesc = document.getElementById("dive-modal-desc");
  var modalTags = document.getElementById("dive-modal-tags");
  var modalMeta = document.getElementById("dive-modal-meta");
  var modalActions = document.getElementById("dive-modal-actions");
  var ownerToggle = document.getElementById("dive-owner-toggle");
  var ownerForm = document.getElementById("dive-owner-form");
  var ownerConfirm = document.getElementById("dive-owner-confirm");
  var ownerEmail = document.getElementById("dive-owner-email");
  var ownerMsg = document.getElementById("dive-owner-msg");

  var hasGsap = typeof window.gsap !== "undefined";
  var NATIONAL_VB = null;
  var currentVB = null;
  var mapData = null;
  var divingData = null;

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

  function renderPins(regione) {
    pinsG.innerHTML = "";
    var items = divingData[regione] || [];
    var p = mapData.proiezione;
    items.forEach(function (item) {
      if (item.lat == null || item.lon == null) return;
      var xy = projectPoint(item.lon, item.lat, p);
      var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "real-map-pin");
      var c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", xy[0]);
      c.setAttribute("cy", xy[1]);
      c.setAttribute("r", "2.2");
      g.appendChild(c);
      g.addEventListener("click", function (e) {
        e.stopPropagation();
        openCard(item);
      });
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

  function openCard(item) {
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
      .map(function (t) { return '<span class="dive-modal__tag">' + escapeHtml(t) + "</span>"; })
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
    ownerConfirm.hidden = true;
    ownerToggle.style.display = "";
    ownerEmail.value = "";
    ownerMsg.value = "";

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
    ownerForm.hidden = true;
    ownerConfirm.hidden = false;
  });
})();
