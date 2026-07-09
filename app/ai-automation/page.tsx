import type { Metadata } from "next";
import SeoLandingTemplate from "../seo-landing-template";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "AI Automation Services | ZeroCool Development",
  description:
    "AI automation services that reduce manual workload, accelerate lead follow-up, and improve business operations with practical integrations.",
  path: "/ai-automation",
});

export default function AiAutomationPage() {
  return (
    <SeoLandingTemplate
      path="/ai-automation"
      kicker="AI Automation"
      title="Automate Repetitive Work with AI"
      description="ZeroCool Development helps businesses deploy AI automation for customer communication, lead qualification, and process acceleration."
      benefits={[
        "AI-assisted lead qualification workflows",
        "Automated support and response templates",
        "Integration with HubSpot and internal tools",
        "Governance-first implementation approach",
      ]}
      faq={[
        {
          question: "Will AI replace my existing team workflow?",
          answer:
            "No. Our approach augments your team by automating repetitive tasks while preserving human review where needed.",
        },
        {
          question: "Can this work with my current CRM?",
          answer:
            "Yes. We design integrations that connect AI steps to your CRM and existing operational stack.",
        },
      ]}
    />
  );
}
