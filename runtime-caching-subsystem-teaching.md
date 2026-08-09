# Runtime Caching Subsystem Teaching

Updated: 2026-08-08

## Rule
If the underlying evidence, publication shelf, or revision has not changed, do not compute the same answer again.

## Public News Lab Cache
`/api/news-lab` should serve a process-memory public snapshot first. If the snapshot is fresh, return it immediately. If it is stale but still valid, return it immediately and queue one background refresh. If the refresh fails, continue serving the last valid snapshot.

## Single-Flight Behavior
Only one public News Lab cache refresh may be queued at a time. Concurrent visitors should receive the last valid snapshot instead of triggering duplicate rebuilds.

## Cache Headers
Public News Lab responses use short public cache headers with stale-while-revalidate and stale-if-error. Owner Desk and protected endpoints remain no-store.

## Static Assets
Generated News Lab images receive long immutable cache headers because the asset filename contains a generated slug/hash. General CSS, JS, and images receive public edge/browser cache headers.

## Metrics
Track cache hits, stale hits, misses, rebuilds queued, single-flight skips, JSON reads avoided, disk reads avoided, and bytes served from cache.
