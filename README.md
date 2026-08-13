# Censored Expressions Website

This package includes a lightweight Node.js feed collector.

## Run Locally

```bash
npm start
```

Then open:

```text
http://localhost:3000
```

## What The Server Does

- Serves the website files.
- Pulls RSS headlines from AP, CNN, Fox, CBS, NBC, ABC, ESPN, and local news.
- Extracts story links, summaries, dates, and images when publishers provide them.
- Caches the feed response for 10 minutes.
- Provides the frontend with stories at `/api/news`.

## News Lab Collector Workers

News Lab runs category collector workers for `top`, `world`, `politics`, `business`, `technology`, `sports`, `entertainment`, and `local`.

- These workers gather tab-specific source material and build sub-dossier caches.
- They do not publish finished articles directly.
- The central Story Dossier, Writer, Publishing Editor, Validator, and Publisher remain responsible for finished CE Media articles.
- Collector workers are enabled by default in production so each tab keeps receiving fresh source material.
- To disable them during local review, set:

```text
CE_NEWS_LAB_COLLECTOR_WORKER_PROCESS=false
```

Collector output is stored in `data/news-lab-collectors/` and is merged into the main Story Dossier as tab-writing, tab-context, or review-only evidence.

## Mobile App / PWA

The site is now installable as a mobile app through the browser.

- `manifest.webmanifest` defines the app name, icon, colors, and launch behavior.
- `sw.js` keeps the app shell available and uses fresh network data for pages and `/api/news`.
- When the live website is updated, the installed app receives those updates from the same server.
- For iPhone/Android public installs, host the site over HTTPS.

## Newsletter System

The site includes a newsletter subscription page at `/newsletter.html`.

- Public subscribers provide first name, last name, age, location, and email.
- Subscriber records are stored in `data/subscribers.json`.
- Newsletter archives are stored in `data/newsletters.json` and shown publicly on the newsletter page.
- The backend AI framework generates a Saturday-Friday weekly issue and checks for delivery every Saturday after 5 AM Eastern.
- To connect real email delivery through Cloudflare, deploy `cloudflare-newsletter-worker.js` and set `NEWSLETTER_WEBHOOK_URL` to the Worker URL.
- Set `NEWSLETTER_WEBHOOK_SECRET` in both Render and Cloudflare so the Worker cannot be used as an open sender.
- Newsletter emails include subscriber-specific unsubscribe links handled by `/api/newsletter/unsubscribe`.
- Manual generation/sending endpoints are protected locally or by `NEWSLETTER_ADMIN_TOKEN`.
- Detailed Cloudflare setup is in `CLOUDFLARE_NEWSLETTER_EMAIL.md`.

## Merch Marketplace

The merch shop is managed from a private catalog instead of only hard-coded product cards.

- Public products are stored in `data/merch-products.json`.
- The public marketplace reads active products from `/api/merch/products`.
- The private Owner Desk includes a Merch Desk for adding/updating products, sizes, colors, prices, images, status, featured flag, and sort order.
- Protected merch endpoints are available at `/api/merch/admin/products` and `/api/merch/admin/remove`.
- Products can be set to `active`, `draft`, `hidden`, or `sold_out`.
- Merch intelligence events are stored in `data/merch-sales.json`.
- Order requests and product clicks are recorded through `/api/merch/track`.
- Owner Desk can record confirmed paid sales through `/api/merch/admin/record-sale`.
- Weekly merch reports are available at `/api/merch/admin/sales-report`, broken down by product, category, size, color, and buyer region.
- The Framework can auto-feature items when recent sales/order-request spikes cross the spike threshold.
- The public shop starts secure Stripe Checkout through `/api/merch/checkout` when Stripe is configured.
- Confirmed Stripe payments are accepted only through `/api/merch/stripe-webhook` after webhook signature verification.
- POS order records are stored in `data/merch-orders.json`.
- The site does not store card numbers. Card data should stay with the payment provider's hosted checkout.

Required POS environment variables:

```text
STRIPE_SECRET_KEY=sk_live_or_test_key
STRIPE_WEBHOOK_SECRET=whsec_from_stripe_webhook
STRIPE_CURRENCY=usd
PUBLIC_SITE_URL=https://censoredexpressions.com
```

