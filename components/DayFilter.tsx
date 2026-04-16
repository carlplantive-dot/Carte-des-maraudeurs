"use client";

import { Jour } from "@/types/maraude";
import { JOURS_SEMAINE } from "@/data/maraudes";

const JOURS_SHORT: Record<string, string> = {
  Lundi: "Lun",
  Mardi: "Mar",
  Mercredi: "Mer",
  Jeudi: "Jeu",
  Vendredi: "Ven",
  Samedi: "Sam",
  Dimanche: "Dim",
};

const DAYS_JS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

interface DayFilterProps {
  selected: Jour | null;
  onChange: (jour: Jour | null) => void;
}

export default function DayFilter({ selected, onChange }: DayFilterProps) {
  const todayJour = DAYS_JS[new Date().getDay()] as Jour;

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
      {/* Raccourci aujourd'hui */}
      <button
        onClick={() => onChange(selected === todayJour ? null : todayJour)}
        className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
          selected === todayJour
            ? "bg-brick text-white border-brick shadow-sm"
            : "bg-white text-warm-mid border-warm-border hover:border-brick"
        }`}
      >
        Aujourd'hui
      </button>

      <div className="w-px h-5 bg-warm-border flex-shrink-0" />

      {JOURS_SEMAINE.map((jour) => {
        const isToday = jour === todayJour;
        const isActive = selected === jour;
        return (
          <button
            key={jour}
            onClick={() => onChange(selected === jour ? null : jour)}
            className={`relative flex-shrink-0 w-9 h-9 rounded-full text-xs font-semibold border transition-all flex items-center justify-center ${
              isActive
                ? "bg-brick text-white border-brick shadow-sm"
                : "bg-white text-warm-dark border-warm-border hover:border-brick"
            }`}
          >
            {JOURS_SHORT[jour]}
            {/* Point vert sous le jour courant quand inactif */}
            {isToday && !isActive && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-olive" />
            )}
          </button>
        );
      })}
    </div>
  );
}
