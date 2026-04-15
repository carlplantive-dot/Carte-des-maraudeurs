"use client";

import { Maraude } from "@/types/maraude";
import { ASSOCIATION_COLORS } from "@/lib/associations";

interface MaraudeCardProps {
  maraude: Maraude;
  onClose: () => void;
}

const TYPE_AIDE_ICONS: Record<string, string> = {
  Repas: "🍲",
  Vêtements: "👕",
  Écoute: "👂",
  Accompagnement: "🤝",
  Soins: "🩺",
  Hébergement: "🏠",
};

export default function MaraudeCard({ maraude, onClose }: MaraudeCardProps) {
  const color = ASSOCIATION_COLORS[maraude.association] ?? "#1a1a2e";

  return (
    /* Mobile: full-width bottom sheet. Desktop: floating card */
    <div className="fixed bottom-0 sm:bottom-6 left-0 sm:left-1/2 sm:-translate-x-1/2 z-[1000] w-full sm:max-w-md sm:px-0">
      <div className="bg-parchment border-t sm:border border-gold rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-up-drawer sm:animate-slide-up">

        {/* Header */}
        <div className="px-5 py-3 flex items-start justify-between" style={{ backgroundColor: color }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
              {maraude.association}
            </p>
            <h2 className="text-white font-bold text-base leading-tight mt-0.5">
              {maraude.nom}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="text-white/70 hover:text-white text-xl leading-none ml-3 mt-0.5"
          >
            ✕
          </button>
        </div>

        {/* Body — scrollable si contenu long */}
        <div className="px-5 py-4 space-y-3 text-hogwarts-dark overflow-y-auto max-h-[55vh] sm:max-h-[60vh]">

          {/* Description */}
          {maraude.description && (
            <p className="text-xs text-hogwarts-light italic border-l-2 border-gold/50 pl-3">
              {maraude.description}
            </p>
          )}

          {/* Types d'aide */}
          {maraude.types_aide && maraude.types_aide.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {maraude.types_aide.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-hogwarts/10 border border-hogwarts/20 text-hogwarts-dark"
                >
                  <span>{TYPE_AIDE_ICONS[t] ?? "•"}</span>
                  {t}
                </span>
              ))}
              {maraude.pmr && (
                <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800">
                  ♿ PMR
                </span>
              )}
            </div>
          )}

          {/* Lieu */}
          <div className="flex items-start gap-3">
            <span className="text-gold text-lg leading-none mt-0.5">📍</span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-hogwarts-light">Lieu de RDV</p>
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
              <p className="text-xs font-semibold uppercase tracking-wider text-hogwarts-light">Jours</p>
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
              <p className="text-xs font-semibold uppercase tracking-wider text-hogwarts-light">Horaire</p>
              <p className="text-sm font-medium">{maraude.horaire}</p>
            </div>
          </div>

          {/* Langues */}
          {maraude.langues && maraude.langues.length > 0 && (
            <div className="flex items-start gap-3">
              <span className="text-gold text-lg leading-none mt-0.5">🗣️</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-hogwarts-light">Langues</p>
                <p className="text-sm">{maraude.langues.join(", ")}</p>
              </div>
            </div>
          )}

          {/* Contact */}
          <div className="flex items-start gap-3">
            <span className="text-gold text-lg leading-none mt-0.5">📞</span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-hogwarts-light">Contact</p>
              <p className="text-sm font-medium break-all">{maraude.contact}</p>
            </div>
          </div>

          {/* Liens */}
          {(maraude.site_web || maraude.benevole_url) && (
            <div className="flex gap-2 pt-1 flex-wrap">
              {maraude.site_web && (
                <a
                  href={maraude.site_web}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-hogwarts/30 text-hogwarts-dark hover:bg-parchment-dark transition-colors"
                >
                  🌐 Site web
                </a>
              )}
              {maraude.benevole_url && (
                <a
                  href={maraude.benevole_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white transition-colors"
                  style={{ backgroundColor: color }}
                >
                  🤝 Devenir bénévole
                </a>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gold/30 px-5 py-2 text-center">
          <p className="text-[10px] tracking-widest text-hogwarts-light/60 italic font-serif">
            ~ Solennellement juré de venir en aide ~
          </p>
        </div>
      </div>
    </div>
  );
}
