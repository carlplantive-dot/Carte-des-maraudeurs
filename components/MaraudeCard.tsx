"use client";

import Link from "next/link";
import { Maraude } from "@/types/maraude";
import { ASSOCIATION_COLORS } from "@/lib/associations";
import { isEnCours } from "@/lib/time";

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
  const color = ASSOCIATION_COLORS[maraude.association] ?? "#C0622F";
  const enCours = isEnCours(maraude);

  return (
    <div className="fixed bottom-0 sm:bottom-6 left-0 sm:left-1/2 sm:-translate-x-1/2 z-[1000] w-full sm:max-w-md">
      <div className="bg-white border border-warm-border rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up-drawer sm:animate-slide-up">

        {/* Poignée mobile */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 rounded-full bg-warm-border" />
        </div>

        {/* Bandeau coloré */}
        <div className="px-5 py-4 flex items-start justify-between" style={{ backgroundColor: color }}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-block px-2 py-0.5 bg-white/25 text-white text-[10px] font-semibold rounded-full">
                {maraude.association}
              </span>
              {enCours && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/90 text-white text-[10px] font-bold rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
                  En cours
                </span>
              )}
            </div>
            <h2 className="text-white font-bold text-base leading-snug">{maraude.nom}</h2>
          </div>
          <button
            onClick={onClose}
            className="ml-3 flex-shrink-0 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Corps */}
        <div className="px-5 py-4 space-y-3.5 overflow-y-auto max-h-[55vh] sm:max-h-[60vh]">

          {maraude.description && (
            <p className="text-xs text-warm-mid italic leading-relaxed border-l-2 pl-3" style={{ borderColor: color }}>
              {maraude.description}
            </p>
          )}

          {/* Types d'aide */}
          {maraude.types_aide && maraude.types_aide.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {maraude.types_aide.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-cream text-warm-dark text-xs font-medium rounded-full border border-warm-border"
                >
                  {TYPE_AIDE_ICONS[t] ?? "•"} {t}
                </span>
              ))}
              {maraude.pmr && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                  ♿ PMR
                </span>
              )}
            </div>
          )}

          {/* Infos */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-brick text-lg mt-0.5 select-none">📍</span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-warm-mid">Lieu de RDV</p>
                <p className="text-sm font-semibold text-warm-dark">{maraude.adresse}</p>
                {maraude.secteur && <p className="text-xs text-warm-mid mt-0.5">{maraude.secteur}</p>}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-brick text-lg mt-0.5 select-none">📅</span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-warm-mid">Jours</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {maraude.jours.map((j) => (
                    <span
                      key={j}
                      className="px-2 py-0.5 bg-olive-light text-olive text-xs font-semibold rounded-full"
                    >
                      {j}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-brick text-lg mt-0.5 select-none">🕐</span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-warm-mid">Horaire</p>
                <p className="text-sm font-semibold text-warm-dark">{maraude.horaire}</p>
              </div>
            </div>

            {maraude.langues && maraude.langues.length > 0 && (
              <div className="flex items-start gap-3">
                <span className="text-brick text-lg mt-0.5 select-none">🗣️</span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-warm-mid">Langues</p>
                  <p className="text-sm text-warm-dark">{maraude.langues.join(", ")}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <span className="text-brick text-lg mt-0.5 select-none">📞</span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-warm-mid">Contact</p>
                <p className="text-sm font-semibold text-warm-dark break-all">{maraude.contact}</p>
              </div>
            </div>
          </div>

          {/* Liens */}
          {(maraude.site_web || maraude.benevole_url) && (
            <div className="flex gap-2 flex-wrap pt-1">
              {maraude.site_web && (
                <a
                  href={maraude.site_web}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border border-warm-border text-warm-dark bg-cream hover:border-brick transition-colors"
                >
                  🌐 Site web
                </a>
              )}
              {maraude.benevole_url && (
                <a
                  href={maraude.benevole_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: color }}
                >
                  🤝 Devenir bénévole
                </a>
              )}
            </div>
          )}

          {/* Lien fiche détaillée */}
          <Link
            href={`/maraude/${maraude.id}`}
            className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-2xl text-xs font-semibold border border-warm-border text-warm-mid hover:border-brick hover:text-brick transition-colors"
          >
            Voir la fiche complète →
          </Link>
        </div>
      </div>
    </div>
  );
}
