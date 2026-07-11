import "server-only";

type LeadEvent =
  | "submission_received"
  | "validation_failed"
  | "spam_rejected"
  | "hubspot_success"
  | "hubspot_failed"
  | "email_success"
  | "email_failed"
  | "submission_completed"
  | "submission_partial_failure";

export function logLeadEvent(params: {
  event: LeadEvent;
  submissionId: string;
  formType: string;
  status: string;
  providerStatusCode?: number;
  errorCode?: string;
}) {
  const payload = {
    scope: "lead_pipeline",
    event: params.event,
    submissionId: params.submissionId,
    formType: params.formType,
    status: params.status,
    providerStatusCode: params.providerStatusCode ?? null,
    errorCode: params.errorCode ?? null,
    timestamp: new Date().toISOString(),
  };

  console.info(JSON.stringify(payload));
}
