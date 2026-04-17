import { fetchMaraudes } from "@/lib/fetchMaraudes";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ASSOCIATION_COLORS } from "@/lib/associations";
import EnCoursBadge from "./EnCoursBadge";
import type { Metadata } from "next";

const TYPE_AIDE_ICONS: Record<string, string> = {
  Repas: "🍲",
  Vêtements: "👕",
  Écoute: "👂",
  Accompagnement: "🤝",
  Soins: "🩺",
  Hébergement: "🏠",
};

const MOIS = ["", "jan.", "fév.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

function contactHref(contact: string): string {
  const s = contact.trim();
  if (s.startsWith("http")) return s;
  if (s.includes("@")) return `mailto:${s.split(/[/ ,]/)[0].trim()}`;
  return `tel:${s.replace(/\s/g, "").split(/[/,]/)[0]}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { maraudes } = await fetchMaraudes();
  const m = maraudes.find((m) => m.id === parseInt(id, 10));
  if (!m) return {};
  return {
    title: `${m.nom} – La Carte des Maraudeurs`,
    description: m.description ?? `Maraude organisée par ${m.association} à Paris.`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { maraudes } = await fetchMaraudes();
  const maraude = maraudes.find((m) => m.id === parseInt(id, 10));
  if (!maraude) notFound();

  const color = ASSOCIATION_COLORS[maraude.association] ?? "#C0622F";
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${maraude.lat},${maraude.lng}`;
  const href = contactHref(maraude.contact);

  return (
    <div className="min-h-screen bg-warm-bg flex flex-col">

      {/* Header coloré */}
      <div className="sticky top-0 z-10 shadow-sm" style={{ backgroundColor: color }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-lg leading-none transition-colors flex-shrink-0"
            aria-label="Retour à la carte"
          >
            ←
          </Link>
          <div className="min-w-0">
            <p className="text-white/75 text-[10px] font-semibold uppercase tracking-wider truncate">
              {maraude.association}
            </p>
            <h1 className="text-white font-bold text-base leading-tight">{maraude.nom}</h1>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-5 pb-28 space-y-4">

        {/* Badges */}
        <div className="flex flex-wrap gap-2 items-center">
          <EnCoursBadge maraude={maraude} />
          {maraude.pmr && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
              ♿ Accessible PMR
            </span>
          )}
          {maraude.periode && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-100">
              🗓 {MOIS[maraude.periode.mois_debut]}–{MOIS[maraude.periode.mois_fin]} seulement
            </span>
          )}
        </div>

        {/* Description */}
        {maraude.description && (
          <div className="bg-white rounded-2xl p-4 border border-warm-border">
            <p
              className="text-sm text-warm-mid leading-relaxed italic border-l-2 pl-3"
              style={{ borderColor: color }}
            >
              {maraude.description}
            </p>
          </div>
        )}

        {/* Services */}
        {maraude.types_aide && maraude.types_aide.length > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-warm-border">
            <p className="text-[10px] font-bold uppercase tracking-wider text-warm-mid mb-3">
              Services proposés
            </p>
            <div className="flex flex-wrap gap-2">
              {maraude.types_aide.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cream text-warm-dark text-xs font-medium rounded-full border border-warm-border"
                >
                  {TYPE_AIDE_ICONS[t] ?? "•"} {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Lieu & horaires */}
        <div className="bg-white rounded-2xl border border-warm-border overflow-hidden divide-y divide-warm-border">
          <div className="p-4 flex items-start gap-3">
            <span className="text-xl mt-0.5 select-none">📍</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-warm-mid">
                Lieu de rendez-vous
              </p>
              <p className="text-sm font-semibold text-warm-dark mt-0.5">{maraude.adresse}</p>
              {maraude.secteur && (
                <p className="text-xs text-warm-mid mt-0.5">{maraude.secteur}</p>
              )}
            </div>
          </div>

          <div className="p-4 flex items-start gap-3">
            <span className="text-xl mt-0.5 select-none">📅</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-warm-mid">Jours</p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {maraude.jours.map((j) => (
                  <span
                    key={j}
                    className="px-2.5 py-1 bg-olive-light text-olive text-xs font-semibold rounded-full"
                  >
                    {j}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 flex items-start gap-3">
            <span className="text-xl mt-0.5 select-none">🕐</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-warm-mid">Horaire</p>
              <p className="text-sm font-semibold text-warm-dark mt-0.5">{maraude.horaire}</p>
            </div>
          </div>

          {maraude.langues && maraude.langues.length > 0 && (
            <div className="p-4 flex items-start gap-3">
              <span className="text-xl mt-0.5 select-none">🗣️</span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-warm-mid">
                  Langues parlées
                </p>
                <p className="text-sm text-warm-dark mt-0.5">{maraude.langues.join(", ")}</p>
              </div>
            </div>
          )}

          <div className="p-4 flex items-start gap-3">
            <span className="text-xl mt-0.5 select-none">📞</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-warm-mid">Contact</p>
              <p className="text-sm font-semibold text-warm-dark mt-0.5 break-all">
                {maraude.contact}
              </p>
            </div>
          </div>
        </div>

        {/* Lien itinéraire */}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-warm-border hover:border-brick transition-colors group"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
            style={{ backgroundColor: `${color}22` }}
          >
            🗺️
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-warm-dark">Obtenir l'itinéraire</p>
            <p className="text-xs text-warm-mid truncate">{maraude.adresse}</p>
          </div>
          <span className="text-warm-mid group-hover:text-brick transition-colors text-lg">→</span>
        </a>

        {/* Liens site web / bénévolat si existant */}
        {(maraude.site_web || maraude.benevole_url) && (
          <div className="flex gap-3 flex-wrap">
            {maraude.site_web && (
              <a
                href={maraude.site_web}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl text-xs font-semibold border border-warm-border text-warm-dark bg-white hover:border-brick transition-colors"
              >
                🌐 Site web
              </a>
            )}
            {maraude.benevole_url && (
              <a
                href={maraude.benevole_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl text-xs font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: color }}
              >
                🤝 Devenir bénévole
              </a>
            )}
          </div>
        )}
      </div>

      {/* Barre CTA fixe en bas */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-warm-border safe-bottom">
        <div className="max-w-2xl mx-auto px-4 py-3 flex gap-3">
          <a
            href={href}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 text-sm font-bold transition-colors active:opacity-80"
            style={{ borderColor: color, color }}
          >
            📞 Contacter
          </a>
          {maraude.benevole_url ? (
            <a
              href={maraude.benevole_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-white text-sm font-bold hover:opacity-90 transition-opacity active:opacity-80"
              style={{ backgroundColor: color }}
            >
              🤝 Bénévole
            </a>
          ) : maraude.site_web ? (
            <a
              href={maraude.site_web}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-white text-sm font-bold hover:opacity-90 transition-opacity active:opacity-80"
              style={{ backgroundColor: color }}
            >
              🌐 Site web
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
