# Rete di Boyle 3D · anteprima beta

Pagina di prova: `rete-3d-beta.html` (noindex, non collegata dal menu, non in sitemap).

- `app.js`: elenco, ricerca, filtri per area, scheda della persona. Funziona anche senza 3D.
- `src/rete3d.js`: scena 3D (three.js 0.170). Si ricompila con
  `esbuild src/rete3d.js --bundle --format=esm --minify --outfile=rete3d.min.js` (three installato in node_modules).
- `rete3d.min.js`: file servito, circa 138 KB compressi, caricato solo quando la scena entra nello schermo.
- Miniature dei membri: `assets/rete/thumb/*.webp` (160 px, circa 5 KB l'una).

Le aree dei membri sono provvisorie (mappatura dei tag in `AREAS`, in entrambi i file).
