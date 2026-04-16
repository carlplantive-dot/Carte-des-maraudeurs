import { Maraude } from "@/types/maraude";

export type MomentJournee = "Jour" | "Soir" | "Nuit";

const DOW_TO_JOUR: Record<number, string> = {
  0: "Dimanche",
  1: "Lundi",
  2: "Mardi",
  3: "Mercredi",
  4: "Jeudi",
  5: "Vendredi",
  6: "Samedi",
};

/** Retourne null si l'heure de début est inconnue (maraude incluse dans tous les filtres). */
export function getMomentJournee(maraude: Maraude): MomentJournee | null {
  if (!maraude.horaire_debut) return null;
  const h = parseInt(maraude.horaire_debut.split(":")[0], 10);
  if (h >= 6 && h < 18) return "Jour";
  if (h >= 18 && h < 21) return "Soir";
  return "Nuit"; // 21h–06h
}

export function isEnSaison(maraude: Maraude, mois: number): boolean {
  if (!maraude.periode) return true;
  const { mois_debut, mois_fin } = maraude.periode;
  if (mois_fin >= mois_debut) {
    return mois >= mois_debut && mois <= mois_fin;
  }
  // Chevauchement d'année (ex. nov–mars : mois_debut=11, mois_fin=3)
  return mois >= mois_debut || mois <= mois_fin;
}

export function isEnCours(maraude: Maraude): boolean {
  if (!maraude.horaire_debut) return false;

  const now = new Date();
  const todayDow = now.getDay();
  const yesterdayDow = (todayDow + 6) % 7;

  const todayNom = DOW_TO_JOUR[todayDow];
  const yesterdayNom = DOW_TO_JOUR[yesterdayDow];

  const [hD, mD] = maraude.horaire_debut.split(":").map(Number);
  const debutMins = hD * 60 + mD;

  const nowMins = now.getHours() * 60 + now.getMinutes();

  if (!maraude.horaire_fin) {
    // Pas d'heure de fin : "en cours" si c'est aujourd'hui et après le début
    return maraude.jours.includes(todayNom as never) && nowMins >= debutMins;
  }

  const [hF, mF] = maraude.horaire_fin.split(":").map(Number);
  const finMins = hF * 60 + mF;

  if (finMins > debutMins) {
    // Plage dans la même journée
    return maraude.jours.includes(todayNom as never) && nowMins >= debutMins && nowMins <= finMins;
  }

  // Passage minuit : la partie soir appartient au jour J, la partie matin au jour J+1
  const soirEnCours = maraude.jours.includes(todayNom as never) && nowMins >= debutMins;
  const matinEnCours = maraude.jours.includes(yesterdayNom as never) && nowMins <= finMins;
  return soirEnCours || matinEnCours;
}
