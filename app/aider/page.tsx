"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { maraudes as staticMaraudes } from "@/data/maraudes";
import { Maraude } from "@/types/maraude";
import { MomentJournee, getMomentJournee } from "@/lib/time";
import { ALL_CATEGORIES, CATEGORIES, Categorie, getCategorie } from "@/lib/categories";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-cream animate-pulse" />,
});

// ── Chip component ────────────────────────────────────────────────────────────

interface ChipProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function Chip({ active, onClick, children }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-3 py-1.5 rounded-full text-sm font-semibold border transition-all",
        active
          ? "bg-brick text-white border-brick"
          : "bg-white text-warm-mid border-warm-border hover:border-brick",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AiderPage() {
  const router = useRouter();

  const [maraudes, setMaraudes] = useState<Maraude[]>(staticMaraudes);
  const [filterPeriode, setFilterPeriode] = useState<"semaine" | "weekend" | null>(null);
  const [filterMoment, setFilterMoment] = useState<MomentJournee | null>(null);
  const [filterCategorie, setFilterCategorie] = useState<Categorie | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Load maraudes from API on mount
  useEffect(() => {
    fetch("/api/maraudes")
      .then((res) => res.json())
      .then((data) => { if (data.maraudes?.length) setMaraudes(data.maraudes); })
      .catch(() => {});
  }, []);

  // Filtered list (memoised)
  const filtered = useMemo(() => {
    let list = maraudes;
    if (filterPeriode === "semaine")
      list = list.filter((m) =>
        m.jours.some((j) => ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"].includes(j))
      );
    if (filterPeriode === "weekend")
      list = list.filter((m) => m.jours.some((j) => ["Samedi", "Dimanche"].includes(j)));
    if (filterMoment)
      list = list.filter((m) => {
        const mo = getMomentJournee(m);
        return mo === null || mo === filterMoment;
      });
    if (filterCategorie)
      list = list.filter((m) => getCategorie(m) === filterCategorie);
    return list;
  }, [maraudes, filterPeriode, filterMoment, filterCategorie]);

  // Navigate to results with query params
  function handleCTA() {
    const params: Record<string, string> = {};
    if (filterPeriode) params.quand = filterPeriode;
    if (filterMoment) params.moment = filterMoment;
    if (filterCategorie) params.type = filterCategorie;
    router.push("/aider/resultats?" + new URLSearchParams(params).toString());
  }

  // Toggle helpers — clicking the active chip deselects it
  function togglePeriode(value: "semaine" | "weekend") {
    setFilterPeriode((prev) => (prev === value ? null : value));
  }
  function toggleMoment(value: MomentJournee) {
    setFilterMoment((prev) => (prev === value ? null : value));
  }
  function toggleCategorie(value: Categorie | null) {
    setFilterCategorie((prev) => (prev === value ? null : value));
  }

  // ── Left panel content (shared between desktop and mobile) ─────────────────
  const filterPanel = (
    <div className="flex flex-col gap-6">
      {/* Back link */}
      <Link
        href="/"
        className="text-warm-mid hover:text-brick text-sm font-medium transition-colors self-start"
      >
        ← Accueil
      </Link>

      {/* Heading */}
      <h2 className="text-2xl font-bold text-warm-dark">Je veux aider</h2>

      {/* ── Section: disponibilité ── */}
      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-warm-mid/70">
          Quand êtes-vous disponible ?
        </h3>

        {/* Période */}
        <div className="flex flex-wrap gap-2">
          <Chip active={filterPeriode === "semaine"} onClick={() => togglePeriode("semaine")}>
            en semaine
          </Chip>
          <Chip active={filterPeriode === "weekend"} onClick={() => togglePeriode("weekend")}>
            le week-end
          </Chip>
        </div>

        {/* Moment de la journée */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-warm-mid">plutôt :</span>
          <Chip active={filterMoment === "Jour"} onClick={() => toggleMoment("Jour")}>
            ☀️ journée
          </Chip>
          <Chip active={filterMoment === "Soir"} onClick={() => toggleMoment("Soir")}>
            🌇 soirée
          </Chip>
          <Chip active={filterMoment === "Nuit"} onClick={() => toggleMoment("Nuit")}>
            🌙 nuit
          </Chip>
        </div>
      </section>

      {/* ── Section: type d'action ── */}
      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-warm-mid/70">
          Pour quelle action ?
        </h3>

        <div className="flex flex-wrap gap-2">
          {/* "tout type" — maps to null */}
          <Chip active={filterCategorie === null} onClick={() => toggleCategorie(null)}>
            tout type
          </Chip>

          {ALL_CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              active={filterCategorie === cat}
              onClick={() => toggleCategorie(cat)}
            >
              {CATEGORIES[cat].icon} {cat}
            </Chip>
          ))}
        </div>
      </section>

      {/* ── Info callout ── */}
      <div className="rounded-xl bg-olive-light border border-olive/30 px-4 py-3 text-sm text-olive leading-relaxed">
        Pas besoin d'expérience. Chaque mission indique si les débutant·e·s sont les
        bienvenus — et vous n'êtes jamais seul·e.
      </div>

      {/* ── CTA button ── */}
      <button
        type="button"
        onClick={handleCTA}
        className="w-full py-4 px-6 bg-brick hover:bg-brick-dark text-white rounded-2xl font-bold text-base text-center transition-colors"
      >
        Voir les {filtered.length} actions qui me correspondent →
      </button>
    </div>
  );

  return (
    <>
      {/* ════ DESKTOP (lg+) ════════════════════════════════════════════════ */}
      <div className="hidden lg:flex h-screen overflow-hidden bg-cream">

        {/* Left panel */}
        <div className="w-[480px] flex-shrink-0 px-10 py-10 overflow-y-auto border-r border-warm-border/60 shadow-lg z-10">
          {filterPanel}
        </div>

        {/* Right: interactive map */}
        <div className="flex-1 relative">
          <Map
            maraudes={filtered}
            allMaraudes={maraudes}
            onMaraudeClick={(m) => setSelectedId((prev) => (prev === m.id ? null : m.id))}
            selectedId={selectedId}
            userLocation={null}
          />

          {/* Map legend */}
          <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 text-xs text-warm-mid shadow-md border border-warm-border/60 leading-relaxed">
            <div className="flex items-center gap-1.5">
              <span className="text-brick font-bold">●</span> correspond
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-warm-border font-bold">●</span> hors filtre (atténué)
            </div>
          </div>

          {/* Selected marker tooltip */}
          {selectedId !== null && (() => {
            const m = maraudes.find((x) => x.id === selectedId);
            if (!m) return null;
            return (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-xl px-4 py-2 shadow-lg border border-warm-border/60 text-sm font-semibold text-warm-dark max-w-xs truncate">
                {m.nom}
              </div>
            );
          })()}
        </div>
      </div>

      {/* ════ MOBILE (< lg) ════════════════════════════════════════════════ */}
      <div className="lg:hidden flex flex-col min-h-screen bg-cream text-warm-dark">

        {/* Form panel */}
        <div className="flex-1 px-5 py-8">
          {filterPanel}
        </div>

        {/* Map thumbnail */}
        <div className="relative h-48 mx-5 mb-8 rounded-2xl overflow-hidden border border-warm-border/60 shadow-md flex-shrink-0">
          <Map
            maraudes={filtered}
            allMaraudes={maraudes}
            onMaraudeClick={() => {}}
            selectedId={null}
            userLocation={null}
          />
          {/* Agrandir overlay */}
          <Link
            href="/carte"
            className="absolute bottom-2 right-2 z-[1000] bg-brick/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow backdrop-blur-sm"
          >
            Agrandir →
          </Link>
        </div>
      </div>
    </>
  );
}
