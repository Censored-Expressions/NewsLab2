# News Lab Runtime Contract Teaching

Updated: 2026-08-11

## Problem

News Lab can have a healthy-looking codebase and still publish zero articles if a worker references a helper function that was renamed, omitted, or moved during a merge. The failure pattern is a hard runtime exception such as `ReferenceError: defaultDailyArticleMemory is not defined`, `ReferenceError: newsLabTodayDateKey is not defined`, or `ReferenceError: newsLabDossierToWriterHandoff is not defined`.

## Rule

Runtime contract recovery comes before quality tuning. If article generation is not running, the Brain must first confirm that all required shared contracts exist in the exact build being deployed.

## Required Contracts

- `defaultDailyArticleMemory`
- `readDailyArticleMemory`
- `newsLabDossierReadinessContract`
- `newsLabDossierReadinessClassFromEvidence`
- `newsLabTodayDateKey`
- `newsLabStoryOriginalPublishedAt`
- `newsLabApplyCurrentBoardPolicy`
- `newsLabHardMergePublicStories`
- `newsLabDossierToWriterHandoff`
- `newsLabEnsureWriterDossierHandoff`
- `newsLabBuildWriterReasoningPlan`
- `newsLabCanonicalHeadlineService`

## Recovery Pattern

1. Restore missing shared helper contracts with safe defaults that do not invent facts.
2. Make startup dependency validation fatal for web and worker boot when required contracts are missing.
3. Add a runtime smoke test path with `CE_RUNTIME_SMOKE_TEST=1` and `CE_RUNTIME_SMOKE_ROLE=<role>`.
4. Run syntax check and smoke checks before packaging or deploying.
5. Log the build commit, server build, workflow version, missing contracts, optional warnings, and heartbeat.

## Brain Lesson

The Framework must not keep proposing writing, headline, image, or tab-coverage changes while the runtime contract layer is broken. A missing helper is a publication-blocking integration regression. Fix the contract, prove boot health, then return to article quality.
