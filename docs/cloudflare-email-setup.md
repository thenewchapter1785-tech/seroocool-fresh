# Cloudflare Email Setup

This guide separates inbound routing from outbound sending. Configure both explicitly to avoid losing lead notifications.

## 1) Inbound Email Routing (Cloudflare Email Routing)

Use this when you want messages sent to your domain mailbox addresses (for example support@yourdomain.com) forwarded to a destination inbox.

1. In Cloudflare Dashboard, open your domain and go to Email > Email Routing.
2. Enable Email Routing for the domain.
3. Add required MX and TXT records exactly as Cloudflare instructs.
4. Create routing rules:
   - Destination address: your real inbox (for example Gmail or Microsoft 365).
   - Custom address: support@yourdomain.com, leads@yourdomain.com, etc.
5. Send a manual test email to each custom address.
6. Confirm delivery in the destination inbox.

Notes:
- Email Routing handles receiving and forwarding mail only.
- It does not send application emails.

## 2) Outbound Sending (Resend)

Use this for application-generated lead notifications.

1. In Resend, add and verify your sending domain.
2. Add SPF and DKIM records from Resend to DNS in Cloudflare.
3. Wait for DNS propagation and domain verification in Resend.
4. Set environment variables:
   - RESEND_API_KEY
   - EMAIL_FROM (example: alerts@yourdomain.com)
   - CONTACT_EMAIL (destination inbox for lead alerts)
5. Run provider checks:
   - npm run email:test
   - GET /api/admin/integrations/lead-pipeline/diagnostics

Notes:
- Keep EMAIL_FROM on the same verified domain.
- Do not use unverified sender addresses.

## 3) Recommended Production Checks

1. Verify inbound test: send external email to support@yourdomain.com.
2. Verify outbound API auth: npm run email:test.
3. Submit one real lead form in production.
4. Confirm all outcomes:
   - Lead appears in HubSpot.
   - Notification email is delivered.
   - Diagnostics endpoint shows no new failures.

## 4) Failure Triage

If inbound forwarding fails:
- Recheck MX/TXT records in Cloudflare Email Routing.
- Confirm destination inbox forwarding acceptance.

If outbound sending fails:
- Verify RESEND_API_KEY value in runtime environment.
- Verify Resend domain status (SPF/DKIM verified).
- Verify EMAIL_FROM matches verified domain.
