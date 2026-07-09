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
      "Technology support and business digital services for Narragansett homes, local shops, and service businesses.",
    intro:
      "In Narragansett, we help residents and business owners solve technology issues quickly, from broken computers to lead-focused websites.",
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
      "Business and home technology services tailored for South Kingstown clients who need reliable support and measurable results.",
    intro:
      "South Kingstown clients often need a mix of day-to-day tech support and long-term growth strategy. We provide both in one team.",
    neighborhoods: ["Kingston", "Matunuck", "Peace Dale"],
    topServices: ["Network Troubleshooting", "Business Software", "AI Automation", "CRM Setup"],
    painPoints: ["Disconnected tools", "Slow support response", "Manual admin workflows"],
    whyUs: ["Hands-on diagnostics", "Strong automation background", "Conversion-focused execution"],
  },
  {
    slug: "wakefield",
    locationName: "Wakefield",
    regionLabel: "South Kingstown",
    description:
      "Wakefield technology consulting, repairs, and digital growth services for households and small businesses.",
    intro:
      "Wakefield businesses and households trust practical support that does not waste time. Our process focuses on quick wins and clean implementation.",
    neighborhoods: ["Downtown Wakefield", "Tuckertown", "Wakefield Center"],
    topServices: ["Remote Tech Support", "Computer Diagnostics", "Website Design", "Monthly Website Care"],
    painPoints: ["Aging devices", "Inconsistent website leads", "Security concerns"],
    whyUs: ["Honest pricing", "Clear communication", "Long-term maintenance options"],
  },
  {
    slug: "north-kingstown",
    locationName: "North Kingstown",
    regionLabel: "Rhode Island",
    description:
      "North Kingstown tech support and digital transformation services for growth-focused companies and home users.",
    intro:
      "From device repair to scalable cloud systems, we help North Kingstown clients modernize without adding complexity.",
    neighborhoods: ["Wickford", "Quidnessett", "Saunderstown"],
    topServices: ["Cloud Infrastructure", "DigitalOcean Deployment", "Business Automation", "Managed IT"],
    painPoints: ["Legacy systems", "Poor uptime", "Slow lead follow-up"],
    whyUs: ["Secure architecture", "Automation-first approach", "Reliable support model"],
  },
  {
    slug: "warwick",
    locationName: "Warwick",
    regionLabel: "Rhode Island",
    description:
      "Warwick technology services for repairs, websites, local SEO, and recurring support plans.",
    intro:
      "Warwick clients rely on us for both urgent fixes and long-term digital growth planning tied to real business outcomes.",
    neighborhoods: ["Apponaug", "Cowesett", "Conimicut"],
    topServices: ["Phone Troubleshooting", "Virus Removal", "SEO Optimization", "Business Technology Consulting"],
    painPoints: ["Frequent malware incidents", "Low search visibility", "Limited in-house IT"],
    whyUs: ["Response speed", "Proactive security", "Growth marketing support"],
  },
  {
    slug: "newport",
    locationName: "Newport",
    regionLabel: "Aquidneck Island",
    description:
      "Premium technology support for Newport professionals, service companies, and local organizations.",
    intro:
      "Newport businesses need reliable digital systems during peak seasons. We build resilient tech operations that support revenue.",
    neighborhoods: ["Downtown Newport", "Fifth Ward", "The Point"],
    topServices: ["E-commerce Websites", "CRM Integration", "AI Automation", "Priority Support"],
    painPoints: ["Seasonal demand spikes", "Lead response gaps", "Platform integration issues"],
    whyUs: ["Business-minded strategy", "Conversion-led web builds", "Ongoing optimization"],
  },
  {
    slug: "providence",
    locationName: "Providence",
    regionLabel: "Rhode Island",
    description:
      "Full-service technology and growth support for Providence startups, agencies, and local businesses.",
    intro:
      "Providence teams use us for rapid execution across software, automation, websites, and support infrastructure.",
    neighborhoods: ["Federal Hill", "East Side", "Downtown"],
    topServices: ["Custom Web Applications", "Mobile App Development", "HubSpot Setup", "Monthly SEO"],
    painPoints: ["Fragmented systems", "Slow launch cycles", "Unclear conversion metrics"],
    whyUs: ["End-to-end delivery", "Senior technical depth", "Revenue-focused strategy"],
  },
  {
    slug: "east-greenwich",
    locationName: "East Greenwich",
    regionLabel: "Rhode Island",
    description:
      "East Greenwich technology support for modern households and local businesses seeking premium service.",
    intro:
      "In East Greenwich, we provide dependable tech help with an emphasis on long-term reliability and customer experience.",
    neighborhoods: ["Hill and Harbor", "Frenchtown", "Crompton"],
    topServices: ["Home Office Setup", "Data Backup & Recovery", "Website Development", "Monthly Website Care"],
    painPoints: ["Remote work instability", "Data risk", "Outdated marketing websites"],
    whyUs: ["Preventive planning", "Friendly support", "Clear strategic guidance"],
  },
  {
    slug: "rhode-island",
    locationName: "Rhode Island",
    regionLabel: "Statewide",
    description:
      "Statewide Rhode Island technology services for individuals and small businesses that want fast, honest, affordable support.",
    intro:
      "ZeroCool Development serves clients across Rhode Island with remote and on-site options for repair, support, websites, software, and AI.",
    neighborhoods: ["South County", "Providence County", "Kent County"],
    topServices: ["Computer Repair", "Website Development", "AI Automation", "Managed IT"],
    painPoints: ["Limited in-house support", "Slow digital growth", "Recurring technical downtime"],
    whyUs: ["Full-service coverage", "Lead-generation expertise", "Trusted local reputation"],
  },
];

export function getLocationBySlug(slug: string) {
  return locationPages.find((location) => location.slug === slug);
}
