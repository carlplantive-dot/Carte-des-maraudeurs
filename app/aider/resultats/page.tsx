"use client";
import { useState, useMemo, useEffect, useCallback, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { maraudes as staticMaraudes } from "@/data/maraudes";
import { Maraude } from "@/types/maraude";
import type L from "leaflet";
import MaraudeCard from "@/components/MaraudeCard";
import FilterDrawer from "@/components/FilterDrawer";
import { MomentJournee, getMomentJournee, isEnCours } from "@/lib/time";
import { Categorie, CATEGORIES, getCategorie } from "@/lib/categories";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-cream">
      <p className="text-warm-mid text-sm animate-pulse">Chargement de la carte…</p>
    </div>
  ),
});

function LoadingUI() {
  return (
    <div className="flex items-center justify-center h-screen bg-cream">
      <p className="text-warm-mid text-sm animate-pulse">Chargement…</p>
    </div>
  );
}

const MOMENT_LABELS: Record<MomentJournee, string> = {
  Jour: "journée",
  Soir: "soirée",
  Nuit: "nuit",
};

function ResultatsContent() {
  const searchParams = useSearchParams();

  // Read URL params
  const quand = searchParams.get("quand");
  const momentParam = searchParams.get("moment");
  const typeParam = searchParams.get("type");
  const qParam = searchParams.get("q") ?? "";

  // Local filter state initialised from URL
  const [filterPeriode, setFilterPeriode] = useState<"semaine" | "weekend" | null>(
    quand === "semaine" || quand === "weekend" ? quand : null
  );
  const [filterMoment, setFilterMoment] = useState<MomentJournee | null>(
    momentParam === "Jour" || momentParam === "Soir" || momentParam === "Nuit"
      ? (momentParam as MomentJournee)
      : null
  );
  const [filterCategorie, setFilterCategorie] = useState<Categorie | null>(
    typeParam && typeParam in CATEGORIES ? (typeParam as Categorie) : null
  );
  const [search, setSearch] = useState(qParam);

  // Data
  const [maraudes, setMaraudes] = useState<Maraude[]>(staticMaraudes);

  // UI state
  const [selectedMaraude, setSelectedMaraude] = useState<Maraude | null>(null);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [showList, setShowList] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Load maraudes from API
  useEffect(() => {
    fetch("/api/maraudes")
      .then((r) => r.json())
      .then((data) => {
        if (data.source === "sheets" && data.maraudes?.length) {
          setMaraudes(data.maraudes);
        }
      })
      .catch(() => {});
  }, []);

  // Filtered list computation
  const filtered = useMemo(() => {
    let list = maraudes;
    if (filterPeriode === "semaine")
      list = list.filter((m) =>
        m.jours.some((j) => ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"].includes(j))
      );
    if (filterPeriode === "weekend")
      list = list.filter((m) =>
        m.jours.some((j) => ["Samedi", "Dimanche"].includes(j))
      );
    if (filterMoment)
      list = list.filter((m) => {
        const mo = getMomentJournee(m);
        return mo === null || mo === filterMoment;
      });
    if (filterCategorie)
      list = list.filter((m) => getCategorie(m) === filterCategorie);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.nom.toLowerCase().includes(q) ||
          m.association.toLowerCase().includes(q) ||
          m.adresse.toLowerCase().includes(q)
      );
    }
    return list;
  }, [maraudes, filterPeriode, filterMoment, filterCategorie, search]);

  // Handlers
  const handleMaraudeClick = useCallback((maraude: Maraude) => {
    setSelectedMaraude((prev) => (prev?.id === maraude.id ? null : maraude));
  }, []);

  const handleListCardClick = useCallback(
    (maraude: Maraude) => {
      setSelectedMaraude((prev) => (prev?.id === maraude.id ? null : maraude));
      mapInstanceRef.current?.setView([maraude.lat, maraude.lng], 15, { animate: true });
      // list stays open — do NOT toggle showList
    },
    []
  );

  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(loc);
        setGeoLoading(false);
        mapInstanceRef.current?.setView(loc, 15, { animate: true });
      },
      () => {
        setGeoLoading(false);
      },
      { timeout: 8000 }
    );
  }, []);

  // "← Affiner" back link preserves active params
  const aiderHref = (() => {
    const params = new URLSearchParams();
    if (filterPeriode) params.set("quand", filterPeriode);
    if (filterMoment) params.set("moment", filterMoment);
    if (filterCategorie) params.set("type", filterCategorie);
    if (search.trim()) params.set("q", search.trim());
    const qs = params.toString();
    return qs ? `/aider?${qs}` : "/aider";
  })();

  // Active filter pills
  const pills: { key: string; label: string; onRemove: () => void }[] = [];
  if (filterPeriode) {
    pills.push({
      key: "periode",
      label: filterPeriode === "semaine" ? "en semaine" : "le week-end",
      onRemove: () => setFilterPeriode(null),
    });
  }
  if (filterMoment) {
    pills.push({
      key: "moment",
      label: MOMENT_LABELS[filterMoment],
      onRemove: () => setFilterMoment(null),
    });
  }
  if (filterCategorie) {
    pills.push({
      key: "categorie",
      label: CATEGORIES[filterCategorie].label,
      onRemove: () => setFilterCategorie(null),
    });
  }

  // Shared search input
  const SearchInput = (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-mid text-sm select-none">
        🔍
      </span>
      <input
        type="text"
        placeholder="Rechercher une action, une association…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full pl-9 pr-8 py-2 rounded-xl border border-warm-border bg-cream text-sm text-warm-dark placeholder:text-warm-mid/50 focus:outline-none focus:border-brick/50"
      />
      {search && (
        <button
          onClick={() => setSearch("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-mid hover:text-warm-dark text-xs"
        >
          ✕
        </button>
      )}
    </div>
  );

  // Shared top bar (back link + pills + count)
  const TopBar = (
    <div className="flex items-center gap-2 flex-wrap min-h-[28px]">
      <Link
        href={aiderHref}
        className="flex-shrink-0 text-xs font-semibold text-brick hover:underline"
      >
        ← Affiner
      </Link>
      {pills.map((pill) => (
        <button
          key={pill.key}
          onClick={pill.onRemove}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-brick/10 text-brick text-[11px] font-semibold rounded-full border border-brick/20 hover:bg-brick/20 transition-colors"
        >
          {pill.label}
          <span className="text-brick/60 ml-0.5">×</span>
        </button>
      ))}
      <span className="text-xs text-warm-mid ml-auto flex-shrink-0">
        {filtered.length} action{filtered.length !== 1 ? "s" : ""}
      </span>
    </div>
  );

  // Inline action card renderer (avoids defining nested React components)
  const renderActionCard = (m: Maraude) => {
    const cat = getCategorie(m);
    const { icon, color, bg } = CATEGORIES[cat];
    const selected = selectedMaraude?.id === m.id;
    const enCours = isEnCours(m);
    const adresseShort = m.adresse.split(",")[0];

    return (
      <div
        key={m.id}
        className={`px-4 py-3.5 border-b border-warm-border/60 cursor-pointer transition-colors ${
          selected ? "bg-amber-50/50" : "hover:bg-cream/80"
        }`}
        onClick={() => handleListCardClick(m)}
        onMouseEnter={() => setHighlightedId(m.id)}
        onMouseLeave={() => setHighlightedId(null)}
      >
        <div className="flex items-start gap-3">
          {/* Category icon */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base mt-0.5"
            style={{ backgroundColor: bg, color }}
          >
            {icon}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
              <span className="text-sm font-semibold text-warm-dark leading-snug truncate max-w-[180px]">
                {m.nom}
              </span>
              {enCours && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-500 text-white text-[9px] font-bold rounded-full flex-shrink-0">
                  <span className="w-1 h-1 rounded-full bg-white animate-pulse inline-block" />
                  en cours
                </span>
              )}
            </div>
            <p className="text-xs text-warm-mid">{m.association}</p>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-warm-mid/80">
              <span>{m.horaire}</span>
              {adresseShort && (
                <>
                  <span className="text-warm-border">·</span>
                  <span className="truncate">{adresseShort}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Expanded buttons when selected */}
        {selected && (
          <div className="flex gap-2 mt-3 pl-12 flex-wrap">
            {m.benevole_url && (
              <a
                href={m.benevole_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: color }}
              >
                Devenir bénévole
              </a>
            )}
            <Link
              href={`/maraude/${m.id}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold border border-warm-border text-warm-dark hover:border-brick hover:text-brick transition-colors"
            >
              Fiche →
            </Link>
          </div>
        )}
      </div>
    );
  };

  const EmptyState = (
    <div className="flex flex-col items-center justify-center h-40 text-warm-mid gap-2">
      <span className="text-2xl">🔍</span>
      <p className="text-sm">Aucune action trouvée</p>
      <Link href="/aider" className="text-xs text-brick hover:underline mt-1">
        Modifier les filtres
      </Link>
    </div>
  );

  return (
    <>
      {/* ═══ DESKTOP (lg+) — hidden lg:flex h-screen ═══════════════════════ */}
      <div className="hidden lg:flex h-screen overflow-hidden bg-cream">

        {/* Left panel */}
        <div className="w-[400px] flex-shrink-0 border-r border-warm-border flex flex-col bg-white">

          {/* Top bar: back + pills + count */}
          <div className="flex-shrink-0 px-4 pt-4 pb-2 border-b border-warm-border/60 space-y-2.5">
            {TopBar}
            {SearchInput}
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0
              ? EmptyState
              : filtered.map(renderActionCard)}
          </div>
        </div>

        {/* Right panel: map */}
        <div className="flex-1 relative">
          <Map
            maraudes={filtered}
            allMaraudes={maraudes}
            onMaraudeClick={handleMaraudeClick}
            selectedId={selectedMaraude?.id ?? null}
            highlightedId={highlightedId}
            userLocation={userLocation}
            onMapReady={(map) => {
              mapInstanceRef.current = map;
            }}
          />
          {selectedMaraude && (
            <MaraudeCard
              maraude={selectedMaraude}
              onClose={() => setSelectedMaraude(null)}
            />
          )}
        </div>
      </div>

      {/* ═══ MOBILE (< lg) — lg:hidden ══════════════════════════════════════ */}
      <div className="lg:hidden flex flex-col h-screen bg-cream text-warm-dark overflow-hidden">

        {/* Top filter bar */}
        <div className="flex-shrink-0 px-4 pt-3.5 pb-3 bg-white border-b border-warm-border/60 space-y-2.5">
          {TopBar}
          {SearchInput}
        </div>

        {/* Main area: map or list */}
        <main className="flex-1 relative overflow-hidden">

          {/* Map view */}
          <div className={showList ? "hidden" : "absolute inset-0"}>
            <Map
              maraudes={filtered}
              allMaraudes={maraudes}
              onMaraudeClick={handleMaraudeClick}
              selectedId={selectedMaraude?.id ?? null}
              highlightedId={highlightedId}
              userLocation={userLocation}
              onMapReady={(map) => {
                mapInstanceRef.current = map;
              }}
            />
            {/* Count badge */}
            <div className="absolute top-3 right-3 z-[900] bg-brick text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md">
              {filtered.length} action{filtered.length !== 1 ? "s" : ""}
            </div>
            {selectedMaraude && (
              <MaraudeCard
                maraude={selectedMaraude}
                onClose={() => setSelectedMaraude(null)}
              />
            )}
          </div>

          {/* List view */}
          {showList && (
            <div className="absolute inset-0 overflow-y-auto bg-white">
              {filtered.length === 0
                ? EmptyState
                : filtered.map(renderActionCard)}
            </div>
          )}
        </main>

        {/* Bottom navigation */}
        <nav className="flex-shrink-0 bg-brick border-t border-white/10 flex items-stretch z-10">
          <button
            onClick={() => {
              setShowList(false);
              setSelectedMaraude(null);
            }}
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 active:bg-white/10 transition-colors ${
              !showList ? "text-white" : "text-white/60"
            }`}
          >
            <span className="text-lg leading-none">🗺️</span>
            <span className="text-[10px] font-medium">Carte</span>
          </button>

          <button
            onClick={() => {
              setShowList(true);
              setSelectedMaraude(null);
            }}
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 active:bg-white/10 transition-colors ${
              showList ? "text-white" : "text-white/60"
            }`}
          >
            <span className="text-lg leading-none">📋</span>
            <span className="text-[10px] font-medium">Liste</span>
          </button>

          <button
            onClick={() => setShowFilterDrawer(true)}
            className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-white/60 active:bg-white/10 transition-colors"
          >
            <span className="text-lg leading-none">🎛️</span>
            <span className="text-[10px] font-medium">Filtres</span>
          </button>

          <button
            onClick={handleGeolocate}
            disabled={geoLoading}
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 active:bg-white/10 disabled:opacity-50 transition-colors ${
              userLocation ? "text-white" : "text-white/60"
            }`}
          >
            {geoLoading ? (
              <span className="animate-spin w-4 h-4 border-2 border-white/40 border-t-white rounded-full" />
            ) : (
              <span className="text-lg leading-none">📍</span>
            )}
            <span className="text-[10px] font-medium">Moi</span>
          </button>
        </nav>
      </div>

      {/* Filter drawer (mobile — exposes moment + categorie filters) */}
      <FilterDrawer
        open={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        selectedJour={null}
        onJourChange={() => {}}
        selectedAssos={[]}
        onAssosChange={() => {}}
        filterSaison={false}
        onFilterSaisonChange={() => {}}
        filterEnCours={false}
        onFilterEnCoursChange={() => {}}
        filterMoment={filterMoment}
        onFilterMomentChange={setFilterMoment}
        filterCategorie={filterCategorie}
        onFilterCategorieChange={setFilterCategorie}
        count={filtered.length}
      />
    </>
  );
}

export default function ResultatsPage() {
  return (
    <Suspense fallback={<LoadingUI />}>
      <ResultatsContent />
    </Suspense>
  );
}
