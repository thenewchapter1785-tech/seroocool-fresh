import { readOptionalEnv } from "@/lib/env";

export type HubSpotLeadInput = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  projectType?: string;
  budgetRange?: string;
  timeline?: string;
  notes?: string;
  formType?: string;
  websiteUrl?: string;
};

export type HubSpotContactInput = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  websiteUrl?: string;
};

export type HubSpotErrorCode =
  | "HUBSPOT_MISSING_TOKEN"
  | "HUBSPOT_BAD_REQUEST"
  | "HUBSPOT_UNAUTHORIZED"
  | "HUBSPOT_FORBIDDEN"
  | "HUBSPOT_CONFLICT"
  | "HUBSPOT_RATE_LIMITED"
  | "HUBSPOT_SERVER_ERROR"
  | "HUBSPOT_NETWORK_ERROR"
  | "HUBSPOT_CONTACT_NOT_FOUND";

type HubSpotResultBase = {
  ok: boolean;
  statusCode?: number;
  errorCode?: HubSpotErrorCode;
  safeMessage?: string;
};

export type HubSpotConnectionResult = HubSpotResultBase & {
  portalId?: number;
};

export type HubSpotFindContactResult = HubSpotResultBase & {
  contactId: string | null;
};

export type HubSpotUpsertContactResult = HubSpotResultBase & {
  action?: "created" | "updated";
  contactId: string | null;
};

const HUBSPOT_CONTACTS_API = "https://api.hubapi.com/crm/v3/objects/contacts";
const HUBSPOT_DEALS_API = "https://api.hubapi.com/crm/v3/objects/deals";
const HUBSPOT_NOTES_API = "https://api.hubapi.com/crm/v3/objects/notes";
const HUBSPOT_ACCOUNT_INFO_API = "https://api.hubapi.com/integrations/v1/me";
const EXTERNAL_REQUEST_TIMEOUT_MS = 8000;

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs = EXTERNAL_REQUEST_TIMEOUT_MS
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function getHubSpotHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function getHubSpotToken() {
  return readOptionalEnv("HUBSPOT_ACCESS_TOKEN").trim();
}

function splitName(fullName: string) {
  const trimmed = fullName.trim();

  if (!trimmed) {
    return { firstName: "", lastName: "" };
  }

  const parts = trimmed.split(/\s+/);
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ");

  return { firstName, lastName };
}

function mapHubSpotStatusCode(statusCode: number): HubSpotErrorCode {
  if (statusCode === 400) {
    return "HUBSPOT_BAD_REQUEST";
  }
  if (statusCode === 401) {
    return "HUBSPOT_UNAUTHORIZED";
  }
  if (statusCode === 403) {
    return "HUBSPOT_FORBIDDEN";
  }
  if (statusCode === 409) {
    return "HUBSPOT_CONFLICT";
  }
  if (statusCode === 429) {
    return "HUBSPOT_RATE_LIMITED";
  }

  return "HUBSPOT_SERVER_ERROR";
}

async function toErrorResult(response: Response): Promise<HubSpotResultBase> {
  const statusCode = response.status;
  await response.text().catch(() => "");

  return {
    ok: false,
    statusCode,
    errorCode: mapHubSpotStatusCode(statusCode),
    safeMessage: `HubSpot request failed with status ${statusCode}.`,
  };
}

export async function validateHubSpotConnection(): Promise<HubSpotConnectionResult> {
  const hubspotToken = getHubSpotToken();

  if (!hubspotToken) {
    return {
      ok: false,
      errorCode: "HUBSPOT_MISSING_TOKEN",
      safeMessage: "HUBSPOT_ACCESS_TOKEN is missing.",
    };
  }

  try {
    const response = await fetchWithTimeout(HUBSPOT_ACCOUNT_INFO_API, {
      method: "GET",
      headers: getHubSpotHeaders(hubspotToken),
    });

    if (!response.ok) {
      return toErrorResult(response);
    }

    const payload = (await response.json()) as { portalId?: number };

    return {
      ok: true,
      statusCode: response.status,
      portalId: payload.portalId,
    };
  } catch {
    return {
      ok: false,
      errorCode: "HUBSPOT_NETWORK_ERROR",
      safeMessage: "Unable to reach HubSpot.",
    };
  }
}

