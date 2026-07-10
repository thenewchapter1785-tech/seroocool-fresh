import type { Metadata } from "next";
import AiAssistantPanel from "../ai-assistant-panel";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Quick Diagnostic | ZeroCool Development",
  description:
    "Start a quick diagnostic conversation for computer repair, tech support, and business technology questions.",
  path: "/diagnostic",
});

export default function DiagnosticPage() {
  return (
    <div className="site-shell">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8 md:gap-8 md:px-10 md:py-12">
        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h1 className="section-title">Quick Diagnostic</h1>
          <p className="section-copy mt-3">
            Describe what is happening and we will help you figure out the best next step.
          </p>
        </section>
        <AiAssistantPanel />
      </main>
    </div>
  );
}
