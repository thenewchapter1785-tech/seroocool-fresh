import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

type SyncCacheRecord = {
  timestamp: number;
  payload: unknown;
};

type SyncCacheStore = {
  records: Record<string, SyncCacheRecord>;
};

const STORE_PATH = path.join(process.cwd(), ".meta-sync-cache.json");

async function readStore(): Promise<SyncCacheStore> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as SyncCacheStore;
    return {
      records: parsed.records ?? {},
    };
  } catch {
    return { records: {} };
  }
}

async function writeStore(store: SyncCacheStore) {
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

export async function getMetaSyncCache(key: string, ttlMs: number) {
  const store = await readStore();
  const record = store.records[key];
  if (!record) {
    return null;
  }

  if (Date.now() - record.timestamp > ttlMs) {
    delete store.records[key];
    await writeStore(store);
    return null;
  }

  return record.payload;
}

export async function setMetaSyncCache(key: string, payload: unknown) {
  const store = await readStore();
  store.records[key] = {
    timestamp: Date.now(),
    payload,
  };
  await writeStore(store);
}
