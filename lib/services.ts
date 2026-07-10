export type ServiceCategory = "home" | "business";

export type ServiceItem = {
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  category: ServiceCategory;
  keywords: string[];
};

export const serviceCatalog: ServiceItem[] = [
  {
    slug: "computer-repair",
    name: "Computer Repair",
    shortDescription: "Fix slow or broken desktop computers quickly and affordably.",
    fullDescription:
      "Professional computer repair for hardware and software issues, with clear explanations and honest recommendations.",
    category: "home",
    keywords: ["computer repair Rhode Island", "computer repair near me", "technical support"],
  },
  {
    slug: "laptop-repair",
    name: "Laptop Repair",
    shortDescription: "Troubleshoot laptops that won't boot, charge, or perform normally.",
    fullDescription:
      "Laptop diagnostics and repair services for overheating, battery issues, startup problems, and performance bottlenecks.",
    category: "home",
    keywords: ["laptop repair", "pc diagnostics", "pc troubleshooting"],
  },
  {
    slug: "phone-troubleshooting",
    name: "Phone Troubleshooting",
    shortDescription: "Solve freezing, app crashes, and connectivity issues on phones.",
    fullDescription:
      "Beginner-friendly phone troubleshooting for common issues like freezing, syncing problems, and unstable apps.",
    category: "home",
    keywords: ["phone troubleshooting", "remote tech support"],
  },
  {
    slug: "computer-diagnostics",
    name: "Computer Diagnostics",
    shortDescription: "Find root causes before spending money on unnecessary repairs.",
    fullDescription:
      "Comprehensive PC diagnostics to identify hardware, software, and network issues before repair decisions are made.",
    category: "home",
    keywords: ["pc diagnostics", "pc troubleshooting", "technology consultant"],
  },
  {
    slug: "pc-troubleshooting",
    name: "PC Troubleshooting",
    shortDescription: "Diagnose and resolve everyday PC problems with practical fixes.",
    fullDescription:
      "Hands-on PC troubleshooting for crashes, slow performance, startup errors, and reliability problems.",
    category: "home",
    keywords: ["pc troubleshooting", "computer repair near me"],
  },
  {
    slug: "virus-malware-removal",
    name: "Virus & Malware Removal",
    shortDescription: "Clean infected computers and restore secure performance.",
    fullDescription:
      "Safe virus and malware removal with post-cleanup hardening to reduce future infections.",
    category: "home",
    keywords: ["virus removal", "technical support"],
  },
  {
    slug: "computer-upgrades",
    name: "Computer Upgrades",
    shortDescription: "Upgrade storage, memory, and hardware for better speed.",
    fullDescription:
      "Upgrade existing computers to run faster and last longer without replacing your entire setup.",
    category: "home",
    keywords: ["computer upgrades", "managed IT"],
  },
  {
    slug: "gaming-pc-builds",
    name: "Gaming PC Builds",
    shortDescription: "Custom gaming PC builds tuned for performance and budget.",
    fullDescription:
      "Build and optimize gaming PCs with transparent parts guidance, thermal planning, and upgrade paths.",
    category: "home",
    keywords: ["custom gaming PCs", "custom PCs"],
  },
  {
    slug: "custom-pcs",
    name: "Custom PCs",
    shortDescription: "Tailored computer builds for gaming, school, and work.",
    fullDescription:
      "Custom PC solutions designed around your exact needs, budget, and long-term reliability goals.",
    category: "home",
    keywords: ["custom PCs", "computer upgrades"],
  },
  {
    slug: "data-backup-recovery",
    name: "Data Backup & Recovery",
    shortDescription: "Protect important files and recover data when possible.",
    fullDescription:
      "Data backup strategy and recovery support for accidental deletion, hardware failure, or migration projects.",
    category: "home",
    keywords: ["technical support", "remote tech support"],
  },
  {
    slug: "email-setup",
    name: "Email Setup",
    shortDescription: "Set up secure email accounts on devices and business platforms.",
    fullDescription:
      "Email setup and troubleshooting for personal and business users with practical, easy-to-follow support.",
    category: "home",
    keywords: ["technical support", "small business IT"],
  },
  {
    slug: "software-installation",
    name: "Software Installation",
    shortDescription: "Install and configure software the right way the first time.",
    fullDescription:
      "Software installation and configuration for productivity tools, security apps, and business systems.",
    category: "home",
    keywords: ["technical support", "managed IT"],
  },
  {
    slug: "printer-setup",
    name: "Printer Setup",
    shortDescription: "Fix printer setup, drivers, and printing connection issues.",
    fullDescription:
      "Printer setup and troubleshooting for home offices and small businesses, including network printing.",
    category: "home",
    keywords: ["technical support", "network troubleshooting"],
  },
  {
    slug: "wifi-setup",
    name: "Wi-Fi Setup",
    shortDescription: "Improve home and office Wi-Fi reliability and coverage.",
    fullDescription:
      "Wi-Fi setup, optimization, and troubleshooting to improve speed, stability, and device connectivity.",
    category: "home",
    keywords: ["network troubleshooting", "remote tech support"],
  },
  {
    slug: "network-troubleshooting",
    name: "Network Troubleshooting",
    shortDescription: "Resolve unstable internet and device connection problems.",
    fullDescription:
      "Network troubleshooting for routers, office networks, and recurring connectivity failures.",
    category: "home",
    keywords: ["network troubleshooting", "managed IT"],
  },
  {
    slug: "home-office-setup",
    name: "Home Office Setup",
    shortDescription: "Set up dependable remote work environments and equipment.",
    fullDescription:
      "Complete home office setup covering connectivity, hardware, software, and secure workflow basics.",
    category: "home",
    keywords: ["remote tech support", "small business IT"],
  },
  {
    slug: "technology-consulting",
    name: "Technology Consulting",
    shortDescription: "Get plain-English advice before spending on tech upgrades.",
    fullDescription:
      "Technology consulting for individuals and businesses who want clear recommendations without jargon.",
    category: "home",
    keywords: ["technology consultant", "technical support"],
  },
  {
    slug: "remote-tech-support",
    name: "Remote Tech Support",
    shortDescription: "Fast remote support for everyday tech issues.",
    fullDescription:
      "Remote tech support for software, device, and account issues with flexible scheduling and clear communication.",
    category: "home",
    keywords: ["remote tech support", "computer repair near me"],
  },
  {
    slug: "website-design",
    name: "Website Design",
    shortDescription: "Professional website design built for trust and conversion.",
    fullDescription:
      "Website design services focused on brand clarity, usability, and conversion outcomes.",
    category: "business",
    keywords: ["website development Rhode Island", "SEO services"],
  },
  {
    slug: "website-development",
    name: "Website Development",
    shortDescription: "High-performance website development for businesses.",
    fullDescription:
      "Custom website development with fast performance, mobile optimization, and lead capture integration.",
    category: "business",
    keywords: ["website development Rhode Island", "small business IT"],
  },
  {
    slug: "ecommerce-websites",
    name: "E-commerce Websites",
    shortDescription: "Sell online with secure, conversion-ready storefronts.",
    fullDescription:
      "E-commerce website development with product flows, checkout optimization, and scalable operations.",
    category: "business",
    keywords: ["website development Rhode Island", "business software"],
  },
  {
    slug: "custom-web-applications",
    name: "Custom Web Applications",
    shortDescription: "Build internal tools and customer-facing web apps.",
    fullDescription:
      "Custom web applications tailored to your operations, customer workflows, and long-term growth plans.",
    category: "business",
    keywords: ["business software", "mobile app development"],
  },
  {
    slug: "mobile-app-development",
    name: "Mobile App Development",
    shortDescription: "Mobile app development for startups and small businesses.",
    fullDescription:
      "Mobile app planning and development with API integrations, user onboarding, and maintainable architecture.",
    category: "business",
    keywords: ["mobile app development", "business software"],
  },
  {
    slug: "custom-business-software",
    name: "Custom Business Software",
    shortDescription: "Software solutions built around your business process.",
    fullDescription:
      "Custom business software to replace manual processes and improve visibility across your team.",
    category: "business",
    keywords: ["business software", "small business IT"],
  },
  {
    slug: "crm-integration",
    name: "CRM Integration",
    shortDescription: "Connect your CRM to forms, pipelines, and operations.",
    fullDescription:
      "CRM integration services that improve lead routing, follow-up speed, and customer visibility.",
    category: "business",
    keywords: ["HubSpot CRM", "managed IT"],
  },
  {
    slug: "hubspot-setup",
    name: "HubSpot Setup",
    shortDescription: "Configure HubSpot for lead tracking and automation.",
    fullDescription:
      "HubSpot setup and optimization for contact lifecycle tracking, automation workflows, and sales readiness.",
    category: "business",
    keywords: ["HubSpot CRM", "small business IT"],
  },
  {
    slug: "business-automation",
    name: "Business Automation",
    shortDescription: "Automate repetitive processes to save time and cost.",
    fullDescription:
      "Business automation strategy and implementation to streamline admin, operations, and client delivery.",
    category: "business",
    keywords: ["business automation", "managed IT"],
  },
  {
    slug: "ai-automation",
    name: "AI Automation",
    shortDescription: "Use AI to automate communication and repetitive tasks.",
    fullDescription:
      "AI automation solutions for lead qualification, response workflows, and operational acceleration.",
    category: "business",
    keywords: ["AI automation", "OpenAI integration"],
  },
  {
    slug: "openai-integration",
    name: "OpenAI Integration",
    shortDescription: "Integrate OpenAI securely into your apps and workflows.",
    fullDescription:
      "Secure OpenAI integration for customer support, internal tools, and business process augmentation.",
    category: "business",
    keywords: ["OpenAI integration", "AI automation"],
  },
  {
    slug: "cloud-infrastructure",
    name: "Website Hosting Setup",
    shortDescription: "Set up dependable hosting for websites and apps.",
    fullDescription:
      "Hosting setup focused on uptime, security, backups, and easy day-to-day management.",
    category: "business",
    keywords: ["managed IT", "small business IT"],
  },
  {
    slug: "cloudflare-security",
    name: "Cloudflare Security",
    shortDescription: "Harden website security and performance at the edge.",
    fullDescription:
      "Cloudflare security setup covering DNS, TLS, WAF, and traffic protection for business sites.",
    category: "business",
    keywords: ["Cloudflare security", "managed IT"],
  },
  {
    slug: "digitalocean-deployment",
    name: "DigitalOcean Deployment",
    shortDescription: "Reliable deployments on DigitalOcean App Platform.",
    fullDescription:
      "DigitalOcean deployment setup with secure environment configuration and production verification.",
    category: "business",
    keywords: ["DigitalOcean deployment", "managed IT"],
  },
  {
    slug: "seo-optimization",
    name: "SEO Optimization",
    shortDescription: "Improve rankings and qualified traffic with practical SEO.",
    fullDescription:
      "SEO optimization services for technical structure, metadata, content alignment, and local visibility.",
    category: "business",
    keywords: ["SEO services", "website development Rhode Island"],
  },
  {
    slug: "business-technology-consulting",
    name: "Business Technology Consulting",
    shortDescription: "Strategic guidance for technology decisions and growth.",
    fullDescription:
      "Business technology consulting to prioritize investments, reduce technical risk, and improve operational outcomes.",
    category: "business",
    keywords: ["technology consultant", "small business IT"],
  },
];

export const primaryServices = serviceCatalog.filter((item) => item.category === "home");
export const businessServices = serviceCatalog.filter((item) => item.category === "business");
