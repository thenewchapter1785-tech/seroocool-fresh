import "server-only";

import { readOptionalEnv } from "@/lib/env";

export type MetaTokenType = "user" | "page";

export type MetaConfig = {
  graphApiVersion: string;
  graphApiBaseUrl: string;
  appId: string;
  appSecret: string;
  userAccessToken: string;
  pageAccessToken: string;
  pageId: string;
  businessId: string;
  verifyToken: string;
};

const DEFAULT_GRAPH_API_VERSION = "v25.0";
const META_USER_TOKEN_ALIASES = [
  "META_GRAPH_TOKEN",
  "GRAPH_API_TOKEN",
  "FACEBOOK_ACCESS_TOKEN",
];
const META_PAGE_TOKEN_ALIASES = ["FACEBOOK_PAGE_ACCESS_TOKEN", "META_PAGE_TOKEN"];
const META_PAGE_ID_ALIASES = ["FACEBOOK_PAGE_ID"];
const META_APP_ID_ALIASES = ["FACEBOOK_APP_ID"];
const META_APP_SECRET_ALIASES = ["FACEBOOK_APP_SECRET"];
const META_VERIFY_TOKEN_ALIASES = ["FACEBOOK_VERIFY_TOKEN"];
const META_BUSINESS_ID_ALIASES = ["FACEBOOK_BUSINESS_ID"];

function readMetaValue(name: string, aliases: string[] = []) {
  const candidates = [name, ...aliases];

  for (const candidate of candidates) {
    const value = readOptionalEnv(candidate).trim();
    if (value) {
      return value;
    }
  }

  return "";
}

function redactSecret(value: string) {
  if (!value) {
    return "";
  }

  if (value.length <= 8) {
    return "********";
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function missingMessage(name: string) {
  return `Missing required Meta environment variable: ${name}`;
}

function getNormalizedMetaUserAccessToken(partial: boolean) {
  const primaryName = "META_USER_ACCESS_TOKEN";
  const namesInOrder = [primaryName, ...META_USER_TOKEN_ALIASES];

  for (const name of namesInOrder) {
    const value = readOptionalEnv(name).trim();
    if (!value) {
      continue;
    }

    if (!process.env[primaryName]) {
      process.env[primaryName] = value;
    }

    return value;
  }

  if (partial) {
    return "";
  }

  throw new Error(missingMessage(primaryName));
}

function getNormalizedMetaValue(params: {
  primaryName: string;
  aliases?: string[];
  partial: boolean;
}) {
  const namesInOrder = [params.primaryName, ...(params.aliases ?? [])];

  for (const name of namesInOrder) {
    const value = readOptionalEnv(name).trim();
    if (!value) {
      continue;
    }

    if (!process.env[params.primaryName]) {
      process.env[params.primaryName] = value;
    }

    return value;
  }

  if (params.partial) {
    return "";
  }

  throw new Error(missingMessage(params.primaryName));
}

export function getMetaConfig(partial = false): MetaConfig {
  const graphApiVersion = readMetaValue("META_GRAPH_API_VERSION") || DEFAULT_GRAPH_API_VERSION;

  const appId = getNormalizedMetaValue({
    primaryName: "META_APP_ID",
    aliases: META_APP_ID_ALIASES,
    partial,
  });
  const appSecret = getNormalizedMetaValue({
    primaryName: "META_APP_SECRET",
    aliases: META_APP_SECRET_ALIASES,
    partial,
  });
  const userAccessToken = getNormalizedMetaUserAccessToken(partial);
  const pageAccessToken = getNormalizedMetaValue({
    primaryName: "META_PAGE_ACCESS_TOKEN",
    aliases: META_PAGE_TOKEN_ALIASES,
    partial,
  });
  const pageId = getNormalizedMetaValue({
    primaryName: "META_PAGE_ID",
    aliases: META_PAGE_ID_ALIASES,
    partial,
  });
  const businessId = getNormalizedMetaValue({
    primaryName: "META_BUSINESS_ID",
    aliases: META_BUSINESS_ID_ALIASES,
    partial: true,
  });
  const verifyToken = getNormalizedMetaValue({
    primaryName: "META_VERIFY_TOKEN",
    aliases: META_VERIFY_TOKEN_ALIASES,
    partial: true,
  });

  const graphApiBaseUrl = `https://graph.facebook.com/${graphApiVersion}`;

  return {
    graphApiVersion,
    graphApiBaseUrl,
    appId,
    appSecret,
    userAccessToken,
    pageAccessToken,
    pageId,
    businessId,
    verifyToken,
  };
}

export function getMetaGraphBaseUrl() {
  return getMetaConfig(true).graphApiBaseUrl;
}

export function getMetaToken(tokenType: MetaTokenType) {
  const config = getMetaConfig();
  return tokenType === "user" ? config.userAccessToken : config.pageAccessToken;
}

export function getMetaSafeDiagnostics() {
  const config = getMetaConfig(true);

  return {
    graphApiVersion: config.graphApiVersion,
    graphApiBaseUrl: config.graphApiBaseUrl,
    appId: redactSecret(config.appId),
    appSecret: redactSecret(config.appSecret),
    userAccessToken: redactSecret(config.userAccessToken),
    pageAccessToken: redactSecret(config.pageAccessToken),
    pageId: config.pageId,
    businessId: config.businessId,
    verifyToken: redactSecret(config.verifyToken),
  };
}

export function assertMetaConfigForProduction() {
  const isProduction = readOptionalEnv("NODE_ENV") === "production";
  if (!isProduction) {
    return;
  }

  getMetaConfig();
}

export function isMetaWriteEnabled() {
  return readOptionalEnv("META_ADMIN_WRITE_ENABLED").trim().toLowerCase() === "true";
}
