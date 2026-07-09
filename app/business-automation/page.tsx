import type { Metadata } from "next";
import SeoLandingTemplate from "../seo-landing-template";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Business Automation Solutions | ZeroCool Development",
  description:
    "Business automation solutions for small businesses to streamline operations, reduce errors, and scale without adding overhead.",
  path: "/business-automation",
});

export default function BusinessAutomationPage() {
  return (
    <SeoLandingTemplate
      path="/business-automation"
      kicker="Business Automation"
      title="Scale Operations with Smarter Automation"
      description="We map your operational bottlenecks and implement workflow automation that improves speed, consistency, and visibility."
      benefits={[
        "Workflow mapping and bottleneck analysis",
        "Automation across sales, onboarding, and support",
        "Low-friction integrations for existing systems",
        "Operational dashboards and alerts",
      ]}
      faq={[
        {
          question: "How do we decide what to automate first?",
          answer:
            "We prioritize workflows with high repetition, high error rates, and direct impact on response times or revenue.",
        },
        {
          question: "Can automation support compliance requirements?",
          answer:
            "Yes. We can add validation, audit trails, and role-aware controls to support operational governance.",
        },
      ]}
    />
  );
}
