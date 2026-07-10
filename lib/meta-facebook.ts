import "server-only";

import { sanitizeText } from "@/lib/api-security";
import { getMetaConfig } from "@/lib/meta-config";
import { getActiveMetaPageId } from "@/lib/meta-active-page";
import { graphDelete, graphGet, graphPost, graphUpload, MetaGraphError } from "@/lib/meta-graph-client";

export type ManagedPage = {
  id: string;
  name?: string;
  category?: string;
  category_list?: Array<{ id?: string; name?: string }>;
  about?: string;
  website?: string;
  phone?: string;
  emails?: string[];
  username?: string;
  is_published?: boolean;
  link?: string;
  tasks?: string[];
};

export type PagePost = {
  id: string;
  message?: string;
  created_time?: string;
  permalink_url?: string;
  is_published?: boolean;
  scheduled_publish_time?: string;
};

export type MetaComment = {
  id: string;
  message?: string;
  created_time?: string;
  from?: { id?: string; name?: string };
  is_hidden?: boolean;
  like_count?: number;
  postId?: string;
  postMessage?: string;
};

export type MetaIdentity = {
  id: string;
  name?: string;
};

export type MetaManagedPageDiagnostic = {
  id: string;
  name?: string;
  category?: string;
  tasks?: string[];
};

type CreatePostInput = {
  message: string;
  link?: string;
  scheduledPublishTime?: number;
};

type PageUpdateInput = {
  about?: string;
  website?: string;
  email?: string;
  phone?: string;
  username?: string;
};

export type MetaPermissionState = "requested" | "granted" | "declined" | "expired" | "review-needed";

export type MetaPermissionDiagnostic = {
  name: string;
  state: MetaPermissionState;
  source: "token_scopes" | "debug_token";
};

export type MetaPageRecommendation = {
  pageId: string;
  pageName: string;
  action: "merge" | "unpublish" | "delete" | "none";
  reason: string;
  requiresManualConfirmation: boolean;
};

export type MetaAuditItem = {
  type: "critical" | "recommended" | "optional" | "unsupported";
  title: string;
  details: string;
};

export type MetaAuditScore = {
  score: number;
  items: MetaAuditItem[];
};

export class MetaIntegrationError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

function mapGraphError(error: unknown) {
  if (error instanceof MetaIntegrationError) {
    return error;
  }

  if (error instanceof MetaGraphError) {
    if (error.kind === "token_expired") {
      return new MetaIntegrationError(
        "META_TOKEN_INVALID",
        "Meta access token is invalid or expired. Update META_USER_ACCESS_TOKEN / META_PAGE_ACCESS_TOKEN."
      );
    }

    if (error.kind === "permission_error") {
      return new MetaIntegrationError(
        "META_PERMISSION_MISSING",
        "Meta permissions are missing for this operation. Review granted scopes and page tasks."
      );
    }

    if (error.kind === "rate_limited") {
      return new MetaIntegrationError("META_RATE_LIMITED", "Meta rate limit reached. Retry in a moment.");
    }

    return new MetaIntegrationError("META_API_ERROR", error.message);
  }

  return new MetaIntegrationError("META_API_ERROR", "Meta request failed.");
}

async function resolvePageId(pageId?: string) {
  if (pageId) {
    return pageId;
  }

  return getActiveMetaPageId();
}

export async function listManagedPages() {
  try {
    const response = await graphGet<{ data?: ManagedPage[] }>({
      tokenType: "user",
      path: "me/accounts",
      query: {
        fields:
          "id,name,category,category_list,about,website,phone,emails,username,is_published,link,tasks",
        limit: 100,
      },
    });

    return response.data ?? [];
  } catch (error) {
    throw mapGraphError(error);
  }
}

export async function getMetaIdentity() {
  try {
    return await graphGet<MetaIdentity>({
      tokenType: "user",
      path: "me",
      query: {
        fields: "id,name",
      },
    });
  } catch (error) {
    throw mapGraphError(error);
  }
}

export async function listManagedPagesDiagnostics() {
  try {
    const response = await graphGet<{ data?: MetaManagedPageDiagnostic[] }>({
      tokenType: "user",
      path: "me/accounts",
      query: {
        fields: "id,name,category,tasks",
      },
    });

    return response.data ?? [];
  } catch (error) {
    throw mapGraphError(error);
  }
}

export async function getPageDetails(pageId?: string) {
  try {
    const resolvedPageId = await resolvePageId(pageId);

    return await graphGet<ManagedPage>({
      tokenType: "page",
      path: resolvedPageId,
      query: {
        fields:
          "id,name,category,category_list,about,website,phone,emails,username,is_published,link,tasks",
      },
    });
  } catch (error) {
    throw mapGraphError(error);
  }
}

