/**
 * Couche d'abstraction pour les données de maraudes.
 *
 * Priorité de chargement :
 *   1. Google Sheets (si NEXT_PUBLIC_GOOGLE_SHEET_ID est défini)
 *   2. Données statiques (fallback)
 *
 * Format Google Sheets attendu (colonnes dans l'ordre) :
 *   id | nom | association | adresse | lat | lng | jours (virgule) | horaire | contact | secteur
 *
 * Pour l'activer :
 *   1. Créer un Google Sheet avec les colonnes ci-dessus
 *   2. Fichier > Partager > "Tout le monde avec le lien" (lecture)
 *   3. Copier l'ID du sheet (dans l'URL : /spreadsheets/d/<ID>/edit)
 *   4. Ajouter dans .env.local : NEXT_PUBLIC_GOOGLE_SHEET_ID=<ID>
 */

import { Maraude, Jour } from "@/types/maraude";
import { maraudes as staticMaraudes } from "@/data/maraudes";

const SHEET_ID = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID;

// Google Sheets CSV export URL (public sheets only)
function sheetCsvUrl(sheetId: string): string {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;
}

function parseRow(cols: string[], id: number): Maraude | null {
  try {
    const [, nom, association, adresse, lat, lng, joursRaw, horaire, contact, secteur] =
      cols.map((c) => c.trim().replace(/^"|"$/g, ""));

    const latN = parseFloat(lat);
    const lngN = parseFloat(lng);
    if (!nom || isNaN(latN) || isNaN(lngN)) return null;

    const jours = joursRaw
      .split(",")
      .map((j) => j.trim() as Jour)
      .filter(Boolean);

    return { id, nom, association, adresse, lat: latN, lng: lngN, jours, horaire, contact, secteur };
  } catch {
    return null;
  }
}

function parseCsv(csv: string): Maraude[] {
  const lines = csv.split("\n").slice(1); // skip header row
  return lines
    .map((line, i) => {
      // Basic CSV split (handles simple quoted fields)
      const cols = line.match(/(".*?"|[^,]+)(?=,|$)/g) ?? [];
      return parseRow(cols, i + 1);
    })
    .filter((m): m is Maraude => m !== null);
}

export async function fetchMaraudes(): Promise<{ maraudes: Maraude[]; source: "sheets" | "static" }> {
  if (SHEET_ID) {
    try {
      const res = await fetch(sheetCsvUrl(SHEET_ID), { next: { revalidate: 3600 } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const csv = await res.text();
      const maraudes = parseCsv(csv);
      if (maraudes.length > 0) return { maraudes, source: "sheets" };
    } catch (err) {
      console.warn("[fetchMaraudes] Google Sheets fetch failed, using static data.", err);
    }
  }
  return { maraudes: staticMaraudes, source: "static" };
}
