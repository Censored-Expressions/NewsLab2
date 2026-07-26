# Patch Structuring Teaching: News Tab Recovery And Feed Reliability Scoring

Proposal IDs:
- patch_proposal_1782400790304_8t4d85
- patch_proposal_1782409030623_31rgbl

## What Codex Taught The Brain
Broad subsystem revision requests must become executable file operations, not repeated owner approvals. For this pattern:

1. News tab workers with zero stories should not be marked retired when the tab is expected to exist. They should be kept deployed in a coverage-recovery state with coverageFloor and coverageGap evidence.
2. Feed Reliability should measure source-error ratio, live status, quarantine, cache hits, source limit, and concurrency. Raw source error count alone is not enough to decide readiness.
3. Feed diagnostics must use bounded batches so the diagnostic endpoint does not create the same upstream pressure it is measuring.

## Exact File Operations Applied

Target file: server.js

Changes:
- `newsLabTabMetrics` now records `coverageFloor` and `coverageGap`.
- `newsLabSubsystemTask` uses `coverageFloor` instead of a hard-coded threshold.
- `runNewsLabBrainSubsystemLifecycle` keeps zero-story tab subsystems in `coverage-recovery-deployed` instead of `retired`.
- Feed Reliability subsystem evidence now includes `errorRate`, `transientFeedSourceErrors`, `quarantinedSources`, `sourceCacheHits`, `sourceLimit`, and `concurrency`.
- Feed Reliability readiness now rewards contained/live/cached operation and penalizes error rate rather than only raw error count.
- `feedDiagnostics` now runs sources in bounded batches using `feedFetchConcurrency`.

## Reusable Brain Rule
When a subsystem is stagnant but the public feature is still live, do not keep proposing the same broad patch. Find the exact metric that is misleading, add evidence fields that prove containment or failure, then update the subsystem action path so it can keep working and verify the result.

## Verification Pattern
- Run `node --check server.js`.
- Call `/api/news-lab?category=top` and confirm `tabSubsystems.top.storyCount`, `coverageFloor`, `coverageGap`, and lifecycle state are present.
- Call `/api/feed-status` and confirm reliability reports timeout, concurrency, sourceLimit, failedSourceCount, quarantinedSourceCount, and cacheHitSourceCount.
- Run `/api/subsystems/run` and confirm Feed Reliability and News Tab: Top Headlines record updated evidence instead of repeating the same vague proposal.
