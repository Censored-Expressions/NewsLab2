# News Lab Framework Contract Dependency Teaching

Created: 2026-08-11

## Problem

Recent integration regressions showed that worker execution can fail when a helper function is renamed, moved, or omitted during a merge.

Examples:

- `newsLabDossierReadinessClassFromEvidence`
- `newsLabTodayDateKey`

## Brain Rule

Subsystems should call stable service contracts, not fragile internal helper names.

Preferred pattern:

```text
Writer
-> Readiness Service Contract
-> { readinessClass, confidence, evidenceScore, recommendedAction }
```

Avoid:

```text
Writer
-> helper
-> helper
-> helper
```

## Runtime Rule

Missing helper contracts must degrade gracefully whenever a safe default exists.

- Dossier readiness fallback: `HOLD_FOR_EVIDENCE`
- Date key fallback: current ISO date
- Worker behavior: continue publication-safe work, log the missing dependency, and report at startup

## Startup Validation

At boot, the Framework should validate required contracts and report all missing dependencies at once:

- Dossier Readiness
- Dossier Readiness Classifier
- Board Date Key
- Current Board Policy
- Writer Handoff
- Writer Reasoning Plan
- Canonical Headline Service

This catches integration regressions immediately after deployment instead of discovering them one-by-one during live worker execution.
