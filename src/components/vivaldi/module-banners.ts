/** Visuels de bannière associés à chaque module du parcours. */

import campusParis from "@/assets/site/campus-paris.jpg";
import amphi from "@/assets/site/amphi.jpg";
import amphiBoutmy from "@/assets/site/amphi-boutmy.jpg";
import tableEntretien from "@/assets/site/table-entretien.jpg";
import heroOral from "@/assets/site/hero-oral.jpg";
import presse from "@/assets/site/presse-actu.jpg";
import supports from "@/assets/site/supports-dossier.jpg";
import identite from "@/assets/site/identite-fiche.jpg";
import projetPro from "@/assets/site/projet-pro.jpg";
import experiences from "@/assets/site/experiences-vie.jpg";

export const MODULE_BANNERS: Record<string, string> = {
  "Informations personnelles": identite,
  "Module 1": projetPro,
  "Module 2": campusParis,
  "Module 3": experiences,
  "Module 4": presse,
  "Module 5": supports,
  "Module 6": amphiBoutmy,
  "Module 7": tableEntretien,
  Tableau: heroOral,
  Amphi: amphi,
};

export function moduleBanner(step?: string): string | undefined {
  if (!step) return undefined;
  const key = Object.keys(MODULE_BANNERS).find((k) => step.startsWith(k));
  return key ? MODULE_BANNERS[key] : undefined;
}
