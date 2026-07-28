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
CE_NEWS_LAB_WORKER_LIVE_IMAGES=true
CE_DATA_DIR=/var/data/censored-expressions
PUBLIC_SITE_URL=https://censoredexpressionsmedia.com
CE_WEB_SYNC_URL=https://censoredexpressionsmedia.com
CE_WORKER_SYNC_ENABLED=true
CE_RENDER_EMBEDDED_WORKER_FALLBACK=false
CE_WORKER_SYNC_BODY_LIMIT_BYTES=16777216
CE_WORKER_SYNC_MAX_FILE_BYTES=16777216
CE_WORKER_SYNC_DELTA_ENABLED=true
CE_WORKER_SYNC_SLOW_MS=5000
CE_CONTENT_LANE_EDITOR_ATTEMPTS=4
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
CE_RENDER_EMBEDDED_WORKER_FALLBACK=false
CE_WORKER_SYNC_BODY_LIMIT_BYTES=16777216
CE_WORKER_SYNC_MAX_FILE_BYTES=16777216
CE_WORKER_SYNC_DELTA_ENABLED=true
CE_WORKER_SYNC_SLOW_MS=5000
CE_CONTENT_LANE_EDITOR_ATTEMPTS=4
```

After deployment, check the Owner observability page. The worker sync row should show recent accepted keys such as `news-lab-published-payload` and `news-lab-api-response-cache`.

## Embedded worker fallback

The Web Service now has a guarded Render fallback. If Render is running only the Web Service and the Background Worker is not active, the Web Service will start the News Lab production, collector, rescue, API-cache, and image workers itself.

To disable that fallback after the separate Background Worker is confirmed healthy, set this on the Web Service:

```text
CE_RENDER_EMBEDDED_WORKER_FALLBACK=false
```

Use `CE_RENDER_EMBEDDED_WORKER_FALLBACK=false` when the separate Background Worker is active. Enable it only as a temporary emergency fallback if the worker service is unavailable.

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




## Runtime JSON cache

The Web Service should serve Owner Desk and public API reads from cached runtime objects instead of reparsing large JSON files on every dashboard refresh.

Recommended Web Service environment values:

```text
CE_JSON_OBJECT_CACHE=true
CE_JSON_OBJECT_CACHE_MAX_ENTRIES=180
CE_OWNER_API_RESPONSE_CACHE_MS=30000
```

`/api/learning` is summary-first by default. Use `/api/learning?full=1` only when the complete learning memory is explicitly needed. `/api/owner-brain-state` uses a short cache unless `?refresh=1` is requested. This keeps admin polling from blocking the Node event loop while preserving the audit files and worker-written JSON stores.

## Worker CPU guard

The Background Worker now has a CPU guard so article production does not max out the Render instance during startup or heavy learning passes.

Recommended worker environment values:

```text
CE_WORKER_CPU_GUARD=true
CE_WORKER_MAX_COLLECTORS=6
CE_WORKER_MIN_COLLECTORS=1
CE_WORKER_ROLE_STARTUP_STAGGER_MS=4500
CE_WORKER_MAX_ONESHOT_CONCURRENCY=2
CE_WORKER_PRODUCTION_SOURCE_LIMIT=60
CE_WORKER_PRODUCTION_CLUSTER_LIMIT=12
CE_WORKER_PRODUCTION_BUILD_CONCURRENCY=3
CE_WORKER_PRODUCTION_EDITOR_WORKERS=3
CE_WORKER_PRODUCTION_READ_CONCURRENCY=2
CE_WORKER_PRODUCTION_BUDGET_MS=75000
CE_WORKER_PRESSURE_FAILURE_THRESHOLD=2
CE_WORKER_PRESSURE_RECOVERY_THRESHOLD=3
CE_WORKER_PRESSURE_DEFER_MS=900000
CE_WORKER_PRESSURE_HARD_DEFER_MS=1800000
CE_KNOWLEDGE_DISTILLATION_STARTUP_DELAY_MS=1800000
CE_KNOWLEDGE_DISTILLATION_INTERVAL_MS=21600000
CE_EVOLUTION_ENGINE_STARTUP_DELAY_MS=2700000
CE_EVOLUTION_ENGINE_INTERVAL_MS=14400000
CE_IMAGE_WORKER_STARTUP_DELAY_MS=900000
CE_IMAGE_WORKER_INTERVAL_MS=3600000
```

If CPU remains high, lower `CE_WORKER_MAX_COLLECTORS` to `3` and keep `CE_WORKER_PRODUCTION_SOURCE_LIMIT` near `30`. If CPU is stable and article coverage needs more throughput, raise collectors gradually to `6` or `8` and raise `CE_WORKER_PRODUCTION_SOURCE_LIMIT`/`CE_WORKER_PRODUCTION_CLUSTER_LIMIT` with it. Extra collectors alone only gather more material; these production handoff limits determine how much of that material reaches the Writer, Editor, and Publisher.

The worker also reacts to repeated sync pressure automatically. After repeated `http-502`, `http-503`, `http-504`, `http-429`, or sync errors, it lowers active collector workers, defers heavy one-shot jobs, and then restores collectors after stable syncs. This is the Framework control loop for protecting public API responsiveness while preserving article production.

Expected worker log after deploy:

```text
[worker] cpu guard enabled=true maxCollectors=4 startupStaggerMs=4500 maxOneShots=1
```





