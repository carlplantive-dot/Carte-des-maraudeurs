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

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-parchment">
      <p className="text-hogwarts-light text-sm animate-pulse font-serif italic">
        Consultation de la carte…
      </p>
    </div>
  ),
});

export default function HomePage() {
  // ── Data ──────────────────────────────────────────────────────────────────
  const [maraudes, setMaraudes] = useState<Maraude[]>(staticMaraudes);

  useEffect(() => {
    fetch("/api/maraudes")
      .then((r) => r.json())
      .then((data) => { if (data.maraudes?.length) setMaraudes(data.maraudes); })
      .catch(() => {});
  }, []);

  // ── Filters ───────────────────────────────────────────────────────────────
  const [selectedJour, setSelectedJour] = useState<Jour | null>(null);
  const [selectedAssos, setSelectedAssos] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  // ── UI state ──────────────────────────────────────────────────────────────
  const [selectedMaraude, setSelectedMaraude] = useState<Maraude | null>(null);
  const [showList, setShowList] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = maraudes;
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
  }, [maraudes, selectedJour, selectedAssos, search]);

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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-parchment text-hogwarts-dark overflow-hidden">

      {/* ════ HEADER ════════════════════════════════════════════════════════ */}
      <header className="z-10 bg-hogwarts text-parchment px-4 py-3 shadow-md flex-shrink-0">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <span className="text-2xl select-none" aria-hidden>🗺️</span>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold tracking-wide leading-tight">
              La Carte des Maraudeurs
            </h1>
            <p className="text-parchment/60 text-[10px] tracking-widest uppercase font-serif italic hidden sm:block">
              Maraudes solidaires à Paris
            </p>
          </div>

          {/* Desktop-only controls */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={handleGeolocate}
              disabled={geoLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-parchment/10 hover:bg-parchment/20 border border-parchment/20 text-xs transition-all disabled:opacity-50"
            >
              {geoLoading
                ? <span className="animate-spin w-3 h-3 border border-parchment/60 border-t-parchment rounded-full inline-block" />
                : "📍"
              }
              {userLocation ? "Relocalisé" : "Me localiser"}
            </button>
            <button
              onClick={() => setShowList((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-all ${
                showList ? "bg-gold text-hogwarts-dark border-gold" : "bg-parchment/10 hover:bg-parchment/20 border-parchment/20"
              }`}
            >
              {showList ? "🗺️ Carte" : "📋 Liste"}
            </button>
          </div>
        </div>
      </header>

      {/* ════ DESKTOP FILTER BAR (hidden on mobile) ═════════════════════════ */}
      <div className="hidden sm:block z-10 bg-parchment border-b border-gold/30 px-4 py-2.5 flex-shrink-0 space-y-2">
        <div className="max-w-6xl mx-auto">
          <DayFilter selected={selectedJour} onChange={handleDayChange} />
        </div>
        <div className="max-w-6xl mx-auto">
          <AssociationFilter associations={ALL_ASSOCIATIONS} selected={selectedAssos} onChange={setSelectedAssos} />
        </div>
      </div>

      {/* ════ GEO ERROR ══════════════════════════════════════════════════════ */}
      {geoError && (
        <div className="z-20 flex-shrink-0 bg-red-900/80 text-red-100 text-xs px-4 py-2 text-center">
          {geoError}
          <button className="ml-3 underline" onClick={() => setGeoError(null)}>Fermer</button>
        </div>
      )}

      {/* ════ MAIN ══════════════════════════════════════════════════════════ */}
      <main className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 flex">

          {/* Map */}
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

            {/* Desktop legend */}
            <div className="hidden sm:block absolute top-4 left-4 z-[900] bg-parchment/95 backdrop-blur-sm border border-gold/40 rounded-xl px-3 py-2.5 shadow-lg max-w-[200px]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-hogwarts-light mb-1.5">Légende</p>
              <ul className="space-y-1">
                {ALL_ASSOCIATIONS.map((label) => {
                  const color = ASSOCIATION_COLORS[label] ?? "#2c3e50";
                  const inactive = selectedAssos.length > 0 && !selectedAssos.includes(label);
                  return (
                    <li key={label} className={`flex items-center gap-2 transition-opacity ${inactive ? "opacity-30" : ""}`}>
                      <span className="inline-block w-2.5 h-2.5 rounded-full border border-white/30 flex-shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-[10px] text-hogwarts-dark leading-tight">{label}</span>
                    </li>
                  );
                })}
              </ul>
              <p className="text-[10px] text-hogwarts-light/60 mt-2 text-right border-t border-gold/20 pt-1.5">
                {filtered.length} maraude{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Mobile count badge */}
            <div className="sm:hidden absolute top-3 right-3 z-[900] bg-hogwarts/90 text-parchment text-[11px] font-semibold px-2.5 py-1 rounded-full shadow">
              {filtered.length} maraude{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* List panel (desktop sidebar / mobile fullscreen) */}
          {showList && (
            <div className="w-full sm:w-80 lg:w-96 flex-shrink-0 bg-parchment border-l border-gold/30 flex flex-col overflow-hidden">
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

        {/* Maraude card */}
        {selectedMaraude && !showList && (
          <MaraudeCard
            maraude={selectedMaraude}
            onClose={() => setSelectedMaraude(null)}
          />
        )}
      </main>

      {/* ════ MOBILE BOTTOM NAV ═════════════════════════════════════════════ */}
      <nav className="sm:hidden flex-shrink-0 bg-hogwarts border-t border-parchment/10 flex items-stretch safe-bottom z-10">

        {/* Filtres */}
        <button
          onClick={() => setShowFilterDrawer(true)}
          className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-parchment/70 active:bg-parchment/10 relative"
        >
          <span className="text-lg leading-none">🎛️</span>
          <span className="text-[10px] font-medium">Filtres</span>
          {activeFilterCount > 0 && (
            <span className="absolute top-1.5 right-[calc(50%-18px)] w-4 h-4 bg-gold text-hogwarts-dark text-[9px] font-bold rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Liste */}
        <button
          onClick={() => { setShowList((v) => !v); setSelectedMaraude(null); }}
          className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 active:bg-parchment/10 ${showList ? "text-gold" : "text-parchment/70"}`}
        >
          <span className="text-lg leading-none">{showList ? "🗺️" : "📋"}</span>
          <span className="text-[10px] font-medium">{showList ? "Carte" : "Liste"}</span>
        </button>

        {/* Localiser */}
        <button
          onClick={handleGeolocate}
          disabled={geoLoading}
          className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 active:bg-parchment/10 disabled:opacity-50 ${userLocation ? "text-gold" : "text-parchment/70"}`}
        >
          {geoLoading
            ? <span className="animate-spin w-4 h-4 border-2 border-parchment/40 border-t-parchment rounded-full" />
            : <span className="text-lg leading-none">📍</span>
          }
          <span className="text-[10px] font-medium">Moi</span>
        </button>
      </nav>

      {/* ════ FILTER DRAWER (mobile) ════════════════════════════════════════ */}
      <FilterDrawer
        open={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        selectedJour={selectedJour}
        onJourChange={(j) => { handleDayChange(j); }}
        selectedAssos={selectedAssos}
        onAssosChange={setSelectedAssos}
        count={filtered.length}
      />

      {/* Desktop footer */}
      <footer className="hidden sm:block flex-shrink-0 bg-hogwarts/90 text-parchment/40 text-[10px] text-center py-1.5 tracking-widest font-serif italic">
        ✦ Méfait accompli ✦
      </footer>
    </div>
  );
}
