/** Photos de campus utilisées dès qu'une école est mise en avant. */
import hec from "@/assets/site/hec-jouy.jpg.asset.json";
import essec from "@/assets/site/essec-cergy.jpg.asset.json";
import edhec from "@/assets/site/edhec-lille.jpg.asset.json";
import escp from "@/assets/site/campus-escp.jpg.asset.json";
import emlyon from "@/assets/site/campus-emlyon.jpg.asset.json";
import skema from "@/assets/site/campus-skema.jpg.asset.json";
import neoma from "@/assets/site/campus-neoma.jpg.asset.json";
import gem from "@/assets/site/campus-gem.jpg.asset.json";
import kedge from "@/assets/site/campus-kedge.jpg.asset.json";
import tbs from "@/assets/site/campus-tbs.jpg.asset.json";
import icn from "@/assets/site/campus-icn.jpg.asset.json";
import bsb from "@/assets/site/campus-bsb.jpg.asset.json";
import clermont from "@/assets/site/campus-clermont.jpg.asset.json";
import inseec from "@/assets/site/campus-inseec.jpg.asset.json";
import scbs from "@/assets/site/campus-scbs.jpg.asset.json";
import campusHaussmann from "@/assets/site/campus-haussmann.jpg";
import campusModerne from "@/assets/site/campus-moderne.jpg";
import campusClassique from "@/assets/site/campus-classique.jpg";

/** Photos réelles des campus (source : Wikimedia Commons). */
const PHOTOS: Record<string, string> = {
  "HEC Paris": hec.url,
  ESSEC: essec.url,
  ESCP: escp.url,
  EDHEC: edhec.url,
  emlyon: emlyon.url,
  SKEMA: skema.url,
  NEOMA: neoma.url,
  GEM: gem.url,
  KEDGE: kedge.url,
  "TBS Education": tbs.url,
  ICN: icn.url,
  BSB: bsb.url,
  "ESC Clermont": clermont.url,
  INSEEC: inseec.url,
  SCBS: scbs.url,
};

/** Visuels de campus génériques au format bannière, attribués de façon stable. */
const FALLBACKS = [campusHaussmann, campusModerne, campusClassique];

function stableIndex(value: string, modulo: number): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) % 100000;
  return hash % modulo;
}

/** Photo exacte du campus si nous l'avons, sinon rien. */
export function schoolPhoto(school?: string): string | undefined {
  if (!school) return undefined;
  const key = Object.keys(PHOTOS).find((k) => school.toLowerCase().includes(k.toLowerCase()));
  return key ? PHOTOS[key] : undefined;
}

/** Photo de campus garantie : la vraie si disponible, sinon un visuel générique stable. */
export function schoolPhotoOrFallback(school?: string): string {
  if (!school) return campusHaussmann;
  return schoolPhoto(school) ?? FALLBACKS[stableIndex(school, FALLBACKS.length)]!;
}
