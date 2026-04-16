"use client";

import { useEffect } from "react";
import { Jour } from "@/types/maraude";
import { JOURS_SEMAINE } from "@/data/maraudes";
import { ALL_ASSOCIATIONS, ASSOCIATION_COLORS } from "@/lib/associations";

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  selectedJour: Jour | null;
  onJourChange: (j: Jour | null) => void;
  selectedAssos: string[];
  onAssosChange: (a: string[]) => void;
  count: number;
}

export default function FilterDrawer({
  open,
  onClose,
  selectedJour,
  onJourChange,
  selectedAssos,
  onAssosChange,
  count,
}: FilterDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: PopStateEvent) => { e.preventDefault(); onClose(); };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [open, onClose]);

  if (!open) return null;

  const hasFilters = selectedJour !== null || selectedAssos.length > 0;

  return (
    <>
      {/* Fond semi-transparent */}
      <div
        className="fixed inset-0 z-[950] bg-warm-dark/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 z-[960] bg-white rounded-t-3xl shadow-2xl animate-slide-up-drawer max-h-[85vh] flex flex-col">

        {/* En-tête */}
        <div className="flex-shrink-0 px-5 pt-3 pb-4 border-b border-warm-border">
          <div className="flex justify-center mb-3">
            <div className="w-10 h-1 rounded-full bg-warm-border" />
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={() => { onJourChange(null); onAssosChange([]); }}
              className={`text-xs text-brick underline transition-opacity ${hasFilters ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              Réinitialiser
            </button>
            <h2 className="text-sm font-bold text-warm-dark">Filtres</h2>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-cream text-warm-mid hover:text-warm-dark transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

          {/* Jour de la semaine */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-warm-mid mb-3">
              Jour de la semaine
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onJourChange(null)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                  selectedJour === null
                    ? "bg-brick text-white border-brick shadow-sm"
                    : "bg-cream text-warm-dark border-warm-border hover:border-brick"
                }`}
              >
                Tous
              </button>
              {JOURS_SEMAINE.map((j) => (
                <button
                  key={j}
                  onClick={() => onJourChange(selectedJour === j ? null : j)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                    selectedJour === j
                      ? "bg-brick text-white border-brick shadow-sm"
                      : "bg-cream text-warm-dark border-warm-border hover:border-brick"
                  }`}
                >
                  {j}
                </button>
              ))}
            </div>
          </div>

          {/* Association */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-warm-mid mb-3">
              Association
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onAssosChange([])}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  selectedAssos.length === 0
                    ? "bg-brick text-white border-brick shadow-sm"
                    : "bg-cream text-warm-dark border-warm-border hover:border-brick"
                }`}
              >
                Toutes
              </button>
              {ALL_ASSOCIATIONS.map((asso) => {
                const active = selectedAssos.includes(asso);
                const color = ASSOCIATION_COLORS[asso] ?? "#C0622F";
                return (
                  <button
                    key={asso}
                    onClick={() =>
                      onAssosChange(
                        active
                          ? selectedAssos.filter((a) => a !== asso)
                          : [...selectedAssos, asso]
                      )
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      active
                        ? "text-white border-transparent"
                        : "bg-cream text-warm-dark border-warm-border hover:border-brick"
                    }`}
                    style={active ? { backgroundColor: color } : {}}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: active ? "rgba(255,255,255,0.7)" : color }}
                    />
                    {asso}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bouton CTA */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-warm-border">
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-brick hover:bg-brick-dark text-white rounded-2xl font-bold text-sm shadow-sm transition-colors"
          >
            Voir {count} maraude{count !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </>
  );
}
