# Integration Readiness Matrix (2026-07-10)

This matrix captures the current non-destructive validation state after phased production hardening.

## Validation Summary

- Lint: pass (`npm run lint`)
- Build: pass (`npm run build`)
- Type/errors: pass (`get_errors` returned no errors)
- OpenAI connectivity: pass (`openai-test` connection task succeeded)
- Meta diagnostics route reachability: pass (local app running, endpoint reached)
- Meta diagnostics result: fail (`502` with `Meta request failed.`)
- Dependency audit: fail (`2 moderate` vulnerabilities in Next transitive postcss chain)

## Integration Credential Presence

Status reflects dotenv-loaded runtime presence only and does not reveal secret values.

| Integration | Key | Status |
|---|---|---|
| OpenAI | `OPENAI_API_KEY` | configured |
| HubSpot | `HUBSPOT_ACCESS_TOKEN` | missing |
| HubSpot | `NEXT_PUBLIC_HUBSPOT_PORTAL_ID` | missing |
| Google Business | `GOOGLE_CLIENT_ID` | missing |
| Google Business | `GOOGLE_CLIENT_SECRET` | missing |
| Google Business | `GOOGLE_REFRESH_TOKEN` | missing |
| Google Business | `GOOGLE_BUSINESS_ACCOUNT_ID` | missing |
| Google Business | `GOOGLE_BUSINESS_LOCATION_ID` | missing |
| Meta | `META_APP_ID` | missing |
| Meta | `META_APP_SECRET` | missing |
| Meta | `META_USER_ACCESS_TOKEN` | configured |
| Meta | `META_PAGE_ACCESS_TOKEN` | missing |
| Meta | `META_PAGE_ID` | missing |
| Meta | `META_VERIFY_TOKEN` | missing |
| Meta | `META_BUSINESS_ID` | missing |
| Meta safety gate | `META_ADMIN_WRITE_ENABLED` | missing |

## Non-Destructive Diagnostics Performed

- Started local app (`npm run dev`) and verified route inventory endpoint target at `http://localhost:3000`.
- Ran `npm run meta:test` against the live local app.
- Did not execute any destructive Meta or Google actions.

## Current Blockers

1. Meta diagnostics require complete app/page credentials to return healthy integration status.
2. HubSpot and Google Business remain unverified due missing credentials.
3. `npm audit` reports 2 moderate vulnerabilities with a breaking-change force-fix path.

## Next Safe Actions

1. Add missing credentials in environment configuration.
2. Re-run `npm run meta:test` and archive results in deployment notes.
3. Run read-only verification for Google and HubSpot admin/status endpoints once keys are present.
4. Keep `META_ADMIN_WRITE_ENABLED` unset (or explicit `false`) until manual approval to enable writes.