export async function listRecentPosts(pageId?: string) {
  try {
    const resolvedPageId = await resolvePageId(pageId);

    const response = await graphGet<{ data?: PagePost[] }>({
      tokenType: "page",
      path: `${resolvedPageId}/posts`,
      query: {
        fields: "id,message,created_time,permalink_url,is_published,scheduled_publish_time",
        limit: 15,
      },
    });

    return response.data ?? [];
  } catch (error) {
    throw mapGraphError(error);
  }
}

type PostWithComments = {
  id: string;
  message?: string;
  comments?: {
    data?: MetaComment[];
  };
};

export async function listRecentComments(pageId?: string) {
  try {
    const resolvedPageId = await resolvePageId(pageId);

    const response = await graphGet<{ data?: PostWithComments[] }>({
      tokenType: "page",
      path: `${resolvedPageId}/posts`,
      query: {
        fields:
          "id,message,comments.limit(20){id,message,created_time,from,is_hidden,like_count}",
        limit: 10,
      },
    });

    const comments: MetaComment[] = [];

    for (const post of response.data ?? []) {
      for (const comment of post.comments?.data ?? []) {
        comments.push({
          ...comment,
          postId: post.id,
          postMessage: post.message,
        });
      }
    }

    return comments.sort((a, b) => {
      const at = Date.parse(a.created_time ?? "") || 0;
      const bt = Date.parse(b.created_time ?? "") || 0;
      return bt - at;
    });
  } catch (error) {
    throw mapGraphError(error);
  }
}

export async function updatePageProfile(input: PageUpdateInput, pageId?: string) {
  const about = sanitizeText(input.about, 2000);
  const website = sanitizeText(input.website, 240);
  const email = sanitizeText(input.email, 160);
  const phone = sanitizeText(input.phone, 40);
  const username = sanitizeText(input.username, 80);

  if (website && !/^https?:\/\//.test(website)) {
    throw new MetaIntegrationError(
      "META_VALIDATION_ERROR",
      "Website URL must start with http:// or https://"
    );
  }

  const body: Record<string, string> = {};

  if (about) {
    body.about = about;
  }

  if (website) {
    body.website = website;
  }

  if (email) {
    body.emails = email;
  }

  if (phone) {
    body.phone = phone;
  }

  if (username) {
    body.username = username;
  }

  if (!Object.keys(body).length) {
    throw new MetaIntegrationError(
      "META_VALIDATION_ERROR",
      "No valid profile fields were provided for update."
    );
  }

  try {
    const resolvedPageId = await resolvePageId(pageId);

    return await graphPost<{ success?: boolean }>({
      tokenType: "page",
      path: resolvedPageId,
      body,
      safeToRetry: false,
    });
  } catch (error) {
    throw mapGraphError(error);
  }
}

export async function createOrSchedulePost(input: CreatePostInput, pageId?: string) {
  const message = sanitizeText(input.message, 5000);
  const link = sanitizeText(input.link, 300);

  if (!message) {
    throw new MetaIntegrationError("META_VALIDATION_ERROR", "Post message is required.");
  }

  if (link && !/^https?:\/\//.test(link)) {
    throw new MetaIntegrationError(
      "META_VALIDATION_ERROR",
      "Post link must start with http:// or https://"
    );
  }

  const isScheduled =
    Number.isFinite(input.scheduledPublishTime) &&
    Number(input.scheduledPublishTime) > Math.floor(Date.now() / 1000) + 600;

  try {
    const resolvedPageId = await resolvePageId(pageId);

    return await graphPost<{ id?: string }>({
      tokenType: "page",
      path: `${resolvedPageId}/feed`,
      body: {
        message,
        link: link || undefined,
        published: isScheduled ? "false" : "true",
        scheduled_publish_time: isScheduled ? Number(input.scheduledPublishTime) : undefined,
      },
      safeToRetry: false,
    });
  } catch (error) {
    throw mapGraphError(error);
  }
}

export async function deletePost(postId: string) {
  const safePostId = sanitizeText(postId, 120);
  if (!safePostId) {
    throw new MetaIntegrationError("META_VALIDATION_ERROR", "postId is required.");
  }

  try {
    return await graphDelete<{ success?: boolean }>({
      tokenType: "page",
      path: safePostId,
    });
  } catch (error) {
    throw mapGraphError(error);
  }
}

export async function replyToComment(commentId: string, message: string) {
  const safeCommentId = sanitizeText(commentId, 120);
  const safeMessage = sanitizeText(message, 800);

  if (!safeCommentId || !safeMessage) {
    throw new MetaIntegrationError("META_VALIDATION_ERROR", "commentId and message are required.");
  }

  try {
    return await graphPost<{ id?: string }>({
      tokenType: "page",
      path: `${safeCommentId}/comments`,
      body: {
        message: safeMessage,
      },
      safeToRetry: false,
    });
  } catch (error) {
    throw mapGraphError(error);
  }
}

