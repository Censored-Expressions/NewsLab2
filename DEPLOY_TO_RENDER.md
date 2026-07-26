# Censored Expressions Render Deployment

This package mirrors the current local `localhost:3000` build.

## Render service settings

News Lab needs two Render services from the same GitHub repository.

### 1. Public Web Service

- Service type: Web Service
- Runtime: Node
- Build command: `yarn` or `npm install`
- Start command: `yarn start` or `npm start`
- Root directory: leave blank if `index.html`, `server.js`, and `package.json` are at the GitHub repo root.
- Expected log line: `Censored Expressions web server running in web-only mode; background AI work belongs to worker.js`

This service serves the public website and APIs. It should not run the heavy article-generation loops.

### 2. News Lab Background Worker

- Service type: Background Worker
- Runtime: Node
- Build command: `yarn` or `npm install`
- Start command: `yarn worker` or `npm run worker`
- Root directory: leave blank if `worker.js`, `server.js`, and `package.json` are at the GitHub repo root.
- Expected log line: `Censored Expressions background worker orchestrator starting`

This service runs collectors, article generation, repair, learning, image passes, and syncs finished payloads back to the Web Service.

If the Background Worker log says `Censored Expressions web server running in web-only mode`, the worker is using the wrong start command. Change it to `yarn worker`.

## Required environment variables

Set these in Render under Environment Variables:

```text
OWNER_ADMIN_TOKEN=your-private-owner-token
NEWSLETTER_ADMIN_TOKEN=your-private-owner-token
OPENAI_API_KEY=your-openai-key
PEXELS_API_KEY=your-pexels-key
PIXABAY_API_KEY=your-pixabay-key
CE_NEWS_LAB_LIVE_IMAGES=true
CE_DATA_DIR=/var/data/censored-expressions
PUBLIC_SITE_URL=https://censoredexpressionsmedia.com
CE_WEB_SYNC_URL=https://censoredexpressionsmedia.com
CE_WORKER_SYNC_ENABLED=true
CE_RENDER_EMBEDDED_WORKER_FALLBACK=true
CE_WORKER_SYNC_BODY_LIMIT_BYTES=16777216
CE_WORKER_SYNC_MAX_FILE_BYTES=16777216
NEWSLETTER_WEBHOOK_URL=https://your-cloudflare-newsletter-worker.workers.dev
NEWSLETTER_WEBHOOK_SECRET=use-the-same-secret-configured-in-cloudflare
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-signing-secret
STRIPE_CURRENCY=usd
```

## Persistent disk

Add a Render disk and mount it at:

```text
/var/data/censored-expressions
```

This is where newsletters, Creator Desk posts, learning memory, search learning, comments, and subscribers should live after deployment.

## Live verification URLs

After deploy, open these URLs on the live domain:

```text
/deployment-check.json
/newsroom-hero.png
/creator-bg-unmuted.png
/creator-bg-speak-free.png
/creator-bg-truth-out-loud.png
/assets/newsroom-hero.png
/assets/creator-bg-unmuted.png
/assets/creator-bg-speak-free.png
/assets/creator-bg-truth-out-loud.png
/ads.txt
/api/health
```

If the image URLs fail, Render is not serving the same files as the local build.

## AdSense

The AdSense publisher script is installed on the public pages. Blank ads can still happen while Google reviews the domain, has no eligible ad fill, or while Auto Ads decides not to place an ad. Manual ad boxes should only be added after an AdSense ad unit provides a `data-ad-slot`.

## Newsletter email

Cloudflare email delivery uses:

- `cloudflare-newsletter-worker.js`
- `wrangler-newsletter.example.toml`
- `CLOUDFLARE_NEWSLETTER_EMAIL.md`

Deploy the Worker first, then put its URL into `NEWSLETTER_WEBHOOK_URL` in Render. The same `NEWSLETTER_WEBHOOK_SECRET` must be saved in Render and as a Cloudflare Worker secret.

## Merch POS

The merch shop uses Stripe Checkout when configured. The site creates checkout sessions server-side and waits for Stripe's signed webhook before treating a sale as paid.

Add this webhook in Stripe:

```text
https://censoredexpressions.com/api/merch/stripe-webhook
```

Listen for:

```text
checkout.session.completed
```

## Worker sync requirement

Render Web Services and Background Workers do not share a local filesystem. The worker can generate articles, but the public website will not see them unless the worker syncs the generated JSON payloads back to the Web Service.

Set these on both services:

```text
OWNER_ADMIN_TOKEN=the-same-private-token-on-web-and-worker
```

Set these on the Background Worker:

```text
CE_WEB_SYNC_URL=https://censoredexpressionsmedia.com
CE_WORKER_SYNC_ENABLED=true
CE_RENDER_EMBEDDED_WORKER_FALLBACK=true
CE_WORKER_SYNC_BODY_LIMIT_BYTES=16777216
CE_WORKER_SYNC_MAX_FILE_BYTES=16777216
```

After deployment, check the Owner observability page. The worker sync row should show recent accepted keys such as `news-lab-published-payload` and `news-lab-api-response-cache`.

## Embedded worker fallback

The Web Service now has a guarded Render fallback. If Render is running only the Web Service and the Background Worker is not active, the Web Service will start the News Lab production, collector, rescue, API-cache, and image workers itself.

To disable that fallback after the separate Background Worker is confirmed healthy, set this on the Web Service:

```text
CE_RENDER_EMBEDDED_WORKER_FALLBACK=false
```

Leave it enabled while troubleshooting missing updates or missing images.

## Critical GitHub upload checklist

Upload the contents of `D:\CensoredExpressions\Deploy-Ready\News-Lab-Full` to the GitHub repository root. Do not upload only the zip and do not upload only `server.js` / `worker.js`.

The live repo must include these News Lab files at minimum:

```text
news-lab.html
news-lab.js
news-lab-story.html
news-lab-story.js
news-analyzer.html
news-analyzer.js
news-lab-observability.html
news-lab-observability.js
worker.js
server.js
render.yaml
DEPLOY_TO_RENDER.md
.env.example
styles.css
app.js
index.html
package.json
```

If GitHub does not show those files, Render cannot serve the News Lab visitor experience even if the worker is running.

After the Background Worker deploys, its logs should show one of these sync lines within about a minute:

```text
[worker] sync ok: accepted=news-lab-published-payload,...
[worker] sync disabled: set CE_WEB_SYNC_URL...
[worker] sync skipped: missing OWNER_ADMIN_TOKEN...
[worker] sync error: ...
```

If you do not see a sync line, the deployed `worker.js` is stale or the worker has not stayed alive long enough to reach the sync timer.


