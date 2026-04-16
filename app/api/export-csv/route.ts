/**
 * GET /api/export-csv
 * Exporte les données statiques en CSV prêt à importer dans Google Sheets.
 * À utiliser une seule fois pour initialiser le sheet, puis supprimer cette route.
 */

import { maraudes } from "@/data/maraudes";
import { Maraude } from "@/types/maraude";

const HEADERS = [
  "nom",
  "association",
  "adresse",
  "lat",
  "lng",
  "jours",
  "horaire",
  "horaire_debut",
  "horaire_fin",
  "periode_mois_debut",
  "periode_mois_fin",
  "contact",
  "secteur",
  "types_aide",
  "pmr",
  "langues",
  "description",
  "site_web",
  "benevole_url",
];

function esc(v: string | undefined | null): string {
  if (v == null || v === "") return "";
  // If the value contains comma, newline or double-quote, wrap in quotes
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function row(m: Maraude): string {
  return [
    esc(m.nom),
    esc(m.association),
    esc(m.adresse),
    m.lat,
    m.lng,
    esc(m.jours.join(",")),
    esc(m.horaire),
    esc(m.horaire_debut),
    esc(m.horaire_fin),
    m.periode?.mois_debut ?? "",
    m.periode?.mois_fin ?? "",
    esc(m.contact),
    esc(m.secteur),
    esc(m.types_aide?.join(",") ?? ""),
    m.pmr ? "VRAI" : "",
    esc(m.langues?.join(",") ?? ""),
    esc(m.description),
    esc(m.site_web),
    esc(m.benevole_url),
  ].join(",");
}

export async function GET() {
  const lines = [HEADERS.join(","), ...maraudes.map(row)].join("\n");

  return new Response(lines, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="maraudes.csv"',
    },
  });
}
