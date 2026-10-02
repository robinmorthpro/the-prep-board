import { createFileRoute } from "@tanstack/react-router";

const TITLE = "Le test gratuit arrive bientôt | The Prepboard";
const DESCRIPTION = "Le test gratuit de The Prepboard arrive bientôt.";

export const Route = createFileRoute("/_site/test-gratuit")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TestGratuit,
});

function TestGratuit() {
  return (
    <section className="flex min-h-[60vh] items-center bg-white py-24 text-[var(--ink)] md:py-[136px]">
      <div className="mx-auto w-full max-w-[1440px] px-5 md:px-12">
        <h1 className="m-0 max-w-[900px] text-[44px] leading-none font-medium tracking-[-0.045em] md:text-[64px]">
          Le test gratuit arrive bientôt
        </h1>
      </div>
    </section>
  );
}
