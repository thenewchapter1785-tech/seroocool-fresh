type Review = {
  quote: string;
  author: string;
  city: string;
  rating: number;
  placeholder: boolean;
};

const customerStories: Review[] = [
  {
    quote:
      "My laptop was freezing every day. ZeroCool fixed it fast and explained what happened in simple words.",
    author: "Placeholder Home Customer",
    city: "Rhode Island, RI",
    rating: 5,
    placeholder: true,
  },
  {
    quote:
      "We called for computer support, then had ZeroCool rebuild our website. We now get steady calls from real customers.",
    author: "Placeholder Business Customer",
    city: "Rhode Island, RI",
    rating: 5,
    placeholder: true,
  },
  {
    quote:
      "I finally found someone I can trust with my tech. No pressure, no confusing language, just real help.",
    author: "Placeholder Returning Customer",
    city: "Rhode Island, RI",
    rating: 5,
    placeholder: true,
  },
];

export default function ReviewsSection() {
  return (
    <section className="reviews-band rounded-3xl p-6 md:p-8" id="reviews">
      <h2 className="reviews-title">What Our Customers Say</h2>
      <p className="reviews-stars" aria-label="Five star rating">
        ★★★★★
      </p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {customerStories.map((review) => (
          <article key={review.quote} className="testimonial-card">
            <p className="testimonial-quote-mark" aria-hidden="true">
              “
            </p>
            <p className="testimonial-quote">{review.quote}</p>
            <p className="testimonial-author">{review.author}</p>
            <p className="testimonial-location">{review.city}</p>
            <p className="testimonial-rating" aria-label={`${review.rating} star rating`}>
              {"★".repeat(review.rating)}
            </p>
            {review.placeholder ? (
              <p className="response-note mt-2">Placeholder testimonial pending verified import.</p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
