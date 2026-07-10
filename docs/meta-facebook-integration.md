# Meta/Facebook Integration Guide

## Overview

This project includes a secure admin-managed Meta/Facebook integration for page management, post creation, diagnostics, and webhook ingestion.

Key features:

- Backend-only token handling and Graph API access
- Token and permission diagnostics via `debug_token`
- Managed page discovery and server-side active page persistence
- Review-before-apply workflow for profile updates (tokenized confirmation)
- Audit scoring for page quality and recommendation generation
- Post draft persistence and reusable draft loading
- Safe write actions with explicit confirmation patterns
- Live engagement actions (reply, hide, unhide, delete) with confirmation text gates
- Webhook signature verification for inbound event processing
- Admin audit logging for important write and moderation actions
- Optional sync endpoint with in-memory caching and manual triggering

## Required Environment Variables

Required for full functionality:

- `ADMIN_ACCESS_CODE`
- `META_GRAPH_API_VERSION` (optional, defaults to `v25.0`)
- `META_APP_ID`
- `META_APP_SECRET`
- `META_USER_ACCESS_TOKEN` (or alias `GRAPH_API_KEY`)
- `META_PAGE_ACCESS_TOKEN` (or alias `FACEBOOK_PAGE_ACCESS_TOKEN`)
- `META_PAGE_ID`
- `META_VERIFY_TOKEN` (for webhook verification)

Optional:

- `META_BUSINESS_ID`

## Security Model

Admin API routes require:

- Valid admin code (`x-admin-code` header or `code` query)
- Rate limiting through `requireAdminAccess`
- Same-origin validation on write methods
- HTTPS requirement in production for write methods
- CSRF-style write guard: `x-admin-csrf` must match `x-admin-code`

Additional safety controls:

- Explicit confirmation phrases for destructive flows
- Merge and delete operations are intentionally non-automatic
- Audit logs written to `logs/meta-admin-audit.log`
- Sensitive values redacted in diagnostics responses

## Admin Endpoints

Read:

- `GET /api/admin/meta/diagnostics`
- `GET /api/admin/meta/pages`
- `GET /api/admin/meta/page`
- `GET /api/admin/meta/recommendations`
- `GET /api/admin/meta/audit`
- `GET /api/admin/meta/active-page`
- `GET /api/admin/meta/drafts`
- `GET /api/admin/meta/engagement`

Write (requires write guards):

- `PATCH /api/admin/meta/page`
- `POST /api/admin/meta/posts`
- `DELETE /api/admin/meta/posts`
- `POST /api/admin/meta/confirm-action`
- `PUT /api/admin/meta/active-page`
- `POST /api/admin/meta/engagement`
- `PUT /api/admin/meta/drafts`
- `DELETE /api/admin/meta/drafts`
- `POST /api/admin/meta/sync`

Webhook:

- `GET /api/meta/webhook` (Meta verification challenge)
- `POST /api/meta/webhook` (signature-verified events)

## Diagnostics Behavior

`GET /api/admin/meta/diagnostics` reports:

- Redacted config state
- Token validity and expiration (when app credentials are available)
- Permission-level diagnostics for:
  - `pages_show_list`
  - `pages_read_engagement`
  - `pages_manage_posts`
  - `pages_manage_engagement`
  - `pages_manage_metadata`
  - `pages_read_user_content`
  - `business_management`

Status values: `requested`, `granted`, `declined`, `expired`, `review-needed`.

## Active Page Persistence

Active page selection is persisted in `.meta-active-page.json` at workspace root. If missing, the integration falls back to `META_PAGE_ID`.

## Profile Review-Then-Apply

`PATCH /api/admin/meta/page` works in two phases:

1. `applyConfirmed=false` generates a review token and a field-by-field diff.
2. `applyConfirmed=true` with `reviewToken` applies the pending update.

Review tokens expire automatically (20 minutes).

## Draft Persistence

Drafts are persisted in `.meta-post-drafts.json` and support create/update/list/delete operations through `/api/admin/meta/drafts`.

## Webhooks

Webhook verification:

1. Set `META_VERIFY_TOKEN`.
2. Configure Meta webhook callback URL to `/api/meta/webhook`.
3. During verification, Meta sends `hub.mode`, `hub.verify_token`, and `hub.challenge`.
4. Server returns challenge only when token matches.

Webhook signing:

- `POST` requires `x-hub-signature-256`.
- HMAC SHA-256 validation uses `META_APP_SECRET`.
- Invalid signatures are rejected with HTTP 403.

## Sync Endpoint

`POST /api/admin/meta/sync` performs a manual sync and caches summary payload for 5 minutes.

Current behavior:

- Pulls managed pages, active page details, and recent posts
- Returns cached results when fresh
- Persists cache in `.meta-sync-cache.json`
- Scheduled background sync is intentionally disabled by default

## Testing

Run diagnostics smoke test:

```bash
npm run meta:test
```

Expected prerequisites:

- Local server running
- `ADMIN_ACCESS_CODE` available in environment
- Meta credentials configured

## Operational Notes

- Never expose user/page tokens in client code.
- Avoid destructive auto-retries for delete/unpublish actions.
- Keep app review and advanced permissions status documented in your internal runbook.
