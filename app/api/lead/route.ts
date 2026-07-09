import { NextResponse } from "next/server";

type LeadPayload = {
  name?: string;
  email?: string;
  projectType?: string;
  budgetRange?: string;
  timeline?: string;
  website?: string;
  submittedAt?: number;
  source?: string;
  utmSource?: string;
  utmCampaign?: string;
  message?: string;
};

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

async function upsertHubSpotContact(body: LeadPayload) {
  const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN;

  if (!hubspotToken || !body.email || !body.name) {
    return;
  }

  const { firstName, lastName } = splitName(body.name);

  const searchResponse = await fetch(
    "https://api.hubapi.com/crm/v3/objects/contacts/search",
    {
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
                value: body.email,
              },
            ],
          },
        ],
        properties: ["email", "firstname", "lastname"],
        limit: 1,
      }),
    }
  );

  if (!searchResponse.ok) {
    const searchError = await searchResponse.text();
    console.error("HubSpot search failure", searchError);
    return;
  }

  const searchJson = (await searchResponse.json()) as {
    results?: Array<{ id: string }>;
  };
  const contactId = searchJson.results?.[0]?.id;

  const hubspotPayload = {
    properties: {
      email: body.email,
      firstname: firstName,
      lastname: lastName,
      lifecyclestage: "lead",
    },
  };

  if (contactId) {
    const updateResponse = await fetch(
      `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${hubspotToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(hubspotPayload),
      }
    );

    if (!updateResponse.ok) {
      const updateError = await updateResponse.text();
      console.error("HubSpot update failure", updateError);
    }

    return;
  }

  const createResponse = await fetch(
    "https://api.hubapi.com/crm/v3/objects/contacts",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hubspotToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(hubspotPayload),
    }
  );

  if (!createResponse.ok) {
    const createError = await createResponse.text();
    console.error("HubSpot create failure", createError);
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as LeadPayload;

  if (body.website && body.website.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  if (typeof body.submittedAt === "number") {
    const elapsedMs = Date.now() - body.submittedAt;
    if (elapsedMs >= 0 && elapsedMs < 1200) {
      return NextResponse.json(
        { error: "Submission failed spam checks" },
        { status: 400 }
      );
    }
  }

  if (!body?.name || !body?.email || !body?.message) {
    return NextResponse.json(
      { error: "Missing required lead fields" },
      { status: 400 }
    );
  }

  const toEmail =
    process.env.LEAD_TO_EMAIL ?? "zerocool.development.project@gmail.com";
  const fromEmail =
    process.env.LEAD_FROM_EMAIL ?? "onboarding@resend.dev";
  const resendApiKey = process.env.RESEND_API_KEY;

  console.info("New lead submitted", {
    name: body.name,
    email: body.email,
    projectType: body.projectType,
    budgetRange: body.budgetRange,
    timeline: body.timeline,
    source: body.source,
    utmSource: body.utmSource,
    utmCampaign: body.utmCampaign,
  });

  await upsertHubSpotContact(body);

  if (!resendApiKey) {
    return NextResponse.json({
      ok: true,
      warning:
        "Lead captured but RESEND_API_KEY is missing, so no inbox email was sent.",
    });
  }

  const emailText = [
    "New website lead received",
    "",
    `Name: ${body.name}`,
    `Email: ${body.email}`,
    `Project Type: ${body.projectType ?? ""}`,
    `Budget Range: ${body.budgetRange ?? ""}`,
    `Timeline: ${body.timeline ?? ""}`,
    `Source: ${body.source ?? ""}`,
    `UTM Source: ${body.utmSource ?? ""}`,
    `UTM Campaign: ${body.utmCampaign ?? ""}`,
    "",
    "Project Details:",
    `${body.message}`,
  ].join("\n");

  const sendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      reply_to: body.email,
      subject: `New Lead: ${body.projectType ?? "Project Inquiry"}`,
      text: emailText,
    }),
  });

  if (!sendResponse.ok) {
    const sendError = await sendResponse.text();
    console.error("Resend send failure", sendError);

    return NextResponse.json(
      { error: "Lead captured but failed to send inbox email" },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
