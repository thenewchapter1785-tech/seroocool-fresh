import "server-only";

import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

export type MetaProfileUpdate = {
  about?: string;
  website?: string;
  email?: string;
  phone?: string;
  username?: string;
};

type PendingReview = {
  token: string;
  pageId: string;
  changes: Array<{ field: keyof MetaProfileUpdate; before: string; after: string }>;
  proposed: MetaProfileUpdate;
  createdAt: string;
  expiresAt: string;
};

type Store = {
  reviews: PendingReview[];
};

const STORE_PATH = path.join(process.cwd(), ".meta-profile-reviews.json");
const TTL_MS = 1000 * 60 * 20;

async function readStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Store;
    return {
      reviews: Array.isArray(parsed.reviews) ? parsed.reviews : [],
    };
  } catch {
    return { reviews: [] };
  }
}

async function writeStore(store: Store) {
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

function nonNull(value: string | undefined | null) {
  return (value ?? "").trim();
}

export function buildProfileDiff(current: MetaProfileUpdate, proposed: MetaProfileUpdate) {
  const fields: Array<keyof MetaProfileUpdate> = ["about", "website", "email", "phone", "username"];

  return fields
    .map((field) => {
      const before = nonNull(current[field]);
      const after = nonNull(proposed[field]);
      return {
        field,
        before,
        after,
      };
    })
    .filter((item) => item.before !== item.after);
}

export async function createMetaProfileReview(params: {
  pageId: string;
  current: MetaProfileUpdate;
  proposed: MetaProfileUpdate;
}) {
  const changes = buildProfileDiff(params.current, params.proposed);
  if (!changes.length) {
    throw new Error("No profile changes detected.");
  }

  const token = randomUUID();
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + TTL_MS).toISOString();

  const review: PendingReview = {
    token,
    pageId: params.pageId,
    changes,
    proposed: params.proposed,
    createdAt,
    expiresAt,
  };

  const store = await readStore();
  store.reviews = store.reviews.filter((item) => Date.parse(item.expiresAt) > Date.now());
  store.reviews.push(review);
  await writeStore(store);

  return review;
}

export async function consumeMetaProfileReview(token: string) {
  const store = await readStore();
  const idx = store.reviews.findIndex((item) => item.token === token);

  if (idx < 0) {
    return null;
  }

  const review = store.reviews[idx];
  store.reviews.splice(idx, 1);
  await writeStore(store);

  if (Date.parse(review.expiresAt) <= Date.now()) {
    return null;
  }

  return review;
}
