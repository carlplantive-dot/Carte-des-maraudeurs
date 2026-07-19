"use client";

import { Maraude } from "@/types/maraude";
import { isEnCours } from "@/lib/time";
import { getCategorie, CATEGORIES } from "@/lib/categories";

interface MaraudeListProps {
  maraudes: Maraude[];
  selectedId: number | null;
  onSelect: (maraude: Maraude) => void;
  onHover?: (maraude: Maraude | null) => void;
  search: string;
  onSearchChange: (v: string) => void;
}

export default function MaraudeList({ maraudes, selectedId, onSelect, onHover, search, onSearchChange }: MaraudeListProps) {
  return (
    <div className="flex flex-col h-full bg-cream">
      <div className="px-4 pt-4 pb-3 flex-shrink-0 border-b border-warm-border/50">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-mid text-sm select-none">🔍</span>
          <input
            type="text"
            placeholder="Rechercher une action, un quartier…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-warm-border bg-white text-sm text-warm-dark placeholder:text-warm-mid/50 focus:outline-none focus:border-brick/60 shadow-sm"
          />
          {search && (
            <button onClick={() => onSearchChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-mid hover:text-warm-dark text-xs w-5 h-5 flex items-center justify-center rounded-full hover:bg-warm-border/50">✕</button>
          )}
        </div>
        <p className="text-[11px] text-warm-mid mt-2 font-medium">
          <span className="font-bold text-warm-dark">{maraudes.length}</span> action{maraudes.length !== 1 ? "s" : ""} solidaire{maraudes.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {maraudes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-warm-mid/50">
            <span className="text-5xl mb-4">🤝</span>
            <p className="text-sm font-medium">Aucune action trouvée</p>
            <p className="text-xs mt-1">Essayez d'autres filtres</p>
          </div>
        ) : (
          maraudes.map((m) => {
            const cat = getCategorie(m);
            const { color, icon, label } = CATEGORIES[cat];
            const isSelected = m.id === selectedId;
            const enCours = isEnCours(m);

            return (
              <button
                key={m.id}
                onClick={() => onSelect(m)}
                onMouseEnter={() => onHover?.(m)}
                onMouseLeave={() => onHover?.(null)}
                className={`w-full text-left bg-white rounded-2xl border overflow-hidden transition-all hover:shadow-md active:scale-[0.99] ${
                  isSelected
                    ? "border-brick/40 shadow-md ring-2 ring-brick/15"
                    : "border-warm-border/70 shadow-sm hover:border-warm-border"
                }`}
              >
                <div className="flex items-stretch">
                  <div
                    className="w-14 flex-shrink-0 flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${color}14` }}
                  >
                    {icon}
                  </div>

                  <div className="flex-1 px-3 py-2.5 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-warm-dark leading-snug flex-1 line-clamp-2">{m.nom}</p>
                      {enCours && (
                        <span className="flex-shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-500/10 text-green-700 text-[9px] font-bold rounded-full border border-green-200 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          En cours
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-md"
                        style={{ backgroundColor: `${color}18`, color }}
                      >
                        {label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {m.adresse && (
                        <span className="text-[11px] text-warm-mid flex items-center gap-0.5 truncate max-w-[160px]">
                          <span className="select-none">📍</span> {m.adresse.split(",")[0]}
                        </span>
                      )}
                      {m.horaire && m.horaire !== "Voir description" && m.horaire !== "À confirmer" && (
                        <span className="text-[11px] text-warm-mid flex items-center gap-0.5">
                          <span className="select-none">🕐</span> {m.horaire.split(" (")[0].trim()}
                        </span>
                      )}
                    </div>

                    {m.jours.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {m.jours.map((j) => (
                          <span key={j} className="px-1.5 py-0.5 bg-olive-light text-olive text-[9px] font-bold rounded-md">
                            {j.slice(0, 3)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center pr-2.5">
                    <span className="text-warm-border text-lg">›</span>
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
