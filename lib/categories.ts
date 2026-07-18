import { Maraude } from "@/types/maraude";

export type Categorie =
  | "Maraude"
  | "Repas"
  | "Vêtements"
  | "Accueil"
  | "Accompagnement"
  | "Soins"
  | "Hébergement";

export interface CategorieInfo {
  icon: string;
  color: string;
  bg: string;
  label: string;
}

export const CATEGORIES: Record<Categorie, CategorieInfo> = {
  Maraude:         { icon: "🚶", color: "#C0622F", bg: "#FDF0E8", label: "Maraude de rue" },
  Repas:           { icon: "🍲", color: "#C47A2B", bg: "#FDF5E6", label: "Repas & alimentation" },
  Vêtements:       { icon: "👕", color: "#4A7A5A", bg: "#EBF5EE", label: "Vêtements & hygiène" },
  Accueil:         { icon: "🤝", color: "#6B4DA0", bg: "#F2EEF9", label: "Accueil & écoute" },
  Accompagnement:  { icon: "💼", color: "#2E6DA4", bg: "#EBF3FB", label: "Accompagnement social" },
  Soins:           { icon: "🩺", color: "#2A8A7A", bg: "#E8F6F4", label: "Soins médicaux" },
  Hébergement:     { icon: "🏠", color: "#7B5E3A", bg: "#F5EFE6", label: "Hébergement" },
};

export const ALL_CATEGORIES = Object.keys(CATEGORIES) as Categorie[];

const MARAUDE_KEYWORDS = ["maraude", "tournée", "rue", "sans-abri", "sdf", "nuit"];
const REPAS_KEYWORDS   = ["repas", "soupe", "déjeuner", "dîner", "nourriture", "pain", "colis", "café", "petit déjeuner", "alimentation", "soupe"];
const VETEMENTS_KEYWORDS = ["vêtement", "habit", "textile", "vestiaire", "bagagerie", "hygiène", "habillement"];
const SOINS_KEYWORDS = ["soin", "médic", "santé", "infirmier", "sanitaire", "paramédic"];
const HEBERGEMENT_KEYWORDS = ["héberg", "logement", "abri", "dormir", "nuit", "refuge"];
const ACCOMPAGNEMENT_KEYWORDS = ["emploi", "insertion", "administratif", "droit", "formation", "visemploi", "orientation"];

export function getCategorie(maraude: Maraude): Categorie {
  const types = maraude.types_aide ?? [];
  const text = `${maraude.nom} ${maraude.description ?? ""}`.toLowerCase();

  if (types.includes("Hébergement") || HEBERGEMENT_KEYWORDS.some(k => text.includes(k))) return "Hébergement";
  if (types.includes("Soins") || SOINS_KEYWORDS.some(k => text.includes(k))) return "Soins";
  if (MARAUDE_KEYWORDS.some(k => text.includes(k))) return "Maraude";
  if (types.includes("Repas") || REPAS_KEYWORDS.some(k => text.includes(k))) return "Repas";
  if (types.includes("Vêtements") || VETEMENTS_KEYWORDS.some(k => text.includes(k))) return "Vêtements";
  if (ACCOMPAGNEMENT_KEYWORDS.some(k => text.includes(k))) return "Accompagnement";
  if (types.includes("Écoute") || types.includes("Accompagnement")) return "Accueil";
  return "Accueil";
}
