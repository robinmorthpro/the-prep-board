import { useState, type ReactNode } from "react";

/**
 * Encart « À lire au démarrage » des modules (maquette module 1).
 * Ouvert par défaut ; état local à la page, jamais mémorisé.
 */
export function StartPanel({
  objectif,
  aSavoir,
  theory,
  recommendation,
}: {
  /** Paragraphes de la ligne « Objectif ». */
  objectif: ReactNode[];
  /** Paragraphes de la ligne « À savoir : ». */
  aSavoir?: ReactNode[];
  /** Bouton des consignes théoriques (TheoryDialog en variante « prominent »). */
  theory?: ReactNode;
  /** Texte de recommandation affiché à côté du bouton. */
  recommendation?: ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <section className="mb-6 flex flex-col rounded-[24px] bg-[var(--bleu-pale)] px-6 py-6 md:px-10 md:py-8">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`flex cursor-pointer items-center justify-between gap-6 text-left ${open ? "pb-6" : ""}`}
      >
        <h2 className="m-0 text-[28px] font-medium leading-[1.1] tracking-[-0.035em] md:text-[36px]">
          À lire au démarrage
        </h2>
        <span
          className={`inline-flex size-12 flex-none items-center justify-center rounded-full bg-white text-[var(--ink)] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>

      {open ? (
        <div className="pb-2">
          <Row label="Objectif" first>
            {objectif}
          </Row>
          {aSavoir?.length ? <Row label="À savoir :">{aSavoir}</Row> : null}
          {theory || recommendation ? (
            <div className="flex flex-col items-start gap-4 border-t border-[rgba(46,70,200,0.18)] py-6 md:flex-row md:items-center md:gap-8">
              {theory}
              {recommendation ? (
                <p className="m-0 flex-1 text-[16px] leading-[1.5] text-[var(--gris-doux)] md:text-[17px]">{recommendation}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function Row({ label, first, children }: { label: string; first?: boolean; children: ReactNode[] }) {
  return (
    <div
      className={`grid gap-3 py-6 md:grid-cols-[240px_minmax(0,1fr)] md:gap-8 ${
        first ? "" : "border-t border-[rgba(46,70,200,0.18)]"
      }`}
    >
      <p className="m-0 text-[18px] font-semibold tracking-[-0.01em] text-[var(--ink)] md:text-[20px]">{label}</p>
      <div className="flex flex-col gap-[14px]">
        {children.map((c, i) => (
          <p key={i} className="m-0 text-[17px] leading-[1.55] text-[var(--ink)] md:text-[20px]">
            {c}
          </p>
        ))}
      </div>
    </div>
  );
}

/** Encart « À lire au démarrage » pour les modules sans lignes Objectif / À savoir. */
export function IntroPanel({
  children,
  theory,
  title = "À lire au démarrage",
}: {
  children: ReactNode;
  theory?: ReactNode;
  title?: ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <section className="mb-6 flex flex-col rounded-[24px] bg-[var(--bleu-pale)] px-6 py-6 md:px-10 md:py-8">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`flex cursor-pointer items-center justify-between gap-6 text-left ${open ? "pb-6" : ""}`}
      >
        <h2 className="m-0 text-[28px] font-medium leading-[1.1] tracking-[-0.035em] md:text-[36px]">
          {title}
        </h2>
        <span
          className={`inline-flex size-12 flex-none items-center justify-center rounded-full bg-white text-[var(--ink)] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>
      {open ? (
        <div className="pb-2">
          <div className="flex flex-col gap-[14px] pb-6 text-[17px] leading-[1.55] text-[var(--ink)] md:text-[20px]">
            {children}
          </div>
          {theory ? (
            <div className="flex flex-col items-start gap-4 border-t border-[rgba(46,70,200,0.18)] pt-6">{theory}</div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
