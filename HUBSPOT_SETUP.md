# HubSpot Integration Setup

This project now supports HubSpot contact upsert on every lead form submission.

## What is already integrated

- Lead form submits to `/api/lead`
- API sends inbox notification (Resend)
- API also creates or updates a HubSpot contact by email

## Required Environment Variables

Set these in DigitalOcean App Settings (or local `.env.local`):

- `HUBSPOT_ACCESS_TOKEN`
- `RESEND_API_KEY`
- `CONTACT_EMAIL` (`zerocool.development.project@gmail.com`)
- `LEAD_FROM_EMAIL`
- `NEXT_PUBLIC_HUBSPOT_PORTAL_ID`
- `OPENAI_API_KEY` (required for `/api/ai-assistant`)

Optional website/social settings:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_FACEBOOK_PAGE_URL`
- `NEXT_PUBLIC_INSTAGRAM_PROFILE_URL`

## Create HubSpot Private App Token

1. In HubSpot, go to Settings.
2. Navigate to Integrations -> Private Apps.
3. Create a new private app.
4. Grant these scopes:
   - `crm.objects.contacts.read`
   - `crm.objects.contacts.write`
5. Create app and copy the access token.
6. Save it as `HUBSPOT_ACCESS_TOKEN`.

## Local Test

1. Add env vars to `.env.local`.
2. Submit the contact form on the site.
3. Verify:
   - Email arrives in your inbox.
   - Contact appears in HubSpot.

## Production Validation

1. Run `./scripts/verify-production.ps1` after each deploy.
2. Optionally run `./scripts/verify-production.ps1 -RunLiveLeadCheck` to submit a live synthetic lead.
3. Confirm the synthetic lead appears in HubSpot and an inbox notification is delivered.
4. Confirm `CONTACT_EMAIL` in DigitalOcean is set to `zerocool.development.project@gmail.com`.

## Notes

- Current integration writes standard contact fields (`email`, `firstname`, `lastname`, `lifecyclestage`).
- Source/campaign fields remain available in your API payload and inbox email.
- Next upgrade can add automatic deal creation and source tagging in HubSpot.

## Terminal-First Setup (PowerShell)

Run this helper to configure HubSpot and related env vars directly in DigitalOcean without saving tokens in repo files:

```powershell
.\scripts\configure-hubspot-env.ps1
```

What it does:

- Prompts for `HUBSPOT_ACCESS_TOKEN` (secure input)
- Prompts for `NEXT_PUBLIC_HUBSPOT_PORTAL_ID`
- Prompts for `RESEND_API_KEY` (secure input)
- Optionally sets social/meta env vars
- Validates and updates the app spec via `doctl apps update --spec - --wait`

Security note:

- Enter secrets directly in terminal prompts (never in chat/messages).
- Rotate `HUBSPOT_ACCESS_TOKEN` and `RESEND_API_KEY` immediately if they were shared in chat or pasted into logs.
