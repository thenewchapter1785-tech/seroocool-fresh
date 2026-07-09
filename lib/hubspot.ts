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

type HubSpotContactInput = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  websiteUrl?: string;
};

const HUBSPOT_CONTACTS_API = "https://api.hubapi.com/crm/v3/objects/contacts";
const HUBSPOT_DEALS_API = "https://api.hubapi.com/crm/v3/objects/deals";
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

async function searchContactByEmail(email: string, token: string) {
  const response = await fetchWithTimeout(`${HUBSPOT_CONTACTS_API}/search`, {
    method: "POST",
    headers: getHubSpotHeaders(token),
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
    const errorText = await response.text();
    throw new Error(`HubSpot search failed: ${errorText}`);
  }

  const json = (await response.json()) as {
    results?: Array<{ id: string }>;
  };

  return json.results?.[0]?.id ?? null;
}

export async function createOrUpdateContact(input: HubSpotContactInput) {
  const hubspotToken = readOptionalEnv("HUBSPOT_ACCESS_TOKEN");

  if (!hubspotToken || !input.email || !input.name) {
    return { ok: false, reason: "missing-config-or-fields" as const };
  }

  const contactId = await searchContactByEmail(input.email, hubspotToken);
  const { firstName, lastName } = splitName(input.name);

  const payload = {
    properties: {
      email: input.email,
      firstname: firstName,
      lastname: lastName,
      phone: input.phone ?? "",
      company: input.company ?? "",
      website: input.websiteUrl ?? "",
      lifecyclestage: "lead",
    },
  };

  if (contactId) {
    const response = await fetchWithTimeout(`${HUBSPOT_CONTACTS_API}/${contactId}`, {
      method: "PATCH",
      headers: getHubSpotHeaders(hubspotToken),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HubSpot update failed: ${errorText}`);
    }

    return { ok: true, action: "updated" as const, contactId };
  }

  const response = await fetchWithTimeout(HUBSPOT_CONTACTS_API, {
    method: "POST",
    headers: getHubSpotHeaders(hubspotToken),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HubSpot create failed: ${errorText}`);
  }

  const createdJson = (await response.json()) as { id?: string };

  return {
    ok: true,
    action: "created" as const,
    contactId: createdJson.id ?? null,
  };
}

export async function addNoteToContact(params: {
  contactId?: string | null;
  email?: string;
  note: string;
}) {
  const hubspotToken = readOptionalEnv("HUBSPOT_ACCESS_TOKEN");

  if (!hubspotToken || !params.note) {
    return { ok: false, reason: "missing-config-or-fields" as const };
  }

  let contactId = params.contactId ?? null;

  if (!contactId && params.email) {
    contactId = await searchContactByEmail(params.email, hubspotToken);
  }

  if (!contactId) {
    return { ok: false, reason: "contact-not-found" as const };
  }

  const response = await fetchWithTimeout("https://api.hubapi.com/crm/v3/objects/notes", {
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
    const errorText = await response.text();
    throw new Error(`HubSpot note create failed: ${errorText}`);
  }

  return { ok: true, contactId };
}

export async function createDealPlaceholder(params: {
  contactId?: string | null;
  email?: string;
  dealName: string;
  amount?: string;
  details?: string;
}) {
  const hubspotToken = readOptionalEnv("HUBSPOT_ACCESS_TOKEN");

  if (!hubspotToken || !params.dealName) {
    return { ok: false, reason: "missing-config-or-fields" as const };
  }

  let contactId = params.contactId ?? null;
  if (!contactId && params.email) {
    contactId = await searchContactByEmail(params.email, hubspotToken);
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
    const errorText = await response.text();
    throw new Error(`HubSpot deal create failed: ${errorText}`);
  }

  const json = (await response.json()) as { id?: string };
  return { ok: true, dealId: json.id ?? null, contactId };
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

  await addNoteToContact({
    contactId: contact.contactId,
    email: input.email,
    note: noteParts.join("\n"),
  });

  await createDealPlaceholder({
    contactId: contact.contactId,
    email: input.email,
    dealName: `${input.projectType || "Technology"} Inquiry - ${input.name}`,
    amount: input.budgetRange?.replace(/[^0-9]/g, "") || "0",
    details: input.notes,
  }).catch((error) => {
    console.error("HubSpot deal placeholder failed", error);
  });

  return { ok: true, action: contact.action, contactId: contact.contactId };
}

export async function upsertHubSpotLead(input: HubSpotLeadInput) {
  return createLead(input);
}
