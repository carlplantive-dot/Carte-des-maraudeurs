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
  compact?: boolean;
}

export default function DayFilter({ selected, onChange, compact = false }: DayFilterProps) {
  const todayJour = DAYS_JS[new Date().getDay()] as Jour;

  if (compact) {
    return (
      <>
        <button
          onClick={() => onChange(selected === todayJour ? null : todayJour)}
          className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
            selected === todayJour
              ? "bg-brick text-white border-brick"
              : "bg-white text-warm-mid border-warm-border hover:border-brick"
          }`}
        >
          Auj.
        </button>
        {JOURS_SEMAINE.map((jour) => (
          <button
            key={jour}
            onClick={() => onChange(selected === jour ? null : jour)}
            className={`flex-shrink-0 w-8 h-7 rounded-full text-[10px] font-semibold border transition-all flex items-center justify-center ${
              selected === jour
                ? "bg-brick text-white border-brick"
                : "bg-white text-warm-mid border-warm-border hover:border-brick"
            }`}
          >
            {JOURS_SHORT[jour].slice(0, 2)}
          </button>
        ))}
      </>
    );
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
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
            {isToday && !isActive && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-olive" />
            )}
          </button>
        );
      })}
    </div>
  );
}
