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

const HUBSPOT_API_BASE = "https://api.hubapi.com/crm/v3/objects/contacts";
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

export async function upsertHubSpotLead(input: HubSpotLeadInput) {
  const hubspotToken = readOptionalEnv("HUBSPOT_ACCESS_TOKEN");

  if (!hubspotToken || !input.email || !input.name) {
    return { ok: false, reason: "missing-config-or-fields" as const };
  }

  const { firstName, lastName } = splitName(input.name);

  const searchResponse = await fetchWithTimeout(`${HUBSPOT_API_BASE}/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${hubspotToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filterGroups: [
        {
          filters: [
            {
              propertyName: "email",
              operator: "EQ",
              value: input.email,
            },
          ],
        },
      ],
      properties: ["email", "firstname", "lastname"],
      limit: 1,
    }),
  });

  if (!searchResponse.ok) {
    const errorText = await searchResponse.text();
    throw new Error(`HubSpot search failed: ${errorText}`);
  }

  const searchJson = (await searchResponse.json()) as {
    results?: Array<{ id: string }>;
  };
  const contactId = searchJson.results?.[0]?.id;

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
    const updateResponse = await fetchWithTimeout(`${HUBSPOT_API_BASE}/${contactId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${hubspotToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`HubSpot update failed: ${errorText}`);
    }

    return { ok: true, action: "updated" as const };
  }

  const createResponse = await fetchWithTimeout(HUBSPOT_API_BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${hubspotToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    throw new Error(`HubSpot create failed: ${errorText}`);
  }

  return { ok: true, action: "created" as const };
}
