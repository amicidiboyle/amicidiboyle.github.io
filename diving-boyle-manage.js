(function () {
  "use strict";

  var openBtn = document.getElementById("manage-open-btn");
  var modal = document.getElementById("manage-modal");
  var closeBtn = document.getElementById("manage-modal-close");
  var backdrop = document.getElementById("manage-modal-backdrop");
  var gate = document.getElementById("manage-gate");
  var gateForm = document.getElementById("manage-gate-form");
  var codeInput = document.getElementById("manage-code-input");
  var editor = document.getElementById("manage-editor");
  var editorNome = document.getElementById("manage-editor-nome");

  var form = document.getElementById("manage-form");
  var confirmMsg = document.getElementById("manage-form-confirm");

  var fNome = document.getElementById("m-nome");
  var fComune = document.getElementById("m-comune");
  var fRegione = document.getElementById("m-regione");
  var fDesc = document.getElementById("m-desc");
  var flagIperbarica = document.getElementById("m-flag-iperbarica");
  var flagPadi = document.getElementById("m-flag-padi");
  var flagGrotte = document.getElementById("m-flag-grotte");

  var mpLogo = document.getElementById("mp-logo");
  var mpNome = document.getElementById("mp-nome");
  var mpLoc = document.getElementById("mp-loc");
  var mpDesc = document.getElementById("mp-desc");
  var mpTags = document.getElementById("mp-tags");

  if (!openBtn || !modal) return;

  function openModal() {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    gate.hidden = false;
    editor.hidden = true;
    confirmMsg.hidden = true;
    codeInput.value = "";
    codeInput.focus();
  }
  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }

  openBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  backdrop.addEventListener("click", closeModal);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });

  // Anteprima: qui qualsiasi codice non vuoto "sblocca" una scheda
  // d'esempio, cosi' si vede subito com'e' l'esperienza di modifica.
  // Il controllo vero del codice arriva col backend (Apps Script).
  gateForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!codeInput.value.trim()) return;
    gate.hidden = true;
    editor.hidden = false;
    updatePreview();
    if (typeof gsap !== "undefined") {
      gsap.fromTo(editor, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
    }
  });

  function initials(nome) {
    return nome.split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase();
  }

  function updatePreview() {
    var nome = fNome.value.trim() || "Il tuo diving";
    mpNome.textContent = nome;
    mpLogo.textContent = initials(nome);
    editorNome.textContent = nome;
    mpLoc.textContent = (fComune.value.trim() || "Comune") + " · " + (fRegione.value.trim() || "Regione");
    mpDesc.textContent = fDesc.value.trim();

    var tags = [];
    if (flagIperbarica.checked) tags.push("Camera Iperbarica");
    if (flagPadi.checked) tags.push("PADI 5★");
    if (flagGrotte.checked) tags.push("Grotte");
    mpTags.innerHTML = tags.map(function (t) {
      return '<span class="diving-tag-preview">' + t + "</span>";
    }).join("");
  }

  [fNome, fComune, fRegione, fDesc].forEach(function (el) {
    el.addEventListener("input", updatePreview);
  });
  [flagIperbarica, flagPadi, flagGrotte].forEach(function (el) {
    el.addEventListener("change", updatePreview);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    confirmMsg.hidden = false;
  });
})();
