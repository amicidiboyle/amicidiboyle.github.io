Sto lavorando a una Web App Google Apps Script per gestire candidature e membri del progetto “Boyle”.

Contesto tecnico attuale:

* progetto Apps Script con file:

  * Code.gs
  * Admin.html
  * eventualmente TrashView.html
* la Web App fa login admin, legge/scrive su Google Sheets, gestisce cestino, esporta JSON e pubblica membri su GitHub nel file `rete-members.json`
* Google Sheet principale:

  * tab principale: `ADMIN_DATA`
  * tab cestino: `CESTINO_ADMIN`
* headers richiesti nel foglio principale:

  * ID_BOYLE
  * TIPO
  * NOME
  * EMAIL
  * STATO_BOYLE
  * CODICE_BOYLE
  * NOTE_ADMIN
  * DATA_GESTIONE

Configurazione tramite Script Properties:

* SHEET_ID
* ADMIN_PASSWORD
* GITHUB_TOKEN

Repo GitHub usato:

* `amicidiboyle/amicidiboyle.github.io`
* file pubblicato: `rete-members.json`

Funzionalità previste:

1. login admin
2. visualizzazione candidature
3. filtri per tipo/stato/ricerca
4. aggiornamento stato/codice/note
5. cestino con spostamento e svuotamento
6. export JSON
7. pubblicazione membri su GitHub
8. visualizzazione membri già pubblicati online
9. rimozione membri già pubblicati

Problemi affrontati in precedenza:

* `getAdminData()` si rompeva per serializzazione di Date, risolto usando `getDisplayValues()`
* login non entrava probabilmente per confronto password troppo rigido, corretto usando `trim()`
* la sezione “Rete di Boyle – Online” non si vedeva perché era strutturata male nel DOM
* servono coerenza e allineamento tra `Code.gs` e `Admin.html`

Cosa voglio da te in questa nuova chat:

* analizzare i file attuali come sistema completo
* trovare bug reali e non fare finta che vada tutto bene
* proporre correzioni precise
* se serve, riscrivere i file completi pronti da incollare
* mantenere tono pratico e diretto
* se individui assunzioni sbagliate, contestamele chiaramente
