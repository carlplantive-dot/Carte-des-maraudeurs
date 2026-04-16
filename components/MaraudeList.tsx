"use client";

import { Maraude } from "@/types/maraude";
import { ASSOCIATION_COLORS } from "@/lib/associations";
import { isEnCours } from "@/lib/time";

interface MaraudeListProps {
  maraudes: Maraude[];
  selectedId: number | null;
  onSelect: (maraude: Maraude) => void;
  search: string;
  onSearchChange: (v: string) => void;
}

export default function MaraudeList({
  maraudes,
  selectedId,
  onSelect,
  search,
  onSearchChange,
}: MaraudeListProps) {
  return (
    <div className="flex flex-col h-full bg-cream">
      {/* Barre de recherche */}
      <div className="px-4 pt-4 pb-3 flex-shrink-0">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brick text-sm select-none">🔍</span>
          <input
            type="text"
            placeholder="Rechercher une maraude, un quartier…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-full border border-warm-border bg-white text-sm text-warm-dark placeholder:text-warm-mid/60 focus:outline-none focus:border-brick shadow-sm"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-mid hover:text-warm-dark text-xs"
            >
              ✕
            </button>
          )}
        </div>
        <p className="text-[11px] text-warm-mid mt-2 text-right">
          {maraudes.length} maraude{maraudes.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Liste */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {maraudes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-warm-mid/50">
            <span className="text-4xl mb-3">🗺️</span>
            <p className="text-sm">Aucune maraude trouvée</p>
          </div>
        ) : (
          maraudes.map((m) => {
            const color = ASSOCIATION_COLORS[m.association] ?? "#C0622F";
            const isSelected = m.id === selectedId;
            const enCours = isEnCours(m);
            return (
              <button
                key={m.id}
                onClick={() => onSelect(m)}
                className={`w-full text-left bg-white rounded-2xl shadow-sm border overflow-hidden transition-all hover:shadow-md active:scale-[0.99] ${
                  isSelected ? "border-brick shadow-md ring-1 ring-brick/20" : "border-warm-border"
                }`}
              >
                <div className="flex">
                  {/* Bandeau coloré à gauche */}
                  <div className="w-1.5 flex-shrink-0" style={{ backgroundColor: color }} />

                  <div className="flex-1 px-3 py-3 min-w-0">
                    {/* Nom + indicateur en cours + flèche */}
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-warm-dark leading-snug flex-1">{m.nom}</p>
                      <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                        {enCours && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-100 text-green-700 text-[9px] font-bold rounded-full border border-green-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                            En cours
                          </span>
                        )}
                        <span className="text-warm-border text-base font-light">›</span>
                      </div>
                    </div>

                    {/* Badge association */}
                    <span
                      className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded-full border"
                      style={{
                        backgroundColor: `${color}18`,
                        borderColor: `${color}40`,
                        color: color,
                      }}
                    >
                      {m.association}
                    </span>

                    {/* Lieu + horaire */}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-[11px] text-warm-mid flex items-center gap-1">
                        <span className="select-none">📍</span>
                        <span className="truncate max-w-[140px]">{m.adresse.split(",")[0]}</span>
                      </span>
                      <span className="text-[11px] text-warm-mid flex items-center gap-1">
                        <span className="select-none">🕐</span>
                        <span>{m.horaire.split(" (")[0].trim()}</span>
                      </span>
                    </div>

                    {/* Badges jours */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {m.jours.map((j) => (
                        <span
                          key={j}
                          className="px-1.5 py-0.5 bg-olive-light text-olive text-[10px] font-semibold rounded-full"
                        >
                          {j.slice(0, 3)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
