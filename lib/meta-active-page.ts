import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { getMetaConfig } from "@/lib/meta-config";

const STORE_PATH = path.join(process.cwd(), ".meta-active-page.json");

type ActivePageStore = {
  pageId: string;
  updatedAt: string;
};

async function readStore() {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as ActivePageStore;
  } catch {
    return null;
  }
}

export async function getActiveMetaPageId() {
  const store = await readStore();
  if (store?.pageId) {
    return store.pageId;
  }

  return getMetaConfig().pageId;
}

export async function setActiveMetaPageId(pageId: string) {
  const payload: ActivePageStore = {
    pageId,
    updatedAt: new Date().toISOString(),
  };

  await fs.writeFile(STORE_PATH, JSON.stringify(payload, null, 2), "utf8");

  return payload;
}
