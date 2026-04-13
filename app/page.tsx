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
import { ASSOCIATION_COLORS, ALL_ASSOCIATIONS } from "@/lib/associations";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-parchment rounded-2xl">
      <p className="text-hogwarts-light text-sm animate-pulse font-serif italic">
        Consultation de la carte…
      </p>
    </div>
  ),
});

export default function HomePage() {
  // ── Data ─────────────────────────────────────────────────────────────────
  const [maraudes, setMaraudes] = useState<Maraude[]>(staticMaraudes);
  const [dataSource, setDataSource] = useState<"static" | "sheets">("static");

  useEffect(() => {
    fetch("/api/maraudes")
      .then((r) => r.json())
      .then((data) => {
        if (data.maraudes?.length) {
          setMaraudes(data.maraudes);
          setDataSource(data.source);
        }
      })
      .catch(() => {});
  }, []);

  // ── Filters ───────────────────────────────────────────────────────────────
  const [selectedJour, setSelectedJour] = useState<Jour | null>(null);
  const [selectedAssos, setSelectedAssos] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  // ── UI state ──────────────────────────────────────────────────────────────
  const [selectedMaraude, setSelectedMaraude] = useState<Maraude | null>(null);
  const [showList, setShowList] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // ── Derived filtered list ─────────────────────────────────────────────────
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

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleMaraudeClick = useCallback((maraude: Maraude) => {
    setSelectedMaraude((prev) => (prev?.id === maraude.id ? null : maraude));
  }, []);

  const handleDayChange = (jour: Jour | null) => {
    setSelectedJour(jour);
    setSelectedMaraude(null);
  };

  const handleListSelect = (maraude: Maraude) => {
    setSelectedMaraude(maraude);
    // Pan map to marker
    const map = mapInstanceRef.current;
    if (map) map.setView([maraude.lat, maraude.lng], Math.max(map.getZoom(), 15), { animate: true });
    // On mobile: close list to reveal the card
    if (window.innerWidth < 768) setShowList(false);
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setGeoError("Géolocalisation non supportée");
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(loc);
        setGeoLoading(false);
        mapInstanceRef.current?.setView(loc, 15, { animate: true });
      },
      () => {
        setGeoError("Localisation refusée ou indisponible");
        setGeoLoading(false);
      },
      { timeout: 8000 }
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-parchment text-hogwarts-dark overflow-hidden">

      {/* ── Header ── */}
      <header className="z-10 bg-hogwarts text-parchment px-4 py-3 shadow-md flex-shrink-0">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <span className="text-gold text-2xl select-none" aria-hidden>🗺️</span>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold tracking-wide leading-tight">
              La Carte des Maraudeurs
            </h1>
            <p className="text-parchment/60 text-[11px] tracking-widest uppercase font-serif italic hidden sm:block">
              Maraudes solidaires à Paris
            </p>
          </div>

          {/* Data source badge */}
          <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
            dataSource === "sheets"
              ? "bg-green-900/30 text-green-300 border-green-700"
              : "bg-parchment/10 text-parchment/50 border-parchment/20"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dataSource === "sheets" ? "bg-green-400" : "bg-parchment/40"}`} />
            {dataSource === "sheets" ? "Google Sheets" : "Données statiques"}
          </span>

          {/* Geolocate button */}
          <button
            onClick={handleGeolocate}
            disabled={geoLoading}
            title="Me localiser"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-parchment/10 hover:bg-parchment/20 border border-parchment/20 text-parchment text-xs transition-all disabled:opacity-50"
          >
            {geoLoading ? (
              <span className="animate-spin inline-block w-3 h-3 border border-parchment/60 border-t-parchment rounded-full" />
            ) : (
              <span>📍</span>
            )}
            <span className="hidden sm:inline">{userLocation ? "Relocalisé" : "Me localiser"}</span>
          </button>

          {/* List toggle */}
          <button
            onClick={() => setShowList((v) => !v)}
            title={showList ? "Voir la carte" : "Voir la liste"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-all ${
              showList
                ? "bg-gold text-hogwarts-dark border-gold"
                : "bg-parchment/10 hover:bg-parchment/20 border-parchment/20 text-parchment"
            }`}
          >
            <span>{showList ? "🗺️" : "📋"}</span>
            <span className="hidden sm:inline">{showList ? "Carte" : "Liste"}</span>
          </button>
        </div>
      </header>

      {/* ── Filters bar ── */}
      <div className="z-10 bg-parchment border-b border-gold/30 px-4 py-2.5 flex-shrink-0 space-y-2">
        <div className="max-w-6xl mx-auto">
          <DayFilter selected={selectedJour} onChange={handleDayChange} />
        </div>
        <div className="max-w-6xl mx-auto">
          <AssociationFilter
            associations={ALL_ASSOCIATIONS}
            selected={selectedAssos}
            onChange={setSelectedAssos}
          />
        </div>
      </div>

      {/* ── Geo error toast ── */}
      {geoError && (
        <div className="z-20 flex-shrink-0 bg-red-900/80 text-red-100 text-xs px-4 py-2 text-center">
          {geoError}
          <button className="ml-3 underline" onClick={() => setGeoError(null)}>Fermer</button>
        </div>
      )}

      {/* ── Main area ── */}
      <main className="flex-1 relative overflow-hidden">

        {/* Desktop split: map left, list right when open */}
        <div className={`absolute inset-0 flex transition-all duration-300`}>

          {/* Map */}
          <div className={`relative transition-all duration-300 ${showList ? "hidden md:block md:flex-1" : "flex-1"}`}>
            <div className="absolute inset-0 p-3">
              <Map
                maraudes={filtered}
                onMaraudeClick={handleMaraudeClick}
                selectedId={selectedMaraude?.id ?? null}
                userLocation={userLocation}
                onMapReady={(map) => { mapInstanceRef.current = map; }}
              />
            </div>

            {/* Legend overlay */}
            <div className="absolute top-5 left-5 z-[900] bg-parchment/95 backdrop-blur-sm border border-gold/40 rounded-xl px-3 py-2.5 shadow-lg">
              <p className="text-[10px] font-bold uppercase tracking-widest text-hogwarts-light mb-1.5">
                Légende
              </p>
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
          </div>

          {/* List panel */}
          {showList && (
            <div className="w-full md:w-80 lg:w-96 flex-shrink-0 bg-parchment border-l border-gold/30 flex flex-col overflow-hidden">
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

        {/* Maraude info card */}
        {selectedMaraude && (
          <MaraudeCard
            maraude={selectedMaraude}
            onClose={() => setSelectedMaraude(null)}
          />
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="flex-shrink-0 bg-hogwarts/90 text-parchment/40 text-[10px] text-center py-1.5 tracking-widest font-serif italic">
        ✦ Méfait accompli ✦
      </footer>
    </div>
  );
}
