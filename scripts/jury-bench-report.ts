/**
 * DIAGNOSTIC « AVANT » DU BANC DE MESURE DU JURY
 *
 * Script de lecture seule : il récupère les 12 dernières sessions
 * d'entretien enregistrées, applique `measureJuryBench` au fil de chacune
 * et imprime un rapport lisible. Il ne modifie rien, ni en base ni dans
 * l'application.
 *
 * Usage : bun scripts/jury-bench-report.ts
 */
import { createClient } from "@supabase/supabase-js";
import { measureJuryBench, benchDurationMinutes, type BenchTurn } from "../src/lib/jury-bench";
import { KEY_QUESTIONS } from "../src/lib/vivaldi-data";

const QUESTION_BANK = KEY_QUESTIONS.map((question) => question.question);

const url = process.env["VITE_SUPABASE_URL"] ?? process.env["SUPABASE_URL"] ?? "";
const key =
  process.env["SUPABASE_SERVICE_ROLE_KEY"] ??
  process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ??
  process.env["SUPABASE_ANON_KEY"] ??
  "";

if (!url || !key) {
  console.error("Variables de connexion absentes de l'environnement.");
  process.exit(1);
}

const pct = (value: number) => `${Math.round(value * 100)}%`;
const num = (value: number) => value.toFixed(2);

async function main() {
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await supabase
    .from("interview_sessions")
    .select("id, school, turns, created_at, status")
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    console.error("Lecture impossible :", error.message);
    process.exit(1);
  }

  const sessions = data ?? [];
  console.log(`${sessions.length} session(s) lue(s).\n`);

  sessions.forEach((session, rank) => {
    const turns = (Array.isArray(session.turns) ? session.turns : []) as BenchTurn[];
    const m = measureJuryBench(turns, QUESTION_BANK);
    const date = new Date(session.created_at as string).toISOString().slice(0, 16).replace("T", " ");
    const themes = m.coveredThemes;

    console.log("=".repeat(78));
    console.log(
      `${rank + 1}. ${session.school || "(école non renseignée)"} — ${date} — statut ${session.status}`,
    );
    console.log(`   Tours du jury           : ${m.juryTurns} (durée ${num(benchDurationMinutes(turns))} min)`);
    console.log(`   Questions / minute      : ${num(m.questionsPerMinute)}`);
    console.log(`   Part de parole du jury  : ${pct(m.juryWordShare)}`);
    console.log(`   Fins par une question   : ${pct(m.endsWithQuestionRatio)}`);
    console.log(`   Commentaires qualité    : ${m.qualityCommentTurns.length}`);
    m.qualityCommentTurns.forEach((c) => console.log(`      - tour ${c.index} : « ${c.excerpt} »`));
    console.log(`   Questions à tiroir      : ${m.doubleQuestionTurns.length} ${JSON.stringify(m.doubleQuestionTurns)}`);
    console.log(
      `   Longueur des tours      : médiane ${num(m.juryTurnLength.median)} | p90 ${num(m.juryTurnLength.p90)} | max ${m.juryTurnLength.max}` +
        ` | < 15 mots ${pct(m.juryTurnLength.shortShare)} | ≥ 40 mots ${pct(m.juryTurnLength.richShare)}`,
    );
    console.log(`   Tours > 60 mots         : ${m.longTurns.length} ${JSON.stringify(m.longTurns)}`);
    console.log(
      `   Amorces répétées        : ${m.openerRepeats.length}${
        m.openerRepeats.length ? " — " + m.openerRepeats.map((o) => `« ${o.opener} » ×${o.count}`).join(", ") : ""
      }`,
    );
    console.log(
      `   Questions reposées      : ${m.repeatedQuestions.length}${
        m.repeatedQuestions.length
          ? " — " + m.repeatedQuestions.map((p) => `${p.a}/${p.b} (${num(p.similarity)})`).join(", ")
          : ""
      }`,
    );
    console.log(`   Venant du catalogue     : ${pct(m.bankQuestionRatio)}`);
    console.log(`   Improvisé ancré         : ${pct(m.anchoredImprovisedRatio)}`);
    console.log(
      `   Thèmes couverts         : projet ${themes.projetPro ? "oui" : "non"}` +
        ` | école ${themes.ecole ? "oui" : "non"}` +
        ` | qualités/défauts ${themes.qualitesDefauts ? "oui" : "non"}` +
        ` | actualité ${themes.actualite ? "oui" : "non"}` +
        ` | expériences ${themes.experience ? "oui" : "non"}`,
    );
  });
  console.log("=".repeat(78));
}

main();
