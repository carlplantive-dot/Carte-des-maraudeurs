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
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
          allSelected
            ? "bg-brick text-white border-brick"
            : "bg-white text-warm-dark border-warm-border hover:border-brick"
        }`}
      >
        Toutes
      </button>
      {associations.map((asso) => {
        const active = selected.includes(asso);
        const color = ASSOCIATION_COLORS[asso] ?? "#C0622F";
        return (
          <button
            key={asso}
            onClick={() => toggle(asso)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              active
                ? "text-white border-transparent"
                : "bg-white text-warm-dark border-warm-border hover:border-brick"
            }`}
            style={active ? { backgroundColor: color, borderColor: color } : {}}
          >
            <span
              className="inline-block w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: active ? "rgba(255,255,255,0.7)" : color }}
            />
            {asso}
          </button>
        );
      })}
    </div>
  );
}
