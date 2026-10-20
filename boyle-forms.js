/* Gli Amici di Boyle · invio dei moduli allo script Google (boyle-forms.js)
   I moduli con data-boyle-form="..." puntano allo script Google al posto di
   Formspree. Il codice delle pagine continua a chiamare fetch(form.action,
   { body: new FormData(form) }): qui quella chiamata viene trasformata in un
   invio JSON che Apps Script sa leggere, con gli allegati in base64.
   Aggiunge anche un campo trappola per i bot e l'ora di apertura del modulo. */
(function () {
  'use strict';
  var FORMS_URL = 'https://script.google.com/macros/s/AKfycbwzgZvPxxW3yjA_Fa0_9GYINJO1QwBC_cT8sHhmRG5oDi3dJ9egqMGVznBcDIDP2ED_fQ/exec';
  var MAX_FILE = 6 * 1024 * 1024;
  var opened = Date.now();

  function prepare() {
    document.querySelectorAll('form[data-boyle-form]').forEach(function (f) {
      f.setAttribute('action', FORMS_URL);
      f.removeAttribute('enctype');
      if (!f.querySelector('input[name="_form"]')) add(f, '_form', f.getAttribute('data-boyle-form'));
      if (!f.querySelector('input[name="_gotcha"]')) {
        var hp = add(f, '_gotcha', '');
        hp.type = 'text'; hp.tabIndex = -1; hp.autocomplete = 'off';
        hp.setAttribute('aria-hidden', 'true');
        hp.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0';
      }
      if (!f.querySelector('input[name="_t"]')) add(f, '_t', String(opened));
      var lang = 'it';
      try { lang = sessionStorage.getItem('boyle_lang') || document.documentElement.lang || 'it'; } catch (e) {}
      if (!f.querySelector('input[name="_language"]')) add(f, '_language', lang);
    });
  }
  function add(f, name, value) {
    var i = document.createElement('input');
    i.type = 'hidden'; i.name = name; i.value = value;
    f.appendChild(i);
    return i;
  }

  function readFile(file) {
    return new Promise(function (resolve) {
      if (!file || !file.size || file.size > MAX_FILE) return resolve(null);
      var r = new FileReader();
      r.onload = function () { resolve(String(r.result).split(',')[1] || ''); };
      r.onerror = function () { resolve(null); };
      r.readAsDataURL(file);
    });
  }

  var nativeFetch = window.fetch.bind(window);
  window.fetch = function (url, opts) {
    if (String(url) !== FORMS_URL || !opts || !(opts.body instanceof FormData)) return nativeFetch(url, opts);
    var data = {}, jobs = [];
    opts.body.forEach(function (v, k) {
      if (typeof File !== 'undefined' && v instanceof File) {
        if (!v.size) return;
        jobs.push(readFile(v).then(function (b64) {
          if (b64) (data._files = data._files || []).push({ field: k, name: v.name, type: v.type, data: b64 });
        }));
      } else if (data[k] !== undefined) {
        data[k] = data[k] + ', ' + v;          // checkbox multipli
      } else {
        data[k] = v;
      }
    });
    return Promise.all(jobs).then(function () {
      return nativeFetch(FORMS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data),
        redirect: 'follow'
      });
    }).then(function (res) {
      return res.text().then(function (t) {
        var ok = res.ok;
        try { var j = JSON.parse(t); if (j && j.ok === false) ok = false; } catch (e) { ok = false; }
        return new Response(t, { status: ok ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
      });
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', prepare); else prepare();
})();
