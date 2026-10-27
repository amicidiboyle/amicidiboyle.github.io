# Rete di Boyle 3D · anteprima beta

Pagina di prova: `rete-3d-beta.html` (noindex, non collegata dal menu, non in sitemap).

- `app.js`: elenco, ricerca, filtri per area, scheda della persona. Funziona anche senza 3D.
- `src/rete3d.js`: scena 3D (three.js 0.170). Si ricompila con
  `esbuild src/rete3d.js --bundle --format=esm --minify --outfile=rete3d.min.js` (three installato in node_modules).
- `rete3d.min.js`: file servito, circa 138 KB compressi, caricato solo quando la scena entra nello schermo.
- Miniature dei membri: `assets/rete/thumb/*.webp` (160 px, circa 5 KB l'una).

Le aree dei membri sono provvisorie (mappatura dei tag in `AREAS`, in entrambi i file).

## In produzione (27 ottobre 2026)
La scena 3D e' la hero di `rete.html`. `rete-3d-beta.html` reindirizza a `rete.html`.
Sotto la scena: azioni (candidatura, Amici, eventi, codice membro), "Esplora la Rete" (schema a cascata
rete → aree → persone, con lente sulla card completa), "Perche' entrare" a richiesta, eventi e Barometro.
La griglia originale delle card resta nella pagina, nascosta: `renderCard()` non e' stato toccato e le card
mostrate nella scheda e nella lente sono cloni di quelle della griglia (matita, email, profilo funzionano).
Testi in italiano e inglese: `app.js` segue l'attributo `lang` di `<html>`.
