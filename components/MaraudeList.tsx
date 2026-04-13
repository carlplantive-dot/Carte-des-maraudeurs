"use client";

import { Maraude } from "@/types/maraude";
import { ASSOCIATION_COLORS } from "@/lib/associations";

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
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-gold/30 flex-shrink-0">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-hogwarts-light text-sm">
            🔍
          </span>
          <input
            type="text"
            placeholder="Rechercher une maraude, une adresse…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-hogwarts-light/40 bg-parchment text-sm text-hogwarts-dark placeholder:text-hogwarts-light/60 focus:outline-none focus:border-gold"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-hogwarts-light hover:text-hogwarts-dark text-xs"
            >
              ✕
            </button>
          )}
        </div>
        <p className="text-[10px] text-hogwarts-light mt-1.5 text-right">
          {maraudes.length} résultat{maraudes.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gold/20">
        {maraudes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-hogwarts-light/60">
            <span className="text-3xl mb-2">🗺️</span>
            <p className="text-sm italic font-serif">Aucune maraude trouvée</p>
          </div>
        ) : (
          maraudes.map((m) => {
            const color = ASSOCIATION_COLORS[m.association] ?? "#2c3e50";
            const isSelected = m.id === selectedId;
            return (
              <button
                key={m.id}
                onClick={() => onSelect(m)}
                className={`w-full text-left px-4 py-3 transition-colors hover:bg-parchment-dark ${
                  isSelected ? "bg-parchment-dark" : ""
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {/* Color dot */}
                  <span
                    className="mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 border border-white/30"
                    style={{ backgroundColor: color }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-hogwarts-dark truncate leading-snug">
                      {m.nom}
                    </p>
                    <p className="text-[11px] text-hogwarts-light truncate">
                      {m.association}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] text-hogwarts-light/80">📍 {m.adresse}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[10px] text-hogwarts-light/80">🕐 {m.horaire}</span>
                      <span className="text-[10px] text-hogwarts-light/60">
                        {m.jours.map((j) => j.slice(0, 3)).join(" · ")}
                      </span>
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
