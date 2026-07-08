# Website Growth and Integration Checklist

This file combines your deployment checklist and feature roadmap so your site can launch strong and keep improving.

## 1) Deployment and Facebook Integration Checklist

- [x] Deploy app to DigitalOcean App Platform
- [ ] Point custom domain to the app
- [ ] Set production environment variables in DigitalOcean:
  - [ ] NEXT_PUBLIC_SITE_URL
  - [ ] NEXT_PUBLIC_FACEBOOK_PAGE_URL
  - [ ] NEXT_PUBLIC_INSTAGRAM_PROFILE_URL
  - [ ] NEXT_PUBLIC_META_PIXEL_ID
  - [ ] FACEBOOK_DOMAIN_VERIFICATION
  - [ ] RESEND_API_KEY
  - [ ] LEAD_TO_EMAIL (use thenewchapter1785@gmail.com for now)
  - [ ] LEAD_FROM_EMAIL (later use your custom business email)
  - [ ] HUBSPOT_ACCESS_TOKEN
  - [ ] NEXT_PUBLIC_HUBSPOT_PORTAL_ID
- [ ] Create Facebook Business Page for your brand
- [ ] Add website URL to Facebook Business Page profile
- [ ] Verify your domain in Meta Business Manager
- [ ] Connect Meta Pixel and confirm PageView events are received
- [ ] Link Instagram Professional account to the Facebook Page
- [ ] Add your website as CTA destination on both profiles

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

- [ ] crm.objects.contacts.read
- [ ] crm.objects.contacts.write

## 8) Auto-Captured Follow-Ups

This section is reserved for new tasks identified during build sessions.

- [ ] Set `NEXT_PUBLIC_HUBSPOT_PORTAL_ID` in local and DigitalOcean environments so HubSpot tracking script loads.
- [ ] Verify HubSpot custom behavioral events are appearing (form view, submit attempt, submit success, submit error, CTA clicks).
- [ ] Configure HubSpot lifecycle/source mapping for: Facebook Lead, Instagram Lead, Organic Lead.
- [ ] Add HubSpot deal automation for new leads after contact creation.
- [x] DigitalOcean app creation blocker: grant DigitalOcean GitHub integration access to repo `thenewchapter1785-tech/seroocool-fresh`.
- [x] Re-run `doctl apps create --spec app.json` after GitHub repo access is granted.
- [x] Terminal-only workaround used: switched app spec source from `github` to `git.repo_clone_url` and created app successfully.
- [x] New DigitalOcean App ID: `a7fabd80-117e-4683-8ca7-2636b2a48c93`.
- [ ] Monitor initial deployment `fdcd7079-2e2d-4103-9787-232eff92cc5e` to completion and confirm default ingress URL.

## 9) Terminal-Only Runbook (PowerShell)

Use this runbook to do everything from terminal.

### 9.1 Local Final Validation

- [x] `npm run lint`
- [x] `npm run build`

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
- [ ] Authenticate: `doctl auth init --access-token <your_do_token>`
- [ ] Create app from spec: `doctl apps create --spec app.json`
- [ ] Capture app id: `doctl apps list`
- [ ] Trigger deployment manually (optional): `doctl apps create-deployment <app-id>`

### 9.5 Configure App Environment Variables via doctl

- [ ] Prepare env values in your shell/session.
- [ ] Update app spec envs in `app.json` then run:
- [ ] `doctl apps update <app-id> --spec app.json`

Required env values to include:

- [ ] `NEXT_PUBLIC_SITE_URL`
- [ ] `NEXT_PUBLIC_FACEBOOK_PAGE_URL`
- [ ] `NEXT_PUBLIC_INSTAGRAM_PROFILE_URL`
- [ ] `NEXT_PUBLIC_META_PIXEL_ID`
- [ ] `FACEBOOK_DOMAIN_VERIFICATION`
- [ ] `RESEND_API_KEY`
- [ ] `LEAD_TO_EMAIL`
- [ ] `LEAD_FROM_EMAIL`
- [ ] `HUBSPOT_ACCESS_TOKEN`
- [ ] `NEXT_PUBLIC_HUBSPOT_PORTAL_ID`

### 9.6 HubSpot Terminal Verification Checklist

- [ ] Submit lead form from site URL
- [ ] Confirm API response success in browser/network logs
- [ ] Confirm inbox receives lead email
- [ ] Confirm contact appears in HubSpot
- [ ] Confirm behavioral events are visible in HubSpot tracking tools

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
