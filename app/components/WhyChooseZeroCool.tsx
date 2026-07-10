const reasons = [
  "Building computers since age 12",
  "Computer and laptop repair for everyday problems",
  "Friendly help for people who are not tech experts",
  "Fast support for slow computers, virus issues, and Wi-Fi problems",
  "Honest recommendations and fair pricing",
  "Clear communication with no confusing tech language",
  "Local Rhode Island service with remote support available",
  "Free estimates for homes and small businesses",
  "Business owner support for websites, apps, SEO, and automation",
];

export default function WhyChooseZeroCool() {
  return (
    <section className="glass-panel rounded-3xl p-6 md:p-8" id="why-choose">
      <h2 className="section-title">Why People Choose ZeroCool</h2>
      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {reasons.map((reason) => (
          <div key={reason} className="proof-chip">
            {reason}
          </div>
        ))}
      </div>
    </section>
  );
}
