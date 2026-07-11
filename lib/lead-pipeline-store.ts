import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type LeadSubmissionStatus = "pending" | "delivered" | "partial_failure" | "failed";

export type ProviderResult = {
  ok: boolean;
  errorCode?: string;
  statusCode?: number;
  contactId?: string | null;
  messageId?: string | null;
};

export type StoredLeadSubmission = {
  submissionId: string;
  createdAt: string;
  updatedAt: string;
  status: LeadSubmissionStatus;
  formType: string;
  source: string;
  pageUrl: string;
  name: string;
  email: string;
  hubspot: ProviderResult;
  emailDelivery: ProviderResult;
  retryStatus: "none" | "needed";
};

export type LeadPipelineState = {
  lastSubmissionAt?: string;
  lastSuccessfulSubmissionAt?: string;
  lastHubSpotSuccessAt?: string;
  lastEmailSuccessAt?: string;
  recentFailures: Array<{
    submissionId: string;
    at: string;
    formType: string;
    status: LeadSubmissionStatus;
    hubspotErrorCode?: string;
    emailErrorCode?: string;
  }>;
};

const DATA_DIR = path.join(process.cwd(), "logs");
const SUBMISSIONS_FILE = path.join(DATA_DIR, "lead-submissions.json");
const STATE_FILE = path.join(DATA_DIR, "lead-pipeline-state.json");

async function ensureDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonFile(filePath: string, value: unknown) {
  await ensureDir();
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function saveLeadSubmission(record: StoredLeadSubmission) {
  const all = await readJsonFile<StoredLeadSubmission[]>(SUBMISSIONS_FILE, []);
  const withoutCurrent = all.filter((item) => item.submissionId !== record.submissionId);
  withoutCurrent.unshift(record);
  await writeJsonFile(SUBMISSIONS_FILE, withoutCurrent.slice(0, 500));

  const state = await readJsonFile<LeadPipelineState>(STATE_FILE, {
    recentFailures: [],
  });

  state.lastSubmissionAt = record.updatedAt;

  if (record.status === "delivered") {
    state.lastSuccessfulSubmissionAt = record.updatedAt;
  }

  if (record.hubspot.ok) {
    state.lastHubSpotSuccessAt = record.updatedAt;
  }

  if (record.emailDelivery.ok) {
    state.lastEmailSuccessAt = record.updatedAt;
  }

  if (record.status === "partial_failure" || record.status === "failed") {
    state.recentFailures.unshift({
      submissionId: record.submissionId,
      at: record.updatedAt,
      formType: record.formType,
      status: record.status,
      hubspotErrorCode: record.hubspot.errorCode,
      emailErrorCode: record.emailDelivery.errorCode,
    });
    state.recentFailures = state.recentFailures.slice(0, 25);
  }

  await writeJsonFile(STATE_FILE, state);
}

export async function getLeadPipelineState() {
  return readJsonFile<LeadPipelineState>(STATE_FILE, {
    recentFailures: [],
  });
}

export async function getRecentLeadSubmissions(limit = 50) {
  const all = await readJsonFile<StoredLeadSubmission[]>(SUBMISSIONS_FILE, []);
  return all.slice(0, limit);
}
