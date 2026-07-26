# Feed Reliability Adaptive Optimizer Teaching

Date: 2026-06-26
Target: AI Framework / Brain, Feed Reliability subsystem

## Problem
Feed Reliability had enough telemetry to identify dominant failing providers and domains, but the system still treated feed health too much like one aggregate problem.

## New Rule
When feed reliability drops, the Brain should use source-level attribution before making a runtime decision. The first question is not "is the feed unhealthy?" The first question is "which provider, domain, or URL is causing the damage?"

## Allowed Bounded Runtime Actions
- Temporarily quarantine one failing source.
- Reduce concurrency for one failing provider.
- Increase timeout for one slow-but-useful provider.
- Serve cached stories while a source is quarantined.
- Keep global feed behavior unchanged unless many sources fail together.

## Governance Boundary
These runtime actions are allowed because they are temporary, reversible, bounded, and logged. Permanent code/config changes still require the Approval Gate.

## Required Proof
Every action must log:
- provider
- domain
- trigger metrics
- previous setting
- new setting
- confidence/threshold reason
- expected benefit
- rollback condition
- measured result after the next refresh

## Success Standard
The Brain closes the loop when it can show:
Issue detected -> provider/domain attributed -> bounded action applied -> next refresh measured -> improvement kept or rolled back.
