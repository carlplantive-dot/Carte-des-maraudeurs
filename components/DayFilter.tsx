"use client";

import { Jour } from "@/types/maraude";
import { JOURS_SEMAINE } from "@/data/maraudes";

interface DayFilterProps {
  selected: Jour | null;
  onChange: (jour: Jour | null) => void;
}

export default function DayFilter({ selected, onChange }: DayFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <button
        onClick={() => onChange(null)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
          selected === null
            ? "bg-parchment-dark text-hogwarts-dark border-gold shadow-inner"
            : "bg-parchment text-hogwarts-dark border-hogwarts-light hover:border-gold hover:bg-parchment-dark"
        }`}
      >
        Tous les jours
      </button>

      {JOURS_SEMAINE.map((jour) => (
        <button
          key={jour}
          onClick={() => onChange(selected === jour ? null : jour)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
            selected === jour
              ? "bg-hogwarts text-parchment border-gold shadow-inner"
              : "bg-parchment text-hogwarts-dark border-hogwarts-light hover:border-gold hover:bg-parchment-dark"
          }`}
        >
          {jour.slice(0, 3)}
        </button>
      ))}
    </div>
  );
}
