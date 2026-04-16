/**
 * Couche d'abstraction pour les données de maraudes.
 *
 * Source prioritaire : Google Sheets (si GOOGLE_SHEET_ID est défini)
 * Fallback automatique : données statiques (data/maraudes.ts)
 *
 * ── Configuration ────────────────────────────────────────────────────────────
 * Dans .env.local (ou variables Vercel) :
 *   GOOGLE_SHEET_ID=<id_du_sheet>          ← obligatoire
 *   GOOGLE_SHEET_GID=<gid_onglet>          ← optionnel, défaut: 0 (1er onglet)
 *
 * L'ID se trouve dans l'URL du sheet :
 *   https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit
 *
 * ── Format du Google Sheet ───────────────────────────────────────────────────
 * Ligne 1 = en-têtes (noms exacts, casse indifférente).
 * Colonnes supportées :
 *
 *   OBLIGATOIRES
 *   nom            Nom de la maraude
 *   association    Nom de l'association (doit correspondre à lib/associations.ts)
 *   adresse        Adresse ou lieu de rendez-vous
 *   lat            Latitude décimale  (ex: 48.8566)
 *   lng            Longitude décimale (ex: 2.3522)
 *   jours          Jours séparés par des virgules (ex: "Lundi,Mercredi")
 *   horaire        Texte libre (ex: "20h00 – 23h00")
 *   contact        Téléphone / email / site
 *
 *   OPTIONNELLES
 *   horaire_debut  Heure de début HH:MM 24h (ex: 20:00)
 *   horaire_fin    Heure de fin   HH:MM 24h (ex: 23:00)
 *   periode_mois_debut   Mois de début saison 1-12 (ex: 11 pour novembre)
 *   periode_mois_fin     Mois de fin   saison 1-12 (ex: 3 pour mars)
 *   secteur        Zone géographique couverte
 *   types_aide     Séparés par virgule : Repas,Vêtements,Écoute,Accompagnement,Soins,Hébergement
 *   pmr            Accessibilité PMR : VRAI / FAUX (ou 1 / 0)
 *   langues        Séparés par virgule : Français,Anglais,Arabe…
 *   description    Description longue (peut contenir des virgules si le champ est entre guillemets)
 *   site_web       URL complète
 *   benevole_url   URL page bénévolat
 *
 * ── Partage du sheet ─────────────────────────────────────────────────────────
 * Fichier > Partager > Accès général > "Tout le monde avec le lien" > Lecteur
 */

import { Maraude, Jour, TypeAide } from "@/types/maraude";
import { maraudes as staticMaraudes } from "@/data/maraudes";

const SHEET_ID =
  process.env.GOOGLE_SHEET_ID ?? process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID;
const SHEET_GID = process.env.GOOGLE_SHEET_GID ?? "0";

function sheetCsvUrl(id: string) {
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${SHEET_GID}`;
}

// ── Parseur CSV RFC-4180 ──────────────────────────────────────────────────────
// Gère les guillemets, les virgules dans les champs, les sauts de ligne internes.
function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let q = false; // inside quoted field

  for (let i = 0; i < csv.length; i++) {
    const ch = csv[i];
    if (ch === '"') {
      if (q && csv[i + 1] === '"') { cell += '"'; i++; } // escaped quote
      else q = !q;
    } else if (ch === "," && !q) {
      row.push(cell); cell = "";
    } else if ((ch === "\n" || ch === "\r") && !q) {
      if (ch === "\r" && csv[i + 1] === "\n") i++; // CRLF
      row.push(cell); cell = "";
      if (row.some(Boolean)) rows.push(row);
      row = [];
    } else {
      cell += ch;
    }
  }
  row.push(cell);
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

// ── Conversion d'une valeur booléenne venant du sheet ────────────────────────
function parseBool(v: string): boolean {
  return ["1", "true", "vrai", "TRUE", "VRAI"].includes(v.trim());
}

// ── Conversion des lignes en objets Maraude ───────────────────────────────────
function sheetToMaraudes(csv: string): Maraude[] {
  const rows = parseCsv(csv);
  if (rows.length < 2) return [];

  // Mapping en-tête → index de colonne (insensible à la casse)
  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const idx = (name: string) => headers.indexOf(name.toLowerCase());
  const get = (row: string[], name: string) => (row[idx(name)] ?? "").trim();

  return rows.slice(1).flatMap((row, i) => {
    const nom = get(row, "nom");
    const lat = parseFloat(get(row, "lat"));
    const lng = parseFloat(get(row, "lng"));
    if (!nom || isNaN(lat) || isNaN(lng)) return []; // ligne invalide

    const jours = get(row, "jours")
      .split(",").map((j) => j.trim() as Jour).filter(Boolean);

    const mdStr = get(row, "periode_mois_debut");
    const mfStr = get(row, "periode_mois_fin");
    const md = parseInt(mdStr), mf = parseInt(mfStr);
    const periode = (!isNaN(md) && !isNaN(mf)) ? { mois_debut: md, mois_fin: mf } : undefined;

    const typesRaw = get(row, "types_aide");
    const types_aide = typesRaw
      ? typesRaw.split(",").map((t) => t.trim() as TypeAide).filter(Boolean)
      : undefined;

    const languesRaw = get(row, "langues");
    const langues = languesRaw
      ? languesRaw.split(",").map((l) => l.trim()).filter(Boolean)
      : undefined;

    const pmrRaw = get(row, "pmr");
    const pmr = pmrRaw ? parseBool(pmrRaw) : undefined;

    const opt = (name: string) => get(row, name) || undefined;

    const m: Maraude = {
      id: i + 1,
      nom,
      association: get(row, "association"),
      adresse: get(row, "adresse"),
      lat,
      lng,
      jours,
      horaire: get(row, "horaire"),
      contact: get(row, "contact"),
      horaire_debut: opt("horaire_debut"),
      horaire_fin: opt("horaire_fin"),
      periode,
      secteur: opt("secteur"),
      types_aide: types_aide?.length ? types_aide : undefined,
      pmr: pmr ?? undefined,
      langues: langues?.length ? langues : undefined,
      description: opt("description"),
      site_web: opt("site_web"),
      benevole_url: opt("benevole_url"),
    };
    return [m];
  });
}

// ── Point d'entrée ────────────────────────────────────────────────────────────
export async function fetchMaraudes(): Promise<{
  maraudes: Maraude[];
  source: "sheets" | "static";
}> {
  if (SHEET_ID) {
    try {
      const res = await fetch(sheetCsvUrl(SHEET_ID), {
        next: { revalidate: 3600 },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const csv = await res.text();
      const maraudes = sheetToMaraudes(csv);
      if (maraudes.length > 0) return { maraudes, source: "sheets" };
      console.warn("[fetchMaraudes] Sheet vide ou mal formaté — fallback statique.");
    } catch (err) {
      console.warn("[fetchMaraudes] Échec Google Sheets — fallback statique.", err);
    }
  }
  return { maraudes: staticMaraudes, source: "static" };
}
