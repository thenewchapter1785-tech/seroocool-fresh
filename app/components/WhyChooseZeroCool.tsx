import Image from "next/image";

const reasons = [
  "Honest recommendations",
  "Fair, upfront pricing",
  "Fast response times",
  "Clear communication",
  "Local Rhode Island service",
  "Remote support available",
  "Free estimates",
  "Help for homes and businesses",
];

export default function WhyChooseZeroCool() {
  return (
    <section className="why-section rounded-3xl p-6 md:p-8" id="why-choose">
      <div className="why-section-grid">
        <div className="why-image-wrap">
          <Image
            src="/reference/zerocool-homepage-reference.png"
            alt="Technician working on a computer repair bench"
            width={960}
            height={640}
            className="why-image"
          />
        </div>

        <div>
          <h2 className="why-title">Why Choose ZeroCool Development?</h2>
          <p className="why-copy mt-4">
            I&apos;ve been building computers since I was 12 years old. Technology isn&apos;t just my
            job. It&apos;s what I love. Whether you&apos;re a homeowner who just needs a laptop fixed or a
            business looking for a professional website, you&apos;ll get honest advice, affordable
            pricing, and work done right.
          </p>
          <div className="why-benefits-grid mt-5">
            {reasons.map((reason) => (
              <p key={reason} className="why-benefit-item">
                <span className="why-check" aria-hidden="true">
                  <svg viewBox="0 0 24 24" className="why-check-icon">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M7 12.5l3 3 7-7" />
                  </svg>
                </span>
                <span>{reason}</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
