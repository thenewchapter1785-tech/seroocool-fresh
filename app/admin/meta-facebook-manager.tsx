"use client";

import { useEffect, useMemo, useState } from "react";

type MetaFacebookManagerProps = {
  adminCode: string;
};

type ManagedPage = {
  id: string;
  name?: string;
  category?: string;
  about?: string;
  website?: string;
  phone?: string;
  emails?: string[];
  username?: string;
  is_published?: boolean;
  link?: string;
};

type PagePost = {
  id: string;
  message?: string;
  created_time?: string;
  permalink_url?: string;
  scheduled_publish_time?: string;
};

type Recommendation = {
  pageId: string;
  pageName: string;
  action: "merge" | "unpublish" | "delete" | "none";
  reason: string;
  requiresManualConfirmation: boolean;
};

type Diagnostics = {
  config?: {
    graphApiVersion?: string;
    userAccessToken?: string;
    pageAccessToken?: string;
    pageId?: string;
  };
  token?: {
    tokenValid?: boolean | null;
    diagnostics?: Array<{ name: string; state: string }>;
  };
};

type ProfileReview = {
  token: string;
  expiresAt: string;
  changes: Array<{ field: string; before: string; after: string }>;
};

type Draft = {
  id: string;
  title: string;
  message: string;
  link: string;
  scheduleAt: string;
  updatedAt: string;
};

type EngagementComment = {
  id: string;
  message?: string;
  created_time?: string;
  from?: { id?: string; name?: string };
  is_hidden?: boolean;
  like_count?: number;
  postId?: string;
  postMessage?: string;
};

