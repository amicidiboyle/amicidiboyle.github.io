import React from "react";
import { Link } from "wouter";
import type { Lang } from "../i18n";
import { t } from "../i18n";

export default function Layout({
  lang,
  onToggleLang,
  children,
}: {
  lang: Lang;
  onToggleLang: () => void;
  children: React.ReactNode;
}) {
  const tr = t(lang);
  const prefix = lang === "it" ? "/it" : "";

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 backdrop-blur bg-ocean-950/65 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link href={`${prefix}/`}>
            <a className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-ocean-300/30 to-ocean-700/30 border border-white/10 grid place-items-center">
                <span className="text-sm font-semibold tracking-wide">B</span>
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold">Gli Amici di Boyle</div>
                <div className="text-[11px] text-white/60">Hyperbaric & Diving Medicine</div>
              </div>
            </a>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-white/80">
            <Link href={`${prefix}/`}><a className="hover:text-white">{tr.navHome}</a></Link>
            <Link href={`${prefix}/team`}><a className="hover:text-white">{tr.navTeam}</a></Link>
            <Link href={`${prefix}/progetti`}><a className="hover:text-white">{tr.navProjects}</a></Link>
            <Link href={`${prefix}/podcast`}><a className="hover:text-white">{tr.navPodcast}</a></Link>
            <Link href={`${prefix}/congressi`}><a className="hover:text-white">{tr.navCongress}</a></Link>
            <Link href={`${prefix}/risorse`}><a className="hover:text-white">{tr.navResources}</a></Link>
            <Link href={`${prefix}/simulatore`}><a className="hover:text-white">{tr.navSimulator}</a></Link>
            <Link href={`${prefix}/centri`}><a className="hover:text-white">{tr.navCenters}</a></Link>
            <Link href={`${prefix}/contatti`}><a className="hover:text-white">{tr.navContact}</a></Link>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleLang}
              className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs"
              aria-label="Toggle language"
              title="IT/EN"
            >
              {lang === "en" ? "EN" : "IT"}
            </button>
            <a
              href="/sitemap.xml"
              className="hidden sm:inline px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-white/80"
            >
              Sitemap
            </a>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-10 text-sm text-white/70 flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
          <div>{tr.footer}</div>
          <div className="flex gap-4">
            <a className="hover:text-white" href="https://www.amicidiboyle.it" target="_blank" rel="noreferrer">amicidiboyle.it</a>
            <a className="hover:text-white" href="mailto:info@amicidiboyle.it">info@amicidiboyle.it</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
