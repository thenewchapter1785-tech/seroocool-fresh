# Website Growth and Integration Checklist

This file combines your deployment checklist and feature roadmap so your site can launch strong and keep improving.

## 1) Deployment and Facebook Integration Checklist

- [x] Deploy app to DigitalOcean App Platform
- [x] Point custom domain to the app (`zerocool-development.com` + `www` active)
- [~] Set production environment variables in DigitalOcean:
  - [x] NEXT_PUBLIC_SITE_URL
  - [x] NEXT_PUBLIC_FACEBOOK_PAGE_URL
  - [ ] NEXT_PUBLIC_INSTAGRAM_PROFILE_URL
  - [ ] NEXT_PUBLIC_META_PIXEL_ID
  - [ ] FACEBOOK_DOMAIN_VERIFICATION
  - [x] RESEND_API_KEY
  - [x] LEAD_TO_EMAIL (use thenewchapter1785@gmail.com for now)
  - [x] LEAD_FROM_EMAIL (later use your custom business email)
  - [x] HUBSPOT_ACCESS_TOKEN
  - [x] NEXT_PUBLIC_HUBSPOT_PORTAL_ID
- [~] Create Facebook Business Page for your brand (deferred)
- [~] Add website URL to Facebook Business Page profile (deferred)
- [~] Verify your domain in Meta Business Manager (deferred)
- [~] Connect Meta Pixel and confirm PageView events are received (deferred)
- [~] Link Instagram Professional account to the Facebook Page (deferred)
- [~] Add your website as CTA destination on both profiles (deferred)
- [~] Generate Meta API access token for page setup and automation tasks (deferred)
- [~] Capture and store required IDs: Facebook Page ID, Meta Business Manager ID, Meta Pixel ID (deferred)
- [~] Grant token permissions needed for page/profile updates and validation checks (deferred)
- [x] Facebook Page ID captured: `1131633576708366`
- [x] Facebook Page URL captured: `https://www.facebook.com/profile.php?id=61591762771267`
- [~] Meta Pixel creation blocker: resolve Pixel creation access/setup issue in Meta Business Manager (deferred)
- [~] Meta API token creation pending (deferred)

## 2) Messaging Checklist (Beginner + Professional)

- [x] Keep hero headline easy to understand in one sentence
- [x] Explain technical strength without jargon-heavy wording
- [x] Include a beginner-friendly section: "How this works"
- [x] Include a professional section: architecture, APIs, scalability
- [x] Add a short FAQ using plain language
- [x] Keep each paragraph short (2-3 lines)

## 3) Features to Make the Page Pop More

- [x] Add client testimonials with headshots or logos
- [ ] Add before/after project snapshots
- [ ] Add measurable outcomes for each project (speed, conversion, leads)
- [x] Add trust bar: response time, projects shipped, uptime target
- [x] Add sticky call-to-action on mobile
- [ ] Add short intro video or animated product walkthrough
- [ ] Add calendar booking integration for fast consultations
- [x] Add contact form with project type selector
- [ ] Add social proof strip (Facebook/Instagram creator stats)
- [ ] Add downloadable resume PDF with branded design

## 4) Conversion and Lead Capture Add-ons

- [x] Add lead form with source tracking (facebook / instagram / organic)
- [x] Add hidden UTM field capture for campaign attribution
- [x] Add thank-you page with next-step instructions
- [x] Add email notification for new leads
- [x] Add CRM integration (HubSpot, Notion, Airtable, or custom)
- [x] Add event tracking for button clicks and form starts

Recommended starter CRM path:

- [x] Start with HubSpot Free CRM for pipeline + email logging
- [x] Keep website form as the source of truth for all project requests
- [x] Auto-send lead copy to inbox and CRM simultaneously

## 4.1) HubSpot-First Business Stack Decision

Use HubSpot for most business operations, but not literally everything:

- [ ] Use HubSpot for CRM, contacts, pipeline, deals, and follow-up automation
- [ ] Keep website hosting on DigitalOcean (performance and deployment)
- [ ] Use a dedicated business email provider (Google Workspace or Zoho)
- [ ] Connect business inbox to HubSpot for conversation tracking
- [ ] Keep analytics split: HubSpot + Meta Pixel + Google Analytics

Why this setup:

- [ ] Avoid vendor lock-in
- [ ] Improve email deliverability
- [ ] Keep hosting and CRM each on best-in-class tools

Implementation order:

- [x] Connect website lead form to HubSpot contact creation
- [x] Keep inbox notification as backup for every lead
- [ ] Add source/lifecycle tagging: Facebook Lead, Instagram Lead, Organic Lead
- [ ] Add automation to create or update deals per new lead

HubSpot app scopes needed:

