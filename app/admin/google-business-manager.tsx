"use client";

import { useEffect, useMemo, useState } from "react";

type GoogleBusinessManagerProps = {
  adminCode: string;
};

type BusinessAccount = {
  name?: string;
  accountName?: string;
  type?: string;
};

type BusinessLocation = {
  name?: string;
  title?: string;
  websiteUri?: string;
  phoneNumbers?: {
    primaryPhone?: string;
  };
  profile?: {
    description?: string;
  };
  primaryCategory?: {
    displayName?: string;
  };
  storefrontAddress?: {
    addressLines?: string[];
    locality?: string;
    administrativeArea?: string;
    postalCode?: string;
  };
  serviceArea?: {
    places?: Array<{
      placeInfo?: {
        placeName?: string;
      };
    }>;
  };
  serviceAreaBusiness?: {
    places?: Array<{
      placeInfo?: {
        placeName?: string;
      };
    }>;
  };
  regularHours?: {
    periods?: HoursPeriod[];
  };
};

type ReviewReply = {
  comment?: string;
  updateTime?: string;
};

type BusinessReview = {
  reviewId?: string;
  reviewer?: {
    displayName?: string;
  };
  starRating?: string;
  comment?: string;
  createTime?: string;
  reviewReply?: ReviewReply;
};

type HoursPeriod = {
  openDay: string;
  openTime: string;
  closeDay: string;
  closeTime: string;
};

const dayOptions = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const postTopicOptions = [
  "Computer repair",
  "Laptop repair",
  "Virus removal",
  "Website development",
  "AI automation",
  "Free estimate offer",
  "Tech support",
];

const defaultHours: HoursPeriod[] = dayOptions.slice(0, 5).map((day) => ({
  openDay: day,
  openTime: "0900",
  closeDay: day,
  closeTime: "1700",
}));

function normalizePeriods(location: BusinessLocation | null) {
  const periods = location?.regularHours?.periods ?? [];

  if (!periods.length) {
    return defaultHours;
  }

  return periods.map((period) => ({
    openDay: period.openDay,
    openTime: period.openTime,
    closeDay: period.closeDay,
    closeTime: period.closeTime,
  }));
}

function formatAddress(location: BusinessLocation | null) {
  if (!location) {
    return "Not available";
  }

  const address = location.storefrontAddress;
  if (address) {
    const lines = [
      ...(address.addressLines ?? []),
      [address.locality, address.administrativeArea, address.postalCode]
        .filter(Boolean)
        .join(" "),
    ].filter(Boolean);

    if (lines.length) {
      return lines.join(", ");
    }
  }

  const servicePlaces =
    location.serviceAreaBusiness?.places ?? location.serviceArea?.places ?? [];

  if (servicePlaces.length) {
    return servicePlaces
      .map((place) => place.placeInfo?.placeName)
      .filter(Boolean)
      .join(", ");
  }

  return "Not available";
}

function formatStarRating(value: string | undefined) {
  const normalized = Number.parseInt((value ?? "").replace(/[^0-9]/g, ""), 10);

  if (!Number.isFinite(normalized) || normalized <= 0) {
    return "Unrated";
  }

  return `${normalized}/5`;
}

