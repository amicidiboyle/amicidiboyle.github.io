export type Lang = "it" | "en";

export const t = (lang: Lang) => {
  const dict = {
    it: {
      navHome: "Home",
      navTeam: "Team",
      navProjects: "Progetti",
      navPodcast: "Podcast",
      navResources: "Risorse",
      navCongress: "Congressi",
      navSimulator: "Simulatore",
      navCenters: "Centri",
      navContact: "Contatti",
      ctaPrimary: "Esplora i progetti",
      ctaSecondary: "Contattaci",
      heroKicker: "SAFETY • FORMAZIONE • RICERCA",
      heroTitle: "GLI AMICI DI BOYLE",
      heroSubtitle: "Sicurezza in ambienti difficili: la terapia intensiva in prima linea incontra la medicina subacquea e iperbarica.",
      sectionTeam: "Il team",
      sectionProjects: "Cosa facciamo",
      sectionResources: "Risorse",
      sectionTraining: "Formazione",
      trainingSubtitle: "Dal livello base ai moduli avanzati: gestione del rischio e del paziente critico in ambienti complessi (inclusi scenari iperbarici e incidenti in tunnelling).",
      trainingCTA: "Richiedi un corso",
      congressTitle: "Congressi & attività",
      congressSubtitle: "Interventi, relazioni e partecipazioni del team. Aggiornabile in modo semplice.",
      footer: "© Gli Amici di Boyle. Tutti i diritti riservati."
    },
    en: {
      navHome: "Home",
      navTeam: "Team",
      navProjects: "Projects",
      navPodcast: "Podcast",
      navResources: "Resources",
      navCongress: "Congresses",
      navSimulator: "Simulator",
      navCenters: "Centers",
      navContact: "Contact",
      ctaPrimary: "Explore projects",
      ctaSecondary: "Contact us",
      heroKicker: "SAFETY • TRAINING • RESEARCH",
      heroTitle: "GLI AMICI DI BOYLE",
      heroSubtitle: "Sicurezza in ambienti difficili: la terapia intensiva in prima linea incontra la medicina subacquea e iperbarica.",
      sectionTeam: "Team",
      sectionProjects: "What we do",
      sectionResources: "Resources",
      sectionTraining: "Training",
      trainingSubtitle: "From fundamentals to advanced modules: risk management and critically ill trauma care in complex environments (including hyperbaric scenarios and tunnelling incidents).",
      trainingCTA: "Request training",
      congressTitle: "Congresses & activities",
      congressSubtitle: "Talks, lectures and participations by the team. Easy to update.",
      footer: "© Gli Amici di Boyle. All rights reserved."
    }
  } as const;
  return dict[lang];
};