Stripe webhook endpoint:

```text
https://censoredexpressions.com/api/merch/stripe-webhook
```

## Creator Desk

The site includes an opinion archive at `/creator-desk.html`.

- The backend triggers one daily Creator Desk blog at 9 PM Eastern.
- If the backend cannot retrieve three real reported stories, it stores the day as pending and retries until the editorial can be published.
- It first clusters the day's feed items to find the three individual news stories that were most reported across sources.
- As the site refreshes throughout the day, the AI Framework absorbs the public articles into `data/daily-article-memory.json` so 9 PM selection can use the full day's repeated coverage instead of only a single feed snapshot.
- Article Intelligence then writes `data/article-intelligence.json`, grouping repeated coverage into story clusters, comparing source angles, preserving disagreements, creating Brain briefings, and assigning Article Intelligence, Brain, Editorial Synthesis, and News Creation subsystem tasks.
- The Brain can review subsystem readiness through `/api/subsystems` and run `/api/subsystems/run` to detect missing or weak subsystem capability. If the Brain decides subsystem code must change, it creates an owner-reviewable Patch Request instead of silently editing files.
- It then reads the selected article pages when available, falling back to feed summaries when publishers block extraction.
- The blog uses those three specific stories to support one unique central editorial theme from the founder's conservative, skeptical-of-groupthink perspective.
- The public news feed remains separate from opinion commentary.
- Creator Desk archives are stored in `data/creator-posts.json`.
- Manual generation is available at `/api/creator/generate` from localhost or with `NEWSLETTER_ADMIN_TOKEN`.
- Saved editorials can be rewritten through `/api/creator/rewrite` from localhost or with `NEWSLETTER_ADMIN_TOKEN`.
- The Creator Desk page includes a local Learning Desk for memory review, feedback, and saved-day rewrites.
- Private article memory is available at `/api/article-memory` from localhost or with `NEWSLETTER_ADMIN_TOKEN`.
- Private article intelligence is available at `/api/article-intelligence` from localhost or with `NEWSLETTER_ADMIN_TOKEN`.

## Backend Health And AI Shield

The server includes private diagnostics for uptime, feed integrity, image quality, and story safety.

- `/api/health` gives a quick status score for monitors.
- `/api/integrity` reports cache freshness, story counts, image counts, and integrity findings.
- `/api/ai-shield` returns the AI Shield policy evaluation with findings and recommended actions.
- `check-health.ps1` prints a simple local health summary while the site is running.

The backend refreshes and evaluates itself on startup and then every few minutes. Google/search feeds are treated as discovery signals; publisher URLs and publisher images are preferred for public tiles.

The AI Framework also learns from these diagnostics during maintenance. Repeated coverage, image, cache, feed, and Creator Desk retry issues are stored as private optimization lessons so future work can focus on problems that actually recur. You can manually trigger this from localhost or with `NEWSLETTER_ADMIN_TOKEN`:

```bash
curl -X POST "http://localhost:3000/api/optimization/learn?refresh=1"
```

## Live AI Model

The backend can use a live OpenAI model for Creator Desk and newsletter writing.

- Set `OPENAI_API_KEY` in production to enable the live model.
- Optional: set `OPENAI_MODEL` to choose the model. If omitted, the server uses `gpt-4.1-mini`.
- `/api/ai-model` shows whether the live model is enabled without exposing the API key.
- If the model is unavailable, the site automatically falls back to the built-in writing rules.

## NewsData Source Expansion

News Lab can use NewsData as an additional source-lead provider for collectors and Story Dossiers.

- Set `NEWSDATA_API_KEY` in production to enable NewsData.
- NewsData records are treated as source leads for the Brain and Dossier pipeline, not as CE-owned article text.
- NewsData sources are included in Top, World, Politics, Business, Technology, Sports, Entertainment, and Local collector pools.

## Licensed News Lab Images

News Lab can use licensed image APIs without storing keys in source code.

