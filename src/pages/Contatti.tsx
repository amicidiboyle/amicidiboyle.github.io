import React from "react";
import type { Lang } from "../i18n";
import { Section } from "../components/Section";

export default function Contatti({ lang }: { lang: Lang }) {
  return (
    <Section title={lang === "it" ? "Contatti" : "Contact"}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="text-lg font-semibold">{lang === "it" ? "Scrivici" : "Write to us"}</div>
          <div className="text-sm text-white/70 mt-2">
            {lang === "it"
              ? "Per collaborazioni, consulenze, formazione e progetti scientifici."
              : "For collaborations, consultancy, training and scientific projects."}
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div><span className="text-white/60">Email:</span> <a className="text-ocean-200 hover:text-white" href="mailto:info@amicidiboyle.it">info@amicidiboyle.it</a></div>
            <div><span className="text-white/60">Sito:</span> <a className="text-ocean-200 hover:text-white" href="https://www.amicidiboyle.it" target="_blank" rel="noreferrer">www.amicidiboyle.it</a></div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="text-lg font-semibold">{lang === "it" ? "Nota privacy" : "Privacy note"}</div>
          <p className="text-sm text-white/70 mt-2">
            {lang === "it"
              ? "Questo sito statico non traccia login né conserva dati. Se aggiungeremo un form, useremo solo invio email (senza database)."
              : "This static site has no logins and stores no data. If we add a form, it will only send email (no database)."}
          </p>
        </div>
      </div>
    </Section>
  );
}
