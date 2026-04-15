"use client";

import { useEffect } from "react";
import { Jour } from "@/types/maraude";
import { JOURS_SEMAINE } from "@/data/maraudes";
import { ALL_ASSOCIATIONS, ASSOCIATION_COLORS } from "@/lib/associations";
import AssociationFilter from "@/components/AssociationFilter";

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
  // Fermer avec le bouton retour sur Android
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[950] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 z-[960] bg-parchment rounded-t-2xl shadow-2xl animate-slide-up-drawer max-h-[80vh] flex flex-col">
        {/* Handle */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 pt-3 pb-2 border-b border-gold/30">
          <div className="flex items-center gap-2">
            <div className="w-10 h-1 bg-hogwarts-light/30 rounded-full mx-auto" />
          </div>
          <h2 className="text-sm font-bold text-hogwarts-dark absolute left-1/2 -translate-x-1/2">
            Filtres
          </h2>
          <div className="flex items-center gap-2">
            {hasFilters && (
              <button
                onClick={() => { onJourChange(null); onAssosChange([]); }}
                className="text-xs text-hogwarts-light underline"
              >
                Réinitialiser
              </button>
            )}
            <button onClick={onClose} className="text-hogwarts-light text-lg leading-none">✕</button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
          {/* Jour */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-hogwarts-light mb-2">
              Jour de la semaine
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onJourChange(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  selectedJour === null
                    ? "bg-hogwarts text-parchment border-gold"
                    : "bg-parchment text-hogwarts-dark border-hogwarts-light"
                }`}
              >
                Tous
              </button>
              {JOURS_SEMAINE.map((j) => (
                <button
                  key={j}
                  onClick={() => onJourChange(selectedJour === j ? null : j)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    selectedJour === j
                      ? "bg-hogwarts text-parchment border-gold"
                      : "bg-parchment text-hogwarts-dark border-hogwarts-light"
                  }`}
                >
                  {j}
                </button>
              ))}
            </div>
          </div>

          {/* Association */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-hogwarts-light mb-2">
              Association
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onAssosChange([])}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  selectedAssos.length === 0
                    ? "bg-hogwarts text-parchment border-gold"
                    : "bg-parchment text-hogwarts-dark border-hogwarts-light"
                }`}
              >
                Toutes
              </button>
              {ALL_ASSOCIATIONS.map((asso) => {
                const active = selectedAssos.includes(asso);
                const color = ASSOCIATION_COLORS[asso] ?? "#2c3e50";
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
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      active ? "text-white border-transparent" : "bg-parchment text-hogwarts-dark border-hogwarts-light"
                    }`}
                    style={active ? { backgroundColor: color } : {}}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: active ? "white" : color, opacity: active ? 0.8 : 1 }}
                    />
                    {asso}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-gold/30">
          <button
            onClick={onClose}
            className="w-full py-3 bg-hogwarts text-parchment rounded-xl font-semibold text-sm"
          >
            Voir {count} maraude{count !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </>
  );
}
