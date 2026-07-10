const platforms = [
  "Windows",
  "macOS",
  "iOS",
  "Android",
  "HubSpot",
  "Google Workspace",
  "Microsoft 365",
  "Cloudflare",
  "DigitalOcean",
  "WordPress",
  "Next.js",
  "OpenAI API",
];

export default function PlatformsSupported() {
  return (
    <section className="glass-panel rounded-3xl p-6 md:p-8" id="platforms">
      <h2 className="section-title">Devices and Tools We Work With</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {platforms.map((platform) => (
          <span key={platform} className="stack-chip">
            {platform}
          </span>
        ))}
      </div>
    </section>
  );
}
