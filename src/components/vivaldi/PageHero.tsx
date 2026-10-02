import type { ReactNode } from "react";

/** Bandeau photo sombre commun aux écrans étudiants (système de la maquette). */
export function PageHero({
  image,
  eyebrow,
  title,
  children,
}: {
  image?: string | undefined;
  eyebrow?: string | undefined;
  title: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative mb-6 overflow-hidden rounded-[28px] bg-[var(--ink)] text-white">
      {image ? (
        <img
          src={image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover"
          style={{ objectPosition: "60% 30%" }}
        />
      ) : null}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(11,18,32,0.95) 0%, rgba(11,18,32,0.82) 45%, rgba(11,18,32,0.35) 100%)",
        }}
      />
      <div className="relative p-6 md:p-12">
        <div className="flex max-w-[760px] flex-col gap-4">
          {eyebrow ? <p className="m-0 text-[15px] font-semibold text-[#A9C8FF] md:text-[16px]">{eyebrow}</p> : null}
          <h1 className="m-0 text-[36px] font-medium leading-[1.02] tracking-[-0.045em] text-white md:text-[56px]">
            {title}
          </h1>
          {children ? (
            <div className="m-0 text-[17px] leading-[1.55] text-[#E1E6EF] md:text-[20px]">{children}</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
