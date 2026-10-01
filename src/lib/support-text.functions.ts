/**
 * Extraction fidèle du texte d'un support d'entretien (module 8).
 *
 * Le support déposé par le candidat (questionnaire, CV projectif, dossier de
 * motivation…) n'est plus envoyé comme fichier à l'agent vocal : il est lu ici,
 * côté serveur, puis transmis au jury comme texte (variable `{{support_text}}`)
 * et réutilisé tel quel par le débrief.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

const EXTRACTION_PROMPT = `Tu es un lecteur de documents. On te remet un document préparé par un candidat avant un oral d'école de commerce (questionnaire, dossier de motivation, CV projectif, cartographie, fiche…).

Ta seule tâche : restituer FIDÈLEMENT son contenu en texte brut, y compris quand il est manuscrit.

Règles :
- Restitue tout le texte lisible, dans l'ordre du document, sans rien résumer, reformuler, corriger ni compléter.
- Conserve la structure : titres de rubriques, questions imprimées, réponses du candidat, listes, tableaux (rendus ligne par ligne).
- Préfixe chaque rubrique par son intitulé exact tel qu'il figure sur le document.
- N'ajoute aucun commentaire, aucune analyse, aucune évaluation, aucune introduction.
- Si un passage est illisible, écris [illisible] à sa place.
- Si le document ne contient aucun texte exploitable, réponds exactement : (document vide ou illisible)`;

/**
 * Lit le support déposé dans le bucket privé et en renvoie le texte.
 * Un support illisible renvoie une chaîne vide : l'entretien démarre quand même.
 */
export const extractSupportText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ path: z.string().min(1), label: z.string().default("Support d'entretien") }).parse(input),
  )
  .handler(async ({ data, context }) => {
    // Le chemin est toujours préfixé par l'identifiant du candidat : on refuse
    // catégoriquement de lire le support d'un autre utilisateur.
    if (!data.path.startsWith(`${context.userId}/`)) {
      throw new Error("Support introuvable.");
    }

    const key = process.env["LOVABLE_API_KEY"];
    if (!key) {
      console.error("[extractSupportText] LOVABLE_API_KEY manquante");
      return { text: "" };
    }

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: blob, error } = await supabaseAdmin.storage.from("interview-supports").download(data.path);
      if (error || !blob) throw error ?? new Error("support introuvable");

      const mime = blob.type || "application/pdf";
      const base64 = Buffer.from(await blob.arrayBuffer()).toString("base64");
      if (!base64.length) return { text: "" };
      const dataUrl = `data:${mime};base64,${base64}`;

      const block = mime.startsWith("image/")
        ? { type: "image_url", image_url: { url: dataUrl } }
        : { type: "file", file: { filename: `${data.label}.pdf`, file_data: dataUrl } };

      const res = await fetch(GATEWAY, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: "google/gemini-3.7-flash",
          temperature: 0,
          messages: [
            { role: "system", content: EXTRACTION_PROMPT },
            {
              role: "user",
              content: [{ type: "text", text: `Document remis : ${data.label}. Restitue son texte.` }, block],
            },
          ],
        }),
      });

      if (!res.ok) {
        console.error(`[extractSupportText] AI gateway ${res.status}: ${await res.text()}`);
        return { text: "" };
      }

      const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const text = (json.choices?.[0]?.message?.content ?? "").trim();
      if (!text || text === "(document vide ou illisible)") return { text: "" };
      return { text };
    } catch (error) {
      console.error("[extractSupportText] support illisible", error);
      return { text: "" };
    }
  });
