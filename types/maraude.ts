export type Jour =
  | "Lundi"
  | "Mardi"
  | "Mercredi"
  | "Jeudi"
  | "Vendredi"
  | "Samedi"
  | "Dimanche";

export type TypeAide =
  | "Repas"
  | "Vêtements"
  | "Écoute"
  | "Accompagnement"
  | "Soins"
  | "Hébergement";

export interface Periode {
  /** Mois de début (1 = janvier, 12 = décembre) */
  mois_debut: number;
  /** Mois de fin.  Si mois_fin < mois_debut, la période chevauche l'année
   *  (ex. nov.–mars : mois_debut=11, mois_fin=3). */
  mois_fin: number;
}

export interface Maraude {
  id: number;
  nom: string;
  association: string;
  adresse: string;
  lat: number;
  lng: number;
  jours: Jour[];
  horaire: string;
  /** Heure de début au format "HH:MM" (24h) — optionnelle */
  horaire_debut?: string;
  /** Heure de fin au format "HH:MM" (24h) — optionnelle.
   *  Peut être ≤ horaire_debut si la maraude passe minuit (ex. "00:00", "06:00"). */
  horaire_fin?: string;
  /** Si absent → toute l'année. Présent → maraude saisonnière. */
  periode?: Periode;
  contact: string;
  secteur?: string;
  // Champs enrichis
  site_web?: string;
  benevole_url?: string;
  types_aide?: TypeAide[];
  pmr?: boolean;       // Accessible PMR
  langues?: string[];  // Langues parlées
  description?: string;
}
