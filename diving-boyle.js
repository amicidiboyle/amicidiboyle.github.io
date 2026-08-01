/* ══════════════════════════════════════════════════════════
   I18N — dizionario IT/EN + motore di traduzione.
   Espone window.dbT(key, vars), window.DB_LANG, window.dbSetLang(lang)
   e window.dbOnLangChange(fn) cosi' anche diving-boyle-map.js (contenuti
   generati dinamicamente: intestazioni mappa, schede diving, ricerca,
   cluster) puo' restare sincronizzato col cambio lingua. Nessuna
   dipendenza esterna, nessuna pagina separata: stesso URL, stesso
   contenuto, solo testo che cambia — coerente con un sito statico
   senza build tool.
   ══════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var I18N = {
    it: {
      nav_open_menu: "Apri menu",
      nav_home: "Home", nav_vision: "Visione", nav_activity: "Attività",
      nav_areas: "Aree", nav_research: "Ricerca", nav_training: "Formazione",
      nav_content: "Contenuti", nav_bibliography: "Bibliography",
      nav_diving_boyle: "Diving-Boyle", nav_badge_new: "Nuovo",
      nav_founders: "Fondatori", nav_network: "Rete", nav_podcast: "Podcast",
      nav_events: "Eventi", nav_contact: "Contatti",
      close: "Chiudi",
      intro_skip: "Salta ›", intro_readout_label: "Profondità operativa",
      hero_intro: "Dove si immerge l'Italia. Un censimento degli Amici di Boyle.",
      fork_eyebrow: "Sei un subacqueo o vorresti diventarlo?",
      fork_h2: "Trova il diving giusto, la tua porta al mondo sottomarino.",
      fork_quote: "«Il mare, una volta che ti ha incantato, ti tiene per sempre nella sua rete di meraviglia.»",
      btn_esplora: "Esplora i diving →", btn_trova: "Trova il tuo diving",
      search_title: "Trova il tuo diving",
      search_hint: "Cerca per nome del centro o città — si apre subito la scheda, senza passare dalla mappa.",
      search_placeholder: "Es: Saracen, Ustica, Palermo…",
      search_min_chars: "Scrivi almeno 2 lettere per iniziare.",
      search_no_results: "Nessun diving trovato per \"{q}\".",
      cluster_title: "{n} diving in quest'area",
      esplora_label: "Esplora per regione",
      map_heading_default: "Ecco i diving italiani. Qui si impara ad esplorare la parte nascosta del mondo.",
      esplora_p: "Trova i migliori diving italiani.",
      map_hint_default: "Clicca una regione per esplorarla",
      map_error: "Mappa non disponibile al momento (serve un server, non apre da file locale).",
      map_region_heading: "{regione}: {n} diving individuati.",
      map_region_hint: "{regione} — {n} diving individuati. Clicca un pin per aprire la scheda.",
      map_back: "← Tutte le regioni",
      map_legend: "Confini ufficiali ISTAT (<a href=\"https://github.com/openpolis/geojson-italy\" target=\"_blank\" rel=\"noopener\">openpolis/geojson-italy</a>, licenza CC-BY). Intensità del colore = numero di diving individuati nella regione — dati grezzi da ricerca pubblica, non ancora verificati.",
      status_unverified: "● Non verificato",
      meta_tipo: "Tipo", meta_valutazione: "Valutazione", meta_telefono: "Telefono", meta_sito: "Sito",
      meta_recensioni: " ({n} recensioni Google)",
      action_sito: "Vai al sito →", action_maps: "Vedi su Google Maps →",
      owner_toggle: "Sei il titolare di questo diving? →",
      owner_type_label: "Cosa vuoi fare?",
      owner_type_modifica: "Modificare i dati di questa scheda",
      owner_type_rimuovi: "Chiedere la rimozione dall'elenco",
      owner_msg_label: "Descrivi cosa vuoi cambiare",
      owner_msg_placeholder: "Es: il telefono è cambiato, il nuovo è...",
      owner_email_label: "La tua email",
      owner_submit: "Invia richiesta", owner_submit_sending: "Invio in corso…",
      owner_note: "Verificata manualmente da Amici di Boyle prima di qualsiasi modifica pubblica — nessun aggiornamento automatico.",
      owner_confirm: "✓ Richiesta inviata. Ti risponderemo il prima possibile.",
      owner_error: "Non siamo riusciti a inviare la richiesta. Riprova, oppure scrivi direttamente a <a href=\"mailto:info@amicidiboyle.it\">info@amicidiboyle.it</a>.",
      footer_note: "Se gestisci uno di questi centri e vuoi segnalare una correzione o la rimozione, scrivi a <a href=\"mailto:info@amicidiboyle.it\">info@amicidiboyle.it</a>.",
    },
    en: {
      nav_open_menu: "Open menu",
      nav_home: "Home", nav_vision: "Vision", nav_activity: "Activities",
      nav_areas: "Areas", nav_research: "Research", nav_training: "Training",
      nav_content: "Content", nav_bibliography: "Bibliography",
      nav_diving_boyle: "Diving-Boyle", nav_badge_new: "New",
      nav_founders: "Founders", nav_network: "Network", nav_podcast: "Podcast",
      nav_events: "Events", nav_contact: "Contact",
      close: "Close",
      intro_skip: "Skip ›", intro_readout_label: "Operating depth",
      hero_intro: "Where Italy dives. A census by Amici di Boyle.",
      fork_eyebrow: "Are you a diver, or would you like to become one?",
      fork_h2: "Find the right diving center, your gateway to the underwater world.",
      fork_quote: "«The sea, once it casts its spell, holds one in its net of wonder forever.»",
      btn_esplora: "Explore diving centers →", btn_trova: "Find your diving center",
      search_title: "Find your diving center",
      search_hint: "Search by center name or city — opens the listing right away, no need to go through the map.",
      search_placeholder: "E.g.: Saracen, Ustica, Palermo…",
      search_min_chars: "Type at least 2 letters to start.",
      search_no_results: "No diving centers found for \"{q}\".",
      cluster_title: "{n} diving centers in this area",
      esplora_label: "Explore by region",
      map_heading_default: "Here are Italy's diving centers. Explore the hidden side of the world.",
      esplora_p: "Find the best Italian diving centers.",
      map_hint_default: "Click a region to explore it",
      map_error: "Map not available right now (needs a server, won't open from a local file).",
      map_region_heading: "{regione}: {n} diving centers found.",
      map_region_hint: "{regione} — {n} diving centers found. Click a pin to open its listing.",
      map_back: "← All regions",
      map_legend: "Official ISTAT boundaries (<a href=\"https://github.com/openpolis/geojson-italy\" target=\"_blank\" rel=\"noopener\">openpolis/geojson-italy</a>, CC-BY license). Color intensity = number of diving centers found in the region — raw data from public research, not yet verified.",
      status_unverified: "● Unverified",
      meta_tipo: "Type", meta_valutazione: "Rating", meta_telefono: "Phone", meta_sito: "Website",
      meta_recensioni: " ({n} Google reviews)",
      action_sito: "Visit website →", action_maps: "View on Google Maps →",
      owner_toggle: "Are you the owner of this diving center? →",
      owner_type_label: "What would you like to do?",
      owner_type_modifica: "Update this listing's info",
      owner_type_rimuovi: "Request removal from the list",
      owner_msg_label: "Describe what you'd like to change",
      owner_msg_placeholder: "E.g.: the phone number changed, the new one is...",
      owner_email_label: "Your email",
      owner_submit: "Send request", owner_submit_sending: "Sending…",
      owner_note: "Manually reviewed by Amici di Boyle before any public change — no automatic updates.",
      owner_confirm: "✓ Request sent. We'll get back to you as soon as possible.",
      owner_error: "We couldn't send the request. Please try again, or email us directly at <a href=\"mailto:info@amicidiboyle.it\">info@amicidiboyle.it</a>.",
      footer_note: "If you manage one of these centers and want to report a correction or removal, email us at <a href=\"mailto:info@amicidiboyle.it\">info@amicidiboyle.it</a>.",
    },
  };

  var REGION_EN = {
    "Piemonte": "Piedmont", "Valle d'Aosta": "Aosta Valley", "Lombardia": "Lombardy",
    "Trentino-Alto Adige": "Trentino-South Tyrol", "Veneto": "Veneto",
    "Friuli-Venezia Giulia": "Friuli Venezia Giulia", "Liguria": "Liguria",
    "Emilia-Romagna": "Emilia-Romagna", "Toscana": "Tuscany", "Umbria": "Umbria",
    "Marche": "Marche", "Lazio": "Lazio", "Abruzzo": "Abruzzo", "Molise": "Molise",
    "Campania": "Campania", "Puglia": "Apulia", "Basilicata": "Basilicata",
    "Calabria": "Calabria", "Sicilia": "Sicily", "Sardegna": "Sardinia",
  };

  var lang = localStorage.getItem("db-lang") || "it";
  var changeListeners = [];

  function dbT(key, vars) {
    var dict = I18N[lang] || I18N.it;
    var str = dict[key] != null ? dict[key] : (I18N.it[key] || key);
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        str = str.split("{" + k + "}").join(vars[k]);
      });
    }
    return str;
  }
  function dbRegionName(nomeIt) {
    if (lang === "en" && REGION_EN[nomeIt]) return REGION_EN[nomeIt];
    return nomeIt;
  }

  function applyStaticI18n() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = dbT(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      el.innerHTML = dbT(el.getAttribute("data-i18n-html"));
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      el.setAttribute("placeholder", dbT(el.getAttribute("data-i18n-placeholder")));
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach(function (el) {
      el.setAttribute("aria-label", dbT(el.getAttribute("data-i18n-aria-label")));
    });
    document.querySelectorAll("[data-lang-opt]").forEach(function (el) {
      el.classList.toggle("is-active", el.getAttribute("data-lang-opt") === lang);
    });
  }

  function dbSetLang(newLang) {
    if (newLang !== "it" && newLang !== "en") return;
    lang = newLang;
    localStorage.setItem("db-lang", lang);
    applyStaticI18n();
    changeListeners.forEach(function (fn) { fn(lang); });
  }
  function dbOnLangChange(fn) { changeListeners.push(fn); }

  window.dbT = dbT;
  window.dbRegionName = dbRegionName;
  window.dbSetLang = dbSetLang;
  window.dbOnLangChange = dbOnLangChange;
  Object.defineProperty(window, "DB_LANG", { get: function () { return lang; } });

  /* script in fondo al body: il DOM e' gia' tutto presente a questo punto,
     non serve aspettare DOMContentLoaded. */
  applyStaticI18n();
  var btnDesktop = document.getElementById("lang-toggle-desktop");
  var btnMobile = document.getElementById("lang-toggle-mobile");
  function toggleLang() { dbSetLang(lang === "it" ? "en" : "it"); }
  if (btnDesktop) btnDesktop.addEventListener("click", toggleLang);
  if (btnMobile) btnMobile.addEventListener("click", toggleLang);
})();

