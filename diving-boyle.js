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
