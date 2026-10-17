import { createFileRoute, Link } from "@tanstack/react-router";
import { usePilotageData, usePilotageRealtime } from "@/lib/pilotage-queries";
import { average, candidateName, completedModules, countCompleted, formatScore, MODULES, scoreOf, validSessions } from "@/lib/pilotage";

export const Route = createFileRoute("/_admin/candidats/$id")({
  head: () => ({ meta: [{ title: "Fiche candidat · The Prepboard" }] }),
  component: FicheCandidat,
});

const card = "flex flex-col gap-4 rounded-[24px] bg-white p-7";
const h2 = "m-0 text-[26px] font-medium tracking-[-0.03em]";

function Kpi({ label, value, suffix }: { label: string; value: string; suffix?: string | undefined }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-[24px] bg-white px-7 py-6">
      <span className="text-[17px] text-[#4A5568]">{label}</span>
      <span className="text-[48px] font-medium leading-[1.05] tracking-[-0.04em] tabular-nums">
        {value}
        {suffix ? <span className="text-[24px] text-[#4A5568]">{suffix}</span> : null}
      </span>
    </div>
  );
}

function FicheCandidat() {
  usePilotageRealtime();
  const { id } = Route.useParams();
  const { data: candidates = [], isLoading, error, refetch } = usePilotageData();

  const back = (
    <Link to="/pilotage" className="inline-flex items-center gap-2 text-[17px] font-semibold">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 12H5M11 6l-6 6 6 6" />
      </svg>
      Pilotage
    </Link>
  );

  if (isLoading) return <p className="text-[18px] text-[#4A5568]">Chargement de la fiche…</p>;
  if (error)
    return (
      <div className="flex flex-col items-start gap-3 rounded-[24px] bg-white p-7">
        <p className="m-0 text-[18px]">La fiche n'a pas pu être chargée. Vérifiez votre connexion, puis réessayez.</p>
        <button type="button" onClick={() => refetch()} className="rounded-[12px] bg-[var(--ink)] px-4 py-2 font-semibold text-white">
          Réessayer
        </button>
      </div>
    );

  const c = candidates.find((x) => x.profile.id === id);
  if (!c)
    return (
      <div className="flex flex-col gap-4">
        {back}
        <p className="m-0 text-[18px]">Ce candidat n'existe pas ou a supprimé son compte.</p>
      </div>
    );

  const done = completedModules(c);
  const firstTodo = MODULES.find((m) => !done[m.id])?.id;
  const sessions = validSessions(c);
  const avg = average(sessions.map(scoreOf).filter((v): v is number => v != null));
  const schools = (c.profile.target_schools ?? []).filter(Boolean);

  return (
    <div className="flex flex-col gap-6">
      {back}
      <header className="flex flex-col gap-1.5">
        <h1 className="m-0 text-[56px] font-medium leading-[1.02] tracking-[-0.045em]">{candidateName(c.profile)}</h1>
        <p className="m-0 text-[20px] text-[#4A5568]">
          {c.email ?? "E-mail inconnu"}
          {schools.length ? ` · écoles visées : ${schools.join(", ")}` : ""}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Kpi label="Modules terminés" value={String(countCompleted(c))} suffix={`/${MODULES.length}`} />
        <Kpi label="Entretiens" value={String(sessions.length)} />
        <Kpi label="Note moyenne" value={formatScore(avg)} suffix={avg == null ? undefined : "/20"} />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <section aria-labelledby="fm-t" className={card}>
          <h2 id="fm-t" className={h2}>
            Modules
          </h2>
          <ul className="m-0 list-none p-0">
            {MODULES.map((m) => (
              <li key={m.id} className="flex justify-between gap-3 border-b border-[#EEF1F5] py-3">
                <span>
                  {m.id}. {m.title}
                </span>
                {done[m.id] ? (
                  <span className="text-[15px] font-semibold text-[#15803D]">Terminé</span>
                ) : m.id === firstTodo ? (
                  <span className="rounded-full bg-[var(--ciel)] px-2.5 py-0.5 text-[15px] font-semibold">En cours</span>
                ) : (
                  <span className="text-[15px] text-[#4A5568]">À faire</span>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="fh-t" className={card}>
          <h2 id="fh-t" className={h2}>
            Entretiens
          </h2>
          {sessions.length === 0 ? (
            <p className="m-0 text-[17px] text-[#4A5568]">Aucun entretien terminé pour l'instant.</p>
          ) : (
            <ul className="m-0 flex list-none flex-col p-0">
              {sessions.map((s) => (
                <li key={s.id} className="border-b border-[#EEF1F5] py-3">
                  <details>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                      <span className="tabular-nums text-[#4A5568]">{new Date(s.created_at).toLocaleDateString("fr-FR")}</span>
                      <span className="flex-1">{s.school}</span>
                      <span className="tabular-nums">{formatScore(scoreOf(s))}</span>
                      <span className="text-[16px] font-semibold underline underline-offset-[3px]">Feedback</span>
                    </summary>
                    <div className="mt-3 whitespace-pre-wrap rounded-[16px] bg-[var(--paper)] p-4 text-[16px] leading-relaxed">
                      {s.debrief?.trim() || "Feedback indisponible."}
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
