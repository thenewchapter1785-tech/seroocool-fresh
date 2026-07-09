export type LeadMagnet = {
  slug: string;
  title: string;
  description: string;
  filePath: string;
  benefit: string;
};

export const leadMagnets: LeadMagnet[] = [
  {
    slug: "computer-maintenance-checklist",
    title: "Computer Maintenance Checklist",
    description: "A practical checklist to reduce crashes, lag, and surprise downtime.",
    filePath: "/downloads/computer-maintenance-checklist.txt",
    benefit: "Keep home and office devices running smoothly year-round.",
  },
  {
    slug: "small-business-technology-guide",
    title: "Small Business Technology Guide",
    description: "How to choose the right systems for growth without overspending.",
    filePath: "/downloads/small-business-technology-guide.txt",
    benefit: "Plan smarter upgrades and avoid expensive tool mistakes.",
  },
  {
    slug: "website-seo-checklist",
    title: "Website SEO Checklist",
    description: "Core technical and on-page checks to improve rankings and leads.",
    filePath: "/downloads/website-seo-checklist.txt",
    benefit: "Turn your website into a stronger lead channel.",
  },
  {
    slug: "cybersecurity-checklist",
    title: "Cybersecurity Checklist",
    description: "Baseline controls every home office and small business should have.",
    filePath: "/downloads/cybersecurity-checklist.txt",
    benefit: "Reduce avoidable security incidents and recovery costs.",
  },
  {
    slug: "ai-automation-guide",
    title: "AI Automation Guide",
    description: "Real use cases for AI in support, lead handling, and operations.",
    filePath: "/downloads/ai-automation-guide.txt",
    benefit: "Identify the highest-ROI automation opportunities quickly.",
  },
];
