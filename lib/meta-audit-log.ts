import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

type AuditEvent = {
  timestamp: string;
  route: string;
  action: string;
  ip: string;
  targetId?: string;
  details?: string;
};

const LOG_PATH = path.join(process.cwd(), "logs", "meta-admin-audit.log");

async function ensureLogDir() {
  await fs.mkdir(path.dirname(LOG_PATH), { recursive: true });
}

function sanitizeLogValue(value: string | undefined, limit = 180) {
  if (!value) {
    return "";
  }

  return value.replace(/[\r\n\t]/g, " ").slice(0, limit);
}

export async function writeMetaAuditLog(event: AuditEvent) {
  await ensureLogDir();

  const line = JSON.stringify({
    timestamp: event.timestamp,
    route: sanitizeLogValue(event.route, 120),
    action: sanitizeLogValue(event.action, 100),
    ip: sanitizeLogValue(event.ip, 80),
    targetId: sanitizeLogValue(event.targetId, 120),
    details: sanitizeLogValue(event.details, 250),
  });

  await fs.appendFile(LOG_PATH, `${line}\n`, "utf8");
}
