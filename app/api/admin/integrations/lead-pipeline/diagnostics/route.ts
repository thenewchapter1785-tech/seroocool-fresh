import { NextResponse } from "next/server";
import { checkEmailProviderConnection } from "@/lib/email-notifications";
import { validateHubSpotConnection } from "@/lib/hubspot";
import {
  getLeadPipelineState,
  getRecentLeadSubmissions,
  type StoredLeadSubmission,
} from "@/lib/lead-pipeline-store";

export const dynamic = "force-dynamic";

function summarizeRecentFailures(recent: StoredLeadSubmission[]) {
  return recent
    .filter((submission) => submission.status !== "delivered")
    .slice(0, 20)
    .map((submission) => ({
      id: submission.submissionId,
      timestamp: submission.updatedAt,
      status: submission.status,
      formType: submission.formType,
      hubspot: {
        ok: submission.hubspot.ok,
        errorCode: submission.hubspot.errorCode,
      },
      email: {
        ok: submission.emailDelivery.ok,
        errorCode: submission.emailDelivery.errorCode,
      },
      meta: {
        source: submission.source,
        pageUrl: submission.pageUrl,
        retryStatus: submission.retryStatus,
      },
    }));
}

function countStatuses(recent: StoredLeadSubmission[]) {
  return recent.reduce(
    (acc, submission) => {
      acc.received += 1;

      if (submission.status === "delivered") {
        acc.delivered += 1;
      } else if (submission.status === "partial_failure") {
        acc.partialFailure += 1;
      } else if (submission.status === "failed") {
        acc.failed += 1;
      }

      return acc;
    },
    {
      received: 0,
      delivered: 0,
      partialFailure: 0,
      failed: 0,
    }
  );
}

export async function GET() {
  const [hubspot, email, state, recent] = await Promise.all([
    validateHubSpotConnection(),
    checkEmailProviderConnection(),
    getLeadPipelineState(),
    getRecentLeadSubmissions(500),
  ]);

  const recentFailures = summarizeRecentFailures(recent);
  const totals = countStatuses(recent);

  return NextResponse.json({
    ok: hubspot.ok && email.ok,
    generatedAt: new Date().toISOString(),
    providers: {
      hubspot: {
        ok: hubspot.ok,
        errorCode: hubspot.errorCode,
        message: hubspot.safeMessage,
      },
      email: {
        ok: email.ok,
        provider: email.provider,
        errorCode: email.errorCode,
        message: email.safeMessage,
      },
    },
    pipeline: {
      totals,
      lastSubmissionAt: state.lastSubmissionAt,
      lastFailureAt: state.recentFailures[0]?.at,
    },
    recentFailures,
  });
}
