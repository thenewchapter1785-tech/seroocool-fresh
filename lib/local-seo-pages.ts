export type LocalSeoPage = {
  slug: string;
  city: string;
  region: string;
  title: string;
  description: string;
  keywords: string[];
  services: string[];
  intro: string;
  faq: Array<{ question: string; answer: string }>;
};

export const localSeoPages: LocalSeoPage[] = [
  {
    slug: "rhode-island-tech-support",
    city: "Rhode Island",
    region: "Statewide",
    title: "Rhode Island Tech Support for Homes and Small Businesses",
    description:
      "Beginner-friendly technology support across Rhode Island for computer repair, website growth, business automation, and AI services.",
    keywords: ["Rhode Island tech support", "Rhode Island computer repair", "Rhode Island website development"],
    services: ["Computer Repair", "Website Development", "Business Automation", "AI Automation"],
    intro:
      "ZeroCool Development supports Rhode Island clients with practical, revenue-focused technology services that are easy to understand and fast to implement.",
    faq: [
      {
        question: "Do you provide on-site and remote support in Rhode Island?",
        answer:
          "Yes. We support clients with remote sessions and on-site service depending on issue urgency and location.",
      },
      {
        question: "Can you help both home users and businesses?",
        answer:
          "Yes. We handle everyday support issues and growth-focused business technology projects.",
      },
    ],
  },
  {
    slug: "narragansett-computer-repair",
    city: "Narragansett",
    region: "South County",
    title: "Narragansett Computer Repair and Tech Help",
    description:
      "Fast, affordable computer repair and technology support in Narragansett for home users and small businesses.",
    keywords: ["Narragansett computer repair", "Narragansett tech support", "South County computer help"],
    services: ["Computer Repair", "Virus Removal", "Wi-Fi Setup", "Data Backup"],
    intro:
      "In Narragansett, we help fix slow computers, startup failures, malware issues, and unstable networks with clear recommendations.",
    faq: [
      {
        question: "How quickly can you respond to repair requests in Narragansett?",
        answer:
          "Most inquiries receive a response in less than one business day, with emergency priority options available.",
      },
      {
        question: "Can you recover files from failing devices?",
        answer:
          "In many cases, yes. We evaluate backup and recovery options before recommending replacement.",
      },
    ],
  },
  {
    slug: "south-kingstown-computer-repair",
    city: "South Kingstown",
    region: "South County",
    title: "South Kingstown Computer Repair and Business Tech Support",
    description:
      "Computer repair, diagnostics, and business technology services in South Kingstown with beginner-friendly support.",
    keywords: ["South Kingstown computer repair", "South Kingstown tech support", "South Kingstown IT help"],
    services: ["Laptop Repair", "PC Diagnostics", "Business Software", "CRM Setup"],
    intro:
      "South Kingstown clients rely on ZeroCool Development for both urgent repairs and ongoing technology improvements.",
    faq: [
      {
        question: "Do you support small business technology in South Kingstown?",
        answer:
          "Yes. We provide CRM setup, automation consulting, and support plans for local businesses.",
      },
      {
        question: "Is support beginner-friendly?",
        answer:
          "Yes. We explain options in plain language so you can make confident decisions.",
      },
    ],
  },
  {
    slug: "wakefield-tech-support",
    city: "Wakefield",
    region: "South Kingstown",
    title: "Wakefield Tech Support for Home and Business",
    description:
      "Wakefield technology support for repairs, websites, security, and growth systems.",
    keywords: ["Wakefield tech support", "Wakefield computer repair", "Wakefield website services"],
    services: ["Remote Tech Support", "Website Development", "SEO Optimization", "Network Troubleshooting"],
    intro:
      "Wakefield customers use ZeroCool Development for dependable support and stronger online lead generation.",
    faq: [
      {
        question: "Can you improve my website lead generation in Wakefield?",
        answer:
          "Yes. We improve conversion structure, calls to action, speed, and local SEO visibility.",
      },
      {
        question: "Do you offer emergency troubleshooting?",
        answer: "Yes. Emergency support options are available for urgent downtime and security issues.",
      },
    ],
  },
  {
    slug: "warwick-computer-repair",
    city: "Warwick",
    region: "Rhode Island",
    title: "Warwick Computer Repair and IT Support",
    description:
      "Warwick computer repair and technology support with fast diagnostics, malware cleanup, and long-term reliability planning.",
    keywords: ["Warwick computer repair", "Warwick IT support", "Warwick virus removal"],
    services: ["Computer Repair", "Virus Removal", "Data Backup", "Business Tech Care"],
    intro:
      "Warwick clients trust us for practical repair guidance and preventative support that reduces repeat issues.",
    faq: [
      {
        question: "Do you offer remote and in-person support in Warwick?",
        answer:
          "Yes. We can troubleshoot remotely and coordinate in-person service when needed.",
      },
      {
        question: "Can you secure business systems after malware incidents?",
        answer:
          "Yes. We combine cleanup with hardening recommendations to reduce future risk.",
      },
    ],
  },
  {
    slug: "providence-tech-support",
    city: "Providence",
    region: "Rhode Island",
    title: "Providence Tech Support and Digital Growth Services",
    description:
      "Technology support, website development, and automation services in Providence for startups and small businesses.",
    keywords: ["Providence tech support", "Providence website development", "Providence business automation"],
    services: ["Website Development", "App Development", "AI Automation", "HubSpot CRM"],
    intro:
      "Providence companies work with ZeroCool Development for reliable support and systems that increase lead conversion.",
    faq: [
      {
        question: "Can you build lead-focused websites for Providence businesses?",
        answer:
          "Yes. We build websites designed to increase calls, consultations, and qualified leads.",
      },
      {
        question: "Do you integrate HubSpot and automation tools?",
        answer:
          "Yes. We configure CRM and automation workflows for better follow-up and visibility.",
      },
    ],
  },
  {
    slug: "newport-tech-support",
    city: "Newport",
    region: "Aquidneck Island",
    title: "Newport Tech Support for Business and Home Users",
    description:
      "Newport technology support, website services, and business automation solutions for dependable growth.",
    keywords: ["Newport tech support", "Newport computer repair", "Newport website services"],
    services: ["Emergency Support", "Website Consultation", "Cloud / Security", "Monthly Plans"],
    intro:
      "Newport clients choose ZeroCool Development for fast support and premium service quality with clear communication.",
    faq: [
      {
        question: "Can you support seasonal business demand in Newport?",
        answer:
          "Yes. We help businesses prepare infrastructure and support workflows for peak seasons.",
      },
      {
        question: "Do you offer recurring support plans in Newport?",
        answer:
          "Yes. Monthly plans are available for proactive maintenance, monitoring, and growth support.",
      },
    ],
  },
];

export function getLocalSeoPageBySlug(slug: string) {
  return localSeoPages.find((page) => page.slug === slug);
}
