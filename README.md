# Gli Amici di Boyle — Static Site (no monthly hosting)

This project è una versione **statica** e leggera del sito: niente server, niente database, niente canone mensile.

## Requisiti
- Node.js 18+ (consigliato 20+)

## Avvio in locale
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Deploy gratis (consigliato: Cloudflare Pages)
1. Crea un repo Git (GitHub) con questa cartella.
2. Cloudflare Pages → New project → collega repo.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Poi punta il dominio `amicidiboyle.it` a Pages (senza toccare gli MX delle email).

## Note
- I dati del team sono stati estratti dal vecchio backend e sono ora in `src/data/researchers.ts`.
- Le pagine Progetti/Podcast/Risorse sono placeholder pronti per importare i contenuti reali dal sito legacy.


## Pagine incluse
- Home
- Team
- Progetti (include link HYPERCARE su Yapla)
- Podcast (episodi da Spotify)
- Risorse (documenti già presenti nel vecchio progetto)
- Simulatore (educativo)
- Centri (placeholder per lista curata)


Language: default EN. Italian is available under /it.