- Set `CE_NEWS_LAB_LIVE_IMAGES=true` to enable live image search.
- Set `PEXELS_API_KEY` to use Pexels.
- Set `UNSPLASH_ACCESS_KEY` to use Unsplash as an additional licensed/search-provider lane. Unsplash API images must keep photographer and Unsplash attribution.
- Set `PIXABAY_API_KEY` to use Pixabay as a licensed fallback provider.
- Story objects record `imageProvenance` with source, creator, license, retrieval time, original query, source URL, and photo ID.

## Learning Framework

The backend also has a private learning memory that works without an outside AI key.

- Learning memory is stored in `data/editorial-learning.json`.
- Creator Desk story selection uses learned topic and source weights.
- Newsletter story order uses the same learned ranking.
- Creator Desk and newsletter prompts use private style notes when a live model is enabled.
- `/api/learning` shows the current private memory from localhost or with `NEWSLETTER_ADMIN_TOKEN`.
- `/api/learning/feedback` accepts private feedback and updates topic, source, stance, and style weights.
- `/api/learning/codex-change` lets Codex save lessons from code/content changes so the site can reuse those decisions later.
- `/api/learning/deployment-lesson` saves setup, deployment, verification, and rollback lessons.
- `/api/learning/framework-command` saves structured owner/Codex commands as reusable upgrade memory.
- `/api/framework-architecture` explains the Framework's scoring, prioritization, lesson weighting, diagnostic classification, self-review, and autonomous improvement architecture.
- `/api/framework-actions` shows the private autonomous action log for bounded execution such as feed refresh, public payload warmup, diagnostic-cache clearing, Creator Desk retry, and diagnostic lesson capture. Each action records the chain: issue detected, solution chosen, change made, metric result, verification, and prevention memory.
- `/api/code-patch-proposals` shows Framework-proposed code patches that need owner review.
- `/api/code-patch-proposals/decision` records owner approval or denial from the Owner Desk before a code change can be applied.
- `/api/code-patch-proposals/apply` applies an owner-approved structured patch directly through the Brain/AI Framework when the target file is allowed, the operation is structured, and a backup is created.
- `/api/learning/upgrade-plan` builds a private upgrade checklist from saved engineering, deployment, and optimization lessons.
- `/api/optimization/learn` saves site-health and performance lessons from current diagnostics.
- Feedback can name topics directly or include story objects; the backend will infer topics and sources from those stories.
- Recent Codex-taught lessons are included in Creator Desk and newsletter prompts when a live model is enabled.
- The hidden Creator Desk Learning Desk includes command, feedback, rewrite, and Upgrade Plan panels for admin-only setup/deploy guidance.

## AI Framework Architecture

The Censored Expressions AI Framework is now documented as a broader **Framework Operating System**. News Lab is one application running on that operating system, alongside Creator Desk, Newsletter, Market Pulse, Owner Desk, and future products.

The Framework OS sequence is:

```text
Input
  -> Knowledge
  -> Understanding
  -> Reasoning
  -> Coordination
  -> Execution
  -> Verification
  -> Optimization
  -> Learning
  -> Governance
```

See `AI_FRAMEWORK_OPERATING_SYSTEM.md` for the full model. Its primary objective is to produce the highest-quality public output with the fewest possible computational steps. For News Lab, that means verified visible articles. For Creator Desk, it means original editorials. For Newsletter, it means coherent weekly issues.

See `AI_FRAMEWORK_PHASE_1_ARCHITECTURE_AUDIT.md` for the architecture-only Phase 1 audit. Its main conclusion is that the Framework vision is coherent, but Version 3 should consolidate runtime behavior around one Framework Coordinator, one unified workflow, one canonical dossier, and Production Intelligence above applications.

See `AI_FRAMEWORK_PHASE_2_PRODUCTION_PIPELINE_AUDIT.md` for the production pipeline audit. It walks the path from RSS to Website, identifies what enters and leaves every stage, separates necessary retries from wasteful retries, and calls out the need to distinguish current-cycle stories from preserved public shelf stories.

