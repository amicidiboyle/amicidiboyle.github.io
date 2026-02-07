import React from "react";
import { Link } from "wouter";
import type { Lang } from "../i18n";
import { t } from "../i18n";
import { Section } from "../components/Section";
import { researchers } from "../data/researchers";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
      {children}
    </span>
  );
}

export default function Home({ lang }: { lang: Lang }) {
  const tr = t(lang);
  const top = researchers.slice(0, 5);

  return (
    <div>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(58,103,214,0.28),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(122,160,255,0.18),transparent_55%)]" />
        <div className="max-w-6xl mx-auto px-4 pt-14 pb-10 relative">
          <div className="flex flex-wrap gap-2 mb-6">
            <Pill>Hyperbaric</Pill>
            <Pill>Diving</Pill>
            <Pill>Extreme Environments</Pill>
            <Pill>Education</Pill>
            <Pill>Research</Pill>
          </div>

          <div className="text-xs tracking-[0.25em] text-white/60">{tr.heroKicker}</div>
          <h1 className="mt-3 text-4xl md:text-6xl font-extrabold glow">
            {tr.heroTitle}
          </h1>
          <p className="mt-4 text-white/80 max-w-2xl">
            {tr.heroSubtitle}
          </p>

<div className="mt-4 max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-white/80">
  <div className="font-semibold">Il tratto distintivo</div>
  <div className="mt-1">
    Siamo medici di Terapia Intensiva ed Emergenza-Urgenza (più un ingegnere “contaminato” dalla clinica):
    non i “soliti” iperbarici. Il nostro focus è <span className="text-ocean-200 font-semibold">Safety in difficult environments</span>:
    decisioni rapide, gestione del rischio e fisiologia applicata quando le cose si complicano.
  </div>
