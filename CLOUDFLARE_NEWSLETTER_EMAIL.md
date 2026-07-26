# Cloudflare Newsletter Email Setup

The website already knows how to generate the weekly newsletter and send it to a webhook. This Cloudflare setup makes that webhook a secure Worker that sends the email through Cloudflare.

## What This Adds

- `NEWSLETTER_WEBHOOK_URL` points Render to the Cloudflare Worker.
- `NEWSLETTER_WEBHOOK_SECRET` prevents outside users from using the Worker as an open sender.
- Each subscriber receives a unique unsubscribe link.
- `/api/newsletter/unsubscribe?token=...` marks that subscriber as unsubscribed.
- `cloudflare-newsletter-worker.js` sends the newsletter through a Cloudflare email binding named `NEWSLETTER_EMAIL`.

## Required Cloudflare Pieces

1. Cloudflare account with `censoredexpressions.com` active.
2. A sending-capable Cloudflare Email Service or Workers email binding.
3. A sender address, for example:

```text
info@censoredexpressionsmedia.com
```

4. A Worker deployed from `cloudflare-newsletter-worker.js`.

Cloudflare Email Routing that forwards mail to your personal inbox is not enough by itself. The Worker needs outbound email sending enabled.

## Deploy Worker

Install Wrangler on your computer if needed:

```powershell
npm install -g wrangler
```

Log in:

```powershell
wrangler login
```

Copy `wrangler-newsletter.example.toml` to `wrangler.toml`, then configure the `NEWSLETTER_EMAIL` binding in Cloudflare.

Set the Worker secret:

```powershell
wrangler secret put NEWSLETTER_WEBHOOK_SECRET
```

Deploy:

```powershell
wrangler deploy --config wrangler.toml
```

## Render Environment Variables

Add these in Render:

```text
PUBLIC_SITE_URL=https://censoredexpressions.com
NEWSLETTER_WEBHOOK_URL=https://YOUR-WORKER-NAME.YOUR-SUBDOMAIN.workers.dev
NEWSLETTER_WEBHOOK_SECRET=use-the-same-secret-you-put-in-cloudflare
NEWSLETTER_ADMIN_TOKEN=your-private-owner-token
```

After saving environment variables, redeploy/restart the Render service.

## Test Send

Subscribe a test email on the newsletter page first, then run the protected send endpoint:

```powershell
curl -X POST "https://censoredexpressions.com/api/newsletter/send" -H "x-newsletter-admin-token: YOUR_TOKEN"
```

Expected outcomes:

- If the Worker and Cloudflare sender are configured, `sendStatus` should become `sent`.
- If the Worker URL is missing, `sendStatus` will be `provider_not_configured`.
- If the Worker secret is wrong, the Worker returns `403`.
- If Cloudflare outbound sending is not enabled, the Worker returns a binding/configuration error.

## AI Framework Lesson

Newsletter email is now a multi-system function:

- Website: subscriber capture, newsletter generation, unsubscribe endpoint.
- Render: weekly scheduler and `NEWSLETTER_WEBHOOK_URL`.
- Cloudflare: outbound sender Worker and sender-domain compliance.
- Governance: unsubscribe links, sender identity, owner-only manual send endpoint.

The Framework should diagnose all four before deciding the newsletter email system is healthy.
