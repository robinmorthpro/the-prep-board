/** Logos des écoles BCE / Ecricome, hébergés sur le CDN Lovable. */
import hec_parisLogo from "@/assets/schools/hec-paris.png.asset.json";
import essecLogo from "@/assets/schools/essec.png.asset.json";
import escpLogo from "@/assets/schools/escp.png.asset.json";
import edhecLogo from "@/assets/schools/edhec.png.asset.json";
import emlyonLogo from "@/assets/schools/emlyon.png.asset.json";
import skemaLogo from "@/assets/schools/skema.png.asset.json";
import audenciaLogo from "@/assets/schools/audencia.png.asset.json";
import neomaLogo from "@/assets/schools/neoma.png.asset.json";
import gemLogo from "@/assets/schools/gem.png.asset.json";
import kedgeLogo from "@/assets/schools/kedge.png.asset.json";
import tbsLogo from "@/assets/schools/tbs.png.asset.json";
import rennes_sbLogo from "@/assets/schools/rennes-sb.png.asset.json";
import montpellier_bsLogo from "@/assets/schools/montpellier-bs.png.asset.json";
import icnLogo from "@/assets/schools/icn.png.asset.json";
import exceliaLogo from "@/assets/schools/excelia.png.asset.json";
import em_strasbourgLogo from "@/assets/schools/em-strasbourg.png.asset.json";
import bsbLogo from "@/assets/schools/bsb.png.asset.json";
import em_normandieLogo from "@/assets/schools/em-normandie.png.asset.json";
import isc_parisLogo from "@/assets/schools/isc-paris.png.asset.json";
import esc_clermontLogo from "@/assets/schools/esc-clermont.png.asset.json";
import imt_bsLogo from "@/assets/schools/imt-bs.png.asset.json";
import inseecLogo from "@/assets/schools/inseec.png.asset.json";
import scbsLogo from "@/assets/schools/scbs.png.asset.json";
import brest_bsLogo from "@/assets/schools/brest-bs.png.asset.json";

export const SCHOOL_LOGOS: Record<string, string> = {
  "HEC Paris": hec_parisLogo.url,
  "ESSEC": essecLogo.url,
  "ESCP": escpLogo.url,
  "EDHEC": edhecLogo.url,
  "emlyon": emlyonLogo.url,
  "SKEMA": skemaLogo.url,
  "Audencia": audenciaLogo.url,
  "NEOMA": neomaLogo.url,
  "GEM (Grenoble EM)": gemLogo.url,
  "KEDGE": kedgeLogo.url,
  "TBS Education": tbsLogo.url,
  "Rennes School of Business": rennes_sbLogo.url,
  "Montpellier BS": montpellier_bsLogo.url,
  "ICN Business School": icnLogo.url,
  "Excelia BS (La Rochelle)": exceliaLogo.url,
  "EM Strasbourg": em_strasbourgLogo.url,
  "BSB (Burgundy School of Business)": bsbLogo.url,
  "EM Normandie": em_normandieLogo.url,
  "ISC Paris": isc_parisLogo.url,
  "ESC Clermont BS": esc_clermontLogo.url,
  "IMT-BS": imt_bsLogo.url,
  "INSEEC Grande \u00c9cole": inseecLogo.url,
  "SCBS (South Champagne BS)": scbsLogo.url,
  "Brest Business School": brest_bsLogo.url,
};

export function schoolLogo(school: string): string | undefined {
  return SCHOOL_LOGOS[school];
}