export default function MetaFacebookManager({ adminCode }: MetaFacebookManagerProps) {
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");
  const [statusText, setStatusText] = useState("");

  const [activePage, setActivePage] = useState<ManagedPage | null>(null);
  const [managedPages, setManagedPages] = useState<ManagedPage[]>([]);
  const [recentPosts, setRecentPosts] = useState<PagePost[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [diagnostics, setDiagnostics] = useState<Diagnostics | null>(null);

  const [about, setAbout] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");

  const [profileReview, setProfileReview] = useState<ProfileReview | null>(null);

  const [postMessage, setPostMessage] = useState("");
  const [postLink, setPostLink] = useState("");
  const [postSchedule, setPostSchedule] = useState("");

  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [draftTitle, setDraftTitle] = useState("");
  const [selectedDraftId, setSelectedDraftId] = useState("");

  const [comments, setComments] = useState<EngagementComment[]>([]);
  const [engagementCommentId, setEngagementCommentId] = useState("");
  const [engagementAction, setEngagementAction] = useState<"reply" | "hide" | "unhide" | "delete">("reply");
  const [engagementMessage, setEngagementMessage] = useState("");
  const [engagementConfirmation, setEngagementConfirmation] = useState("");

  const [confirmationAction, setConfirmationAction] = useState<"merge" | "unpublish" | "delete">(
    "unpublish"
  );
  const [confirmationPageId, setConfirmationPageId] = useState("");
  const [confirmationText, setConfirmationText] = useState("");

  async function adminFetch(path: string, init?: RequestInit) {
    const method = (init?.method ?? "GET").toUpperCase();
    const shouldAttachWriteGuards = !["GET", "HEAD", "OPTIONS"].includes(method);

    const response = await fetch(path, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "x-admin-code": adminCode,
        ...(shouldAttachWriteGuards ? { "x-admin-csrf": adminCode } : {}),
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
      throw new Error(body?.error ?? "Meta admin request failed");
    }

    return body;
  }

  async function loadMetaDashboard() {
    setLoading(true);
    setErrorText("");

    try {
      const [pagesData, pageData, recommendationsData, diagnosticsData, draftsData, engagementData] =
        await Promise.all([
          adminFetch("/api/admin/meta/pages"),
          adminFetch("/api/admin/meta/page"),
          adminFetch("/api/admin/meta/recommendations"),
          adminFetch("/api/admin/meta/diagnostics"),
          adminFetch("/api/admin/meta/drafts"),
          adminFetch("/api/admin/meta/engagement"),
        ]);

      const pages = (pagesData.pages as ManagedPage[] | undefined) ?? [];
      const page = (pageData.page as ManagedPage | undefined) ?? null;
      const posts = (pageData.recentPosts as PagePost[] | undefined) ?? [];
      const recs = (recommendationsData.recommendations as Recommendation[] | undefined) ?? [];
      const loadedDrafts = (draftsData.drafts as Draft[] | undefined) ?? [];
      const loadedComments = (engagementData.comments as EngagementComment[] | undefined) ?? [];

      setManagedPages(pages);
      setActivePage(page);
      setRecentPosts(posts);
      setRecommendations(recs);
      setDrafts(loadedDrafts);
      setComments(loadedComments);
      setDiagnostics({
        config: diagnosticsData.config as Diagnostics["config"],
        token: diagnosticsData.token as Diagnostics["token"],
      });

      setAbout(page?.about ?? "");
      setWebsite(page?.website ?? "");
      setEmail((page?.emails ?? [""])[0] ?? "");
      setPhone(page?.phone ?? "");
      setUsername(page?.username ?? "");
      setConfirmationPageId(page?.id ?? pages[0]?.id ?? "");

      setStatusText("Meta/Facebook automation connected.");
    } catch (error) {
      setErrorText(
        error instanceof Error ? error.message : "Unable to load Meta/Facebook dashboard data."
      );
      setStatusText("");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadMetaDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeStatus = useMemo(() => {
    if (!activePage) {
      return "Unknown";
    }

    return activePage.is_published === false ? "Unpublished" : "Published";
  }, [activePage]);

  async function savePageProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusText("Generating profile review...");
    setErrorText("");

    try {
      const response = await adminFetch("/api/admin/meta/page", {
        method: "PATCH",
        body: JSON.stringify({
          about,
          website,
          email,
          phone,
          username,
          applyConfirmed: false,
        }),
      });

      const review = response.review as ProfileReview | undefined;
      if (response.reviewOnly && review) {
        setProfileReview(review);
        setStatusText("Review generated. Inspect changes and click Apply.");
      }
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Unable to generate profile review.");
      setStatusText("");
    }
  }

  async function applyReviewedProfile() {
    if (!profileReview) {
      return;
    }

    setStatusText("Applying approved profile updates...");
    setErrorText("");

    try {
      const response = await adminFetch("/api/admin/meta/page", {
        method: "PATCH",
        body: JSON.stringify({
          applyConfirmed: true,
          reviewToken: profileReview.token,
        }),
      });

      setActivePage((response.page as ManagedPage | undefined) ?? null);
      setRecentPosts((response.recentPosts as PagePost[] | undefined) ?? []);
      setProfileReview(null);
      setStatusText("Facebook Page profile updated.");
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Unable to apply profile update.");
      setStatusText("");
    }
  }

  async function createOrSchedulePost(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusText("Publishing/scheduling Facebook post...");
    setErrorText("");

    try {
      await adminFetch("/api/admin/meta/posts", {
        method: "POST",
        body: JSON.stringify({
          message: postMessage,
          link: postLink,
          scheduledPublishTime: postSchedule || undefined,
        }),
      });

      setPostMessage("");
      setPostLink("");
      setPostSchedule("");
      setStatusText("Facebook post request completed.");
      await loadMetaDashboard();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Unable to create/schedule post.");
      setStatusText("");
    }
  }

  async function saveDraft() {
    setStatusText("Saving post draft...");
    setErrorText("");

    try {
      await adminFetch("/api/admin/meta/drafts", {
        method: "PUT",
        body: JSON.stringify({
          id: selectedDraftId || undefined,
          title: draftTitle,
          message: postMessage,
          link: postLink,
          scheduleAt: postSchedule,
        }),
      });

      setStatusText("Draft saved.");
      await loadMetaDashboard();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Unable to save draft.");
      setStatusText("");
    }
  }

  async function deleteDraft() {
    if (!selectedDraftId) {
      return;
    }

    setStatusText("Deleting draft...");
    setErrorText("");

    try {
      await adminFetch("/api/admin/meta/drafts", {
        method: "DELETE",
        body: JSON.stringify({
          id: selectedDraftId,
        }),
      });

      setSelectedDraftId("");
      setDraftTitle("");
      setStatusText("Draft deleted.");
      await loadMetaDashboard();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Unable to delete draft.");
      setStatusText("");
    }
  }

  async function runEngagementAction(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusText("Executing engagement action...");
    setErrorText("");

    try {
      const response = await adminFetch("/api/admin/meta/engagement", {
        method: "POST",
        body: JSON.stringify({
          action: engagementAction,
          commentId: engagementCommentId,
          message: engagementMessage || undefined,
          confirmationText: engagementConfirmation,
        }),
      });

      setStatusText((response.message as string | undefined) || "Engagement action completed.");
      setEngagementMessage("");
      setEngagementConfirmation("");
      await loadMetaDashboard();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Unable to run engagement action.");
      setStatusText("");
    }
  }

  async function confirmDestructiveAction(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusText("Submitting manual confirmation...");
    setErrorText("");

    try {
      const response = await adminFetch("/api/admin/meta/confirm-action", {
        method: "POST",
        body: JSON.stringify({
          action: confirmationAction,
          pageId: confirmationPageId,
          confirmationText,
          execute: true,
        }),
      });

      const message = (response.message as string | undefined) ?? "Manual action processed.";
      setStatusText(message);
      setConfirmationText("");
      await loadMetaDashboard();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Manual action failed.");
      setStatusText("");
    }
  }

  async function activatePage(pageId: string) {
    setStatusText("Saving active page...");
    setErrorText("");

    try {
      await adminFetch("/api/admin/meta/active-page", {
        method: "PUT",
        body: JSON.stringify({ pageId }),
      });

      setStatusText("Active page saved.");
      await loadMetaDashboard();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Unable to set active page.");
      setStatusText("");
    }
  }

  function loadDraftIntoComposer(draftId: string) {
    const draft = drafts.find((item) => item.id === draftId);
    if (!draft) {
      return;
    }

    setSelectedDraftId(draft.id);
    setDraftTitle(draft.title);
    setPostMessage(draft.message);
    setPostLink(draft.link);
    setPostSchedule(draft.scheduleAt);
    setStatusText(`Draft loaded: ${draft.title}`);
  }

  function prepareEngagement(comment: EngagementComment, action: "reply" | "hide" | "unhide" | "delete") {
    setEngagementCommentId(comment.id);
    setEngagementAction(action);
    setEngagementConfirmation(`CONFIRM ${action.toUpperCase()} ${comment.id}`);
    setStatusText(`Prepared ${action} action for comment ${comment.id}.`);
  }

  if (loading) {
    return <p className="section-copy">Loading Meta/Facebook automation dashboard...</p>;
  }

  return (
    <section className="glass-panel rounded-3xl p-7 md:p-10">
      <p className="label-chip inline-flex">Meta / Facebook Automation</p>
      <h2 className="mt-5 text-2xl font-semibold tracking-tight text-blue-100 md:text-3xl">
        Page Operations and Content Automation
      </h2>
      <p className="section-copy mt-3">
        Secure backend-only Facebook management for profile updates, post scheduling, drafts,
        moderation, and operator-approved corrective actions.
      </p>

      {errorText ? <p className="lead-status mt-4">{errorText}</p> : null}
      {statusText ? <p className="lead-status success mt-4">{statusText}</p> : null}

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="stat-card">
          <p className="stat-value">{activeStatus}</p>
          <p className="stat-label">Active Page Status</p>
        </article>
        <article className="stat-card">
          <p className="stat-value">{activePage?.name || "Unknown"}</p>
          <p className="stat-label">Page Name</p>
        </article>
        <article className="stat-card">
          <p className="stat-value">{activePage?.id || "Unknown"}</p>
          <p className="stat-label">Page ID</p>
        </article>
        <article className="stat-card">
          <p className="stat-value">{activePage?.category || "Unknown"}</p>
          <p className="stat-label">Category</p>
        </article>
      </div>

      <article className="glass-card mt-6 rounded-2xl p-5">
        <h3 className="text-xl font-semibold text-blue-100">Diagnostics</h3>
        <p className="section-copy mt-2">
          Graph API Version: {diagnostics?.config?.graphApiVersion || "Unknown"}
        </p>
        <p className="section-copy mt-1">
          Token Status:{" "}
          {diagnostics?.token?.tokenValid === true
            ? "Valid"
            : diagnostics?.token?.tokenValid === false
              ? "Invalid or expired"
              : "Needs review"}
        </p>
        <p className="section-copy mt-1">
          User Token: {diagnostics?.config?.userAccessToken || "Not configured"}
        </p>
        <p className="section-copy mt-1">
          Page Token: {diagnostics?.config?.pageAccessToken || "Not configured"}
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {(diagnostics?.token?.diagnostics ?? []).map((item) => (
            <p key={item.name} className="response-note">
              {item.name}: {item.state}
            </p>
          ))}
        </div>
      </article>

      <article className="glass-card mt-6 rounded-2xl p-5">
        <h3 className="text-xl font-semibold text-blue-100">Active Page Snapshot</h3>
        <p className="section-copy mt-3">
          <strong>About:</strong> {activePage?.about || "Not set"}
        </p>
        <p className="section-copy mt-2">
          <strong>Website:</strong> {activePage?.website || "Not set"}
        </p>
        <p className="section-copy mt-2">
          <strong>Email:</strong> {(activePage?.emails ?? []).join(", ") || "Not set"}
        </p>
        <p className="section-copy mt-2">
          <strong>Phone:</strong> {activePage?.phone || "Not set"}
        </p>
        <p className="section-copy mt-2">
          <strong>Username:</strong> {activePage?.username || "Not set"}
        </p>
      </article>

      <form className="lead-form mt-7" onSubmit={savePageProfile}>
        <h3 className="text-xl font-semibold text-blue-100">Review and Apply Profile Updates</h3>
        <label htmlFor="meta-about">About section</label>
        <textarea
          id="meta-about"
          rows={4}
          value={about}
          onChange={(event) => setAbout(event.target.value)}
        />

        <label htmlFor="meta-website">Website</label>
        <input
          id="meta-website"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
          placeholder="https://zerocool-development.com"
        />

        <label htmlFor="meta-email">Email</label>
        <input id="meta-email" value={email} onChange={(event) => setEmail(event.target.value)} />

        <label htmlFor="meta-phone">Phone</label>
        <input id="meta-phone" value={phone} onChange={(event) => setPhone(event.target.value)} />

        <label htmlFor="meta-username">Username</label>
        <input
          id="meta-username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />

        <button type="submit" className="cta-secondary">
          Generate Review
        </button>

        {profileReview ? (
          <article className="glass-card mt-4 rounded-2xl p-4">
            <p className="response-note">Review Token: {profileReview.token}</p>
            <p className="section-copy mt-1">Expires: {profileReview.expiresAt}</p>
            <div className="mt-3 grid gap-2">
              {profileReview.changes.map((change) => (
                <p key={change.field} className="section-copy">
                  <strong>{change.field}</strong>: {change.before || "(empty)"} to {change.after || "(empty)"}
                </p>
              ))}
            </div>
            <button
              type="button"
              className="cta-primary mt-4"
              onClick={() => {
                void applyReviewedProfile();
              }}
            >
              Apply Reviewed Changes
            </button>
          </article>
        ) : null}
      </form>

      <form className="lead-form mt-8" onSubmit={createOrSchedulePost}>
        <h3 className="text-xl font-semibold text-blue-100">Create or Schedule Facebook Post</h3>

        <label htmlFor="meta-draft-title">Draft title (optional)</label>
        <input
          id="meta-draft-title"
          value={draftTitle}
          onChange={(event) => setDraftTitle(event.target.value)}
          placeholder="Weekly promo"
        />

        <label htmlFor="meta-post-message">Post message</label>
        <textarea
          id="meta-post-message"
          rows={4}
          value={postMessage}
          onChange={(event) => setPostMessage(event.target.value)}
          required
        />

        <label htmlFor="meta-post-link">Link (optional)</label>
        <input
          id="meta-post-link"
          value={postLink}
          onChange={(event) => setPostLink(event.target.value)}
          placeholder="https://zerocool-development.com/free-consultation"
        />

        <label htmlFor="meta-post-schedule">Schedule time (optional)</label>
        <input
          id="meta-post-schedule"
          type="datetime-local"
          value={postSchedule}
          onChange={(event) => setPostSchedule(event.target.value)}
        />

        <div className="mt-3 flex flex-wrap gap-3">
          <button type="submit" className="cta-primary">
            Create or Schedule Post
          </button>
          <button
            type="button"
            className="cta-secondary"
            onClick={() => {
              void saveDraft();
            }}
          >
            Save Draft
          </button>
          <button
            type="button"
            className="cta-secondary"
            onClick={() => {
              void deleteDraft();
            }}
            disabled={!selectedDraftId}
          >
            Delete Selected Draft
          </button>
        </div>
      </form>

      <section className="mt-8">
        <h3 className="text-xl font-semibold text-blue-100">Post Drafts</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {drafts.length ? (
            drafts.map((draft) => (
              <article key={draft.id} className="glass-card rounded-2xl p-5">
                <p className="response-note">{draft.title}</p>
                <p className="section-copy mt-1">Updated: {draft.updatedAt}</p>
                <p className="section-copy mt-2 whitespace-pre-wrap">{draft.message}</p>
                <button
                  type="button"
                  className="cta-link mt-3 inline-block"
                  onClick={() => loadDraftIntoComposer(draft.id)}
                >
                  Load Draft
                </button>
              </article>
            ))
          ) : (
            <p className="section-copy">No saved drafts yet.</p>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h3 className="text-xl font-semibold text-blue-100">Recent Posts</h3>
        <div className="mt-4 grid gap-4">
          {recentPosts.length ? (
            recentPosts.map((post) => (
              <article key={post.id} className="glass-card rounded-2xl p-5">
                <p className="response-note">
                  {post.created_time || post.scheduled_publish_time || "n/a"}
                </p>
                <p className="section-copy mt-2 whitespace-pre-wrap">{post.message || "No message"}</p>
                {post.permalink_url ? (
                  <a
                    href={post.permalink_url}
                    target="_blank"
                    rel="noreferrer"
                    className="cta-link mt-3 inline-block"
                  >
                    Open Post
                  </a>
                ) : null}
              </article>
            ))
          ) : (
            <p className="section-copy">No recent posts available.</p>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h3 className="text-xl font-semibold text-blue-100">Engagement Manager</h3>
        <form className="lead-form mt-4" onSubmit={runEngagementAction}>
          <label htmlFor="meta-engagement-comment-id">Comment ID</label>
          <input
            id="meta-engagement-comment-id"
            value={engagementCommentId}
            onChange={(event) => setEngagementCommentId(event.target.value)}
            required
          />

          <label htmlFor="meta-engagement-action">Action</label>
          <select
            id="meta-engagement-action"
            value={engagementAction}
            onChange={(event) =>
              setEngagementAction(event.target.value as "reply" | "hide" | "unhide" | "delete")
            }
          >
            <option value="reply">reply</option>
            <option value="hide">hide</option>
            <option value="unhide">unhide</option>
            <option value="delete">delete</option>
          </select>

          <label htmlFor="meta-engagement-message">Reply message (for reply only)</label>
          <textarea
            id="meta-engagement-message"
            rows={3}
            value={engagementMessage}
            onChange={(event) => setEngagementMessage(event.target.value)}
          />

          <label htmlFor="meta-engagement-confirmation">Manual confirmation text</label>
          <input
            id="meta-engagement-confirmation"
            value={engagementConfirmation}
            onChange={(event) => setEngagementConfirmation(event.target.value)}
            placeholder={`CONFIRM ${engagementAction.toUpperCase()} ${engagementCommentId || "COMMENT_ID"}`}
            required
          />

          <button type="submit" className="cta-secondary">
            Execute Engagement Action
          </button>
        </form>

        <div className="mt-4 grid gap-4">
          {comments.length ? (
            comments.map((comment) => (
              <article key={comment.id} className="glass-card rounded-2xl p-5">
                <p className="response-note">Comment {comment.id}</p>
                <p className="section-copy mt-1">From: {comment.from?.name || "Unknown"}</p>
                <p className="section-copy mt-1">Hidden: {comment.is_hidden ? "yes" : "no"}</p>
                <p className="section-copy mt-1">Likes: {comment.like_count ?? 0}</p>
                <p className="section-copy mt-1">Post: {comment.postId || "Unknown"}</p>
                <p className="section-copy mt-2 whitespace-pre-wrap">{comment.message || "No message"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" className="cta-secondary" onClick={() => prepareEngagement(comment, "reply")}>
                    Prepare Reply
                  </button>
                  <button type="button" className="cta-secondary" onClick={() => prepareEngagement(comment, "hide")}>
                    Prepare Hide
                  </button>
                  <button type="button" className="cta-secondary" onClick={() => prepareEngagement(comment, "unhide")}>
                    Prepare Unhide
                  </button>
                  <button type="button" className="cta-secondary" onClick={() => prepareEngagement(comment, "delete")}>
                    Prepare Delete
                  </button>
                </div>
              </article>
            ))
          ) : (
            <p className="section-copy">No recent comments were returned for the active page.</p>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h3 className="text-xl font-semibold text-blue-100">Recommended Fixes</h3>
        <div className="mt-4 grid gap-4">
          {recommendations.map((item, index) => (
            <article key={`${item.pageId}-${index}`} className="glass-card rounded-2xl p-5">
              <p className="response-note">
                {item.pageName} ({item.pageId})
              </p>
              <p className="section-copy mt-2">
                <strong>Action:</strong> {item.action}
              </p>
              <p className="section-copy mt-2">{item.reason}</p>
              {item.requiresManualConfirmation ? (
                <p className="section-copy mt-2">
                  Manual confirmation required before running this action.
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <form className="lead-form mt-8" onSubmit={confirmDestructiveAction}>
        <h3 className="text-xl font-semibold text-blue-100">Manual Confirmation Gate</h3>
        <p className="section-copy mt-2">
          Destructive actions are never automatic. You must confirm manually in this format:
          CONFIRM ACTION PAGE_ID
        </p>

        <label htmlFor="meta-confirm-action">Action</label>
        <select
          id="meta-confirm-action"
          value={confirmationAction}
          onChange={(event) =>
            setConfirmationAction(event.target.value as "merge" | "unpublish" | "delete")
          }
        >
          <option value="unpublish">unpublish</option>
          <option value="merge">merge</option>
          <option value="delete">delete</option>
        </select>

        <label htmlFor="meta-confirm-page">Page ID</label>
        <input
          id="meta-confirm-page"
          value={confirmationPageId}
          onChange={(event) => setConfirmationPageId(event.target.value)}
          required
        />

        <label htmlFor="meta-confirm-text">Manual confirmation text</label>
        <input
          id="meta-confirm-text"
          value={confirmationText}
          onChange={(event) => setConfirmationText(event.target.value)}
          placeholder={`CONFIRM ${confirmationAction.toUpperCase()} ${confirmationPageId || "PAGE_ID"}`}
          required
        />

        <button type="submit" className="cta-secondary">
          Confirm Action
        </button>
      </form>

      <section className="mt-8">
        <h3 className="text-xl font-semibold text-blue-100">Managed Pages</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {managedPages.map((page) => (
            <article key={page.id} className="glass-card rounded-2xl p-5">
              <p className="response-note">{page.name || page.id}</p>
              <p className="section-copy mt-2">ID: {page.id}</p>
              <p className="section-copy mt-1">Category: {page.category || "Unknown"}</p>
              <p className="section-copy mt-1">
                Status: {page.is_published === false ? "Unpublished" : "Published"}
              </p>
              <button
                type="button"
                className="cta-secondary mt-3"
                onClick={() => {
                  void activatePage(page.id);
                }}
              >
                Set As Active Page
              </button>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
