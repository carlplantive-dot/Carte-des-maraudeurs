"use client";

import dynamic from "next/dynamic";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import type L from "leaflet";
import { maraudes as staticMaraudes } from "@/data/maraudes";
import { Jour, Maraude } from "@/types/maraude";
import DayFilter from "@/components/DayFilter";
import MaraudeCard from "@/components/MaraudeCard";
import MaraudeList from "@/components/MaraudeList";
import AssociationFilter from "@/components/AssociationFilter";
import FilterDrawer from "@/components/FilterDrawer";
import { ASSOCIATION_COLORS, ALL_ASSOCIATIONS } from "@/lib/associations";
import { isEnSaison, isEnCours } from "@/lib/time";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-cream">
      <p className="text-warm-mid text-sm animate-pulse">Chargement de la carte…</p>
    </div>
  ),
});

export default function HomePage() {
  // ── Données ───────────────────────────────────────────────────────────────
  const [maraudes, setMaraudes] = useState<Maraude[]>(staticMaraudes);

  useEffect(() => {
    fetch("/api/maraudes")
      .then((r) => r.json())
      .then((data) => { if (data.source === "sheets" && data.maraudes?.length) setMaraudes(data.maraudes); })
      .catch(() => {});
  }, []);

  // ── Filtres ───────────────────────────────────────────────────────────────
  const [selectedJour, setSelectedJour] = useState<Jour | null>(null);
  const [selectedAssos, setSelectedAssos] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  // ── État UI ───────────────────────────────────────────────────────────────
  const [selectedMaraude, setSelectedMaraude] = useState<Maraude | null>(null);
  const [showList, setShowList] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // ── Liste filtrée ─────────────────────────────────────────────────────────
  const currentMonth = useMemo(() => new Date().getMonth() + 1, []);

  const filtered = useMemo(() => {
    let list = maraudes.filter((m) => isEnSaison(m, currentMonth));
    if (selectedJour) list = list.filter((m) => m.jours.includes(selectedJour));
    if (selectedAssos.length > 0) list = list.filter((m) => selectedAssos.includes(m.association));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.nom.toLowerCase().includes(q) ||
          m.association.toLowerCase().includes(q) ||
          m.adresse.toLowerCase().includes(q) ||
          (m.secteur ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [maraudes, currentMonth, selectedJour, selectedAssos, search]);

  const activeFilterCount = (selectedJour ? 1 : 0) + selectedAssos.length;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleMaraudeClick = useCallback((maraude: Maraude) => {
    setSelectedMaraude((prev) => (prev?.id === maraude.id ? null : maraude));
    setShowList(false);
  }, []);

  const handleDayChange = (jour: Jour | null) => {
    setSelectedJour(jour);
    setSelectedMaraude(null);
  };

  const handleListSelect = (maraude: Maraude) => {
    setSelectedMaraude(maraude);
    mapInstanceRef.current?.setView([maraude.lat, maraude.lng], 15, { animate: true });
    setShowList(false);
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) { setGeoError("Géolocalisation non supportée"); return; }
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(loc);
        setGeoLoading(false);
        mapInstanceRef.current?.setView(loc, 15, { animate: true });
      },
      () => { setGeoError("Localisation refusée"); setGeoLoading(false); },
      { timeout: 8000 }
    );
  };

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-cream text-warm-dark overflow-hidden">

      {/* ════ HEADER ════════════════════════════════════════════════════════ */}
      <header className="z-10 bg-brick text-white px-4 pt-4 pb-6 rounded-b-[28px] shadow-lg flex-shrink-0">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <span className="text-2xl select-none" aria-hidden>🗺️</span>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold leading-tight tracking-wide">
              La Carte des Maraudeurs
            </h1>
            <p className="text-white/70 text-[11px] mt-0.5">
              Trouver une maraude ce soir
            </p>
          </div>

          {/* Contrôles desktop */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={handleGeolocate}
              disabled={geoLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-xs transition-all disabled:opacity-50"
            >
              {geoLoading
                ? <span className="animate-spin w-3 h-3 border border-white/60 border-t-white rounded-full inline-block" />
                : "📍"
              }
              {userLocation ? "Relocalisé" : "Me localiser"}
            </button>
            <button
              onClick={() => setShowList((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-all ${
                showList
                  ? "bg-white text-brick border-white font-semibold"
                  : "bg-white/15 hover:bg-white/25 border-white/20"
              }`}
            >
              {showList ? "🗺️ Carte" : "📋 Liste"}
            </button>
          </div>
        </div>
      </header>

      {/* ════ BARRE RECHERCHE + FILTRES JOURS ═══════════════════════════════ */}
      <div className="z-10 bg-cream px-4 pt-3 pb-2.5 flex-shrink-0 space-y-2.5">
        {/* Recherche */}
        <div className="relative max-w-6xl mx-auto">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brick select-none">🔍</span>
          <input
            type="text"
            placeholder="Rechercher une maraude, un quartier…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-3 rounded-full border border-warm-border bg-white text-sm text-warm-dark placeholder:text-warm-mid/60 focus:outline-none focus:border-brick shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-mid hover:text-warm-dark"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filtres jours */}
        <div className="max-w-6xl mx-auto">
          <DayFilter selected={selectedJour} onChange={handleDayChange} />
        </div>

        {/* Filtres associations (desktop seulement) */}
        <div className="hidden sm:block max-w-6xl mx-auto">
          <AssociationFilter
            associations={ALL_ASSOCIATIONS}
            selected={selectedAssos}
            onChange={setSelectedAssos}
          />
        </div>
      </div>

      {/* ════ ERREUR GÉO ═════════════════════════════════════════════════════ */}
      {geoError && (
        <div className="z-20 flex-shrink-0 bg-red-50 text-red-600 text-xs px-4 py-2 text-center border-b border-red-100">
          {geoError}
          <button className="ml-3 underline" onClick={() => setGeoError(null)}>Fermer</button>
        </div>
      )}

      {/* ════ ZONE PRINCIPALE ════════════════════════════════════════════════ */}
      <main className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 flex">

          {/* Carte */}
          <div className={`relative ${showList ? "hidden sm:flex sm:flex-1" : "flex-1"}`}>
            <div className="absolute inset-0">
              <Map
                maraudes={filtered}
                onMaraudeClick={handleMaraudeClick}
                selectedId={selectedMaraude?.id ?? null}
                userLocation={userLocation}
                onMapReady={(map) => { mapInstanceRef.current = map; }}
              />
            </div>

            {/* Légende desktop */}
            <div className="hidden sm:block absolute top-4 left-4 z-[900] bg-white/95 backdrop-blur-sm border border-warm-border rounded-2xl px-3 py-3 shadow-lg max-w-[210px]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-warm-mid mb-2">Légende</p>
              <ul className="space-y-1.5">
                {ALL_ASSOCIATIONS.map((label) => {
                  const color = ASSOCIATION_COLORS[label] ?? "#C0622F";
                  const inactive = selectedAssos.length > 0 && !selectedAssos.includes(label);
                  return (
                    <li key={label} className={`flex items-center gap-2 transition-opacity ${inactive ? "opacity-20" : ""}`}>
                      <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-[10px] text-warm-dark leading-tight">{label}</span>
                    </li>
                  );
                })}
              </ul>
              <p className="text-[10px] text-warm-mid mt-2.5 text-right border-t border-warm-border pt-2">
                {filtered.length} maraude{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Badge compteur mobile */}
            <div className="sm:hidden absolute top-3 right-3 z-[900] bg-brick text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md">
              {filtered.length} maraude{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Panneau liste */}
          {showList && (
            <div className="w-full sm:w-80 lg:w-96 flex-shrink-0 border-l border-warm-border flex flex-col overflow-hidden">
              <MaraudeList
                maraudes={filtered}
                selectedId={selectedMaraude?.id ?? null}
                onSelect={handleListSelect}
                search={search}
                onSearchChange={setSearch}
              />
            </div>
          )}
        </div>

        {/* Fiche maraude */}
        {selectedMaraude && !showList && (
          <MaraudeCard
            maraude={selectedMaraude}
            onClose={() => setSelectedMaraude(null)}
          />
        )}
      </main>

      {/* ════ BARRE DE NAVIGATION MOBILE ════════════════════════════════════ */}
      <nav className="sm:hidden flex-shrink-0 bg-brick border-t border-white/10 flex items-stretch safe-bottom z-10">

        {/* Filtres */}
        <button
          onClick={() => setShowFilterDrawer(true)}
          className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-white/70 active:bg-white/10 relative"
        >
          <span className="text-lg leading-none">🎛️</span>
          <span className="text-[10px] font-medium">Filtres</span>
          {activeFilterCount > 0 && (
            <span className="absolute top-2 right-[calc(50%-18px)] w-4 h-4 bg-white text-brick text-[9px] font-bold rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Liste */}
        <button
          onClick={() => { setShowList((v) => !v); setSelectedMaraude(null); }}
          className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 active:bg-white/10 transition-colors ${showList ? "text-white" : "text-white/70"}`}
        >
          <span className="text-lg leading-none">{showList ? "🗺️" : "📋"}</span>
          <span className="text-[10px] font-medium">{showList ? "Carte" : "Liste"}</span>
        </button>

        {/* Localiser */}
        <button
          onClick={handleGeolocate}
          disabled={geoLoading}
          className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 active:bg-white/10 disabled:opacity-50 transition-colors ${userLocation ? "text-white" : "text-white/70"}`}
        >
          {geoLoading
            ? <span className="animate-spin w-4 h-4 border-2 border-white/40 border-t-white rounded-full" />
            : <span className="text-lg leading-none">📍</span>
          }
          <span className="text-[10px] font-medium">Moi</span>
        </button>
      </nav>

      {/* ════ DRAWER FILTRES (mobile) ════════════════════════════════════════ */}
      <FilterDrawer
        open={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        selectedJour={selectedJour}
        onJourChange={handleDayChange}
        selectedAssos={selectedAssos}
        onAssosChange={setSelectedAssos}
        count={filtered.length}
      />

      {/* Pied de page desktop */}
      <footer className="hidden sm:block flex-shrink-0 bg-cream border-t border-warm-border text-warm-mid text-[10px] text-center py-2 tracking-wide">
        La Carte des Maraudeurs — Maraudes solidaires à Paris
      </footer>
    </div>
  );
}
