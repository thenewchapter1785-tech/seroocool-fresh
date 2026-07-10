# ZeroCool Development Website

Production marketing site and lead pipeline for ZeroCool Development.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- DigitalOcean App Platform
- Cloudflare DNS/CDN/WAF
- HubSpot contact upsert + Resend notifications

## Core Features

- Dark blue/white technology brand theme focused on trust and lead generation
- Lead and estimate forms posting to `/api/contact` (`/api/lead` alias supported)
- Anti-spam checks (honeypot + minimum submit time)
- Rate limiting, CORS checks, and payload validation/sanitization on API routes
- HubSpot contact create/update by email
- Inbox alert via Resend
- Backend-only AI assistant endpoint at `/api/ai-assistant`
- Customer Problem Finder flow with estimate prefill links
- SEO routes: `robots.txt`, `sitemap.xml`, `manifest.webmanifest`
- Security headers and canonical host redirects

## Local Development

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality Checks

```powershell
npm run lint
npm run build
```

If your shell cannot find Node/npm, use:

```powershell
.\scripts\run-npm.ps1 lint
.\scripts\run-npm.ps1 build
```

## Production Configuration

Set these env vars in DigitalOcean App Platform:

- `NODE_ENV=production`
- `NEXT_PUBLIC_SITE_URL=https://zerocool-development.com`
- `CONTACT_EMAIL=zerocool.development.project@gmail.com`
- `LEAD_FROM_EMAIL=onboarding@resend.dev` (or your verified sender)
- `RESEND_API_KEY`
- `HUBSPOT_ACCESS_TOKEN`
- `NEXT_PUBLIC_HUBSPOT_PORTAL_ID`
- `OPENAI_API_KEY`

Local env support:

- Copy `.env.example` to `.env.local` and set values for local development.

Optional social/attribution variables:

- `NEXT_PUBLIC_FACEBOOK_PAGE_URL`
- `NEXT_PUBLIC_INSTAGRAM_PROFILE_URL`
- `NEXT_PUBLIC_META_PIXEL_ID`
- `FACEBOOK_DOMAIN_VERIFICATION`
- `GOOGLE_SITE_VERIFICATION`

## Deployment

- App spec: `app.json`
- Domain-oriented spec: `app-domain-spec.yaml`
- Setup helper: `scripts/configure-hubspot-env.ps1`
- Health verification: `scripts/verify-production.ps1`

See full runbook in `DEPLOYMENT.md`.

## Security + SEO

- Security headers are configured in `next.config.ts` including CSP and HSTS.
- Canonical domain is `https://zerocool-development.com`.
- SEO metadata and structured data are implemented in App Router pages/layout.

## Lead Pipeline Validation

Run:

```powershell
.\scripts\verify-production.ps1
```

Run with synthetic lead:

```powershell
.\scripts\verify-production.ps1 -RunLiveLeadCheck
```

Confirm:

- Endpoint returns success
- Inbox notification is delivered
- Contact exists in HubSpot