export async function findContactByEmail(email: string): Promise<HubSpotFindContactResult> {
  const hubspotToken = getHubSpotToken();

  if (!hubspotToken) {
    return {
      ok: false,
      contactId: null,
      errorCode: "HUBSPOT_MISSING_TOKEN",
      safeMessage: "HUBSPOT_ACCESS_TOKEN is missing.",
    };
  }

  try {
    const response = await fetchWithTimeout(`${HUBSPOT_CONTACTS_API}/search`, {
      method: "POST",
      headers: getHubSpotHeaders(hubspotToken),
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              {
                propertyName: "email",
                operator: "EQ",
                value: email,
              },
            ],
          },
        ],
        properties: ["email", "firstname", "lastname"],
        limit: 1,
      }),
    });

    if (!response.ok) {
      const error = await toErrorResult(response);
      return {
        ...error,
        contactId: null,
      };
    }

    const json = (await response.json()) as {
      results?: Array<{ id: string }>;
    };

    return {
      ok: true,
      statusCode: response.status,
      contactId: json.results?.[0]?.id ?? null,
    };
  } catch {
    return {
      ok: false,
      contactId: null,
      errorCode: "HUBSPOT_NETWORK_ERROR",
      safeMessage: "Unable to search HubSpot contact.",
    };
  }
}

export async function createContact(input: HubSpotContactInput): Promise<HubSpotUpsertContactResult> {
  const hubspotToken = getHubSpotToken();

  if (!hubspotToken) {
    return {
      ok: false,
      contactId: null,
      errorCode: "HUBSPOT_MISSING_TOKEN",
      safeMessage: "HUBSPOT_ACCESS_TOKEN is missing.",
    };
  }

  const { firstName, lastName } = splitName(input.name);

  try {
    const response = await fetchWithTimeout(HUBSPOT_CONTACTS_API, {
      method: "POST",
      headers: getHubSpotHeaders(hubspotToken),
      body: JSON.stringify({
        properties: {
          email: input.email,
          firstname: firstName,
          lastname: lastName,
          phone: input.phone ?? "",
          company: input.company ?? "",
          website: input.websiteUrl ?? "",
          lifecyclestage: "lead",
        },
      }),
    });

    if (!response.ok) {
      const error = await toErrorResult(response);
      return {
        ...error,
        contactId: null,
      };
    }

    const createdJson = (await response.json()) as { id?: string };

    return {
      ok: true,
      action: "created",
      statusCode: response.status,
      contactId: createdJson.id ?? null,
    };
  } catch {
    return {
      ok: false,
      contactId: null,
      errorCode: "HUBSPOT_NETWORK_ERROR",
      safeMessage: "Unable to create HubSpot contact.",
    };
  }
}

export async function updateContact(params: {
  contactId: string;
  input: HubSpotContactInput;
}): Promise<HubSpotUpsertContactResult> {
  const hubspotToken = getHubSpotToken();

  if (!hubspotToken) {
    return {
      ok: false,
      contactId: null,
      errorCode: "HUBSPOT_MISSING_TOKEN",
      safeMessage: "HUBSPOT_ACCESS_TOKEN is missing.",
    };
  }

  const { firstName, lastName } = splitName(params.input.name);

  try {
    const response = await fetchWithTimeout(`${HUBSPOT_CONTACTS_API}/${params.contactId}`, {
      method: "PATCH",
      headers: getHubSpotHeaders(hubspotToken),
      body: JSON.stringify({
        properties: {
          email: params.input.email,
          firstname: firstName,
          lastname: lastName,
          phone: params.input.phone ?? "",
          company: params.input.company ?? "",
          website: params.input.websiteUrl ?? "",
          lifecyclestage: "lead",
        },
      }),
    });

    if (!response.ok) {
      const error = await toErrorResult(response);
      return {
        ...error,
        contactId: null,
      };
    }

    return {
      ok: true,
      action: "updated",
      statusCode: response.status,
      contactId: params.contactId,
    };
  } catch {
    return {
      ok: false,
      contactId: null,
      errorCode: "HUBSPOT_NETWORK_ERROR",
      safeMessage: "Unable to update HubSpot contact.",
    };
  }
}

export async function createOrUpdateContact(input: HubSpotContactInput): Promise<HubSpotUpsertContactResult> {
  if (!input.name || !input.email) {
    return {
      ok: false,
      contactId: null,
      errorCode: "HUBSPOT_BAD_REQUEST",
      safeMessage: "Contact name and email are required.",
    };
  }

  const lookup = await findContactByEmail(input.email);
  if (!lookup.ok) {
    return {
      ok: false,
      contactId: null,
      statusCode: lookup.statusCode,
      errorCode: lookup.errorCode,
      safeMessage: lookup.safeMessage,
    };
  }

  if (lookup.contactId) {
    return updateContact({
      contactId: lookup.contactId,
      input,
    });
  }

  return createContact(input);
}

