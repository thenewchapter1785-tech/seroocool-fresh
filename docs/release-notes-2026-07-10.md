# Release Notes - 2026-07-10

## Scope

Phased execution completed for:

1. Full project audit and backup checkpoint.
2. Customer-facing copy, homepage, navigation, and lead-generation improvements.
3. Codebase cleanup and full validation suite.
4. Read-only integration diagnostics hardening and handoff documentation.

## Commits

- `2401628` - `chore: backup snapshot before phased production polish`
- `222f109` - `feat: improve customer copy and lead conversion flow`

## Customer-Facing Improvements

- Navigation updated for clearer intent: stronger help/booking paths.
- Homepage contact area now bridges to estimate and booking actions.
- Mobile sticky CTA now supports both quick estimate and direct help requests.
- Reviews section copy reframed to transparent customer-story language.
- Admin copy cleanup removed explicit placeholder phrasing in Google Business manager helper text.

## Validation Results

- `npm run lint`: pass
- `npm run build`: pass
- Workspace compile/type errors: none
- OpenAI connection test: pass
- `npm audit`: 2 moderate vulnerabilities (Next transitive postcss path; force fix is breaking)
- `npm run meta:test`: endpoint reachable with local app running, returns `502` (`Meta request failed`)

## Safety and Compliance

- No destructive Meta actions were run.
- No destructive Google Business actions were run.
- Meta write gate remains safe-by-default unless explicitly enabled via env.

## Rollout Notes

1. Deploy commits in order if reproducing phased history (`2401628` then `222f109`).
2. Set missing integration credentials before expecting live admin diagnostics to pass.
3. Re-run read-only diagnostics after credential setup and archive outputs.
4. Keep write gates disabled until credentials and business approval are finalized.
