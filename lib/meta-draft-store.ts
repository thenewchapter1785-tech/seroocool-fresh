import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { sanitizeText } from "@/lib/api-security";

type MetaPostDraft = {
  id: string;
  title: string;
  message: string;
  link: string;
  scheduleAt: string;
  updatedAt: string;
};

type DraftStore = {
  drafts: MetaPostDraft[];
};

const STORE_PATH = path.join(process.cwd(), ".meta-post-drafts.json");

async function readStore(): Promise<DraftStore> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as DraftStore;
    return {
      drafts: Array.isArray(parsed.drafts) ? parsed.drafts : [],
    };
  } catch {
    return { drafts: [] };
  }
}

async function writeStore(store: DraftStore) {
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

export async function listMetaPostDrafts() {
  const store = await readStore();
  return store.drafts.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function upsertMetaPostDraft(input: {
  id?: string;
  title?: string;
  message?: string;
  link?: string;
  scheduleAt?: string;
}) {
  const title = sanitizeText(input.title, 120) || "Untitled draft";
  const message = sanitizeText(input.message, 5000);
  const link = sanitizeText(input.link, 300);
  const scheduleAt = sanitizeText(input.scheduleAt, 60);

  if (!message) {
    throw new Error("Draft message is required.");
  }

  const store = await readStore();
  const id = sanitizeText(input.id, 40) || randomId();
  const updatedAt = new Date().toISOString();

  const next: MetaPostDraft = {
    id,
    title,
    message,
    link,
    scheduleAt,
    updatedAt,
  };

  const idx = store.drafts.findIndex((draft) => draft.id === id);
  if (idx >= 0) {
    store.drafts[idx] = next;
  } else {
    store.drafts.push(next);
  }

  await writeStore(store);
  return next;
}

export async function deleteMetaPostDraft(id: string) {
  const safeId = sanitizeText(id, 40);
  const store = await readStore();
  const before = store.drafts.length;
  store.drafts = store.drafts.filter((draft) => draft.id !== safeId);
  await writeStore(store);
  return before !== store.drafts.length;
}