export async function addSubmissionNote(params: {
  contactId?: string | null;
  email?: string;
  note: string;
}) {
  const hubspotToken = getHubSpotToken();

  if (!hubspotToken || !params.note) {
    return {
      ok: false,
      errorCode: "HUBSPOT_MISSING_TOKEN" as HubSpotErrorCode,
    };
  }

  let contactId = params.contactId ?? null;

  if (!contactId && params.email) {
    const lookup = await findContactByEmail(params.email);
    contactId = lookup.ok ? lookup.contactId : null;
  }

  if (!contactId) {
    return {
      ok: false,
      errorCode: "HUBSPOT_CONTACT_NOT_FOUND" as HubSpotErrorCode,
    };
  }

  const response = await fetchWithTimeout(HUBSPOT_NOTES_API, {
    method: "POST",
    headers: getHubSpotHeaders(hubspotToken),
    body: JSON.stringify({
      properties: {
        hs_note_body: params.note,
        hs_timestamp: new Date().toISOString(),
      },
      associations: [
        {
          to: {
            id: contactId,
          },
          types: [
            {
              associationCategory: "HUBSPOT_DEFINED",
              associationTypeId: 202,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    return toErrorResult(response);
  }

  return { ok: true, contactId, statusCode: response.status };
}

export async function createLeadOrDeal(params: {
  contactId?: string | null;
  email?: string;
  dealName: string;
  amount?: string;
  details?: string;
}) {
  const hubspotToken = getHubSpotToken();

  if (!hubspotToken || !params.dealName) {
    return {
      ok: false,
      errorCode: "HUBSPOT_MISSING_TOKEN" as HubSpotErrorCode,
    };
  }

  let contactId = params.contactId ?? null;
  if (!contactId && params.email) {
    const lookup = await findContactByEmail(params.email);
    contactId = lookup.ok ? lookup.contactId : null;
  }

  const payload: {
    properties: Record<string, string>;
    associations?: Array<{
      to: { id: string };
      types: Array<{ associationCategory: string; associationTypeId: number }>;
    }>;
  } = {
    properties: {
      dealname: params.dealName,
      pipeline: "default",
      dealstage: "appointmentscheduled",
      amount: params.amount ?? "0",
      closedate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      description: params.details ?? "Lead-generated deal placeholder",
    },
  };

  if (contactId) {
    payload.associations = [
      {
        to: { id: contactId },
        types: [
          {
            associationCategory: "HUBSPOT_DEFINED",
            associationTypeId: 3,
          },
        ],
      },
    ];
  }

  const response = await fetchWithTimeout(HUBSPOT_DEALS_API, {
    method: "POST",
    headers: getHubSpotHeaders(hubspotToken),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return toErrorResult(response);
  }

  const json = (await response.json()) as { id?: string };
  return { ok: true, dealId: json.id ?? null, contactId, statusCode: response.status };
}

export async function createLead(input: HubSpotLeadInput) {
  const contact = await createOrUpdateContact({
    name: input.name,
    email: input.email,
    phone: input.phone,
    company: input.company,
    websiteUrl: input.websiteUrl,
  });

  if (!contact.ok) {
    return contact;
  }

  const noteParts = [
    `Form Type: ${input.formType || "contact_form"}`,
    `Project Type: ${input.projectType || "not provided"}`,
    `Budget Range: ${input.budgetRange || "not provided"}`,
    `Timeline: ${input.timeline || "not provided"}`,
    `Notes: ${input.notes || "not provided"}`,
  ];

  await addSubmissionNote({
    contactId: contact.contactId,
    email: input.email,
    note: noteParts.join("\n"),
  }).catch(() => {
    // Keep lead processing resilient if note fails.
  });

  await createLeadOrDeal({
    contactId: contact.contactId,
    email: input.email,
    dealName: `${input.projectType || "Technology"} Inquiry - ${input.name}`,
    amount: input.budgetRange?.replace(/[^0-9]/g, "") || "0",
    details: input.notes,
  }).catch(() => {
    // Do not fail the contact flow if deal creation fails.
  });

  return { ok: true, action: contact.action, contactId: contact.contactId };
}

export async function upsertHubSpotLead(input: HubSpotLeadInput) {
  return createLead(input);
}
