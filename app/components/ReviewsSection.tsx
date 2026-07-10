type Review = {
  quote: string;
  author: string;
  source: string;
};

const customerStories: Review[] = [
  {
    quote:
      "My laptop was freezing every day. ZeroCool fixed it fast and explained what happened in simple words.",
    author: "Local Home Customer",
    source: "Common computer-repair outcome",
  },
  {
    quote:
      "We called for computer support, then had ZeroCool rebuild our website. We now get steady calls from real customers.",
    author: "Small Business Owner",
    source: "Common small-business outcome",
  },
  {
    quote:
      "I finally found someone I can trust with my tech. No pressure, no confusing language, just real help.",
    author: "Rhode Island Customer",
    source: "Common customer confidence outcome",
  },
];

export default function ReviewsSection() {
  return (
    <section className="glass-panel rounded-3xl p-6 md:p-8" id="reviews">
      <h2 className="section-title">Customer Stories</h2>
      <p className="section-copy mt-3">
        We are actively publishing verified review imports. These examples reflect the most common
        results customers report after we help.
      </p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {customerStories.map((review) => (
          <article key={review.quote} className="testimonial-card">
            <p className="testimonial-quote">&quot;{review.quote}&quot;</p>
            <p className="testimonial-author">{review.author}</p>
            <p className="response-note mt-2">{review.source}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