- [x] crm.objects.contacts.read
- [x] crm.objects.contacts.write

## 8) Auto-Captured Follow-Ups

This section is reserved for new tasks identified during build sessions.

- [x] Set `NEXT_PUBLIC_HUBSPOT_PORTAL_ID` in local and DigitalOcean environments so HubSpot tracking script loads.
- [ ] Verify HubSpot custom behavioral events are appearing (form view, submit attempt, submit success, submit error, CTA clicks).
- [ ] Configure HubSpot lifecycle/source mapping for: Facebook Lead, Instagram Lead, Organic Lead.
- [ ] Add HubSpot deal automation for new leads after contact creation.
- [x] DigitalOcean app creation blocker: grant DigitalOcean GitHub integration access to repo `thenewchapter1785-tech/seroocool-fresh`.
- [x] Re-run `doctl apps create --spec app.json` after GitHub repo access is granted.
- [x] Terminal-only workaround used: switched app spec source from `github` to `git.repo_clone_url` and created app successfully.
- [x] New DigitalOcean App ID: `a7fabd80-117e-4683-8ca7-2636b2a48c93`.
- [x] Monitor initial deployment `fdcd7079-2e2d-4103-9787-232eff92cc5e` to completion and confirm default ingress URL.
- [x] Deployment fix: removed custom `build_command` from `app.json` to prevent post-prune Next.js TypeScript build failure.
- [x] Active deployment succeeded: `c37554f3-7538-4422-92f2-7d341ab214dc`.
- [x] Live DigitalOcean URL: `https://seroocool-rjml7.ondigitalocean.app`.
- [x] Hosting decision: keep DigitalOcean App Platform (no fresh Droplet required for Cloudflare domain setup).
- [x] Domain DNS plan: use Cloudflare CNAME/flattening to `seroocool-rjml7.ondigitalocean.app` after adding custom domain in App Platform.
- [x] Only use a Droplet if a fixed server IP or full server-level control is required (decision documented: not needed now).
- [x] Domain registration note: DigitalOcean does not sell domains; purchase domain from a registrar first (Cloudflare Registrar, Namecheap, Porkbun, etc.).
- [x] After purchase, add domain in DigitalOcean App Platform and copy required DNS records.
- [x] In DNS provider, point `www` CNAME to `seroocool-rjml7.ondigitalocean.app`.
- [x] In DNS provider, point apex/root domain via CNAME flattening or ANAME/ALIAS to `seroocool-rjml7.ondigitalocean.app`.
- [x] Installed VS Code extension for Cloudflare management workflow: `alessandrobenassi.cloudflare-devtools`.

## 10) Cloudflare Account + API Token Setup (Step-by-Step)

Track this section as you complete Cloudflare onboarding.

### 10.1 Create Cloudflare Account

- [x] Go to Cloudflare dashboard and create account.
- [x] Verify account email.
- [x] Add your purchased domain to Cloudflare.
- [x] Choose Free plan (good starter).

### 10.2 If Domain Is New at Another Registrar

- [~] In Cloudflare, copy the two assigned nameservers (not needed: domain is registered in Cloudflare).
- [~] In your registrar, replace current nameservers with Cloudflare nameservers (not needed: domain is registered in Cloudflare).
- [~] Wait for Cloudflare zone to become Active (not needed: zone already active).

### 10.3 Create Least-Privilege API Token (Recommended)

Create token in Cloudflare: Profile -> API Tokens -> Create Token -> Custom Token.

- [x] Token created and shared for setup session (stored outside repo files).
- [ ] Token name: Seroocool DNS Automation
- [ ] Permissions: Zone - DNS - Edit
- [ ] Permissions: Zone - Zone - Read
- [ ] Zone Resources: Include - Specific zone - yourdomain.com
- [ ] Client IP filtering: leave open unless you have stable static IP
- [ ] TTL/expiry: set an expiry date and rotate regularly
- [ ] Copy token once and store in password manager
- [ ] Security follow-up: rotate this token after setup because it was shared in chat.
- [ ] Security follow-up: rotate `HUBSPOT_ACCESS_TOKEN` and `RESEND_API_KEY` because they were shared in chat.

### 10.4 Connect Domain to DigitalOcean App Platform

- [x] In DigitalOcean App Platform, open app `a7fabd80-117e-4683-8ca7-2636b2a48c93`.
- [x] Add custom domain: root and www.
- [x] Copy any verification/DNS records shown by DigitalOcean.
- [x] In Cloudflare DNS, create/update required records from DigitalOcean.
- [x] Ensure `www` is CNAME to `seroocool-rjml7.ondigitalocean.app`.
- [x] Ensure apex/root uses CNAME flattening to `seroocool-rjml7.ondigitalocean.app`.
- [x] Wait for SSL certificate to become active in DigitalOcean (`zerocool-development.com` + `www` active).