See `AI_FRAMEWORK_PHASE_3_STORY_DOSSIER_ENGINE.md` for the Story Dossier Engine contract. It defines how the Framework turns fragmented source reporting into a canonical event dossier with evidence traceability, readiness gates, recovery, version history, image intelligence, writer handoff, editorial integration, and long-term story memory.

See `AI_FRAMEWORK_PHASE_4_WRITER_REASONING_ENGINE.md` for the Writer Reasoning Engine contract. It defines how the Framework thinks before writing by turning a locked dossier into a reasoning graph, evidence map, uncertainty model, narrative blueprint, paragraph plan, headline reasoning, and verified outline before prose generation begins.

See `AI_FRAMEWORK_PHASE_5_EDITORIAL_INTELLIGENCE_ENGINE.md` for the Editorial Intelligence Engine contract. It defines how the Framework turns review into a continuously learning quality system with approval prediction, rejection intelligence, targeted repair, editorial memory, pattern discovery, confidence scoring, and future failure prevention.

See `AI_FRAMEWORK_PHASE_6_PRODUCTION_INTELLIGENCE_EFFICIENCY_AUDIT.md` for the Production Intelligence and Operational Efficiency audit. It defines how the Framework measures useful public output per unit of work, including collection efficiency, dossier efficiency, writer efficiency, editorial efficiency, runtime efficiency, knowledge efficiency, reasoning efficiency, and public inventory protection.

See `AI_FRAMEWORK_PHASE_7_LEARNING_ARCHITECTURE.md` for the governed Learning Architecture. It defines how the Framework turns experience into verified reusable knowledge through Search Learning, Article Memory, Operational Memory, Adaptive Learning, Diagnostic Learning, Pattern Learning, Capability Promotion, and knowledge distillation.

See `AI_FRAMEWORK_PHASE_8_FRAMEWORK_GOVERNANCE_MANUAL.md` for the Framework Governance Manual. It defines the rulebook for authority, trust levels, permissions, owner approval, bounded execution, rollback, verification, audit logging, risk assessment, change management, learning governance, incident response, and governance metrics.

See `AI_FRAMEWORK_DOSSIER_EFFICIENCY_REPORT.md` for the Project 2 Dossier Efficiency Report. It answers when a dossier is complete, why collected stories fail to become viable dossiers, whether the Writer can still be invoked too early, whether dossiers are rebuilt repeatedly, and what work orders make the Story Dossier the authoritative gate before writing.

See `AI_FRAMEWORK_PHASE_9_IMAGE_INTELLIGENCE_ENGINE.md` for the Image Intelligence Engine. It defines how the Framework discovers, verifies, licenses, ranks, selects, documents, and learns from images across News Lab, Creator Desk, newsletters, social media, and future multimedia products.

See `AI_FRAMEWORK_PHASE_10_PERFORMANCE_ENGINEERING.md` for the Performance Engineering guide. It defines how the Framework is engineered for speed, scalability, efficiency, reliability, lower CPU and memory per public output, better worker behavior, faster APIs, and safer synchronization.

See `AI_FRAMEWORK_PHASE_11_COMMERCIALIZATION.md` for the Commercialization plan. It defines how the Framework can become a secure, scalable commercial platform through deployment models, multi-tenancy, licensing, SaaS operations, onboarding, security, integrations, customer success, and marketplace strategy.

See `AI_FRAMEWORK_PHASE_12_PATENT_IP_PORTFOLIO.md` for the Patent and Intellectual Property Portfolio. It defines how the Framework continuously documents invention candidates, technical effects, implementation evidence, trade secrets, claim strategy, prior-art research, filing packages, and commercialization opportunities.

See `AI_FRAMEWORK_PHASE_13_FRAMEWORK_OS_INTEGRATION.md` for the Framework OS Integration plan. It defines how Projects 1-12 become one operating framework through shared engines, standard project lifecycles, explicit integration contracts, framework-wide metrics, release gates, application adapters, and the integration-first rule.

See `AI_FRAMEWORK_OPERATIONAL_EFFICIENCY_AUDIT.md` for the code-driven Operational Efficiency Audit. It examines whether subsystems are doing unnecessary work, doing work too early, doing work twice, or duplicating work another subsystem could perform once for the full Framework.

The private Framework is organized into a defined decision system:

