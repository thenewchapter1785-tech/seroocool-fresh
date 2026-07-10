const badges = [
  "Fast Replies",
  "Plain-English Support",
  "Local Rhode Island Service",
  "Remote Support Available",
  "Your Info Stays Private",
  "Free Estimates",
];

export default function TrustBadges() {
  return (
    <div className="mt-4 flex flex-wrap gap-2" aria-label="Trust badges">
      {badges.map((badge) => (
        <span key={badge} className="stack-chip">
          {badge}
        </span>
      ))}
    </div>
  );
}
