# Feed Reliability Teaching: Source Attribution Observability

## Problem
Feed Reliability was reporting aggregate counts such as source errors and slow-source events, but the Brain could not see which exact feed URLs, domains, or providers were responsible for most of the failures.

## Exact Pattern Taught
When feed reliability degrades, the Brain must collect source-level attribution before proposing broad changes.

Required attribution fields:
- source name
- provider
- domain
- feed URL
- category
- failure count
- slow count
- transient network count
- cache hit count
- skipped count
- quarantine state
- last duration
- last error type, code, and message

## Code-Level Rule
Feed telemetry must roll up into ranked lists:
- worst sources
- worst domains
- worst providers
- slow sources

These rankings must be exposed through `/api/feed-status`, public health diagnostics, and Feed Reliability subsystem evidence.

## Why It Matters
The Brain should not treat feed health as one aggregate problem. It should identify the responsible URL, domain, or provider, then decide whether to quarantine, lower timeout exposure, use cache, reduce priority, or request a code patch.

## Verification
- `server.js` passes `node --check`.
- `/api/feed-status` should return `reliability.attribution`.
- `/api/subsystems/run` should show Feed Reliability evidence for `topFailingSource`, `topFailingDomain`, and `topFailingProvider`.

