"use client";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { maraudes as staticMaraudes } from "@/data/maraudes";
import { Maraude } from "@/types/maraude";
import type L from "leaflet";
import MaraudeCard from "@/components/MaraudeCard";
import { isEnCours } from "@/lib/time";
import { CATEGORIES, ALL_CATEGORIES, Categorie, getCategorie } from "@/lib/categories";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-cream">
      <p className="text-warm-mid text-sm animate-pulse">Chargement de la carte…</p>
    </div>
  ),
});

const CATEGORIE_ARIA_LABELS: Record<Categorie, string> = {
  Maraude: "Maraude de rue",
  Repas: "Manger",
  Vêtements: "Vêtements et hygiène",
  Accueil: "Accueil et écoute",
  Accompagnement: "Accompagnement social",
  Soins: "Soins médicaux",
  Hébergement: "Hébergement",
};

export default function AidePage() {
  const [maraudes, setMaraudes] = useState<Maraude[]>(staticMaraudes);
  const [filterCategorie, setFilterCategorie] = useState<Categorie | null>(null);
  const [filterQuand, setFilterQuand] = useState<"maintenant" | "aujourd'hui" | null>(null);
  const [selectedMaraude, setSelectedMaraude] = useState<Maraude | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mobileMapExpanded, setMobileMapExpanded] = useState(false);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    fetch("/api/maraudes")
      .then((r) => r.json())
      .then((data) => {
        if (data.source === "sheets" && data.maraudes?.length) setMaraudes(data.maraudes);
      })
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    let list = maraudes;
    if (filterCategorie) list = list.filter((m) => getCategorie(m) === filterCategorie);
    if (filterQuand === "maintenant") list = list.filter((m) => isEnCours(m));
    if (filterQuand === "aujourd'hui") {
      const today = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"][new Date().getDay()];
      list = list.filter((m) => m.jours.length === 0 || m.jours.includes(today as never));
    }
    return list;
  }, [maraudes, filterCategorie, filterQuand]);

  const handleMaraudeClick = useCallback((maraude: Maraude) => {
    setSelectedMaraude((prev) => (prev?.id === maraude.id ? null : maraude));
  }, []);

  const toggleCategorie = (cat: Categorie) => {
    setFilterCategorie((prev) => (prev === cat ? null : cat));
    setSelectedMaraude(null);
  };

  const toggleQuand = (val: "maintenant" | "aujourd'hui") => {
    setFilterQuand((prev) => (prev === val ? null : val));
    setSelectedMaraude(null);
  };

  const categoryButtons = (
    <div
      className="grid grid-cols-2 gap-3"
      role="group"
      aria-label="Filtrer par type de besoin"
    >
      {ALL_CATEGORIES.map((cat) => {
        const { icon, label, color } = CATEGORIES[cat];
        const active = filterCategorie === cat;
        return (
          <button
            key={cat}
            onClick={() => toggleCategorie(cat)}
            aria-label={CATEGORIE_ARIA_LABELS[cat]}
            aria-pressed={active}
            className={[
              "rounded-2xl border-2 p-4 flex flex-col items-center gap-2 text-sm font-bold transition-all",
              "focus:outline-none focus:ring-2 focus:ring-brick",
              active
                ? "text-white border-transparent"
                : "bg-white text-warm-dark border-warm-border hover:border-brick",
            ].join(" ")}
            style={active ? { backgroundColor: color, borderColor: color } : undefined}
          >
            <span className="text-2xl leading-none" aria-hidden="true">{icon}</span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );

  const quandPills = (
    <div role="group" aria-label="Filtrer par disponibilité">
      <p className="text-sm font-semibold text-warm-mid mb-2">Quand ?</p>
      <div className="flex flex-wrap gap-2">
        {(
          [
            { val: "maintenant" as const, label: "Maintenant" },
            { val: "aujourd'hui" as const, label: "Aujourd'hui" },
          ] as const
        ).map(({ val, label }) => {
          const active = filterQuand === val;
          return (
            <button
              key={val}
              onClick={() => toggleQuand(val)}
              aria-pressed={active}
              className={[
                "rounded-full px-4 py-1.5 text-sm font-semibold transition-all",
                "focus:outline-none focus:ring-2 focus:ring-brick",
                active
                  ? "bg-brick text-white"
                  : "bg-cream text-warm-mid border border-warm-border hover:border-brick",
              ].join(" ")}
            >
              {label}
            </button>
          );
        })}
        <button
          onClick={() => setFilterQuand(null)}
          aria-pressed={filterQuand === null}
          className={[
            "rounded-full px-4 py-1.5 text-sm font-semibold transition-all",
            "focus:outline-none focus:ring-2 focus:ring-brick",
            filterQuand === null
              ? "bg-brick text-white"
              : "bg-cream text-warm-mid border border-warm-border hover:border-brick",
          ].join(" ")}
        >
          Peu importe
        </button>
      </div>
    </div>
  );

  const countLabel = `${filtered.length} action${filtered.length !== 1 ? "s" : ""} disponible${filtered.length !== 1 ? "s" : ""}`;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-cream text-warm-dark">
      {/* ── Permanent 115 banner ──────────────────────────────────────── */}
      <div
        className="flex-shrink-0 bg-warm-dark text-white text-sm font-bold px-4 py-3 flex items-center justify-center gap-3"
        role="banner"
      >
        <span>Urgence ? Appelez le</span>
        <a
          href="tel:115"
          className="underline font-black text-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-1 focus:ring-offset-warm-dark rounded"
          aria-label="Appeler le 115, le Samu Social"
        >
          115
        </a>
        <span>— Samu Social, gratuit, 24h/24</span>
      </div>

      {/* ── DESKTOP (lg+) ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="w-[440px] flex-shrink-0 bg-cream border-r border-warm-border overflow-y-auto px-8 py-8 flex flex-col gap-6">
          <Link
            href="/"
            className="text-warm-mid hover:text-brick text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brick rounded w-fit"
            aria-label="Retour à l'accueil"
          >
            ← Accueil
          </Link>

          <h1 className="text-2xl font-bold text-warm-dark leading-snug">
            De quoi avez-vous besoin ?
          </h1>

          {categoryButtons}

          {quandPills}

          <p className="text-warm-mid text-sm" aria-live="polite" aria-atomic="true">
            {countLabel}
          </p>
        </div>

        {/* Right panel — map */}
        <div className="flex-1 relative">
          <Map
            maraudes={filtered}
            allMaraudes={maraudes}
            onMaraudeClick={handleMaraudeClick}
            selectedId={selectedMaraude?.id ?? null}
            userLocation={userLocation}
            onMapReady={(map) => { mapInstanceRef.current = map; }}
          />

          {/* Info overlay */}
          <div
            className="absolute bottom-4 left-4 z-[900] bg-white/90 backdrop-blur-sm text-warm-dark text-xs font-semibold px-3 py-2 rounded-full shadow-md border border-warm-border"
            aria-live="polite"
            aria-atomic="true"
          >
            {filtered.length} action{filtered.length !== 1 ? "s" : ""} disponible{filtered.length !== 1 ? "s" : ""}&nbsp;·&nbsp;
            {filterCategorie ? CATEGORIES[filterCategorie].label : "toutes catégories"}
          </div>

          {selectedMaraude && (
            <MaraudeCard
              maraude={selectedMaraude}
              onClose={() => setSelectedMaraude(null)}
            />
          )}
        </div>
      </div>

      {/* ── MOBILE (< lg) ─────────────────────────────────────────────── */}
      <div className="lg:hidden flex flex-col flex-1 overflow-y-auto">
        <div className="px-4 pt-4 pb-6 flex flex-col gap-5">
          <Link
            href="/"
            className="text-warm-mid hover:text-brick text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brick rounded w-fit"
            aria-label="Retour à l'accueil"
          >
            ← Accueil
          </Link>

          <h1 className="text-xl font-bold text-warm-dark leading-snug">
            De quoi avez-vous besoin ?
          </h1>

          {/* Category grid — taller on mobile */}
          <div
            className="grid grid-cols-2 gap-3"
            role="group"
            aria-label="Filtrer par type de besoin"
          >
            {ALL_CATEGORIES.map((cat) => {
              const { icon, label, color } = CATEGORIES[cat];
              const active = filterCategorie === cat;
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategorie(cat)}
                  aria-label={CATEGORIE_ARIA_LABELS[cat]}
                  aria-pressed={active}
                  className={[
                    "rounded-2xl border-2 py-5 px-4 flex flex-col items-center gap-2 text-sm font-bold transition-all w-full",
                    "focus:outline-none focus:ring-2 focus:ring-brick",
                    active
                      ? "text-white border-transparent"
                      : "bg-white text-warm-dark border-warm-border hover:border-brick",
                  ].join(" ")}
                  style={active ? { backgroundColor: color, borderColor: color } : undefined}
                >
                  <span className="text-3xl leading-none" aria-hidden="true">{icon}</span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {quandPills}

          {/* CTA */}
          <Link
            href="#carte-mobile"
            onClick={() => setMobileMapExpanded(true)}
            className="w-full py-4 bg-brick hover:bg-brick-dark text-white text-sm font-bold rounded-2xl text-center transition-colors focus:outline-none focus:ring-2 focus:ring-brick focus:ring-offset-2"
            aria-live="polite"
            aria-atomic="true"
          >
            Voir les {filtered.length} action{filtered.length !== 1 ? "s" : ""} →
          </Link>
        </div>

        {/* Mobile map */}
        <div
          id="carte-mobile"
          className="flex-shrink-0 relative transition-all duration-300"
          style={{ height: mobileMapExpanded ? "calc(100vh - 140px)" : "14rem" }}
        >
          <Map
            maraudes={filtered}
            allMaraudes={maraudes}
            onMaraudeClick={handleMaraudeClick}
            selectedId={selectedMaraude?.id ?? null}
            userLocation={userLocation}
          />

          {/* Expand / collapse button */}
          <button
            onClick={() => setMobileMapExpanded((v) => !v)}
            className="absolute top-2 right-2 z-[900] bg-white text-warm-dark text-xs font-semibold px-3 py-1.5 rounded-full shadow border border-warm-border focus:outline-none focus:ring-2 focus:ring-brick"
            aria-label={mobileMapExpanded ? "Réduire la carte" : "Agrandir la carte"}
          >
            {mobileMapExpanded ? "Réduire ↑" : "Agrandir ↓"}
          </button>

          {/* Count badge */}
          <div
            className="absolute top-2 left-2 z-[900] bg-brick text-white text-xs font-bold px-3 py-1.5 rounded-full shadow"
            aria-live="polite"
            aria-atomic="true"
          >
            {filtered.length} action{filtered.length !== 1 ? "s" : ""}
          </div>

          {selectedMaraude && (
            <MaraudeCard
              maraude={selectedMaraude}
              onClose={() => setSelectedMaraude(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
