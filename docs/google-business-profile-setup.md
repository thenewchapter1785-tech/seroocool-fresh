# Google Business Profile Setup

This project includes secure backend integration for Google Business Profile Manager in the admin dashboard.

## Required APIs

Enable these APIs in Google Cloud for the same project as your OAuth credentials:

- Business Profile API
- Business Information API
- Business Account Management API

If your account supports additional features, enable related APIs used by legacy endpoints for reviews/posts/media.

## Required OAuth scope

Use this scope when creating your OAuth consent/auth flow:

- https://www.googleapis.com/auth/business.manage

Without this scope, admin routes return a clear missing-scope error.

## Required environment variables

Set these in your runtime environment:

- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_REDIRECT_URI
- GOOGLE_REFRESH_TOKEN
- GOOGLE_BUSINESS_ACCOUNT_ID
- GOOGLE_BUSINESS_LOCATION_ID

Also required:

- ADMIN_ACCESS_CODE

## How to get a refresh token

1. Create OAuth Client ID credentials in Google Cloud (Web application).
2. Add your redirect URI to the OAuth client. Use the exact URI in GOOGLE_REDIRECT_URI.
3. Run an OAuth consent flow that requests scope:
   - https://www.googleapis.com/auth/business.manage
4. Exchange the authorization code for tokens.
5. Save the refresh token as GOOGLE_REFRESH_TOKEN.

Important:

- Refresh tokens are server-only and never sent to browser code.
- Do not commit real token values.

## How to get account ID and location ID

After env setup and admin auth:

1. Call GET /api/admin/google-business/accounts
2. Pick account name from response, for example accounts/123456789
3. Call GET /api/admin/google-business/locations?accountName=accounts/123456789
4. Pick location name from response, for example accounts/123456789/locations/987654321

Then set:

- GOOGLE_BUSINESS_ACCOUNT_ID=123456789 (or accounts/123456789)
- GOOGLE_BUSINESS_LOCATION_ID=987654321 (or accounts/123456789/locations/987654321)

## How to test connection

1. Open /admin and provide ?code=YOUR_ADMIN_ACCESS_CODE
2. In the Google Business Profile section, confirm account/location data loads.
3. Update description, website, phone, and hours from the admin form.
4. Check reviews load and draft replies can be generated.
5. Publish a reply manually only after review.
6. Generate a local post draft and publish only after manual confirmation.

## Route summary

Protected by ADMIN_ACCESS_CODE:

- GET /api/admin/google-business/accounts
- GET /api/admin/google-business/locations
- GET /api/admin/google-business/location
- PATCH /api/admin/google-business/location
- GET /api/admin/google-business/reviews
- POST /api/admin/google-business/reviews/reply
- POST /api/admin/google-business/posts
- POST /api/admin/google-business/photos
