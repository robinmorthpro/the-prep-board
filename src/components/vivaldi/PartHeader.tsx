import type { ReactNode } from "react";
import { moduleBanner } from "./module-banners";

export function PartHeader({
  step,
  title,
  intro,
  children,
  image,
}: {
  step: string;
  title: string;
  intro?: string;
  children?: ReactNode;
  /** Force un visuel de bannière, sinon déduit du module. */
  image?: string | null;
}) {
  const banner = image === null ? undefined : (image ?? moduleBanner(step));

  return (
    <header className="mb-6">
      <section className="relative overflow-hidden rounded-[28px] bg-[var(--ink)] text-white">
        {banner ? (
          <>
            <img
              src={banner}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="absolute inset-0 size-full object-cover"
              style={{ objectPosition: "50% 60%" }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(11,18,32,0.95) 0%, rgba(11,18,32,0.82) 45%, rgba(11,18,32,0.35) 100%)",
              }}
            />
          </>
        ) : null}
        <div className="relative p-6 md:p-12">
          <div className="flex flex-col gap-[18px]">
            <span className="inline-flex self-start rounded-full bg-[rgba(169,200,255,0.16)] px-4 py-2 text-[17px] font-semibold tracking-[-0.01em] text-[var(--ciel)] md:px-5 md:py-[10px] md:text-[22px]">
              {step}
            </span>
            <h1 className="m-0 text-[34px] font-medium leading-[1.02] tracking-[-0.045em] text-white md:text-[56px]">
              {title}
            </h1>
            {intro ? (
              <p className="m-0 max-w-[760px] text-[17px] leading-[1.55] text-[#E1E6EF] md:text-[20px]">{intro}</p>
            ) : null}
          </div>
        </div>
      </section>
      {children}
    </header>
  );
}