### 10.5 Final Validation

- [x] Confirm https://zerocool-development.com loads successfully.
- [x] Confirm https://www.zerocool-development.com loads successfully.
- [~] Submit live lead form and confirm email + HubSpot contact creation (re-verified live lead + HubSpot contact; inbox confirmation pending).

## 9) Terminal-Only Runbook (PowerShell)

Use this runbook to do everything from terminal.

### 9.1 Local Final Validation

- [x] `npm run lint`
- [x] `npm run build`
- [x] Added Node PATH fallback runner: `.\scripts\run-npm.ps1` for shells where `node` is not detected by npm.
- [x] Added one-command production verification: `.\scripts\verify-production.ps1`.

### 9.2 GitHub Push (already completed)

- [x] `git add -A`
- [x] `git commit -m "..."`
- [x] `git branch -M main`
- [x] `gh repo create thenewchapter1785-tech/seroocool-fresh --public --source=. --remote=origin --push`

### 9.3 Set GitHub Secrets for DigitalOcean CI Deploy

- [ ] `gh secret set DIGITALOCEAN_ACCESS_TOKEN --body "<your_do_token>"`
- [ ] `gh secret set DIGITALOCEAN_APP_ID --body "<your_do_app_id>"`

### 9.4 DigitalOcean App Setup from Terminal

- [x] Install doctl: `winget install DigitalOcean.doctl`
- [x] Authenticate: `doctl auth init --access-token <your_do_token>`
- [x] Create app from spec: `doctl apps create --spec app.json`
- [x] Capture app id: `doctl apps list`
- [x] Trigger deployment manually (optional): `doctl apps create-deployment <app-id>`

### 9.5 Configure App Environment Variables via doctl

- [x] Prepare env values in your shell/session.
- [x] Update app spec envs in `app.json` then run:
- [x] `doctl apps update <app-id> --spec app.json`

Required env values to include:

- [x] `NEXT_PUBLIC_SITE_URL`
- [x] `NEXT_PUBLIC_FACEBOOK_PAGE_URL`
- [ ] `NEXT_PUBLIC_INSTAGRAM_PROFILE_URL`
- [ ] `NEXT_PUBLIC_META_PIXEL_ID`
- [ ] `FACEBOOK_DOMAIN_VERIFICATION`
- [x] `RESEND_API_KEY`
- [x] `LEAD_TO_EMAIL`
- [x] `LEAD_FROM_EMAIL`
- [x] `HUBSPOT_ACCESS_TOKEN`
- [x] `NEXT_PUBLIC_HUBSPOT_PORTAL_ID`

### 9.6 HubSpot Terminal Verification Checklist

- [x] Add terminal helper script: `.\scripts\configure-hubspot-env.ps1` to set HubSpot env vars via `doctl` without writing secrets to repo files.
- [x] Add one-command health check script: `.\scripts\verify-production.ps1`.
- [x] Submit lead form from site URL
- [x] Confirm API response success in browser/network logs
- [ ] Confirm inbox receives lead email
- [ ] Inbox verification note: Resend list-emails API returned 401 with current key, so confirm delivery manually in mailbox or Resend dashboard.
- [x] Confirm contact appears in HubSpot
- [ ] Confirm behavioral events are visible in HubSpot tracking tools
- [ ] Set remaining production vars: `NEXT_PUBLIC_INSTAGRAM_PROFILE_URL`, `NEXT_PUBLIC_META_PIXEL_ID`, `FACEBOOK_DOMAIN_VERIFICATION`.
- [~] After deployment becomes ACTIVE, run a live lead submit and verify HubSpot contact creation + inbox email delivery (contact verified; inbox confirmation pending).

## 5) Performance and SEO Add-ons

- [ ] Add Open Graph image for social shares
- [ ] Add Twitter/X card metadata
- [ ] Add structured data (Person + ProfessionalService)
- [ ] Add sitemap and robots configuration
- [ ] Compress and optimize media assets
- [ ] Run Lighthouse and improve performance score to 90+

## 6) Content Expansion Ideas

- [ ] Add Services detail page with packages
- [ ] Add Project detail pages for Jon's Thoughts and Housing Project
- [ ] Add About page with your story and approach
- [ ] Add Blog or "Build Notes" page for thought leadership
- [ ] Add "Start a Project" page with onboarding questionnaire

## 7) Optional Premium Enhancements

- [ ] Add chatbot for basic Q&A and lead qualification
- [ ] Add case study PDFs for enterprise prospects
- [ ] Add multilingual support if targeting wider audience
- [ ] Add client portal for project updates and files
- [ ] Add analytics dashboard for campaign and lead reporting

