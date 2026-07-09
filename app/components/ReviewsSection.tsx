type Review = {
  quote: string;
  author: string;
  source: string;
};

const placeholderReviews: Review[] = [
  {
    quote:
      "Editable placeholder review: ZeroCool responded quickly and explained everything clearly.",
    author: "Placeholder Customer",
    source: "Google Review Placeholder",
  },
  {
    quote:
      "Editable placeholder review: Our website now generates more qualified consultations.",
    author: "Placeholder Business Owner",
    source: "Facebook Review Placeholder",
  },
  {
    quote:
      "Editable placeholder review: Great support experience and honest recommendations.",
    author: "Placeholder Home Client",
    source: "Direct Testimonial Placeholder",
  },
];

export default function ReviewsSection() {
  return (
    <section className="glass-panel rounded-3xl p-6 md:p-8" id="reviews">
      <h2 className="section-title">Customer Reviews</h2>
      <p className="section-copy mt-3">
        Replace these editable placeholders with verified customer feedback from Google and
        Facebook.
      </p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {placeholderReviews.map((review) => (
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
