import React from "react";
import type { Lang } from "../i18n";
import { Section } from "../components/Section";

export default function Centri({ lang }: { lang: Lang }) {
  return (
    <Section title={lang === "it" ? "Centri Iperbarici" : "Hyperbaric centers"}>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/80 leading-relaxed space-y-4">
        <p>
          {lang === "it"
            ? "Nel sito originale c’era un localizzatore completo. In questa versione statica possiamo: (1) linkare a una fonte autorevole sempre aggiornata, oppure (2) pubblicare una lista curata da noi (PDF/CSV) che aggiorni quando vuoi."
            : "The original site included a full locator. In this static version we can: (1) link to an authoritative always-updated source, or (2) publish a curated list (PDF/CSV) that you update whenever you want."}
        </p>

        <div className="rounded-2xl border border-white/10 bg-ocean-900/20 p-4">
          <div className="font-semibold">{lang === "it" ? "Scelta consigliata" : "Recommended approach"}</div>
          <div className="text-sm text-white/70 mt-1">
            {lang === "it"
              ? "Lista curata (download) + link esterno ufficiale. Zero manutenzione tecnica, massima affidabilità."
              : "Curated downloadable list + official external link. Zero technical maintenance, maximum reliability."}
          </div>
        </div>

        <p className="text-sm text-white/60">
          {lang === "it"
            ? "Quando mi dai la fonte o un file (anche Excel), lo impagino qui con ricerca e filtri."
            : "When you provide the source or a file (even Excel), I’ll format it here with search and filters."}
        </p>
      </div>
    </Section>
  );
}
