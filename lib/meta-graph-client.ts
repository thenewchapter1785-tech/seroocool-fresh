import "server-only";

import { createHmac } from "node:crypto";
import { getMetaConfig, getMetaToken, MetaTokenType } from "@/lib/meta-config";

type GraphMethod = "GET" | "POST" | "DELETE";

type GraphRequestOptions = {
  tokenType: MetaTokenType;
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: Record<string, string | number | boolean | undefined>;
  timeoutMs?: number;
  safeToRetry?: boolean;
  authTokenOverride?: string;
  includeAppSecretProof?: boolean;
};

type GraphErrorKind =
  | "token_expired"
  | "permission_error"
  | "rate_limited"
  | "temporary_error"
  | "api_error";

export class MetaGraphError extends Error {
  status: number;
  errorCode: number;
  errorSubcode: number;
  errorType: string;
  kind: GraphErrorKind;
  isRetryable: boolean;

  constructor(params: {
    message: string;
    status: number;
    errorCode?: number;
    errorSubcode?: number;
    errorType?: string;
    kind?: GraphErrorKind;
    isRetryable?: boolean;
  }) {
    super(params.message);
    this.status = params.status;
    this.errorCode = params.errorCode ?? 0;
    this.errorSubcode = params.errorSubcode ?? 0;
    this.errorType = params.errorType ?? "";
    this.kind = params.kind ?? "api_error";
    this.isRetryable = Boolean(params.isRetryable);
  }
}

type GraphErrorPayload = {
  error?: {
    message?: string;
    type?: string;
    code?: number;
    error_subcode?: number;
    fbtrace_id?: string;
  };
};

const defaultTimeoutMs = 9000;

function buildAppSecretProof(token: string, appSecret: string) {
  if (!appSecret) {
    return "";
  }

  return createHmac("sha256", appSecret).update(token).digest("hex");
}

function buildUrl(path: string, query: Record<string, string | number | boolean | undefined>) {
  const { graphApiBaseUrl } = getMetaConfig(true);
  const url = new URL(`${graphApiBaseUrl}/${path.replace(/^\/+/, "")}`);

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === "") {
      continue;
    }

    url.searchParams.set(key, String(value));
  }

  return url;
}

function parseGraphError(status: number, payload: GraphErrorPayload) {
  const error = payload.error;
  const code = error?.code ?? 0;
  const subcode = error?.error_subcode ?? 0;

  if (code === 190) {
    return new MetaGraphError({
      message: "Meta token is invalid or expired.",
      status,
      errorCode: code,
      errorSubcode: subcode,
      errorType: error?.type,
      kind: "token_expired",
      isRetryable: false,
    });
  }

  if (code === 10 || code === 200 || code === 294) {
    return new MetaGraphError({
      message: "Meta permissions are missing for this operation.",
      status,
      errorCode: code,
      errorSubcode: subcode,
      errorType: error?.type,
      kind: "permission_error",
      isRetryable: false,
    });
  }

  if (code === 4 || code === 17 || code === 32 || status === 429) {
    return new MetaGraphError({
      message: "Meta rate limit reached. Retry later.",
      status,
      errorCode: code,
      errorSubcode: subcode,
      errorType: error?.type,
      kind: "rate_limited",
      isRetryable: true,
    });
  }

  if (status >= 500) {
    return new MetaGraphError({
      message: "Meta temporary server error.",
      status,
      errorCode: code,
      errorSubcode: subcode,
      errorType: error?.type,
      kind: "temporary_error",
      isRetryable: true,
    });
  }

  return new MetaGraphError({
    message: error?.message || "Meta Graph API request failed.",
    status,
    errorCode: code,
    errorSubcode: subcode,
    errorType: error?.type,
    kind: "api_error",
    isRetryable: false,
  });
}

async function parseJsonSafe(response: Response) {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

async function requestWithRetry<TResponse>(
  method: GraphMethod,
  options: GraphRequestOptions,
  maxAttempts: number
) {
  const config = getMetaConfig();
  const defaultToken = getMetaToken(options.tokenType);
  const token = options.authTokenOverride || defaultToken;
  const appSecretProof =
    options.includeAppSecretProof === false ? "" : buildAppSecretProof(token, config.appSecret);

  const query = {
    ...(options.query ?? {}),
    access_token: token,
    appsecret_proof: appSecretProof || undefined,
  };

  let attempt = 0;

  while (attempt < maxAttempts) {
    attempt += 1;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? defaultTimeoutMs);

    try {
      const response = await fetch(buildUrl(options.path, query), {
        method,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body:
          method !== "GET" && options.body
            ? new URLSearchParams(
                Object.entries(options.body)
                  .filter((item) => item[1] !== undefined)
                  .map(([key, value]) => [key, String(value)])
              ).toString()
            : undefined,
        signal: controller.signal,
      });

      const parsed = (await parseJsonSafe(response)) as GraphErrorPayload | null;

      if (!response.ok || parsed?.error) {
        const graphError = parseGraphError(response.status, parsed ?? {});

        if (graphError.isRetryable && options.safeToRetry && attempt < maxAttempts) {
          const backoffMs = graphError.kind === "rate_limited" ? 1200 * attempt : 600 * attempt;
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
          continue;
        }

        throw graphError;
      }

      return parsed as TResponse;
    } catch (error) {
      if (error instanceof MetaGraphError) {
        throw error;
      }

      if (attempt < maxAttempts && options.safeToRetry) {
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
        continue;
      }

      throw new MetaGraphError({
        message: error instanceof Error ? error.message : "Unexpected Meta request error",
        status: 502,
        kind: "temporary_error",
        isRetryable: false,
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new MetaGraphError({
    message: "Meta request failed after retries.",
    status: 502,
  });
}

export function graphGet<TResponse>(options: Omit<GraphRequestOptions, "body">) {
  return requestWithRetry<TResponse>("GET", { ...options, safeToRetry: true }, 3);
}

export function graphPost<TResponse>(options: GraphRequestOptions) {
  return requestWithRetry<TResponse>("POST", options, options.safeToRetry ? 2 : 1);
}

export function graphDelete<TResponse>(options: Omit<GraphRequestOptions, "body">) {
  return requestWithRetry<TResponse>("DELETE", { ...options, safeToRetry: false }, 1);
}

export async function graphUpload<TResponse>(options: {
  tokenType: MetaTokenType;
  path: string;
  fileUrl: string;
  caption?: string;
}) {
  return graphPost<TResponse>({
    tokenType: options.tokenType,
    path: options.path,
    body: {
      url: options.fileUrl,
      caption: options.caption,
      published: true,
    },
    safeToRetry: false,
  });
}
