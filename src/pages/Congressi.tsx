import React, { useMemo } from "react";
import type { Lang } from "../i18n";
import { t } from "../i18n";
import { Section } from "../components/Section";
import { congresses } from "../data/congresses";

function formatDate(iso: string, lang: Lang) {
  const d = new Date(iso + "T00:00:00");
  return new Intl.DateTimeFormat(lang === "it" ? "it-IT" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}

export default function Congressi({ lang }: { lang: Lang }) {
  const tr = t(lang);

  const sorted = useMemo(() => {
    return [...congresses].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, []);

  return (
    <Section title={tr.congressTitle} kicker={lang === "it" ? "ACTIVITIES" : "ACTIVITIES"}>
      <div className="max-w-4xl text-sm text-white/75 leading-relaxed mb-6">
        {tr.congressSubtitle}
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/80">
          {lang === "it" ? (
            <>
              Nessun congresso inserito ancora. Per aggiornare la lista, modifica{" "}
              <code className="px-2 py-1 rounded bg-white/10">src/data/congresses.ts</code> e
              pubblica su GitHub.
            </>
          ) : (
            <>
              No congresses added yet. To update the list, edit{" "}
              <code className="px-2 py-1 rounded bg-white/10">src/data/congresses.ts</code> and
              publish to GitHub.
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((c) => (
            <article
              key={c.date + c.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs tracking-[0.18em] text-white/55">
                  {formatDate(c.date, lang)}
                  {c.location ? ` • ${c.location}` : ""}
                </div>
                {c.link ? (
                  <a
                    href={c.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-ocean-200 hover:text-white underline underline-offset-4"
                  >
                    {lang === "it" ? "Link" : "Link"}
                  </a>
                ) : null}
              </div>

              <div className="mt-2 text-lg font-semibold">{c.title}</div>

              <div className="mt-2 text-sm text-white/70 flex flex-wrap gap-3">
                {c.role ? (
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
                    {c.role}
                  </span>
                ) : null}
                {c.who && c.who.length ? (
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
                    {c.who.join(", ")}
                  </span>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </Section>
  );
}
