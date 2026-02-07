import React, { useMemo, useState } from "react";
import type { Lang } from "../i18n";
import { Section } from "../components/Section";

function round(n: number, d = 2) {
  const p = Math.pow(10, d);
  return Math.round(n * p) / p;
}

/**
 * Minimal, static HBOT helper.
 * NOTE: this is a simplified educational calculator (NOT medical advice).
 */
export default function Simulatore({ lang }: { lang: Lang }) {
  const [ata, setAta] = useState(2.4);
  const [fio2, setFio2] = useState(1.0);

  const po2 = useMemo(() => {
    // Simple inspired PO2 approximation for education:
    const piO2 = fio2 * (ata * 760 - 47); // mmHg
    return round(piO2, 0);
  }, [ata, fio2]);

  return (
    <Section title={lang === "it" ? "Simulatore HBOT (educativo)" : "HBOT simulator (educational)"}>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="text-white/80 leading-relaxed">
          {lang === "it"
            ? "Strumento leggero per ragionare su pressione e ossigeno. Non sostituisce protocolli clinici, giudizio medico o linee guida."
            : "Lightweight tool to reason about pressure and oxygen. It does not replace clinical protocols, medical judgement or guidelines."}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold">ATA</div>
            <input
              type="number"
              step="0.1"
              min="1"
              max="3"
              value={ata}
              onChange={(e) => setAta(Number(e.target.value))}
              className="mt-2 w-full px-3 py-2 rounded-xl bg-ocean-950/40 border border-white/10 outline-none"
            />
            <div className="text-xs text-white/60 mt-2">
              {lang === "it" ? "Esempio: 2.4 ATA (protocolli HBOT comuni)" : "Example: 2.4 ATA (common HBOT protocols)"}
            </div>
          </label>

          <label className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold">FiO₂</div>
            <input
              type="number"
              step="0.05"
              min="0.21"
              max="1"
              value={fio2}
              onChange={(e) => setFio2(Number(e.target.value))}
              className="mt-2 w-full px-3 py-2 rounded-xl bg-ocean-950/40 border border-white/10 outline-none"
            />
            <div className="text-xs text-white/60 mt-2">
              {lang === "it" ? "0.21 aria, 1.0 O₂ 100%" : "0.21 air, 1.0 100% O₂"}
            </div>
          </label>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-ocean-900/20 p-6">
          <div className="text-sm text-white/60">{lang === "it" ? "Stima PO₂ inspirata (mmHg)" : "Estimated inspired PO₂ (mmHg)"}</div>
          <div className="mt-2 text-4xl font-extrabold glow">{po2}</div>
          <div className="text-xs text-white/60 mt-2">
            {lang === "it"
              ? "Formula semplificata: FiO₂ × (ATA×760 − 47). Solo scopo didattico."
              : "Simplified formula: FiO₂ × (ATA×760 − 47). Educational only."}
          </div>
        </div>
      </div>
    </Section>
  );
}
