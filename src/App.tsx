import React, { useMemo, useState } from "react";
import { Route, Switch, useLocation } from "wouter";
import Layout from "./components/Layout";
import type { Lang } from "./i18n";
import Home from "./pages/Home";
import Team from "./pages/Team";
import Progetti from "./pages/Progetti";
import Podcast from "./pages/Podcast";
import Risorse from "./pages/Risorse";
import Contatti from "./pages/Contatti";
import Congressi from "./pages/Congressi";
import Simulatore from "./pages/Simulatore";
import Centri from "./pages/Centri";

function useHashLang(): [Lang, () => void] {
  const [loc, setLoc] = useLocation();
  const lang = useMemo<Lang>(() => {
    // allow /en/... routing via prefix
    if (loc.startsWith("/it")) return "it";
    return "en";
  }, [loc]);

  const toggle = () => {
    if (lang === "en") setLoc("/it" + (loc === "/" ? "" : loc));
    else setLoc(loc.replace(/^\/it/, "") || "/");
  };

  return [lang, toggle];
}

export default function App() {
  const [lang, toggleLang] = useHashLang();

  return (
    <Layout lang={lang} onToggleLang={toggleLang}>
      <Switch>
        <Route path="/" component={() => <Home lang={lang} />} />
        <Route path="/team" component={() => <Team lang={lang} />} />
        <Route path="/progetti" component={() => <Progetti lang={lang} />} />
        <Route path="/podcast" component={() => <Podcast lang={lang} />} />
        <Route path="/congressi" component={() => <Congressi lang={lang} />} />
        <Route path="/risorse" component={() => <Risorse lang={lang} />} />
        <Route path="/contatti" component={() => <Contatti lang={lang} />} />
        <Route path="/simulatore" component={() => <Simulatore lang={lang} />} />
        <Route path="/centri" component={() => <Centri lang={lang} />} />

        {/* IT aliases */}
        <Route path="/it" component={() => <Home lang={lang} />} />
        <Route path="/it/team" component={() => <Team lang={lang} />} />
        <Route path="/it/progetti" component={() => <Progetti lang={lang} />} />
        <Route path="/it/podcast" component={() => <Podcast lang={lang} />} />
        <Route path="/it/congressi" component={() => <Congressi lang={lang} />} />
        <Route path="/it/risorse" component={() => <Risorse lang={lang} />} />
        <Route path="/it/contatti" component={() => <Contatti lang={lang} />} />
        <Route path="/it/simulatore" component={() => <Simulatore lang={lang} />} />
        <Route path="/it/centri" component={() => <Centri lang={lang} />} />

        <Route component={() => <Home lang={lang} />} />
      </Switch>
    </Layout>
  );
}
