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

export interface Maraude {
  id: number;
  nom: string;
  association: string;
  adresse: string;
  lat: number;
  lng: number;
  jours: Jour[];
  horaire: string;
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
