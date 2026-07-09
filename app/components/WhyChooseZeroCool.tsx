const reasons = [
  "One partner for repair, software, automation, and growth",
  "Clear recommendations without technical jargon",
  "Lead-generation mindset on every web and marketing decision",
  "Security-aware implementation across API and infrastructure",
  "Flexible support from urgent incidents to long-term plans",
  "Fast. Honest. Affordable.",
];

export default function WhyChooseZeroCool() {
  return (
    <section className="glass-panel rounded-3xl p-6 md:p-8" id="why-choose">
      <h2 className="section-title">Why Customers Choose ZeroCool</h2>
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