(function () {
  "use strict";

  var overlay = document.getElementById("intro-overlay");
  var readoutMeters = document.getElementById("intro-readout-m");
  var readoutAta = document.getElementById("intro-readout-ata");
  var skipBtn = document.getElementById("intro-skip");
  var bubbleLayer = document.getElementById("intro-bubbles");
  var needle = document.querySelector(".intro-gauge__needle");
  var arcFg = document.getElementById("intro-arc-fg");
  var globeEl = document.getElementById("intro-globe");
  var titleEl = document.getElementById("intro-title");
  var wordDiving = document.getElementById("intro-word-diving");
  var wordBoyle = document.getElementById("intro-word-boyle");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add("gsap-ready");
  }

  function revealHomeContent() {
    if (!hasGsap || reduceMotion) return;
    // Le due card entrano come un mazzo che si apre: partono sovrapposte
    // al centro, ruotate come carte, e scivolano ognuna dalla propria
    // parte con un piccolo rimbalzo finale (back.out).
    gsap.utils.toArray(".db-path").forEach(function (el, i) {
      var fromSide = i === 0 ? -1 : 1;
      gsap.fromTo(el,
        { opacity: 0, x: fromSide * 90, y: 30, rotate: fromSide * 10, rotateY: fromSide * -18, scale: 0.88 },
        {
          opacity: 1, x: 0, y: 0, rotate: 0, rotateY: 0, scale: 1,
          duration: 0.85, delay: 0.15 + i * 0.16, ease: "back.out(1.5)",
        }
      );
    });
  }

  var introTimeline; // assegnata solo se hasGsap && !reduceMotion
  var introDone = false;
  function hideIntro() {
    if (introDone) return;
    introDone = true;
    if (introTimeline) introTimeline.kill();
    revealHomeContent();
    if (hasGsap) {
      gsap.to(overlay, {
        opacity: 0, duration: 0.45, ease: "power1.out",
        onComplete: function () { overlay.classList.add("is-hidden"); },
      });
    } else {
      overlay.classList.add("is-hidden");
    }
  }

  function legacyBubbles() {
    for (var i = 0; i < 16; i++) {
      var b = document.createElement("div");
      b.className = "intro-bubble";
      var size = 4 + Math.random() * 10;
      b.style.width = size + "px";
      b.style.height = size + "px";
      b.style.left = (Math.random() * 100) + "%";
      b.style.setProperty("--drift", (Math.random() * 60 - 30) + "px");
      b.style.animationDuration = (2.2 + Math.random() * 2.2) + "s";
      b.style.animationDelay = (Math.random() * 1.6) + "s";
      bubbleLayer.appendChild(b);
    }
  }

  if (reduceMotion) {
    hideIntro();
  } else {
    // tsParticles dava bolle che scattavano (JS/canvas troppo pesante per
    // un'animazione di 2 secondi) — tornate alle bolle CSS pure, che sono
    // solo opacity+transform e quindi sempre fluide.
    legacyBubbles();

    if (hasGsap) {
      // Timeline unica: globo -> zoom -> titolo -> gauge di profondità ->
      // flash. hideIntro() parte da onComplete, quindi la dissolvenza
      // scatta sempre esattamente a sequenza finita, mai a tempo indovinato.
      introTimeline = gsap.timeline({ onComplete: hideIntro });

      introTimeline
        .fromTo(globeEl, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" })
        .to({}, { duration: 0.35 }) // il globo resta a ruotare un istante
        .to(globeEl, { scale: 42, opacity: 0, duration: 0.85, ease: "power2.in" })
        .fromTo(wordDiving,
          { opacity: 0, x: -70, rotateY: -35 },
          { opacity: 1, x: 0, rotateY: 0, duration: 0.55, ease: "back.out(1.6)" }, "-=0.35")
        .fromTo(wordBoyle,
          { opacity: 0, x: 70, rotateY: 35 },
          { opacity: 1, x: 0, rotateY: 0, duration: 0.55, ease: "back.out(1.6)" }, "-=0.4")
        .to({}, { duration: 0.4 }) // titolo in evidenza
        .to(titleEl, { opacity: 0, duration: 0.35, ease: "power1.out" });

      var counter = { m: 0, ata: 1 };
      if (arcFg) {
        var len = arcFg.getTotalLength();
        arcFg.style.strokeDasharray = len;
        introTimeline.fromTo(arcFg, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.5, ease: "power3.out" });
      }
      introTimeline
        .fromTo(needle,
          { rotation: -108, transformOrigin: "110px 110px" },
          { rotation: 108, duration: 1.5, ease: "power3.out" }, "<")
        .to(counter, {
          m: 40, ata: 4, duration: 1.5, ease: "power3.out",
          onUpdate: function () {
            readoutMeters.textContent = counter.m.toFixed(0) + " m";
            readoutAta.textContent = counter.ata.toFixed(1) + " ATA";
          },
        }, "<");

      var glowEl = document.getElementById("intro-glow");
      if (glowEl) introTimeline.to(glowEl, { opacity: 0.9, scale: 1, duration: 1.5, ease: "power2.out" }, "<");

      var flashEl = document.getElementById("intro-flash");
      if (flashEl) {
        introTimeline
          .to(flashEl, { opacity: 1, duration: 0.15, ease: "power1.in" }, "-=0.15")
          .to(flashEl, { opacity: 0, duration: 0.5, ease: "power1.out" });
      }
    } else {
      overlay.classList.add("intro-fallback-anim");
      var DURATION = 1900, start = null;
      function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
      function tick(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / DURATION, 1);
        var eased = easeOutCubic(progress);
        readoutMeters.textContent = (eased * 40).toFixed(0) + " m";
        readoutAta.textContent = (1 + eased * 3).toFixed(1) + " ATA";
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      setTimeout(hideIntro, 2300);
    }
  }

  skipBtn.addEventListener("click", hideIntro);

  // Failsafe: se per qualche motivo hideIntro() non è mai scattata (device
  // lento, tab non attivo al caricamento, tween GSAP che non completa),
  // l'intro si chiude comunque in modo diretto, senza dipendere da GSAP.
  setTimeout(function () {
    if (introDone) return;
    introDone = true;
    if (introTimeline) introTimeline.kill();
    overlay.classList.add("is-hidden");
    document.querySelectorAll(".db-path").forEach(function (el) {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  }, 7000);

  /* ── scala di profondità: si riempie quando entra in viewport ── */
  if (hasGsap) {
    var fill = document.getElementById("depth-fill");
    if (fill) {
      gsap.fromTo(fill, { scaleX: 0 }, {
        scaleX: 1, duration: 1.3, ease: "power2.out",
        scrollTrigger: { trigger: ".depth-scale--divider", start: "top 85%" },
      });
    }
  }

  /* ── tilt 3D + bagliore che segue il cursore sui due riquadri
     principali. Solo su dispositivi con mouse vero (niente tilt fantasma
     su touch) e mai con reduced-motion: la card resta piatta, non un
     effetto rotto a metà. ── */
  var canTilt = !reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (canTilt) {
    document.querySelectorAll("[data-tilt]").forEach(function (card) {
      function onMove(e) {
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        var rx = (0.5 - py) * 9;
        var ry = (px - 0.5) * 9;
        card.style.transform = "perspective(1400px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg) translateY(-4px)";
        card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
        card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
      }
      card.addEventListener("mouseenter", function () {
        card.classList.add("is-tilting");
        card.addEventListener("mousemove", onMove);
      });
      card.addEventListener("mouseleave", function () {
        card.classList.remove("is-tilting");
        card.removeEventListener("mousemove", onMove);
        card.style.transform = "";
      });
    });
  }

  /* particelle di luce che salgono lentamente dentro le due card */
  if (!reduceMotion) {
    document.querySelectorAll(".db-path__sparks").forEach(function (layer) {
      for (var i = 0; i < 8; i++) {
        var s = document.createElement("span");
        s.className = "db-path__spark";
        s.style.left = (Math.random() * 100) + "%";
        s.style.setProperty("--drift", (Math.random() * 40 - 20) + "px");
        s.style.animationDuration = (5 + Math.random() * 4) + "s";
        s.style.animationDelay = (Math.random() * 6) + "s";
        layer.appendChild(s);
      }
    });
  }

  /* ── Toggle mobile del dropdown "Attività" — stessa logica di
     index.html: collassato di default, si apre solo al tap (classe
     .is-open), non più "sempre aperto" come nella versione precedente. ── */
  (function () {
    var dropdown = document.querySelector(".nav-dropdown");
    var btn = document.querySelector(".nav-dropdown-btn");
    var panel = document.querySelector(".nav-dropdown-panel");
    if (!dropdown || !btn || !panel) return;

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = dropdown.classList.contains("is-open");
      dropdown.classList.toggle("is-open", !open);
    });

    document.addEventListener("click", function () {
      dropdown.classList.remove("is-open");
    });

    panel.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        dropdown.classList.remove("is-open");
        var toggle = document.getElementById("nav-toggle");
        if (toggle) toggle.checked = false;
      });
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 768) dropdown.classList.remove("is-open");
    }, { passive: true });
  })();

  /* ── Chiudi il menu hamburger dopo il click su un link ── */
  (function () {
    var toggle = document.getElementById("nav-toggle");
    if (!toggle) return;
    document.querySelectorAll(".site-nav > a").forEach(function (a) {
      a.addEventListener("click", function () { toggle.checked = false; });
    });
  })();

})();