export async function setCommentHidden(commentId: string, hidden: boolean) {
  const safeCommentId = sanitizeText(commentId, 120);

  if (!safeCommentId) {
    throw new MetaIntegrationError("META_VALIDATION_ERROR", "commentId is required.");
  }

  try {
    return await graphPost<{ success?: boolean }>({
      tokenType: "page",
      path: safeCommentId,
      body: {
        is_hidden: hidden ? "true" : "false",
      },
      safeToRetry: false,
    });
  } catch (error) {
    throw mapGraphError(error);
  }
}

export async function deleteComment(commentId: string) {
  const safeCommentId = sanitizeText(commentId, 120);

  if (!safeCommentId) {
    throw new MetaIntegrationError("META_VALIDATION_ERROR", "commentId is required.");
  }

  try {
    return await graphDelete<{ success?: boolean }>({
      tokenType: "page",
      path: safeCommentId,
    });
  } catch (error) {
    throw mapGraphError(error);
  }
}

export async function uploadPhotoToPage(fileUrl: string, caption?: string, pageId?: string) {
  const safeUrl = sanitizeText(fileUrl, 400);
  const safeCaption = sanitizeText(caption, 400);

  if (!/^https?:\/\//.test(safeUrl)) {
    throw new MetaIntegrationError("META_VALIDATION_ERROR", "Photo URL must be an absolute http(s) URL.");
  }

  try {
    const resolvedPageId = await resolvePageId(pageId);

    return await graphUpload<{ id?: string }>({
      tokenType: "page",
      path: `${resolvedPageId}/photos`,
      fileUrl: safeUrl,
      caption: safeCaption || undefined,
    });
  } catch (error) {
    throw mapGraphError(error);
  }
}

