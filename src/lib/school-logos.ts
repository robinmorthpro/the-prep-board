/** Logos des écoles BCE / Ecricome, hébergés sur le CDN Lovable. */
import hec_parisLogo from "@/assets/schools/hec-paris.png";
import essecLogo from "@/assets/schools/essec.png";
import escpLogo from "@/assets/schools/escp.png";
import edhecLogo from "@/assets/schools/edhec.png";
import emlyonLogo from "@/assets/schools/emlyon.png";
import skemaLogo from "@/assets/schools/skema.png";
import audenciaLogo from "@/assets/schools/audencia.png";
import neomaLogo from "@/assets/schools/neoma.png";
import gemLogo from "@/assets/schools/gem.png";
import kedgeLogo from "@/assets/schools/kedge.png";
import tbsLogo from "@/assets/schools/tbs.png";
import rennes_sbLogo from "@/assets/schools/rennes-sb.png";
import montpellier_bsLogo from "@/assets/schools/montpellier-bs.png";
import icnLogo from "@/assets/schools/icn.png";
import exceliaLogo from "@/assets/schools/excelia.png";
import em_strasbourgLogo from "@/assets/schools/em-strasbourg.png";
import bsbLogo from "@/assets/schools/bsb.png";
import em_normandieLogo from "@/assets/schools/em-normandie.png";
import isc_parisLogo from "@/assets/schools/isc-paris.png";
import esc_clermontLogo from "@/assets/schools/esc-clermont.png";
import imt_bsLogo from "@/assets/schools/imt-bs.png";
import inseecLogo from "@/assets/schools/inseec.png";
import scbsLogo from "@/assets/schools/scbs.png";
import brest_bsLogo from "@/assets/schools/brest-bs.png";

export const SCHOOL_LOGOS: Record<string, string> = {
  "HEC Paris": hec_parisLogo,
  "ESSEC": essecLogo,
  "ESCP": escpLogo,
  "EDHEC": edhecLogo,
  "emlyon": emlyonLogo,
  "SKEMA": skemaLogo,
  "Audencia": audenciaLogo,
  "NEOMA": neomaLogo,
  "GEM (Grenoble EM)": gemLogo,
  "KEDGE": kedgeLogo,
  "TBS Education": tbsLogo,
  "Rennes School of Business": rennes_sbLogo,
  "Montpellier BS": montpellier_bsLogo,
  "ICN Business School": icnLogo,
  "Excelia BS (La Rochelle)": exceliaLogo,
  "EM Strasbourg": em_strasbourgLogo,
  "BSB (Burgundy School of Business)": bsbLogo,
  "EM Normandie": em_normandieLogo,
  "ISC Paris": isc_parisLogo,
  "ESC Clermont BS": esc_clermontLogo,
  "IMT-BS": imt_bsLogo,
  "INSEEC Grande \u00c9cole": inseecLogo,
  "SCBS (South Champagne BS)": scbsLogo,
  "Brest Business School": brest_bsLogo,
};

export function schoolLogo(school: string): string | undefined {
  return SCHOOL_LOGOS[school];
}