export default function GoogleBusinessManager({ adminCode }: GoogleBusinessManagerProps) {
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");
  const [statusText, setStatusText] = useState("");

  const [accounts, setAccounts] = useState<BusinessAccount[]>([]);
  const [locations, setLocations] = useState<BusinessLocation[]>([]);
  const [location, setLocation] = useState<BusinessLocation | null>(null);
  const [reviews, setReviews] = useState<BusinessReview[]>([]);

  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [servicesTextSuggestions, setServicesTextSuggestions] = useState("");
  const [hoursRows, setHoursRows] = useState<HoursPeriod[]>(defaultHours);

  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [postTopic, setPostTopic] = useState(postTopicOptions[0]);
  const [postCallToAction, setPostCallToAction] = useState(
    "Get a free estimate at https://zerocool-development.com/free-consultation"
  );
  const [postDraft, setPostDraft] = useState("");

  const locationName = location?.name ?? "";

  async function adminFetch(path: string, init?: RequestInit) {
    const response = await fetch(path, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "x-admin-code": adminCode,
        ...(init?.headers ?? {}),
      },
    });

    const body = (await response.json().catch(() => null)) as
      | {
          ok?: boolean;
          error?: string;
          [key: string]: unknown;
        }
      | null;

    if (!response.ok || !body?.ok) {
      throw new Error(body?.error ?? "Admin API request failed");
    }

    return body;
  }

  async function loadDashboard() {
    setLoading(true);
    setErrorText("");

    try {
      const accountsData = await adminFetch("/api/admin/google-business/accounts");
      const nextAccounts = (accountsData.accounts as BusinessAccount[] | undefined) ?? [];
      setAccounts(nextAccounts);

      const preferredAccountName = nextAccounts[0]?.name ?? "";
      const locationsPath = preferredAccountName
        ? `/api/admin/google-business/locations?accountName=${encodeURIComponent(preferredAccountName)}`
        : "/api/admin/google-business/locations";

      const locationsData = await adminFetch(locationsPath);
      const nextLocations = (locationsData.locations as BusinessLocation[] | undefined) ?? [];
      setLocations(nextLocations);

      const preferredLocationName = nextLocations[0]?.name;
      const locationPath = preferredLocationName
        ? `/api/admin/google-business/location?locationName=${encodeURIComponent(preferredLocationName)}`
        : "/api/admin/google-business/location";

      const locationData = await adminFetch(locationPath);
      const nextLocation = (locationData.location as BusinessLocation | undefined) ?? null;
      setLocation(nextLocation);
      setDescription(nextLocation?.profile?.description ?? "");
      setWebsiteUrl(nextLocation?.websiteUri ?? "");
      setPhoneNumber(nextLocation?.phoneNumbers?.primaryPhone ?? "");
      setHoursRows(normalizePeriods(nextLocation));

      const reviewsPath = preferredLocationName
        ? `/api/admin/google-business/reviews?locationName=${encodeURIComponent(preferredLocationName)}`
        : "/api/admin/google-business/reviews";
      const reviewsData = await adminFetch(reviewsPath);
      const nextReviews = (reviewsData.reviews as BusinessReview[] | undefined) ?? [];
      setReviews(nextReviews);
      setStatusText("Google Business Profile connected.");
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Failed to load Google Business data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Initial dashboard hydration is intentionally one-time on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unansweredReviews = useMemo(
    () => reviews.filter((review) => !review.reviewReply?.comment),
    [reviews]
  );

  const seoSuggestions = useMemo(() => {
    const suggestions: string[] = [];

    if (!description.trim()) {
      suggestions.push("Add a fuller business description with local keywords and service value.");
    }

    if (!websiteUrl.trim()) {
      suggestions.push("Set your canonical website URL to boost local trust signals.");
    }

    if (!phoneNumber.trim()) {
      suggestions.push("Add a direct business phone number for click-to-call conversions.");
    }

    if (!hoursRows.length) {
      suggestions.push("Set regular business hours to improve local map visibility.");
    }

    if (unansweredReviews.length > 0) {
      suggestions.push("Reply to unanswered reviews to improve engagement and local ranking trust.");
    }

    if (!suggestions.length) {
      suggestions.push("Profile looks healthy. Publish a new local post this week to stay active.");
    }

    return suggestions;
  }, [description, websiteUrl, phoneNumber, hoursRows, unansweredReviews.length]);

  async function saveProfileUpdates(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusText("Saving profile updates...");
    setErrorText("");

    try {
      const body = {
        locationName,
        description,
        websiteUrl,
        phoneNumber,
        businessHours: hoursRows,
        servicesTextSuggestions,
      };

      const response = await adminFetch("/api/admin/google-business/location", {
        method: "PATCH",
        body: JSON.stringify(body),
      });

      const nextLocation = (response.location as BusinessLocation | undefined) ?? null;
      setLocation(nextLocation);
      setStatusText("Google Business profile updated successfully.");
    } catch (error) {
      setErrorText(
        error instanceof Error ? error.message : "Unable to save Google Business profile updates."
      );
      setStatusText("");
    }
  }

  async function generateReviewDraft(review: BusinessReview) {
    const reviewId = review.reviewId ?? "";

    if (!reviewId) {
      return;
    }

    setStatusText("Generating review reply draft...");
    setErrorText("");

    try {
      const response = await adminFetch("/api/admin/google-business/reviews/reply", {
        method: "POST",
        body: JSON.stringify({
          action: "generate",
          locationName,
          reviewId,
          reviewerName: review.reviewer?.displayName ?? "",
          reviewText: review.comment ?? "",
          rating: Number.parseInt((review.starRating ?? "").replace(/[^0-9]/g, ""), 10) || 5,
        }),
      });

      const draft = (response.draft as string | undefined) ?? "";
      setReplyDrafts((current) => ({
        ...current,
        [reviewId]: draft,
      }));
      setStatusText("Draft reply generated. Review and publish manually when ready.");
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Unable to generate review reply draft.");
      setStatusText("");
    }
  }

  async function publishReviewReply(review: BusinessReview) {
    const reviewId = review.reviewId ?? "";
    const replyText = (replyDrafts[reviewId] ?? "").trim();

    if (!reviewId || !replyText) {
      setErrorText("Draft reply is required before publishing.");
      return;
    }

    const confirmed = window.confirm("Publish this reply to Google Business Profile now?");
    if (!confirmed) {
      return;
    }

    setStatusText("Publishing reply...");
    setErrorText("");

    try {
      await adminFetch("/api/admin/google-business/reviews/reply", {
        method: "POST",
        body: JSON.stringify({
          action: "publish",
          locationName,
          reviewId,
          replyText,
        }),
      });

      setStatusText("Review reply published.");
      await loadDashboard();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Unable to publish review reply.");
      setStatusText("");
    }
  }

  async function generatePostDraft() {
    setStatusText("Generating Google post draft...");
    setErrorText("");

    try {
      const response = await adminFetch("/api/admin/google-business/posts", {
        method: "POST",
        body: JSON.stringify({
          action: "generate",
          topic: postTopic,
          callToAction: postCallToAction,
        }),
      });

      setPostDraft((response.draft as string | undefined) ?? "");
      setStatusText("Post draft generated. Review before publishing.");
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Unable to generate post draft.");
      setStatusText("");
    }
  }

  async function publishPostDraft() {
    if (!postDraft.trim()) {
      setErrorText("Generate or enter a post draft before publishing.");
      return;
    }

    const confirmed = window.confirm("Publish this Google Business post now?");
    if (!confirmed) {
      return;
    }

    setStatusText("Publishing local post...");
    setErrorText("");

    try {
      await adminFetch("/api/admin/google-business/posts", {
        method: "POST",
        body: JSON.stringify({
          action: "publish",
          locationName,
          topic: postTopic,
          content: postDraft,
          callToAction: postCallToAction,
          ctaUrl: "https://zerocool-development.com/free-consultation",
        }),
      });

      setStatusText("Google post published successfully.");
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Unable to publish Google post.");
      setStatusText("");
    }
  }

  if (loading) {
    return <p className="section-copy">Loading Google Business Profile data...</p>;
  }

  return (
    <section className="glass-panel rounded-3xl p-7 md:p-10">
      <p className="label-chip inline-flex">Google Business Profile</p>
      <h2 className="mt-5 text-2xl font-semibold tracking-tight text-blue-100 md:text-3xl">
        Listings and Review Manager
      </h2>
      <p className="section-copy mt-3">
        Manage profile details, reviews, and local posts from one protected dashboard.
      </p>

      {errorText ? <p className="lead-status mt-4">{errorText}</p> : null}
      {statusText ? <p className="lead-status success mt-4">{statusText}</p> : null}

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="stat-card">
          <p className="stat-value">{location?.title || "Unknown"}</p>
          <p className="stat-label">Business Name</p>
        </article>
        <article className="stat-card">
          <p className="stat-value">{location?.primaryCategory?.displayName || "Unknown"}</p>
          <p className="stat-label">Category</p>
        </article>
        <article className="stat-card">
          <p className="stat-value">{reviews.length}</p>
          <p className="stat-label">Total Reviews</p>
        </article>
        <article className="stat-card">
          <p className="stat-value">{unansweredReviews.length}</p>
          <p className="stat-label">Unanswered Reviews</p>
        </article>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="glass-card rounded-2xl p-5">
          <h3 className="text-xl font-semibold text-blue-100">Business Snapshot</h3>
          <p className="section-copy mt-3">
            <strong>Address / Service Area:</strong> {formatAddress(location)}
          </p>
          <p className="section-copy mt-2">
            <strong>Phone:</strong> {location?.phoneNumbers?.primaryPhone || "Not set"}
          </p>
          <p className="section-copy mt-2">
            <strong>Website:</strong> {location?.websiteUri || "Not set"}
          </p>
          <p className="section-copy mt-2 whitespace-pre-wrap">
            <strong>Description:</strong> {location?.profile?.description || "Not set"}
          </p>
          <p className="section-copy mt-2">
            <strong>Hours:</strong>{" "}
            {hoursRows.length
              ? hoursRows
                  .map((row) => `${row.openDay} ${row.openTime}-${row.closeTime}`)
                  .join(", ")
              : "Not set"}
          </p>
        </article>

        <article className="glass-card rounded-2xl p-5">
          <h3 className="text-xl font-semibold text-blue-100">SEO Improvement Suggestions</h3>
          <ul className="mt-3 space-y-2">
            {seoSuggestions.map((suggestion) => (
              <li key={suggestion} className="section-copy">
                - {suggestion}
              </li>
            ))}
          </ul>
          <p className="section-copy mt-4">
            Recent posts: Placeholder list. Publish a fresh weekly update to improve local visibility.
          </p>
          <p className="section-copy mt-2">Connected accounts: {accounts.length}</p>
          <p className="section-copy mt-1">Connected locations: {locations.length}</p>
        </article>
      </div>

      <form className="lead-form mt-7" onSubmit={saveProfileUpdates}>
        <h3 className="text-xl font-semibold text-blue-100">Update Profile Details</h3>

        <label htmlFor="gbp-description">Business Description</label>
        <textarea
          id="gbp-description"
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />

        <label htmlFor="gbp-website">Website URL</label>
        <input
          id="gbp-website"
          value={websiteUrl}
          onChange={(event) => setWebsiteUrl(event.target.value)}
          placeholder="https://zerocool-development.com"
        />

        <label htmlFor="gbp-phone">Phone Number</label>
        <input
          id="gbp-phone"
          value={phoneNumber}
          onChange={(event) => setPhoneNumber(event.target.value)}
          placeholder="+1 401 000 0000"
        />

        <label htmlFor="gbp-services">Services Text Suggestions</label>
        <textarea
          id="gbp-services"
          rows={3}
          value={servicesTextSuggestions}
          onChange={(event) => setServicesTextSuggestions(event.target.value)}
          placeholder="Computer repair, laptop diagnostics, virus removal, website development, AI automation..."
        />

        <div className="grid gap-3 md:grid-cols-2">
          {hoursRows.map((row, index) => (
            <div key={`${row.openDay}-${index}`} className="grid grid-cols-2 gap-2">
              <select
                value={row.openDay}
                onChange={(event) =>
                  setHoursRows((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, openDay: event.target.value, closeDay: event.target.value }
                        : item
                    )
                  )
                }
              >
                {dayOptions.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
              <input
                value={row.openTime}
                onChange={(event) =>
                  setHoursRows((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, openTime: event.target.value } : item
                    )
                  )
                }
                placeholder="0900"
              />
              <input
                value={row.closeTime}
                onChange={(event) =>
                  setHoursRows((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, closeTime: event.target.value } : item
                    )
                  )
                }
                placeholder="1700"
              />
            </div>
          ))}
        </div>

        <button type="submit" className="cta-secondary">
          Save Google Profile Updates
        </button>
      </form>

      <section className="mt-8">
        <h3 className="text-xl font-semibold text-blue-100">Review Management</h3>
        <div className="mt-4 grid gap-4">
          {reviews.map((review) => {
            const reviewId = review.reviewId ?? `${review.reviewer?.displayName ?? "review"}`;
            const draft = replyDrafts[review.reviewId ?? ""] ?? "";

            return (
              <article key={reviewId} className="glass-card rounded-2xl p-5">
                <p className="response-note">
                  {review.reviewer?.displayName || "Anonymous"} · {formatStarRating(review.starRating)}
                </p>
                <p className="section-copy mt-2 whitespace-pre-wrap">{review.comment || "No comment"}</p>

                {review.reviewReply?.comment ? (
                  <p className="section-copy mt-3 whitespace-pre-wrap">
                    <strong>Published reply:</strong> {review.reviewReply.comment}
                  </p>
                ) : null}

                <label className="mt-3 block">Draft Reply</label>
                <textarea
                  rows={3}
                  value={draft}
                  onChange={(event) =>
                    setReplyDrafts((current) => ({
                      ...current,
                      [review.reviewId ?? ""]: event.target.value,
                    }))
                  }
                />

                <div className="mt-3 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="cta-secondary"
                    onClick={() => void generateReviewDraft(review)}
                  >
                    Generate Reply Draft
                  </button>
                  <button
                    type="button"
                    className="cta-primary"
                    onClick={() => void publishReviewReply(review)}
                  >
                    Publish Reply
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <h3 className="text-xl font-semibold text-blue-100">Google Post Generator</h3>
        <div className="lead-form mt-3">
          <label htmlFor="post-topic">Topic</label>
          <select id="post-topic" value={postTopic} onChange={(event) => setPostTopic(event.target.value)}>
            {postTopicOptions.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>

          <label htmlFor="post-cta">Call To Action</label>
          <input
            id="post-cta"
            value={postCallToAction}
            onChange={(event) => setPostCallToAction(event.target.value)}
          />

          <label htmlFor="post-draft">Draft Content</label>
          <textarea
            id="post-draft"
            rows={5}
            value={postDraft}
            onChange={(event) => setPostDraft(event.target.value)}
          />

          <div className="flex flex-wrap gap-3">
            <button type="button" className="cta-secondary" onClick={() => void generatePostDraft()}>
              Generate Post Draft
            </button>
            <button type="button" className="cta-primary" onClick={() => void publishPostDraft()}>
              Publish Google Post
            </button>
          </div>
        </div>
      </section>
    </section>
  );
}
