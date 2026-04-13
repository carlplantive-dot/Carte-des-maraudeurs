export type Jour =
  | "Lundi"
  | "Mardi"
  | "Mercredi"
  | "Jeudi"
  | "Vendredi"
  | "Samedi"
  | "Dimanche";

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
}
