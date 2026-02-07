import React from "react";
import type { Lang } from "../i18n";
import { Section } from "../components/Section";


const resources = [
  {
    title_it: "Guida: Medicina Iperbarica (Markdown)",
    title_en: "Guide: Hyperbaric Medicine (Markdown)",
    desc_it: "Documento pratico in formato leggibile e scaricabile.",
    desc_en: "Practical document in a readable and downloadable format.",
    href: "/medicina-iperbarica-guide.md",
    tag: "MD",
  },
  {
    title_it: "SEO guide (HTML)",
    title_en: "SEO guide (HTML)",
    desc_it: "Pagina informativa/tecnica già presente nel progetto originale.",
    desc_en: "Informational/technical page from the original project.",
    href: "/seo-guide.html",
    tag: "HTML",
  },
  {
    title_it: "Robots.txt",
    title_en: "Robots.txt",
    desc_it: "File per i crawler.",
    desc_en: "Crawler configuration file.",
    href: "/robots.txt",
    tag: "TXT",
  },
  {
    title_it: "Sitemap.xml",
    title_en: "Sitemap.xml",
    desc_it: "Mappa del sito per i motori di ricerca.",
    desc_en: "Site map for search engines.",
    href: "/sitemap.xml",
    tag: "XML",
  },
{
  title_it: "Presentazione (PDF)",
  title_en: "Presentation (PDF)",
  desc_it: "Overview del gruppo, attività e visione.",
  desc_en: "Group overview, activities and vision.",
  href: "/docs/amicidiboyle_presentation.pdf",
  tag: "PDF",
},
];

export default function Risorse({ lang }: { lang: Lang }) {
  return (
    <Section title={lang === "it" ? "Risorse" : "Resources"} kicker={lang === "it" ? "DOCUMENTI" : "DOCS"}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((r) => (
          <a
            key={r.href}
            href={r.href}
            target="_blank"
            rel="noreferrer"
            className="rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold">{lang === "it" ? r.title_it : r.title_en}</div>
                <div className="text-sm text-white/70 mt-1">{lang === "it" ? r.desc_it : r.desc_en}</div>
              </div>
              <span className="text-xs px-2 py-1 rounded-xl border border-white/10 bg-white/5 text-white/70">
                {r.tag}
              </span>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-ocean-900/20 p-6 text-sm text-white/70 leading-relaxed">
        {lang === "it"
          ? "Se vuoi, trasformo queste risorse in una libreria ricercabile (tag, filtri, PDF, ecc.) mantenendo tutto statico e senza costi ricorrenti."
          : "If you want, I can turn these resources into a searchable library (tags, filters, PDFs, etc.) while keeping everything static and cost-free."}
      </div>
    </Section>
  );
}
