const badges = [
  "Fast Response",
  "Beginner-Friendly Support",
  "Local Rhode Island Coverage",
  "Remote Support Available",
  "Secure Lead Handling",
  "Free Estimate Focused",
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
