/**
 * Extracted from the legacy Replit project (server/storage.ts).
 * This is now static data (no backend required).
 */
export type Researcher = {
  name: string;
  title: string;
  imgSrc: string;
  businessCard?: string;
  photoZoom?: string;
  bio?: string;
  email?: string;
  phone?: string;
  location?: string;
  specialties?: string[];
  publications?: string[];
  achievements?: string[];
};

export const researchers: Researcher[] = [
      {
        name: "Dott. Silvio Zerbi",
        title: "Anesthesiologist, Intensivist, Diving and Hyperbaric Medicine Physician",
        imgSrc: "/attached_assets/IMG_20250702_185404_1751732848689.jpg",
        businessCard: "/attached_assets/silvio zerbi_1753444987815.png",
        photoZoom: "0.8",
        bio: `
          <p>Medico Anestesista Rianimatore con formazione ventennale in Terapia Intensiva e formazione specialistica in medicina subacquea ed iperbarica, avionica ed aerospaziale. La sua attività professionale si concentra sulla gestione del paziente critico con particolare competenza nella gestione del trauma maggiore e delle patologie legate alle attività subacquee e all'ossigenoterapia iperbarica. Studioso della fisica dell'ambiente sommerso e Dive Master della Scuba Schools International.</p>

          <h4>Formazione e Specializzazioni</h4>
          <ul>
            <li>Laurea in Medicina e Chirurgia</li>
            <li>Specializzazione in Anestesia e Rianimazione</li>
            <li>Master di II Livello in Medicina Iperbarica e Subacquea</li>
            <li>Diving Medicine Physician Level 2D of The European Committee for Hyperbaric Medicine</li>
            <li>Hyperbaric Medicine Physician Level 2H of The European College Of Baromedicine</li>
            <li>Formazione avanzata in gestione delle emergenze come Medico MSA AREU 118</li>
            <li>Master in Medicina Avionica ed Aerospaziale</li>
          </ul>

          <h4>Esperienza Professionale</h4>
          <ul>
            <li>Medico Rianimatore in ICU. Trauma Center — ASST Sette Laghi - Varese</li>
            <li>Medico MSA presso Servizio 118</li>
            <li>Consulente in Medicina Iperbarica</li>
            <li>Formatore per emergenze in ambiente estremo</li>
          </ul>

          <h4>Ricerca e Contributi</h4>
          <ul>
            <li>Fondatore del gruppo di ricerca e divulgazione scientifica: Gli amici di Boyle</li>
            <li>Docente di Medicina Iperbarica e Subacquea presso l'Università degli Studi Dell'Insubria e delle scuole di specializzazione di Medicina d'Urgenza ed Emergenza e Anestesia e Rianimazione</li>
          </ul>

          <h4>Certification Skills</h4>
          <ul>
            <li>Diving commercial (offshore, inshore, inland, civil engineering)</li>
            <li>Diving others (SAR, scientific, multi-media, dive leaders, military)</li>
            <li>Compressed air work (CAW) others (staff of HBOT-chambers, SAR, scientific, technical)</li>
            <li>Compressed air work (CAW) commercial (tunnelling, caisson work)</li>
            <li>Surface personnel at diving worksite</li>
          </ul>

          <h4>Missioni e Operazioni Speciali</h4>
          <ul>
            <li>Medico di bordo per operazioni di recupero 31° stormo Aeronautica Militare Italiana</li>
          </ul>
        `
      },
      {
        name: "Ing. Luigi Tarsia",
        title: "Ingegnere Nucleare e Biomedico, Specialista in Medicina Subacquea ed Iperbarica, Avionica ed Aerospaziale",
        imgSrc: "/researchers/luigi_tarsia.jpg",
        businessCard: "/attached_assets/IMG_20250725_110519_1753434340413.jpg",
        photoZoom: "1.0",
        bio: `
          <p>Ingegnere Nucleare e Biomedico con formazione specialistica ventennale in medicina subacquea ed iperbarica, avionica ed aerospaziale. La sua attività professionale integra le conoscenze ingegneristiche avanzate con applicazioni specifiche nel campo della medicina iperbarica, con particolare competenza nella progettazione e gestione di sistemi di supporto vitale in ambienti iperbarici.</p>

          <h4>Formazione e Specializzazioni</h4>
          <ul>
            <li>Laurea in Ingegneria Nucleare</li>
            <li>Specializzazione in Ingegneria Biomedica</li>
            <li>Master di II Livello in Medicina Iperbarica e Subacquea</li>
            <li>Diving Medicine Physician Level 2D of The European Committee for Hyperbaric Medicine</li>
            <li>Hyperbaric Medicine Physician Level 2H of The European College Of Baromedicine</li>
            <li>Certificazioni avanzate in Avionica ed Aerospaziale</li>
            <li>Formazione specialistica in sicurezza e manutenzione di impianti iperbarici</li>
          </ul>

          <h4>Esperienza Professionale</h4>
          <ul>
            <li>Ingegnere Senior per centri di medicina iperbarica</li>
            <li>Progettista di sistemi di sicurezza avanzati per camere iperbariche</li>
            <li>Sviluppatore di software di monitoraggio ambientale per medicina iperbarica</li>
            <li>Consulente tecnico per la progettazione e manutenzione di impianti iperbarici</li>
            <li>Formatore tecnico specializzato per personale operante in ambiente iperbarico</li>
          </ul>

          <h4>Certification Skills</h4>
          <ul>
            <li>Hyperbaric chamber design and safety systems</li>
            <li>Compressed air work (CAW) technical operations</li>
            <li>Advanced monitoring systems for hyperbaric environments</li>
            <li>Safety protocols for HBOT facilities</li>
            <li>Technical consultation for diving medicine applications</li>
          </ul>

          <h4>Ricerca e Contributi</h4>
          <ul>
            <li>Co-fondatore del gruppo di ricerca e divulgazione scientifica: Gli amici di Boyle</li>
            <li>Sviluppatore di soluzioni tecnologiche innovative per migliorare la sicurezza dei trattamenti iperbarici</li>
            <li>Consulente tecnico per progetti di ricerca in medicina iperbarica presso università e centri di ricerca</li>
          </ul>

          <h4>Innovazioni Tecnologiche</h4>
          <ul>
            <li>Progettazione di sistemi avanzati di monitoraggio per camere iperbariche</li>
            <li>Sviluppo di protocolli di sicurezza integrati per ambienti iperbarici</li>
          </ul>
        `
      },
      {
        name: "Dott. Dario Nicosia",
        title: "Anestesista Rianimatore, Intensivista, Specialista in Medicina Subacquea ed Iperbarica, Medico HEMS 118",
        imgSrc: "/researchers/dario_nicosia.jpg",
        businessCard: "/attached_assets/dario nicosia_1753444987809.png",
        photoZoom: "5.0",
        bio: `
          <p>Medico Anestesista Rianimatore nato a Palermo nel 1987, con specializzazione in Anestesia, Rianimazione, Terapia Intensiva e del Dolore. Attualmente Dirigente Medico presso l'AOUP "Paolo Giaccone" di Palermo e Medico Anestesista Rianimatore per il Servizio 118 Sicilia su ambulanze ed eliambulanze.</p>

          <h4>Formazione Accademica e Specializzazioni</h4>
          <ul>
            <li><strong>2013:</strong> Laurea Magistrale in Medicina e Chirurgia - Università di Palermo (110/110 cum laude)</li>
            <li><strong>2020:</strong> Specializzazione in Anestesia, Rianimazione, Terapia Intensiva e del Dolore - Università di Palermo (50/50 cum laude)</li>
            <li><strong>2022:</strong> Master di II Livello in Terapia del Dolore - Università di Palermo (100/100 cum laude)</li>
            <li><strong>2024:</strong> Master di II Livello in Medicina Subacquea ed Iperbarica - Università di Padova (Ottimo)</li>
            <li><strong>2025:</strong> Certificate in Hyperbaric Medicine Level 2H - European College of Baromedicine</li>
            <li><strong>2025:</strong> Certificate in Diving Medicine Level 2D - European College of Baromedicine</li>
            <li><strong>2024:</strong> Certificate in Diving Medicine Level 1 - Medical Examiner of Divers</li>
          </ul>

          <h4>Certificazioni Specialistiche Recenti</h4>
          <ul>
            <li><strong>2024:</strong> Pediatric Advanced Life Support (PALS) - AHA Provider</li>
            <li><strong>2024:</strong> Advanced Trauma Life Support (ATLS) - ACS Provider</li>
            <li><strong>2024:</strong> Advanced Cardiac Life Support (ACLS) - AHA Provider</li>
            <li><strong>2022:</strong> Autorizzazione Medico di Bordo - Ministero della Salute</li>
            <li><strong>2024:</strong> Revisore per UHMJ (Undersea and Hyperbaric Medical Journal)</li>
            <li><strong>2024:</strong> Membro UHMS (Undersea and Hyperbaric Medical Society)</li>
          </ul>

          <h4>Esperienza Professionale Attuale</h4>
          <ul>
            <li><strong>Nov 2021-oggi:</strong> Medico Anestesista Rianimatore - Servizio 118 Sicilia
              <br/>• Postazioni ambulanze "01" Termini Imerese e "05" Cefalù
              <br/>• Eliambulanze presso Elibasi Palermo Boccadifalco, Pantelleria e Lampedusa</li>
            <li><strong>Ott 2021-oggi:</strong> Dirigente Medico Anestesista Rianimatore - AOUP "Paolo Giaccone" Palermo
              <br/>• Terapia Intensiva Polivalente (17 posti letto)
              <br/>• Medicina iperbarica e camera iperbarica</li>
          </ul>

          <h4>Esperienza Internazionale</h4>
          <ul>
            <li><strong>2019-2020:</strong> Medecin Interne en Anesthesie et Réanimation
              <br/>Centre Hospitalier Universitaire de Grenoble Alpes, Francia
              <br/>• Chirurgia digestiva e trapianti, cardiochirurgia, neurochirurgia
              <br/>• Rianimazione polivalente chirurgica (19 posti letto)</li>
          </ul>

          <h4>Servizio Militare e Volontariato</h4>
          <ul>
            <li><strong>2016-oggi:</strong> Tenente Medico in C.G.D. - Croce Rossa Italiana Corpo Militare
              <br/>• Responsabile medico Centro di Mobilitazione Sicilia
              <br/>• Attività disinnesco ordigni bellici (D.O.B.)
              <br/>• Ufficiale medico R.O.P.I. (Reparto Operativo Pronto Impiego) Sicilia
              <br/>• Emergenza sbarchi Lampedusa e Covid-19</li>
          </ul>

          <h4>Onorificenze e Riconoscimenti</h4>
          <ul>
            <li>Elogio scritto Comandante XII Centro Mobilitazione Palermo (2017)</li>
            <li>Elogio Ispettore Nazionale Corpo Militare CRI (2022)</li>
            <li>Medaglia benemerenza "Il tempo della Gentilezza" classe bronzo per servizio emergenza Covid-19</li>
            <li>Ammissione al premio di laurea "Enrico Albanese"</li>
          </ul>

          <h4>Attività Scientifica e Pubblicazioni</h4>
          <ul>
            <li><strong>2024:</strong> "Portal gas embolism after bleach ingestion: the role of hyperbaric oxygen therapy" - J Emerg Crit Care Med</li>
            <li><strong>2024:</strong> "Cerebral fat embolism after traumatic long-bone fracture: A case report" - Clin Case Rep</li>
            <li><strong>2024:</strong> "Difficult intubation in critical patient: how can we manage it?" - Front Emerg Med</li>
            <li><strong>2019:</strong> "Use of low dose of rFVIIa to control late bleeding after percutaneous dilational tracheostomy" - Clin Case Rep</li>
          </ul>

          <h4>Partecipazione a Studi Multicentrici</h4>
          <ul>
            <li>REMAP-CAP TRIAL (Co-investigator)</li>
            <li>ANDROMEDA SHOCK-2 (Co-investigator)</li>
            <li>ITA OTI STUDY (Co-investigator)</li>
          </ul>

          <h4>Attività Didattica e Formazione</h4>
          <ul>
            <li>Docente modulo "Diagnostica strumentale apparato respiratorio" - Liceo Scientifico Cannizzaro Palermo</li>
            <li>Docente BLSD e "Stop the Bleed" - Corso Mine Risk Education, 46° Reggimento Trasmissioni Palermo</li>
            <li>Co-fondatore del gruppo di ricerca e divulgazione scientifica: Gli amici di Boyle</li>
          </ul>
        `
      },
      {
        name: "Dott. Vincenzo Benenati",
        title: "Anestesista Rianimatore, Specialista in Terapia Intensiva, Esperto ECMO e Medicina Iperbarica",
        imgSrc: "/attached_assets/IMG-20250619-WA0005_1750424383144.jpg",
        businessCard: "/attached_assets/vincenzo benenati_1753444987817.png",
        photoZoom: "0.95",
        bio: `
          <p>Anestesista-rianimatore con specializzazione in terapia intensiva e cardio-rianimazione, appassionato di ECMO V-V ed antibioticoterapia nel malato critico. Esperienza internazionale in Francia con formazione avanzata in ECMO e neurorianimazione presso prestigiose istituzioni europee.</p>

          <h4>Istruzione e Formazione</h4>
          <ul>
            <li><strong>2005-2011:</strong> Laurea in Medicina e Chirurgia - Università degli Studi di Palermo</li>
            <li><strong>2012-2017:</strong> Specializzazione in Anestesia, Rianimazione, Terapia Intensiva e Terapia del Dolore - Università di Palermo</li>
            <li><strong>2023-Attuale:</strong> Master in Camera Iperbarica e Medicina Subacquea - Università di Padova</li>
            <li><strong>2017-2018:</strong> DUNE - Diplome Universitaire Neuroreanimation - Sorbonne Université, Paris</li>
            <li><strong>2019-2020:</strong> Diplome Inter Universitaire ECMO - AP-HP Pitié Salpêtrière (Prof. Alain Combes)</li>
            <li><strong>2024:</strong> ECMO Veno Venoso: Corso Teorico-Pratico - Università Sapienza, Roma</li>
          </ul>

          <h4>Esperienza Professionale</h4>
          <ul>
            <li><strong>Feb 2022-Attuale:</strong> Anestesista-Rianimatore presso AOUP "Paolo Giaccone", Palermo
              <br/>- Sale operatorie generali e specialistiche
              <br/>- Terapia intensiva polivalente
              <br/>- Emergenze ed urgenze intra ed extra ospedaliere
              <br/>- Camera iperbarica</li>
            <li><strong>Ott 2017-Nov 2018:</strong> Anestesista Rianimatore presso HEGP, Hopitàl Européen, Parigi
              <br/>- Cardiochirurgia generale e patologie congenite dell'adulto
              <br/>- Chirurgia dei trapianti d'organo solido (cuore e polmoni)
              <br/>- Terapia intensiva postoperatoria specialistica</li>
            <li><strong>Nov 2018-Gen 2021:</strong> Anestesista/Rianimatore presso Polyclinique du Maine
              <br/>- Sale operatorie multidisciplinari (Generale, Urologica, Ginecologica, Vascolare, Toracica, Ortopedica, Oculistica)</li>
            <li><strong>Gen 2021-Gen 2022:</strong> Anestesista/Rianimatore presso Clinique des Cedres, Toulouse, Francia</li>
          </ul>

          <h4>Certificazioni e Competenze Specialistiche</h4>
          <ul>
            <li>Francese Livello Avanzato - FLE Professionnel (CLOE) Niveau C2</li>
            <li>Inglese Livello Intermedio</li>
            <li>Focused on Critical Ultrasound - Winfocus Basic ECHO (2016)</li>
            <li>Corso Teorico Base Ecografia Transesofagea - BEST ITACTA, Catania (2017)</li>
            <li>Formazione Corrispondente Emovigilanza - Etablissement Francais du sang (2019)</li>
            <li>Certificazione ECMO europea rilasciata dal Prof. Alain Combes</li>
          </ul>

          <h4>Competenze Tecniche</h4>
          <ul>
            <li>ECMO V-V (Veno-Venoso) - Formazione specialistica avanzata</li>
            <li>Antibioticoterapia nel malato critico</li>
            <li>Gestione delle vie aeree difficili</li>
            <li>Cardiochirurgia e trapianti d'organo</li>
            <li>Neurorianimazione e monitoraggio neurofisiologico</li>
            <li>Medicina iperbarica e camera iperbarica</li>
            <li>Capacità decisionali e gestione dello stress</li>
            <li>Collaborazione interdisciplinare</li>
          </ul>

          <h4>Pubblicazioni Scientifiche</h4>
          <ul>
            <li><strong>2011:</strong> "Contemporary results after surgical repair of type A aortic dissection in patients aged 80 years and older: a systematic review and meta-analysis" - Eur J Cardiothorac Surg</li>
            <li><strong>2017:</strong> "Use of a Real-Time Training Software (Laerdal QCPR) Compared to Instructor-Based Feedback for High-Quality Chest Compressions Acquisition" - PLoS One</li>
            <li><strong>2020:</strong> "Multidisciplinary Approach to the Diagnosis and In-hospital Management of COVID-19 Infection: A Narrative Review" - Frontiers in Pharmacology</li>
          </ul>

          <h4>Formazione Internazionale</h4>
          <ul>
            <li><strong>2009:</strong> Exchange Program - Univerzitetni Klinicni Center, Ljubljana, Slovenia</li>
            <li><strong>2011-2012:</strong> Erasmus Exchange Program - University of Oulu, Finlandia</li>
          </ul>
        `
      },
      {
        name: "Dott. Matteo Paganini",
        title: "Ricercatore in Medicina d'Emergenza e Medicina Subacquea ed Iperbarica",
        imgSrc: "/researchers/matteo_paganini.jpg",
        businessCard: "/attached_assets/matteo paganini_1753444987813.png",
        bio: `
          <p>Medico Ricercatore con formazione ventennale in medicina d'emergenza-urgenza e formazione specialistica in medicina subacquea ed iperbarica. La sua attività professionale integra ricerca scientifica avanzata, insegnamento universitario e pratica clinica con particolare competenza nell'innovazione terapeutica.</p>

          <h4>Formazione e Specializzazioni</h4>
          <ul>
            <li>Laurea in Medicina e Chirurgia</li>
            <li>Specializzazione in Medicina d'Emergenza-Urgenza</li>
            <li>Master di II Livello in Medicina Iperbarica e Subacquea</li>
            <li>Diving Medicine Physician Level 2D of The European Committee for Hyperbaric Medicine</li>
            <li>Hyperbaric Medicine Physician Level 2H of The European College Of Baromedicine</li>
            <li>Dottorato di Ricerca in Scienze Mediche</li>
            <li>Diploma in Medicina Subacquea ed Iperbarica</li>
            <li>European Master in Disaster Medicine</li>
            <li>Formazione avanzata in metodologia della ricerca clinica</li>
          </ul>

          <h4>Esperienza Professionale</h4>
          <ul>
            <li>Ricercatore universitario in Medicina d'Emergenza</li>
            <li>Medico di emergenza-urgenza</li>
            <li>Consulente in medicina subacquea e iperbarica</li>
            <li>Docente in corsi di formazione e aggiornamento</li>
            <li>Collaboratore di centri di ricerca internazionali</li>
          </ul>

          <h4>Certification Skills</h4>
          <ul>
            <li>Diving commercial (offshore, inshore, inland, civil engineering)</li>
            <li>Diving others (SAR, scientific, multi-media, dive leaders, military)</li>
            <li>Compressed air work (CAW) others (staff of HBOT-chambers, SAR, scientific, technical)</li>
            <li>Compressed air work (CAW) commercial (tunnelling, caisson work)</li>
            <li>Surface personnel at diving worksite</li>
          </ul>

          <h4>Ricerca e Contributi</h4>
          <ul>
            <li>Co-fondatore del gruppo di ricerca e divulgazione scientifica: Gli amici di Boyle</li>
            <li>Sviluppo di protocolli innovativi per l'ossigenoterapia iperbarica in emergenza</li>
            <li>Ricerca avanzata nell'ambito della medicina d'emergenza e iperbarica</li>
          </ul>

          <h4>Progetti di Ricerca e Innovazioni</h4>
          <ul>
            <li>Protocolli di emergenza per trattamento iperbarico rapido</li>
            <li>Applicazioni dell'ossigenoterapia iperbarica in condizioni acute</li>
            <li>Metodologie innovative per la medicina d'emergenza subacquea</li>
          </ul>
        `
      }
    ] as any;
