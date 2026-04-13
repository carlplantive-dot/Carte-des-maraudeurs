"use client";

import dynamic from "next/dynamic";
import { useState, useMemo, useCallback } from "react";
import { maraudes } from "@/data/maraudes";
import { Jour, Maraude } from "@/types/maraude";
import DayFilter from "@/components/DayFilter";
import MaraudeCard from "@/components/MaraudeCard";

// Leaflet must be loaded client-side only
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-parchment rounded-2xl">
      <p className="text-hogwarts-light text-sm animate-pulse">
        Consultation de la carte…
      </p>
    </div>
  ),
});

const LEGEND = [
  { label: "Emmaüs Solidarité", color: "#8B2019" },
  { label: "La Chorba", color: "#1a5276" },
  { label: "Aurore", color: "#1d6a3a" },
  { label: "Samu Social de Paris", color: "#5d4037" },
  { label: "Les Enfants du Canal", color: "#6a3d9a" },
];

export default function HomePage() {
  const [selectedJour, setSelectedJour] = useState<Jour | null>(null);
  const [selectedMaraude, setSelectedMaraude] = useState<Maraude | null>(null);

  const filtered = useMemo(
    () =>
      selectedJour
        ? maraudes.filter((m) => m.jours.includes(selectedJour))
        : maraudes,
    [selectedJour]
  );

  const handleMaraudeClick = useCallback((maraude: Maraude) => {
    setSelectedMaraude((prev) => (prev?.id === maraude.id ? null : maraude));
  }, []);

  const handleDayChange = (jour: Jour | null) => {
    setSelectedJour(jour);
    setSelectedMaraude(null);
  };

  return (
    <div className="flex flex-col h-screen bg-parchment text-hogwarts-dark overflow-hidden">
      {/* ── Header ── */}
      <header className="z-10 bg-hogwarts text-parchment px-5 py-4 shadow-md flex-shrink-0">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <span className="text-gold text-3xl select-none" aria-hidden>
            🗺️
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-wide leading-tight">
              La Carte des Maraudeurs
            </h1>
            <p className="text-parchment/70 text-xs tracking-widest uppercase mt-0.5 font-serif italic">
              Maraudes solidaires à Paris
            </p>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-1.5 text-parchment/60 text-xs font-serif italic">
            <span className="text-gold">✦</span>
            <span>Solennellement juré de venir en aide</span>
            <span className="text-gold">✦</span>
          </div>
        </div>
      </header>

      {/* ── Day Filter ── */}
      <div className="z-10 bg-parchment border-b border-gold/30 px-4 py-3 flex-shrink-0">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs text-hogwarts-light uppercase tracking-widest mb-2 font-semibold text-center">
            Filtrer par jour
          </p>
          <DayFilter selected={selectedJour} onChange={handleDayChange} />
        </div>
      </div>

      {/* ── Map ── */}
      <main className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 p-3 sm:p-4">
          <Map
            maraudes={filtered}
            onMaraudeClick={handleMaraudeClick}
            selectedId={selectedMaraude?.id ?? null}
          />
        </div>

        {/* Legend */}
        <div className="absolute top-5 left-5 z-[900] bg-parchment/95 backdrop-blur-sm border border-gold/40 rounded-xl px-4 py-3 shadow-lg max-w-[210px]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-hogwarts-light mb-2">
            Associations
          </p>
          <ul className="space-y-1.5">
            {LEGEND.map(({ label, color }) => (
              <li key={label} className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-full border border-white/50 flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[11px] text-hogwarts-dark leading-tight">
                  {label}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-hogwarts-light/60 mt-2 text-right">
            {filtered.length} maraude{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Maraude info card */}
        {selectedMaraude && (
          <MaraudeCard
            maraude={selectedMaraude}
            onClose={() => setSelectedMaraude(null)}
          />
        )}
      </main>
    </div>
  );
}