1. Observation Intake: collects feed data, visitor search interest, owner feedback, diagnostics, code-change lessons, deployment lessons, and self-review results.
2. Diagnostic Classification: maps findings to facets such as search, Creator Desk, newsletter, connectivity, revenue growth, feed integrity, and site optimization.
3. Confidence Scoring: scores lessons and findings from evidence, verification, rules, rationale, recurrence, source type, and self-review quality.
4. Memory Prioritization: ranks lessons by confidence, severity, recency, recurrence, and breadth of affected site functions.
5. Lesson Weighting: converts trusted lessons into reusable influence without allowing any one signal to dominate editorial or optimization judgment.
6. Adaptive Weight Controller: changes confidence, priority, lesson, search, and self-review weights in small bounded steps when owner feedback, Codex changes, diagnostics, visitor searches, or self-review show that the Framework should value signals differently.
7. Meta-Learning Controller: studies the adaptive controller itself. If a weight is repeatedly saturated, it redirects the signal into related uncapped weights, decays stale priorities, records saturation hotspots, and only adjusts a bound inside a hard safety limit after repeated verified proof.
8. Meta Improvement Controller: evaluates and improves the site, learning process, outcomes, Framework self-health, and the improvement process itself.
9. Meta Execution Controller: executes known safe Meta Improvement actions, verifies the result, blocks unsafe or unknown work, and improves the execution loop itself.
10. Patch Proposal Controller: identifies code-level root causes, proposes controlled patches, lists affected files, saves layman's-term descriptions, verification/rollback plans, and waits for Owner Desk approval or denial before the Framework, Codex, or GitHub applies changes.
11. Self-Review Scoring: checks whether each lesson has a clear trigger, behavior rule, rationale, expected outcome, evidence, verification, and next action.
12. Autonomous Improvement Engine: builds a bounded next-action queue, verifies changes, and saves new lessons after improvements.

The architecture is private and available through the Owner Desk or:

```text
http://localhost:3000/api/framework-architecture
```

Core guardrails:

- Framework controls and memory stay admin-only.
- Visitor search interest remains a weak input, not a command.
- Adaptive weights can change over time, but each change must stay inside bounded rules and save a reason in memory.
- Meta-learning can adjust the adjustment strategy, but only through logged redirects, decay, saturation proof, and hard-limited bound changes.
- Meta improvement can adjust the improvement loop itself, but each cycle must score site functionality, learning process, outcome quality, self-evaluation, and improvement process before choosing a next action.
- Meta execution can act on improvement recommendations only when a registered safe executor exists; it must verify results, log blocked actions, and save proof before the action is considered learned.
- Code-level fixes must go through patch proposal mode: root cause, affected files, plain-English explanation, proposed change, verification plan, rollback plan, and owner approval before anything applies.
- The Patch Structuring subsystem converts Brain diagnoses and fix ideas into structured `filePatches` before approval. It now accepts direct `filePatches`, JSON/fenced JSON patch instructions, exact target-file create/write instructions, and simple `FILE/FIND/REPLACE` teaching blocks. If an owner approves an unstructured proposal, Patch Structuring runs immediately; if it succeeds, the Brain applies the patch in the same approval flow. If it cannot safely structure the fix, it marks the proposal as needing teaching instead of repeating an unapplyable proposal.
- Broad subsystem revision proposals now produce a controlled Patch Structuring teaching scaffold under `data/patch-structuring-teachings/` after owner approval. This gives Codex and the Brain a concrete file to complete with exact target file, action, find text, replacement/content, and verification instead of repeating vague `needsTeaching` requests.
- Owner Desk includes a Brain Coding Direction path for layman's-term code directions. The Brain records the direction as a Framework command, infers affected files, attempts to parse executable patch operations, creates an owner-reviewable Patch Request, then learns from approval, apply, verification, or Codex teaching fallback.
- The Owner Desk includes a Patch Requests panel where the owner can approve or deny proposed patches. Approval does not allow unbounded editing; it authorizes the Brain/AI Framework to apply that specific structured patch directly. Codex/GitHub is used only as a teaching fallback when the Brain does not yet know how to convert the approved fix into structured patch operations.
- The Patch Requests panel shows only current pending approvals by default. Approved, denied, Framework-applied, and manually completed requests move into date-grouped dropdowns so the Learners Desk stays clean while preserving a daily change history.
- Framework-applied patches support structured create, write, exact replacement, exact deletion, and approved file deletion operations. They reject unsafe paths, reject private data files, create backups in `data/patch-backups`, run verification, and log the result.
- If `RENDER_DEPLOY_HOOK_URL` or `DEPLOY_HOOK_URL` is configured, the Brain can trigger deployment after an owner-approved patch verifies successfully. If no hook is configured, it records deployment as blocked by missing host credentials instead of pretending the live host changed.
- Owner approval decisions are copied into `data/patch-decisions/approved`; denied requests are copied into `data/patch-decisions/denied`. These folders give a plain audit trail of what was approved and what was rejected.
- Revenue growth must use real audience value, not artificial traffic or ad-click encouragement.
- Autonomous improvements must be bounded, verifiable, reversible, and saved as auditable lessons.

