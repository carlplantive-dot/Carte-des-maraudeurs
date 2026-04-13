"use client";

import { ASSOCIATION_COLORS } from "@/lib/associations";

interface AssociationFilterProps {
  associations: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function AssociationFilter({
  associations,
  selected,
  onChange,
}: AssociationFilterProps) {
  const toggle = (asso: string) => {
    if (selected.includes(asso)) {
      onChange(selected.filter((a) => a !== asso));
    } else {
      onChange([...selected, asso]);
    }
  };

  const allSelected = selected.length === 0;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange([])}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
          allSelected
            ? "bg-hogwarts text-parchment border-gold"
            : "bg-parchment text-hogwarts-dark border-hogwarts-light hover:border-gold"
        }`}
      >
        Toutes
      </button>
      {associations.map((asso) => {
        const active = selected.includes(asso);
        const color = ASSOCIATION_COLORS[asso] ?? "#2c3e50";
        return (
          <button
            key={asso}
            onClick={() => toggle(asso)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              active
                ? "text-parchment border-transparent"
                : "bg-parchment text-hogwarts-dark border-hogwarts-light hover:border-gold"
            }`}
            style={active ? { backgroundColor: color, borderColor: color } : {}}
          >
            <span
              className="inline-block w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: active ? "white" : color, opacity: active ? 0.8 : 1 }}
            />
            {asso}
          </button>
        );
      })}
    </div>
  );
}
