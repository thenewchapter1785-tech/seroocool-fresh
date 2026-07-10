export type LocationPage = {
  slug: string;
  locationName: string;
  regionLabel: string;
  description: string;
  intro: string;
  neighborhoods: string[];
  topServices: string[];
  painPoints: string[];
  whyUs: string[];
};

export const locationPages: LocationPage[] = [
  {
    slug: "narragansett",
    locationName: "Narragansett",
    regionLabel: "South County",
    description:
      "Computer repair and tech support for Narragansett homes, local shops, and service businesses.",
    intro:
      "In Narragansett, we fix everyday tech problems fast, from broken computers to business websites that need more calls.",
    neighborhoods: ["Point Judith", "Bonnet Shores", "Galilee"],
    topServices: ["Computer Repair", "Wi-Fi Setup", "Website Development", "SEO Optimization"],
    painPoints: ["Seasonal traffic spikes", "Unstable home Wi-Fi", "Outdated business websites"],
    whyUs: ["Fast response", "Plain-language support", "Local + remote coverage"],
  },
  {
    slug: "south-kingstown",
    locationName: "South Kingstown",
    regionLabel: "South County",
    description:
      "Tech support for homes and businesses in South Kingstown, with clear help and dependable follow-through.",
    intro:
      "South Kingstown clients often need both day-to-day tech help and better business systems. We handle both in one team.",
    neighborhoods: ["Kingston", "Matunuck", "Peace Dale"],
    topServices: ["Network Troubleshooting", "Business Software", "AI Automation", "CRM Setup"],
    painPoints: ["Disconnected tools", "Slow support response", "Manual admin workflows"],
    whyUs: ["Hands-on troubleshooting", "Smart automation setup", "Clear business results"],
  },
  {
    slug: "wakefield",
    locationName: "Wakefield",
    regionLabel: "South Kingstown",
    description:
      "Wakefield computer repair, tech support, and business tech services for households and small businesses.",
    intro:
      "Wakefield families and businesses trust us for practical help that solves problems without wasting time.",
    neighborhoods: ["Downtown Wakefield", "Tuckertown", "Wakefield Center"],
    topServices: ["Remote Tech Support", "Computer Diagnostics", "Website Design", "Monthly Website Care"],
    painPoints: ["Aging devices", "Inconsistent website leads", "Security concerns"],
    whyUs: ["Honest pricing", "Simple explanations", "Ongoing support options"],
  },
  {
    slug: "north-kingstown",
    locationName: "North Kingstown",
    regionLabel: "Rhode Island",
    description:
      "North Kingstown tech support for home users and businesses that want fewer tech headaches.",
    intro:
      "From device repair to website hosting and security, we help North Kingstown clients upgrade without confusion.",
    neighborhoods: ["Wickford", "Quidnessett", "Saunderstown"],
    topServices: ["Website Hosting Setup", "DigitalOcean Deployment", "Business Automation", "Managed IT"],
    painPoints: ["Legacy systems", "Poor uptime", "Slow lead follow-up"],
    whyUs: ["Secure setup", "Automation where it helps", "Reliable support"],
  },
  {
    slug: "warwick",
    locationName: "Warwick",
    regionLabel: "Rhode Island",
    description:
      "Warwick technology services for repairs, websites, local SEO, and recurring support plans.",
    intro:
      "Warwick clients count on us for urgent fixes and long-term support that helps their business grow.",
    neighborhoods: ["Apponaug", "Cowesett", "Conimicut"],
    topServices: ["Phone Troubleshooting", "Virus Removal", "SEO Optimization", "Business Technology Consulting"],
    painPoints: ["Frequent malware incidents", "Low search visibility", "Limited in-house IT"],
    whyUs: ["Fast response", "Strong security habits", "Local growth support"],
  },
  {
    slug: "newport",
    locationName: "Newport",
    regionLabel: "Aquidneck Island",
    description:
      "Trusted tech support for Newport professionals, service companies, and local organizations.",
    intro:
      "Newport businesses need reliable systems during busy seasons. We keep tech running so you can focus on customers.",
    neighborhoods: ["Downtown Newport", "Fifth Ward", "The Point"],
    topServices: ["E-commerce Websites", "CRM Integration", "AI Automation", "Priority Support"],
    painPoints: ["Seasonal demand spikes", "Lead response gaps", "Platform integration issues"],
    whyUs: ["Business-focused advice", "Websites that bring leads", "Ongoing improvements"],
  },
  {
    slug: "providence",
    locationName: "Providence",
    regionLabel: "Rhode Island",
    description:
      "Computer support and business tech help for Providence startups, agencies, and local businesses.",
    intro:
      "Providence teams use us for fast help with software, automation, websites, and support systems.",
    neighborhoods: ["Federal Hill", "East Side", "Downtown"],
    topServices: ["Custom Web Applications", "Mobile App Development", "HubSpot Setup", "Monthly SEO"],
    painPoints: ["Disconnected tools", "Slow launches", "Unclear website results"],
    whyUs: ["One team for setup and support", "Experienced problem-solving", "Focus on real outcomes"],
  },
  {
    slug: "east-greenwich",
    locationName: "East Greenwich",
    regionLabel: "Rhode Island",
    description:
      "East Greenwich tech support for households and local businesses that want reliable service.",
    intro:
      "In East Greenwich, we provide dependable help with a focus on reliability and clear communication.",
    neighborhoods: ["Hill and Harbor", "Frenchtown", "Crompton"],
    topServices: ["Home Office Setup", "Data Backup & Recovery", "Website Development", "Monthly Website Care"],
    painPoints: ["Remote work instability", "Data risk", "Outdated marketing websites"],
    whyUs: ["Preventive planning", "Friendly support", "Clear guidance"],
  },
  {
    slug: "rhode-island",
    locationName: "Rhode Island",
    regionLabel: "Statewide",
    description:
      "Statewide Rhode Island technology services for individuals and small businesses that want fast, honest, affordable support.",
    intro:
      "ZeroCool Development serves clients across Rhode Island with remote and on-site options for repair, support, websites, software, and automation.",
    neighborhoods: ["South County", "Providence County", "Kent County"],
    topServices: ["Computer Repair", "Website Development", "AI Automation", "Managed IT"],
    painPoints: ["Limited in-house support", "Slow business growth online", "Recurring downtime"],
    whyUs: ["Wide service coverage", "Simple communication", "Trusted local reputation"],
  },
];

export function getLocationBySlug(slug: string) {
  return locationPages.find((location) => location.slug === slug);
}