Example local feedback:

```bash
curl -X POST http://localhost:3000/api/learning/feedback \
  -H "Content-Type: application/json" \
  -d "{\"rating\":\"up\",\"topics\":[\"freeSpeech\",\"family\"],\"sources\":[\"AP\"],\"stances\":[\"responsibility\"],\"note\":\"Keep the article focused on one clear point with specific story details.\"}"
```

After feedback, regenerate Creator Desk or the newsletter from localhost so the new memory influences the next draft.

Example Codex change lesson:

```bash
curl -X POST http://localhost:3000/api/learning/codex-change \
  -H "Content-Type: application/json" \
  -d "{\"summary\":\"Creator Desk storm editorials were made less generic.\",\"problem\":\"The framework repeated the storm headline and then used unrelated groupthink commentary.\",\"behaviorRule\":\"For storms, outages, disasters, and local emergencies, analyze cleanup, utilities, responsible parties, communication, vulnerable residents, and what should improve next time.\",\"filesChanged\":[\"server.js\",\"data/editorial-learning.json\"],\"appliesTo\":[\"Creator Desk\",\"local emergencies\",\"editorial writing\"],\"tags\":[\"editorial-specificity\",\"local-emergency-response\"]}"
```

Example story-based feedback:

```bash
curl -X POST http://localhost:3000/api/learning/feedback \
  -H "Content-Type: application/json" \
  -d "{\"rating\":\"down\",\"story\":{\"title\":\"Example local filler story\",\"source\":\"Example Source\",\"category\":\"local\",\"summary\":\"Low-value filler.\"},\"note\":\"Avoid filler stories when stronger national stories are available.\"}"
```

## Expandable Data Storage

The backend data folder can be moved to expandable storage with `CE_DATA_DIR`.

- Default storage remains `data/` inside this site folder.
- Set `CE_DATA_DIR` to an external or expandable storage path for subscribers, newsletter archives, Creator Desk archives, and learning memory.
- Use `Move-DataStorage.ps1` to copy the current data files without deleting the originals.

Example:

```powershell
.\Move-DataStorage.ps1 -TargetDataDir "E:\CensoredExpressions\data"
$env:CE_DATA_DIR = "E:\CensoredExpressions\data"
npm start
```

For hosted production, set `CE_DATA_DIR` in the host's environment variables and mount that path as persistent storage.

## Keeping The Backend Running

Use `KEEP-RUNNING.bat` when the site should remain alive through scheduled work such as the 9 PM Creator Desk run, retries, and future social autoposting.

- `START-HERE.bat` starts the site once for normal previewing.
- `KEEP-RUNNING.bat` runs a watchdog loop and restarts `server.js` if it exits.
- Watchdog logs are written to `server-watchdog.log`.
- Leave the watchdog window open, or run it from a machine/session that stays awake.

## Hosting Requirement

Use hosting that supports Node.js apps, such as Render, Railway, Fly.io, DigitalOcean App Platform, or a VPS.

Traditional static hosting can still display the page, but the stronger server-side RSS collector requires Node.js.