function normalizeName(value: string | undefined) {
  return (value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeWebsite(value: string | undefined) {
  return (value ?? "")
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}

function scoreFromIssues(items: MetaAuditItem[]) {
  let score = 100;

  for (const item of items) {
    if (item.type === "critical") {
      score -= 25;
    } else if (item.type === "recommended") {
      score -= 12;
    } else if (item.type === "optional") {
      score -= 5;
    }
  }

  return Math.max(0, Math.min(100, score));
}

export function buildPageAuditScore(page: ManagedPage): MetaAuditScore {
  const items: MetaAuditItem[] = [];

  if (!page.about) {
    items.push({
      type: "recommended",
      title: "Missing About section",
      details: "Add a concise business description to improve trust and discoverability.",
    });
  }

  if (!page.website) {
    items.push({
      type: "critical",
      title: "Missing website link",
      details: "Set an official website URL so visitors can continue the funnel.",
    });
  }

  if (!page.phone) {
    items.push({
      type: "recommended",
      title: "Missing phone",
      details: "Add a contact phone number for immediate lead conversion.",
    });
  }

  if (!page.username) {
    items.push({
      type: "optional",
      title: "No username",
      details: "Claim a username for a cleaner share URL and better brand consistency.",
    });
  }

  if (page.is_published === false) {
    items.push({
      type: "critical",
      title: "Page unpublished",
      details: "This page is currently unpublished and cannot collect organic traffic.",
    });
  }

  if (!Array.isArray(page.tasks) || page.tasks.length === 0) {
    items.push({
      type: "unsupported",
      title: "Task capability unavailable",
      details: "No task capabilities were returned by Meta for this page token.",
    });
  }

  return {
    score: scoreFromIssues(items),
    items,
  };
}

export function buildPageAudit(pages: ManagedPage[]) {
  const duplicates: Array<{ reason: string; pageIds: string[]; pageNames: string[] }> = [];
  const brokenPages: Array<{ pageId: string; pageName: string; issues: string[]; score: number }> = [];

  const byName = new Map<string, ManagedPage[]>();
  const byWebsite = new Map<string, ManagedPage[]>();

  for (const page of pages) {
    const normalizedName = normalizeName(page.name);
    const normalizedWebsite = normalizeWebsite(page.website);

    if (normalizedName) {
      const existing = byName.get(normalizedName) ?? [];
      existing.push(page);
      byName.set(normalizedName, existing);
    }

    if (normalizedWebsite) {
      const existing = byWebsite.get(normalizedWebsite) ?? [];
      existing.push(page);
      byWebsite.set(normalizedWebsite, existing);
    }

    const score = buildPageAuditScore(page);
    if (score.score < 95 || score.items.length) {
      brokenPages.push({
        pageId: page.id,
        pageName: page.name ?? page.id,
        issues: score.items.map((item) => `${item.type.toUpperCase()}: ${item.title}`),
        score: score.score,
      });
    }
  }

  for (const group of byName.values()) {
    if (group.length > 1) {
      duplicates.push({
        reason: "Duplicate page names",
        pageIds: group.map((item) => item.id),
        pageNames: group.map((item) => item.name ?? item.id),
      });
    }
  }

  for (const group of byWebsite.values()) {
    if (group.length > 1) {
      duplicates.push({
        reason: "Duplicate website URL",
        pageIds: group.map((item) => item.id),
        pageNames: group.map((item) => item.name ?? item.id),
      });
    }
  }

  return {
    duplicates,
    brokenPages,
  };
}

export function buildPageRecommendations(pages: ManagedPage[]) {
  const audit = buildPageAudit(pages);
  const recommendations: MetaPageRecommendation[] = [];

  for (const duplicateGroup of audit.duplicates) {
    duplicateGroup.pageIds.forEach((pageId, index) => {
      recommendations.push({
        pageId,
        pageName: duplicateGroup.pageNames[index] ?? pageId,
        action: index === 0 ? "none" : "merge",
        reason: `${duplicateGroup.reason}. Keep one canonical page and merge follower intent into the primary page.`,
        requiresManualConfirmation: index !== 0,
      });
    });
  }

  for (const broken of audit.brokenPages) {
    const severe = broken.score < 60;

    recommendations.push({
      pageId: broken.pageId,
      pageName: broken.pageName,
      action: severe ? "unpublish" : "none",
      reason: severe
        ? `Page quality score is low (${broken.score}/100). Consider unpublishing until corrected.`
        : `Improve profile quality score (${broken.score}/100): ${broken.issues.join(", ")}.`,
      requiresManualConfirmation: severe,
    });
  }

  if (!recommendations.length) {
    recommendations.push({
      pageId: "n/a",
      pageName: "All managed pages",
      action: "none",
      reason: "No duplicate or broken pages were detected.",
      requiresManualConfirmation: false,
    });
  }

  return {
    recommendations,
    audit,
  };
}

export async function auditPagesAndRecommendations() {
  const pages = await listManagedPages();
  return buildPageRecommendations(pages);
}

export async function unpublishPage(pageId: string) {
  try {
    return await graphPost<{ success?: boolean }>({
      tokenType: "page",
      path: pageId,
      body: {
        published: "false",
      },
      safeToRetry: false,
    });
  } catch (error) {
    throw mapGraphError(error);
  }
}

const expectedPermissions = [
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_posts",
  "pages_manage_engagement",
  "pages_manage_metadata",
  "pages_read_user_content",
  "business_management",
];

type DebugTokenResponse = {
  data?: {
    app_id?: string;
    is_valid?: boolean;
    type?: string;
    expires_at?: number;
    scopes?: string[];
    granular_scopes?: Array<{ scope?: string; target_ids?: string[] }>;
  };
};

export async function getMetaTokenDiagnostics() {
  const config = getMetaConfig(true);
  const token = config.userAccessToken;

  if (!token) {
    throw new MetaIntegrationError("META_CONFIG_MISSING", "Missing META_USER_ACCESS_TOKEN.");
  }

  if (!config.appId || !config.appSecret) {
    return {
      source: "token_scopes",
      tokenValid: null,
      diagnostics: expectedPermissions.map((name) => ({
        name,
        state: "review-needed" as MetaPermissionState,
        source: "token_scopes" as const,
      })),
      reason: "META_APP_ID and META_APP_SECRET are required for debug_token diagnostics.",
    };
  }

  try {
    const response = await graphGet<DebugTokenResponse>({
      tokenType: "user",
      path: "debug_token",
      query: {
        input_token: token,
      },
      authTokenOverride: `${config.appId}|${config.appSecret}`,
      includeAppSecretProof: false,
    });

    const granted = new Set(response.data?.scopes ?? []);
    const valid = Boolean(response.data?.is_valid);
    const tokenType = response.data?.type || "unknown";
    const expiresAt = response.data?.expires_at ? new Date(response.data.expires_at * 1000).toISOString() : null;
    const grantedScopes = expectedPermissions.filter((name) => granted.has(name));
    const missingScopes = expectedPermissions.filter((name) => !granted.has(name));

    const diagnostics: MetaPermissionDiagnostic[] = expectedPermissions.map((name) => ({
      name,
      state: valid ? (granted.has(name) ? "granted" : "declined") : "expired",
      source: "debug_token",
    }));

    return {
      source: "debug_token",
      tokenValid: valid,
      tokenType,
      expiresAt,
      grantedScopes,
      missingScopes,
      diagnostics,
    };
  } catch (error) {
    throw mapGraphError(error);
  }
}
