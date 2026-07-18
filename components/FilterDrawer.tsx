"use client";

import { useEffect, useState } from "react";
import { Jour } from "@/types/maraude";
import { JOURS_SEMAINE } from "@/data/maraudes";
import { ALL_ASSOCIATIONS, ASSOCIATION_COLORS } from "@/lib/associations";
import { MomentJournee } from "@/lib/time";
import { ALL_CATEGORIES, CATEGORIES, Categorie } from "@/lib/categories";

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  selectedJour: Jour | null;
  onJourChange: (j: Jour | null) => void;
  selectedAssos: string[];
  onAssosChange: (a: string[]) => void;
  filterSaison: boolean;
  onFilterSaisonChange: (v: boolean) => void;
  filterEnCours: boolean;
  onFilterEnCoursChange: (v: boolean) => void;
  filterMoment: MomentJournee | null;
  onFilterMomentChange: (v: MomentJournee | null) => void;
  filterCategorie: Categorie | null;
  onFilterCategorieChange: (v: Categorie | null) => void;
  count: number;
}

export default function FilterDrawer({
  open, onClose,
  selectedJour, onJourChange,
  selectedAssos, onAssosChange,
  filterSaison, onFilterSaisonChange,
  filterEnCours, onFilterEnCoursChange,
  filterMoment, onFilterMomentChange,
  filterCategorie, onFilterCategorieChange,
  count,
}: FilterDrawerProps) {
  const [assoSearch, setAssoSearch] = useState("");

  useEffect(() => {
    if (!open) return;
    const handler = (e: PopStateEvent) => { e.preventDefault(); onClose(); };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [open, onClose]);

  if (!open) return null;

  const hasFilters = selectedJour !== null || selectedAssos.length > 0 || filterSaison || filterEnCours || filterMoment !== null || filterCategorie !== null;

  const filteredAssos = ALL_ASSOCIATIONS.filter(a =>
    a.toLowerCase().includes(assoSearch.toLowerCase())
  );

  const reset = () => {
    onJourChange(null);
    onAssosChange([]);
    onFilterSaisonChange(false);
    onFilterEnCoursChange(false);
    onFilterMomentChange(null);
    onFilterCategorieChange(null);
    setAssoSearch("");
  };

  return (
    <>
      <div className="fixed inset-0 z-[950] bg-warm-dark/30 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed bottom-0 left-0 right-0 z-[960] bg-white rounded-t-3xl shadow-2xl animate-slide-up-drawer max-h-[88vh] flex flex-col">

        {/* En-tête */}
        <div className="flex-shrink-0 px-5 pt-3 pb-4 border-b border-warm-border/60">
          <div className="flex justify-center mb-3">
            <div className="w-10 h-1 rounded-full bg-warm-border" />
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={reset}
              className={`text-xs font-semibold text-brick transition-opacity ${hasFilters ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              Réinitialiser
            </button>
            <h2 className="text-sm font-bold text-warm-dark">Filtres</h2>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-cream text-warm-mid hover:text-warm-dark text-sm transition-colors">✕</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

          {/* Type d'action */}
          <section>
            <p className="text-[11px] font-bold uppercase tracking-widest text-warm-mid mb-3">Type d'action</p>
            <div className="grid grid-cols-2 gap-2">
              {ALL_CATEGORIES.map((cat) => {
                const { icon, label, color, bg } = CATEGORIES[cat];
                const active = filterCategorie === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => onFilterCategorieChange(active ? null : cat)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all text-left ${
                      active ? "border-transparent text-white shadow-sm" : "border-warm-border/70 text-warm-dark hover:border-warm-border"
                    }`}
                    style={active ? { backgroundColor: color } : { backgroundColor: bg }}
                  >
                    <span className="text-base">{icon}</span>
                    <span className="leading-tight">{label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Disponibilité */}
          <section>
            <p className="text-[11px] font-bold uppercase tracking-widest text-warm-mid mb-3">Disponibilité</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onFilterEnCoursChange(!filterEnCours)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                  filterEnCours ? "bg-green-500 text-white border-green-500 shadow-sm" : "bg-cream text-warm-dark border-warm-border hover:border-green-400"
                }`}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${filterEnCours ? "bg-white animate-pulse" : "bg-green-400"}`} />
                En cours maintenant
              </button>
              <button
                onClick={() => onFilterSaisonChange(!filterSaison)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                  filterSaison ? "bg-olive text-white border-olive shadow-sm" : "bg-cream text-warm-dark border-warm-border hover:border-olive"
                }`}
              >
                🗓 En saison
              </button>
            </div>
          </section>

          {/* Moment */}
          <section>
            <p className="text-[11px] font-bold uppercase tracking-widest text-warm-mid mb-3">Moment de la journée</p>
            <div className="flex flex-wrap gap-2">
              {([
                { value: "Jour" as MomentJournee, label: "Journée", icon: "☀️", sub: "6h–18h" },
                { value: "Soir" as MomentJournee, label: "Soirée",  icon: "🌇", sub: "18h–21h" },
                { value: "Nuit" as MomentJournee, label: "Nuit",    icon: "🌙", sub: "21h+" },
              ]).map(({ value, label, icon, sub }) => (
                <button
                  key={value}
                  onClick={() => onFilterMomentChange(filterMoment === value ? null : value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                    filterMoment === value ? "bg-brick text-white border-brick shadow-sm" : "bg-cream text-warm-dark border-warm-border hover:border-brick"
                  }`}
                >
                  {icon} {label} <span className={`text-[10px] ${filterMoment === value ? "text-white/70" : "text-warm-mid"}`}>{sub}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Jour */}
          <section>
            <p className="text-[11px] font-bold uppercase tracking-widest text-warm-mid mb-3">Jour de la semaine</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onJourChange(null)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                  selectedJour === null ? "bg-brick text-white border-brick shadow-sm" : "bg-cream text-warm-dark border-warm-border hover:border-brick"
                }`}
              >
                Tous
              </button>
              {JOURS_SEMAINE.map((j) => (
                <button
                  key={j}
                  onClick={() => onJourChange(selectedJour === j ? null : j as Jour)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                    selectedJour === j ? "bg-brick text-white border-brick shadow-sm" : "bg-cream text-warm-dark border-warm-border hover:border-brick"
                  }`}
                >
                  {j}
                </button>
              ))}
            </div>
          </section>

          {/* Association */}
          <section>
            <p className="text-[11px] font-bold uppercase tracking-widest text-warm-mid mb-3">
              Association <span className="normal-case font-normal">({ALL_ASSOCIATIONS.length})</span>
            </p>
            <div className="relative mb-3">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-mid text-xs">🔍</span>
              <input
                type="text"
                placeholder="Rechercher une association…"
                value={assoSearch}
                onChange={e => setAssoSearch(e.target.value)}
                className="w-full pl-8 pr-4 py-2 rounded-xl border border-warm-border bg-cream text-xs text-warm-dark placeholder:text-warm-mid/50 focus:outline-none focus:border-brick/50"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
              {filteredAssos.length === 0 ? (
                <p className="text-xs text-warm-mid italic">Aucune association trouvée</p>
              ) : (
                filteredAssos.map((asso) => {
                  const active = selectedAssos.includes(asso);
                  const color = ASSOCIATION_COLORS[asso] ?? "#C0622F";
                  return (
                    <button
                      key={asso}
                      onClick={() => onAssosChange(active ? selectedAssos.filter(a => a !== asso) : [...selectedAssos, asso])}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                        active ? "text-white border-transparent" : "bg-cream text-warm-dark border-warm-border/70 hover:border-warm-mid"
                      }`}
                      style={active ? { backgroundColor: color } : {}}
                    >
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: active ? "rgba(255,255,255,0.7)" : color }} />
                      {asso}
                    </button>
                  );
                })
              )}
            </div>
          </section>
        </div>

        {/* CTA */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-warm-border/60">
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-brick hover:bg-brick-dark text-white rounded-2xl font-bold text-sm shadow-sm transition-colors"
          >
            Voir {count} action{count !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </>
  );
}
