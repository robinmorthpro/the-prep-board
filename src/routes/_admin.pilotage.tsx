import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { usePilotageData, usePilotageRealtime } from "@/lib/pilotage-queries";
import { candidateName, countCompleted, formatScore, overview, schoolOptions, validSessions, scoreOf, MODULES } from "@/lib/pilotage";

export const Route = createFileRoute("/_admin/pilotage")({
  head: () => ({ meta: [{ title: "Pilotage · The Prepboard" }] }),
  component: Pilotage,
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

function Bar({ percent, tone }: { percent: number; tone: "ink" | "ciel" }) {
  return (
    <div className="h-3 rounded-full bg-[var(--paper)]">
      <div
        className={`h-full rounded-full ${tone === "ink" ? "bg-[var(--ink)]" : "bg-[var(--ciel)]"}`}
        style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
      />
    </div>
  );
}

function Pilotage() {
  usePilotageRealtime();
  const { data: candidates = [], isLoading, error, refetch } = usePilotageData();
  const [school, setSchool] = useState("");
  const stats = useMemo(() => overview(candidates, school || null), [candidates, school]);
  const options = useMemo(() => schoolOptions(candidates), [candidates]);

  if (isLoading) return <p className="text-[18px] text-[#4A5568]">Chargement du pilotage…</p>;
  if (error)
    return (
      <div className="flex flex-col items-start gap-3 rounded-[24px] bg-white p-7">
        <p className="m-0 text-[18px]">Les données n'ont pas pu être chargées. Vérifiez votre connexion, puis réessayez.</p>
        <button type="button" onClick={() => refetch()} className="rounded-[12px] bg-[var(--ink)] px-4 py-2 font-semibold text-white">
          Réessayer
        </button>
      </div>
    );

  const rows = [...stats.candidates].sort((a, b) => countCompleted(b) - countCompleted(a));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="m-0 text-[56px] font-medium leading-[1.02] tracking-[-0.045em]">Pilotage</h1>
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-3 py-1.5 text-[15px] font-semibold text-white">
            <span className="size-2 animate-pulse rounded-full bg-[var(--ciel)] motion-reduce:animate-none" aria-hidden="true" />
            En direct
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <label htmlFor="ecole" className="text-[16px] text-[#4A5568]">
            École
          </label>
          <select
            id="ecole"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            className="rounded-[12px] border border-[#CBD2DD] bg-white px-3 py-2 text-[16px] text-[var(--ink)]"
          >
            <option value="">Toutes les écoles</option>
            {options.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Kpi label="Candidats inscrits" value={String(stats.candidateCount)} />
        <Kpi label="Entretiens" value={String(stats.interviewCount)} />
        <Kpi label="Note moyenne" value={formatScore(stats.averageScore)} suffix={stats.averageScore == null ? undefined : "/20"} />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <section aria-labelledby="ecoles-t" className={card}>
          <h2 id="ecoles-t" className={h2}>
            Note moyenne par école
          </h2>
          {stats.schools.length === 0 ? (
            <p className="m-0 text-[17px] text-[#4A5568]">Aucun entretien noté pour l'instant.</p>
          ) : (
            <>
              <div className="grid grid-cols-[minmax(0,140px)_1fr_48px_96px] gap-3 text-[15px] text-[#4A5568]">
                <span>École</span>
                <span />
                <span className="text-right">Note</span>
                <span className="text-right">Entretiens</span>
              </div>
              {stats.schools.map((s) => (
                <div key={s.name} className="grid grid-cols-[minmax(0,140px)_1fr_48px_96px] items-center gap-3 text-[17px]">
                  <button
                    type="button"
                    onClick={() => setSchool(s.name)}
                    className="truncate text-left underline underline-offset-[3px]"
                    title={`Filtrer sur ${s.name}`}
                  >
                    {s.name}
                  </button>
                  <Bar percent={(s.average / 20) * 100} tone="ink" />
                  <span className="text-right tabular-nums">{formatScore(s.average)}</span>
                  <span className="text-right tabular-nums text-[#4A5568]">{s.count}</span>
                </div>
              ))}
            </>
          )}
        </section>

        <section aria-labelledby="compl-t" className={card}>
          <h2 id="compl-t" className={h2}>
            Complétion des modules
          </h2>
          {stats.completion.map((m) => (
            <div key={m.id} className="grid grid-cols-[minmax(0,230px)_1fr_52px] items-center gap-3 text-[17px]">
              <span className="truncate">
                {m.id}. {m.title}
              </span>
              <Bar percent={m.percent} tone="ciel" />
              <span className="text-right tabular-nums">{m.percent} %</span>
            </div>
          ))}
        </section>
      </div>

      <section id="candidats" aria-labelledby="cand-t" className={card}>
        <h2 id="cand-t" className={h2}>
          Candidats
        </h2>
        {rows.length === 0 ? (
          <p className="m-0 text-[17px] text-[#4A5568]">Aucun candidat pour l'instant.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[17px]">
              <thead>
                <tr className="text-left text-[15px] text-[#4A5568]">
                  <th className="border-b border-[#E4E8EF] px-3 py-2.5 font-semibold">Candidat</th>
                  <th className="border-b border-[#E4E8EF] px-3 py-2.5 font-semibold">E-mail</th>
                  <th className="border-b border-[#E4E8EF] px-3 py-2.5 font-semibold">Modules terminés</th>
                  <th className="border-b border-[#E4E8EF] px-3 py-2.5 text-right font-semibold">Dernière note</th>
                  <th className="border-b border-[#E4E8EF] px-3 py-2.5">
                    <span className="sr-only">Fiche</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => {
                  const done = countCompleted(c);
                  const last = validSessions(c, school || null)[0];
                  return (
                    <tr key={c.profile.id}>
                      <td className="border-b border-[#EEF1F5] px-3 py-3.5 font-semibold">{candidateName(c.profile)}</td>
                      <td className="border-b border-[#EEF1F5] px-3 py-3.5 text-[#4A5568]">{c.email ?? "—"}</td>
                      <td className="border-b border-[#EEF1F5] px-3 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-[120px]">
                            <Bar percent={(done / MODULES.length) * 100} tone="ink" />
                          </div>
                          <span className="tabular-nums">
                            {done}/{MODULES.length}
                          </span>
                        </div>
                      </td>
                      <td className="border-b border-[#EEF1F5] px-3 py-3.5 text-right tabular-nums">
                        {last ? formatScore(scoreOf(last)) : "—"}
                      </td>
                      <td className="border-b border-[#EEF1F5] px-3 py-3.5 text-right">
                        <Link
                          to="/candidats/$id"
                          params={{ id: c.profile.id }}
                          className="text-[16px] font-semibold underline underline-offset-[3px]"
                        >
                          Voir
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
