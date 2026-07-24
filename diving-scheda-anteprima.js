(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || typeof gsap === "undefined") return;

  gsap.fromTo(".compare-col", { opacity: 0, y: 24 }, {
    opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: "power2.out", delay: 0.1,
  });
  gsap.fromTo(".compare-arrow", { opacity: 0 }, { opacity: 0.6, duration: 0.5, delay: 0.5 });
})();
