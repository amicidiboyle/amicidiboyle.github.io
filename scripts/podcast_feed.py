#!/usr/bin/env python3
"""Legge il feed RSS di Sotto Pressione e aggiorna assets/podcast/feed.json.

- Primo avvio: registra tutti gli episodi esistenti come gia' presenti sul sito.
- Avvii successivi: ogni episodio mai visto finisce in "new" e viene mostrato
  automaticamente nella pagina podcast (blocco "Nuovi episodi").
- "latest" e' sempre l'episodio piu' recente, usato nel riquadro in alto.

Per collegare un nuovo episodio al player Spotify basta incollare il suo ID
nel campo "spotify_id" dentro feed.json.
"""
import html
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime
from pathlib import Path

RSS = "https://anchor.fm/s/103fe6a4c/podcast/rss"
OUT = Path(__file__).resolve().parent.parent / "assets" / "podcast" / "feed.json"
ITUNES = "{http://www.itunes.com/dtds/podcast-1.0.dtd}"


def clean(text, limit=260):
    text = html.unescape(re.sub(r"<[^>]+>", " ", text or ""))
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) > limit:
        text = text[:limit].rsplit(" ", 1)[0] + "…"
    return text


def parse(xml_bytes):
    channel = ET.fromstring(xml_bytes).find("channel")
    episodes = []
    for it in channel.findall("item"):
        enc = it.find("enclosure")
        pub = it.findtext("pubDate")
        guid = (it.findtext("guid") or it.findtext("link") or it.findtext("title")).strip()
        episodes.append({
            "guid": guid,
            "title": clean(it.findtext("title"), 200),
            "date": parsedate_to_datetime(pub).date().isoformat() if pub else "",
            "desc": clean(it.findtext("description") or it.findtext(ITUNES + "summary")),
            "audio": enc.get("url") if enc is not None else "",
            "link": (it.findtext("link") or "").strip(),
            "spotify_id": "",
        })
    episodes.sort(key=lambda e: e["date"], reverse=True)
    return episodes


def main():
    req = urllib.request.Request(RSS, headers={"User-Agent": "amicidiboyle-feed/1.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        episodes = parse(r.read())
    if not episodes:
        sys.exit("Feed vuoto: nessuna modifica.")

    state = json.loads(OUT.read_text("utf-8")) if OUT.exists() else None
    if state is None:
        state = {"seen": [e["guid"] for e in episodes], "new": []}
        print(f"Primo avvio: {len(episodes)} episodi registrati come gia' presenti.")
    else:
        seen = set(state.get("seen", []))
        fresh = [e for e in episodes if e["guid"] not in seen]
        for e in reversed(fresh):
            state["new"].insert(0, e)
            state["seen"].append(e["guid"])
            print("Nuovo episodio:", e["title"])

    # il riquadro "ultimo episodio" eredita lo spotify_id se gia' inserito a mano
    latest = dict(episodes[0])
    for e in state["new"]:
        if e["guid"] == latest["guid"] and e.get("spotify_id"):
            latest["spotify_id"] = e["spotify_id"]
    old_latest = state.get("latest") or {}
    if old_latest.get("guid") == latest["guid"] and old_latest.get("spotify_id"):
        latest["spotify_id"] = old_latest["spotify_id"]
    state["latest"] = latest
    state["count"] = len(episodes)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", "utf-8")


if __name__ == "__main__":
    main()
