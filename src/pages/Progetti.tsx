import React from "react";
import type { Lang } from "../i18n";
import { Section } from "../components/Section";

export default function Progetti({ lang }: { lang: Lang }) {
  return (
    <Section title={lang === "it" ? "Progetti e attività" : "Projects & activities"} kicker={lang === "it" ? "COSA FACCIAMO" : "WHAT WE DO"}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="text-lg font-semibold">{lang === "it" ? "Ricerca clinica" : "Clinical research"}</div>
          <div className="text-sm text-white/70 mt-2">
            {lang === "it"
              ? "Case report, protocolli, fisiologia in ambienti estremi e collaborazione multidisciplinare tra clinica e ingegneria."
              : "Case reports, protocols, extreme-environment physiology and multidisciplinary collaboration between clinicians and engineers."}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="text-lg font-semibold">{lang === "it" ? "Formazione" : "Training"}</div>
          <div className="text-sm text-white/70 mt-2">
            {lang === "it"
              ? "Didattica, lezioni e iniziative educative su medicina subacquea, iperbarica ed emergenza."
              : "Teaching, lectures and educational initiatives on diving & hyperbaric medicine and emergencies."}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="text-lg font-semibold">{lang === "it" ? "Divulgazione" : "Outreach"}</div>
          <div className="text-sm text-white/70 mt-2">
            {lang === "it"
              ? "Podcast, guide pratiche e strumenti leggeri per rendere accessibile la medicina degli ambienti estremi."
              : "Podcast, practical guides and lightweight tools to make extreme-environment medicine accessible."}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-xl font-semibold">HYPERCARE</div>
            <div className="text-sm text-white/70 mt-1">
              {lang === "it"
                ? "Corso avanzato di medicina d'emergenza e iperbarica per professionisti sanitari. Protocolli HBO, emergenze diving e rianimazione."
                : "Advanced emergency and hyperbaric medicine course for healthcare professionals. HBO protocols, diving emergencies and resuscitation."}
            </div>
            <div className="text-xs text-white/60 mt-2">
              {lang === "it" ? "Iscrizione e gestione tramite piattaforma esterna." : "Registration managed via an external platform."}
            </div>
          </div>

          <a
            href="https://yapla.com/checkout/GLI-AMICI-DI-BOYLE/HYPERCARE"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-3 rounded-2xl bg-ocean-300 text-ocean-950 font-semibold hover:brightness-110 text-center"
          >
            {lang === "it" ? "Vai alle iscrizioni" : "Go to registration"}
          </a>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-3xl border border-white/10 bg-ocean-900/20 p-6">
          <div className="font-semibold">{lang === "it" ? "Simulatore HBOT" : "HBOT simulator"}</div>
          <div className="text-sm text-white/70 mt-2">
            {lang === "it"
              ? "Una versione educativa e leggera è disponibile nella sezione Simulatore."
              : "A lightweight educational version is available in the Simulator section."}
          </div>
          <a className="inline-block mt-4 text-sm text-ocean-200 hover:text-white underline underline-offset-4" href="/simulatore">
            {lang === "it" ? "Apri simulatore →" : "Open simulator →"}
          </a>
        </div>

        <div className="rounded-3xl border border-white/10 bg-ocean-900/20 p-6">
          <div className="font-semibold">{lang === "it" ? "Centri iperbarici" : "Hyperbaric centers"}</div>
          <div className="text-sm text-white/70 mt-2">
            {lang === "it" ? "Sezione pronta per pubblicare una lista curata + link ufficiali." : "Ready section to publish a curated list + official links."}
          </div>
          <a className="inline-block mt-4 text-sm text-ocean-200 hover:text-white underline underline-offset-4" href="/centri">
            {lang === "it" ? "Vai ai centri →" : "Go to centers →"}
          </a>
        </div>
      </div>
    </Section>
  );
}
