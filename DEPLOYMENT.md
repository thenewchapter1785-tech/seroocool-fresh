# Deployment Runbook (DigitalOcean + Cloudflare)

This runbook is for ZeroCool Development production deployment and verification.

## Architecture

- Hosting: DigitalOcean App Platform
- DNS/CDN/WAF: Cloudflare
- App domain: `zerocool-development.com`
- Canonical redirect: `www.zerocool-development.com` -> `zerocool-development.com`
- Lead intake: Next.js API route `/api/lead`
- Notification: Resend
- CRM upsert: HubSpot contacts

## Required Tools

- `doctl`
- Node.js 18+
- PowerShell 5.1+

## Required Environment Variables

Set these in DigitalOcean App settings:

- `NODE_ENV=production`
- `NEXT_PUBLIC_SITE_URL=https://zerocool-development.com`
- `CONTACT_EMAIL=zerocool.development.project@gmail.com`
- `LEAD_FROM_EMAIL=onboarding@resend.dev` (or your verified sender)
- `ADMIN_ACCESS_CODE`
- `RESEND_API_KEY`
- `HUBSPOT_ACCESS_TOKEN`
- `NEXT_PUBLIC_HUBSPOT_PORTAL_ID`
- `OPENAI_API_KEY`

Required for Meta admin and webhook flows:

- `META_APP_ID`
- `META_APP_SECRET`
- `META_GRAPH_API_VERSION` (default: `v25.0`)
- `META_USER_ACCESS_TOKEN`
- `META_PAGE_ACCESS_TOKEN`
- `META_PAGE_ID`
- `META_VERIFY_TOKEN`
- `META_ADMIN_WRITE_ENABLED=false` (recommended default)

Required for Google Business Profile flows:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `GOOGLE_REFRESH_TOKEN`
- `GOOGLE_BUSINESS_ACCOUNT_ID`
- `GOOGLE_BUSINESS_LOCATION_ID`

Optional:

- `NEXT_PUBLIC_BOOKING_URL`
- `NEXT_PUBLIC_FACEBOOK_PAGE_URL`
- `NEXT_PUBLIC_INSTAGRAM_PROFILE_URL`
- `NEXT_PUBLIC_META_PIXEL_ID`
- `FACEBOOK_DOMAIN_VERIFICATION`
- `GOOGLE_SITE_VERIFICATION`
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
- `NEXT_PUBLIC_GA_ID`
- `NEXT_PUBLIC_CLARITY_ID`

## Deploy/Update App

Use the app spec in `app.json`:

```powershell
doctl apps update a7fabd80-117e-4683-8ca7-2636b2a48c93 --spec app.json --wait
```

Or use the HubSpot setup helper:

```powershell
.\scripts\configure-hubspot-env.ps1
```

## Cloudflare Configuration

1. SSL/TLS mode: `Full (strict)`.
2. Edge Certificates:
	- `Always Use HTTPS`: On
	- `Automatic HTTPS Rewrites`: On
	- `Minimum TLS Version`: 1.2
3. DNS records:
	- Type `CNAME`, name `@`, target `seroocool-rjml7.ondigitalocean.app`, proxy status `Proxied`
	- Type `CNAME`, name `www`, target `seroocool-rjml7.ondigitalocean.app`, proxy status `Proxied`
4. In Cloudflare SSL/TLS Origin Server, do not use Flexible mode.
5. Enable bot protections and WAF managed rules.

Recommended minimum WAF/rate-limit rules:

- Rate-limit `POST /api/lead` by IP.
- Challenge suspicious automated traffic.
- Keep OWASP managed rules enabled.

## Application Security Baseline

`next.config.ts` is configured with:

- Content-Security-Policy (HubSpot + Meta compatible)
- HSTS
- X-Content-Type-Options
- X-Frame-Options
- Referrer-Policy
- Permissions-Policy
- Redirects for non-canonical host to canonical apex domain

## Post-Deploy Verification

Run:

```powershell
.\scripts\verify-production.ps1
```

Optional live lead test:

```powershell
.\scripts\verify-production.ps1 -RunLiveLeadCheck
```

Checks include:

- Active deployment phase
- Required env keys
- HTTPS response + redirect behavior for apex and `www`
- Optional synthetic lead submit to `/api/lead`
- Optional HubSpot contact lookup by synthetic email

## SEO Validation Checklist

- `robots.txt` returns expected crawl rules
- `sitemap.xml` returns core routes
- Metadata/canonical URL uses `https://zerocool-development.com`
- Structured data includes service + business entities

## Operational Notes

- Rotate API keys if they were exposed in chat/logs.
- Keep `CONTACT_EMAIL` set to `zerocool.development.project@gmail.com`.
- Re-run verification after every production deployment.