</div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/progetti">
              <a className="px-5 py-3 rounded-2xl bg-ocean-300 text-ocean-950 font-semibold hover:brightness-110">
                {tr.ctaPrimary}
              </a>
            </Link>
            <Link href="/contatti">
              <a className="px-5 py-3 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10">
                {tr.ctaSecondary}
              </a>
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: lang === "it" ? "Clinica" : "Clinical", desc: lang === "it" ? "Supporto al paziente critico e consulenza iperbarica." : "Critical care support and hyperbaric consultancy." },
              { title: lang === "it" ? "Formazione" : "Training", desc: lang === "it" ? "Corsi, didattica, divulgazione scientifica." : "Courses, teaching and scientific outreach." },
              { title: lang === "it" ? "Ricerca" : "Research", desc: lang === "it" ? "Progetti, casi clinici, pubblicazioni e network." : "Projects, case reports, publications and network." },
            ].map((c) => (
              <div key={c.title} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="text-lg font-semibold">{c.title}</div>
                <div className="text-sm text-white/70 mt-2">{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Section title={tr.sectionTeam} kicker={lang === "it" ? "CHI SIAMO" : "WHO WE ARE"}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {top.map((r) => (
            <div key={r.name} className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="aspect-[4/3] bg-ocean-900/30">
                <img src={r.imgSrc} alt={r.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <div className="font-semibold">{r.name}</div>
                <div className="text-xs text-white/70 mt-1 line-clamp-2">{r.title}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Link href="/team">
            <a className="text-sm text-ocean-200 hover:text-white underline underline-offset-4">
              {lang === "it" ? "Vedi il team completo →" : "See full team →"}
            </a>
          </Link>
        </div>
      </Section>

      <Section title={tr.sectionProjects} kicker={lang === "it" ? "MISSIONE" : "MISSION"}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: lang === "it" ? "Medicina subacquea e iperbarica" : "Diving & hyperbaric medicine",
              desc: lang === "it" ? "Prevenzione, diagnosi e trattamento delle patologie immersione-correlate e applicazioni cliniche dell’HBOT." : "Prevention, diagnosis and treatment of dive-related illness and clinical HBOT applications.",
            },
            {
              title: lang === "it" ? "Fisiologia in ambienti estremi" : "Extreme environment physiology",
              desc: lang === "it" ? "Pressione, ipossia, iperossia, microgravità: cosa succede davvero al corpo umano." : "Pressure, hypoxia, hyperoxia, microgravity: what really happens to the human body.",
            },
            {
              title: lang === "it" ? "Divulgazione e community" : "Outreach & community",
              desc: lang === "it" ? "Risorse pratiche, podcast, strumenti e rete di professionisti." : "Practical resources, podcasts, tools and a professional network.",
            },
          ].map((c) => (
            <div key={c.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="text-lg font-semibold">{c.title}</div>
              <div className="text-sm text-white/70 mt-2">{c.desc}</div>
            </div>
          ))}
        </div>
      </Section><Section title={tr.sectionTraining} kicker={lang === "it" ? "TRAINING" : "TRAINING"}>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {[
      {
        title: lang === "it" ? "Livello base" : "Fundamentals",
        desc:
          lang === "it"
            ? "Principi di fisiologia, sicurezza operativa, prevenzione e gestione iniziale degli eventi immersione-correlati."
            : "Physiology basics, operational safety, prevention and early management of dive-related events.",
      },
      {
        title: lang === "it" ? "Avanzato" : "Advanced",
        desc:
          lang === "it"
            ? "Decision-making sotto pressione: ipossia/iperossia, ventilazione, emodinamica e supporto al paziente critico in ambienti difficili."
            : "Decision-making under pressure: hypoxia/hyperoxia, ventilation, hemodynamics and critical care support in difficult environments.",
      },
      {
        title: lang === "it" ? "Scenari complessi" : "Complex scenarios",
        desc:
          lang === "it"
            ? "Gestione del politrauma e del paziente instabile in contesto iperbarico, inclusi incidenti in tunnelling/ambienti pressurizzati."
            : "Polytrauma and unstable patient management in hyperbaric contexts, including tunnelling/pressurized-environment incidents.",
      },
    ].map((c) => (
      <div key={c.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="text-lg font-semibold">{c.title}</div>
        <div className="text-sm text-white/70 mt-2">{c.desc}</div>
      </div>
    ))}
  </div>

  <div className="mt-6">
    <a
      className="inline-flex px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10"
      href="mailto:info@amicidiboyle.it?subject=Training%20request%20-%20Gli%20Amici%20di%20Boyle"
    >
      {tr.trainingCTA}
    </a>
    <div className="text-sm text-white/70 mt-3 max-w-3xl">{tr.trainingSubtitle}</div>
  </div>
</Section>



      <Section title={tr.sectionResources} kicker={lang === "it" ? "STRUMENTI" : "TOOLS"}>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="font-semibold">{lang === "it" ? "Linee guida, guide pratiche e link utili" : "Guidelines, practical guides and useful links"}</div>
            <div className="text-sm text-white/70 mt-1">
              {lang === "it" ? "Una selezione essenziale, senza rumore." : "An essential selection, without noise."}
            </div>
          </div>
          <Link href="/risorse">
            <a className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10">
              {lang === "it" ? "Apri risorse" : "Open resources"}
            </a>
          </Link>
        </div>
      </Section>

<Section title={lang === "it" ? "Contatti" : "Contact"} kicker={lang === "it" ? "SCRIVICI" : "GET IN TOUCH"}>
  <div className="rounded-3xl border border-white/10 bg-white/5 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div>
      <div className="font-semibold">{lang === "it" ? "Email" : "Email"}</div>
      <div className="text-sm text-white/70 mt-1">info@amicidiboyle.it</div>
    </div>
    <a
      href="mailto:info@amicidiboyle.it"
      className="px-5 py-3 rounded-2xl bg-ocean-300 text-ocean-950 font-semibold hover:brightness-110 text-center"
    >
      {lang === "it" ? "Scrivi ora" : "Write now"}
    </a>
  </div>
</Section>
    </div>
  );
}
