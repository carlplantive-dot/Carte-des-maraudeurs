"use client";

import { Maraude } from "@/types/maraude";

interface MaraudeCardProps {
  maraude: Maraude;
  onClose: () => void;
}

const ASSOCIATION_COLORS: Record<string, string> = {
  "Emmaüs Solidarité": "bg-[#8B2019]",
  "La Chorba": "bg-[#1a5276]",
  Aurore: "bg-[#1d6a3a]",
  "Samu Social de Paris": "bg-[#5d4037]",
  "Les Enfants du Canal": "bg-[#6a3d9a]",
};

export default function MaraudeCard({ maraude, onClose }: MaraudeCardProps) {
  const accentColor =
    ASSOCIATION_COLORS[maraude.association] ?? "bg-hogwarts";

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-md px-4 sm:px-0">
      <div className="bg-parchment border border-gold rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header band */}
        <div className={`${accentColor} px-5 py-3 flex items-start justify-between`}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-parchment/70">
              {maraude.association}
            </p>
            <h2 className="text-parchment font-bold text-base leading-tight mt-0.5">
              {maraude.nom}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="text-parchment/70 hover:text-parchment text-xl leading-none ml-3 mt-0.5"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3 text-hogwarts-dark">
          {/* Lieu */}
          <div className="flex items-start gap-3">
            <span className="text-gold text-lg leading-none mt-0.5">📍</span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-hogwarts-light">
                Lieu de RDV
              </p>
              <p className="text-sm font-medium">{maraude.adresse}</p>
              {maraude.secteur && (
                <p className="text-xs text-hogwarts-light">{maraude.secteur}</p>
              )}
            </div>
          </div>

          {/* Jours */}
          <div className="flex items-start gap-3">
            <span className="text-gold text-lg leading-none mt-0.5">📅</span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-hogwarts-light">
                Jours
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {maraude.jours.map((j) => (
                  <span
                    key={j}
                    className="bg-hogwarts/10 text-hogwarts-dark border border-hogwarts/20 px-2 py-0.5 rounded-full text-xs font-medium"
                  >
                    {j}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Horaire */}
          <div className="flex items-start gap-3">
            <span className="text-gold text-lg leading-none mt-0.5">🕐</span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-hogwarts-light">
                Horaire
              </p>
              <p className="text-sm font-medium">{maraude.horaire}</p>
            </div>
          </div>

          {/* Contact */}
          <div className="flex items-start gap-3">
            <span className="text-gold text-lg leading-none mt-0.5">📞</span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-hogwarts-light">
                Contact
              </p>
              <p className="text-sm font-medium break-all">{maraude.contact}</p>
            </div>
          </div>
        </div>

        {/* Parchment footer flourish */}
        <div className="border-t border-gold/30 px-5 py-2 text-center">
          <p className="text-[10px] tracking-widest text-hogwarts-light/60 italic font-serif">
            ~ Solennellement juré de venir en aide ~
          </p>
        </div>
      </div>
    </div>
  );
}
