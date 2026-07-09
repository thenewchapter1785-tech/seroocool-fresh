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
- `RESEND_API_KEY`
- `HUBSPOT_ACCESS_TOKEN`
- `NEXT_PUBLIC_HUBSPOT_PORTAL_ID`
- `OPENAI_API_KEY`

Optional:

- `NEXT_PUBLIC_BOOKING_URL`
- `NEXT_PUBLIC_FACEBOOK_PAGE_URL`
- `NEXT_PUBLIC_INSTAGRAM_PROFILE_URL`
- `NEXT_PUBLIC_META_PIXEL_ID`
- `FACEBOOK_DOMAIN_VERIFICATION`
- `GOOGLE_SITE_VERIFICATION`

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

1. Keep SSL/TLS mode as `Full (strict)`.
2. Enable `Always Use HTTPS`.
3. Add DNS records required by DigitalOcean for apex and `www`.
4. Keep proxy enabled (`orange cloud`) unless debugging origin directly.
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
