# Boyle Lab

Il laboratorio virtuale di fisiologia degli ambienti estremi degli Amici di Boyle.
Pagina: `boyle-lab.html` (https://www.amicidiboyle.it/boyle-lab.html).

È uno strumento educativo e di ricerca. **Non** è un dispositivo medico, **non** è un pianificatore d'immersione e **non** serve a prescrivere l'ossigenoterapia iperbarica. Non registra dati sanitari: salva nel browser soltanto i parametri degli esperimenti.

## Architettura

Moduli ES puri: niente backend, niente build, niente librerie esterne. Funziona così com'è su GitHub Pages.

```
boyle-lab.html          pagina (header del sito, sotto-menu del laboratorio, contenitore #lab-app)
lab/
  app.js                routing (#/, #/base, #/advanced, #/catalogo, #/exp/<id>?param=…, #/modelli, #/bibliografia),
                        catalogo con ricerca e filtri, banco di lavoro, didattica, schede scientifiche, validazione
  lab.css               stile del laboratorio
  core/
    units.js            costanti e conversioni (unità SI all'interno; mmHg solo dove è la convenzione clinica)
    physics.js          idrostatica, Boyle, Charles, Gay-Lussac, Dalton, gas ideale, Archimede, atmosfera ISA
    physio.js           curva di Severinghaus, P50, equazione dei gas alveolari, CaO₂, DO₂, VO₂, O₂ER
    mixtures.js         pressioni parziali, MOD, EAD, END (convenzioni dichiarate), densità del gas
    kinetics.js         Haldane/Schreiner con gli emitempi N₂ di ZH-L16 (solo tensioni, nessuna tappa)
    registry.js         registro dei modelli: equazioni, variabili, ipotesi, limiti, fonti, revisione, stato
    refs.js             bibliografia (PMID e DOI degli articoli controllati su PubMed)
  ui/chart.js           grafici SVG (palette Okabe-Ito + tratteggi: leggibili con i deficit del colore)
  experiments/
    base.js             esperimenti BASE (moduli 5.1–5.5)
    advanced.js         esperimenti ADVANCED (moduli 6.1–6.10)
  tests/
    cases.js            banco di prova (gira anche nel browser, pagina "Modelli e validazione")
    run.mjs             esecuzione da riga di comando
```

## Regole scientifiche

- Ogni calcolo usa solo le funzioni di `lab/core` e rimanda a una voce di `registry.js`.
- Quattro categorie di modello, mostrate come badge: **modello fisico**, **modello fisiologico semplificato**, **modello didattico**, **modello da validare**.
- Niente equazioni, coefficienti o fonti inventati. Se mancano i dati il modulo esce come "in attesa di validazione" e non calcola nulla.
- Pressioni sempre assolute nelle leggi dei gas; FiO₂, PiO₂, PAO₂, PaO₂ e SaO₂/CaO₂ tenuti distinti nel codice e nelle etichette.
- Ogni valore atteso dei test è ricavato a mano o da tabelle pubblicate, non dal codice.

## Test

```
node lab/tests/run.mjs
```

Controlla i 28 casi e la coerenza del registro (ogni test e ogni fonte citati esistono). Gli stessi casi girano nel browser in `boyle-lab.html#/modelli`.

## Aggiungere un esperimento

1. Se serve una nuova equazione, scriverla in `lab/core/*`, con la fonte in `refs.js` e la voce in `registry.js`.
2. Aggiungere almeno un caso in `tests/cases.js` con il valore atteso calcolato a mano e la sua origine.
3. Aggiungere l'oggetto esperimento in `experiments/base.js` o `advanced.js`: `id`, `level`, `module`, `area` (A–F), `models`, `title`, `summary`, `tags`, `params`, `compute(p)` e, per il BASE, `didactic` (obiettivo, spiegazione, formula, errore comune, quiz, collegamento).
4. `node lab/tests/run.mjs`, poi provare la pagina.

## Stato dei moduli (26 ottobre 2026)

Pubblicati:

| Modulo | Esperimento |
|---|---|
| 5.1 | Legge di Boyle, Charles, Gay-Lussac, Dalton in profondità, densità del gas, Archimede e assetto |
| 5.2 | Ossigeno legato e disciolto (Henry), curva di dissociazione e P50, ossigeno in quota |
| 5.3 | La colonna d'acqua |
| 5.4 | La camera iperbarica |
| 5.5 | Confronto tra ambienti (mare, immersione, montagna, cabina, stazione spaziale, habitat marziano, Marte) |
| 6.1 | Analizzatore di miscele (PO₂, MOD con limite esplicito, EAD, END con convenzione dichiarata, densità) |
| 6.2 | Cinetica dei gas inerti (solo tensioni) |
| 6.3 | Equazione dei gas alveolari, gradiente A-a, P/F |
| 6.4 | Simulatore iperbarico |
| 6.6 | Ambiente ipobarico e aerospaziale |
| 6.9 | Trasporto di ossigeno (critical care) |
| 6.10 | Simulatore comparativo di tre scenari |

In attesa di validazione (scheda presente, nessun calcolo):

- 6.5 Monossido di carbonio (Coburn-Forster-Kane): servono parametri individuali validati.
- 6.7 Ambiente termico: servono coefficienti di scambio termico validati.
- 6.8 Apnea: consumo di O₂ e scambi in apnea richiedono un modello validato.
- Cinetica con elio (trimix) nel modulo 6.2.

Banco di lavoro: salvataggio locale, confronto A/B con grafici sovrapposti (Fissa come B), ripristino, esportazione CSV/JSON/SVG/PNG, link condivisibile con i parametri, modalità presentazione, schede scientifiche e fonti.

## Pubblicazione

Il sito è servito da GitHub Pages dal ramo `main`: basta un commit su `main`. Dopo una modifica a CSS o JS, aggiornare il parametro `?v=` nei link delle pagine (cache del browser).
