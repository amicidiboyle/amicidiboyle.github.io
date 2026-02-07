import React, { useMemo, useState } from "react";
import type { Lang } from "../i18n";
import { t } from "../i18n";
import { Section } from "../components/Section";
import { researchers } from "../data/researchers";

export default function Team({ lang }: { lang: Lang }) {
  const tr = t(lang);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return researchers;
    return researchers.filter((r) =>
      [r.name, r.title, r.bio].filter(Boolean).join(" ").toLowerCase().includes(s)
    );
  }, [q]);

  return (
    <Section title={tr.sectionTeam} kicker={lang === "it" ? "CORE TEAM & NETWORK" : "CORE TEAM & NETWORK"}>
      <div className="flex items-center gap-3 mb-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={lang === "it" ? "Cerca nel team…" : "Search the team…"}
          className="w-full md:w-96 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-ocean-200/60"
        />
        <div className="text-xs text-white/60">{filtered.length}/{researchers.length}</div>
      </div>
<div className="mb-6 text-sm text-white/75 max-w-3xl">
  {lang === "it"
    ? "Siamo clinici di Terapia Intensiva ed Emergenza-Urgenza con competenze in medicina iperbarica e subacquea. L’obiettivo è portare la cultura della sicurezza operativa e della fisiologia applicata negli ambienti difficili."
    : "We are ICU and Emergency Medicine clinicians with expertise in hyperbaric and diving medicine. Our goal is to bring operational safety and applied physiology into difficult environments."}
</div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((r) => (
          <article key={r.name} className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="aspect-[16/10] bg-ocean-900/30">
              <img src={r.imgSrc} alt={r.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-5">
              <div className="text-lg font-semibold">{r.name}</div>
              <div className="text-sm text-white/70 mt-1">{r.title}</div>
              {r.bio && (
                <div
                  className="prose prose-invert prose-sm mt-4 max-w-none text-white/80"
                  dangerouslySetInnerHTML={{ __html: r.bio }}
                />
              )}
              {r.businessCard && (
                <a
                  className="inline-flex mt-4 text-sm text-ocean-200 hover:text-white underline underline-offset-4"
                  href={r.businessCard}
                  target="_blank"
                  rel="noreferrer"
                >
                  {lang === "it" ? "Biglietto da visita" : "Business card"}
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
