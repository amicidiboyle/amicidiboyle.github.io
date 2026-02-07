import React, { useMemo, useState } from "react";
import type { Lang } from "../i18n";
import { Section } from "../components/Section";

type Episode = { episode: number; title: string; url: string };
const episodesBySeason: Record<string, Episode[]> = {
  "season1": [
    {
      "episode": 1,
      "title": "Le leggi fisiche del mondo sommerso",
      "url": "https://open.spotify.com/episode/6MSOUbc8hpJrsYD7b4rL71"
    },
    {
      "episode": 2,
      "title": "La subacquea ricreativa",
      "url": "https://open.spotify.com/episode/0j65FzDaiWnGOLG1RJMsdf"
    },
    {
      "episode": 3,
      "title": "La visita di Idoneit\u00e0",
      "url": "https://open.spotify.com/episode/306ebmPOCAdVCPecp1iyiU"
    },
    {
      "episode": 4,
      "title": "L'attrezzatura Subacquea",
      "url": "https://open.spotify.com/episode/2ZtxfohbgrYYyDf7R1XaJ6"
    },
    {
      "episode": 5,
      "title": "Il computer subacqueo",
      "url": "https://open.spotify.com/episode/4vzJeIizgJl2rHu0lCIiL2"
    },
    {
      "episode": 6,
      "title": "Il Barotrauma",
      "url": "https://open.spotify.com/episode/5FYXKNcnhuHqFdRg7LWeOO"
    },
    {
      "episode": 7,
      "title": "La camera Iperbarica",
      "url": "https://open.spotify.com/episode/2k96mq4lTfMF4YIs6CWRAW"
    },
    {
      "episode": 8,
      "title": "Il tecnico Iperbarico",
      "url": "https://open.spotify.com/episode/0XtJeKMDtqAU88aC9GRP6U"
    },
    {
      "episode": 9,
      "title": "Volare dopo un'immersione",
      "url": "https://open.spotify.com/episode/7xGygD36INtZSoz3dhsSGI"
    },
    {
      "episode": 10,
      "title": "Il trucco e la camera Iperbarica",
      "url": "https://open.spotify.com/episode/0SVzq9RvNGlNF9OvAohswg"
    }
  ],
  "season2": [
    {
      "episode": 1,
      "title": "La camera ipobarica",
      "url": "https://open.spotify.com/episode/5Hjvc1BJkLDFVAKPItRf0l"
    },
    {
      "episode": 2,
      "title": "Vuoto vs Ipobarismo",
      "url": "https://open.spotify.com/episode/3fpHrUPF4520zXVCt5zz7u"
    },
    {
      "episode": 3,
      "title": "Sotto pressione..Al cinema!",
      "url": "https://open.spotify.com/episode/6SBnlvNRFZVJu5l5kQCNxr"
    }
  ]
};

function spotifyEmbed(url: string) {
  const m = url.match(/episode\/(.+)$/);
  const id = m ? m[1] : "";
  return id ? `https://open.spotify.com/embed/episode/${id}` : "";
}

export default function Podcast({ lang }: { lang: Lang }) {
  const [season, setSeason] = useState<keyof typeof episodesBySeason>("season1");

  const episodes = useMemo(() => episodesBySeason[season] ?? [], [season]);
  const featured = episodes[0];
  const embed = featured ? spotifyEmbed(featured.url) : "";

  return (
    <Section title="Podcast" kicker={lang === "it" ? "ASCOLTA" : "LISTEN"}>
      
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-4 overflow-hidden">
    <div className="text-sm text-white/75 px-2 pb-3">
      {lang === "it"
        ? "Ascolta lo show completo su Spotify o guarda la playlist su YouTube."
        : "Listen to the full show on Spotify or watch the YouTube playlist."}
    </div>

    <div className="flex flex-wrap gap-3 px-2 pb-4">
      <a
        className="inline-flex px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-sm"
        href="https://open.spotify.com/show/2kiLEUpdpn6FIUzTDMx0V7"
        target="_blank"
        rel="noreferrer"
      >
        Spotify (show)
      </a>
      <a
        className="inline-flex px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-sm"
        href="https://www.youtube.com/playlist?list=PLW9xMwZ4VNPXjq5Gj1gNkBwqo_QEzIfDu"
        target="_blank"
        rel="noreferrer"
      >
        YouTube (playlist)
      </a>
    </div>

    <iframe
      style={{ borderRadius: 24 }}
      src="https://open.spotify.com/embed/show/2kiLEUpdpn6FIUzTDMx0V7?utm_source=generator"
      width="100%"
      height="430"
      frameBorder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    />
  </div>

  <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
    <div className="text-lg font-semibold">{lang === "it" ? "Episodi" : "Episodes"}</div>
    <div className="text-sm text-white/70 mt-2">
      {lang === "it"
        ? "Lista cliccabile aggiornabile modificando src/data/podcastEpisodes.ts (facoltativa: lo show embedded resta sempre aggiornato)."
        : "Optional clickable list: update by editing src/data/podcastEpisodes.ts (the embedded show stays updated anyway)."}
    </div>

    {episodes.length === 0 ? (
      <div className="mt-4 text-sm text-white/60">
        {lang === "it"
          ? "Per ora usa lo show embedded. Se vuoi anche l’elenco completo cliccabile, aggiungiamo gli URL episodio qui."
          : "For now use the embedded show. If you want a full clickable list, add episode URLs here."}
      </div>
    ) : (
      <ul className="mt-4 space-y-2 text-sm">
        {episodes
          .slice()
          .sort((a, b) => (a.date && b.date ? (a.date < b.date ? 1 : -1) : 0))
          .map((e) => (
            <li key={e.url}>
              <a
                className="text-ocean-200 hover:text-white underline underline-offset-4"
                href={e.url}
                target="_blank"
                rel="noreferrer"
              >
                {e.title}
              </a>
              {e.date ? <span className="text-white/50"> · {e.date}</span> : null}
            </li>
          ))}
      </ul>
    )}
  </div>
</div>

    </Section>
  );
}
